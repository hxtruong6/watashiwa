import { UnifiedCache } from '@/lib/cache';
import { prisma } from '@/lib/db';
import { EtymologyData } from '@/lib/schemas/jsonb';
import { SmartCard } from '@/modules/flashcard/types';
import { createHash } from 'crypto';

import {
	RelationshipMap,
	SemanticSequencingMetrics,
	SemanticSequencingOptions,
	WordRelationship,
} from '../types';

/**
 * Semantic Sequencer Service
 * Reorders FSRS queue based on semantic relationships (etymology, confusion pairs, deck context)
 * with performance monitoring and graceful fallback to FSRS queue.
 */

// Cache instances - UnifiedCache uses Redis if available, falls back to MemoryCache
const relationshipCache = new UnifiedCache<RelationshipMap>(3600000); // 1 hour TTL
const queueCache = new UnifiedCache<SmartCard[]>(300000); // 5 minutes TTL

/**
 * Generate cache key with hashed vocabIds for better performance
 * Uses SHA256 hash to create shorter, consistent keys
 */
function generateCacheKey(prefix: string, userId: string, vocabIds: string[]): string {
	const sortedIds = vocabIds.sort().join(',');
	// Hash for shorter keys and better distribution
	const hash = createHash('sha256').update(sortedIds).digest('hex').substring(0, 16);
	return `${prefix}:${userId}:${hash}`;
}

/**
 * Get semantically sequenced queue from FSRS queue
 * Returns original queue on error or timeout (graceful fallback)
 */
export async function getSemanticallySequencedQueue(
	fsrsQueue: SmartCard[],
	options: SemanticSequencingOptions,
): Promise<{
	queue: SmartCard[];
	metrics: SemanticSequencingMetrics;
	fallbackReason?: string;
}> {
	const startTime = Date.now();
	const metrics: SemanticSequencingMetrics = {
		startTime,
		endTime: 0,
		elapsedMs: 0,
		relationshipQueryTime: 0,
		reorderingTime: 0,
		cacheHit: false,
		queueSize: fsrsQueue.length,
		relationshipsFound: 0,
	};

	const timeoutMs = options.timeoutMs ?? 2000;
	const performanceThresholdMs = options.performanceThresholdMs ?? 500;

	// Early exit: Skip semantic sequencing for very small queues
	if (fsrsQueue.length < 2) {
		metrics.endTime = Date.now();
		metrics.elapsedMs = metrics.endTime - metrics.startTime;
		return {
			queue: fsrsQueue,
			metrics,
			fallbackReason: 'queue_too_small',
		};
	}

	try {
		// Check cache first
		if (options.enableCaching !== false) {
			const vocabIds = fsrsQueue.map((c) => c.vocabId);
			const cacheKey = generateCacheKey('semantic-queue', options.userId, vocabIds);
			const cached = await queueCache.get(cacheKey);
			if (cached) {
				metrics.cacheHit = true;
				metrics.cacheType = queueCache.getCacheType();
				metrics.endTime = Date.now();
				metrics.elapsedMs = metrics.endTime - metrics.startTime;
				return {
					queue: cached,
					metrics,
				};
			}
		}

		// Get relationships with timeout protection
		const relationshipStartTime = Date.now();
		const relationships = await Promise.race([
			getWordRelationships(fsrsQueue, options),
			new Promise<RelationshipMap>((_, reject) =>
				setTimeout(() => reject(new Error('Relationship query timeout')), timeoutMs),
			),
		]);

		metrics.relationshipQueryTime = Date.now() - relationshipStartTime;
		metrics.relationshipsFound = Array.from(relationships.values()).reduce(
			(sum, rels) => sum + rels.length,
			0,
		);

		// Check performance threshold
		if (metrics.relationshipQueryTime > performanceThresholdMs) {
			console.warn(
				`[SemanticSequencer] Relationship query too slow (${metrics.relationshipQueryTime}ms), using FSRS queue`,
			);
			metrics.endTime = Date.now();
			metrics.elapsedMs = metrics.endTime - metrics.startTime;
			return {
				queue: fsrsQueue,
				metrics,
				fallbackReason: 'performance_threshold_exceeded',
			};
		}

		// Reorder queue
		const reorderStartTime = Date.now();
		const sequenced = reorderByRelationships(fsrsQueue, relationships);
		metrics.reorderingTime = Date.now() - reorderStartTime;

		// Final performance check
		metrics.endTime = Date.now();
		metrics.elapsedMs = metrics.endTime - metrics.startTime;

		if (metrics.elapsedMs > performanceThresholdMs) {
			console.warn(
				`[SemanticSequencer] Total sequencing too slow (${metrics.elapsedMs}ms), using FSRS queue`,
			);
			return {
				queue: fsrsQueue,
				metrics,
				fallbackReason: 'total_time_exceeded',
			};
		}

		// Cache result
		if (options.enableCaching !== false) {
			const vocabIds = fsrsQueue.map((c) => c.vocabId);
			const cacheKey = generateCacheKey('semantic-queue', options.userId, vocabIds);
			await queueCache.set(cacheKey, sequenced, 300000); // 5 minutes
		}

		return {
			queue: sequenced,
			metrics,
		};
	} catch (error) {
		console.error('[SemanticSequencer] Error during sequencing:', error);
		metrics.endTime = Date.now();
		metrics.elapsedMs = metrics.endTime - metrics.startTime;
		return {
			queue: fsrsQueue, // Fallback to FSRS
			metrics,
			fallbackReason: error instanceof Error ? error.message : 'unknown_error',
		};
	}
}

