'use client';

import { useAudioPlayer } from '@/components/Audio/useAudioPlayer';
import { useTtsSettings } from '@/components/Audio/useTtsSettings';
import { useCallback } from 'react';

export interface UseKanaAudioOptions {
	/** Called when TTS fails (e.g. no voice). Use for showing a toast. */
	onPlayError?: () => void;
}

/**
 * Plays a single kana character via TTS. Reuses app useAudioPlayer and TTS settings.
 * New play cancels previous (handled by useAudioPlayer).
 */
export function useKanaAudio(options: UseKanaAudioOptions = {}) {
	const ttsSettings = useTtsSettings();
	const { speak, stop } = useAudioPlayer({
		rate: ttsSettings.speed,
		voiceUri: ttsSettings.voiceUri,
		lang: 'ja-JP',
		onError: options.onPlayError,
	});

	const play = useCallback(
		(character: string) => {
			if (!character) return;
			stop();
			speak(character);
		},
		[speak, stop],
	);

	return { play, stop };
}
