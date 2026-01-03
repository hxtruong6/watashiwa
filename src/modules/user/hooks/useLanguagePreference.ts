'use client';

import { updateUserSettings } from '@/modules/user/user.actions';
import type { Locale } from '@/modules/user/utils/locale';
import { setLocaleCookie } from '@/modules/user/utils/locale';

interface UseLanguagePreferenceOptions {
	/**
	 * Whether to reload the page after updating language
	 * @default true
	 */
	reload?: boolean;
	/**
	 * Custom redirect path (used instead of reload if provided)
	 * If both reload and redirectPath are provided, redirectPath takes precedence
	 */
	redirectPath?: string;
	/**
	 * Callback to run after successful language update (before reload/redirect)
	 */
	onSuccess?: () => void;
	/**
	 * Callback to run on error
	 */
	onError?: (error: Error | unknown) => void;
}

/**
 * Custom hook for managing language preference
 * Handles cookie setting, DB persistence, and page reload/redirect
 *
 * @example
 * ```tsx
 * const { updateLanguage } = useLanguagePreference({
 *   onSuccess: () => message.success('Language updated!'),
 * });
 *
 * await updateLanguage('vi');
 * ```
 */
export function useLanguagePreference(options: UseLanguagePreferenceOptions = {}) {
	const { reload = true, redirectPath, onSuccess, onError } = options;

	const updateLanguage = async (newLocale: Locale) => {
		try {
			// 1. Set Cookie for Next-Intl (Client-side immediate)
			setLocaleCookie(newLocale);

			// 2. Persist to DB (Server-side) - Only if user is authenticated
			// For public users, we only update the cookie
			try {
				const result = await updateUserSettings({ language: newLocale });
				if (!result.success) {
					throw new Error(result.error || 'Failed to update language preference');
				}
			} catch (err) {
				// Silently fail for public users - cookie update is sufficient
				if (err instanceof Error && err.message.includes('Unauthorized')) {
					// Public user - this is expected, cookie update is enough
					// Continue with reload/redirect
				} else {
					throw err; // Re-throw other errors
				}
			}

			// 3. Run success callback if provided
			onSuccess?.();

			// 4. Reload or redirect to apply changes
			if (redirectPath) {
				window.location.href = redirectPath;
			} else if (reload) {
				window.location.reload();
			}
		} catch (error) {
			onError?.(error);
			// Re-throw so caller can handle if needed
			throw error;
		}
	};

	return { updateLanguage };
}
