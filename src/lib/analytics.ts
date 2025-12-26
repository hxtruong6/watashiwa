'use client';

/**
 * Client-side analytics tracking utility
 * Uses PostHog for event tracking
 */

// Extend Window interface to include posthog
declare global {
	interface Window {
		posthog?: {
			capture: (eventName: string, properties?: Record<string, unknown>) => void;
			identify: (userId: string, properties?: Record<string, unknown>) => void;
		};
	}
}

// Check if PostHog is available and enabled
function isAnalyticsEnabled(): boolean {
	if (typeof window === 'undefined') return false;
	const isDevelopment = process.env.NODE_ENV === 'development';
	const isEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' || !isDevelopment;
	return isEnabled && typeof window.posthog !== 'undefined';
}

/**
 * Track an analytics event
 * Fails silently to not break the app if analytics is unavailable
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
	try {
		if (!isAnalyticsEnabled()) {
			// In development, log to console for debugging
			if (process.env.NODE_ENV === 'development') {
				console.log(`[Analytics] ${eventName}`, properties);
			}
			return;
		}

		window.posthog?.capture(eventName, {
			...properties,
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

		window.posthog?.identify(userId, properties);
	} catch (error) {
		console.error('[Analytics] Failed to identify user:', error);
	}
}
