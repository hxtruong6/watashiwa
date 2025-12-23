'use server';

import { prisma } from '@/lib/db';
import { getUser } from '@/modules/auth/auth.actions';
import { executeSafeAction } from '@/modules/core/action-client';
import { Question } from '@/types/exercises';
import { z } from 'zod';

import { StudyData } from './study.data';
import { GetQueueSchema, SubmitReviewSchema } from './study.dto';
import { StudyService } from './study.service';

/**
 * Get Next Review Card
 */
export async function getNextReviewCard(input: { deckIdOrIds?: string | string[] }) {
	// Manually wrapping because createSafeAction wrapper is abstract
	// Reusing GetQueueSchema for simplicity or defining a new one
	// Let's rely on flexible input for now or use a proper schema

	// Note: The input here comes from the client component usually as args.
	// We'll wrap it.
	return executeSafeAction(
		GetQueueSchema.pick({ deckIdOrIds: true }),
		input,
		async (data, { userId }) => {
			if (!userId) throw new Error('Unauthorized');

			// 1. Check Limits (Basic check, optimizations later)
			const stats = await StudyData.getDailyStats(userId, 200, 20); // Hardcoded limits for V2 MVP
			if (stats.hasReachedReviewLimit) return null;

			// 2. Find Due
			const dueCards = await StudyData.findDueCards(
				userId,
				1,
				Array.isArray(data.deckIdOrIds)
					? data.deckIdOrIds
					: data.deckIdOrIds
						? [data.deckIdOrIds]
						: undefined,
			);
			if (dueCards.length > 0) return dueCards[0];

			// 3. Find New
			if (stats.hasReachedNewCardLimit) return null;
			const candidate = await StudyData.findNewContentCandidate(
				userId,
				Array.isArray(data.deckIdOrIds)
					? data.deckIdOrIds
					: data.deckIdOrIds
						? [data.deckIdOrIds]
						: undefined,
			);

			if (candidate) {
				// Enroll
				return StudyData.createCard(userId, {
					vocabId: candidate.item.id,
				});
			}

			return null;
		},
	);
}

/**
 * Get Queue (Smart Prefetching)
 */
export async function getReviewQueue(input: { deckIdOrIds?: string | string[]; limit?: number }) {
	return executeSafeAction(GetQueueSchema, input, async (data, { userId }) => {
		if (!userId) throw new Error('Unauthorized');

		const limit = data.limit ?? 3;
		const deckIds = Array.isArray(data.deckIdOrIds)
			? data.deckIdOrIds
			: data.deckIdOrIds
				? [data.deckIdOrIds]
				: undefined;

		// 1. Check Limits
		const stats = await StudyData.getDailyStats(userId, 200, 20);
		if (stats.hasReachedReviewLimit) return [];

		// 2. Due Cards
		// Fetch up to limit
		const dueCards = await StudyData.findDueCards(userId, limit, deckIds);

		if (dueCards.length >= limit) return dueCards;

		// 3. New Cards (JIT)
		const queue = [...dueCards];
		const needed = limit - queue.length;

		if (stats.hasReachedNewCardLimit || needed <= 0) return queue;

		// Try to enroll 'needed' amount
		// Naive loop for MVP (optimized in V3)
		for (let i = 0; i < needed; i++) {
			const candidate = await StudyData.findNewContentCandidate(userId, deckIds);
			if (!candidate) break;

			const newCard = await StudyData.createCard(userId, {
				vocabId: candidate.item.id,
			});
			queue.push(newCard);
		}

		return queue;
	});
}

/**
 * Submit Review
 */
