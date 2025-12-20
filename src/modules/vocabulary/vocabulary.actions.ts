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
/**
 * Admin: Get Pending Vocabulary Queue
 */
export async function getPendingVocabularySafe() {
	return executeSafeAction(z.void(), undefined, async (_data, { userId }) => {
		if (!userId) throw new Error('Unauthorized');

		const items = await VocabularyData.getPending();

		// Transform to ExtendedVocabulary format (flatten confusions)
		return items.map((item) => {
			const confusions = [
				...item.confusionsAs1.map((c) => ({
					word: c.vocab2.wordSurface,
					explanation: c.explanation as any, // Typed in frontend
				})),
				...item.confusionsAs2.map((c) => ({
					word: c.vocab1.wordSurface,
					explanation: c.explanation as any,
				})),
			];

			return {
				...item,
				confusions,
			};
		});
	});
}

/**
 * Admin: Verify Content
 */
export async function verifyContent(input: { vocabId: string }) {
	const Schema = z.object({ vocabId: z.string().uuid() });

	return executeSafeAction(Schema, input, async (data, { userId }) => {
		if (!userId) throw new Error('Unauthorized');
		await VocabularyData.updateStatus(data.vocabId, 'VERIFIED', userId);
		return { message: 'Content verified.' };
	});
}

/**
 * Admin: Reject Content
 */
export async function rejectContent(input: { vocabId: string }) {
	const Schema = z.object({ vocabId: z.string().uuid() });

	return executeSafeAction(Schema, input, async (data, { userId }) => {
		if (!userId) throw new Error('Unauthorized');
		await VocabularyData.updateStatus(data.vocabId, 'FLAGGED', userId);
		return { message: 'Content rejected/flagged.' };
	});
}

/**
 * Admin: Update Content
 */
export async function updateContent(input: { id: string; data: any }) {
	// BEST PRACTICE: Use strict schemas instead of 'any' to enforce data integrity.
	// We handle both camelCase (Form) and snake_case (Import) keys here.
	const DataSchema = z.object({
		// CamelCase (Standard)
		wordSurface: z.string().optional(),
		wordReading: z.string().optional(),
		wordRomaji: z.string().optional(),
		tags: z.array(z.string()).optional(),
		pitchPattern: z.number().int().optional(),
		pitchSvgPath: z.string().optional(),

		// SnakeCase (Legacy/Import support)
		kanji: z.string().optional(),
		kana: z.string().optional(),
		romaji: z.string().optional(),
		pitch_pattern: z.number().int().optional(),
		pitch_svg_path: z.string().optional(),

		// JSONB Fields (Strictly Validated against our Contracts)
		meanings: z.record(z.string(), z.array(z.string())).optional(), // Matches MeaningsSchema
		etymology: z
			.object({
				parts: z.array(
					z.object({
						kanji: z.string(),
						han_viet: z.string(),
						meaning: z.object({ vi: z.string(), en: z.string() }),
						stroke_count: z.number().optional(),
					}),
				),
				note: z.object({ vi: z.string(), en: z.string() }).optional(),
			})
			.optional(), // Matches EtymologySchema (inline for simplicity or import)
		mnemonic: z.object({ vi: z.string(), en: z.string() }).optional(), // Matches LocalizedStringSchema
		examples: z
			.array(
				z.object({
					sentence: z.string(),
					translation: z.object({ vi: z.string(), en: z.string() }),
					audio: z.string().optional(),
				}),
			)
			.optional(), // Matches ExamplesSchema
	});

	const Schema = z.object({
		id: z.string().uuid(),
		data: DataSchema,
	});

	return executeSafeAction(Schema, input, async ({ id, data }, { userId }) => {
		if (!userId) throw new Error('Unauthorized');

		// MAPPER: Support snake_case (Raw JSON) -> camelCase (Prisma)
		const updateData = {
			wordSurface: data.wordSurface ?? data.kanji,
			wordReading: data.wordReading ?? data.kana,
			wordRomaji: data.wordRomaji ?? data.romaji,
			tags: data.tags,
			pitchPattern: data.pitchPattern ?? data.pitch_pattern,
			pitchSvgPath: data.pitchSvgPath ?? data.pitch_svg_path,
			meanings: data.meanings,
			etymology: data.etymology,
			mnemonic: data.mnemonic,
			examples: data.examples,
		};

		await VocabularyData.update(id, updateData);
		return { message: 'Content updated.' };
	});
}
