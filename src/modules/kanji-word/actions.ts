/**
 * KanjiWord Module - Server Actions
 *
 * Server actions for fetching vocabulary cache
 */
'use server';

import { executeSafeAction } from '@/modules/core/action-client';
import { z } from 'zod';

import { getTopVocabCache, getVocabByWordSurface } from './data';

const GetVocabCacheSchema = z.object({
	limit: z.number().int().min(1).max(2000).optional().default(1000),
});

/**
 * Get top vocabulary for caching (public, no auth required)
 * Used for auto-detection in KanjiWord component
 */
export async function getVocabCacheAction(input: unknown) {
	return executeSafeAction(
		GetVocabCacheSchema,
		input,
		async (data) => {
			const vocabs = await getTopVocabCache(data.limit);
			return vocabs;
		},
		{ requireAuth: false }, // Public endpoint for demo/testing
	);
}

/**
 * Get vocabulary cache as serializable array
 * Returns array instead of Map (Maps don't serialize well)
 */
export async function getVocabCacheArrayAction(input: unknown) {
	return executeSafeAction(
		GetVocabCacheSchema,
		input,
		async (data) => {
			const vocabs = await getTopVocabCache(data.limit);
			// Return as array - client will build Map
			return vocabs;
		},
		{ requireAuth: false },
	);
}

const GetVocabByWordSurfaceSchema = z.object({
	wordSurface: z.string().min(1),
});

/**
 * Get vocabulary by wordSurface (on-demand fetch)
 * Used when word is not in cache and user hovers/clicks on kanji
 */
export async function getVocabByWordSurfaceAction(input: unknown) {
	return executeSafeAction(
		GetVocabByWordSurfaceSchema,
		input,
		async (data) => {
			const vocab = await getVocabByWordSurface(data.wordSurface);
			return vocab;
		},
		{ requireAuth: false }, // Public endpoint
	);
}
