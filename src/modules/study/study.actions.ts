'use server';

import { prisma } from '@/lib/db';
import { getUser } from '@/modules/auth/auth.actions';
import { executeSafeAction } from '@/modules/core/action-client';
import { InterventionCard } from '@/modules/flashcard/types';
import { fsrs, getSRSStage, mapRatingToFSRS } from '@/modules/flashcard/utils/srs-algorithm';
import { Question } from '@/types/exercises';
// [NEW]
import { Card, State, createEmptyCard } from 'ts-fsrs';
import { z } from 'zod';

import { InterventionService } from './intervention.service';
import { StudyData } from './study.data';
import { GetQueueSchema } from './study.dto';
// Removed SubmitReviewSchema as we define it locally now
import { StudyService } from './study.service';

/**
 * Get Next Review Card
 */
export async function getNextReviewCard(input: { deckIdOrIds?: string | string[] }) {
	try {
		const user = await getUser();
		const userId = user?.id;
		if (!userId) return null;

		// 1. Check Limits
		const stats = await StudyData.getDailyStats(userId, 200, 20);
		if (stats.hasReachedReviewLimit) return null;

		// 2. Find Due
		const dueCards = await StudyData.findDueCards(
			userId,
			1,
			Array.isArray(input.deckIdOrIds)
				? input.deckIdOrIds
				: input.deckIdOrIds
					? [input.deckIdOrIds]
					: undefined,
		);
		if (dueCards.length > 0) return dueCards[0];

		// 3. Find New
		if (stats.hasReachedNewCardLimit) return null;
		const candidate = await StudyData.findNewContentCandidate(
			userId,
			Array.isArray(input.deckIdOrIds)
				? input.deckIdOrIds
				: input.deckIdOrIds
					? [input.deckIdOrIds]
					: undefined,
		);

		if (candidate) {
			return StudyData.createCard(userId, {
				vocabId: candidate.item.id,
			});
		}

		return null;
	} catch (error) {
		console.error('Error getting next review card:', error);
		return null;
	}
}

/**
 * Get Queue (Smart Prefetching)
 */
export async function getReviewQueue(deckIdOrIds?: string | string[], limit: number = 3) {
	try {
		const user = await getUser();
		const userId = user?.id;
		if (!userId) return [];

		const deckIds = Array.isArray(deckIdOrIds)
			? deckIdOrIds
			: deckIdOrIds
				? [deckIdOrIds]
				: undefined;

		// 1. Check Limits
		const stats = await StudyData.getDailyStats(userId, 200, 20);
		if (stats.hasReachedReviewLimit) return [];

		// 2. Due Cards
		const dueCards = await StudyData.findDueCards(userId, limit, deckIds);

		if (dueCards.length >= limit) return dueCards;

		// 3. New Cards (JIT)
		const queue = [...dueCards];
		const needed = limit - queue.length;

		if (stats.hasReachedNewCardLimit || needed <= 0) return queue;

		for (let i = 0; i < needed; i++) {
			const candidate = await StudyData.findNewContentCandidate(userId, deckIds);
			if (!candidate) break;

			const newCard = await StudyData.createCard(userId, {
				vocabId: candidate.item.id,
			});
			queue.push(newCard);
		}

		return queue;
	} catch (error) {
		console.error('Error getting review queue:', error);
		return [];
	}
}

/**
 * Submit Review
 */
/**
 * Submit Review (FSRS + Smart Intervention)
 */
