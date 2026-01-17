/**
 * useTextSegmentation Hook
 *
 * Wrapper hook for text parsing with memoization
 * Converts story text into renderable segments
 */
import { useMemo } from 'react';

import { StoryWithVocabularies } from '../types';
import { parseStoryText } from '../utils/parseStoryText';
import { createVocabTranslationMapping, parseTranslationText } from '../utils/parseTranslationText';

interface UseTextSegmentationProps {
	story: StoryWithVocabularies;
	locale: 'en' | 'vi' | 'ja';
	userLanguage?: 'en' | 'vi'; // User's global language preference (for translation fallback when story is 'ja')
}

export function useTextSegmentation({
	story,
	locale,
	userLanguage = 'en',
}: UseTextSegmentationProps) {
	// Parse story text into segments (memoized)
	const segments = useMemo(() => {
		const bodyText = story.content.body_text[locale];
		const vocabularies = story.vocabularies;

		return parseStoryText(bodyText, vocabularies, locale);
	}, [story, locale]);

	// Get full translation text
	// Translation follows story language selection (en or vi)
	// For Japanese story, fallback to user language or default 'en'
	const translationText = useMemo(() => {
		if (locale === 'ja') {
			// For Japanese story, use user language or default to 'en'
			return story.content.translation[userLanguage] || story.content.translation.en;
		}
		// For 'en' or 'vi' story, use the same language for translation
		return story.content.translation[locale];
	}, [story, locale, userLanguage]);

	// Parse translation text into segments with vocabulary highlighting
	const translationSegments = useMemo(() => {
		if (!translationText) return [];
		// Translation locale follows story language (en or vi)
		// For Japanese story, use user language or default 'en'
		const translationLocale = locale === 'ja' ? userLanguage : locale;
		return parseTranslationText(translationText, story.vocabularies, translationLocale);
	}, [translationText, story.vocabularies, locale, userLanguage]);

	// Create bidirectional mapping between story and translation segments
	const vocabMapping = useMemo(() => {
		return createVocabTranslationMapping(segments, translationSegments);
	}, [segments, translationSegments]);

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
		translation: translationText,
		translationSegments,
		vocabMapping,
		metadata,
	};
}
