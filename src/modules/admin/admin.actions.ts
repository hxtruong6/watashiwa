'use server';

import { hasRole, requireRole } from '@/lib/auth/roleGuard';
import { prisma } from '@/lib/db';
import { getUser, getUserWithRole } from '@/modules/auth/auth.actions';
import { ReportStatus, ReportType, UserRole } from '@prisma/client';
import { z } from 'zod';

const IdSchema = z.string().min(1);

const ReportSchema = z
	.object({
		vocabId: z.string().optional(),
		type: z.nativeEnum(ReportType),
		field: z.string().optional(),
		currentValue: z.string().optional(),
		suggestedValue: z.string().optional(),
		notes: z.string().optional(),
	})
	.refine((data) => data.vocabId, {
		message: 'Must specify a Vocab ID',
		path: ['vocabId'],
	});

const ResolveReportSchema = z.object({
	reportId: IdSchema,
	action: z.enum(['ACCEPT', 'REJECT']),
	resolutionStr: z.string().optional(),
});

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

export async function submitReport(data: {
	vocabId?: string;
	type: ReportType;
	field?: string;
	currentValue?: string;
	suggestedValue?: string;
	notes?: string;
}) {
	try {
		const validation = ReportSchema.safeParse(data);
		if (!validation.success) {
			return { success: false, error: validation.error.issues[0].message };
		}

		const user = await getUser();
		if (!user) return { success: false, error: 'Unauthorized' };

		// Basic Validation: Must define what is reported
		if (!data.vocabId) {
			return { success: false, error: 'Must specify a Vocab ID' };
		}

		await prisma.cardReport.create({
			data: {
				reporterId: user.id,
				vocabId: data.vocabId,
				type: data.type,
				field: data.field,
				currentValue: data.currentValue,
				suggestedValue: data.suggestedValue,
				notes: data.notes,
			},
		});

		return { success: true };
	} catch (error) {
		console.error('Error submitting report:', error);
		return { success: false, error: 'Failed to submit report' };
	}
}

export async function getReports(limit: number = 50, status: ReportStatus = ReportStatus.PENDING) {
	try {
		const user = await getUserWithRole();
		if (!user || user.role === UserRole.USER) {
			return { success: false, error: 'Unauthorized' };
		}

		const reports = await prisma.cardReport.findMany({
			where: { status },
			take: limit,
			orderBy: { createdAt: 'desc' },
			include: {
				reporter: { select: { name: true, email: true } },
				vocab: true, // Fetch full vocab details
			},
		});
		return { success: true, data: reports };
	} catch (error) {
		console.error('Error fetching reports:', error);
		return { success: false, error: 'Failed to fetch reports' };
	}
}

export async function resolveReport(
	reportId: string,
	action: 'ACCEPT' | 'REJECT',
	resolutionStr?: string,
) {
	try {
		const validation = ResolveReportSchema.safeParse({ reportId, action, resolutionStr });
		if (!validation.success) {
			return { success: false, error: 'Invalid resolution data' };
		}

		const currentUser = await getUserWithRole();
		if (!currentUser || !hasRole(currentUser.role, UserRole.MODERATOR)) {
			return { success: false, error: 'Unauthorized' };
		}

		const status = action === 'ACCEPT' ? ReportStatus.ACCEPTED : ReportStatus.REJECTED;

		const updated = await prisma.cardReport.update({
			where: { id: reportId },
			data: {
				status,
				resolution: resolutionStr,
				resolvedById: currentUser.id,
				resolvedAt: new Date(),
			},
		});

		// Logic for points could go here (e.g. if ACCEPT => awarding points to reporter)
		if (status === ReportStatus.ACCEPTED) {
			// Placeholder: await awardPoints(updated.reporterId, 5);
			console.log(`Accepted report ${reportId}, would award points to ${updated.reporterId}`);
		}

		return { success: true };
	} catch (error) {
		console.error('Error resolving report:', error);
		return { success: false, error: 'Failed to resolve report' };
	}
}
