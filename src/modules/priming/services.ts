/**
 * Services Layer - Priming Module
 *
 * Business logic for story reading and progress tracking
 * Pure functions - testable without database
 */
import { trackEvent } from '@/lib/analytics';
import { StoryAnalytics } from '@/lib/schemas/jsonb';

import {
	addCollectedWordsToReviewQueue,
	countStoryWords,
	getCollectedVocabularies,
	getStoryBySlugWithVocabularies,
	getStoryLog,
	listStories as listStoriesData,
	markStoryCompleted,
	upsertStoryLog,
} from './data';
import {
	CompleteStoryInput,
	GetStoryOutput,
	ListStoriesInput,
	ListStoriesOutput,
	StoryAnalyticsEvent,
	UpdateStoryProgressInput,
} from './types';

// -----------------------------------------------------------------------------
// Story Reading
// -----------------------------------------------------------------------------

/**
 * Get story by slug with user progress
 */
export async function getStoryWithProgress(
	slug: string,
	userId: string,
	language: 'en' | 'vi' = 'en',
): Promise<GetStoryOutput> {
	// Get story with vocabularies
	const story = await getStoryBySlugWithVocabularies(slug);

	if (!story) {
		return { story: null, hasRead: false };
	}

	// Get user's progress on this story
	const log = await getStoryLog(userId, story.id);

	if (!log) {
		return {
			story,
			hasRead: false,
		};
	}

	return {
		story,
		hasRead: log.completedAt !== null,
		progress: {
			wordsCollected: log.wordsCollected,
			totalWords: log.totalWords,
			readTimeSeconds: log.readTimeSeconds,
		},
	};
}

/**
 * List stories with user progress
 */
export async function listStoriesWithProgress(
	input: ListStoriesInput,
	userId?: string,
): Promise<ListStoriesOutput> {
	const { deckId, difficulty, category, limit, offset } = input;

	const { stories, total } = await listStoriesData({
		deckId,
		difficulty,
		category,
		limit,
		offset,
		userId,
	});

	// Transform stories with progress
	const storiesWithProgress = stories.map((story) => {
		const log = userId && 'storyLogs' in story ? story.storyLogs[0] : undefined;

		return {
			...story,
			progress: log
				? {
						completedAt: log.completedAt,
						wordsCollected: log.wordsCollected,
						totalWords: log.totalWords,
					}
				: undefined,
		};
	});

	return {
		stories: storiesWithProgress,
		total,
		hasMore: offset + limit < total,
	};
}

// -----------------------------------------------------------------------------
// Progress Tracking
// -----------------------------------------------------------------------------

/**
 * Update user's reading progress
 */
export async function updateStoryProgress(userId: string, input: UpdateStoryProgressInput) {
	const { storyId, wordsCollected, readTimeSeconds, analytics } = input;

	// Count total words in story
	const totalWords = await countStoryWords(storyId);

	// Update or create story log
	await upsertStoryLog({
		userId,
		storyId,
		wordsCollected,
		totalWords,
		readTimeSeconds,
		analytics,
	});

	return { success: true, wordsCollected, totalWords };
}

/**
 * Complete story and add collected words to review queue
 */
export async function completeStory(userId: string, input: CompleteStoryInput) {
	const { storyId, totalWords, readTimeSeconds, analytics } = input;

	// Mark story as completed
	await markStoryCompleted(userId, storyId, {
		wordsCollected: totalWords,
		totalWords,
		readTimeSeconds,
		analytics,
	});

	// Get collected vocabulary IDs from analytics
	const vocabularyIds = analytics.clicked_words || [];

	// Add collected words to user's review queue
	const { created, existing } = await addCollectedWordsToReviewQueue(userId, vocabularyIds);

	// Track completion analytics
	trackEvent('story_completed', {
		story_id: storyId,
		user_id: userId,
		words_collected: totalWords,
		read_time_seconds: readTimeSeconds,
		translation_used: analytics.translation_used,
		new_cards_added: created,
		existing_cards: existing,
	});

	return {
		success: true,
		newCardsAdded: created,
		existingCards: existing,
	};
}

