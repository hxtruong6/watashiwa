import { getStartOfDayInTimezone } from '@/lib/date-utils';
import { prisma } from '@/lib/db';
import { State } from 'ts-fsrs';

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
		const now = new Date();

		// Single aggregated query using PostgreSQL subqueries
		// This consolidates 5 separate queries into 1 database round-trip
		const [stats] = await prisma.$queryRaw<
			Array<{
				reviews_today: bigint;
				new_cards_today: bigint;
				due_count: bigint;
				reviews_available: bigint;
				passed_reviews: bigint;
				total_reviews: bigint;
			}>
		>`
			SELECT
				(SELECT COUNT(*)::bigint FROM "ReviewLog" 
				 WHERE "user_id" = ${userId}
				 AND "review_date" >= ${startOfDay}) as reviews_today,
				
				(SELECT COUNT(*)::bigint FROM "UserReview" 
				 WHERE "user_id" = ${userId}
				 AND "created_at" >= ${startOfDay} 
				 AND "srs_stage" = 0) as new_cards_today,
				
				(SELECT COUNT(*)::bigint FROM "UserReview" 
				 WHERE "user_id" = ${userId}
				 AND "next_review_at" <= ${now}) as due_count,
				
				(SELECT COUNT(*)::bigint FROM "UserReview" 
				 WHERE "user_id" = ${userId}
				 AND "state" != 0 
				 AND "next_review_at" <= ${now}) as reviews_available,
				
				(SELECT COUNT(*)::bigint FROM "ReviewLog" 
				 WHERE "user_id" = ${userId}
				 AND "review_date" >= ${startOfDay} 
				 AND "rating" >= 2) as passed_reviews,
				
				(SELECT COUNT(*)::bigint FROM "ReviewLog" 
				 WHERE "user_id" = ${userId}
				 AND "review_date" >= ${startOfDay}) as total_reviews
		`;

		// Convert BigInt to Number (PostgreSQL COUNT returns bigint)
		const reviewsToday = Number(stats.reviews_today);
		const newCardsToday = Number(stats.new_cards_today);
		const dueCount = Number(stats.due_count);
		const reviewsAvailable = Number(stats.reviews_available);
		const passedCount = Number(stats.passed_reviews);
		const totalReviewsWithLogs = Number(stats.total_reviews);

		// Accuracy: (Passed [>=2] / Total) * 100
		const accuracy =
			totalReviewsWithLogs > 0 ? Math.round((passedCount / totalReviewsWithLogs) * 100) : 0;

		// Focus Points (FP):
		// - 10 FP per Review
		// - 20 FP per New Card (Learned)
		const reviewsFP = reviewsToday * 10;
		const newCardsFP = newCardsToday * 20;
		const focusPoints = reviewsFP + newCardsFP;

		return {
			reviewsToday,
			newCardsToday,
			limitReviews,
			limitNewCards,
			hasReachedReviewLimit: reviewsToday >= limitReviews,
			hasReachedNewCardLimit: newCardsToday >= limitNewCards,
			dueCount,
			reviewsAvailable,
			focusPoints,
			accuracy,
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
			nextReviewAt: { lte: new Date() },
			// state: { not: 3 }, // FSRS Relearning handling? Assuming we include all due.
		};

		if (deckIds && deckIds.length > 0) {
			whereCondition.vocab = { deckId: { in: deckIds } };
		}

		return prisma.userReview.findMany({
			where: whereCondition,
			orderBy: { nextReviewAt: 'asc' },
			take: limit,
			include: {
				vocab: { include: { _count: { select: { cardComments: true } } } },
			},
		});
	},

	/**
	 * Find New Content Candidates (JIT Enrollment)
	 * Returns ONE candidate to avoid complex batch creation logic for now.
	 */
	findNewContentCandidate: async (userId: string, deckIds?: string[]) => {
		// Unified Vocabulary Search
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const whereCondition: any = {
			deck: { OR: [{ isPublic: true }, { authorId: userId }] },
			// Ensure user hasn't reviewed it yet
			userReviews: { none: { userId } },
			contentStatus: 'VERIFIED', // Ensure content is verified? Or DRAFT too? Let's assume verified for safety.
		};

		if (deckIds && deckIds.length > 0) {
			whereCondition.deckId = { in: deckIds };
		}

		const newContent = await prisma.vocabulary.findFirst({
			where: whereCondition,
			orderBy: { createdAt: 'asc' }, // Learn oldest added first
		});

		if (newContent) return { item: newContent };

		return null;
	},

	/**
	 * Create Study Card (Enroll)
	 */
	createCard: async (userId: string, data: { vocabId: string }) => {
		return prisma.userReview.create({
			data: {
				userId,
				vocabId: data.vocabId,
				srsStage: 0,
				state: 0, // New
				nextReviewAt: new Date(),
			},
			include: {
				vocab: { include: { _count: { select: { cardComments: true } } } },
			},
		});
	},

	/**
	 * Get Card and verify ownership
	 */
	getCardById: async (cardId: string, userId: string) => {
		return prisma.userReview.findUnique({
			where: { id: cardId, userId },
			include: { vocab: true },
		});
	},

	/**
	 * Update Card and Create Log
	 */
	updateCardProgress: async (
		cardId: string,
		userId: string,
		fsrsDetails: {
			due: Date; // mapped to nextReviewAt?
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
			const updatedCard = await tx.userReview.update({
				where: { id: cardId },
				data: {
					nextReviewAt: fsrsDetails.due,
					stability: fsrsDetails.stability,
					difficulty: fsrsDetails.difficulty,
					elapsedDays: fsrsDetails.elapsed_days,
					scheduledDays: fsrsDetails.scheduled_days,
					reps: fsrsDetails.reps,
					lapses: fsrsDetails.lapses,
					state: fsrsDetails.state, // FSRS state
					srsStage: fsrsDetails.state, // Mapping FSRS state directly to srsStage? Or 0-4 mapping?
					// Usually srsStage mirrors state but ensures 0-4 range.
					lastReview: fsrsDetails.last_review,
				},
			});

			const log = await tx.reviewLog.create({
				data: {
					userId,
					reviewId: cardId, // reviewId links to UserReview.id
					rating: logDetails.rating,
					reviewDate: logDetails.review, // Check field name!
					scheduledDays: fsrsDetails.scheduled_days,
					elapsedDays: fsrsDetails.elapsed_days,
					state: fsrsDetails.state,
					duration: logDetails.duration ?? 0,
				},
			});

			return { updatedCard, log };
		});
	},

	/**
	 * Get User Review Stats for Dashboard (lightweight)
	 * Returns minimal data needed to calculate stats per deck
	 */
	getUserReviewStats: async (userId: string, deckIds?: string[]) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const whereCondition: any = { userId };
		if (deckIds && deckIds.length > 0) {
			whereCondition.vocab = { deckId: { in: deckIds } };
		}

		// Use findMany with select to minimize data transfer
		return prisma.userReview.findMany({
			where: whereCondition,
			select: {
				vocab: { select: { deckId: true } },
				srsStage: true,
				nextReviewAt: true,
				lastReview: true,
				state: true,
				stability: true,
			},
		});
	},
};
