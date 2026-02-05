/**
 * Shared TTS (text-to-speech) settings — single source of truth.
 * Use this hook everywhere that plays audio so voice and speed stay consistent.
 */
import { useState } from 'react';

export const STORAGE_KEY_VOICE = 'watashiwa_audio_voice';
export const STORAGE_KEY_SPEED = 'watashiwa_audio_speed';

export const DEFAULT_TTS_SPEED = 1;

export interface TtsSettings {
	voiceUri: string;
	speed: number;
}

function readFromStorage(): TtsSettings {
	if (typeof window === 'undefined') {
		return { voiceUri: '', speed: DEFAULT_TTS_SPEED };
	}
	const savedVoice = localStorage.getItem(STORAGE_KEY_VOICE);
	const savedSpeed = localStorage.getItem(STORAGE_KEY_SPEED);
	return {
		voiceUri: savedVoice || '',
		speed: savedSpeed ? parseFloat(savedSpeed) : DEFAULT_TTS_SPEED,
	};
}

/**
 * Returns current TTS settings from localStorage.
 * Uses a single default speed (DEFAULT_TTS_SPEED) everywhere to avoid
 * DeckView vs FlashcardPreviewModal (and others) using different voices/speeds.
 */
export function useTtsSettings(): TtsSettings {
	const [settings] = useState<TtsSettings>(readFromStorage);
	return settings;
}
