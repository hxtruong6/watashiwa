/**
 * Priming Module - Server Actions
 *
 * Handles story fetching, authorization, and progress tracking
 */

'use server';

import { prisma } from '@/lib/db';
import { StoryContentSchema } from '@/lib/schemas/jsonb';
import { executeSafeAction } from '@/modules/core/action-client';
import { unstable_cache } from 'next/cache';
import { z } from 'zod';

import { MarkStoryReadSchema, StoryResponse, StoryWithContent } from './types';

// Input validation schema
const GetStoryByUnitSchema = z.object({
	unitId: z.string().uuid(),
});

/**
 * Get story content (cached, no authorization)
 * Only caches the story data itself, not authorization checks
 */
const getStoryContentCached = unstable_cache(
	async (unitId: string) => {
		const story = await prisma.story.findFirst({
			where: { unitId },
			select: {
				id: true,
				unitId: true,
				content: true,
				audioUrl: true,
				contentStatus: true,
				createdAt: true,
			},
		});
		return story;
	},
	['story-content'],
	{
		revalidate: 3600, // 1 hour
		tags: ['stories'],
	},
);

/**
 * Get story by unit ID with authorization check
 *
 * Security: Verifies user has access to the deck (public or owned)
 * Performance: Caches story content separately from authorization checks
 *
 * IMPORTANT: Authorization is NOT cached to prevent cross-user cache pollution
 */
const getStoryByUnitUncached = async (
	unitId: string,
	userId: string | null,
): Promise<StoryWithContent | null> => {
	// 1. Check deck access (authorization) - NOT CACHED for security
	const deck = await prisma.deck.findUnique({
		where: { id: unitId },
		select: { id: true, isPublic: true, authorId: true },
	});

	if (!deck) {
		return null;
	}

	// Authorization check: user must have access to deck
	if (!deck.isPublic && deck.authorId !== userId) {
		// Return null instead of throwing to allow graceful handling
		return null;
	}

	// 2. Get cached story content (safe to cache as it's public data)
	const story = await getStoryContentCached(unitId);
	if (!story) {
		return null;
	}

	// 3. Validate and parse content
	const contentValidation = StoryContentSchema.safeParse(story.content);
	if (!contentValidation.success) {
		console.error('Invalid story content:', contentValidation.error);
		// Return null instead of throwing for graceful degradation
		return null;
	}

	return {
		...story,
		content: contentValidation.data,
	};
};

/**
 * Get story by unit with authorization and caching
 */
export async function getStoryByUnit(input: { unitId: string }) {
	return executeSafeAction(
		GetStoryByUnitSchema,
		input,
		async ({ unitId }, { userId }) => {
			const story = await getStoryByUnitUncached(unitId, userId);

			if (!story) {
				return { story: null, hasRead: false } as StoryResponse;
			}

			// Check if user has read this story
			let hasRead = false;
			if (userId) {
				const storyLog = await prisma.storyLog.findUnique({
					where: {
						userId_storyId: {
							userId,
							storyId: story.id,
						},
					},
				});
				hasRead = !!storyLog;
			}

			return { story, hasRead } as StoryResponse;
		},
		{ requireAuth: false }, // Allow unauthenticated users to read public stories
	);
}

/**
 * Check if user has read story for a unit
 * Optimized query with single JOIN
 */
export async function hasReadStory(input: { unitId: string }) {
	return executeSafeAction(
		z.object({ unitId: z.string().uuid() }),
		input,
		async ({ unitId }, { userId }) => {
			if (!userId) {
				return false;
			}

			// Optimized: Single query with JOIN
			const storyLog = await prisma.storyLog.findFirst({
				where: {
					userId,
					story: {
						unitId,
					},
				},
				select: { id: true },
			});

			return !!storyLog;
		},
		{ requireAuth: true },
	);
}

/**
 * Mark story as read
 * Creates StoryLog entry
 */
export async function markStoryRead(input: { storyId: string }) {
	return executeSafeAction(
		MarkStoryReadSchema,
		input,
		async ({ storyId }, { userId }) => {
			if (!userId) {
				throw new Error('Unauthorized');
			}

			// Check if story exists
			const story = await prisma.story.findUnique({
				where: { id: storyId },
				select: { id: true },
			});

			if (!story) {
				throw new Error('Story not found');
			}

			// Upsert to handle duplicate clicks gracefully
			const storyLog = await prisma.storyLog.upsert({
				where: {
					userId_storyId: {
						userId,
						storyId,
					},
				},
				create: {
					userId,
					storyId,
					completedAt: new Date(),
				},
				update: {
					completedAt: new Date(),
				},
			});

			return { success: true, storyLog };
		},
		{ requireAuth: true },
	);
}

/**
 * Get session data with optimized story check
 * Single query to fetch deck, story, and storyLog status
 */
export async function getSessionDataWithPriming(input: { deckId: string }) {
	return executeSafeAction(
		z.object({ deckId: z.string().uuid() }),
		input,
		async ({ deckId }, { userId }) => {
			if (!userId) {
				throw new Error('Unauthorized');
			}

			// Optimized: Single query with all relations
			const deck = await prisma.deck.findUnique({
				where: { id: deckId },
				select: {
					id: true,
					isPublic: true,
					authorId: true,
					stories: {
						include: {
							storyLogs: {
								where: { userId },
								select: { id: true },
							},
						},
					},
				},
			});

			if (!deck) {
				throw new Error('Deck not found');
			}

			// Authorization check
			if (!deck.isPublic && deck.authorId !== userId) {
				throw new Error('Unauthorized: Deck not accessible');
			}

			const story = deck.stories[0] || null;
			const hasReadStory = story ? story.storyLogs.length > 0 : false;

			// Parse story content if exists
			let storyWithContent: StoryWithContent | null = null;
			if (story) {
				const contentValidation = StoryContentSchema.safeParse(story.content);
				if (contentValidation.success) {
					storyWithContent = {
						...story,
						content: contentValidation.data,
					};
				}
			}

			return {
				deck,
				story: storyWithContent,
				hasReadStory,
				requiresPriming: story && !hasReadStory,
			};
		},
		{ requireAuth: true },
	);
}
