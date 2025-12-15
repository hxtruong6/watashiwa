'use client';

import { useCallback, useRef, useEffect } from 'react';

// Zen-like sound design using Web Audio API
// No assets required, purely synthesized.

export function useSoundEffects() {
	const audioContextRef = useRef<AudioContext | null>(null);

	// Initialize AudioContext
	useEffect(() => {
		const AudioContextClass =
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
		if (AudioContextClass) {
			audioContextRef.current = new AudioContextClass();
		}
		return () => {
			if (audioContextRef.current?.state !== 'closed') {
				audioContextRef.current?.close();
			}
		};
	}, []);

	const playTone = useCallback(
		(
			freq: number,
			type: OscillatorType,
			startTime: number,
			duration: number,
			vol: number = 0.1,
		) => {
			const ctx = audioContextRef.current;
			if (!ctx) return;

			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.type = type;
			osc.frequency.setValueAtTime(freq, startTime);

			gain.gain.setValueAtTime(vol, startTime);
			gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

			osc.connect(gain);
			gain.connect(ctx.destination);

			osc.start(startTime);
			osc.stop(startTime + duration);
		},
		[],
	);

	const playCorrect = useCallback(() => {
		const ctx = audioContextRef.current;
		if (!ctx) return;
		if (ctx.state === 'suspended') ctx.resume();

		const now = ctx.currentTime;
		// Happy major chord arpeggio (C5 - E5 - G5)
		playTone(523.25, 'sine', now, 0.1, 0.1);
		playTone(659.25, 'sine', now + 0.05, 0.1, 0.1);
		playTone(783.99, 'sine', now + 0.1, 0.3, 0.08); // Sustain last note slightly longer
	}, [playTone]);

	const playIncorrect = useCallback(() => {
		const ctx = audioContextRef.current;
		if (!ctx) return;
		if (ctx.state === 'suspended') ctx.resume();

		const now = ctx.currentTime;
		// Dull thud / low buzz
		playTone(130, 'triangle', now, 0.3, 0.15);
		playTone(98, 'sawtooth', now + 0.1, 0.2, 0.1);
	}, [playTone]);

	const playComplete = useCallback(() => {
		const ctx = audioContextRef.current;
		if (!ctx) return;
		if (ctx.state === 'suspended') ctx.resume();

		const now = ctx.currentTime;
		// Victory Ascending Scale
		playTone(523.25, 'sine', now, 0.15);
		playTone(659.25, 'sine', now + 0.1, 0.15);
		playTone(783.99, 'sine', now + 0.2, 0.15);
		playTone(1046.5, 'sine', now + 0.3, 0.6); // High C
	}, [playTone]);

	return { playCorrect, playIncorrect, playComplete };
}
