import { getStartOfDayInTimezone } from '@/lib/date-utils';
import { prisma } from '@/lib/db';
import { Card, Rating, State } from 'ts-fsrs';

import { StudyCardWithDetails } from './study.dto';

/**
 * Data Access Layer for Study Module
 * Encapsulates all Prisma queries.
 */
export const StudyData = {
	/**
	 * Get Daily Progress Stats
	 */
	getDailyStats: async (userId: string, limitReviews: number, limitNewCards: number) => {
		const startOfDay = getStartOfDayInTimezone(); // Use util or new Date().setHours(0,0,0,0)

		const reviewsToday = await prisma.reviewLog.count({
			where: {
				userId,
				review: { gte: startOfDay },
			},
		});

		const newCardsToday = await prisma.studyCard.count({
			where: {
				userId,
				createdAt: { gte: startOfDay },
				state: 0, // State.New
			},
		});

		return {
			reviewsToday,
			newCardsToday,
			limitReviews,
			limitNewCards,
			hasReachedReviewLimit: reviewsToday >= limitReviews,
			hasReachedNewCardLimit: newCardsToday >= limitNewCards,
		};
	},

	/**
	 * Find Due Cards
	 */
	findDueCards: async (
		userId: string,
		limit: number,
		deckIds?: string[],
	): Promise<StudyCardWithDetails[]> => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const whereCondition: any = {
			userId,
			due: { lte: new Date() },
			state: { not: 3 }, // exclude Relearning loop if handled separately? Wait, legacy logic excluded 3. FSRS 3 is Relearning.
			// Actually, usually we WANT to review Relearning cards.
			// Legacy code said: `state: { not: 3 }` with comment "Assuming 3 is Relearning loop".
			// In ts-fsrs, State.Relearning is indeed 3.
			// If we exclude them, they never get reviewed? That seems wrong unless they are handled by a separate priority queue.
			// Let's stick to Legacy behavior for now to avoid breaking changes, but flag it.
			// TODO: Verify if Relearning cards should be excluded.
		};

		if (deckIds && deckIds.length > 0) {
			whereCondition.OR = [
				{ vocab: { deckId: { in: deckIds } } },
				{ kanji: { deckId: { in: deckIds } } },
			];
		}

		return prisma.studyCard.findMany({
			where: whereCondition,
			orderBy: { due: 'asc' },
			take: limit,
			include: {
				vocab: { include: { _count: { select: { cardComments: true } } } },
				kanji: { include: { _count: { select: { cardComments: true } } } },
			},
		});
	},

	/**
	 * Find New Content Candidates (JIT Enrollment)
	 * Returns ONE candidate to avoid complex batch creation logic for now.
	 */
	findNewContentCandidate: async (userId: string, deckIds?: string[]) => {
		// 1. Vocab
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const vocabWhere: any = {
			deck: { OR: [{ isPublic: true }, { authorId: userId }] },
			studyCards: { none: { userId } },
		};
		if (deckIds && deckIds.length > 0) vocabWhere.deckId = { in: deckIds };

		const newVocab = await prisma.vocab.findFirst({
			where: vocabWhere,
			orderBy: { createdAt: 'asc' },
		});

		if (newVocab) return { type: 'vocab' as const, item: newVocab };

		// 2. Kanji
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const kanjiWhere: any = {
			deck: { OR: [{ isPublic: true }, { authorId: userId }] },
			studyCards: { none: { userId } },
		};
		if (deckIds && deckIds.length > 0) kanjiWhere.deckId = { in: deckIds };

		const newKanji = await prisma.kanji.findFirst({
			where: kanjiWhere,
			orderBy: { createdAt: 'asc' },
		});

		if (newKanji) return { type: 'kanji' as const, item: newKanji };

		return null;
	},

	/**
	 * Create Study Card
	 */
	createCard: async (userId: string, data: { vocabId?: string; kanjiId?: string }) => {
		return prisma.studyCard.create({
			data: {
				userId,
				vocabId: data.vocabId,
				kanjiId: data.kanjiId,
				due: new Date(),
				state: 0, // New
			},
			include: {
				vocab: { include: { _count: { select: { cardComments: true } } } },
				kanji: { include: { _count: { select: { cardComments: true } } } },
			},
		});
	},

	/**
	 * Get Card and verify ownership
	 */
	getCardById: async (cardId: string, userId: string) => {
		return prisma.studyCard.findUnique({
			where: { id: cardId, userId },
			include: { vocab: true, kanji: true },
		});
	},

	/**
	 * Update Card and Create Log
	 */
	updateCardProgress: async (
		cardId: string,
		userId: string,
		fsrsDetails: {
			due: Date;
			stability: number;
			difficulty: number;
			elapsed_days: number;
			scheduled_days: number;
			reps: number;
			lapses: number;
			state: State;
			last_review?: Date;
		},
		logDetails: {
			rating: number;
			review: Date;
			duration?: number;
		},
	) => {
		// Transaction to ensure data integrity
		return prisma.$transaction(async (tx) => {
			const updatedCard = await tx.studyCard.update({
				where: { id: cardId },
				data: {
					due: fsrsDetails.due,
					stability: fsrsDetails.stability,
					difficulty: fsrsDetails.difficulty,
					elapsedDays: fsrsDetails.elapsed_days,
					scheduledDays: fsrsDetails.scheduled_days,
					reps: fsrsDetails.reps,
					lapses: fsrsDetails.lapses,
					state: fsrsDetails.state,
					lastReview: fsrsDetails.last_review,
				},
			});

			const log = await tx.reviewLog.create({
				data: {
					userId,
					cardId,
					rating: logDetails.rating,
					review: logDetails.review,
					scheduledDays: fsrsDetails.scheduled_days,
					elapsedDays: fsrsDetails.elapsed_days,
					state: fsrsDetails.state,
					duration: logDetails.duration ?? 0,
				},
			});

			return { updatedCard, log };
		});
	},
};
