'use server';

import { prisma } from '@/lib/db';
import { getUser } from '@/modules/auth/auth.actions';
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

/**
 * Server-Side Analytics Event Logger
 * For server-side events, we log them and they can be sent to PostHog API later
 * Client-side events should use trackEvent from @/lib/analytics
 */
export async function logAnalyticsEvent(eventName: string, payload: any) {
	try {
		// In development, log to console
		if (process.env.NODE_ENV === 'development') {
			console.log(`[Analytics] ${eventName}`, JSON.stringify(payload));
		}

		// In production, you can send to PostHog API or store in queue
		// For now, we'll rely on client-side tracking for most events
		// Server-side events can be sent via PostHog's REST API if needed

		return { success: true };
	} catch (error) {
		// Fail silently - don't break the app
		console.error(`[Analytics] Failed to log ${eventName}:`, error);
		return { success: false, error: String(error) };
	}
}
