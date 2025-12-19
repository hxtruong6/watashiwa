'use server';

import { executeSafeAction } from '@/modules/core/action-client';
import { z } from 'zod';

import { VocabularyData } from './vocabulary.data';

/**
 * Quality Gate: Get Pending Content (AI_GENERATED)
 * Used by Admin Dashboard.
 */
export async function getPendingContent() {
	return executeSafeAction(z.void(), undefined, async (data, { userId }) => {
		// TODO: Add Role Check (e.g. requireRole('ADMIN'))
		// For MVP, we assume the specific Admin Routes are protected by Middleware/Layout
		if (!userId) throw new Error('Unauthorized');

		return VocabularyData.getWithStatus('AI_GENERATED');
	});
}

/**
 * Quality Gate: Approve Content
 * Transitions status to PUBLISHED.
 */
export async function approveContent(input: { vocabId: string }) {
	const Schema = z.object({ vocabId: z.string().uuid() });

	return executeSafeAction(Schema, input, async (data, { userId }) => {
		if (!userId) throw new Error('Unauthorized');
		// TODO: Add Role Check

		await VocabularyData.updateStatus(data.vocabId, 'PUBLISHED', userId);
		return { message: 'Content approved and published.' };
	});
}

/**
 * Quality Gate: Report/Flag Content
 * Transitions status to FLAGGED.
 * Can be called by Users (Reporting) or Admins (Rejecting).
 */
export async function reportContent(input: { vocabId: string; reason?: string }) {
	const Schema = z.object({ vocabId: z.string().uuid(), reason: z.string().optional() });

	return executeSafeAction(Schema, input, async (data, { userId }) => {
		if (!userId) throw new Error('Unauthorized');

		// Logic: if Admin -> FLAGGED immediately.
		// If User -> Maybe just create a Report ticket?
		// For Phase 1 "Self-Healing", let's Auto-Flag if it's a Beta user?
		// Or just set to FLAGGED to be safe.
		// Let's set to FLAGGED to remove it from circulation immediately (Quarantine).

		await VocabularyData.updateStatus(data.vocabId, 'FLAGGED');

		// TODO: Create a CardReport record in a separate table if tracking reasons
		// prisma.cardReport.create(...)

		return { message: 'Content flagged for review.' };
	});
}
