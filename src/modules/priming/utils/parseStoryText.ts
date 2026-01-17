/**
 * Position-Based Text Parser
 *
 * CRITICAL COMPONENT: This utility parses story text into renderable segments
 * using position-based slicing (NOT string replacement).
 *
 * Why position-based?
 * - Same word may appear multiple times in different contexts
 * - String replacement would cause incorrect highlighting
 * - Ensures exact alignment with audio timestamps (future feature)
 *
 * Example Input:
 * text = "Every morning, I usually いきます to 学校 by バス."
 * vocabs = [
 *   { word_surface: "いきます", positions: { en: [25] }, ... },
 *   { word_surface: "学校", positions: { en: [33] }, ... }
 * ]
 *
 * Output:
 * [
 *   { type: 'text', content: 'Every morning, I usually ' },
 *   { type: 'vocab', content: 'いきます', meta: {...} },
 *   { type: 'text', content: ' to ' },
 *   { type: 'vocab', content: '学校', meta: {...} },
 *   { type: 'text', content: ' by バス.' }
 * ]
 */
import type { StoryPositions } from '@/lib/schemas/jsonb';
import { StoryVocabulary, Vocabulary } from '@prisma/client';

import { TextSegment, VocabMeta } from '../types';

type VocabularyWithPositions = StoryVocabulary & {
	vocabulary: Vocabulary;
	positions: StoryPositions;
};

type PositionMarker = {
	position: number;
	length: number;
	vocab: VocabularyWithPositions;
};

/**
 * Parse story text into segments using position-based slicing
 *
 * @param text - The full story text in selected language
 * @param vocabularies - Array of vocabularies with position data
 * @param locale - The language to render ('en' | 'vi' | 'ja')
 * @returns Array of text/vocab segments ready for rendering
 */
export function parseStoryText(
	text: string,
	vocabularies: VocabularyWithPositions[],
	locale: 'en' | 'vi' | 'ja',
): TextSegment[] {
	// 1. Build position markers from vocabularies
	const markers: PositionMarker[] = [];

	for (const vocab of vocabularies) {
		const positions = vocab.positions[locale];

		if (!positions || positions.length === 0) {
			console.warn(`No positions found for vocab "${vocab.wordSurface}" in locale "${locale}"`, {
				vocabularyId: vocab.vocabularyId,
				positions: vocab.positions,
			});
			continue;
		}

		// Each word may appear multiple times (multiple positions)
		// Pre-validate positions to ensure the word actually exists at that position
		for (const pos of positions) {
			// Validate position is within text bounds
			if (pos < 0 || pos >= text.length) {
				console.warn(
					`Invalid position ${pos} for vocab "${vocab.wordSurface}" in locale "${locale}" (text length: ${text.length})`,
				);
				continue;
			}

			// Validate the word exists at this position (pre-check before adding marker)
			const expectedEnd = pos + vocab.wordLength;
			if (expectedEnd > text.length) {
				console.warn(
					`Position ${pos} + length ${vocab.wordLength} exceeds text length for vocab "${vocab.wordSurface}" in locale "${locale}"`,
				);
				continue;
			}

			const actualContent = text.slice(pos, expectedEnd);

			// If the word doesn't match at this position, try to find it nearby
			if (actualContent !== vocab.wordSurface) {
				// Try to find the word near the expected position (within 50 characters)
				const searchWindow = 50;
				const searchStart = Math.max(0, pos - searchWindow);
				const searchEnd = Math.min(text.length, expectedEnd + searchWindow);
				const searchText = text.slice(searchStart, searchEnd);
				const foundIndex = searchText.indexOf(vocab.wordSurface);

				if (foundIndex !== -1) {
					// Found the word nearby - use the corrected position
					const correctedPosition = searchStart + foundIndex;
					const correctedContent = text.slice(
						correctedPosition,
						correctedPosition + vocab.wordLength,
					);

					if (correctedContent === vocab.wordSurface) {
						console.warn(
							`Position corrected for "${vocab.wordSurface}" in locale "${locale}": ${pos} → ${correctedPosition}`,
						);
						// Use corrected position
						markers.push({
							position: correctedPosition,
							length: vocab.wordLength,
							vocab,
						});
						continue;
					}
				}

				// Word not found at position or nearby - skip this occurrence
				console.warn(
					`Skipping invalid position ${pos} for vocab "${vocab.wordSurface}" in locale "${locale}" - word not found in text`,
				);
				continue;
			}

			// Position is valid - add marker
			markers.push({
				position: pos,
				length: vocab.wordLength,
				vocab,
			});
		}
	}

	// 2. Sort markers by position (ascending)
	markers.sort((a, b) => a.position - b.position);

	// 3. Validate no overlapping positions
	for (let i = 0; i < markers.length - 1; i++) {
		const current = markers[i];
		const next = markers[i + 1];
		const currentEnd = current.position + current.length;

		if (currentEnd > next.position) {
			console.error('Overlapping word positions detected!', {
				current: {
					word: current.vocab.wordSurface,
					position: current.position,
					length: current.length,
					end: currentEnd,
				},
				next: {
					word: next.vocab.wordSurface,
					position: next.position,
				},
				locale,
			});
			throw new Error(
				`Overlapping positions: "${current.vocab.wordSurface}" at ${current.position} overlaps with "${next.vocab.wordSurface}" at ${next.position}`,
			);
		}
	}

	// 4. Build segments by slicing text based on positions
	const segments: TextSegment[] = [];
	let lastIndex = 0;

	for (const marker of markers) {
		const { position, length, vocab } = marker;

		// Add text segment before this word (if any)
		if (position > lastIndex) {
			const textContent = text.slice(lastIndex, position);
			if (textContent.length > 0) {
				segments.push({
					type: 'text',
					content: textContent,
				});
			}
		}

		// Add vocab segment
		const vocabContent = text.slice(position, position + length);

		// Validate the sliced content matches expected word surface
		// This is a safety net - positions should already be validated in step 1
		if (vocabContent !== vocab.wordSurface) {
			// This should rarely happen since we pre-validate, but keep as safety net
			console.warn('Position mismatch in segment building (should be pre-validated)!', {
				expected: vocab.wordSurface,
				actual: vocabContent,
				position,
				length,
				textSnippet: text.slice(Math.max(0, position - 10), position + length + 10),
				locale,
			});

			// Skip this occurrence to prevent UI breaking
			// Don't advance lastIndex - treat this as if the word wasn't there
			continue;
		}

		segments.push({
			type: 'vocab',
			content: vocabContent,
			meta: createVocabMeta(vocab),
		});

		lastIndex = position + length;
	}

	// 5. Add remaining text after last word (if any)
	if (lastIndex < text.length) {
		const remaining = text.slice(lastIndex);
		if (remaining.length > 0) {
			segments.push({
				type: 'text',
				content: remaining,
			});
		}
	}

	return segments;
}

