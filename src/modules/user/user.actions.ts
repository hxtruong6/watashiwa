'use server';

import { prisma } from '@/lib/db';
import { UpdateUserSettingsSchema } from '@/lib/schemas/user';
import { getUser } from '@/modules/auth/auth.actions';
import { UserPreferences } from '@/types/user';
import { createClient } from '@/utils/supabase/server';
import { User } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import { z } from 'zod';

const IdSchema = z.string().min(1);

const UpdateAvatarSchema = z.object({
	avatarUrl: z.string().url(),
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
				preferences: true,
				timezone: true,
				language: true,
				currentStreak: true,
			},
		});

		return settings;
	} catch (error) {
		console.error('Error fetching user settings:', error);
		return null;
	}
});

/**
 * Update User Settings
 */
export async function updateUserSettings(data: Partial<User> & { preferences?: UserPreferences }) {
	try {
		const validation = UpdateUserSettingsSchema.safeParse(data);
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
				timezone: data.timezone,
				language: data.language,
				preferences: data.preferences as any, // JSONB
				updatedAt: new Date(),
			},
		});

		revalidatePath('/dashboard');
		revalidatePath('/settings');
		return { success: true };
	} catch (error) {
		console.error('Error updating user settings:', error);
		return { success: false, error: 'Failed to update settings' };
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

		const supabase = await createClient();
		const { error } = await supabase.auth.updateUser({
			data: { avatar_url: avatarUrl },
		});

		if (error) {
			console.error('Error updating supabase user metadata:', error);
		}

		revalidatePath('/');
		return { success: true };
	} catch (error) {
		console.error('Error updating avatar:', error);
		return { success: false, error: 'Failed to update avatar' };
	}
}

/**
 * Mark a tutorial step/flow as completed
 * Stores in the `preferences.tutorials` JSON structure
 */
export async function completeTutorial(tutorialId: string) {
	try {
		if (!IdSchema.safeParse(tutorialId).success) {
			return { success: false, error: 'Invalid tutorial ID' };
		}

		const user = await getUser();
		if (!user) return { success: false, error: 'Unauthorized' };

		// Fetch current preferences
		const currentUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: { preferences: true },
		});

		const currentPrefs = (currentUser?.preferences as UserPreferences) || {};
		const currentTutorials = (currentPrefs.tutorials as Record<string, boolean>) || {};

		// If already completed, skip update
		if (currentTutorials[tutorialId]) {
			return { success: true };
		}

		// Update DB - merge tutorial into preferences.tutorials
		await prisma.user.update({
			where: { id: user.id },
			data: {
				preferences: {
					...currentPrefs,
					tutorials: {
						...currentTutorials,
						[tutorialId]: true,
					},
				},
			},
		});

		// Revalidate paths to ensure next fetch gets fresh data
		revalidatePath('/study');
		revalidatePath('/dashboard');

		return { success: true };
	} catch (error) {
		console.error('Error completing tutorial:', error);
		return { success: false, error: 'Failed to complete tutorial' };
	}
}

/**
 * Get user's completed tutorials
 */
export async function getCompletedTutorials() {
	try {
		const user = await getUser();
		if (!user) return {};

		const userData = await prisma.user.findUnique({
			where: { id: user.id },
			select: { preferences: true },
		});

		const prefs = (userData?.preferences as UserPreferences) || {};
		return (prefs.tutorials as Record<string, boolean>) || {};
	} catch (error) {
		console.error('Error fetching tutorials:', error);
		return {};
	}
}

export async function recalculateUserStreak(userId: string) {
	try {
		if (!IdSchema.safeParse(userId).success) return 0;

		// Fetch user settings for TZ and longest streak
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { timezone: true, longestStreak: true },
		});
		const timezone = user?.timezone || 'UTC';
		const longestStreak = user?.longestStreak || 0;

		// Optimization: Fetch unique review dates for the last year
		// This prevents processing thousands of logs while being sufficient for streak calculation
		const logs = await prisma.reviewLog.findMany({
			where: { userId },
			select: { reviewDate: true },
			orderBy: { reviewDate: 'desc' },
			take: 1000,
		});

		if (logs.length === 0) {
			await prisma.user.update({ where: { id: userId }, data: { currentStreak: 0 } });
			return 0;
		}

		// Helper to format date in user's timezone
		const formatDate = (date: Date) => {
			return new Intl.DateTimeFormat('en-CA', {
				timeZone: timezone,
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
			}).format(date); // Returns YYYY-MM-DD
		};

		const uniqueDates = new Set<string>();
		logs.forEach((log) => {
			uniqueDates.add(formatDate(log.reviewDate));
		});

		const todayStr = formatDate(new Date());
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const yesterdayStr = formatDate(yesterday);

		// Determine the start point of our streak count
		let pointer = new Date();
		if (!uniqueDates.has(todayStr)) {
			if (uniqueDates.has(yesterdayStr)) {
				pointer = yesterday;
			} else {
				// Streak broken
				await prisma.user.update({ where: { id: userId }, data: { currentStreak: 0 } });
				return 0;
			}
		}

		// Count backwards from 'pointer' (inclusive)
		let currentS = 0;
		while (true) {
			const dateStr = formatDate(pointer);
			if (uniqueDates.has(dateStr)) {
				currentS++;
				pointer.setDate(pointer.getDate() - 1);
			} else {
				break;
			}
		}

		// Update User (including longest streak if beaten)
		await prisma.user.update({
			where: { id: userId },
			data: {
				currentStreak: currentS,
				longestStreak: Math.max(currentS, longestStreak),
			},
		});

		return currentS;
	} catch (error) {
		console.error('Error recalculating streak:', error);
		return 0;
	}
}

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
				reviewDate: {
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
