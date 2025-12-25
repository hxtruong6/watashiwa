import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AutoPlayOption = 'off' | 'question' | 'answer';

interface StudyPreferences {
	showFurigana: boolean;
	showRomaji: boolean;
	autoPlayAudio: AutoPlayOption;

	// Actions
	setShowFurigana: (show: boolean) => void;
	setShowRomaji: (show: boolean) => void;
	setAutoPlayAudio: (option: AutoPlayOption) => void;
}

export const useStudyPreferences = create<StudyPreferences>()(
	persist(
		(set) => ({
			showFurigana: true,
			showRomaji: false,
			autoPlayAudio: 'answer',

			setShowFurigana: (show) => set({ showFurigana: show }),
			setShowRomaji: (show) => set({ showRomaji: show }),
			setAutoPlayAudio: (option) => set({ autoPlayAudio: option }),
		}),
		{
			name: 'watashi-study-prefs', // localStorage key
		},
	),
);