/**
 * Get word relationships for a queue of cards
 * Queries etymology, confusion pairs, and deck context
 */
async function getWordRelationships(
	queue: SmartCard[],
	options: SemanticSequencingOptions,
): Promise<RelationshipMap> {
	const vocabIds = queue.map((card) => card.vocabId);
	const relationshipMap: RelationshipMap = new Map();

	// Initialize map
	for (const vocabId of vocabIds) {
		relationshipMap.set(vocabId, []);
	}

	// Check cache first
	if (options.enableCaching !== false) {
		const cacheKey = generateCacheKey('semantic-relationships', options.userId, vocabIds);
		const cached = await relationshipCache.get(cacheKey);
		if (cached) {
			return cached;
		}
	}

	// Query relationships in parallel
	const [etymologyRels, confusionRels, deckRels] = await Promise.all([
		getEtymologyRelationships(vocabIds),
		getConfusionPairRelationships(vocabIds),
		getDeckContextRelationships(queue),
	]);

	// Merge relationships
	for (const rel of [...etymologyRels, ...confusionRels, ...deckRels]) {
		const existing = relationshipMap.get(rel.vocabId1) || [];
		existing.push(rel);
		relationshipMap.set(rel.vocabId1, existing);

		// Also add reverse relationship
		const reverseRel: WordRelationship = {
			...rel,
			vocabId1: rel.vocabId2,
			vocabId2: rel.vocabId1,
		};
		const existingReverse = relationshipMap.get(reverseRel.vocabId1) || [];
		existingReverse.push(reverseRel);
		relationshipMap.set(reverseRel.vocabId1, existingReverse);
	}

	// Cache result
	if (options.enableCaching !== false) {
		const cacheKey = generateCacheKey('semantic-relationships', options.userId, vocabIds);
		await relationshipCache.set(cacheKey, relationshipMap, 3600000); // 1 hour
	}

	return relationshipMap;
}

/**
 * Get etymology-based relationships (shared kanji roots)
 */
