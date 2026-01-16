/**
 * useTextSegmentation Hook
 *
 * Wrapper hook for text parsing with memoization
 * Converts story text into renderable segments
 */
import { useMemo } from 'react';

import { StoryWithVocabularies } from '../types';
import { parseStoryText } from '../utils/parseStoryText';

interface UseTextSegmentationProps {
	story: StoryWithVocabularies;
	locale: 'en' | 'vi' | 'ja';
}

export function useTextSegmentation({ story, locale }: UseTextSegmentationProps) {
	// Parse story text into segments (memoized)
	const segments = useMemo(() => {
		const bodyText = story.content.body_text[locale];
		const vocabularies = story.vocabularies;

		return parseStoryText(bodyText, vocabularies, locale);
	}, [story, locale]);

	// Get full translation (safety net)
	const translation = useMemo(() => {
		return story.content.translation[locale === 'ja' ? 'en' : locale];
	}, [story, locale]);

	// Get story metadata
	const metadata = useMemo(
		() => ({
			title: story.content.title[locale],
			difficulty: story.difficulty,
			category: story.category,
			readTimeMin: story.readTimeMin,
			totalWords: story.vocabularies.length,
		}),
		[story, locale],
	);

	return {
		segments,
		translation,
		metadata,
	};
}
