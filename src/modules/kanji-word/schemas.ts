/**
 * KanjiWord Module - Validation Schemas
 *
 * Zod schemas for input validation
 */
import { z } from 'zod';

/**
 * Schema for validating kanji word surface and reading
 */
export const KanjiWordInputSchema = z.object({
	wordSurface: z.string().min(1, 'Word surface is required'),
	wordReading: z.string().min(1, 'Word reading is required'),
	wordRomaji: z.string().optional(),
});

/**
 * Schema for validating vocabulary cache input
 */
export const VocabCacheInputSchema = z.object({
	limit: z.number().int().min(1).max(2000).optional().default(1000),
});

export type KanjiWordInput = z.infer<typeof KanjiWordInputSchema>;
export type VocabCacheInput = z.infer<typeof VocabCacheInputSchema>;
