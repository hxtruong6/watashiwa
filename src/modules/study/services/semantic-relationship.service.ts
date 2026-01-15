import { UnifiedCache } from '@/lib/cache';
import { prisma } from '@/lib/db';
import { EtymologySchema, ExamplesSchema, MeaningsSchema } from '@/lib/schemas/jsonb';
import type { Vocabulary } from '@/modules/flashcard/types';
import { z } from 'zod';

import type { RelatedWord, RelatedWordRelationshipType } from '../types/related-words';

const relatedWordsCache = new UnifiedCache<RelatedWord[]>(3600000); // 1 hour TTL

const VocabIdSchema = z.string().uuid();

function extractKanjiChars(text: string): string[] {
	// Unicode Script=Han covers Kanji/Hanzi characters
	return Array.from(text.matchAll(/[\p{Script=Han}]/gu)).map((m) => m[0]);
}

function extractKanjiRoots(vocab: { wordSurface: string; etymology: unknown }): Set<string> {
	const roots = new Set<string>();

	const parsed = EtymologySchema.safeParse(vocab.etymology);
	if (parsed.success) {
		for (const part of parsed.data.parts) {
			roots.add(part.kanji);
		}
	}

	for (const k of extractKanjiChars(vocab.wordSurface || '')) {
		roots.add(k);
	}

	return roots;
}

function tokenizeHanViet(hanViet: string | null | undefined): Set<string> {
	if (!hanViet) return new Set();
	return new Set(
		hanViet
			.toUpperCase()
			.split(/[\s,.;/\\-]+/g)
			.map((t) => t.trim())
			.filter(Boolean),
	);
}

function intersectionSize<T>(a: Set<T>, b: Set<T>): number {
	let count = 0;
	for (const x of a) if (b.has(x)) count++;
	return count;
}

function clamp01(n: number): number {
	return Math.max(0, Math.min(1, n));
}

function parseMnemonic(raw: unknown): Vocabulary['mnemonic'] {
	if (!raw || typeof raw !== 'object') return null;
	const obj = raw as Record<string, unknown>;
	if (typeof obj.en !== 'string' || typeof obj.vi !== 'string') return null;

	const mnemonic: NonNullable<Vocabulary['mnemonic']> = {
		en: obj.en,
		vi: obj.vi,
	};

	if (typeof obj.image_url === 'string') mnemonic.image_url = obj.image_url;
	return mnemonic;
}

function toVocabulary(raw: any): Vocabulary {
	// Meanings
	const meaningsParsed = MeaningsSchema.safeParse(raw.meanings);
	const meanings = meaningsParsed.success ? meaningsParsed.data : { en: [], vi: [] };

	// Examples
	const examplesParsed = ExamplesSchema.safeParse(raw.examples);
	const examples = examplesParsed.success ? examplesParsed.data : [];

	// Etymology
	const etymologyParsed = EtymologySchema.safeParse(raw.etymology);
	const etymology = etymologyParsed.success ? etymologyParsed.data : null;

	return {
		...raw,
		meanings,
		examples,
		etymology,
		mnemonic: parseMnemonic(raw.mnemonic),
	} as Vocabulary;
}

function mergeRelationshipTypes(
	existing: RelatedWordRelationshipType[],
	add: RelatedWordRelationshipType[],
): RelatedWordRelationshipType[] {
	const key = (t: RelatedWordRelationshipType) =>
		t.kind === 'confusion' ? `confusion:${t.confusionType}` : t.kind;
	const map = new Map<string, RelatedWordRelationshipType>();
	for (const t of existing) map.set(key(t), t);
	for (const t of add) map.set(key(t), t);
	return Array.from(map.values());
}

export async function invalidateRelatedWordsCache(userId: string): Promise<void> {
	await relatedWordsCache.deletePattern(`related-words:${userId}:`);
}

/**
 * Invalidate cache for a specific vocabulary (more targeted than invalidating all user caches)
 * This is called when a vocab's relationships might have changed
 */
