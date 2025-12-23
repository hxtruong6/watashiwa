'use server';

import { prisma } from '@/lib/db';

export async function getLeaderboard() {
	try {
		const users = await prisma.user.findMany({
			take: 10,
			orderBy: {
				currentStreak: 'desc',
			},
			select: {
				id: true,
				name: true,
				currentStreak: true,
				avatarUrl: true,
			},
		});

		// Ensure we handle display names
		return users.map((u) => ({
			...u,
			name: u.name || 'Anonymous Learner',
			avatarUrl: u.avatarUrl,
		}));
	} catch (error) {
		console.error('Error fetching leaderboard:', error);
		return [];
	}
}
