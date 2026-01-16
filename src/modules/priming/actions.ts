/**
 * Server Actions - Priming Module
 *
 * MANDATORY: ALL Server Actions MUST use executeSafeAction wrapper
 * Returns: ApiResponse<T> format
 * Never throws errors - always return error in response object
 */

'use server';

import { executeSafeAction } from '@/modules/core/action-client';

import {
	completeStory,
	getStoryWithProgress,
	listStoriesWithProgress,
	updateStoryProgress,
} from './services';
import {
	CompleteStoryInput,
	CompleteStoryInputSchema,
	GetStoryInput,
	GetStoryInputSchema,
	GetStoryOutput,
	ListStoriesInput,
	ListStoriesInputSchema,
	ListStoriesOutput,
	MarkWordCollectedInput,
	MarkWordCollectedInputSchema,
	UpdateStoryProgressInput,
	UpdateStoryProgressInputSchema,
} from './types';

// -----------------------------------------------------------------------------
// Story Reading Actions
// -----------------------------------------------------------------------------

/**
 * Get story by slug with user progress
 *
 * Usage:
 * const result = await getStoryAction({ slug: 'daily-commute-part-1', language: 'en' })
 */
export async function getStoryAction(input: unknown) {
	return executeSafeAction<GetStoryInput, GetStoryOutput>(
		GetStoryInputSchema,
		input,
		async (data, { userId }) => {
			if (!userId) {
				throw new Error('Authentication required to read stories');
			}

			return await getStoryWithProgress(data.slug, userId, data.language);
		},
		{ requireAuth: true },
	);
}

/**
 * List stories with filters and user progress
 *
 * Usage:
 * const result = await listStoriesAction({ difficulty: 'N5', limit: 20 })
 */
export async function listStoriesAction(input: unknown) {
	return executeSafeAction<ListStoriesInput, ListStoriesOutput>(
		ListStoriesInputSchema,
		input,
		async (data, { userId }) => {
			if (!userId) {
				throw new Error('Authentication required');
			}

			return await listStoriesWithProgress(data, userId);
		},
		{ requireAuth: true },
	);
}

// -----------------------------------------------------------------------------
// Progress Tracking Actions
// -----------------------------------------------------------------------------

/**
 * Mark word as collected
 * Updates story log with clicked word
 *
 * Usage:
 * const result = await markWordCollectedAction({
 *   storyId: '...',
 *   vocabularyId: '...'
 * })
 */
export async function markWordCollectedAction(input: unknown) {
	return executeSafeAction<MarkWordCollectedInput, { success: boolean }>(
		MarkWordCollectedInputSchema,
		input,
		async (data, { userId }) => {
			if (!userId) {
				throw new Error('Authentication required');
			}

			// Note: Actual collection is handled client-side and synced via updateStoryProgressAction
			// This action is primarily for real-time analytics tracking

			return { success: true };
		},
		{ requireAuth: true },
	);
}

/**
 * Update story reading progress
 * Called periodically during reading (auto-save)
 *
 * Usage:
 * const result = await updateStoryProgressAction({
 *   storyId: '...',
 *   wordsCollected: 5,
 *   readTimeSeconds: 120,
 *   analytics: { ... }
 * })
 */
export async function updateStoryProgressAction(input: unknown) {
	return executeSafeAction<
		UpdateStoryProgressInput,
		{ success: boolean; wordsCollected: number; totalWords: number }
	>(
		UpdateStoryProgressInputSchema,
		input,
		async (data, { userId }) => {
			if (!userId) {
				throw new Error('Authentication required');
			}

			return await updateStoryProgress(userId, data);
		},
		{ requireAuth: true },
	);
}

/**
 * Complete story and add collected words to review queue
 * Called when user finishes reading all words in story
 *
 * Usage:
 * const result = await completeStoryAction({
 *   storyId: '...',
 *   totalWords: 12,
 *   readTimeSeconds: 300,
 *   analytics: { clicked_words: [...], translation_used: false, ... }
 * })
 *
 * Returns:
 * { newCardsAdded: 8, existingCards: 4 }
 */
export async function completeStoryAction(input: unknown) {
	return executeSafeAction<
		CompleteStoryInput,
		{ success: boolean; newCardsAdded: number; existingCards: number }
	>(
		CompleteStoryInputSchema,
		input,
		async (data, { userId }) => {
			if (!userId) {
				throw new Error('Authentication required');
			}

			return await completeStory(userId, data);
		},
		{ requireAuth: true },
	);
}

// -----------------------------------------------------------------------------
// Future Actions (Placeholder for Phase 2+)
// -----------------------------------------------------------------------------

/**
 * Get recommended stories based on user level and progress
 * (Phase 2 feature - AI-powered recommendations)
 */
export async function getRecommendedStoriesAction(input: unknown) {
	// TODO: Implement in Phase 2
	return { success: false, error: 'Feature not yet implemented' };
}

/**
 * Rate story (1-5 stars)
 * (Phase 2 feature - content quality tracking)
 */
export async function rateStoryAction(input: unknown) {
	// TODO: Implement in Phase 2
	return { success: false, error: 'Feature not yet implemented' };
}

/**
 * Report story error (typo, wrong translation, etc.)
 * (Phase 2 feature - community content moderation)
 */
export async function reportStoryErrorAction(input: unknown) {
	// TODO: Implement in Phase 2
	return { success: false, error: 'Feature not yet implemented' };
}
