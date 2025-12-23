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
};
