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
			include: { variants: true },
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
};
