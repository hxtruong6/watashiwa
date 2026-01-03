'use client';

/**
 * Client-side analytics tracking utility
 * Uses PostHog for event tracking
 *
 * @example
 * ```ts
 * import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
 *
 * trackEvent(AnalyticsEvents.Study.SessionStarted, {
 *   entry_type: 'auto_start',
 *   queue_size: 10,
 *   due_count: 5,
 * });
 * ```
 */
import posthog from 'posthog-js';

import type { AnalyticsEventName, EventProperties } from './analytics/events';

/**
 * Check if a user is an internal user (employee, test user, or in dev/staging)
 * Internal users should be filtered from analytics to avoid skewing metrics
 */
function isInternalUser(userId?: string, email?: string): boolean {
	// Check environment
	const isDevelopment = process.env.NODE_ENV === 'development';
	// Note: We use NODE_ENV for environment detection. If you need separate staging detection,
	// you can add: const isStaging = process.env.NEXT_PUBLIC_APP_ENV === 'staging';

	// In development, consider all users as internal
	if (isDevelopment) return true;

	// Check for internal email domains
	if (email) {
		const internalDomains = [
			'@watashiwa.app',
			'@yourcompany.com', // Replace with your actual internal domain
		];
		const emailDomain = email.toLowerCase().split('@')[1];
		if (internalDomains.some((domain) => emailDomain === domain.replace('@', ''))) {
			return true;
		}

		// Check for test user patterns
		if (email.includes('test@') || email.includes('+test@') || email.includes('@test.')) {
			return true;
		}
	}

	// Check for test user IDs
	if (userId && (userId.includes('test') || userId.includes('demo'))) {
		return true;
	}

	return false;
}

// Check if PostHog is available and enabled
function isAnalyticsEnabled(): boolean {
	if (typeof window === 'undefined') return false;
	const isDevelopment = process.env.NODE_ENV === 'development';
	const isEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' || !isDevelopment;

	// Check if PostHog is initialized by checking if it has the capture method
	// posthog.init() returns the instance, but we can check if it's ready
	const isPostHogReady = posthog && typeof posthog.capture === 'function';

	return isEnabled && isPostHogReady;
}

/**
 * Track an analytics event (type-safe version)
 * Fails silently to not break the app if analytics is unavailable
 *
 * @param eventName - Event name from AnalyticsEvents (type-safe)
 * @param properties - Event properties matching the event type
 *
 * @example
 * ```ts
 * trackEvent(AnalyticsEvents.Study.SessionStarted, {
 *   entry_type: 'auto_start',
 *   queue_size: 10,
 *   due_count: 5,
 * });
 * ```
 */
export function trackEvent<T extends AnalyticsEventName>(
	eventName: T,
	properties?: EventProperties<T>,
): void;
/**
 * Track an analytics event (legacy string version for backward compatibility)
 * @deprecated Use the type-safe version with AnalyticsEvents instead
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void;
export function trackEvent<T extends AnalyticsEventName>(
	eventName: T | string,
	properties?: EventProperties<T> | Record<string, unknown>,
): void {
	try {
		if (!isAnalyticsEnabled()) {
			// In development, log to console for debugging
			if (process.env.NODE_ENV === 'development') {
				console.log(`[Analytics] ${eventName}`, properties);
			}
			return;
		}

		// Extract user info from properties or try to get from PostHog
		// Use type assertion since properties can be any event type
		const props = properties as Record<string, unknown> | undefined;
		const userId = props?.user_id as string | undefined;
		const email = props?.email as string | undefined;

		// Check if this is an internal user
		const isInternal = isInternalUser(userId, email);

		// TODO: Uncomment this when we have a way to test internal users in development
		// if (process.env.NODE_ENV === 'development') {
		// 	console.log(`[Analytics] Skipping internal user event: ${eventName}`);
		// }
		// // Don't track events from internal users in production
		// if (isInternal && process.env.NODE_ENV === 'production') {
		// 	return;
		// }

		posthog.capture(eventName, {
			...properties,
			is_internal_user: isInternal,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		// Fail silently - don't break the app
		console.error(`[Analytics] Failed to track ${eventName}:`, error);
	}
}

/**
 * Identify a user for analytics
 * Call this after user signs up or logs in
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
	try {
		if (!isAnalyticsEnabled()) return;

		const email = properties?.email as string | undefined;
		const isInternal = isInternalUser(userId, email);

		// TODO: Uncomment this when we have a way to test internal users
		// if (process.env.NODE_ENV === 'development') {
		// 	console.log(`[Analytics] Skipping internal user identification: ${userId}`);
		// }
		// // Don't identify internal users in production
		// if (isInternal && process.env.NODE_ENV === 'production') {
		// 	return;
		// }

		posthog.identify(userId, {
			...properties,
			is_internal_user: isInternal,
		});
	} catch (error) {
		console.error('[Analytics] Failed to identify user:', error);
	}
}

// Re-export for convenience (allows import from '@/lib/analytics')
export { AnalyticsEvents, isValidEventName, getAllEventNames } from './analytics/events';
export type {
	AnalyticsEventName,
	EventProperties,
	AnalyticsEventPropertiesMap,
} from './analytics/events';
