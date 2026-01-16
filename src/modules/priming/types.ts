/**
 * Priming Module - Types
 *
 * Re-exports and extends story-related types for the Contextual Story Reader feature
 */
import {
	MultiLangString,
	StoryAnalytics,
	StoryAnalyticsSchema,
	StoryContent,
	StoryContentSchema,
	StoryPositions,
	StoryPositionsSchema,
} from '@/lib/schemas/jsonb';
import { Story, StoryLog, StoryVocabulary, Vocabulary } from '@prisma/client';
import { z } from 'zod';

// Re-export schemas for validation
export {
	MultiLangString,
	StoryAnalytics,
	StoryAnalyticsSchema,
	StoryContent,
	StoryContentSchema,
	StoryPositions,
	StoryPositionsSchema,
};

// -----------------------------------------------------------------------------
// Extended Story Types with Parsed JSON
// -----------------------------------------------------------------------------

// Story with parsed content
export type StoryWithContent = Omit<Story, 'content'> & {
	content: StoryContent;
};

// Story with vocabularies and their positions
export type StoryWithVocabularies = StoryWithContent & {
	vocabularies: (StoryVocabulary & {
		vocabulary: Vocabulary;
		positions: StoryPositions;
	})[];
};

// Story log with parsed analytics and story relation
export type StoryLogWithStory = Omit<StoryLog, 'analytics'> & {
	analytics: StoryAnalytics;
	story: StoryWithContent;
};

// -----------------------------------------------------------------------------
// Text Segmentation Types (for rendering)
// -----------------------------------------------------------------------------

export type TextSegmentType = 'text' | 'vocab';

export type TextSegment =
	| {
			type: 'text';
			content: string;
	  }
	| {
			type: 'vocab';
			content: string;
			meta: VocabMeta;
	  };

export type VocabMeta = {
	vocabularyId: string;
	wordSurface: string;
	wordReading: string;
	meaningEn: string;
	meaningVi: string;
	hanViet?: string | null;
	audioUrl?: string | null;
	positions: StoryPositions;
};

// -----------------------------------------------------------------------------
// User Reading State (for collection mechanics)
// -----------------------------------------------------------------------------

export type WordCollectionState = {
	vocabularyId: string;
	collected: boolean;
	timestamp?: number;
};

export type StoryReadingState = {
	storyId: string;
	startTime: number;
	collectedWords: Map<string, WordCollectionState>;
	translationUsed: boolean;
	pausedTimes: number[];
	audioPlaysCount: number;
};

// -----------------------------------------------------------------------------
// Server Action Input/Output Schemas
// -----------------------------------------------------------------------------

// Get story by slug
export const GetStoryInputSchema = z.object({
	slug: z.string().min(1),
	language: z.enum(['en', 'vi']).default('en'),
});

export type GetStoryInput = z.infer<typeof GetStoryInputSchema>;

export type GetStoryOutput = {
	story: StoryWithVocabularies | null;
	hasRead: boolean;
	progress?: {
		wordsCollected: number;
		totalWords: number;
		readTimeSeconds: number;
	};
};

// Mark word as collected
export const MarkWordCollectedInputSchema = z.object({
	storyId: z.string().uuid(),
	vocabularyId: z.string().uuid(),
});

export type MarkWordCollectedInput = z.infer<typeof MarkWordCollectedInputSchema>;

// Update story progress
export const UpdateStoryProgressInputSchema = z.object({
	storyId: z.string().uuid(),
	wordsCollected: z.number().int().min(0),
	readTimeSeconds: z.number().int().min(0),
	analytics: StoryAnalyticsSchema,
});

export type UpdateStoryProgressInput = z.infer<typeof UpdateStoryProgressInputSchema>;

// Complete story
export const CompleteStoryInputSchema = z.object({
	storyId: z.string().uuid(),
	totalWords: z.number().int().min(1),
	readTimeSeconds: z.number().int().min(0),
	analytics: StoryAnalyticsSchema,
});

export type CompleteStoryInput = z.infer<typeof CompleteStoryInputSchema>;

// List stories
export const ListStoriesInputSchema = z.object({
	deckId: z.string().uuid().optional(),
	difficulty: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).optional(),
	category: z.string().optional(),
	limit: z.number().int().min(1).max(50).default(20),
	offset: z.number().int().min(0).default(0),
});

export type ListStoriesInput = z.infer<typeof ListStoriesInputSchema>;

export type ListStoriesOutput = {
	stories: (StoryWithContent & {
		progress?: {
			completedAt: Date | null;
			wordsCollected: number;
			totalWords: number;
		};
	})[];
	total: number;
	hasMore: boolean;
};

// -----------------------------------------------------------------------------
// Story Analytics Event Types (for tracking)
// -----------------------------------------------------------------------------

export type StoryAnalyticsEvent =
	| {
			type: 'story_started';
			storyId: string;
			language: 'en' | 'vi';
	  }
	| {
			type: 'word_clicked';
			storyId: string;
			vocabularyId: string;
			wordSurface: string;
			positionIndex: number; // Which occurrence was clicked (if word appears multiple times)
	  }
	| {
			type: 'word_collected';
			storyId: string;
			vocabularyId: string;
			collectionCount: number; // Total collected so far
			totalWords: number;
	  }
	| {
			type: 'translation_toggled';
			storyId: string;
			shown: boolean;
	  }
	| {
			type: 'audio_played';
			storyId: string;
			vocabularyId: string;
	  }
	| {
			type: 'story_completed';
			storyId: string;
			wordsCollected: number;
			totalWords: number;
			readTimeSeconds: number;
			translationUsed: boolean;
	  }
	| {
			type: 'story_paused';
			storyId: string;
			pausedAt: number; // Seconds since start
	  };
