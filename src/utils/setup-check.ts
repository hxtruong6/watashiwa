'use server';

import { getUserSettings } from '@/modules/user/user.actions';
import { UserPreferences } from '@/types/user';

/**
 * Check if a user has completed the initial profile setup
 *
 * This function checks the database (source of truth) for setup status.
 * Used by server components for page-level protection.
 *
 * @param userId - Optional user ID. If not provided, will fetch current user
 * @returns Promise<boolean> - true if setup is completed, false otherwise
 */
export async function hasCompletedSetup(userId?: string): Promise<boolean> {
	try {
		const settings = await getUserSettings(userId);
		if (!settings) {
			return false;
		}

		const preferences = (settings.preferences as UserPreferences) || {};
		return preferences.setupCompleted === true;
	} catch (error) {
		console.error('Error checking setup status:', error);
		// On error, assume setup is not completed (fail secure)
		return false;
	}
}

/**
 * Require that setup is completed, throw error if not
 * Useful for server-side checks that should fail fast
 * @param userId - Optional user ID. If not provided, will fetch current user
 * @throws Error if setup is not completed
 */
export async function requireSetupCompleted(userId?: string): Promise<void> {
	const completed = await hasCompletedSetup(userId);
	if (!completed) {
		throw new Error('Profile setup not completed');
	}
}