// -----------------------------------------------------------------------------
// Analytics Tracking
// -----------------------------------------------------------------------------

/**
 * Track story analytics event
 * Wraps trackEvent with story-specific logic
 */
export function trackStoryEvent(event: StoryAnalyticsEvent, userId?: string) {
	const { type, ...data } = event;

	trackEvent(type, {
		...data,
		...(userId && { user_id: userId }),
		timestamp: Date.now(),
	});
}

/**
 * Validate story analytics data
 * Ensures analytics object is well-formed before saving
 */
export function validateStoryAnalytics(analytics: StoryAnalytics): {
	valid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (!Array.isArray(analytics.clicked_words)) {
		errors.push('clicked_words must be an array');
	}

	if (typeof analytics.translation_used !== 'boolean') {
		errors.push('translation_used must be a boolean');
	}

	if (!Array.isArray(analytics.paused_at)) {
		errors.push('paused_at must be an array');
	}

	if (typeof analytics.audio_plays !== 'number' || analytics.audio_plays < 0) {
		errors.push('audio_plays must be a non-negative number');
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

/**
 * Calculate story completion percentage
 */
export function calculateCompletionPercentage(wordsCollected: number, totalWords: number): number {
	if (totalWords === 0) return 0;
	return Math.round((wordsCollected / totalWords) * 100);
}

/**
 * Format read time for display
 */
export function formatReadTime(seconds: number): string {
	if (seconds < 60) {
		return `${seconds}s`;
	}

	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;

	if (remainingSeconds === 0) {
		return `${minutes}m`;
	}

	return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Estimate story difficulty based on word count and character length
 */
export function estimateStoryDifficulty(
	totalWords: number,
	avgWordLength: number,
): 'easy' | 'medium' | 'hard' {
	const complexityScore = totalWords * 0.5 + avgWordLength * 10;

	if (complexityScore < 50) return 'easy';
	if (complexityScore < 100) return 'medium';
	return 'hard';
}

/**
 * Check if story is suitable for user level
 */
export function isStorySuitableForUser(storyDifficulty: string, userLevel?: string): boolean {
	if (!userLevel) return true; // Show all if user level unknown

	const difficultyOrder = ['N5', 'N4', 'N3', 'N2', 'N1'];
	const storyIndex = difficultyOrder.indexOf(storyDifficulty);
	const userIndex = difficultyOrder.indexOf(userLevel);

	if (storyIndex === -1 || userIndex === -1) return true;

	// Show stories at user's level or one level above
	return storyIndex <= userIndex + 1;
}

/**
 * Get next story in arc
 * Used for "Continue to Part 2" navigation
 */
export async function getNextStoryInArc(
	currentStoryId: string,
	deckId: string,
): Promise<{ slug: string; title: string } | null> {
	const { stories } = await listStoriesData({
		deckId,
		limit: 100, // Get all stories in deck
		offset: 0,
	});

	// Find current story index
	const currentIndex = stories.findIndex((s) => s.id === currentStoryId);

	if (currentIndex === -1 || currentIndex === stories.length - 1) {
		return null; // No next story
	}

	const nextStory = stories[currentIndex + 1];
	return {
		slug: nextStory.slug,
		title: nextStory.content.title.en,
	};
}

/**
 * Check if user has completed required stories before accessing this one
 * Used for enforcing story progression order
 */
export async function checkStoryPrerequisites(
	userId: string,
	storyOrder: number,
	deckId: string,
): Promise<{ canAccess: boolean; missingStories: string[] }> {
	if (storyOrder === 0) {
		return { canAccess: true, missingStories: [] };
	}

	// Get all previous stories in arc
	const { stories } = await listStoriesData({
		deckId,
		limit: storyOrder, // Get all stories before current one
		offset: 0,
	});

	const previousStories = stories.filter((s) => s.order < storyOrder);

	// Check which stories user hasn't completed
	const missingStories: string[] = [];

	for (const story of previousStories) {
		const log = await getStoryLog(userId, story.id);
		if (!log || !log.completedAt) {
			missingStories.push(story.slug);
		}
	}

	return {
		canAccess: missingStories.length === 0,
		missingStories,
	};
}
