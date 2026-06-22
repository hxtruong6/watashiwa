'use client';

import { useCallback, useState } from 'react';

import type { ValidationMode } from './useAnswerValidation';
import type { PracticeMode } from './usePracticeSession';

const STORAGE_KEY_MODE = 'watashi-practice-mode';
const STORAGE_KEY_VALIDATION = 'watashi-practice-validation';
const STORAGE_KEY_BLANKS = 'watashi-practice-blanks';

export interface PracticeSettingsState {
	mode: PracticeMode;
	validationMode: ValidationMode;
	blanksPerSentence: 1 | 2;
}

const DEFAULT_SETTINGS: PracticeSettingsState = {
	mode: 'fill',
	validationMode: 'kana',
	blanksPerSentence: 1,
};

function parseMode(value: string | null): PracticeMode {
	if (value === 'fill' || value === 'full') return value;
	return DEFAULT_SETTINGS.mode;
}

function parseValidation(value: string | null): ValidationMode {
	if (value === 'kana' || value === 'kanji') return value;
	return DEFAULT_SETTINGS.validationMode;
}

function parseBlanks(value: string | null): 1 | 2 {
	if (value === '1' || value === '2') return value === '1' ? 1 : 2;
	return DEFAULT_SETTINGS.blanksPerSentence;
}

function readFromStorage(): PracticeSettingsState {
	if (typeof window === 'undefined') return DEFAULT_SETTINGS;
	return {
		mode: parseMode(localStorage.getItem(STORAGE_KEY_MODE)),
		validationMode: parseValidation(localStorage.getItem(STORAGE_KEY_VALIDATION)),
		blanksPerSentence: parseBlanks(localStorage.getItem(STORAGE_KEY_BLANKS)),
	};
}

/**
 * Persists practice settings to localStorage. Reads on mount (client-only), writes on each change.
 */
export function usePracticeSettingsPersisted(): [
	PracticeSettingsState,
	(partial: Partial<PracticeSettingsState>) => void,
] {
	const [state, setState] = useState<PracticeSettingsState>(readFromStorage);

	const setSettings = useCallback((partial: Partial<PracticeSettingsState>) => {
		setState((prev) => {
			const next = { ...prev, ...partial };
			if (typeof window !== 'undefined') {
				if (partial.mode !== undefined) {
					localStorage.setItem(STORAGE_KEY_MODE, next.mode);
				}
				if (partial.validationMode !== undefined) {
					localStorage.setItem(STORAGE_KEY_VALIDATION, next.validationMode);
				}
				if (partial.blanksPerSentence !== undefined) {
					localStorage.setItem(STORAGE_KEY_BLANKS, String(next.blanksPerSentence));
				}
			}
			return next;
		});
	}, []);

	return [state, setSettings];
}
