'use server';

import { prisma } from '@/lib/db';
import { UpdateUserSettingsInput, UpdateUserSettingsSchema } from '@/lib/schemas/user';
import { getUser } from '@/modules/auth/auth.actions';
import { executeSafeAction } from '@/modules/core/action-client';
import { UserPreferences } from '@/types/user';
import { createClient } from '@/utils/supabase/server';
import { type Prisma } from '@prisma/client';
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
export async function updateUserSettings(input: UpdateUserSettingsInput) {
	return executeSafeAction(UpdateUserSettingsSchema, input, async (data, { userId }) => {
		if (!userId) throw new Error('Unauthorized');

		// Get existing user to merge preferences
		const existingUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { preferences: true },
		});

		// Merge preferences if provided
		const existingPreferences = (existingUser?.preferences as UserPreferences) || {};
		const mergedPreferences = data.preferences
			? { ...existingPreferences, ...data.preferences }
			: existingPreferences;

		// update
		await prisma.user.update({
			where: { id: userId },
			data: {
				...(data.limitNewCards !== undefined && { limitNewCards: data.limitNewCards }),
				...(data.limitReviews !== undefined && { limitReviews: data.limitReviews }),
				...(data.timezone !== undefined && { timezone: data.timezone }),
				...(data.language !== undefined && { language: data.language }),
				...(data.preferences !== undefined && {
					preferences: mergedPreferences as Prisma.InputJsonValue,
				}),
				updatedAt: new Date(),
			},
		});

		revalidatePath('/dashboard');
		revalidatePath('/settings');
		return { success: true };
	});
}

export async function updateUserAvatar(avatarUrl: string) {
	return executeSafeAction(UpdateAvatarSchema, { avatarUrl }, async (data, { userId }) => {
		if (!userId) throw new Error('Unauthorized');

		await prisma.user.update({
			where: { id: userId },
			data: { avatarUrl: data.avatarUrl },
		});

		const supabase = await createClient();
		const { error } = await supabase.auth.updateUser({
			data: { avatar_url: data.avatarUrl },
		});

		if (error) {
			console.error('Error updating supabase user metadata:', error);
		}

		revalidatePath('/');
		return { success: true };
	});
}

/**
 * Mark a tutorial step/flow as completed
 * Stores in the `preferences.tutorials` JSON structure
 */
export async function completeTutorial(tutorialId: string) {
	return executeSafeAction(IdSchema, tutorialId, async (id, { userId }) => {
		if (!userId) throw new Error('Unauthorized');

		// Fetch current preferences
		const currentUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { preferences: true },
		});

		const currentPrefs = (currentUser?.preferences as UserPreferences) || {};
		const currentTutorials = (currentPrefs.tutorials as Record<string, boolean>) || {};

		// If already completed, skip update
		if (currentTutorials[id]) {
			return { success: true };
		}

		// Update DB - merge tutorial into preferences.tutorials
		await prisma.user.update({
			where: { id: userId },
			data: {
				preferences: {
					...currentPrefs,
					tutorials: {
						...currentTutorials,
						[id]: true,
					},
				},
			},
		});

		// Revalidate paths to ensure next fetch gets fresh data
		revalidatePath('/study');
		revalidatePath('/dashboard');

		return { success: true };
	});
}

/**
 * Get user's completed tutorials
 */
export async function getCompletedTutorials() {
	return executeSafeAction(z.void(), undefined, async (_, { userId }) => {
		if (!userId) return {};

		const userData = await prisma.user.findUnique({
			where: { id: userId },
			select: { preferences: true },
		});

		const prefs = (userData?.preferences as UserPreferences) || {};
		return (prefs.tutorials as Record<string, boolean>) || {};
	});
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

/**
 * Unsubscribe from email notifications
 * Supports both authenticated users and token-based unsubscribe
 */
const UnsubscribeSchema = z.object({
	email: z.string().email(),
	token: z.string().optional(),
});

export async function unsubscribeFromEmails(input: z.infer<typeof UnsubscribeSchema>) {
	return executeSafeAction(UnsubscribeSchema, input, async (data) => {
		// Find user by email
		const user = await prisma.user.findUnique({
			where: { email: data.email },
			select: { id: true, email: true },
		});

		if (!user) {
			// Return success even if user doesn't exist (security best practice)
			return { success: true, message: 'Unsubscribed successfully' };
		}

		// If token is provided, validate it
		// For now, we'll allow unsubscribe without token for authenticated users
		// In production, you might want to generate and validate tokens
		if (data.token) {
			// TODO: Implement token validation if needed
			// For now, we'll proceed with email-based unsubscribe
		}

		// Update user to disable notifications
		await prisma.user.update({
			where: { id: user.id },
			data: {
				enableNotifications: false,
				updatedAt: new Date(),
			},
		});

		return { success: true, message: 'Unsubscribed successfully' };
	});
}
