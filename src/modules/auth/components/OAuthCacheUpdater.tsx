'use client';

import { useLoginMethodCache } from '@/modules/auth/hooks/useLoginMethodCache';
import { createClient } from '@/utils/supabase/client';
import { useEffect } from 'react';

/**
 * Client component that updates login method cache after OAuth login
 * Runs once on mount to check if user just logged in via OAuth and update cache
 */
export function OAuthCacheUpdater() {
	const { updateCache } = useLoginMethodCache();

	useEffect(() => {
		// Skip if offline - cache update can wait
		if (typeof window !== 'undefined' && !navigator.onLine) {
			return;
		}

		const updateCacheIfOAuth = async () => {
			try {
				const supabase = createClient();
				const {
					data: { user },
					error,
				} = await supabase.auth.getUser();

				if (!user || !user.email || error) return;

				// Check if user logged in via OAuth (not email)
				const provider = user.app_metadata?.provider;
				if (provider && provider !== 'email') {
					// Update cache with OAuth provider
					updateCache(user.email, provider as 'email' | 'google');
				}
			} catch (error) {
				// Fail silently - cache update is not critical
				console.error('[OAuthCacheUpdater] Failed to update cache:', error);
			}
		};

		// Small delay to ensure session is fully established
		const timer = setTimeout(updateCacheIfOAuth, 500);
		return () => clearTimeout(timer);
	}, [updateCache]);

	return null; // This component doesn't render anything
}
