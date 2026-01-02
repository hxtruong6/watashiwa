'use client';

import { getUserSettings } from '@/modules/user/user.actions';
import { UserPreferences } from '@/types/user';
import { useEffect, useState } from 'react';

/**
 * Client-side hook to check if user has completed setup
 * Used in client components like NavBar for immediate feedback
 */
export function useSetupStatus() {
	const [setupCompleted, setSetupCompleted] = useState<boolean | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkSetup = async () => {
			try {
				const settings = await getUserSettings();
				const preferences = (settings?.preferences as UserPreferences) || {};
				setSetupCompleted(preferences.setupCompleted === true);
			} catch (error) {
				console.error('Error checking setup status:', error);
				// On error, assume not completed (fail secure)
				setSetupCompleted(false);
			} finally {
				setLoading(false);
			}
		};

		checkSetup();
	}, []);

	return { setupCompleted, loading };
}

