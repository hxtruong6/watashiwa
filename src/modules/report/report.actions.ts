'use server';

import { hasRole } from '@/lib/auth/roleGuard';
import { prisma } from '@/lib/db';
import { getUser, getUserWithRole } from '@/modules/auth/auth.actions';
import { ReportStatus, UserRole } from '@prisma/client';

import {
	ReportPayload,
	ReportSchema,
	ResolveReportPayload,
	ResolveReportSchema,
} from './report.types';

export async function submitReport(data: ReportPayload) {
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

export async function resolveReport({ reportId, action, resolutionStr }: ResolveReportPayload) {
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
			console.log(`Accepted report ${reportId}, would award points to ${updated.reporterId}`);
		}

		return { success: true };
	} catch (error) {
		console.error('Error resolving report:', error);
		return { success: false, error: 'Failed to resolve report' };
	}
}