export async function submitReview(input: {
	cardId: string;
	rating: number;
	deckIdOrIds?: string | string[];
}) {
	return executeSafeAction(SubmitReviewSchema, input, async (data, { userId }) => {
		if (!userId) throw new Error('Unauthorized');

		// 1. Get Card
		const card = await StudyData.getCardById(data.cardId, userId);
		if (!card) throw new Error('Card not found');

		// 2. Calculate FSRS
		const { nextCard, reviewLog } = StudyService.calculateNextState(card, data.rating);

		// 3. Update DB
		await StudyData.updateCardProgress(
			card.id,
			userId,
			{
				...nextCard,
				last_review: nextCard.last_review || undefined,
			},
			{
				rating: reviewLog.rating,
				review: reviewLog.review,
				duration: 0, // TODO: Add duration tracking to frontend
			},
		);

		// 4. Return next card (Optimistic/Sequential)
		// Note: We need to define how to handle "getNext" inside this action or if client calls it separately.
		// Current V1 pattern returns `nextCard`.
		// Let's call getNextReviewCard directly (internal call, not via action wrapper to save overhead?)
		// Actually, reused logic is better.

		// Helper to re-fetch queue or next card
		const deckIds = data.deckIdOrIds;
		// We can't await exported action easily without double-wrapping.
		// Let's just return success: true and let client fetch next.
		// BUT, requirement says "optimistic UI" or fast response.
		// Let's duplicate the "Get Next" call logic here or extract it to a shared internal function.

		// For modularity, let's extract "findNextCard" logic to Service or Data layer?
		// No, Data layer is CRUD. Service is Logic.
		// Action allows composing.

		// Let's implement a quick "get next" here reusing Data layer.
		const nextReviewCard = (
			await StudyData.findDueCards(
				userId,
				1,
				Array.isArray(deckIds) ? deckIds : deckIds ? [deckIds] : undefined,
			)
		)[0];

		return {
			reviewLog,
			nextCard: nextReviewCard ?? null,
			message: 'Review recorded',
		};
	});
}

/**
 * Get Daily Progress (Dashboard)
 */
export async function getDailyProgress() {
	return executeSafeAction(z.void(), undefined, async (_, { userId }) => {
		if (!userId) throw new Error('Unauthorized');
		// Hardcoded limits for MVP, or fetch user settings?
		// StudyData.getDailyStats assumes limits passed in.
		// We should fetch user settings.
		// Avoiding circular dependency, we fetch settings here or in StudyData?
		// StudyData should be pure data. Logic belongs here.
		// But we don't have access to User settings easily without importing user module.
		// Let's import getUserSettings from user module.

		// Wait, user module is separate.
		// Ideally we fetch settings.
		// For now, hardcode or fetch via prisma directly?
		// Let's use hardcoded defaults matching actions.ts: 200, 20.

		const stats = await StudyData.getDailyStats(userId, 200, 20);

		return stats;
	});
}

/**
 * Get Review Count (Badge)
 */
export async function getReviewCount() {
	return executeSafeAction(z.void(), undefined, async (_, { userId }) => {
		if (!userId) return 0;
		// Reuse getDailyStats? Or just count.
		// getDailyStats is efficient enough.
		const stats = await StudyData.getDailyStats(userId, 200, 20);
		return stats.dueCount;
	});
}

const ExerciseSchema = z.object({
	deckIds: z.array(z.string()).default([]),
	count: z.number().min(1).max(50).default(10),
});

/**
 * Fetches random vocabulary questions for a study session.
 * V2 Schema Compatible: Uses Vocabulary table and JSONB meanings field
 */
