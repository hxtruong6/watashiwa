/**
 * Client-side utility to handle "Unauthorized" errors from server actions
 * Automatically logs out user and redirects to login page when session is invalid
 *
 * Note: This is primarily for internal use by useServerAction hook.
 * For client components, use the useServerAction hook instead.
 */
import { createClient } from '@/utils/supabase/client';

/**
 * Handles "Unauthorized" errors from server actions
 * If the error is "Unauthorized", automatically logs out and redirects to login
 *
 * @param error - The error string from server action response
 * @param currentPath - Optional current path to preserve as returnUrl
 * @returns true if error was handled (Unauthorized), false otherwise
 */
export async function handleUnauthorizedError(
	error: string | undefined,
	currentPath?: string,
): Promise<boolean> {
	if (!error || error !== 'Unauthorized') {
		return false;
	}

	// Early return if already on login page (prevents redirect loops)
	if (typeof window !== 'undefined' && window.location.pathname === '/login') {
		return true;
	}

	console.warn('[Auth] Unauthorized error detected, logging out user...');

	try {
		// Clear login method cache
		if (typeof window !== 'undefined') {
			try {
				localStorage.removeItem('watashi_login_methods');
			} catch (e) {
				console.error('[Auth] Failed to clear login cache:', e);
			}
		}

		// Sign out from Supabase (clears session and cookies)
		const supabase = createClient();
		await supabase.auth.signOut();

		// Build redirect URL with returnUrl if currentPath is provided
		const loginUrl = new URL('/login', window.location.origin);
		if (currentPath && currentPath !== '/login' && currentPath.startsWith('/')) {
			loginUrl.searchParams.set('returnUrl', currentPath);
		}
		loginUrl.searchParams.set('sessionExpired', 'true');

		// Redirect to login page with full page reload to ensure middleware sees cleared session
		window.location.href = loginUrl.toString();

		return true;
	} catch (err) {
		console.error('[Auth] Error during logout:', err);
		// Even if logout fails, redirect to login
		window.location.href = '/login?sessionExpired=true';
		return true;
	}
}
