import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AutoPlayOption = 'off' | 'question' | 'answer';

interface StudyPreferences {
	showFurigana: boolean;
	showRomaji: boolean;
	autoPlayAudio: AutoPlayOption;
	showRatingText: boolean; // Show text labels on rating buttons

	// Actions
	setShowFurigana: (show: boolean) => void;
	setShowRomaji: (show: boolean) => void;
	setAutoPlayAudio: (option: AutoPlayOption) => void;
	setShowRatingText: (show: boolean) => void;
}

export const useStudyPreferences = create<StudyPreferences>()(
	persist(
		(set) => ({
			showFurigana: true,
			showRomaji: false,
			autoPlayAudio: 'answer',
			showRatingText: true, // Default: show text

			setShowFurigana: (show) => set({ showFurigana: show }),
			setShowRomaji: (show) => set({ showRomaji: show }),
			setAutoPlayAudio: (option) => set({ autoPlayAudio: option }),
			setShowRatingText: (show) => set({ showRatingText: show }),
		}),
		{
			name: 'watashi-study-prefs', // localStorage key
		},
	),
);