export async function invalidateRelatedWordsCacheForVocab(
	userId: string,
	vocabId: string,
): Promise<void> {
	const cacheKey = `related-words:${userId}:${vocabId}`;
	await relatedWordsCache.delete(cacheKey);
}

export const SemanticRelationshipService = {
	/**
	 * Returns 0..5 related words. Never throws. Returns [] on invalid input, missing vocab, or service failure.
	 */
	async getRelatedWords(vocabId: string, userId: string): Promise<RelatedWord[]> {
		// Invalid vocabId should degrade gracefully (AC3 / Task8)
		if (!VocabIdSchema.safeParse(vocabId).success) return [];
		if (!userId) return [];

		const cacheKey = `related-words:${userId}:${vocabId}`;
		const cached = await relatedWordsCache.get(cacheKey);
		if (cached) return cached;

		const start = Date.now();
		let baseQueryTime = 0;
		let confusionQueryTime = 0;
		let deckQueryTime = 0;

		try {
			// Query 1: Get base vocabulary (needed for all relationship calculations)
			const queryStart = Date.now();
			const base = await prisma.vocabulary.findUnique({
				where: { id: vocabId },
				select: {
					id: true,
					deckId: true,
					tags: true,
					wordSurface: true,
					wordReading: true,
					wordRomaji: true,
					hanViet: true,
					meanings: true,
					examples: true,
					etymology: true,
					mnemonic: true,
					audioUrl: true,
					imageUrl: true,
					pitchPattern: true,
					pitchSvgPath: true,
					homonymGroupId: true,
					contentStatus: true,
					verifiedAt: true,
					verifiedBy: true,
					createdAt: true,
					updatedAt: true,
					deletedAt: true,
					wordOrder: true,
				},
			});
			baseQueryTime = Date.now() - queryStart;

			if (!base) {
				await relatedWordsCache.set(cacheKey, []);
				return [];
			}

			const baseKanji = extractKanjiRoots(base);
			const baseHanViet = tokenizeHanViet(base.hanViet);
			const baseTags = new Set(base.tags || []);

			const byVocabId = new Map<string, RelatedWord>();

			// 1) Confusion pairs (highest priority)
			// Optimize: Use separate queries to avoid nested relation overhead
			const confusionStart = Date.now();
			const confusionPairs = await prisma.confusionPair.findMany({
				where: { OR: [{ vocabId1: vocabId }, { vocabId2: vocabId }] },
				select: {
					type: true,
					vocabId1: true,
					vocabId2: true,
					vocab1: {
						select: {
							id: true,
							deckId: true,
							tags: true,
							wordSurface: true,
							wordReading: true,
							wordRomaji: true,
							hanViet: true,
							meanings: true,
							examples: true,
							etymology: true,
							mnemonic: true,
							audioUrl: true,
							imageUrl: true,
							pitchPattern: true,
							pitchSvgPath: true,
							homonymGroupId: true,
							contentStatus: true,
							verifiedAt: true,
							verifiedBy: true,
							createdAt: true,
							updatedAt: true,
							deletedAt: true,
							wordOrder: true,
						},
					},
					vocab2: {
						select: {
							id: true,
							deckId: true,
							tags: true,
							wordSurface: true,
							wordReading: true,
							wordRomaji: true,
							hanViet: true,
							meanings: true,
							examples: true,
							etymology: true,
							mnemonic: true,
							audioUrl: true,
							imageUrl: true,
							pitchPattern: true,
							pitchSvgPath: true,
							homonymGroupId: true,
							contentStatus: true,
							verifiedAt: true,
							verifiedBy: true,
							createdAt: true,
							updatedAt: true,
							deletedAt: true,
							wordOrder: true,
						},
					},
				},
				take: 10,
			});
			confusionQueryTime = Date.now() - confusionStart;

			for (const pair of confusionPairs) {
				const otherRaw = pair.vocabId1 === vocabId ? pair.vocab2 : pair.vocab1;
				if (!otherRaw?.id || otherRaw.id === vocabId) continue;

				const relationshipTypes: RelatedWordRelationshipType[] = [
					{ kind: 'confusion', confusionType: String(pair.type) },
				];

				const existing = byVocabId.get(otherRaw.id);
				const vocab = toVocabulary(otherRaw);
				const next: RelatedWord = existing
					? {
							...existing,
							relationshipTypes: mergeRelationshipTypes(
								existing.relationshipTypes,
								relationshipTypes,
							),
							strength: Math.max(existing.strength, 0.95),
						}
					: {
							vocab,
							relationshipTypes,
							strength: 0.95,
						};

				byVocabId.set(otherRaw.id, next);
			}

			// 2) Contextual grouping: same deck (plus kanji/han-viet/tag overlap as strength boosters)
			const deckStart = Date.now();
			const deckCandidates = base.deckId
				? await prisma.vocabulary.findMany({
						where: { deckId: base.deckId, id: { not: vocabId } },
						select: {
							id: true,
							deckId: true,
							tags: true,
							wordSurface: true,
							wordReading: true,
							wordRomaji: true,
							hanViet: true,
							meanings: true,
							examples: true,
							etymology: true,
							mnemonic: true,
							audioUrl: true,
							imageUrl: true,
							pitchPattern: true,
							pitchSvgPath: true,
							homonymGroupId: true,
							contentStatus: true,
							verifiedAt: true,
							verifiedBy: true,
							createdAt: true,
							updatedAt: true,
							deletedAt: true,
							wordOrder: true,
						},
						take: 50,
					})
				: [];
			deckQueryTime = Date.now() - deckStart;

			for (const cand of deckCandidates) {
				if (!cand?.id || cand.id === vocabId) continue;

				const candKanji = extractKanjiRoots(cand);
				const sharedKanji = intersectionSize(baseKanji, candKanji);

				const candHanViet = tokenizeHanViet(cand.hanViet);
				const sharedHanViet = intersectionSize(baseHanViet, candHanViet);

				const candTags = new Set(cand.tags || []);
				const sharedTags = intersectionSize(baseTags, candTags);

				const relationshipTypes: RelatedWordRelationshipType[] = [{ kind: 'same_deck' }];
				if (sharedKanji > 0) relationshipTypes.push({ kind: 'shared_kanji' });
				if (sharedHanViet > 0) relationshipTypes.push({ kind: 'shared_han_viet' });

				// Strength heuristic: keep simple and deterministic.
				let strength = 0.15; // same deck baseline
				strength += Math.min(0.6, sharedKanji * 0.3);
				strength += sharedHanViet > 0 ? 0.4 : 0;
				strength += Math.min(0.15, sharedTags * 0.05);
				strength = clamp01(strength);

				// Don’t let deck-only overwhelm confusion pairs.
				strength = Math.min(strength, 0.9);

				const existing = byVocabId.get(cand.id);
				const next: RelatedWord = existing
					? {
							...existing,
							relationshipTypes: mergeRelationshipTypes(
								existing.relationshipTypes,
								relationshipTypes,
							),
							strength: Math.max(existing.strength, strength),
						}
					: {
							vocab: toVocabulary(cand),
							relationshipTypes,
							strength,
						};

				byVocabId.set(cand.id, next);
			}

			// 3) Rank and return top 3-5 (as available)
			const ranked = Array.from(byVocabId.values())
				.filter((r) => r.vocab.id !== vocabId)
				.sort((a, b) => b.strength - a.strength)
				.slice(0, 5);

			const elapsed = Date.now() - start;
			if (elapsed > 200) {
				console.warn(`[SemanticRelationshipService] Slow getRelatedWords (${elapsed}ms)`, {
					userId,
					vocabId,
					count: ranked.length,
					cacheType: relatedWordsCache.getCacheType(),
					queryTimes: {
						base: baseQueryTime,
						confusion: confusionQueryTime,
						deck: deckQueryTime,
						total: elapsed,
					},
				});
			}

			await relatedWordsCache.set(cacheKey, ranked);
			return ranked;
		} catch (error) {
			console.error('[SemanticRelationshipService] getRelatedWords failed (graceful):', error);
			await relatedWordsCache.set(cacheKey, []);
			return [];
		}
	},
};
