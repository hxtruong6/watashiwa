'use server';

import { hasRole, requireRole } from '@/lib/auth/roleGuard';
import { getStartOfDayInTimezone } from '@/lib/date-utils';
import { prisma } from '@/lib/db';
import { getUser } from '@/modules/auth/auth.actions';
import { getDeck, getDecks } from '@/modules/deck/deck.actions';
// getUser moved to @/modules/auth/auth.actions
import {
	completeTutorial,
	getCompletedTutorials,
	getUserSettings,
	recalculateUserStreak,
	updateUserAvatar,
	updateUserSettings,
} from '@/modules/user/user.actions';
/**
 * Fetch all Vocabulary for the current user (from all decks user has access to)
 */
// Vocab/Kanji getters replaced by unified getAllVocabulary
import { getAllVocabulary } from '@/modules/vocabulary/vocabulary.actions';
// Update actions mapped to unified updateContent
import { updateContent } from '@/modules/vocabulary/vocabulary.actions';
import { UserReview, Vocabulary } from '@prisma/client';
import { cache } from 'react';
import { Card, Rating, State, fsrs, generatorParameters } from 'ts-fsrs';
import { z } from 'zod';

// Initialize FSRS with default parameters
const params = generatorParameters({ enable_fuzz: true });
const f = fsrs(params);

// --- Zod Schemas ---

const IdSchema = z.string().min(1);
const DeckIdOrIdsSchema = z.union([z.string(), z.array(z.string())]).optional();

const SubmitReviewSchema = z.object({
	cardId: IdSchema,
	rating: z.number().int().min(1).max(4),
	deckIdOrIds: DeckIdOrIdsSchema,
});

// Update schemas removed, logic moved to @/modules/vocabulary/vocabulary.actions.ts

export type StudyCardWithDetails = UserReview & {
	vocab?: (Vocabulary & { _count?: { cardComments: number } }) | null;
};

/**
 * Get the next card due for review for the CURRENT user
 * Optional: Constrain to specific deck
 */
/**
 * Get the next card due for review for the CURRENT user
 * Optional: Constrain to specific deck or LIST of decks (for Courses)
 */
