'use client';

import { useCallback, useMemo, useState } from 'react';

import type { Subtitle, Video } from '../types';

export type PracticeMode = 'fill' | 'full';
export type PracticeUIState = 'idle' | 'checking' | 'correct' | 'incorrect' | 'showAnswer';

/**
 * Check if a word is punctuation-only (no content for blank)
 */
function isPunctuationOnly(text: string): boolean {
	const trimmed = text.trim()
	if (!trimmed) return true
	return /^[、。！？\s]+$/.test(trimmed)
}

/**
 * Select blank indices for a subtitle (deterministic per subtitle order index).
 * - 1-2 words: hide 1
 * - 3+ words: hide 1 or 2 (configurable), non-adjacent preferred, skip punctuation-only
 */
export function selectBlankIndices(
	subtitle: Subtitle,
	blanksCount: 1 | 2,
	subtitleOrderIndex: number,
): number[] {
	const words = subtitle.words
	if (words.length === 0) {
		return [0]
	}
	if (words.length <= 2) {
		const idx = subtitleOrderIndex % words.length
		return [idx]
	}
	const contentIndices = words
		.map((w, i) => ({ i, text: w.text }))
		.filter(({ text }) => !isPunctuationOnly(text))
		.map(({ i }) => i)
	if (contentIndices.length === 0) return [0]
	if (contentIndices.length === 1) return [contentIndices[0]]
	const numBlanks = Math.min(blanksCount, contentIndices.length)
	const seed = subtitleOrderIndex * 31
	const shuffled = [...contentIndices].sort((a, b) => {
		const h = (x: number) => (x * 31 + seed) % 997
		return h(a) - h(b)
	})
	const selected: number[] = []
	for (const idx of shuffled) {
		if (selected.length >= numBlanks) break
		const adjacent = selected.some((s) => Math.abs(s - idx) <= 1)
		if (!adjacent) selected.push(idx)
	}
	while (selected.length < numBlanks && shuffled.length > 0) {
		const next = shuffled.find((i) => !selected.includes(i))
		if (next === undefined) break
		selected.push(next)
	}
	return selected.sort((a, b) => a - b)
}

export interface UsePracticeSessionOptions {
	subtitles: Subtitle[];
	blanksPerSentence: 1 | 2;
}

export interface UsePracticeSessionReturn {
	currentIndex: number;
	currentSubtitle: Subtitle | null;
	totalSentences: number;
	blankIndices: number[];
	uiState: PracticeUIState;
	setUIState: (s: PracticeUIState) => void;
	goNext: () => void;
	skip: () => void;
	getOrComputeBlankIndices: (subtitle: Subtitle, index: number) => number[];
	isLastSentence: boolean;
	isFirstSentence: boolean;
}

export function usePracticeSession({
	subtitles,
	blanksPerSentence,
}: UsePracticeSessionOptions): UsePracticeSessionReturn {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [uiState, setUIState] = useState<PracticeUIState>('idle')
	const [blankIndicesCache, setBlankIndicesCache] = useState<Record<number, number[]>>({})

	const totalSentences = subtitles.length
	const currentSubtitle = totalSentences > 0 ? subtitles[currentIndex] ?? null : null

	const getOrComputeBlankIndices = useCallback(
		(subtitle: Subtitle, index: number): number[] => {
			if (blankIndicesCache[index]) return blankIndicesCache[index]
			const indices = selectBlankIndices(subtitle, blanksPerSentence, index)
			setBlankIndicesCache((prev) => ({ ...prev, [index]: indices }))
			return indices
		},
		[blanksPerSentence, blankIndicesCache],
	)

	const blankIndices =
		currentSubtitle != null
			? getOrComputeBlankIndices(currentSubtitle, currentIndex)
			: []

	const goNext = useCallback(() => {
		setUIState('idle')
		if (currentIndex < totalSentences - 1) {
			setCurrentIndex((i) => i + 1)
		}
	}, [currentIndex, totalSentences])

	const skip = useCallback(() => {
		setUIState('idle')
		if (currentIndex < totalSentences - 1) {
			setCurrentIndex((i) => i + 1)
		}
	}, [currentIndex, totalSentences])

	const isLastSentence = totalSentences > 0 && currentIndex === totalSentences - 1
	const isFirstSentence = currentIndex === 0

	return {
		currentIndex,
		currentSubtitle,
		totalSentences,
		blankIndices,
		uiState,
		setUIState,
		goNext,
		skip,
		getOrComputeBlankIndices,
		isLastSentence,
		isFirstSentence,
	}
}
