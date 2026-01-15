/**
 * Video Module - Server Actions
 *
 * All Server Actions use executeSafeAction wrapper for authentication and validation
 */
'use server';

import { executeSafeAction } from '@/modules/core/action-client';
import { z } from 'zod';

import * as videoData from './data';

// -----------------------------------------------------------------------------
// 1. INPUT SCHEMAS
// -----------------------------------------------------------------------------

const GetVideoDataSchema = z.object({
	videoId: z.uuid(),
});

const UpdateVideoProgressSchema = z.object({
	videoId: z.uuid(),
	currentTime: z.number().min(0),
	watchTime: z.number().min(0),
});

const MarkVideoCompletedSchema = z.object({
	videoId: z.uuid(),
});

// -----------------------------------------------------------------------------
// 2. SERVER ACTIONS
// -----------------------------------------------------------------------------

/**
 * Get video data with subtitles
 * Requires authentication
 */
export async function getVideoData(input: unknown) {
	return executeSafeAction(
		GetVideoDataSchema,
		input,
		async (data) => {
			// userId is guaranteed by requireAuth: true
			const video = await videoData.getVideoById(data.videoId);

			if (!video) {
				throw new Error('Video not found');
			}

			return video;
		},
		{ requireAuth: true },
	);
}

/**
 * Update video progress
 * Requires authentication
 */
export async function updateVideoProgress(input: unknown) {
	return executeSafeAction(
		UpdateVideoProgressSchema,
		input,
		async (data, { userId }) => {
			// userId is guaranteed by requireAuth: true
			if (!userId) {
				throw new Error('Unauthorized');
			}

			const progress = await videoData.upsertVideoProgress(userId, data.videoId, {
				currentTime: data.currentTime,
				watchTime: data.watchTime,
			});

			return progress;
		},
		{ requireAuth: true },
	);
}

/**
 * Mark video as completed
 * Requires authentication
 */
export async function markVideoCompleted(input: unknown) {
	return executeSafeAction(
		MarkVideoCompletedSchema,
		input,
		async (data, { userId }) => {
			// userId is guaranteed by requireAuth: true
			if (!userId) {
				throw new Error('Unauthorized');
			}

			// Get current progress to preserve watchTime
			const currentProgress = await videoData.getUserVideoProgress(userId, data.videoId);

			const progress = await videoData.upsertVideoProgress(userId, data.videoId, {
				completed: true,
				currentTime: currentProgress?.currentTime ?? 0,
				watchTime: currentProgress?.watchTime ?? 0,
			});

			return progress;
		},
		{ requireAuth: true },
	);
}
