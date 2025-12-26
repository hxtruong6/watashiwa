/**
 * Priming Module - Types
 *
 * Re-exports and extends story-related types for the priming feature
 */
import { StoryContent, StoryContentSchema, StoryHighlightSchema } from '@/lib/schemas/jsonb';
import { Story, StoryLog } from '@prisma/client';
import { z } from 'zod';

// Re-export schemas for validation
export { StoryContentSchema, StoryHighlightSchema };
export type { StoryContent };

// Extended Story type with parsed content
export type StoryWithContent = Story & {
	content: StoryContent;
};

// Story log with story relation
export type StoryLogWithStory = StoryLog & {
	story: StoryWithContent;
};

// Response type for getStoryByUnit
export type StoryResponse = {
	story: StoryWithContent | null;
	hasRead: boolean;
};

// Mark story as read input
export const MarkStoryReadSchema = z.object({
	storyId: z.string().uuid(),
});

export type MarkStoryReadInput = z.infer<typeof MarkStoryReadSchema>;
