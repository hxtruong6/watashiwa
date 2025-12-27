import { identifyUser, trackEvent } from '@/lib/analytics';
import type { User } from '@supabase/supabase-js';

/**
 * Extract safe user properties for analytics
 * Sanitizes and validates data before sending
 */
function extractUserProperties(user: User): {
	email: string | undefined;
	name: string | undefined;
} {
	const email = user.email ? user.email.toLowerCase().trim() : undefined;
	const name = user.user_metadata?.full_name?.trim() || email?.split('@')[0] || undefined;

	return { email, name };
}

/**
 * Identify user for analytics after successful authentication
 * Handles errors gracefully to not block auth flow
 */
export async function identifyUserForAuth(user: User): Promise<void> {
	try {
		const { email, name } = extractUserProperties(user);
		identifyUser(user.id, {
			email,
			name,
		});
	} catch (error) {
		// Fail silently - analytics should never break auth
		console.error('[Auth Analytics] Failed to identify user:', error);
	}
}

/**
 * Track signup event with proper error handling
 * Supports email and OAuth providers (google, etc.)
 */
export function trackSignupEvent(
	userId: string,
	method: 'email' | 'oauth' | 'google' = 'email',
	source: string = 'unknown',
): void {
	try {
		trackEvent('user_signed_up', {
			user_id: userId,
			method,
			source,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('[Auth Analytics] Failed to track signup:', error);
	}
}