export async function getNextReviewCard(
	deckIdOrIds?: string | string[],
): Promise<StudyCardWithDetails | null> {
	try {
		const validation = DeckIdOrIdsSchema.safeParse(deckIdOrIds);
		if (!validation.success) {
			console.error('Invalid deckIdOrIds:', validation.error);
			return null;
		}

		const user = await getUser();
		if (!user) return null;

		// 1. Fetch User Config for Limits
		const userConfig = await prisma.user.findUnique({
			where: { id: user.id },
			select: {
				limitNewCards: true,
				limitReviews: true,
				currentStreak: true, // Fetch streak to debug/log if needed, but we used cached usually
			},
		});
		const limitNewCards = userConfig?.limitNewCards ?? 20;
		const limitReviews = userConfig?.limitReviews ?? 200;

		// 2. Count Today's Activity
		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);

		const reviewsToday = await prisma.reviewLog.count({
			where: {
				userId: user.id,
				review: { gte: startOfDay },
			},
		});

		const newCardsToday = await prisma.studyCard.count({
			where: {
				userId: user.id,
				createdAt: { gte: startOfDay },
				state: 0, // Explicitly counting cards created as 'New' today
			},
		});

		console.log(
			`Daily Stats for ${user.id}: Reviews ${reviewsToday}/${limitReviews}, New ${newCardsToday}/${limitNewCards}`,
		);

		// 3. Enforce Review Limit
		if (reviewsToday >= limitReviews) {
			console.log('Daily review limit reached.');
			return null;
		}

		// 4. Fetch Due Cards
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const whereCondition: any = {
			userId: user.id,
			state: {
				not: 3, // Assuming 3 is "Relearning" loop or similar, actually FSRS state 3 is Relearning.
				// We just want ANY card due.
			},
			due: {
				lte: new Date(),
			},
		};

		// If deckId is provided, filter cards that belong to this deck
		// A card belongs to a deck via its Vocab OR Kanji parent
		if (deckIdOrIds) {
			if (Array.isArray(deckIdOrIds)) {
				// Multiple Decks (Course Mode)
				whereCondition.OR = [
					{ vocab: { deckId: { in: deckIdOrIds } } },
					{ kanji: { deckId: { in: deckIdOrIds } } },
				];
			} else {
				// Single Deck
				whereCondition.OR = [
					{ vocab: { deckId: deckIdOrIds } },
					{ kanji: { deckId: deckIdOrIds } },
				];
			}
		}

		const card = await prisma.studyCard.findFirst({
			where: whereCondition,
			orderBy: {
				due: 'asc',
			},
			include: {
				vocab: { include: { _count: { select: { cardComments: true } } } },
				kanji: { include: { _count: { select: { cardComments: true } } } },
			},
		});

		if (card) {
			return card;
		}

		// --- JIT Enrollment Logic ---
		// 5. Enforce New Card Limit
		if (newCardsToday >= limitNewCards) {
			console.log('Daily new card limit reached.');
			return null;
		}

		// If no cards are due, look for NEW content to enroll

		// 1. Try to find a new Vocab
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const vocabWhere: any = {
			deck: {
				OR: [{ isPublic: true }, { authorId: user.id }],
			},
			studyCards: {
				none: { userId: user.id }, // Exclude if user already has a card for this vocab
			},
		};
		if (deckIdOrIds) {
			if (Array.isArray(deckIdOrIds)) {
				vocabWhere.deckId = { in: deckIdOrIds };
			} else {
				vocabWhere.deckId = deckIdOrIds;
			}
		}

		const newVocab = await prisma.vocab.findFirst({
			where: vocabWhere,
			orderBy: { createdAt: 'asc' }, // Learn oldest added first, or could be 'random'
		});

		if (newVocab) {
			console.log(`Enrolling new Vocab: ${newVocab.wordSurface}`);
			const newCard = await prisma.studyCard.create({
				data: {
					userId: user.id,
					vocabId: newVocab.id,
					due: new Date(), // Due immediately
					state: 0, // New
				},
				include: {
					vocab: { include: { _count: { select: { cardComments: true } } } },
					kanji: { include: { _count: { select: { cardComments: true } } } },
				},
			});
			return newCard;
		}

		// 2. Try to find a new Kanji
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const kanjiWhere: any = {
			deck: {
				OR: [{ isPublic: true }, { authorId: user.id }],
			},
			studyCards: {
				none: { userId: user.id },
			},
		};
		if (deckIdOrIds) {
			if (Array.isArray(deckIdOrIds)) {
				kanjiWhere.deckId = { in: deckIdOrIds };
			} else {
				kanjiWhere.deckId = deckIdOrIds;
			}
		}

		const newKanji = await prisma.kanji.findFirst({
			where: kanjiWhere,
			orderBy: { createdAt: 'asc' },
		});

		if (newKanji) {
			console.log(`Enrolling new Kanji: ${newKanji.kanji}`);
			const newCard = await prisma.studyCard.create({
				data: {
					userId: user.id,
					kanjiId: newKanji.id,
					due: new Date(),
					state: 0,
				},
				include: {
					vocab: { include: { _count: { select: { cardComments: true } } } },
					kanji: { include: { _count: { select: { cardComments: true } } } },
				},
			});
			return newCard;
		}

		return null;
	} catch (error) {
		console.error('Error fetching next review card:', error);
		return null;
	}
}

/**
 * Get a queue of cards for review (Smart Queue / Prefetching)
 * Fetches multiple cards to allow client-side buffering.
 */
