import { prisma } from '@/lib/db';
import { ContentStatus, Prisma } from '@prisma/client';

export type VocabWithDetails = Prisma.VocabularyGetPayload<{
	include: { variants: true };
}>;

export const VocabularyData = {
	/**
	 * Get Vocabulary by ID ensuring it exists
	 */
	findById: async (id: string): Promise<VocabWithDetails | null> => {
		return prisma.vocabulary.findUnique({
			where: { id },
			include: { variants: true },
		});
	},

	/**
	 * Get Content by Status (Admin/Script usage)
	 */
	getWithStatus: async (status: ContentStatus, limit = 50) => {
		return prisma.vocabulary.findMany({
			where: { contentStatus: status },
			take: limit,
			orderBy: { createdAt: 'desc' },
			include: {
				variants: true,
				confusionsAs1: {
					include: { vocab2: { select: { wordSurface: true, wordReading: true } } },
				},
				confusionsAs2: {
					include: { vocab1: { select: { wordSurface: true, wordReading: true } } },
				},
			},
		});
	},

	/**
	 * Get Published Content (Safe for Users)
	 * Enforces status = PUBLISHED
	 */
	getPublishedFromDecks: async (deckIds: string[], limit = 50) => {
		return prisma.vocabulary.findMany({
			where: {
				deckId: { in: deckIds },
				contentStatus: 'PUBLISHED',
			},
			take: limit,
			include: { variants: true },
		});
	},

	/**
	 * Update Contact Status (Quality Gate Transition)
	 */
	updateStatus: async (id: string, status: ContentStatus, verifiedBy?: string) => {
		const updateData: Prisma.VocabularyUpdateInput = {
			contentStatus: status,
		};

		if (status === 'PUBLISHED' || status === 'VERIFIED') {
			updateData.verifiedAt = new Date();
			if (verifiedBy) {
				updateData.verifiedBy = verifiedBy;
			}
		}

		return prisma.vocabulary.update({
			where: { id },
			data: updateData,
		});
	},
	/**
	 * Get Pending Content (Draft, Flagged, AI Generated)
	 */
	getPending: async (limit = 50) => {
		return prisma.vocabulary.findMany({
			where: {
				contentStatus: {
					in: ['AI_GENERATED', 'FLAGGED', 'DRAFT'],
				},
			},
			take: limit,
			orderBy: { createdAt: 'desc' }, // Recently created first? Or oldest? Let's do Oldest first to clear queue.
			// Actually, User wants new content maybe? Let's stick to CreatedAt ASC (FIFO)
			// But the previous file used DESC. Let's use ASC to be logical (Start from beginning).
			include: {
				confusionsAs1: {
					include: { vocab2: { select: { wordSurface: true, wordReading: true } } },
				},
				confusionsAs2: {
					include: { vocab1: { select: { wordSurface: true, wordReading: true } } },
				},
				variants: true,
			},
		});
	},

	/**
	 * Generic Update
	 */
	update: async (id: string, data: Prisma.VocabularyUpdateInput) => {
		return prisma.vocabulary.update({
			where: { id },
			data,
		});
	},

	/**
	 * Get Statistics by Status
	 */
	getStats: async () => {
		const groups = await prisma.vocabulary.groupBy({
			by: ['contentStatus'],
			_count: {
				_all: true,
			},
		});

		// Transform to a clean object
		const stats: Record<string, number> = {};
		groups.forEach((g) => {
			stats[g.contentStatus] = g._count._all;
		});

		// Ensure all keys exist with 0 if missing
		const allStatuses: ContentStatus[] = [
			'DRAFT',
			'AI_GENERATED',
			'VERIFIED',
			'PUBLISHED',
			'FLAGGED',
		];
		allStatuses.forEach((s) => {
			if (!stats[s]) stats[s] = 0;
		});

		return stats;
		return stats;
	},

	/**
	 * Create Vocabulary
	 */
	create: async (data: Prisma.VocabularyCreateInput) => {
		return prisma.vocabulary.create({
			data,
		});
	},

	/**
	 * Delete Vocabulary
	 */
	delete: async (id: string) => {
		return prisma.vocabulary.delete({
			where: { id },
		});
	},

	/**
	 * Get N5 Single Kanji
	 * Queries all kanji in N5 level that are single kanji characters
	 *
	 * @param options - Query options
	 * @param options.status - Content status filter (default: PUBLISHED)
	 * @param options.deckIds - Optional deck IDs to filter by
	 * @returns Array of single kanji vocabularies
	 */
	getN5SingleKanji: async (options?: { status?: ContentStatus; deckIds?: string[] }) => {
		const { status = 'PUBLISHED', deckIds } = options || {};

		// Prisma query: tags array must contain both "kanji" and "n5"
		// wordSurface must be exactly 1 character (single kanji)
		const where: Prisma.VocabularyWhereInput = {
			tags: {
				hasEvery: ['kanji', 'n5'], // Both tags must be present
			},
			contentStatus: status,
			// Single kanji: wordSurface is exactly 1 character
			// We'll filter this in application layer since Prisma doesn't have
			// a direct way to check string length in where clause efficiently
			// But we can use a raw query or filter after fetch
		};

		if (deckIds && deckIds.length > 0) {
			where.deckId = { in: deckIds };
		}

		const allN5Kanji = await prisma.vocabulary.findMany({
			where,
			select: {
				id: true,
				wordSurface: true,
				wordReading: true,
				wordRomaji: true,
				hanViet: true,
				meanings: true,
				etymology: true,
				mnemonic: true,
				examples: true,
				tags: true,
				contentStatus: true,
				deckId: true,
				audioUrl: true,
				imageUrl: true,
			},
			orderBy: [
				{ wordSurface: 'asc' }, // Sort by kanji character
			],
		});

		// Filter for single kanji characters (exactly 1 character, and it's kanji)
		// Using regex to ensure it's actually a kanji character, not kana or punctuation
		const kanjiRegex = /^[\p{Script=Han}]$/u;

		return allN5Kanji.filter((vocab) => {
			return vocab.wordSurface.length === 1 && kanjiRegex.test(vocab.wordSurface);
		});
	},
};
