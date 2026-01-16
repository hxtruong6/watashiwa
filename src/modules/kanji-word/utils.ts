/**
 * KanjiWord Module - Utilities
 *
 * Helper functions for kanji detection, parsing, and rendering
 */
import { hasKanji, isKanji } from '@/lib/utils/furigana';
import type { Vocabulary } from '@prisma/client';

import { JLPT_COLORS } from './constants';
import { findVocabInCache, findVocabInIndex } from './utils/vocabCache';

// Re-export from optimized module for backward compatibility
export { findVocabInCache, findVocabInIndex, buildVocabIndex } from './utils/vocabCache';

/**
 * Build vocabulary cache as Map for fast lookup
 * Pure function - no database dependencies
 */
export function buildVocabCache(vocabs: Vocabulary[]): Map<string, Vocabulary> {
	const cache = new Map<string, Vocabulary>();

	for (const vocab of vocabs) {
		// Index by wordSurface for fast lookup
		cache.set(vocab.wordSurface, vocab);
	}

	return cache;
}

/**
 * Extract JLPT level from vocabulary tags
 */
export function extractJLPTLevel(tags: string[]): 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null {
	const jlptTag = tags.find((tag) => /^n[1-5]$/i.test(tag));
	if (!jlptTag) return null;
	return (jlptTag.toUpperCase() as 'N5' | 'N4' | 'N3' | 'N2' | 'N1') || null;
}

/**
 * Get JLPT level color for underline
 */
export function getJLPTColor(level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null): string {
	if (!level) return 'transparent';
	return JLPT_COLORS[level] || 'transparent';
}

/**
 * Parse text to find kanji words
 * Returns segments with vocabulary matches
 *
 * Performance: O(n*m) where n = text length, m = cache size
 * For better performance with large caches, use indexed cache (buildVocabIndex)
 *
 * @param text - Text to parse for kanji words
 * @param vocabCache - Map of wordSurface -> Vocabulary (or indexed cache)
 * @param useIndex - Whether to use indexed lookup (requires indexed cache)
 * @returns Array of text/kanji segments with vocabulary matches
 *
 * @example
 * ```typescript
 * const segments = parseTextForKanji("私は学校に行きます", vocabCache);
 * // [
 * //   { type: 'text', content: '私は', ... },
 * //   { type: 'kanji', content: '学校', vocab: {...}, ... },
 * //   { type: 'text', content: 'に', ... },
 * //   { type: 'kanji', content: '行きます', vocab: {...}, ... }
 * // ]
 * ```
 */
export function parseTextForKanji(
	text: string,
	vocabCache: Map<string, Vocabulary> | Map<string, Map<string, Vocabulary>>,
	useIndex = false,
): Array<{
	type: 'kanji' | 'text';
	content: string;
	vocab?: Vocabulary;
	startIndex: number;
	endIndex: number;
}> {
	const segments: Array<{
		type: 'kanji' | 'text';
		content: string;
		vocab?: Vocabulary;
		startIndex: number;
		endIndex: number;
	}> = [];
	let currentIndex = 0;
	let kanjiBuffer = '';
	let kanjiStartIndex = -1;

	// Iterate through text character by character
	const chars = Array.from(text);

	for (let i = 0; i < chars.length; i++) {
		const char = chars[i];

		if (isKanji(char)) {
			// Start or continue kanji sequence
			if (kanjiBuffer === '') {
				kanjiStartIndex = i;
			}
			kanjiBuffer += char;
		} else {
			// Non-kanji character encountered
			if (kanjiBuffer !== '') {
				// We have accumulated kanji, try to find it in cache
				const vocab =
					useIndex && vocabCache instanceof Map && vocabCache.size > 0
						? findVocabInIndex(kanjiBuffer, vocabCache as Map<string, Map<string, Vocabulary>>)
						: findVocabInCache(kanjiBuffer, vocabCache as Map<string, Vocabulary>);

				// Add text segment before kanji (if any)
				if (kanjiStartIndex > currentIndex) {
					const textContent = text.slice(currentIndex, kanjiStartIndex);
					if (textContent.length > 0) {
						segments.push({
							type: 'text',
							content: textContent,
							startIndex: currentIndex,
							endIndex: kanjiStartIndex,
						});
					}
				}

				// Add kanji segment
				segments.push({
					type: 'kanji',
					content: kanjiBuffer,
					vocab: vocab || undefined,
					startIndex: kanjiStartIndex,
					endIndex: i,
				});

				currentIndex = i;
				kanjiBuffer = '';
				kanjiStartIndex = -1;
			}

			// Continue to next character
			currentIndex = i + 1;
		}
	}

	// Handle trailing kanji (if text ends with kanji)
	if (kanjiBuffer !== '') {
		// Add text segment before kanji (if any)
		if (kanjiStartIndex > currentIndex) {
			const textContent = text.slice(currentIndex, kanjiStartIndex);
			if (textContent.length > 0) {
				segments.push({
					type: 'text',
					content: textContent,
					startIndex: currentIndex,
					endIndex: kanjiStartIndex,
				});
			}
		}

		// Add kanji segment
		const vocab =
			useIndex && vocabCache instanceof Map && vocabCache.size > 0
				? findVocabInIndex(kanjiBuffer, vocabCache as Map<string, Map<string, Vocabulary>>)
				: findVocabInCache(kanjiBuffer, vocabCache as Map<string, Vocabulary>);
		segments.push({
			type: 'kanji',
			content: kanjiBuffer,
			vocab: vocab || undefined,
			startIndex: kanjiStartIndex,
			endIndex: text.length,
		});

		currentIndex = text.length;
	}

	// Add remaining text after last kanji (if any)
	if (currentIndex < text.length) {
		const remaining = text.slice(currentIndex);
		if (remaining.length > 0) {
			segments.push({
				type: 'text',
				content: remaining,
				startIndex: currentIndex,
				endIndex: text.length,
			});
		}
	}

	return segments;
}

/**
 * Check if text contains kanji
 */
export function textHasKanji(text: string): boolean {
	return hasKanji(text);
}
