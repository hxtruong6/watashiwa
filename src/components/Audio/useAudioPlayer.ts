import { useCallback, useEffect, useRef, useState } from 'react';

export interface AudioPlayerOptions {
	rate?: number;
	pitch?: number;
	volume?: number;
	voiceUri?: string; // ID of the saved voice
	lang?: string;
}

export const useAudioPlayer = (initialOptions: AudioPlayerOptions = {}) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

	// Refs to keep track of current interaction without triggering re-renders
	const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
	const optionsRef = useRef(initialOptions);

	// Update refs when options change
	useEffect(() => {
		optionsRef.current = initialOptions;
	}, [initialOptions]);

	// Load voices
	useEffect(() => {
		const loadVoices = () => {
			const availVoices = window.speechSynthesis.getVoices();
			setVoices(availVoices);
		};

		loadVoices();

		// Chrome loads voices asynchronously
		if (window.speechSynthesis.onvoiceschanged !== undefined) {
			window.speechSynthesis.onvoiceschanged = loadVoices;
		}
	}, []);

	// Derive selected voice
	const voice = useCallback(() => {
		if (!voices.length) return null;
		if (initialOptions.voiceUri) {
			return voices.find((v) => v.voiceURI === initialOptions.voiceUri) || null;
		}
		// Auto-select best JP voice if not set
		const jpVoice = voices.find(
			(v) =>
				v.lang === 'ja-JP' &&
				(v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Hattori')),
		);
		if (jpVoice) return jpVoice;
		return voices.find((v) => v.lang === 'ja-JP') || null;
	}, [voices, initialOptions.voiceUri])();

	const speak = useCallback(
		(text: string, overrideOptions?: AudioPlayerOptions) => {
			if (!text) return;

			// Cancel any current speaking
			window.speechSynthesis.cancel();
			setIsPlaying(false);
			setIsPaused(false);

			const utterance = new SpeechSynthesisUtterance(text);
			utteranceRef.current = utterance;

			// Apply options with overrides
			const {
				rate = 1,
				pitch = 1,
				volume = 1,
				lang = 'ja-JP',
			} = {
				...optionsRef.current,
				...overrideOptions,
			};

			utterance.rate = rate;
			utterance.pitch = pitch;
			utterance.volume = volume;
			utterance.lang = lang; // Default to JP

			if (voice) {
				utterance.voice = voice;
			}

			utterance.onstart = () => {
				setIsPlaying(true);
				setIsPaused(false);
			};

			utterance.onend = () => {
				setIsPlaying(false);
				setIsPaused(false);
			};

			utterance.onerror = (e) => {
				console.error('Audio playback error', e);
				setIsPlaying(false);
				setIsPaused(false);
			};

			window.speechSynthesis.speak(utterance);
		},
		[voice],
	);

	const stop = useCallback(() => {
		window.speechSynthesis.cancel();
		setIsPlaying(false);
		setIsPaused(false);
	}, []);

	const pause = useCallback(() => {
		if (window.speechSynthesis.speaking) {
			window.speechSynthesis.pause();
			setIsPaused(true);
			setIsPlaying(false);
		}
	}, []);

	const resume = useCallback(() => {
		if (window.speechSynthesis.paused) {
			window.speechSynthesis.resume();
			setIsPaused(false);
			setIsPlaying(true);
		}
	}, []);

	return {
		speak,
		stop,
		pause,
		resume,
		isPlaying,
		isPaused,
		voices,
		voice,
	};
};