export async function submitReview(input: {
	vocabId: string;
	rating: 1 | 2 | 3 | 4;
	duration?: number;
}) {
	return executeSafeAction(
		z.object({
			vocabId: z.string(),
			rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
			duration: z.number().optional(),
		}),
		input,
		async ({ vocabId, rating, duration }, { userId }) => {
			if (!userId) throw new Error('Unauthorized');

			// 1. Get current state (if any)
			const existingReview = await prisma.userReview.findUnique({
				where: {
					userId_vocabId: { userId, vocabId },
				},
			});

			// 2. Prepare FSRS Card
			const now = new Date();
			let fCard: Card;

			if (existingReview) {
				fCard = {
					due: existingReview.nextReviewAt,
					stability: existingReview.stability,
					difficulty: existingReview.difficulty,
					elapsed_days: existingReview.elapsedDays,
					scheduled_days: existingReview.scheduledDays,
					reps: existingReview.reps,
					lapses: existingReview.lapses,
					state: existingReview.state as State,
					last_review: existingReview.lastReview || undefined,
					learning_steps: 0,
				};
			} else {
				fCard = createEmptyCard(now);
			}

			// 3. Calculate new state
			const fRating = mapRatingToFSRS(rating);
			const fLog = fsrs.repeat(fCard, now)[fRating];

			// 4. Update DB via Nested Write (Atomic)
			const newState = fLog.card;
			const srsStage = getSRSStage(newState);

			const logEntry = {
				userId,
				rating: rating,
				reviewDate: now,
				duration: duration ?? 0, // Use actual duration from client
				scheduledDays: newState.scheduled_days,
				elapsedDays: newState.elapsed_days,
				state: existingReview?.state || 0,
			};

			await prisma.userReview.upsert({
				where: { userId_vocabId: { userId, vocabId } },
				update: {
					nextReviewAt: newState.due,
					srsStage: srsStage,
					stability: newState.stability,
					difficulty: newState.difficulty,
					elapsedDays: newState.elapsed_days,
					scheduledDays: newState.scheduled_days,
					reps: newState.reps,
					lapses: newState.lapses,
					state: newState.state,
					lastReview: now,
					reviewLogs: {
						create: logEntry,
					},
				},
				create: {
					userId,
					vocabId,
					nextReviewAt: newState.due,
					srsStage: srsStage,
					stability: newState.stability,
					difficulty: newState.difficulty,
					elapsedDays: newState.elapsed_days,
					scheduledDays: newState.scheduled_days,
					reps: newState.reps,
					lapses: newState.lapses,
					state: newState.state,
					lastReview: now,
					reviewLogs: {
						create: logEntry,
					},
				},
			});

			// 5. SMART LAYER -> INTEFERENCE SHIELD
			let intervention: InterventionCard | null = null;
			try {
				intervention = await InterventionService.checkInterference(userId, vocabId, rating);
			} catch (err) {
				console.error('[Action] Intervention check failed', err);
				// Do not fail the review if intervention check fails
			}

			return {
				success: true,
				nextReview: newState.due,
				intervention, // Return to client for injection
				message: 'Review recorded',
			};
		},
		{ requireAuth: true },
	);
}

/**
 * Get Daily Progress (Dashboard)
 */
export async function getDailyProgress() {
	try {
		const user = await getUser();
		if (!user) return null;
		const userId = user.id;

		const stats = await StudyData.getDailyStats(userId, 200, 20);
		return stats;
	} catch (error) {
		console.error('Error getting daily progress:', error);
		return null;
	}
}

/**
 * Check if user has completed any study sessions before
 * Used for analytics to detect first-time study sessions
 */
export async function hasUserStudiedBefore(): Promise<boolean> {
	try {
		const user = await getUser();
		if (!user) return false;

		const reviewCount = await prisma.reviewLog.count({
			where: { userId: user.id },
		});
		return reviewCount > 0;
	} catch (error) {
		console.error('Error checking user study history:', error);
		return false;
	}
}

/**
 * Get Review Count (Badge)
 */
export async function getReviewCount() {
	try {
		const user = await getUser();
		if (!user) return 0;
		const userId = user.id;

		const stats = await StudyData.getDailyStats(userId, 200, 20);
		return stats.dueCount;
	} catch (error) {
		console.error('Error getting review count:', error);
		return 0;
	}
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
		return {
			nextReview: null,
			urgentCard: null,
			forecastCount: 0,
		};
	}
}
/**
 * Get the last study session information for the current user.
 * Used to resume study from where they left off.
 */
export async function getLastStudySession() {
	try {
		const user = await getUser();
		if (!user) return null;

		// Find the most recent review log
		const lastReview = await prisma.reviewLog.findFirst({
			where: { userId: user.id },
			orderBy: { reviewDate: 'desc' }, // V2: reviewDate
			include: {
				reviewItem: {
					// V2: reviewItem (UserReview)
					include: {
						vocab: { select: { deckId: true } },
					},
				},
			},
		});

		if (lastReview && lastReview.reviewItem) {
			const deckId = lastReview.reviewItem.vocab?.deckId;
			if (deckId) {
				return { deckId };
			}
		}

		return null;
	} catch (error) {
		console.error('Error getting last study session:', error);
		return null;
	}
}
