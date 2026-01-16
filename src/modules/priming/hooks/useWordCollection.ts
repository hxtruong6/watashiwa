/**
 * useWordCollection Hook
 *
 * Handles word collection mechanics and animations
 * Manages click interactions, audio playback, and collection state
 */
import { trackEvent } from '@/lib/analytics';
import { useCallback } from 'react';

import { useStoryProgress } from './useStoryProgress';

interface UseWordCollectionProps {
	storyId: string;
	onWordCollected?: (vocabularyId: string, totalCollected: number) => void;
}

export function useWordCollection({ storyId, onWordCollected }: UseWordCollectionProps) {
	const collectWord = useStoryProgress((state) => state.collectWord);
	const isWordCollected = useStoryProgress((state) => state.isWordCollected);
	const incrementAudioPlays = useStoryProgress((state) => state.incrementAudioPlays);
	const getProgress = useStoryProgress((state) => state.getCollectionProgress);

	/**
	 * Handle word click (primary action)
	 */
	const handleWordClick = useCallback(
		(vocabularyId: string, wordSurface: string, positionIndex: number = 0) => {
			// Track click event
			trackEvent('word_clicked', {
				story_id: storyId,
				vocabulary_id: vocabularyId,
				word_surface: wordSurface,
				position_index: positionIndex,
			});

			// Check if already collected
			if (isWordCollected(vocabularyId)) {
				console.log('Word already collected:', wordSurface);
				return { alreadyCollected: true };
			}

			// Collect the word
			collectWord(vocabularyId);

			// Get updated progress
			const { collected, total } = getProgress();

			// Track collection event
			trackEvent('word_collected', {
				story_id: storyId,
				vocabulary_id: vocabularyId,
				collection_count: collected,
				total_words: total,
			});

			// Callback for parent component (trigger animation)
			onWordCollected?.(vocabularyId, collected);

			return { alreadyCollected: false, collected, total };
		},
		[storyId, collectWord, isWordCollected, getProgress, onWordCollected],
	);

	/**
	 * Handle audio play
	 */
	const handleAudioPlay = useCallback(
		(vocabularyId: string) => {
			incrementAudioPlays();

			trackEvent('audio_played', {
				story_id: storyId,
				vocabulary_id: vocabularyId,
			});
		},
		[storyId, incrementAudioPlays],
	);

	/**
	 * Check if story is complete (all words collected)
	 */
	const isStoryComplete = useCallback(() => {
		const { collected, total } = getProgress();
		return collected === total && total > 0;
	}, [getProgress]);

	return {
		handleWordClick,
		handleAudioPlay,
		isWordCollected,
		isStoryComplete,
		getProgress,
	};
}
