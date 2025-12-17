import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TutorialState {
	// Map of tutorial ID to completion status
	// e.g. { 'study_page': true }
	completedTutorials: Record<string, boolean>;

	// Actions
	markComplete: (tutorialId: string) => void;
	setCompletedTutorials: (tutorials: Record<string, boolean>) => void;
	reset: () => void;
}

export const useTutorialStore = create<TutorialState>()(
	persist(
		(set) => ({
			completedTutorials: {},

			markComplete: (tutorialId) =>
				set((state) => ({
					completedTutorials: { ...state.completedTutorials, [tutorialId]: true },
				})),

			setCompletedTutorials: (tutorials) => set({ completedTutorials: tutorials }),

			reset: () => set({ completedTutorials: {} }),
		}),
		{
			name: 'tutorial-storage', // name of the item in the storage (must be unique)
			// We persist to localStorage as a backup/cache,
			// but the source of truth is the DB (synced on load).
		},
	),
);
