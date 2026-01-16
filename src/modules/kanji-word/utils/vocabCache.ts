/**
 * Vocabulary Cache Utilities
 *
 * Optimized vocabulary lookup functions
 * Uses prefix indexing for better performance
 */

import type { Vocabulary } from '@prisma/client';

/**
 * Index vocabulary by first character for faster lookup
 * This creates a prefix index to reduce search space
 */
export function buildVocabIndex(vocabs: Vocabulary[]): Map<string, Map<string, Vocabulary>> {
	const index = new Map<string, Map<string, Vocabulary>>();

	for (const vocab of vocabs) {
		if (!vocab.wordSurface || vocab.wordSurface.length === 0) continue;

		const firstChar = vocab.wordSurface[0];
		if (!index.has(firstChar)) {
			index.set(firstChar, new Map());
		}

		const charMap = index.get(firstChar)!;
		charMap.set(vocab.wordSurface, vocab);
	}

	return index;
}

/**
 * Find vocabulary in indexed cache
 * Uses prefix indexing for O(1) first character lookup, then O(n) within that group
 * Much faster than iterating through entire cache
 *
 * @param wordSurface - The kanji word to find
 * @param index - Indexed vocabulary cache
 * @returns Matching vocabulary or null
 */
export function findVocabInIndex(
	wordSurface: string,
	index: Map<string, Map<string, Vocabulary>>,
): Vocabulary | null {
	if (!wordSurface || wordSurface.length === 0) return null;

	const firstChar = wordSurface[0];
	const charMap = index.get(firstChar);

	if (!charMap) return null;

	// Exact match first (O(1) lookup)
	if (charMap.has(wordSurface)) {
		return charMap.get(wordSurface) || null;
	}

	// Try to find longest matching word (for compound words)
	// Only search within words starting with same character
	let longestMatch: Vocabulary | null = null;
	let longestLength = 0;

	for (const [key, vocab] of charMap.entries()) {
		if (wordSurface.startsWith(key) && key.length > longestLength) {
			longestMatch = vocab;
			longestLength = key.length;
		}
	}

	return longestMatch;
}

/**
 * Fallback: Find vocabulary in flat cache (original implementation)
 * Used when index is not available
 */
export function findVocabInCache(
	wordSurface: string,
	cache: Map<string, Vocabulary>,
): Vocabulary | null {
	if (!wordSurface || wordSurface.length === 0) return null;

	// Exact match first
	if (cache.has(wordSurface)) {
		return cache.get(wordSurface) || null;
	}

	// Try to find longest matching word (for compound words)
	let longestMatch: Vocabulary | null = null;
	let longestLength = 0;

	for (const [key, vocab] of cache.entries()) {
		if (wordSurface.startsWith(key) && key.length > longestLength) {
			longestMatch = vocab;
			longestLength = key.length;
		}
	}

	return longestMatch;
}
