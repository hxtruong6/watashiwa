/**
 * Video Module - Data Layer
 *
 * Handles all Prisma queries for Video operations
 */
import { prisma } from '@/lib/db';
import { Subtitle as PrismaSubtitle } from '@prisma/client';
import { z } from 'zod';

import { SubtitleWordSchema } from './types';
import type { Subtitle, SubtitleWord, Video, VideoProgress } from './types';

/**
 * Translation schema for JSONB validation
 */
const TranslationSchema = z.object({
	vi: z.string(),
	en: z.string().optional(),
});

/**
 * Parse JSONB subtitle fields into typed objects with Zod validation
 */

function parseSubtitle(subtitle: PrismaSubtitle): Subtitle {
	// Parse and validate translation JSONB with Zod
	let translation: { vi: string; en?: string };
	try {
		translation = TranslationSchema.parse(subtitle.translation);
	} catch (error) {
		console.warn('Invalid translation format for subtitle:', subtitle.id, error);
		// Fallback to safe default
		translation = { vi: String(subtitle.translation || '') };
	}

	// Parse and validate words JSONB with Zod
	let words: SubtitleWord[];
	try {
		const wordsArray = z.array(SubtitleWordSchema).parse(subtitle.words);
		words = wordsArray;
	} catch (error) {
		console.warn('Invalid words format for subtitle:', subtitle.id, error);
		// Fallback to empty array
		words = [];
	}

	return {
		id: subtitle.id,
		videoId: subtitle.videoId,
		startTime: subtitle.startTime,
		endTime: subtitle.endTime,
		sentence: subtitle.sentence,
		translation,
		words,
		order: subtitle.order,
		createdAt: subtitle.createdAt,
		updatedAt: subtitle.updatedAt,
	};
}

/**
 * Fetch a single video by ID with subtitles
 * Only returns published videos (filters by contentStatus)
 * Returns null if video not found or not published
 */
export async function getVideoById(videoId: string): Promise<Video | null> {
	try {
		const video = await prisma.video.findUnique({
			where: { id: videoId },
			include: {
				subtitles: {
					orderBy: { order: 'asc' },
				},
			},
		});

		if (!video) {
			return null;
		}

		// Only return published videos
		if (video.contentStatus !== 'PUBLISHED') {
			return null;
		}

		// Parse subtitles
		const parsedSubtitles = video.subtitles.map(parseSubtitle);

		return {
			...video,
			subtitles: parsedSubtitles,
		};
	} catch (error) {
		console.error('Error fetching video by ID:', error);
		// Re-throw for Server Action to handle
		throw error;
	}
}

/**
 * Fetch subtitles for a video
 * Returns empty array if video not found or has no subtitles
 */
export async function getVideoSubtitles(videoId: string): Promise<Subtitle[]> {
	try {
		const subtitles = await prisma.subtitle.findMany({
			where: { videoId },
			orderBy: { order: 'asc' },
		});

		return subtitles.map(parseSubtitle);
	} catch (error) {
		console.error('Error fetching video subtitles:', error);
		// Return empty array for graceful degradation
		return [];
	}
}

/**
 * Get user's video progress
 * Returns null if no progress found
 */
export async function getUserVideoProgress(
	userId: string,
	videoId: string,
): Promise<VideoProgress | null> {
	try {
		const videoLog = await prisma.videoLog.findUnique({
			where: {
				userId_videoId: {
					userId,
					videoId,
				},
			},
		});

		if (!videoLog) {
			return null;
		}

		return videoLog;
	} catch (error) {
		console.error('Error fetching user video progress:', error);
		return null;
	}
}

/**
 * Upsert video progress (create or update)
 * Increments playCount on each update
 */
export async function upsertVideoProgress(
	userId: string,
	videoId: string,
	progress: Partial<VideoProgress>,
): Promise<VideoProgress> {
	try {
		// Get existing progress to increment playCount
		const existing = await prisma.videoLog.findUnique({
			where: {
				userId_videoId: {
					userId,
					videoId,
				},
			},
		});

		const playCount = existing ? existing.playCount + 1 : 1;

		const videoLog = await prisma.videoLog.upsert({
			where: {
				userId_videoId: {
					userId,
					videoId,
				},
			},
			create: {
				userId,
				videoId,
				currentTime: progress.currentTime ?? 0,
				completed: progress.completed ?? false,
				watchTime: progress.watchTime ?? 0,
				playCount: 1,
				lastWatched: new Date(),
			},
			update: {
				currentTime: progress.currentTime ?? existing?.currentTime ?? 0,
				completed: progress.completed ?? existing?.completed ?? false,
				watchTime: progress.watchTime ?? existing?.watchTime ?? 0,
				playCount,
				lastWatched: new Date(),
			},
		});

		return videoLog;
	} catch (error) {
		console.error('Error upserting video progress:', error);
		throw error; // Re-throw for Server Action to handle
	}
}
