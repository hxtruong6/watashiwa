/**
 * Subtitle Synchronization Hook
 *
 * Calculates active subtitle and word index based on current video time
 * Optimized by React Compiler automatically
 */
'use client';

import { useMemo } from 'react';

import type { Subtitle } from '../types';

export interface UseSubtitleSyncReturn {
	activeSubtitle: Subtitle | null;
	activeWordIndex: number | null;
}

/**
 * Compute subtitle sync result
 * Extracted to pure function for better optimization
 */
function computeSubtitleSync(currentTime: number, subtitles: Subtitle[]): UseSubtitleSyncReturn {
	// Edge case: empty subtitles
	if (subtitles.length === 0) {
		return {
			activeSubtitle: null,
			activeWordIndex: null,
		};
	}

	// Edge case: before first subtitle
	if (currentTime < subtitles[0].startTime) {
		return {
			activeSubtitle: null,
			activeWordIndex: null,
		};
	}

	// Edge case: after last subtitle
	const lastSubtitle = subtitles[subtitles.length - 1];
	if (currentTime >= lastSubtitle.endTime) {
		// Return last subtitle with last word
		const lastWordIndex = lastSubtitle.words.length > 0 ? lastSubtitle.words.length - 1 : null;
		return {
			activeSubtitle: lastSubtitle,
			activeWordIndex: lastWordIndex,
		};
	}

	// Find current subtitle
	let activeSubtitle: Subtitle | null = null;
	for (let i = 0; i < subtitles.length; i++) {
		const subtitle = subtitles[i];
		if (currentTime >= subtitle.startTime && currentTime < subtitle.endTime) {
			activeSubtitle = subtitle;
			break;
		}
	}

	// If between subtitles, return previous subtitle
	if (!activeSubtitle) {
		for (let i = subtitles.length - 1; i >= 0; i--) {
			const subtitle = subtitles[i];
			if (currentTime >= subtitle.endTime) {
				// Return previous subtitle with last word
				const lastWordIndex = subtitle.words.length > 0 ? subtitle.words.length - 1 : null;
				return {
					activeSubtitle: subtitle,
					activeWordIndex: lastWordIndex,
				};
			}
		}
	}

	// If no subtitle found, return null
	if (!activeSubtitle) {
		return {
			activeSubtitle: null,
			activeWordIndex: null,
		};
	}

	// Calculate relative time within subtitle
	const relativeTime = currentTime - activeSubtitle.startTime;

	// Edge case: invalid timing data
	if (relativeTime < 0) {
		return {
			activeSubtitle,
			activeWordIndex: null,
		};
	}

	// Find active word
	let activeWordIndex: number | null = null;
	for (let i = 0; i < activeSubtitle.words.length; i++) {
		const word = activeSubtitle.words[i];

		// Validate word timing
		if (word.startTime > word.endTime) {
			continue; // Skip invalid word timing
		}

		if (relativeTime >= word.startTime && relativeTime < word.endTime) {
			activeWordIndex = i;
			break;
		}
	}

	// If no word found but we're within subtitle, return first word or null
	if (activeWordIndex === null && activeSubtitle.words.length > 0) {
		// Check if we're before first word
		if (relativeTime < activeSubtitle.words[0].startTime) {
			activeWordIndex = null;
		} else {
			// We're after last word, return last word index
			activeWordIndex = activeSubtitle.words.length - 1;
		}
	}

	return {
		activeSubtitle,
		activeWordIndex,
	};
}

/**
 * Custom hook for subtitle synchronization
 *
 * @param currentTime - Current video playback time in seconds
 * @param subtitles - Array of subtitles with word-level timing
 */
export function useSubtitleSync(currentTime: number, subtitles: Subtitle[]): UseSubtitleSyncReturn {
	// Memoize to prevent unnecessary recalculations on every render
	// currentTime updates every 100ms, so memoization is important for performance
	return useMemo(
		() => computeSubtitleSync(currentTime, subtitles),
		[currentTime, subtitles], // Subtitles array reference should be stable from parent
	);
}