export async function getExerciseQuestions(
	deckIds: string[] = [],
	count: number = 10,
): Promise<{ success: boolean; data?: Question[]; error?: string }> {
	const validation = ExerciseSchema.safeParse({ deckIds, count });
	if (!validation.success) {
		return { success: false, error: 'Invalid input parameters.' };
	}
	const cleanData = validation.data;

	try {
		const user = await getUser();
		if (!user) return { success: false, error: 'Unauthorized' };

		const whereClause: any = {
			deck: {
				OR: [{ isPublic: true }, { authorId: user.id }],
			},
		};

		if (cleanData.deckIds.length > 0) {
			whereClause.deckId = { in: cleanData.deckIds };
		}

		// V2: Use vocabulary table (not vocab)
		const allVocabs = await prisma.vocabulary.findMany({
			where: whereClause,
			select: {
				id: true,
				wordSurface: true,
				meanings: true, // JSONB field
				wordReading: true, // V2 uses wordReading instead of readingKana
				hanViet: true,
				audioUrl: true,
			},
		});

		if (allVocabs.length < 4) {
			return {
				success: false,
				error: 'NOT_ENOUGH_CARDS',
			};
		}

		// Shuffle (Fisher-Yates)
		const shuffled = [...allVocabs];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}

		const candidates = shuffled.slice(0, cleanData.count);

		const questions: Question[] = candidates.map((target) => {
			const targetLength = target.wordSurface.length;

			// Extract meaning from JSONB structure
			const targetMeanings = (target.meanings as any)?.en || (target.meanings as any)?.vi || [];
			const targetMeaning =
				Array.isArray(targetMeanings) && targetMeanings.length > 0 ? targetMeanings[0] : '';

			const pool = allVocabs.filter((v) => {
				const vMeanings = (v.meanings as any)?.en || (v.meanings as any)?.vi || [];
				const vMeaning = Array.isArray(vMeanings) && vMeanings.length > 0 ? vMeanings[0] : '';

				return (
					v.id !== target.id && vMeaning.trim().toLowerCase() !== targetMeaning.trim().toLowerCase()
				);
			});

			const sameLength = pool.filter((v) => v.wordSurface.length === targetLength);

			let selectedDistractors: typeof allVocabs = [];

			if (sameLength.length >= 3) {
				const uniqueMeanings = new Set<string>();
				const candidates: typeof allVocabs = [];
				const shuffledSameLength = sameLength.sort(() => 0.5 - Math.random());

				for (const item of shuffledSameLength) {
					const itemMeanings = (item.meanings as any)?.en || (item.meanings as any)?.vi || [];
					const itemMeaning =
						Array.isArray(itemMeanings) && itemMeanings.length > 0 ? itemMeanings[0] : '';

					if (!uniqueMeanings.has(itemMeaning.trim().toLowerCase())) {
						uniqueMeanings.add(itemMeaning.trim().toLowerCase());
						candidates.push(item);
						if (candidates.length === 3) break;
					}
				}
				selectedDistractors = candidates;
			}

			if (selectedDistractors.length < 3) {
				const currentMeanings = new Set(
					selectedDistractors.map((d) => {
						const dMeanings = (d.meanings as any)?.en || (d.meanings as any)?.vi || [];
						return Array.isArray(dMeanings) && dMeanings.length > 0
							? dMeanings[0].trim().toLowerCase()
							: '';
					}),
				);

				const others = pool.filter((v) => {
					const vMeanings = (v.meanings as any)?.en || (v.meanings as any)?.vi || [];
					const vMeaning =
						Array.isArray(vMeanings) && vMeanings.length > 0
							? vMeanings[0].trim().toLowerCase()
							: '';

					return v.wordSurface.length !== targetLength && !currentMeanings.has(vMeaning);
				});

				const shuffledOthers = others.sort(() => 0.5 - Math.random());

				for (const item of shuffledOthers) {
					if (selectedDistractors.length >= 3) break;

					const itemMeanings = (item.meanings as any)?.en || (item.meanings as any)?.vi || [];
					const itemMeaning =
						Array.isArray(itemMeanings) && itemMeanings.length > 0
							? itemMeanings[0].trim().toLowerCase()
							: '';

					if (!currentMeanings.has(itemMeaning)) {
						currentMeanings.add(itemMeaning);
						selectedDistractors.push(item);
					}
				}
			}

			const distractors = selectedDistractors.map((v) => {
				const vMeanings = (v.meanings as any)?.en || (v.meanings as any)?.vi || [];
				return Array.isArray(vMeanings) && vMeanings.length > 0 ? vMeanings[0] : '';
			});

			const options = [...distractors, targetMeaning].sort(() => 0.5 - Math.random());

			return {
				id: target.id,
				type: 'multiple_choice',
				challenge: target.wordSurface,
				correctAnswer: targetMeaning,
				options: options,
				reading: target.wordReading || undefined,
				meaning: targetMeaning,
				hanViet: target.hanViet || undefined,
				audioUrl: target.audioUrl || undefined,
			};
		});

		return { success: true, data: questions };
	} catch (error) {
		console.error('Error fetching exercise questions:', error);
		return { success: false, error: 'Failed to generate exercises.' };
	}
}