export async function getReviewQueue(
	deckIdOrIds?: string | string[],
	limit: number = 3,
): Promise<StudyCardWithDetails[]> {
	try {
		const validation = DeckIdOrIdsSchema.safeParse(deckIdOrIds);
		if (!validation.success) return [];

		const user = await getUser();
		if (!user) return [];

		// 1. Fetch User Config
		const userConfig = await prisma.user.findUnique({
			where: { id: user.id },
			select: { limitNewCards: true, limitReviews: true },
		});
		const limitNewCards = userConfig?.limitNewCards ?? 20;
		const limitReviews = userConfig?.limitReviews ?? 200;

		const startOfDay = getStartOfDayInTimezone();

		// 2. Check Daily Limits
		const reviewsToday = await prisma.reviewLog.count({
			where: { userId: user.id, review: { gte: startOfDay } },
		});

		if (reviewsToday >= limitReviews) return [];

		const remainingReviews = limitReviews - reviewsToday;
		const fetchLimit = Math.min(limit, remainingReviews);

		if (fetchLimit <= 0) return [];

		// 3. Fetch Due Cards (Reviews)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const whereCondition: any = {
			userId: user.id,
			due: { lte: new Date() },
		};

		if (deckIdOrIds) {
			if (Array.isArray(deckIdOrIds)) {
				whereCondition.OR = [
					{ vocab: { deckId: { in: deckIdOrIds } } },
					{ kanji: { deckId: { in: deckIdOrIds } } },
				];
			} else {
				whereCondition.OR = [
					{ vocab: { deckId: deckIdOrIds } },
					{ kanji: { deckId: deckIdOrIds } },
				];
			}
		}

		const dueCards = await prisma.studyCard.findMany({
			where: whereCondition,
			orderBy: { due: 'asc' },
			take: fetchLimit,
			include: {
				vocab: { include: { _count: { select: { cardComments: true } } } },
				kanji: { include: { _count: { select: { cardComments: true } } } },
			},
		});

		if (dueCards.length >= fetchLimit) {
			return dueCards;
		}

		// 4. Fill with New Cards (JIT Enrollment)
		const queue = [...dueCards];
		const needed = fetchLimit - queue.length;

		const newCardsToday = await prisma.studyCard.count({
			where: {
				userId: user.id,
				createdAt: { gte: startOfDay },
				state: 0,
			},
		});

		if (newCardsToday >= limitNewCards) {
			return queue;
		}

		const remainingNew = limitNewCards - newCardsToday;
		const newToFetch = Math.min(needed, remainingNew);

		if (newToFetch <= 0) return queue;

		// Fetch New Vocab Candidates
		// Note: This logic is tricky for "queueing" multiple NEW cards because we need to Enroll them to avoid creating duplicates.
		// We WILL create them now.

		for (let i = 0; i < newToFetch; i++) {
			// Find 1 new candidate (Vocab or Kanji)
			// Logic copied from getNextReviewCard but slightly optimized to just create one by one to ensure uniqueness/correct state
			// Ideally we findMany, but JIT logic checks `studyCards: { none: ... }` which is robust.

			// Vocab?
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const vocabWhere: any = {
				deck: { OR: [{ isPublic: true }, { authorId: user.id }] },
				studyCards: { none: { userId: user.id } },
			};
			if (deckIdOrIds) {
				if (Array.isArray(deckIdOrIds)) vocabWhere.deckId = { in: deckIdOrIds };
				else vocabWhere.deckId = deckIdOrIds;
			}

			const newVocab = await prisma.vocab.findFirst({
				where: vocabWhere,
				orderBy: { createdAt: 'asc' },
			});

			if (newVocab) {
				const newCard = await prisma.studyCard.create({
					data: { userId: user.id, vocabId: newVocab.id, due: new Date(), state: 0 },
					include: {
						vocab: { include: { _count: { select: { cardComments: true } } } },
						kanji: { include: { _count: { select: { cardComments: true } } } },
					},
				});
				queue.push(newCard);
				continue;
			}

			// Kanji?
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const kanjiWhere: any = {
				deck: { OR: [{ isPublic: true }, { authorId: user.id }] },
				studyCards: { none: { userId: user.id } },
			};
			if (deckIdOrIds) {
				if (Array.isArray(deckIdOrIds)) kanjiWhere.deckId = { in: deckIdOrIds };
				else kanjiWhere.deckId = deckIdOrIds;
			}

			const newKanji = await prisma.kanji.findFirst({
				where: kanjiWhere,
				orderBy: { createdAt: 'asc' },
			});

			if (newKanji) {
				const newCard = await prisma.studyCard.create({
					data: { userId: user.id, kanjiId: newKanji.id, due: new Date(), state: 0 },
					include: {
						vocab: { include: { _count: { select: { cardComments: true } } } },
						kanji: { include: { _count: { select: { cardComments: true } } } },
					},
				});
				queue.push(newCard);
				continue;
			}

			// No more content
			break;
		}

		return queue;
	} catch (error) {
		console.error('Error fetching review queue:', error);
		return [];
	}
}

