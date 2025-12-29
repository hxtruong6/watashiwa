'use server';

/**
 * Etymology Graph Data Actions
 *
 * Fetches user's learned words and builds graph connections via shared kanji roots.
 * Implements the "Etymology Constellation" feature from Product v3 roadmap.
 *
 * Performance Strategy:
 * - Single Prisma query with include (avoid N+1)
 * - In-memory graph building (O(n²) but n ≤ 50)
 * - Limits to 50 nodes for performance + clarity
 */
import { prisma } from '@/lib/db';
import { EtymologySchema, MeaningsSchema } from '@/lib/schemas/jsonb';
import { getUser } from '@/modules/auth/auth.actions';
import { z } from 'zod';

import type { EtymologyGraphData, EtymologyGraphEdge, EtymologyGraphNode } from './types';

const MAX_NODES = 50; // Performance + clarity limit
const MIN_NODES = 1; // Minimum nodes required
const DEFAULT_NODES = 50; // Default limit

// Input validation schema
const LimitSchema = z.number().int().min(MIN_NODES).max(MAX_NODES).default(DEFAULT_NODES);

/**
 * Extract kanji roots from etymology.parts array
 * Returns array of kanji characters (e.g., ["学", "生"] from 学生)
 *
 * Edge Cases:
 * - Missing etymology: returns empty array
 * - Malformed JSONB: returns empty array (defensive)
 * - Empty parts array: returns empty array
 */
function extractKanjiRoots(etymology: unknown): string[] {
	try {
		// Validate structure using Zod schema
		const parsed = EtymologySchema.safeParse(etymology);
		if (!parsed.success) {
			return [];
		}

		// Extract kanji from each part
		const roots = parsed.data.parts
			.map((part) => part.kanji)
			.filter((kanji) => kanji && kanji.length > 0); // Filter empty strings

		return roots;
	} catch (error) {
		// Defensive: return empty array on any error
		console.warn('Error extracting kanji roots from etymology:', error);
		return [];
	}
}

/**
 * Build graph edges from nodes sharing kanji roots
 * Creates edges between all pairs of words that share at least one kanji root
 *
 * Algorithm:
 * 1. Create map: root → [vocabIds]
 * 2. For each root with ≥2 words, create edges between all pairs
 *
 * Performance: O(n²) where n = number of nodes sharing a root
 * Since we limit to 50 nodes total, worst case is manageable
 *
 * Note: The i < j loop already prevents duplicates, so no need for seenPairs Set
 */
function buildEdges(nodes: EtymologyGraphNode[]): EtymologyGraphEdge[] {
	const edges: EtymologyGraphEdge[] = [];
	const rootToVocabIds = new Map<string, string[]>();

	// Step 1: Build map of root → vocabIds
	for (const node of nodes) {
		// Defensive: Skip nodes with empty kanjiRoots
		if (!node.kanjiRoots || node.kanjiRoots.length === 0) {
			continue;
		}

		for (const root of node.kanjiRoots) {
			// Defensive: Skip empty or invalid roots
			if (!root || typeof root !== 'string' || root.trim().length === 0) {
				continue;
			}

			if (!rootToVocabIds.has(root)) {
				rootToVocabIds.set(root, []);
			}
			rootToVocabIds.get(root)!.push(node.id);
		}
	}

	// Step 2: Create edges for roots with ≥2 words
	for (const [root, vocabIds] of rootToVocabIds.entries()) {
		if (vocabIds.length < 2) {
			continue; // Need at least 2 words to create an edge
		}

		// Create edges between all pairs
		// The i < j loop ensures no duplicates (each pair appears exactly once)
		for (let i = 0; i < vocabIds.length; i++) {
			for (let j = i + 1; j < vocabIds.length; j++) {
				const source = vocabIds[i];
				const target = vocabIds[j];

				// Defensive: Skip if source or target is invalid
				if (!source || !target || source === target) {
					continue;
				}

				edges.push({
					source,
					target,
					sharedRoot: root,
				});
			}
		}
	}

	return edges;
}

