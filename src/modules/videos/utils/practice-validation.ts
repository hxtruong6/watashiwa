/**
 * Practice validation utilities - Kana mode (Phase 1)
 *
 * Compares user input to expected text by normalizing both to hiragana.
 * Expected: word.romaji → hiragana via wanakana.toKana
 * User: trim, collapse spaces, then wanakana.toHiragana (katakana/romaji → hiragana)
 */
import * as wanakana from 'wanakana';

const ZERO_WIDTH_AND_INVISIBLE = /[\u200B-\u200D\u2060\uFEFF]/g;

/**
 * Normalize string for comparison: trim, collapse spaces, remove zero-width/invisible, Unicode NFC
 */
export function normalizeSpaces(s: string): string {
	const trimmed = s.trim().replace(/\s+/g, ' ').replace(ZERO_WIDTH_AND_INVISIBLE, '');
	return typeof trimmed.normalize === 'function' ? trimmed.normalize('NFC') : trimmed;
}

/**
 * Convert expected text to hiragana for Kana mode comparison.
 * - Romaji (e.g. from word.romaji): use wanakana.toKana(romaji)
 * - Japanese text (e.g. sentence when words is empty): use wanakana.toHiragana
 */
export function expectedToHiragana(romajiOrText: string): string {
	const normalized = normalizeSpaces(romajiOrText);
	if (!normalized) return '';
	let result: string;
	if (wanakana.isRomaji(normalized)) {
		result = wanakana.toKana(normalized.toLowerCase(), { IMEMode: false });
	} else {
		result = wanakana.toHiragana(normalized, { passRomaji: false });
	}
	return typeof result.normalize === 'function' ? result.normalize('NFC') : result;
}

/**
 * Convert user input to hiragana for Kana mode comparison.
 * Handles hiragana, katakana, romaji. Kanji is passed through (wanakana does not convert kanji to reading).
 */
export function userInputToHiragana(input: string): string {
	const normalized = normalizeSpaces(input);
	if (!normalized) return '';
	const result = wanakana.toHiragana(normalized, { passRomaji: false });
	return typeof result.normalize === 'function' ? result.normalize('NFC') : result;
}

export type ValidationMode = 'kana';

export interface KanaCompareResult {
	correct: boolean;
	expectedHiragana: string;
	userHiragana: string;
}

/**
 * Normalize for full-sentence comparison: trim, collapse spaces, then remove all spaces.
 * Japanese sentences often have no spaces; this allows both "みどり さん" and "みどりさん" to match.
 */
export function normalizeForFullComparison(s: string): string {
	return normalizeSpaces(s).replace(/\s/g, '');
}

/**
 * Compare user answer to expected text in Kana mode.
 * Both are normalized (trim, collapse spaces) and expected is converted from romaji to hiragana,
 * user input is converted to hiragana where possible.
 */
export function compareKana(userAnswer: string, expectedRomajiOrText: string): KanaCompareResult {
	const expectedHiragana = expectedToHiragana(expectedRomajiOrText);
	const userHiragana = userInputToHiragana(userAnswer);
	const correct = expectedHiragana === userHiragana;
	return { correct, expectedHiragana, userHiragana };
}

/**
 * Compare full sentence: normalize to hiragana then compare without spaces (lenient).
 */
export function compareKanaFullSentence(userAnswer: string, expectedHiragana: string): boolean {
	const userHiragana = userInputToHiragana(userAnswer);
	return normalizeForFullComparison(expectedHiragana) === normalizeForFullComparison(userHiragana);
}

/**
 * Validate a single segment (one blank or one word) in Kana mode.
 */
export function validateSegmentKana(userSegment: string, expectedRomaji: string): boolean {
	const { correct } = compareKana(userSegment, expectedRomaji);
	return correct;
}