/**
 * Calculates the 'Smart Review Forecast' for the user.
 * 1. Finds the optimal 'Golden Time' to return based on upcoming review density.
 * 2. Finds a 'Hook Card' (forgotten/hard item) to trigger active recall.
 *
 * V2 Schema Compatible: Uses UserReview and ReviewLog tables
 */
export async function getReviewForecast(): Promise<{
	nextReview: Date | null;
	urgentCard: { surface: string; meaning: string } | null;
	forecastCount: number;
}> {
	try {
		const user = await getUser();
		if (!user) return { nextReview: null, urgentCard: null, forecastCount: 0 };

		const now = new Date();
		const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

		// V2: Use UserReview table instead of studyCard
		// State: 0=New, 1=Learning, 2=Review, 3=Relearning
		const upcomingCards = await prisma.userReview.findMany({
			where: {
				userId: user.id,
				srsStage: { in: [1, 2, 3] }, // Learning, Review, Relearning
				nextReviewAt: {
					gte: now,
					lt: tomorrow,
				},
			},
			select: { nextReviewAt: true },
		});

		let nextReview: Date | null = null;
		let maxCount = 0;

		if (upcomingCards.length > 0) {
			const buckets = new Map<number, number>();

			for (const card of upcomingCards) {
				const time = card.nextReviewAt.getTime();
				const bucketTime = Math.floor(time / (30 * 60 * 1000)) * (30 * 60 * 1000);
				const currentCount = buckets.get(bucketTime) || 0;
				buckets.set(bucketTime, currentCount + 1);
			}

			let bestBucketTime = 0;
			for (const [time, count] of buckets.entries()) {
				if (count > maxCount) {
					maxCount = count;
					bestBucketTime = time;
				}
			}

			if (bestBucketTime > 0) {
				nextReview = new Date(bestBucketTime);
			}
		}

		// V2: Find 'Hook Card' using ReviewLog -> reviewItem -> vocab relation
		const hookLog = await prisma.reviewLog.findFirst({
			where: {
				userId: user.id,
				rating: { in: [1, 2] }, // Again or Hard
				reviewDate: {
					gte: new Date(now.getTime() - 48 * 60 * 60 * 1000), // Last 48h
				},
			},
			orderBy: { reviewDate: 'desc' },
			include: {
				reviewItem: {
					include: {
						vocab: {
							select: {
								wordSurface: true,
								meanings: true, // JSONB field
							},
						},
					},
				},
			},
		});

		let urgentCard: { surface: string; meaning: string } | null = null;

		if (hookLog?.reviewItem?.vocab) {
			const vocab = hookLog.reviewItem.vocab;
			// Extract first meaning from JSONB structure
			const meanings = (vocab.meanings as any)?.en || (vocab.meanings as any)?.vi || [];
			const meaning = Array.isArray(meanings) && meanings.length > 0 ? meanings[0] : '';

			urgentCard = {
				surface: vocab.wordSurface,
				meaning: meaning,
			};
		}

		return {
			nextReview,
			urgentCard,
			forecastCount: maxCount,
		};
	} catch (error) {
		console.error('Error getting review forecast:', error);
		return { nextReview: null, urgentCard: null, forecastCount: 0 };
	}
}
