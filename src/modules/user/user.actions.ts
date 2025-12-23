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

		const uniqueDates = new Set<string>();
		logs.forEach((log) => {
			uniqueDates.add(log.review.toISOString().split('T')[0]); // YYYY-MM-DD
		});

		const today = new Date();
		const todayStr = today.toISOString().split('T')[0];

		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const yesterdayStr = yesterday.toISOString().split('T')[0];

		let streak = 0;

		// Check Today
		if (uniqueDates.has(todayStr)) {
			streak++;
		}

		// Walk backwards from Yesterday
		let currentCheck = new Date(yesterday);

		while (true) {
			const checkStr = currentCheck.toISOString().split('T')[0];
			if (uniqueDates.has(checkStr)) {
				streak++;
				currentCheck.setDate(currentCheck.getDate() - 1);
			} else {
				// Break if checkStr is MISSING.
				// Exception: If we have NO streak from Today, and we are checking Yesterday.
				// If Yesterday is present, streak becomes 1 (or 2 if Today was present).
				// The logic is: consecutive days.
				// If Today is present (streak=1). We check Yesterday. Present -> streak=2. Miss -> streak=1.
				// If Today is MISSING (streak=0). We check Yesterday. Present -> streak=1. Miss -> streak=0.

				// Wait, if Today is MISSING, but Yesterday is present, is the streak alive?
				// Yes, usually you have until end of Today to extend it.
				// So if Today is missing, but Yesterday is present, Streak IS valid/alive (count starts from Yesterday).

				// Fix loop condition:
				// We start checking from Yesterday.
				// If Today was present, Streak=1.
				// If Today was missing, Streak=0.

				// Loop starts checking Yesterday.
				// If Yesterday is present -> Streak++.

				// But wait, if Today is missing, and Yesterday is missing, streak is 0.
				// If Today is missing, and Yesterday is present, streak is 1.

				// Logic:
				// If uniqueDates.has(todayStr) -> streak = 1.
				// Else -> streak = 0.

				// But if streak=0, and Yesterday is present, we should set streak=1?
				// Actually, if Today is missing, the "Current Streak" is effectively what it was Yesterday.
				// Unless Yesterday was also missing.

				// Let's rely on simple consecutive check including Today OR Yesterday.

				// We handled Today above.
				// If streak > 0 (Today present), we just need to chain previous days.

				if (streak === 0 && uniqueDates.has(yesterdayStr)) {
					// Today missing, but Yesterday present. Streak is at least 1.
					streak = 1;
					// Continue checking before yesterday
					currentCheck.setDate(currentCheck.getDate() - 1);
					continue;
				}

				// Normal chaining
				if (streak > 0 && uniqueDates.has(checkStr)) {
					// CheckStr is already handled if we did the special case above?
					// Wait, if we entered the special case, we decremented currentCheck.
					// So we are now checking Day Before Yesterday.
					// This loop structure is getting messy.
					break; // Logic logic reimplemented below cleanly.
				}
				break;
			}
		}

		// Let's rewrite strictly:
		// 1. Identify "Latest Streak Date". It's either Today (if studied) or Yesterday (if studied).
		// If neither, Streak is 0.
		// If Today studied: Start counting backwards from Today.
		// If Today NOT studied but Yesterday studied: Start counting backwards from Yesterday.

		let pointer = new Date(today);
		if (!uniqueDates.has(todayStr)) {
			if (uniqueDates.has(yesterdayStr)) {
				pointer = new Date(yesterday);
			} else {
				// Streak broken
				await prisma.user.update({ where: { id: userId }, data: { currentStreak: 0 } });
				return 0;
			}
		}

		// Count backwards from 'pointer' (inclusive)
		let currentS = 0;
		while (true) {
			const dateStr = pointer.toISOString().split('T')[0];
			if (uniqueDates.has(dateStr)) {
				currentS++;
				pointer.setDate(pointer.getDate() - 1);
			} else {
				break;
			}
		}

		// Update User
		await prisma.user.update({ where: { id: userId }, data: { currentStreak: currentS } });
		return currentS;
	} catch (error) {
		console.error('Error recalculating streak:', error);
		return 0;
	}
}
