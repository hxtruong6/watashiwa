/**
 * KanjiWord Module - Data Layer
 *
 * Server-side data access for vocabulary caching
 */
import { prisma } from '@/lib/db';
import type { Vocabulary } from '@prisma/client';

/**
 * Get top 1000 most common vocabulary for caching
 * Ordered by frequency/usage (can be extended with user study data)
 */
export async function getTopVocabCache(limit = 1000): Promise<Vocabulary[]> {
	return prisma.vocabulary.findMany({
		where: {
			contentStatus: 'PUBLISHED',
		},
		orderBy: [
			// Order by: published first, then by creation date (most recent)
			{ createdAt: 'desc' },
		],
		take: limit,
		select: {
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
		},
	});
}