/**
 * Convert Prisma StudyCard to FSRS Card object
 */
function toFsrsCard(studyCard: StudyCard): Card {
	return {
		due: studyCard.due,
		stability: studyCard.stability,
		difficulty: studyCard.difficulty,
		elapsed_days: studyCard.elapsedDays,
		scheduled_days: studyCard.scheduledDays,
		reps: studyCard.reps,
		lapses: studyCard.lapses,
		state: studyCard.state as State,
		last_review: studyCard.lastReview || undefined,
		learning_steps: 0,
	};
}

/**
 * Submit a review for a card using FSRS algorithm
 * Validates ownership
 */
/**
 * Submit a review for a card using FSRS algorithm
 * Validates ownership
 */
export async function submitReview(
	cardId: string,
	rating: number,
	deckIdOrIds?: string | string[],
): Promise<{ success: boolean; nextCard?: StudyCardWithDetails | null; error?: string }> {
	try {
		const validation = SubmitReviewSchema.safeParse({ cardId, rating, deckIdOrIds });
		if (!validation.success) {
			return { success: false, error: 'Invalid input data' };
		}

		const user = await getUser();
		if (!user) return { success: false, error: 'Unauthorized' };

		// 1. Fetch current card (ensure owned by user)
		const studyCard = await prisma.studyCard.findUnique({
			where: {
				id: cardId,
				userId: user.id, // Security check
			},
			include: {
				vocab: true,
				kanji: true,
			},
		});

		if (!studyCard) {
			return { success: false, error: 'Card not found or unauthorized' };
		}

		// 2. Validate Rating
		if (![1, 2, 3, 4].includes(rating)) {
			return { success: false, error: 'Invalid rating' };
		}
		const fsrsRating = rating as Rating;

		// 3. FSRS Calculation
		const currentCard = toFsrsCard(studyCard);
		const now = new Date();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const schedulingCards: any = f.repeat(currentCard, now);

		// Use type assertion or check existence to satisfy TS
		const recordLog = schedulingCards[fsrsRating];
		if (!recordLog) {
			throw new Error('Failed to calculate schedule for rating');
		}
		const { card: newCard, log: reviewLog } = recordLog;

		// 4. Update Database
		await prisma.studyCard.update({
			where: { id: cardId },
			data: {
				due: newCard.due,
				stability: newCard.stability,
				difficulty: newCard.difficulty,
				elapsedDays: newCard.elapsed_days,
				scheduledDays: newCard.scheduled_days,
				reps: newCard.reps,
				lapses: newCard.lapses,
				state: newCard.state,
				lastReview: newCard.last_review,
			},
		});

		// Create Review Log with userId
		await prisma.reviewLog.create({
			data: {
				cardId: cardId,
				rating: reviewLog.rating,
				review: reviewLog.review,
				scheduledDays: reviewLog.scheduled_days,
				elapsedDays: reviewLog.elapsed_days,
				state: reviewLog.state,
				userId: user.id,
			},
		});

		console.log(
			`Reviewed Card ${cardId} by User ${user.id}: Rating ${rating} -> Due ${newCard.due.toISOString()}`,
		);

		// 5. Update Streak (Fire and forget, or await?)
		// Await to ensure UI sees fresh data if it re-fetches immediately
		await recalculateUserStreak(user.id);

		// 6. Fetch next card (maintaining deck context if present)
		const nextCard = await getNextReviewCard(deckIdOrIds);

		return { success: true, nextCard };
	} catch (error) {
		console.error('Error submitting review:', error);
		return { success: false, error: 'Failed to submit review' };
	}
}

/**
 * Fetch all decks visible to the user (Public + Created by User)
 */

export async function getLeaderboard() {
	try {
		const users = await prisma.user.findMany({
			take: 10,
			orderBy: {
				currentStreak: 'desc',
			},
			select: {
				id: true,
				name: true,
				currentStreak: true,
				avatarUrl: true,
			},
		});

		// Ensure we handle display names
		return users.map((u) => ({
			...u,
			name: u.name || 'Anonymous Learner',
			avatarUrl: u.avatarUrl,
		}));
	} catch (error) {
		console.error('Error fetching leaderboard:', error);
		return [];
	}
}