async function getEtymologyRelationships(vocabIds: string[]): Promise<WordRelationship[]> {
	if (vocabIds.length < 2) return [];

	const vocabs = await prisma.vocabulary.findMany({
		where: {
			id: { in: vocabIds },
			etymology: { not: { equals: null } },
		},
		select: {
			id: true,
			etymology: true,
		},
	});

	const relationships: WordRelationship[] = [];
	const etymologyMap = new Map<string, string[]>(); // kanji -> vocabIds

	// Build etymology index
	for (const vocab of vocabs) {
		const etymology = vocab.etymology as EtymologyData | null;
		if (!etymology?.parts) continue;

		const kanjiSet = new Set<string>();
		for (const part of etymology.parts) {
			if (part.kanji) {
				kanjiSet.add(part.kanji);
			}
		}

		for (const kanji of kanjiSet) {
			if (!etymologyMap.has(kanji)) {
				etymologyMap.set(kanji, []);
			}
			etymologyMap.get(kanji)!.push(vocab.id);
		}
	}

	// Find relationships based on shared kanji
	// Note: kanji key is used for grouping but not needed in loop body
	for (const [, relatedVocabIds] of etymologyMap.entries()) {
		if (relatedVocabIds.length < 2) continue;

		// Create relationships between all pairs
		for (let i = 0; i < relatedVocabIds.length; i++) {
			for (let j = i + 1; j < relatedVocabIds.length; j++) {
				const vocabId1 = relatedVocabIds[i];
				const vocabId2 = relatedVocabIds[j];

				// Calculate strength based on shared kanji count
				const vocab1 = vocabs.find((v) => v.id === vocabId1);
				const vocab2 = vocabs.find((v) => v.id === vocabId2);
				if (!vocab1 || !vocab2) continue;

				const etymology1 = vocab1.etymology as EtymologyData | null;
				const etymology2 = vocab2.etymology as EtymologyData | null;
				if (!etymology1?.parts || !etymology2?.parts) continue;

				const kanji1 = new Set(etymology1.parts.map((p) => p.kanji).filter(Boolean));
				const kanji2 = new Set(etymology2.parts.map((p) => p.kanji).filter(Boolean));
				const sharedKanji = Array.from(kanji1).filter((k) => kanji2.has(k));

				if (sharedKanji.length > 0) {
					// Strength: ratio of shared kanji to total unique kanji
					const totalKanji = new Set([...kanji1, ...kanji2]).size;
					const strength = sharedKanji.length / totalKanji;

					relationships.push({
						vocabId1,
						vocabId2,
						type: 'ETYMOLOGY',
						strength: Math.min(strength, 1.0),
						metadata: {
							sharedKanji,
						},
					});
				}
			}
		}
	}

	return relationships;
}

/**
 * Get confusion pair relationships
 * Uses UNION pattern (two parallel queries) for better index usage than OR clause
 */
async function getConfusionPairRelationships(vocabIds: string[]): Promise<WordRelationship[]> {
	if (vocabIds.length < 2) return [];

	// Use UNION pattern: two parallel queries instead of OR clause
	// This allows PostgreSQL to use indexes on both vocabId1 and vocabId2 efficiently
	const [pairs1, pairs2] = await Promise.all([
		prisma.confusionPair.findMany({
			where: { vocabId1: { in: vocabIds } },
			select: {
				vocabId1: true,
				vocabId2: true,
				type: true,
			},
		}),
		prisma.confusionPair.findMany({
			where: { vocabId2: { in: vocabIds } },
			select: {
				vocabId1: true,
				vocabId2: true,
				type: true,
			},
		}),
	]);

	// Deduplicate pairs (a pair might appear in both results if both vocabIds are in the query)
	// Use Map with composite key to ensure uniqueness
	const pairMap = new Map<string, (typeof pairs1)[0]>();
	for (const pair of [...pairs1, ...pairs2]) {
		// Create normalized key (always use smaller ID first for consistency)
		const key =
			pair.vocabId1 < pair.vocabId2
				? `${pair.vocabId1}:${pair.vocabId2}`
				: `${pair.vocabId2}:${pair.vocabId1}`;
		if (!pairMap.has(key)) {
			pairMap.set(key, pair);
		}
	}

	// Convert to WordRelationship format
	return Array.from(pairMap.values()).map((pair) => ({
		vocabId1: pair.vocabId1,
		vocabId2: pair.vocabId2,
		type: 'CONFUSION' as const,
		strength: 0.9, // High strength for confusion pairs
		metadata: {
			confusionType: pair.type,
		},
	}));
}

/**
 * Get deck context relationships (words from same deck)
 */
async function getDeckContextRelationships(queue: SmartCard[]): Promise<WordRelationship[]> {
	if (queue.length < 2) return [];

	const vocabIds = queue.map((card) => card.vocabId);

	// Query deckIds for all vocabularies
	const vocabs = await prisma.vocabulary.findMany({
		where: {
			id: { in: vocabIds },
		},
		select: {
			id: true,
			deckId: true,
		},
	});

	// Build deck groups
	const deckGroups = new Map<string, string[]>(); // deckId -> vocabIds
	for (const vocab of vocabs) {
		if (!deckGroups.has(vocab.deckId)) {
			deckGroups.set(vocab.deckId, []);
		}
		deckGroups.get(vocab.deckId)!.push(vocab.id);
	}

	// Create relationships within deck groups (weaker than etymology/confusion)
	const relationships: WordRelationship[] = [];
	for (const [deckId, vocabIdsInDeck] of deckGroups.entries()) {
		if (vocabIdsInDeck.length < 2) continue;

		// Create relationships between all pairs in the same deck
		for (let i = 0; i < vocabIdsInDeck.length; i++) {
			for (let j = i + 1; j < vocabIdsInDeck.length; j++) {
				relationships.push({
					vocabId1: vocabIdsInDeck[i],
					vocabId2: vocabIdsInDeck[j],
					type: 'DECK_CONTEXT',
					strength: 0.3, // Lower strength for contextual grouping
					metadata: {
						deckId,
					},
				});
			}
		}
	}

	return relationships;
}

