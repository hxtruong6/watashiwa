'use server';

import { prisma } from '@/lib/db';
// getAdminStats moved to @/modules/admin/admin.actions.ts

// getAllUsers moved to @/modules/admin/admin.actions.ts

// updateUserRole moved to @/modules/admin/admin.actions.ts

// Report actions moved to @/modules/admin/admin.actions.ts
// Report actions moved to @/modules/admin/admin.actions.ts
import {
	getAdminStats,
	getAllUsers,
	getReports,
	resolveReport,
	submitReport as submitReportAdmin,
	updateUserRole,
} from '@/modules/admin/admin.actions';
import { getUser } from '@/modules/auth/auth.actions';
import { getDeck, getDecks } from '@/modules/deck/deck.actions';
/**
 * Get the next card due for review for the CURRENT user
 * Optional: Constrain to specific deck
 */
/**
 * Get the next card due for review for the CURRENT user
 * Optional: Constrain to specific deck or LIST of decks (for Courses)
 */
// -----------------------------------------------------------------------------
// REFACTOR: Study Functions (Delegating to @/modules/study/study.actions)
// -----------------------------------------------------------------------------

import {
	getDailyProgress as getDailyProgressAction,
	getNextReviewCard as getNextReviewCardAction,
	getReviewCount as getReviewCountAction,
	getReviewQueue as getReviewQueueAction,
	submitReview as submitReviewAction,
} from '@/modules/study/study.actions';
// getUser moved to @/modules/auth/auth.actions
import {
	getUserSettings as _getUserSettings,
	recalculateUserStreak as _recalculateUserStreak,
	completeTutorial,
	getCompletedTutorials,
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
import { z } from 'zod';

// Initialize FSRS with default parameters

// --- Zod Schemas ---

const IdSchema = z.string().min(1);
const DeckIdOrIdsSchema = z.union([z.string(), z.array(z.string())]).optional();

// SubmitReviewSchema removed - moved to @/modules/study/study.dto.ts

// Update schemas removed, logic moved to @/modules/vocabulary/vocabulary.actions.ts

export type StudyCardWithDetails = UserReview & {
	vocab?: (Vocabulary & { _count?: { cardComments: number } }) | null;
};

export async function getNextReviewCard(deckIdOrIds?: string | string[]) {
	const result = await getNextReviewCardAction({ deckIdOrIds });
	if (!result.success || !result.data) return null;
	return result.data;
}

/**
 * Get a queue of cards for review (Smart Queue / Prefetching)
 * Fetches multiple cards to allow client-side buffering.
 */
export async function getReviewQueue(deckIdOrIds?: string | string[], limit?: number) {
	const result = await getReviewQueueAction({ deckIdOrIds, limit });
	if (!result.success || !result.data) return [];
	return result.data;
}

/**
 * Submit a review for a card using FSRS algorithm
 * Validates ownership
 */
/**
 * Submit a review for a card using FSRS algorithm
 * Validates ownership
 */
export async function submitReview(data: {
	cardId: string;
	rating: number; // 1-4
	deckIdOrIds?: string | string[]; // For optimistic next card
}) {
	const result = await submitReviewAction(data);
	if (!result.success) {
		return { success: false, error: result.error };
	}
	if (!result.data) return { success: false };

	return {
		success: true,
		nextCard: result.data.nextCard,
	};
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
// -----------------------------------------------------------------------------
// REFACTOR: Study Functions (Delegating to @/modules/study/study.actions)
// -----------------------------------------------------------------------------

export const getDailyProgress = cache(async () => {
	const result = await getDailyProgressAction();
	if (!result.success || !result.data) {
		return { reviewsToday: 0, newCardsToday: 0 };
	}
	return result.data;
});

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

export const getReviewCount = cache(async () => {
	// For MVP, if userId is passed, we ignore it or assume current user context
	// since getReviewCountAction uses auth() context.
	// If we need to support specific userId, we should update the action,
	// but usually this is for the current user's badge.
	// Legacy function allowed userId optional.
	const result = await getReviewCountAction();
	if (!result.success) throw new Error(result.error);
	return result.data;
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
		const currentStreak = await _recalculateUserStreak(uid);

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

/**
 * Recalculate and update the user's current streak
 * Logic: Consecutive days ending Today OR Yesterday.
 */
// recalculateUserStreak moved to @/modules/user/user.actions.ts
export { _recalculateUserStreak as recalculateUserStreak };

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
				reviewDate: {
					gte: rangeStart,
					lte: rangeEnd,
				},
			},
			select: {
				reviewDate: true,
			},
		});

		// Aggregate logs by day string (YYYY-MM-DD or similar to match loop logic)
		const countsByDay: Record<string, number> = {};
		logs.forEach((log) => {
			// Get local date string relative to user? Or just Use server time as basis same as before
			// The original loop constructed dates based on server 'today'.
			// We should match that.
			const d = new Date(log.reviewDate);
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
				const dueCount = await prisma.userReview.count({
					where: {
						userId: uid,
						nextReviewAt: { lte: new Date() },
						vocab: { deckId: deck.id },
					},
				});

				return {
					id: deck.id,
					title: deck.title,
					cardCount: deck._count.vocabularies,
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
export { _getUserSettings as getUserSettings, updateUserSettings };

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
			_getUserSettings(),
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

// Rename `submitReport` from admin module to avoid conflict if any (though `submitReview` is safe, admin exports `submitReport`).
// Wait, `submitReport` IS `submitReport`.
// `submitReview` is DIFFERENT.
// We are re-exporting `submitReport` from module AS `submitReport` in actions.ts.
export {
	getAdminStats,
	getAllUsers,
	getReports,
	resolveReport,
	submitReportAdmin as submitReport,
	updateUserRole,
};

export async function updateVocab(id: string, data: any) {
	return updateContent({ id, data });
}

export async function updateKanji(id: string, data: any) {
	return updateContent({ id, data });
}
