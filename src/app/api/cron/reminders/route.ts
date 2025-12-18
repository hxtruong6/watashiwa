import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { NotificationService } from '@/services/NotificationService';

// Vercel Cron will hit this endpoint
export async function GET(req: Request) {
	// 1. Security Check (CRON_SECRET)
	// Vercel automatically safeguards this if configured in vercel.json,
	// but manual header check is good practice.
	const authHeader = req.headers.get('authorization');
	if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const now = new Date();
		const startOfDay = new Date();
		startOfDay.setUTCHours(0, 0, 0, 0);

		// 2. Optimized "Streak Rescue" using Database Aggregation
		// Goal: Find users with streak > 0 who haven't reviewed anything today.
		// Instead of looping, we use set difference logic.

		// A. Get all users who HAVE reviewed today
		const activeReviewersToday = await prisma.reviewLog.groupBy({
			by: ['userId'],
			where: {
				review: { gte: startOfDay },
			},
			_count: true,
		});

		const activeUserIds = activeReviewersToday.map((r) => r.userId);

		// B. Get "Rescue Candidates": Streak > 0, Has Push Sub, NOT in activeUserIds
		// We fetch in batches if needed, but for 10k users, filtered ID list is manageable.
		// For true scale, we'd use a cursor-based iteration.
		const rescueCandidates = await prisma.user.findMany({
			where: {
				currentStreak: { gt: 0 },
				pushSubscriptions: { some: {} },
				id: { notIn: activeUserIds }, // The set difference
			},
			select: { id: true, email: true, currentStreak: true, language: true },
			take: 1000, // Limit batch size for safety
		});

		console.log(`Found ${rescueCandidates.length} streak rescue candidates.`);

		// Batch Send
		let sentCount = 0;
		const results = await Promise.allSettled(
			rescueCandidates.map(async (user) => {
				// Localized Content
				const isVi = user.language === 'vi';
				const title = isVi ? '🔥 Nguy cơ mất chuỗi!' : '🔥 Streak Danger!';
				const body = isVi
					? `Bạn sắp mất chuỗi ${user.currentStreak} ngày. Học ngay để giữ chuỗi!`
					: `You're about to lose your ${user.currentStreak}-day streak. Do 1 review to save it!`;

				await NotificationService.sendToUser(user.id, {
					title,
					body,
					url: '/study',
					tag: 'streak-rescue',
					icon: '/assets/w_logo.png',
				});
				return true;
			}),
		);

		sentCount = results.filter((r) => r.status === 'fulfilled').length;
		console.log(`Sent ${sentCount} streak rescue notifications.`);

		// 3. Review Overflow (Simplified for Batching)
		// We only check users who WEREN'T rescued (to avoid double notifications)
		// AND who aren't in the "activeUserIds" list (if they already studied, maybe we don't nag? Or do we?)
		// Decision: If they studied today, they are fine. We only nag people who haven't studied plenty.
		// So actually, the candidate pool is similar but filter is different.

		// For MVP robustness, let's stop here with Streak Rescue optimization to verify.
		// Adding Review Overflow in batch would require `findMany` on StudyCard with groupBy which is heavy.
		// Optimization: Only run Review Overflow check for users with `lastLogin` < today?

		return NextResponse.json({
			success: true,
			processed: rescueCandidates.length,
			sent: sentCount,
		});
	} catch (error) {
		console.error('Cron job failed:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
