'use server';

import { prisma } from '@/lib/db';
import { getUser } from '@/modules/auth/auth.actions';
import { PostHog } from 'posthog-node';
import { cache } from 'react';
import { z } from 'zod';

const IdSchema = z.string().min(1);

/**
 * Get weekly review stats for the chart (last 7 days)
 */
export const getWeeklyStats = cache(async (userId?: string) => {
	try {
		if (userId && !IdSchema.safeParse(userId).success) return null;

		let uid = userId;
		if (!uid) {
			const user = await getUser();
			if (!user) return null;
			uid = user.id;
		}

		const days: { day: string; date: Date; count: number; isToday: boolean }[] = [];
		const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Optimize: Fetch all logs for the date range in one query
		const rangeStart = new Date(today);
		rangeStart.setDate(today.getDate() - 6);
		rangeStart.setHours(0, 0, 0, 0);

		const rangeEnd = new Date(today);
		rangeEnd.setHours(23, 59, 59, 999);

		const logs = await prisma.reviewLog.findMany({
			where: {
				userId: uid,
				reviewDate: {
					gte: rangeStart,
					lte: rangeEnd,
				},
			},
			select: {
				reviewDate: true,
			},
		});

		// Aggregate logs by day string (YYYY-MM-DD or similar to match loop logic)
		const countsByDay: Record<string, number> = {};
		logs.forEach((log) => {
			const d = new Date(log.reviewDate);
			const key = d.toDateString();
			countsByDay[key] = (countsByDay[key] || 0) + 1;
		});

		// Reconstruct the array
		for (let i = 6; i >= 0; i--) {
			const date = new Date(today);
			date.setDate(today.getDate() - i);
			const dayLabel = dayNames[date.getDay()];
			const key = date.toDateString();

			days.push({
				day: dayLabel,
				date,
				count: countsByDay[key] || 0,
				isToday: i === 0,
			});
		}

		const thisWeekTotal = days.reduce((sum, d) => sum + d.count, 0);
		const bestDay = days.reduce((best, d) => (d.count > best.count ? d : best), days[0]);

		return {
			days: days.map((d) => ({ day: d.day, count: d.count, isToday: d.isToday })),
			thisWeekTotal,
			bestDay: { day: bestDay.day, count: bestDay.count },
		};
	} catch (error) {
		console.error('Error fetching weekly stats:', error);
		return null;
	}
});

// Initialize PostHog client for server-side tracking
let posthogClient: PostHog | null = null;

function getPostHogClient(): PostHog | null {
	// Only initialize if we have the API key and haven't initialized yet
	// Use server-only env var first (POSTHOG_KEY), fallback to NEXT_PUBLIC_POSTHOG_KEY for backward compatibility
	// Note: PostHog project keys are public by design, but using server-only vars is better practice
	const apiKey = process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;

	if (!posthogClient && apiKey) {
		try {
			posthogClient = new PostHog(apiKey, {
				host: 'https://us.i.posthog.com',
				// Flush events immediately (no batching for server-side)
				flushAt: 1,
				flushInterval: 0,
			});
		} catch (error) {
			console.error('[Analytics] Failed to initialize PostHog client:', error);
			return null;
		}
	}
	return posthogClient;
}

/**
 * Check if a user is an internal user (for server-side filtering)
 */
function isInternalUserServer(userId?: string, email?: string): boolean {
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

/**
 * Server-Side Analytics Event Logger
 * Sends events to PostHog API for reliable server-side tracking
 * Client-side events should use trackEvent from @/lib/analytics
 */
export async function logAnalyticsEvent(
	eventName: string,
	payload: {
		distinct_id?: string;
		[key: string]: unknown;
	},
): Promise<{ success: boolean; error?: string }> {
	try {
		const distinctId = payload.distinct_id;
		const email = (payload.user_properties as Record<string, unknown>)?.email as string | undefined;

		// Check if this is an internal user
		const isInternal = isInternalUserServer(distinctId, email);

		// Don't track events from internal users in production
		if (isInternal && process.env.NODE_ENV === 'production') {
			return { success: true };
		}

		// In development, log to console
		if (process.env.NODE_ENV === 'development') {
			console.log(`[Analytics] ${eventName}`, JSON.stringify(payload));
		}

		// Send to PostHog if enabled and we have a distinct_id
		const isEnabled =
			process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' || process.env.NODE_ENV === 'production';

		if (isEnabled && distinctId) {
			const client = getPostHogClient();
			if (client) {
				// Extract user properties if provided
				const userProperties = payload.user_properties as Record<string, unknown> | undefined;
				const eventProperties = { ...payload };
				delete eventProperties.distinct_id;
				delete eventProperties.user_properties;

				// Add internal user flag
				eventProperties.is_internal_user = isInternal;

				// Capture the event
				client.capture({
					distinctId,
					event: eventName,
					properties: eventProperties,
				});

				// If user properties are provided, set them
				if (userProperties) {
					client.identify({
						distinctId,
						properties: userProperties,
					});
				}

				// Flush events immediately (no need to shutdown in serverless)
				await client.flush();
			}
		}

		return { success: true };
	} catch (error) {
		// Fail silently - don't break the app
		console.error(`[Analytics] Failed to log ${eventName}:`, error);
		return { success: false, error: String(error) };
	}
}
