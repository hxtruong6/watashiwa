/**
 * useStoryProgress Hook
 *
 * Zustand store for managing story reading state (collection mechanics)
 * Handles word collection, progress tracking, and auto-save
 */
import { StoryAnalytics } from '@/lib/schemas/jsonb';
// Export for React import
import React from 'react';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { StoryReadingState, WordCollectionState } from '../types';

interface StoryProgressStore {
	// Current active story
	currentStoryId: string | null;
	startTime: number | null;

	// Collection state
	collectedWords: Map<string, WordCollectionState>;
	translationUsed: boolean;
	pausedTimes: number[];
	audioPlaysCount: number;

	// Progress metadata
	totalWords: number;
	readTimeSeconds: number;

	// Actions
	startReading: (storyId: string, totalWords: number) => void;
	collectWord: (vocabularyId: string) => void;
	uncollectWord: (vocabularyId: string) => void;
	toggleTranslation: (shown: boolean) => void;
	incrementAudioPlays: () => void;
	pauseReading: () => void;
	updateReadTime: () => void;
	completeReading: () => void;
	resetProgress: () => void;

	// Selectors
	getCollectionProgress: () => { collected: number; total: number; percentage: number };
	isWordCollected: (vocabularyId: string) => boolean;
	getAnalytics: () => StoryAnalytics;
}

export const useStoryProgress = create<StoryProgressStore>()(
	devtools(
		persist(
			(set, get) => ({
				// Initial state
				currentStoryId: null,
				startTime: null,
				collectedWords: new Map(),
				translationUsed: false,
				pausedTimes: [],
				audioPlaysCount: 0,
				totalWords: 0,
				readTimeSeconds: 0,

				// Start reading a story
				startReading: (storyId: string, totalWords: number) => {
					const now = Date.now();
					set({
						currentStoryId: storyId,
						startTime: now,
						collectedWords: new Map(),
						translationUsed: false,
						pausedTimes: [],
						audioPlaysCount: 0,
						totalWords,
						readTimeSeconds: 0,
					});
				},

				// Collect a word
				collectWord: (vocabularyId: string) => {
					set((state) => {
						const newCollected = new Map(state.collectedWords);
						newCollected.set(vocabularyId, {
							vocabularyId,
							collected: true,
							timestamp: Date.now(),
						});

						return { collectedWords: newCollected };
					});
				},

				// Uncollect a word (if user wants to re-learn)
				uncollectWord: (vocabularyId: string) => {
					set((state) => {
						const newCollected = new Map(state.collectedWords);
						newCollected.delete(vocabularyId);
						return { collectedWords: newCollected };
					});
				},

				// Toggle translation visibility
				toggleTranslation: (shown: boolean) => {
					set({ translationUsed: shown });
				},

				// Increment audio play count
				incrementAudioPlays: () => {
					set((state) => ({ audioPlaysCount: state.audioPlaysCount + 1 }));
				},

				// Record pause time
				pauseReading: () => {
					set((state) => {
						const elapsed = state.startTime ? (Date.now() - state.startTime) / 1000 : 0;
						return {
							pausedTimes: [...state.pausedTimes, Math.round(elapsed)],
						};
					});
				},

				// Update read time (called periodically)
				updateReadTime: () => {
					set((state) => {
						if (!state.startTime) return state;
						const elapsed = (Date.now() - state.startTime) / 1000;
						return { readTimeSeconds: Math.round(elapsed) };
					});
				},

				// Complete reading (called when story finished)
				completeReading: () => {
					get().updateReadTime();
					// State preserved for analytics submission
				},

				// Reset progress (start fresh)
				resetProgress: () => {
					set({
						currentStoryId: null,
						startTime: null,
						collectedWords: new Map(),
						translationUsed: false,
						pausedTimes: [],
						audioPlaysCount: 0,
						totalWords: 0,
						readTimeSeconds: 0,
					});
				},

				// Get collection progress
				getCollectionProgress: () => {
					const state = get();
					const collected = state.collectedWords.size;
					const total = state.totalWords;
					const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;

					return { collected, total, percentage };
				},

				// Check if word is collected
				isWordCollected: (vocabularyId: string) => {
					return get().collectedWords.has(vocabularyId);
				},

				// Get analytics object for submission
				getAnalytics: () => {
					const state = get();
					return {
						clicked_words: Array.from(state.collectedWords.keys()),
						translation_used: state.translationUsed,
						paused_at: state.pausedTimes,
						audio_plays: state.audioPlaysCount,
						reading_language: 'en', // Default, can be extended
					};
				},
			}),
			{
				name: 'story-progress-storage',
				// Serialize Map to JSON
				partialize: (state) => ({
					currentStoryId: state.currentStoryId,
					startTime: state.startTime,
					collectedWords: Array.from(state.collectedWords.entries()),
					translationUsed: state.translationUsed,
					pausedTimes: state.pausedTimes,
					audioPlaysCount: state.audioPlaysCount,
					totalWords: state.totalWords,
					readTimeSeconds: state.readTimeSeconds,
				}),
				// Deserialize JSON to Map
				onRehydrateStorage: () => (state) => {
					if (state && Array.isArray((state as any).collectedWords)) {
						state.collectedWords = new Map((state as any).collectedWords);
					}
				},
			},
		),
		{ name: 'StoryProgressStore' },
	),
);

/**
 * Auto-save hook
 * Automatically saves progress every 30 seconds
 */
export function useAutoSaveProgress(
	storyId: string | null,
	onSave: (
		analytics: StoryAnalytics,
		readTimeSeconds: number,
		wordsCollected: number,
	) => Promise<void>,
) {
	const updateReadTime = useStoryProgress((state) => state.updateReadTime);
	const getAnalytics = useStoryProgress((state) => state.getAnalytics);
	const getProgress = useStoryProgress((state) => state.getCollectionProgress);
	const readTimeSeconds = useStoryProgress((state) => state.readTimeSeconds);

	// Auto-save effect
	React.useEffect(() => {
		if (!storyId) return;

		const interval = setInterval(async () => {
			updateReadTime();
			const analytics = getAnalytics();
			const { collected } = getProgress();

			try {
				await onSave(analytics, readTimeSeconds, collected);
				console.log('✅ Progress auto-saved');
			} catch (error) {
				console.error('❌ Auto-save failed:', error);
			}
		}, 30000); // 30 seconds

		return () => clearInterval(interval);
	}, [storyId, onSave, updateReadTime, getAnalytics, getProgress, readTimeSeconds]);
}
