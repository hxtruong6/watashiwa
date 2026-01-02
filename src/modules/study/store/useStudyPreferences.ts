import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AutoPlayOption = 'off' | 'question' | 'answer';

export type CollapseState = 'expanded' | 'collapsed';

export type AlgorithmMode = 'semantic' | 'srs';

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
	algorithmMode: AlgorithmMode; // Algorithm mode: 'semantic' or 'srs'

	// Actions
	setShowFurigana: (show: boolean) => void;
	setShowRomaji: (show: boolean) => void;
	setAutoPlayAudio: (option: AutoPlayOption) => void;
	setShowRatingText: (show: boolean) => void;
	setCardBackSettings: (settings: Partial<CardBackSettings>) => void;
	setAlgorithmMode: (mode: AlgorithmMode) => void;
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

// Validate stored preferences structure
function validateStoredPreferences(data: unknown): Partial<StudyPreferences> | null {
	if (!data || typeof data !== 'object') {
		return null;
	}

	const stored = data as Record<string, unknown>;

	// Validate algorithmMode if present
	if (stored.algorithmMode !== undefined) {
		if (stored.algorithmMode !== 'semantic' && stored.algorithmMode !== 'srs') {
			// Invalid algorithmMode, reset to default
			stored.algorithmMode = 'srs';
		}
	}

	// Validate other fields if needed
	// For now, we'll accept partial data and merge with defaults

	return stored as Partial<StudyPreferences>;
}

export const useStudyPreferences = create<StudyPreferences>()(
	persist(
		(set) => ({
			showFurigana: true,
			showRomaji: false,
			autoPlayAudio: 'answer',
			showRatingText: true, // Default: show text
			cardBackSettings: defaultCardBackSettings,
			algorithmMode: 'srs', // Default to SRS (safe fallback)

			setShowFurigana: (show) => set({ showFurigana: show }),
			setShowRomaji: (show) => set({ showRomaji: show }),
			setAutoPlayAudio: (option) => set({ autoPlayAudio: option }),
			setShowRatingText: (show) => set({ showRatingText: show }),
			setCardBackSettings: (settings) =>
				set((state) => ({
					cardBackSettings: { ...state.cardBackSettings, ...settings },
				})),
			setAlgorithmMode: (mode) => set({ algorithmMode: mode }),
		}),
		{
			name: 'watashi-study-prefs', // localStorage key
			storage: {
				getItem: (name) => {
					try {
						const item = localStorage.getItem(name);
						if (!item) return null;

						const parsed = JSON.parse(item);
						// Validate the stored data structure
						if (parsed?.state) {
							const validated = validateStoredPreferences(parsed.state);
							if (validated) {
								return { ...parsed, state: validated };
							}
						}
						return null;
					} catch {
						// localStorage corrupted or disabled, return null to use defaults
						return null;
					}
				},
				setItem: (name, value) => {
					try {
						localStorage.setItem(name, JSON.stringify(value));
					} catch {
						// localStorage disabled or quota exceeded, fail silently
						// State will remain in memory only
					}
				},
				removeItem: (name) => {
					try {
						localStorage.removeItem(name);
					} catch {
						// localStorage disabled, fail silently
					}
				},
			},
		},
	),
);
