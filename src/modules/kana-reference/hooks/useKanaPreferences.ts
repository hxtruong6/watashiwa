'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STORAGE_KEY = 'watashi-kana-prefs';

export interface KanaPreferencesState {
	showRomaji: boolean;
	playAudioOnTap: boolean;
	showExampleWords: boolean;
}

interface KanaPreferences extends KanaPreferencesState {
	setShowRomaji: (show: boolean) => void;
	setPlayAudioOnTap: (on: boolean) => void;
	setShowExampleWords: (show: boolean) => void;
}

function validateStored(data: unknown): Partial<KanaPreferencesState> | null {
	if (!data || typeof data !== 'object') return null;
	const o = data as Record<string, unknown>;
	const out: Partial<KanaPreferencesState> = {};
	if (typeof o.showRomaji === 'boolean') out.showRomaji = o.showRomaji;
	if (typeof o.playAudioOnTap === 'boolean') out.playAudioOnTap = o.playAudioOnTap;
	if (typeof o.showExampleWords === 'boolean') out.showExampleWords = o.showExampleWords;
	return Object.keys(out).length ? out : null;
}

export const useKanaPreferences = create<KanaPreferences>()(
	persist(
		(set) => ({
			showRomaji: true,
			playAudioOnTap: true,
			showExampleWords: true,

			setShowRomaji: (show) => set({ showRomaji: show }),
			setPlayAudioOnTap: (on) => set({ playAudioOnTap: on }),
			setShowExampleWords: (show) => set({ showExampleWords: show }),
		}),
		{
			name: STORAGE_KEY,
			storage: {
				getItem: (name) => {
					try {
						const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(name) : null;
						if (!raw) return null;
						const parsed = JSON.parse(raw);
						if (parsed?.state) {
							const validated = validateStored(parsed.state);
							if (validated) return { ...parsed, state: { ...parsed.state, ...validated } };
						}
						return null;
					} catch {
						return null;
					}
				},
				setItem: (name, value) => {
					try {
						if (typeof localStorage !== 'undefined') {
							localStorage.setItem(name, JSON.stringify(value));
						}
					} catch {
						// ignore
					}
				},
				removeItem: (name) => {
					try {
						if (typeof localStorage !== 'undefined') localStorage.removeItem(name);
					} catch {
						// ignore
					}
				},
			},
		},
	),
);
