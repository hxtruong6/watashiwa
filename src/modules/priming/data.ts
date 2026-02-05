/**
 * Data Layer - Priming Module
 *
 * Pure Prisma database queries - NO business logic
 * All queries return raw Prisma types
 */
import db from '@/lib/db';
import type { StoryAnalytics, StoryContent, StoryPositions } from '@/lib/schemas/jsonb';
import { ContentStatus, Prisma } from '@prisma/client';

import type { StoryWithContent, StoryWithVocabularies } from './types';

// -----------------------------------------------------------------------------
// Story Queries
// -----------------------------------------------------------------------------

/**
 * Get story by slug with all vocabularies
 */
export async function getStoryBySlugWithVocabularies(
	slug: string,
): Promise<StoryWithVocabularies | null> {
	const story = await db.story.findUnique({
		where: {
			slug,
			contentStatus: ContentStatus.PUBLISHED, // Only show published stories
			deletedAt: null,
		},
		include: {
			vocabularies: {
				include: {
					vocabulary: true,
				},
				orderBy: {
					createdAt: 'asc', // Maintain word order in story
				},
			},
		},
	});

	if (!story) return null;

	// Parse JSONB fields
	return {
		...story,
		content: story.content as StoryContent,
		vocabularies: story.vocabularies.map((sv) => ({
			...sv,
			positions: sv.positions as StoryPositions,
		})),
	};
}

/**
 * Get story by ID
 */
export async function getStoryById(storyId: string) {
	return db.story.findUnique({
		where: {
			id: storyId,
			deletedAt: null,
		},
	});
}

/**
 * Get first story for a deck (unit)
 * Used for priming check before study session
 */
export async function getFirstStoryByDeckId(deckId: string): Promise<StoryWithContent | null> {
	const story = await db.story.findFirst({
		where: {
			unitId: deckId,
			contentStatus: ContentStatus.PUBLISHED,
			deletedAt: null,
		},
		orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
	});

	if (!story) return null;

	return {
		...story,
		content: story.content as StoryContent,
	};
}

/**
 * List stories with filters and pagination
 */
export async function listStories(params: {
	deckId?: string;
	difficulty?: string;
	category?: string;
	limit?: number;
	offset?: number;
	userId?: string; // For progress join
}) {
	const { deckId, difficulty, category, limit = 20, offset = 0, userId } = params;

	const where: Prisma.StoryWhereInput = {
		contentStatus: ContentStatus.PUBLISHED,
		deletedAt: null,
		...(deckId && { unitId: deckId }),
		...(difficulty && { difficulty }),
		...(category && { category }),
	};

	const [stories, total] = await Promise.all([
		db.story.findMany({
			where,
			orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
			take: limit,
			skip: offset,
			include: {
				...(userId && {
					storyLogs: {
						where: { userId },
						take: 1,
					},
				}),
			},
		}),
		db.story.count({ where }),
	]);

	return {
		stories: stories.map((s) => ({
			...s,
			content: s.content as StoryContent,
		})),
		total,
	};
}

/**
 * Count words in story (from StoryVocabulary table)
 */
export async function countStoryWords(storyId: string): Promise<number> {
	return db.storyVocabulary.count({
		where: { storyId },
	});
}

// -----------------------------------------------------------------------------
// Story Log Queries (User Progress)
// -----------------------------------------------------------------------------

/**
 * Get user's story log (reading progress)
 */
export async function getStoryLog(userId: string, storyId: string) {
	return db.storyLog.findUnique({
		where: {
			userId_storyId: { userId, storyId },
		},
	});
}

/**
 * Create or update story log
 */
export async function upsertStoryLog(data: {
	userId: string;
	storyId: string;
	wordsCollected: number;
	totalWords: number;
	readTimeSeconds: number;
	analytics: StoryAnalytics;
	completedAt?: Date;
}) {
	return db.storyLog.upsert({
		where: {
			userId_storyId: {
				userId: data.userId,
				storyId: data.storyId,
			},
		},
		create: {
			userId: data.userId,
			storyId: data.storyId,
			wordsCollected: data.wordsCollected,
			totalWords: data.totalWords,
			readTimeSeconds: data.readTimeSeconds,
			analytics: data.analytics as Prisma.JsonObject,
			completedAt: data.completedAt,
		},
		update: {
			wordsCollected: data.wordsCollected,
			totalWords: data.totalWords,
			readTimeSeconds: data.readTimeSeconds,
			analytics: data.analytics as Prisma.JsonObject,
			completedAt: data.completedAt,
			updatedAt: new Date(),
		},
	});
}

/**
 * Mark story as completed
 */
export async function markStoryCompleted(
	userId: string,
	storyId: string,
	data: {
		wordsCollected: number;
		totalWords: number;
		readTimeSeconds: number;
		analytics: StoryAnalytics;
	},
) {
	return db.storyLog.upsert({
		where: {
			userId_storyId: { userId, storyId },
		},
		create: {
			userId,
			storyId,
			...data,
			analytics: data.analytics as Prisma.JsonObject,
			completedAt: new Date(),
		},
		update: {
			...data,
			analytics: data.analytics as Prisma.JsonObject,
			completedAt: new Date(),
			updatedAt: new Date(),
		},
	});
}