/**
 * Create vocab metadata object for rendering
 */
function createVocabMeta(vocab: VocabularyWithPositions): VocabMeta {
	// Parse meanings from JSONB
	const meanings = vocab.vocabulary.meanings as Record<string, string[]>;
	const meaningEn = meanings.en?.[0] || meanings.english?.[0] || 'No meaning';
	const meaningVi = meanings.vi?.[0] || meanings.vietnamese?.[0] || 'Không có nghĩa';

	return {
		vocabularyId: vocab.vocabularyId,
		wordSurface: vocab.wordSurface,
		wordReading: vocab.wordReading,
		meaningEn,
		meaningVi,
		hanViet: vocab.vocabulary.hanViet,
		audioUrl: vocab.vocabulary.audioUrl,
		positions: vocab.positions,
	};
}

/**
 * Utility: Find all occurrences of a word in text
 * Used for generating position data during seeding
 */
export function findWordPositions(text: string, word: string): number[] {
	const positions: number[] = [];
	let index = text.indexOf(word);

	while (index !== -1) {
		positions.push(index);
		index = text.indexOf(word, index + 1);
	}

	return positions;
}

/**
 * Validate position data for a story
 * Used in tests and data validation scripts
 */
export function validateStoryPositions(
	storyContent: { body_text: { en: string; vi: string; ja: string } },
	vocabularies: VocabularyWithPositions[],
): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	for (const vocab of vocabularies) {
		// Check each language
		for (const locale of ['en', 'vi', 'ja'] as const) {
			const text = storyContent.body_text[locale];
			const positions = vocab.positions[locale];

			if (!positions || positions.length === 0) {
				errors.push(`Missing positions for "${vocab.wordSurface}" in locale "${locale}"`);
				continue;
			}

			// Validate each position
			for (const pos of positions) {
				const extracted = text.slice(pos, pos + vocab.wordLength);

				if (extracted !== vocab.wordSurface) {
					errors.push(
						`Position mismatch for "${vocab.wordSurface}" in locale "${locale}": ` +
							`expected "${vocab.wordSurface}" at position ${pos}, ` +
							`but found "${extracted}"`,
					);
				}
			}
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * Recalculate positions for a vocabulary word in text
 * Used to fix position mismatches by finding actual positions in the text
 *
 * @param text - The text to search in
 * @param wordSurface - The Japanese word to find
 * @returns Array of positions where the word appears
 */
export function recalculateWordPositions(text: string, wordSurface: string): number[] {
	return findWordPositions(text, wordSurface);
}

/**
 * Fix position mismatches by recalculating positions from actual text
 * This is a utility function to repair corrupted position data
 *
 * @param storyContent - The story content with body_text
 * @param vocabularies - Array of vocabularies with potentially incorrect positions
 * @returns Array of vocabularies with corrected positions
 */
export function fixStoryPositions(
	storyContent: { body_text: { en: string; vi: string; ja: string } },
	vocabularies: VocabularyWithPositions[],
): VocabularyWithPositions[] {
	const fixed: VocabularyWithPositions[] = [];

	for (const vocab of vocabularies) {
		const fixedPositions: StoryPositions = {
			en: recalculateWordPositions(storyContent.body_text.en, vocab.wordSurface),
			vi: recalculateWordPositions(storyContent.body_text.vi, vocab.wordSurface),
			ja: recalculateWordPositions(storyContent.body_text.ja, vocab.wordSurface),
		};

		// Validate that we found the word in at least one language
		const totalPositions =
			fixedPositions.en.length + fixedPositions.vi.length + fixedPositions.ja.length;

		if (totalPositions === 0) {
			console.warn(
				`Word "${vocab.wordSurface}" not found in any language version of the story text`,
			);
			// Keep original positions even if they're wrong (better than losing the word entirely)
			fixed.push(vocab);
		} else {
			fixed.push({
				...vocab,
				positions: fixedPositions,
			});
		}
	}

	return fixed;
}

/**
 * Debug helper: Print text segments with highlighting
 * Useful for debugging position parsing issues
 */
export function debugPrintSegments(segments: TextSegment[]): void {
	console.log('=== Story Text Segments ===');
	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i];
		if (segment.type === 'text') {
			console.log(`[${i}] TEXT: "${segment.content}"`);
		} else {
			console.log(
				`[${i}] VOCAB: "${segment.content}" (${segment.meta.meaningEn}) [${segment.meta.vocabularyId}]`,
			);
		}
	}
	console.log('===========================');
}
