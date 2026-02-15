'use client';

import { useCallback } from 'react';

import type { Subtitle } from '../types';
import {
	compareKanaFullSentence,
	expectedToHiragana,
	normalizeSpaces,
	validateSegmentKana,
} from '../utils/practice-validation';

export type PracticeMode = 'fill' | 'full';

export interface FillValidationResult {
	correct: boolean;
	incorrectBlankIndices: number[];
	expectedPerBlank: string[];
}

export interface FullValidationResult {
	correct: boolean;
	expectedDisplay: string;
}

export type ValidationResult = FillValidationResult | FullValidationResult;

/**
 * Get expected text for a segment (word or full sentence fallback).
 * When words is empty, returns subtitle.sentence for the only segment.
 */
function getExpectedForSegment(
	subtitle: Subtitle,
	wordIndex: number,
): { expectedRomaji: string; expectedDisplay: string } {
	const words = subtitle.words;
	if (words.length === 0) {
		return {
			expectedRomaji: subtitle.sentence,
			expectedDisplay: subtitle.sentence,
		};
	}
	const w = words[wordIndex];
	return {
		expectedRomaji: w.romaji || w.text,
		expectedDisplay: w.text,
	};
}

/**
 * Build full expected sentence in hiragana for full-sentence comparison.
 * Uses word.romaji → hiragana for each word, or sentence fallback when words is empty.
 */
function getFullExpectedHiragana(subtitle: Subtitle): string {
	const words = subtitle.words;
	if (words.length === 0) {
		return expectedToHiragana(subtitle.sentence);
	}
	const parts = words.map((w) => expectedToHiragana((w.romaji || w.text).trim()));
	return normalizeSpaces(parts.join(' '));
}

export function useAnswerValidation() {
	const validateFill = useCallback(
		(
			subtitle: Subtitle,
			blankIndices: number[],
			userValuesByBlank: string[],
		): FillValidationResult => {
			const expectedPerBlank = blankIndices.map((wordIndex) => {
				const { expectedDisplay } = getExpectedForSegment(subtitle, wordIndex);
				return expectedDisplay;
			});
			const incorrectBlankIndices: number[] = [];
			for (let i = 0; i < blankIndices.length; i++) {
				const wordIndex = blankIndices[i];
				const { expectedRomaji } = getExpectedForSegment(subtitle, wordIndex);
				const userSegment = userValuesByBlank[i] ?? '';
				if (!validateSegmentKana(userSegment, expectedRomaji)) {
					incorrectBlankIndices.push(i);
				}
			}
			const correct = incorrectBlankIndices.length === 0;
			return {
				correct,
				incorrectBlankIndices,
				expectedPerBlank,
			};
		},
		[],
	);

	const validateFull = useCallback(
		(subtitle: Subtitle, userInput: string): FullValidationResult => {
			const expectedHiragana = getFullExpectedHiragana(subtitle);
			const correct = compareKanaFullSentence(userInput, expectedHiragana);
			const expectedDisplay = subtitle.sentence;
			return {
				correct,
				expectedDisplay,
			};
		},
		[],
	);

	const validate = useCallback(
		(
			mode: PracticeMode,
			subtitle: Subtitle,
			blankIndices: number[],
			userValuesByBlank: string[],
			fullUserInput: string,
		): ValidationResult => {
			if (mode === 'fill') {
				return validateFill(subtitle, blankIndices, userValuesByBlank);
			}
			return validateFull(subtitle, fullUserInput);
		},
		[validateFill, validateFull],
	);

	return { validate, validateFill, validateFull };
}
