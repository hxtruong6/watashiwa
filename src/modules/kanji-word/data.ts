/**
 * KanjiWord Module - Data Layer
 *
 * Server-side data access for vocabulary caching
 */
import { prisma } from '@/lib/db';

/** Selected fields for cache; not full Vocabulary (no verifiedAt, deletedAt, wordOrder, etc.) */
const topVocabSelect = {
	id: true,
	wordSurface: true,
	wordReading: true,
	wordRomaji: true,
	hanViet: true,
	meanings: true,
	audioUrl: true,
	tags: true,
	etymology: true,
	examples: true,
	mnemonic: true,
	furiganaMapping: true,
	contentStatus: true,
	deckId: true,
	createdAt: true,
	updatedAt: true,
} as const

export type TopVocabCacheItem = Awaited<
	ReturnType<typeof prisma.vocabulary.findMany<{ select: typeof topVocabSelect }>>
>[number];

/**
 * Get top 1000 most common vocabulary for caching
 * Ordered by frequency/usage (can be extended with user study data)
 */
export async function getTopVocabCache(limit = 1000): Promise<TopVocabCacheItem[]> {
	return prisma.vocabulary.findMany({
		where: {
			contentStatus: 'PUBLISHED',
		},
		orderBy: [
			// Order by: published first, then by creation date (most recent)
			{ createdAt: 'desc' },
		],
		take: limit,
		select: topVocabSelect,
	});
}

/**
 * Get vocabulary by wordSurface
 * Used for on-demand fetching when word is not in cache
 */
export async function getVocabByWordSurface(
	wordSurface: string,
): Promise<TopVocabCacheItem | null> {
	if (!wordSurface || wordSurface.trim().length === 0) {
		return null;
	}

	return prisma.vocabulary.findFirst({
		where: {
			wordSurface: wordSurface.trim(),
			contentStatus: 'PUBLISHED',
		},
		select: topVocabSelect,
	});
}
