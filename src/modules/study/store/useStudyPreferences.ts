import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AutoPlayOption = 'off' | 'question' | 'answer';

export type CollapseState = 'expanded' | 'collapsed';

export interface CardBackSettings {
	showEtymology: boolean;
	showConfusions: boolean;
	showMoreExamples: boolean;
	defaultCollapseState: {
		etymology: CollapseState;
		confusions: CollapseState;
		moreExamples: CollapseState;
	};
}

interface StudyPreferences {
	showFurigana: boolean;
	showRomaji: boolean;
	autoPlayAudio: AutoPlayOption;
	showRatingText: boolean; // Show text labels on rating buttons
	cardBackSettings: CardBackSettings;

	// Actions
	setShowFurigana: (show: boolean) => void;
	setShowRomaji: (show: boolean) => void;
	setAutoPlayAudio: (option: AutoPlayOption) => void;
	setShowRatingText: (show: boolean) => void;
	setCardBackSettings: (settings: Partial<CardBackSettings>) => void;
}

const defaultCardBackSettings: CardBackSettings = {
	// UX Improvement: Show more information by default for better learning experience
	showEtymology: true, // Show etymology by default (helps with kanji understanding)
	showConfusions: true, // Show confusions (critical for avoiding mistakes)
	showMoreExamples: true, // Show multiple examples (better context understanding)
	defaultCollapseState: {
		etymology: 'expanded', // Expanded by default (valuable learning content)
		confusions: 'expanded', // Expanded by default (important for differentiation)
		moreExamples: 'expanded', // Expanded by default (more context = better learning)
	},
};

export const useStudyPreferences = create<StudyPreferences>()(
	persist(
		(set) => ({
			showFurigana: true,
			showRomaji: false,
			autoPlayAudio: 'answer',
			showRatingText: true, // Default: show text
			cardBackSettings: defaultCardBackSettings,

			setShowFurigana: (show) => set({ showFurigana: show }),
			setShowRomaji: (show) => set({ showRomaji: show }),
			setAutoPlayAudio: (option) => set({ autoPlayAudio: option }),
			setShowRatingText: (show) => set({ showRatingText: show }),
			setCardBackSettings: (settings) =>
				set((state) => ({
					cardBackSettings: { ...state.cardBackSettings, ...settings },
				})),
		}),
		{
			name: 'watashi-study-prefs', // localStorage key
		},
	),
);