/**
 * Get user's completed stories (for progress tracking)
 */
export async function getUserCompletedStories(userId: string) {
	return db.storyLog.findMany({
		where: {
			userId,
			completedAt: { not: null },
		},
		include: {
			story: true,
		},
		orderBy: {
			completedAt: 'desc',
		},
	});
}

/**
 * Get user's in-progress stories
 */
export async function getUserInProgressStories(userId: string) {
	return db.storyLog.findMany({
		where: {
			userId,
			completedAt: null,
			wordsCollected: { gt: 0 }, // At least one word collected
		},
		include: {
			story: true,
		},
		orderBy: {
			updatedAt: 'desc',
		},
	});
}

// -----------------------------------------------------------------------------
// Story Vocabulary Queries
// -----------------------------------------------------------------------------

/**
 * Get vocabulary for story
 */
export async function getStoryVocabularies(storyId: string) {
	return db.storyVocabulary.findMany({
		where: { storyId },
		include: {
			vocabulary: true,
		},
		orderBy: {
			createdAt: 'asc',
		},
	});
}

/**
 * Add vocabulary to story
 * Used during seed/admin operations
 */
export async function addVocabularyToStory(data: {
	storyId: string;
	vocabularyId: string;
	positions: StoryPositions;
	wordSurface: string;
	wordReading: string;
	wordLength: number;
}) {
	return db.storyVocabulary.create({
		data: {
			storyId: data.storyId,
			vocabularyId: data.vocabularyId,
			positions: data.positions as Prisma.JsonObject,
			wordSurface: data.wordSurface,
			wordReading: data.wordReading,
			wordLength: data.wordLength,
		},
	});
}

// -----------------------------------------------------------------------------
// Integration Queries (For Flashcard System)
// -----------------------------------------------------------------------------

/**
 * Get vocabularies from collected words in story
 * Used to add words to user's flashcard review queue
 */
export async function getCollectedVocabularies(userId: string, storyId: string): Promise<string[]> {
	const log = await db.storyLog.findUnique({
		where: {
			userId_storyId: { userId, storyId },
		},
		select: {
			analytics: true,
		},
	});

	if (!log) return [];

	const analytics = log.analytics as StoryAnalytics;
	return analytics.clicked_words || [];
}

/**
 * Add collected words to user's review queue
 * Creates UserReview records for words that don't exist yet
 */
export async function addCollectedWordsToReviewQueue(userId: string, vocabularyIds: string[]) {
	// Get existing reviews to avoid duplicates
	const existingReviews = await db.userReview.findMany({
		where: {
			userId,
			vocabId: { in: vocabularyIds },
		},
		select: { vocabId: true },
	});

	const existingVocabIds = new Set(existingReviews.map((r) => r.vocabId));
	const newVocabIds = vocabularyIds.filter((id) => !existingVocabIds.has(id));

	if (newVocabIds.length === 0) return { created: 0, existing: existingVocabIds.size };

	// Create new reviews for collected words
	await db.userReview.createMany({
		data: newVocabIds.map((vocabId) => ({
			userId,
			vocabId,
			srsStage: 0, // New
			nextReviewAt: new Date(), // Available immediately
			stability: 0,
			difficulty: 0,
			elapsedDays: 0,
			scheduledDays: 0,
			reps: 0,
			lapses: 0,
			state: 0,
		})),
		skipDuplicates: true,
	});

	return { created: newVocabIds.length, existing: existingVocabIds.size };
}

// -----------------------------------------------------------------------------
// Admin/Seed Queries
// -----------------------------------------------------------------------------

/**
 * Create story (for seed scripts)
 */
export async function createStory(data: {
	slug: string;
	unitId: string;
	order: number;
	content: StoryContent;
	difficulty: string;
	category: string;
	readTimeMin: number;
	thumbnailUrl?: string;
	audioUrl?: string;
	contentStatus?: ContentStatus;
}) {
	return db.story.create({
		data: {
			...data,
			content: data.content as Prisma.JsonObject,
			contentStatus: data.contentStatus || ContentStatus.AI_GENERATED,
		},
	});
}

/**
 * Delete story (soft delete)
 */
export async function deleteStory(storyId: string) {
	return db.story.update({
		where: { id: storyId },
		data: { deletedAt: new Date() },
	});
}

/**
 * Bulk create story vocabularies (for seed)
 */
export async function bulkCreateStoryVocabularies(
	vocabularies: Array<{
		storyId: string;
		vocabularyId: string;
		positions: StoryPositions;
		wordSurface: string;
		wordReading: string;
		wordLength: number;
	}>,
) {
	return db.storyVocabulary.createMany({
		data: vocabularies.map((v) => ({
			...v,
			positions: v.positions as Prisma.JsonObject,
		})),
		skipDuplicates: true,
	});
}
