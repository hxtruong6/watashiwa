/**
 * Furigana Utilities
 *
 * Functions for generating and using precise kanji-reading mappings
 * for accurate furigana rendering (reading only above kanji, not kana)
 */
import type { FuriganaMapping, FuriganaMappingItem } from '@/lib/schemas/jsonb';

/**
 * Check if a character is kanji
 */
export function isKanji(char: string): boolean {
	return /[\p{Script=Han}]/gu.test(char);
}

/**
 * Check if a character is hiragana
 */
export function isHiragana(char: string): boolean {
	return /[\u3040-\u309F]/g.test(char);
}

/**
 * Check if a character is katakana
 */
export function isKatakana(char: string): boolean {
	return /[\u30A0-\u30FF]/g.test(char);
}

/**
 * Check if a character is kana (hiragana or katakana)
 */
export function isKana(char: string): boolean {
	return isHiragana(char) || isKatakana(char);
}

/**
 * Check if text contains only kanji characters
 */
export function isKanjiOnly(text: string): boolean {
	if (!text) return false;
	return /^[\p{Script=Han}]+$/gu.test(text);
}

/**
 * Check if text contains only katakana characters
 */
export function isKatakanaOnly(text: string): boolean {
	if (!text) return false;
	return /^[\u30A0-\u30FF]+$/g.test(text);
}

/**
 * Check if text contains only hiragana characters
 */
export function isHiraganaOnly(text: string): boolean {
	if (!text) return false;
	return /^[\u3040-\u309F]+$/g.test(text);
}

/**
 * Check if text contains kanji characters (at least one)
 */
export function hasKanji(text: string): boolean {
	if (!text) return false;
	return /[\p{Script=Han}]/gu.test(text);
}

/**
 * Generate furigana mapping from wordSurface and wordReading
 *
 * This is a simplified algorithm that works for most cases.
 * For complex cases (multiple kanji with different readings),
 * manual mapping may be required.
 *
 * Algorithm:
 * 1. Find all kanji characters in wordSurface
 * 2. For each kanji, find its corresponding reading segment in wordReading
 * 3. Store the mapping with positions
 *
 * Example:
 * - wordSurface: "休みます"
 * - wordReading: "やすみます"
 * - Result: [{ kanji: "休", reading: "やす", surfaceIndex: 0, readingStart: 0, readingEnd: 2 }]
 */
export function generateFuriganaMapping(
	wordSurface: string,
	wordReading: string,
): FuriganaMapping | null {
	if (!wordSurface || !wordReading) {
		return null;
	}

	// Check if word contains kanji
	const hasKanji = /[\p{Script=Han}]/gu.test(wordSurface);
	if (!hasKanji) {
		return null; // No kanji, no furigana needed
	}

	const mappings: FuriganaMappingItem[] = [];
	const surfaceChars = Array.from(wordSurface);
	const readingChars = Array.from(wordReading);

	let readingIndex = 0;
	let kanjiBuffer = '';
	let kanjiStartIndex = -1;

	for (let i = 0; i < surfaceChars.length; i++) {
		const char = surfaceChars[i];

		if (isKanji(char)) {
			// Start or continue kanji sequence
			if (kanjiBuffer === '') {
				kanjiStartIndex = i;
			}
			kanjiBuffer += char;
		} else {
			// Non-kanji character (kana, punctuation, etc.)
			if (kanjiBuffer !== '') {
				// We have accumulated kanji, now we need to find its reading
				// The reading should be the segment before the matching kana
				const readingStart = readingIndex;
				let readingEnd = readingIndex;

				// Find where the kana part starts in the reading
				// Skip reading characters until we match the kana part
				while (readingEnd < readingChars.length && readingIndex < i) {
					if (isKana(readingChars[readingEnd])) {
						// Check if this kana matches the current surface kana
						if (readingChars[readingEnd] === char) {
							break;
						}
					}
					readingEnd++;
				}

				// Extract reading segment for the kanji
				const reading = readingChars.slice(readingStart, readingEnd).join('');

				if (reading) {
					mappings.push({
						kanji: kanjiBuffer,
						reading,
						surfaceIndex: kanjiStartIndex,
						readingStart,
						readingEnd,
					});
				}

				readingIndex = readingEnd;
				kanjiBuffer = '';
				kanjiStartIndex = -1;
			}

			// Advance reading index for kana characters
			if (isKana(char) && readingIndex < readingChars.length) {
				// Find matching kana in reading
				while (readingIndex < readingChars.length) {
					if (readingChars[readingIndex] === char) {
						readingIndex++;
						break;
					}
					readingIndex++;
				}
			}
		}
	}

	// Handle trailing kanji (if word ends with kanji)
	if (kanjiBuffer !== '') {
		const reading = readingChars.slice(readingIndex).join('');
		if (reading) {
			mappings.push({
				kanji: kanjiBuffer,
				reading,
				surfaceIndex: kanjiStartIndex,
				readingStart: readingIndex,
				readingEnd: readingChars.length,
			});
		}
	}

	return mappings.length > 0 ? { mappings } : null;
}

/**
 * Render wordSurface with precise furigana using the mapping
 * Returns JSX-ready structure for rendering
 */
export function renderFurigana(
	wordSurface: string,
	furiganaMapping: FuriganaMapping | null,
): Array<{ text: string; reading: string | null; isKanji: boolean }> {
	if (!furiganaMapping || furiganaMapping.mappings.length === 0) {
		// No mapping, return as plain text
		return Array.from(wordSurface).map((char) => ({
			text: char,
			reading: null,
			isKanji: isKanji(char),
		}));
	}

	const result: Array<{ text: string; reading: string | null; isKanji: boolean }> = [];
	const surfaceChars = Array.from(wordSurface);
	const mappings = furiganaMapping.mappings.sort((a, b) => a.surfaceIndex - b.surfaceIndex);

	let mappingIndex = 0;
	let i = 0;

	while (i < surfaceChars.length) {
		const currentMapping = mappings[mappingIndex];

		if (currentMapping && i === currentMapping.surfaceIndex) {
			// We're at a kanji position
			const kanjiLength = Array.from(currentMapping.kanji).length;
			result.push({
				text: currentMapping.kanji,
				reading: currentMapping.reading,
				isKanji: true,
			});
			i += kanjiLength;
			mappingIndex++;
		} else {
			// Regular character (kana, punctuation, etc.)
			result.push({
				text: surfaceChars[i],
				reading: null,
				isKanji: false,
			});
			i++;
		}
	}

	return result;
}
