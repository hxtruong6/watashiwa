'use server';

import { prisma } from '@/lib/db';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { StudyCard, Vocab, Kanji, User, UserRole, ReportStatus, ReportType } from '@prisma/client';

import { requireRole, hasRole } from '@/lib/auth/roleGuard';
import { Card, fsrs, generatorParameters, Rating, State } from 'ts-fsrs';

// Initialize FSRS with default parameters
const params = generatorParameters({ enable_fuzz: true });
const f = fsrs(params);

import { z } from 'zod';

// --- Zod Schemas ---

const IdSchema = z.string().min(1);
const DeckIdOrIdsSchema = z.union([z.string(), z.array(z.string())]).optional();

const SubmitReviewSchema = z.object({
	cardId: IdSchema,
	rating: z.number().int().min(1).max(4),
	deckIdOrIds: DeckIdOrIdsSchema,
});

const UpdateAvatarSchema = z.object({
	avatarUrl: z.string().url(),
});

const UserSettingsSchema = z.object({
	limitNewCards: z.number().int().min(0).optional(),
	limitReviews: z.number().int().min(0).optional(),
	allowSpaceKey: z.boolean().optional(),
	spaceKeyRating: z.number().int().min(1).max(4).optional(),
	autoShowAnswer: z.boolean().optional(),
	autoShowAnswerDelay: z.number().int().min(0).optional(),
	timezone: z.string().optional(),
});

const ReportSchema = z
	.object({
		vocabId: z.string().optional(),
		kanjiId: z.string().optional(),
		type: z.nativeEnum(ReportType),
		field: z.string().optional(),
		currentValue: z.string().optional(),
		suggestedValue: z.string().optional(),
		notes: z.string().optional(),
	})
	.refine((data) => data.vocabId || data.kanjiId, {
		message: 'Must specify a Vocab or Kanji ID',
		path: ['vocabId'],
	});

const ResolveReportSchema = z.object({
	reportId: IdSchema,
	action: z.enum(['ACCEPT', 'REJECT']),
	resolutionStr: z.string().optional(),
});

const UpdateVocabSchema = z.object({
	wordSurface: z.string().min(1).optional(),
	readingKana: z.string().min(1).optional(),
	meaning: z.string().min(1).optional(),
	exampleSentence: z.any().optional(),
	wordParts: z.any().optional(),
});

const UpdateKanjiSchema = z.object({
	kanji: z.string().min(1).optional(),
	onyomi: z.string().optional(),
	kunyomi: z.string().optional(),
	meaning: z.string().optional(),
	examples: z.any().optional(),
});

export type StudyCardWithDetails = StudyCard & {
	vocab?: Vocab | null;
	kanji?: Kanji | null;
};

import { cache } from 'react';

/**
 * Helper to get current authenticated user
 * Wrapped in React `cache` to ensure we only hit Supabase Auth once per request
 * even if this is called multiple times by Layout, Page, and Components.
 */
export const getUser = cache(async () => {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		return null;
	}

	return user;
});

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