/**
 * Reorder queue based on relationships while maintaining FSRS priority
 * Strategy:
 * 1. Maintain FSRS priority: Due Reviews (srsStage > 0) > New Cards (srsStage === 0)
 * 2. Within each priority group, cluster related words
 * 3. Preserve original order for words without relationships
 */
function reorderByRelationships(queue: SmartCard[], relationships: RelationshipMap): SmartCard[] {
	// Separate into priority groups
	const dueReviews: SmartCard[] = [];
	const newCards: SmartCard[] = [];

	for (const card of queue) {
		if (card.srsStage > 0) {
			dueReviews.push(card);
		} else {
			newCards.push(card);
		}
	}

	// Reorder each group
	const reorderedDue = clusterByRelationships(dueReviews, relationships);
	const reorderedNew = clusterByRelationships(newCards, relationships);

	// Combine: Due Reviews first, then New Cards
	return [...reorderedDue, ...reorderedNew];
}

/**
 * Cluster cards by relationships within a priority group
 */
function clusterByRelationships(cards: SmartCard[], relationships: RelationshipMap): SmartCard[] {
	if (cards.length === 0) return cards;

	const visited = new Set<string>();
	const result: SmartCard[] = [];
	const cardMap = new Map(cards.map((c) => [c.vocabId, c]));

	// Build relationship graph
	const graph = new Map<string, string[]>();
	for (const card of cards) {
		const rels = relationships.get(card.vocabId) || [];
		const neighbors = rels.map((rel) => rel.vocabId2).filter((id) => cardMap.has(id)); // Only include cards in this group
		graph.set(card.vocabId, neighbors);
	}

	// Find clusters using DFS
	const clusters: SmartCard[][] = [];

	for (const card of cards) {
		if (visited.has(card.vocabId)) continue;

		const cluster: SmartCard[] = [];
		const stack = [card.vocabId];

		while (stack.length > 0) {
			const vocabId = stack.pop()!;
			if (visited.has(vocabId)) continue;

			visited.add(vocabId);
			const card = cardMap.get(vocabId);
			if (card) {
				cluster.push(card);
			}

			// Add neighbors
			const neighbors = graph.get(vocabId) || [];
			for (const neighborId of neighbors) {
				if (!visited.has(neighborId)) {
					stack.push(neighborId);
				}
			}
		}

		if (cluster.length > 0) {
			clusters.push(cluster);
		}
	}

	// Sort clusters by relationship strength and flatten
	for (const cluster of clusters) {
		if (cluster.length === 1) {
			result.push(cluster[0]);
			continue;
		}

		// Sort within cluster by relationship strength
		cluster.sort((a, b) => {
			const relsA = relationships.get(a.vocabId) || [];
			const relsB = relationships.get(b.vocabId) || [];

			// Find relationship between a and b
			const relAB = relsA.find((r) => r.vocabId2 === b.vocabId);
			if (relAB) {
				return -relAB.strength; // Higher strength first
			}

			// Compare by average relationship strength
			const avgStrengthA =
				relsA.length > 0 ? relsA.reduce((sum, r) => sum + r.strength, 0) / relsA.length : 0;
			const avgStrengthB =
				relsB.length > 0 ? relsB.reduce((sum, r) => sum + r.strength, 0) / relsB.length : 0;

			return avgStrengthB - avgStrengthA;
		});

		result.push(...cluster);
	}

	return result;
}

/**
 * Invalidate cache for a user (call when new word learned or review completed)
 */
export async function invalidateSemanticCache(userId: string): Promise<void> {
	await relationshipCache.deletePattern(`semantic-relationships:${userId}:`);
	await queueCache.deletePattern(`semantic-queue:${userId}:`);
}

/**
 * Get cache statistics (for monitoring)
 */
export async function getCacheStats() {
	return {
		relationshipCacheSize: await relationshipCache.size(),
		queueCacheSize: await queueCache.size(),
		cacheType: relationshipCache.getCacheType(),
	};
}
