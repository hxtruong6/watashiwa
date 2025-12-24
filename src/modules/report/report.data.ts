'use server';

import { hasRole } from '@/lib/auth/roleGuard';
import { prisma } from '@/lib/db';
import { getUserWithRole } from '@/modules/auth/auth.actions';
import { ReportStatus, UserRole } from '@prisma/client';

export async function getReports(limit: number = 50, status: ReportStatus = ReportStatus.PENDING) {
	try {
		const user = await getUserWithRole();
		if (!user || !hasRole(user.role, UserRole.MODERATOR)) {
			return { success: false, error: 'Unauthorized' };
		}

		console.log('Fetching reports with status:', status);

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