/**
 * Get all decks accessible to the current user (public + owned).
 * Decks are sorted by sortOrder (if set), then by createdAt (newest first).
 */
// getDecks moved to @/modules/deck/deck.actions.ts
// updateUserAvatar moved to @/modules/user/user.actions.ts
export { getDecks, updateUserAvatar };

/**
 * Get count of cards due for review
 */

export const getReviewCount = cache(async (userId?: string) => {
	try {
		if (userId && !IdSchema.safeParse(userId).success) return 0;

		let uid = userId;
		if (!uid) {
			const user = await getUser();
			if (!user) return 0;
			uid = user.id;
		}

		const count = await prisma.studyCard.count({
			where: {
				userId: uid,
				due: {
					lte: new Date(),
				},
			},
		});
		return count;
	} catch (error) {
		console.error('Error fetching review count:', error);
		return 0;
	}
});

/**
 * Get user statistics (Streak, Total Reviews)
 */
export const getUserStats = cache(async (userId?: string) => {
	try {
		if (userId && !IdSchema.safeParse(userId).success) return { streak: 0, totalReviewed: 0 };

		let uid = userId;
		if (!uid) {
			const user = await getUser();
			if (!user) return { streak: 0, totalReviewed: 0 };
			uid = user.id;
		}

		// Simple Today's Review Count
		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);

		const todaysReviews = await prisma.reviewLog.count({
			where: {
				userId: uid,
				review: {
					gte: startOfDay,
				},
			},
		});

		// Calculate/Sync Streak
		// This ensures that if they missed a day since last login, it resets.
		const currentStreak = await recalculateUserStreak(uid);

		return {
			streak: currentStreak,
			totalReviewed: todaysReviews,
		};
	} catch (error) {
		console.error('Error fetching stats:', error);
		return { streak: 0, totalReviewed: 0 };
	}
});

/**
 * Mark a tutorial step/flow as completed
 * Stores in the `preferences.tutorials` JSON structure
 */
