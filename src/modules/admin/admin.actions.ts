'use server';

import { hasRole, requireRole } from '@/lib/auth/roleGuard';
import { prisma } from '@/lib/db';
import { getUser, getUserWithRole } from '@/modules/auth/auth.actions';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const IdSchema = z.string().min(1);

/**
 * Get stats for Admin Dashboard
 * Requires MODERATOR or higher
 */
export async function getAdminStats() {
	try {
		const currentUser = await getUserWithRole();
		requireRole(currentUser?.role, UserRole.MODERATOR);

		const [userCount, reviewCount, activeToday] = await Promise.all([
			prisma.user.count(),
			prisma.reviewLog.count(),
			prisma.user.count({
				where: {
					OR: [
						{ lastLogin: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
						{ updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
					],
				},
			}),
		]);

		return { userCount, reviewCount, activeToday };
	} catch (error) {
		console.error('Admin stats error:', error);
		throw error; // Let UI handle it
	}
}

/**
 * Get all users for management
 * Requires ADMIN
 */
export async function getAllUsers() {
	try {
		const currentUser = await getUserWithRole();
		requireRole(currentUser?.role, UserRole.ADMIN);

		// Limit to 100 for now
		return await prisma.user.findMany({
			take: 100,
			orderBy: { createdAt: 'desc' },
		});
	} catch (error) {
		console.error('Get users error:', error);
		return [];
	}
}

/**
 * Update a user's role
 * Requires ADMIN
 */
export async function updateUserRole(targetUserId: string, newRole: UserRole) {
	try {
		if (!IdSchema.safeParse(targetUserId).success)
			return { success: false, error: 'Invalid User ID' };

		const currentUser = await getUserWithRole();
		requireRole(currentUser?.role, UserRole.ADMIN);

		const updatedUser = await prisma.user.update({
			where: { id: targetUserId },
			data: { role: newRole },
		});
		return { success: true, data: updatedUser };
	} catch (error) {
		console.error('Error updating user role:', error);
		return { success: false, error: 'Failed to update user role' };
	}
}

// --- Card Reporting Actions ---
// MOVED TO src/modules/report/report.actions.ts
