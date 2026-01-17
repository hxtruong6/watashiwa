/**
 * Translation Text Parser
 *
 * Parses translation text and identifies words that correspond to Japanese vocabulary.
 * Creates segments similar to parseStoryText but for the translation section.
 */
import type { StoryPositions } from '@/lib/schemas/jsonb';
import { StoryVocabulary, Vocabulary } from '@prisma/client';

import { TextSegment, VocabMeta } from '../types';

type VocabularyWithPositions = StoryVocabulary & {
	vocabulary: Vocabulary;
	positions: StoryPositions;
};

export type TranslationSegment = TextSegment & {
	vocabId?: string; // If this segment corresponds to a vocabulary word
};

/**
 * Parse translation text and identify vocabulary word translations
 *
 * @param translationText - The full translation text (English or Vietnamese)
 * @param vocabularies - Array of vocabularies with their translations
 * @param locale - The language of the translation ('en' | 'vi')
 * @returns Array of text/vocab segments with metadata for highlighting
 */
export function parseTranslationText(
	translationText: string,
	vocabularies: VocabularyWithPositions[],
	locale: 'en' | 'vi',
): TranslationSegment[] {
	// For each vocabulary, find its translation meaning in the target language
	const vocabTranslations = vocabularies.map((vocab) => {
		const meanings = vocab.vocabulary.meanings as Record<string, string[]>;
		const translation =
			locale === 'en'
				? meanings.en?.[0] || meanings.english?.[0] || ''
				: meanings.vi?.[0] || meanings.vietnamese?.[0] || '';

		return {
			vocab,
			translation,
			vocabularyId: vocab.vocabularyId,
		};
	});

	// Find all positions where vocabulary translations appear in the translation text
	type TranslationMarker = {
		position: number;
		length: number;
		vocabId: string;
		translation: string;
	};

	const markers: TranslationMarker[] = [];

	for (const { translation, vocabularyId } of vocabTranslations) {
		if (!translation || translation.trim().length === 0) {
			continue;
		}

		// Find all occurrences of this translation in the text
		// Use word boundary matching to avoid partial matches
		const regex = new RegExp(`\\b${escapeRegex(translation)}\\b`, 'gi');
		let match: RegExpExecArray | null;

		while ((match = regex.exec(translationText)) !== null) {
			markers.push({
				position: match.index,
				length: match[0].length,
				vocabId: vocabularyId,
				translation: match[0],
			});
		}
	}

	// Sort markers by position
	markers.sort((a, b) => a.position - b.position);

	// Remove overlapping markers (keep the first one)
	const nonOverlappingMarkers: TranslationMarker[] = [];
	for (const marker of markers) {
		const overlaps = nonOverlappingMarkers.some(
			(existing) =>
				marker.position < existing.position + existing.length &&
				marker.position + marker.length > existing.position,
		);

		if (!overlaps) {
			nonOverlappingMarkers.push(marker);
		}
	}

	// Build segments
	const segments: TranslationSegment[] = [];
	let lastIndex = 0;

	for (const marker of nonOverlappingMarkers) {
		// Add text segment before this word (if any)
		if (marker.position > lastIndex) {
			const textContent = translationText.slice(lastIndex, marker.position);
			if (textContent.length > 0) {
				segments.push({
					type: 'text',
					content: textContent,
				});
			}
		}

		// Find the vocabulary for this marker
		const vocab = vocabularies.find((v) => v.vocabularyId === marker.vocabId);
		if (!vocab) {
			// Skip if vocab not found
			lastIndex = marker.position + marker.length;
			continue;
		}

		// Create vocab meta
		const meanings = vocab.vocabulary.meanings as Record<string, string[]>;
		const meaningEn = meanings.en?.[0] || meanings.english?.[0] || 'No meaning';
		const meaningVi = meanings.vi?.[0] || meanings.vietnamese?.[0] || 'Không có nghĩa';

		const meta: VocabMeta = {
			vocabularyId: vocab.vocabularyId,
			wordSurface: vocab.wordSurface,
			wordReading: vocab.wordReading,
			meaningEn,
			meaningVi,
			hanViet: vocab.vocabulary.hanViet,
			audioUrl: vocab.vocabulary.audioUrl,
			positions: vocab.positions,
		};

		// Add vocab segment
		const vocabContent = translationText.slice(marker.position, marker.position + marker.length);
		segments.push({
			type: 'vocab',
			content: vocabContent,
			meta,
			vocabId: marker.vocabId,
		});

		lastIndex = marker.position + marker.length;
	}

	// Add remaining text after last word (if any)
	if (lastIndex < translationText.length) {
		const remaining = translationText.slice(lastIndex);
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
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Create bidirectional mapping between story vocab positions and translation positions
 * Returns a map: vocabularyId -> { storyPositions: number[], translationPositions: number[] }
 */
export function createVocabTranslationMapping(
	storySegments: TextSegment[],
	translationSegments: TranslationSegment[],
): Map<
	string,
	{
		storyIndices: number[];
		translationIndices: number[];
	}
> {
	const mapping = new Map<
		string,
		{
			storyIndices: number[];
			translationIndices: number[];
		}
	>();

	// Build mapping from story segments
	storySegments.forEach((segment, index) => {
		if (segment.type === 'vocab') {
			const existing = mapping.get(segment.meta.vocabularyId) || {
				storyIndices: [],
				translationIndices: [],
			};
			existing.storyIndices.push(index);
			mapping.set(segment.meta.vocabularyId, existing);
		}
	});

	// Add translation segment indices
	translationSegments.forEach((segment, index) => {
		if (segment.type === 'vocab' && segment.vocabId) {
			const existing = mapping.get(segment.vocabId) || {
				storyIndices: [],
				translationIndices: [],
			};
			existing.translationIndices.push(index);
			mapping.set(segment.vocabId, existing);
		}
	});

	return mapping;
}