// completeTutorial and getCompletedTutorials moved to @/modules/user/user.actions.ts
export { completeTutorial, getCompletedTutorials };

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
			orderBy: { review: 'desc' },
			include: {
				card: {
					include: {
						vocab: { select: { deckId: true } },
						kanji: { select: { deckId: true } },
					},
				},
			},
		});

		if (lastReview && lastReview.card) {
			// Resolve deckId (prefer vocab, then kanji)
			const deckId = lastReview.card.vocab?.deckId || lastReview.card.kanji?.deckId;
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

/**
 * Recalculate and update the user's current streak
 * Logic: Consecutive days ending Today OR Yesterday.
 */
// recalculateUserStreak moved to @/modules/user/user.actions.ts
export { recalculateUserStreak };

/**
 * Fetch a single deck by ID with vocab
 */
// getDeck moved to @/modules/deck/deck.actions.ts
export { getDeck };

export const getAllVocab = getAllVocabulary;
export const getAllKanji = getAllVocabulary;

/**
 * Get weekly review stats for the chart (last 7 days)
 */
export const getWeeklyStats = cache(async (userId?: string) => {
	try {
		if (userId && !IdSchema.safeParse(userId).success) return null;

		let uid = userId;
		if (!uid) {
			const user = await getUser();
			if (!user) return null;
			uid = user.id;
		}

		const days: { day: string; date: Date; count: number; isToday: boolean }[] = [];
		const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Optimize: Fetch all logs for the date range in one query
		const rangeStart = new Date(today);
		rangeStart.setDate(today.getDate() - 6);
		rangeStart.setHours(0, 0, 0, 0);

		const rangeEnd = new Date(today);
		rangeEnd.setHours(23, 59, 59, 999);

		const logs = await prisma.reviewLog.findMany({
			where: {
				userId: uid,
				review: {
					gte: rangeStart,
					lte: rangeEnd,
				},
			},
			select: {
				review: true,
			},
		});

		// Aggregate logs by day string (YYYY-MM-DD or similar to match loop logic)
		const countsByDay: Record<string, number> = {};
		logs.forEach((log) => {
			// Get local date string relative to user? Or just Use server time as basis same as before
			// The original loop constructed dates based on server 'today'.
			// We should match that.
			const d = new Date(log.review);
			// We need to bucket them by "Day Index" relative to today, or just Date String.
			// Let's use toDateString() as key which is "Thu Dec 14 2023"
			const key = d.toDateString();
			countsByDay[key] = (countsByDay[key] || 0) + 1;
		});

		// Reconstruct the array
		for (let i = 6; i >= 0; i--) {
			const date = new Date(today);
			date.setDate(today.getDate() - i);
			const dayLabel = dayNames[date.getDay()];
			const key = date.toDateString();

			days.push({
				day: dayLabel,
				date,
				count: countsByDay[key] || 0,
				isToday: i === 0,
			});
		}

		const thisWeekTotal = days.reduce((sum, d) => sum + d.count, 0);
		const bestDay = days.reduce((best, d) => (d.count > best.count ? d : best), days[0]);

		return {
			days: days.map((d) => ({ day: d.day, count: d.count, isToday: d.isToday })),
			thisWeekTotal,
			bestDay: { day: bestDay.day, count: bestDay.count },
		};
	} catch (error) {
		console.error('Error fetching weekly stats:', error);
		return null;
	}
});

/**
 * Get decks with due counts for dashboard
 */
export const getDecksWithDue = cache(async (userId?: string) => {
	try {
		if (userId && !IdSchema.safeParse(userId).success) return [];

		let uid = userId;
		if (!uid) {
			const user = await getUser();
			if (!user) return [];
			uid = user.id;
		}

		const decks = await prisma.deck.findMany({
			where: {
				OR: [{ isPublic: true }, { authorId: uid }],
			},
			include: {
				_count: {
					select: { vocabularies: true },
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		// Get due counts for each deck
		const decksWithDue = await Promise.all(
			decks.map(async (deck) => {
				const dueCount = await prisma.studyCard.count({
					where: {
						userId: uid,
						due: { lte: new Date() },
						OR: [{ vocab: { deckId: deck.id } }, { kanji: { deckId: deck.id } }],
					},
				});

				return {
					id: deck.id,
					title: deck.title,
					cardCount: deck._count.vocab + deck._count.kanji,
					dueCount,
				};
			}),
		);

		return decksWithDue;
	} catch (error) {
		console.error('Error fetching decks with due:', error);
		return [];
	}
});

/**
 * Fetch User Settings (Limits and Preferences)
 */
// User settings actions moved to @/modules/user/user.actions.ts
export { getUserSettings, updateUserSettings };

/**
 * Get dashboard data (combined call for efficiency)
 */
export async function getDashboardData() {
	try {
		const user = await getUser();
		if (!user) return null;

		const [reviewCount, stats, weeklyStats, decksWithDue, userSettings] = await Promise.all([
			getReviewCount(user.id),
			getUserStats(user.id),
			getWeeklyStats(user.id),
			getDecksWithDue(user.id),
			getUserSettings(user.id),
		]);

		let userName: string | null = null;
		if (user) {
			const dbUser = await prisma.user.findUnique({
				where: { id: user.id },
				select: { name: true },
			});
			userName = dbUser?.name ?? null;
		}

		return {
			reviewCount,
			stats,
			weeklyStats,
			decksWithDue,
			userSettings,
			userName,
		};
	} catch (error) {
		console.error('Error fetching dashboard data:', error);
		return null;
	}
}

// --- Admin & Roles ---

/**
 * Get current user with role
 */
export const getUserWithRole = cache(async () => {
	const user = await getUser();
	if (!user) return null;

	const dbUser = await prisma.user.findUnique({
		where: { id: user.id },
		select: { id: true, name: true, email: true, role: true },
	});
	return dbUser;
});

// getAdminStats moved to @/modules/admin/admin.actions.ts

// getAllUsers moved to @/modules/admin/admin.actions.ts

// updateUserRole moved to @/modules/admin/admin.actions.ts

// Report actions moved to @/modules/admin/admin.actions.ts
export * from '@/modules/admin/admin.actions';

export async function updateVocab(id: string, data: any) {
	return updateContent({ id, data });
}

export async function updateKanji(id: string, data: any) {
	return updateContent({ id, data });
}