export async function getDecks() {
	try {
		const user = await getUser();
		if (!user) return [];

		const decks = await prisma.deck.findMany({
			where: {
				OR: [{ isPublic: true }, { authorId: user.id }],
			},
			include: {
				_count: {
					select: { vocab: true, kanji: true },
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
		return decks;
	} catch (error) {
		console.error('Error fetching decks:', error);
		return [];
	}
}

/**
 * Ensure Supabase user exists in Prisma DB
 * Called from auth callbacks or ensures consistency
 */
export async function syncUser() {
	try {
		const user = await getUser();
		if (!user) return { success: false, error: 'No authenticated user' };

		// Upsert user to ensure they exist
		await prisma.user.upsert({
			where: { id: user.id },
			update: {
				email: user.email!,
				updatedAt: new Date(),
				avatarUrl: user.user_metadata?.avatar_url,
			},
			create: {
				id: user.id,
				email: user.email!,
				name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
				avatarUrl: user.user_metadata?.avatar_url,
			},
		});

		return { success: true };
	} catch (error) {
		console.error('Error syncing user:', error);
		return { success: false, error: 'Failed to sync user' };
	}
}

export async function updateUserAvatar(avatarUrl: string) {
	try {
		const validation = UpdateAvatarSchema.safeParse({ avatarUrl });
		if (!validation.success) {
			return { success: false, error: 'Invalid avatar URL' };
		}

		const user = await getUser();
		if (!user) return { success: false, error: 'Unauthorized' };

		await prisma.user.update({
			where: { id: user.id },
			data: { avatarUrl },
		});

		// Also update Supabase metadata if possible?
		// Supabase Auth metadata is separate, but we primarily use it for initial sync.
		// For now, we rely on our App's User table for the displayed avatar if we switch to using it.
		// However, NavBar uses `user?.user_metadata?.avatar_url`.
		// We might need to update Supabase User Metadata OR change NavBar to use Prisma User.
		// Given time constraints, updating Prisma User is robust.
		// But NavBar fetches `getUser()` which returns Supabase User.
		// We should probably update Supabase too.

		const supabase = await createClient();
		const { error } = await supabase.auth.updateUser({
			data: { avatar_url: avatarUrl },
		});

		if (error) {
			console.error('Error updating supabase user metadata:', error);
			// Continue, as we updated Prisma
		}

		revalidatePath('/');
		return { success: true };
	} catch (error) {
		console.error('Error updating avatar:', error);
		return { success: false, error: 'Failed to update avatar' };
	}
}

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
 * Recalculate and update the user's current streak
 * Logic: Consecutive days ending Today OR Yesterday.
 */
export async function recalculateUserStreak(userId: string) {
	try {
		if (!IdSchema.safeParse(userId).success) return 0;

		// Fetch all review dates for the user
		// Optimization: We could limit to last 365 days or something if logs get huge
		const logs = await prisma.reviewLog.findMany({
			where: { userId },
			select: { review: true },
			orderBy: { review: 'desc' },
		});

		if (logs.length === 0) {
			await prisma.user.update({ where: { id: userId }, data: { currentStreak: 0 } });
			return 0;
		}

		// Normalize to YYYY-MM-DD Set
		// Use user's local time?
		// "Streak" is typically based on the user's perceived "Days".
		// Ideally we use the user's timezone. For now, we'll use Server Time/UTC to be consistent with 'startOfDay' used elsewhere.
		// If we want to be perfect, we should store timezone in User settings (which we added!).
		// For now, let's assume default/UTC to keep it simple and consistent with other actions.
		const uniqueDates = new Set<string>();
		logs.forEach((log) => {
			uniqueDates.add(log.review.toISOString().split('T')[0]); // YYYY-MM-DD
		});

		const today = new Date();
		const todayStr = today.toISOString().split('T')[0];

		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);

		let streak = 0;

		// Check Today
		if (uniqueDates.has(todayStr)) {
			streak++;
		}

		// Walk backwards from Yesterday
		const currentCheck = new Date(yesterday);
		while (true) {
			const checkStr = currentCheck.toISOString().split('T')[0];
			if (uniqueDates.has(checkStr)) {
				streak++;
				currentCheck.setDate(currentCheck.getDate() - 1);
			} else {
				// If today is NOT present, we MUST have Yesterday to keep the streak alive.
				// If we have Today (streak=1), and misses Yesterday -> Streak is 1.
				if (streak === 0) {
					// We didn't have today, and we don't have this check (yesterday).
					// Streak is broken/zero.
					break;
				} else {
					// We had some streak (maybe just Today), but hit a gap.
					// However, if we didn't have Today, we already checked Yesterday effectively here.
					// Wait, the logic: "If Today is missing, Streak continues from Yesterday".
					// If Today is present, Streak continues from Yesterday.
					// So actually we ALWAYS check backwards from Yesterday.
					// BUT, if Today is missing AND Yesterday is missing, the loop breaks instantly at Yesterday.
					break;
				}
			}
		}

		// Update User
		await prisma.user.update({
			where: { id: userId },
			data: { currentStreak: streak },
		});

		return streak;
	} catch (error) {
		console.error('Error recalculating streak:', error);
		return 0;
	}
}

/**
 * Fetch a single deck by ID with vocab
 */
export async function getDeck(id: string) {
	try {
		if (!IdSchema.safeParse(id).success) return null;

		const user = await getUser();
		if (!user) return null;

		const deck = await prisma.deck.findFirst({
			where: {
				id,
				OR: [{ isPublic: true }, { authorId: user.id }],
			},
			include: {
				vocab: {
					orderBy: { createdAt: 'desc' },
					include: {
						_count: {
							select: { cardComments: true },
						},
					},
				},
				kanji: {
					orderBy: { createdAt: 'desc' },
					include: {
						_count: {
							select: { cardComments: true },
						},
					},
				},
				_count: {
					select: { vocab: true, kanji: true },
				},
			},
		});

		if (!deck) return null;

		// Calculate Stats for User
		const studyCards = await prisma.studyCard.findMany({
			where: {
				userId: user.id,
				OR: [{ vocab: { deckId: id } }, { kanji: { deckId: id } }],
			},
			select: { state: true },
		});

		const stats = {
			total: deck._count.vocab + deck._count.kanji,
			started: studyCards.length,
			new: studyCards.filter((c) => c.state === 0).length,
			learning: studyCards.filter((c) => c.state === 1 || c.state === 3).length,
			review: studyCards.filter((c) => c.state === 2).length,
			unseen: deck._count.vocab + deck._count.kanji - studyCards.length,
		};

		return { ...deck, stats };
	} catch (error) {
		console.error('Error fetching deck:', error);
		return null;
	}
}

/**
 * Fetch all Vocabulary for the current user (from all decks user has access to)
 */
export async function getAllVocab() {
	try {
		const user = await getUser();
		if (!user) return [];

		// For now fetching ALL. In production, need pagination.
		const vocab = await prisma.vocab.findMany({
			where: {
				deck: {
					OR: [{ isPublic: true }, { authorId: user.id }],
				},
			},
			include: {
				deck: true,
				studyCards: {
					where: { userId: user.id },
					select: { state: true, due: true },
				},
			},
			orderBy: { createdAt: 'desc' },
		});
		return vocab;
	} catch (error) {
		console.error('Error fetching all vocab:', error);
		return [];
	}
}

/**
 * Fetch all Kanji for the current user
 */
export async function getAllKanji() {
	try {
		const user = await getUser();
		if (!user) return [];

		const kanji = await prisma.kanji.findMany({
			where: {
				deck: {
					OR: [{ isPublic: true }, { authorId: user.id }],
				},
			},
			include: {
				deck: true,
				studyCards: {
					where: { userId: user.id },
					select: { state: true, due: true },
				},
			},
			orderBy: { createdAt: 'desc' },
		});
		return kanji;
	} catch (error) {
		console.error('Error fetching all kanji:', error);
		return [];
	}
}

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
					select: { vocab: true, kanji: true },
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
export const getUserSettings = cache(async (userId?: string) => {
	try {
		if (userId && !IdSchema.safeParse(userId).success) return null;

		let uid = userId;
		if (!uid) {
			const user = await getUser();
			if (!user) return null;
			uid = user.id;
		}

		const settings = await prisma.user.findUnique({
			where: { id: uid },
			select: {
				limitNewCards: true,
				limitReviews: true,
				allowSpaceKey: true,
				spaceKeyRating: true,
				autoShowAnswer: true,
				autoShowAnswerDelay: true,
			},
		});

		return settings;
	} catch (error) {
		console.error('Error fetching user settings:', error);
		return null;
	}
});
/**
 * Helper: Get Start of Day in User's Timezone (returned as UTC Date object)
 * e.g. If User is Tokyo (UTC+9), and it's 10am Tokyo, Start of Day is 00:00 Tokyo.
 * We need the UTC equivalent of 00:00 Tokyo, which is 15:00 UTC Previous Day.
 */
export const getStartOfDayInTimezone = cache((timezone: string = 'UTC'): Date => {
	try {
		const now = new Date();
		// Get date string in user's timezone: "MM/DD/YYYY"
		const formatter = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
		});
		const parts = formatter.formatToParts(now);
		const month = parts.find((p) => p.type === 'month')?.value;
		const day = parts.find((p) => p.type === 'day')?.value;
		const year = parts.find((p) => p.type === 'year')?.value;

		if (!month || !day || !year) throw new Error('Invalid date parts');

		// Create a string "YYYY-MM-DD"
		// We want to find the UTC time that corresponds to this local time.
		// There isn't a direct "Date.from(string, timezone)" in stdlib.
		// WORKAROUND:
		// 1. Create a date assuming UTC: Date.UTC(year, month-1, day) -> Timestamp for 00:00 UTC.
		// 2. Adjust by the offset of that timezone? No, offset changes (DST).
		// 3. Iterative approach or library is best.
		// Since we want to be safe, let's assume 'UTC' if complex.
		// ACTUALLY, simpler:
		// We can use the string to CREATE a date object, but we need to know the offset.
		// Let's postpone complex date math and use a simplified version:
		// If we create "YYYY-MM-DD" string and append the offset? No we don't know the offset easily.

		// Fallback: Just use UTC for now to unblock, because native JS Timezone math is hell without `date-fns-tz`.
		// User specifically asked for it. I will try to use the `toLocaleString` trick to approximate.

		// Or try to parse offset from `longOffset`? "GMT+09:00".
		const offsetStr = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			timeZoneName: 'longOffset',
		}).format(now);
		// Example: "12/12/2023, GMT+09:00"
		const match = offsetStr.match(/GMT([+-]\d{2}:\d{2})/);
		if (match) {
			const offset = match[1];
			const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00${offset}`;
			return new Date(iso);
		}

		return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
	} catch (e) {
		console.warn('Timezone calculation failed, falling back to UTC', e);
		const d = new Date();
		d.setUTCHours(0, 0, 0, 0);
		return d;
	}
});

/**
 * Get daily progress stats for the user
 */
export const getDailyProgress = cache(async () => {
	try {
		const user = await getUser();
		if (!user) return null;

		// 1. Get Limits & Timezone
		const userConfig = await prisma.user.findUnique({
			where: { id: user.id },
			select: { limitReviews: true, limitNewCards: true, timezone: true },
		});
		const limitReviews = userConfig?.limitReviews ?? 200;
		const limitNewCards = userConfig?.limitNewCards ?? 20;
		const timezone = userConfig?.timezone ?? 'UTC';

		// 2. Get Today's Counts (Timezone Aware)
		const startOfDay = getStartOfDayInTimezone(timezone);

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
				state: 0,
			},
		});

		// 3. Get Due Count
		const dueCount = await prisma.studyCard.count({
			where: {
				userId: user.id,
				due: { lte: new Date() },
			},
		});

		return {
			reviewsToday,
			limitReviews,
			newCardsToday,
			limitNewCards,
			dueCount,
		};
	} catch (error) {
		console.error('Error fetching daily progress:', error);
		return null;
	}
});

/**
 * Update User Settings
 */
export async function updateUserSettings(data: Partial<User>) {
	try {
		const validation = UserSettingsSchema.safeParse(data);
		if (!validation.success) {
			return { success: false, error: 'Invalid settings data' };
		}

		const user = await getUser();
		if (!user) return { success: false, error: 'Unauthorized' };

		// update
		await prisma.user.update({
			where: { id: user.id },
			data: {
				limitNewCards: data.limitNewCards,
				limitReviews: data.limitReviews,
				allowSpaceKey: data.allowSpaceKey,
				spaceKeyRating: data.spaceKeyRating,
				autoShowAnswer: data.autoShowAnswer,
				autoShowAnswerDelay: data.autoShowAnswerDelay,
				timezone: data.timezone,
				updatedAt: new Date(),
			},
		});

		return { success: true };
	} catch (error) {
		console.error('Error updating user settings:', error);
		return { success: false, error: 'Failed to update settings' };
	}
}

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

/**
 * Get stats for Admin Dashboard
 * Requires MODERATOR or higher
 */
export async function getAdminStats() {
	try {
		const currentUser = await getUserWithRole();
		requireRole(currentUser?.role, UserRole.MODERATOR);

		const [userCount, reviewCount, activeToday] = await Promise.all([
			prisma.user.count(),
			prisma.reviewLog.count(),
			prisma.user.count({
				where: {
					OR: [
						{ lastLogin: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
						{ updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
					],
				},
			}),
		]);

		return { userCount, reviewCount, activeToday };
	} catch (error) {
		console.error('Admin stats error:', error);
		throw error; // Let UI handle it
	}
}

/**
 * Get all users for management
 * Requires ADMIN
 */
export async function getAllUsers() {
	try {
		const currentUser = await getUserWithRole();
		requireRole(currentUser?.role, UserRole.ADMIN);

		// Limit to 100 for now
		return await prisma.user.findMany({
			take: 100,
			orderBy: { createdAt: 'desc' },
		});
	} catch (error) {
		console.error('Get users error:', error);
		return [];
	}
}

/**
 * Update a user's role
 * Requires ADMIN
 */
export async function updateUserRole(targetUserId: string, newRole: UserRole) {
	try {
		if (!IdSchema.safeParse(targetUserId).success)
			return { success: false, error: 'Invalid User ID' };

		const currentUser = await getUserWithRole();
		requireRole(currentUser?.role, UserRole.ADMIN);

		const updatedUser = await prisma.user.update({
			where: { id: targetUserId },
			data: { role: newRole },
		});
		return { success: true, data: updatedUser };
	} catch (error) {
		console.error('Error updating user role:', error);
		return { success: false, error: 'Failed to update user role' };
	}
}

// --- Card Reporting Actions ---

export async function submitReport(data: {
	vocabId?: string;
	kanjiId?: string;
	type: ReportType;
	field?: string;
	currentValue?: string;
	suggestedValue?: string;
	notes?: string;
}) {
	try {
		const validation = ReportSchema.safeParse(data);
		if (!validation.success) {
			return { success: false, error: validation.error.issues[0].message };
		}

		const user = await getUser();
		if (!user) return { success: false, error: 'Unauthorized' };

		// Basic Validation: Must define what is reported
		if (!data.vocabId && !data.kanjiId) {
			return { success: false, error: 'Must specify a Vocab or Kanji ID' };
		}

		await prisma.cardReport.create({
			data: {
				reporterId: user.id,
				vocabId: data.vocabId,
				kanjiId: data.kanjiId,
				type: data.type,
				field: data.field,
				currentValue: data.currentValue,
				suggestedValue: data.suggestedValue,
				notes: data.notes,
			},
		});

		return { success: true };
	} catch (error) {
		console.error('Error submitting report:', error);
		return { success: false, error: 'Failed to submit report' };
	}
}

export async function getReports(limit: number = 50, status: ReportStatus = ReportStatus.PENDING) {
	try {
		const user = await getUserWithRole();
		if (!user || user.role === UserRole.USER) {
			return { success: false, error: 'Unauthorized' };
		}

		const reports = await prisma.cardReport.findMany({
			where: { status },
			take: limit,
			orderBy: { createdAt: 'desc' },
			include: {
				reporter: { select: { name: true, email: true } },
				vocab: true, // Fetch full vocab details
				kanji: true, // Fetch full kanji details
			},
		});
		return { success: true, data: reports };
	} catch (error) {
		console.error('Error fetching reports:', error);
		return { success: false, error: 'Failed to fetch reports' };
	}
}

export async function resolveReport(
	reportId: string,
	action: 'ACCEPT' | 'REJECT',
	resolutionStr?: string,
) {
	try {
		const validation = ResolveReportSchema.safeParse({ reportId, action, resolutionStr });
		if (!validation.success) {
			return { success: false, error: 'Invalid resolution data' };
		}

		const currentUser = await getUserWithRole();
		if (!currentUser || !hasRole(currentUser.role, UserRole.MODERATOR)) {
			return { success: false, error: 'Unauthorized' };
		}

		const status = action === 'ACCEPT' ? ReportStatus.ACCEPTED : ReportStatus.REJECTED;

		const updated = await prisma.cardReport.update({
			where: { id: reportId },
			data: {
				status,
				resolution: resolutionStr,
				resolvedById: currentUser.id,
				resolvedAt: new Date(),
			},
		});

		// Logic for points could go here (e.g. if ACCEPT => awarding points to reporter)
		if (status === ReportStatus.ACCEPTED) {
			// Placeholder: await awardPoints(updated.reporterId, 5);
			console.log(`Accepted report ${reportId}, would award points to ${updated.reporterId}`);
		}

		return { success: true };
	} catch (error) {
		console.error('Error resolving report:', error);
		return { success: false, error: 'Failed to resolve report' };
	}
}

export async function updateVocab(id: string, data: Partial<Vocab>) {
	try {
		if (!IdSchema.safeParse(id).success) return { success: false, error: 'Invalid ID' };
		const validation = UpdateVocabSchema.safeParse(data);
		if (!validation.success) return { success: false, error: 'Invalid data' };

		const user = await getUserWithRole();
		if (!user || !hasRole(user.role, UserRole.MODERATOR)) {
			return { success: false, error: 'Unauthorized' };
		}

		await prisma.vocab.update({
			where: { id },
			data: {
				wordSurface: data.wordSurface,
				readingKana: data.readingKana,
				meaning: data.meaning,
				exampleSentence: data.exampleSentence as any,
				wordParts: data.wordParts as any,
			},
		});
		return { success: true };
	} catch (error) {
		console.error('Error updating vocab:', error);
		return { success: false, error: 'Failed to update vocab' };
	}
}

export async function updateKanji(id: string, data: Partial<Kanji>) {
	try {
		if (!IdSchema.safeParse(id).success) return { success: false, error: 'Invalid ID' };
		const validation = UpdateKanjiSchema.safeParse(data);
		if (!validation.success) return { success: false, error: 'Invalid data' };

		const user = await getUserWithRole();
		if (!user || !hasRole(user.role, UserRole.MODERATOR)) {
			return { success: false, error: 'Unauthorized' };
		}

		await prisma.kanji.update({
			where: { id },
			data: {
				kanji: data.kanji,
				onyomi: data.onyomi,
				kunyomi: data.kunyomi,
				meaning: data.meaning,
				examples: data.examples as any,
			},
		});
		return { success: true };
	} catch (error) {
		console.error('Error updating kanji:', error);
		return { success: false, error: 'Failed to update kanji' };
	}
}