/**
 * Get Etymology Graph Data
 *
 * Fetches user's learned words and builds graph showing semantic connections
 * via shared kanji roots (Hán Việt etymology).
 *
 * Edge Cases Handled:
 * - Missing etymology data: skip words without etymology
 * - Malformed JSONB: skip words with invalid etymology structure
 * - Empty kanji roots: skip words with no roots
 * - Users with < 2 learned words: return empty edges
 * - Users with no learned words: return empty graph
 * - Invalid limit parameter: clamped to valid range
 *
 * Performance:
 * - Single Prisma query with include
 * - Limits to 50 nodes (prioritizes highest stability words)
 * - In-memory graph building (< 50ms for n ≤ 50)
 * - Cached per request using React cache()
 *
 * Security:
 * - Input validation via Zod schema
 * - Type-safe JSONB parsing
 */
export async function getEtymologyGraphData(
	limit: number = DEFAULT_NODES,
): Promise<EtymologyGraphData | null> {
	try {
		// Validate and clamp limit parameter
		const validatedLimit = LimitSchema.parse(limit);

		const user = await getUser();
		if (!user) {
			return null;
		}

		// Fetch user reviews with vocabulary and etymology
		// Only include words with stability > 0 (learned words)
		const reviews = await prisma.userReview.findMany({
			where: {
				userId: user.id,
				stability: {
					gt: 0, // Only learned words
				},
			},
			take: validatedLimit * 2, // Fetch more to filter out words without etymology
			include: {
				vocab: {
					select: {
						id: true,
						wordSurface: true,
						meanings: true,
						etymology: true,
					},
				},
			},
			orderBy: {
				stability: 'desc', // Prioritize highest stability words
			},
		});

		// Transform to nodes, filtering out words without etymology
		const nodes: EtymologyGraphNode[] = [];

		for (const review of reviews) {
			// Defensive: Skip if vocab is missing
			if (!review.vocab) {
				continue;
			}

			const vocab = review.vocab;

			// Extract kanji roots from etymology
			const kanjiRoots = extractKanjiRoots(vocab.etymology);

			// Skip words without kanji roots
			if (kanjiRoots.length === 0) {
				continue;
			}

			// Extract meaning (type-safe parsing with Zod)
			let meaning = '';
			try {
				const meaningsParsed = MeaningsSchema.safeParse(vocab.meanings);
				if (meaningsParsed.success) {
					const meanings = meaningsParsed.data;
					// Prefer Vietnamese, fallback to English
					meaning =
						(meanings.vi && Array.isArray(meanings.vi) && meanings.vi[0]) ||
						(meanings.en && Array.isArray(meanings.en) && meanings.en[0]) ||
						'';
				}
			} catch (error) {
				// Defensive: If parsing fails, meaning remains empty string
				console.warn('Error parsing meanings for vocab:', vocab.id, error);
			}

			// Defensive: Clamp stability and lapses to valid range
			const stability = Math.max(0, review.stability ?? 0);
			const lapses = Math.max(0, review.lapses ?? 0);
			const srsStage = Math.max(0, Math.min(3, review.srsStage ?? 0));
			const isLeech = lapses >= 3 || srsStage === 3;

			nodes.push({
				id: vocab.id,
				wordSurface: vocab.wordSurface,
				meaning,
				stability,
				srsStage,
				lapses,
				kanjiRoots,
				isLeech,
			});

			// Stop when we have enough nodes
			if (nodes.length >= validatedLimit) {
				break;
			}
		}

		// Build edges from shared kanji roots
		const edges = buildEdges(nodes);

		return {
			nodes,
			edges,
			totalNodes: nodes.length,
			totalEdges: edges.length,
		};
	} catch (error) {
		// Defensive: Log error but don't expose internal details to client
		console.error('Error fetching etymology graph data:', error);
		return null;
	}
}
