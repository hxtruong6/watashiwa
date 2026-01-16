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
		for (const pos of positions) {
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
		if (vocabContent !== vocab.wordSurface) {
			console.error('Position mismatch detected!', {
				expected: vocab.wordSurface,
				actual: vocabContent,
				position,
				length,
				textSnippet: text.slice(Math.max(0, position - 10), position + length + 10),
				locale,
			});
			// Don't throw - log and use actual content to prevent UI breaking
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
