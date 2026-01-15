import {
	Subtitle as PrismaSubtitle,
	Video as PrismaVideo,
	VideoLog as PrismaVideoLog,
} from '@prisma/client';
import { z } from 'zod';

// -----------------------------------------------------------------------------
// 1. ZOD SCHEMAS FOR VALIDATION
// -----------------------------------------------------------------------------

/**
 * Word-level timing data within a subtitle
 */
export const SubtitleWordSchema = z.object({
	text: z.string(),
	romaji: z.string(),
	startTime: z.number().min(0),
	endTime: z.number().min(0),
	color: z.enum(['yellow', 'green', 'purple', 'red', 'blue', 'light-blue']).optional(),
	type: z.string().optional(),
});

/**
 * Subtitle with word-level timing
 */
export const SubtitleSchema = z.object({
	id: z.string(),
	order: z.number().int().min(1),
	startTime: z.number().min(0),
	endTime: z.number().min(0),
	sentence: z.string(),
	translation: z.object({
		vi: z.string(),
		en: z.string().optional(),
	}),
	words: z.array(SubtitleWordSchema),
});

/**
 * Complete video subtitle file format (for JSON import)
 */
export const VideoSubtitleFileSchema = z.object({
	version: z.string().default('1.0'),
	videoId: z.string(),
	language: z.string().default('ja'),
	targetLanguage: z.string().default('vi'),
	subtitles: z.array(SubtitleSchema),
});

// -----------------------------------------------------------------------------
// 2. TYPESCRIPT TYPES
// -----------------------------------------------------------------------------

/**
 * Word-level timing data
 */
export type SubtitleWord = z.infer<typeof SubtitleWordSchema>;

/**
 * Subtitle with parsed JSONB fields
 * Extends Prisma Subtitle type with typed translation and words
 */
export interface Subtitle extends Omit<PrismaSubtitle, 'translation' | 'words'> {
	translation: {
		vi: string;
		en?: string;
	};
	words: SubtitleWord[];
}

/**
 * Video with parsed subtitles
 * Extends Prisma Video type with typed subtitles array
 */
export interface Video extends Omit<PrismaVideo, 'subtitles'> {
	subtitles: Subtitle[];
}

/**
 * Video progress tracking
 * Type alias for VideoLog (maintained for API clarity)
 */
export type VideoProgress = PrismaVideoLog;

/**
 * Video subtitle file format (for JSON import)
 */
export type VideoSubtitleFile = z.infer<typeof VideoSubtitleFileSchema>;

// -----------------------------------------------------------------------------
// 3. HELPER TYPES
// -----------------------------------------------------------------------------

/**
 * Video player state
 */
export interface VideoPlayerState {
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	playbackRate: number; // 0.5, 0.75, 1.0, 1.25, 1.5, 2.0
	volume: number;
	isMuted: boolean;
	activeSubtitleId: string | null;
	activeWordIndex: number | null;
}
