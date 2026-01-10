/**
 * usePlayAllAudio Hook
 *
 * Manages sequential audio playback for a list of vocabulary words
 * Supports repeat mode and proper cleanup
 */
import { useAudioPlayer } from '@/components/Audio/useAudioPlayer';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { VocabularyItem } from '../../../types';

interface UsePlayAllAudioOptions {
	words: VocabularyItem[];
	repeat: boolean;
	enabled: boolean;
}

export function usePlayAllAudio({ words, repeat, enabled }: UsePlayAllAudioOptions) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const isPlayingRef = useRef(false);
	const currentIndexRef = useRef(0);
	const repeatRef = useRef(repeat);

	// Update refs when props change
	useEffect(() => {
		repeatRef.current = repeat;
	}, [repeat]);

	// TTS Player with user's saved settings
	const [ttsSettings] = useState(() => {
		if (typeof window === 'undefined') return { voiceUri: '', speed: 1 };
		const savedVoice = localStorage.getItem('watashiwa_audio_voice');
		const savedSpeed = localStorage.getItem('watashiwa_audio_speed');
		return {
			voiceUri: savedVoice || '',
			speed: savedSpeed ? parseFloat(savedSpeed) : 1,
		};
	});

	const { stop } = useAudioPlayer({
		rate: ttsSettings.speed,
		voiceUri: ttsSettings.voiceUri,
		lang: 'ja-JP',
	});

	// Sync refs with state
	useEffect(() => {
		isPlayingRef.current = isPlaying;
		currentIndexRef.current = currentIndex;
	}, [isPlaying, currentIndex]);

	// Play next word in queue - using ref to avoid dependency issues
	const playNextRef = useRef<(() => void) | null>(null);
	const wordsRef = useRef(words);
	const enabledRef = useRef(enabled);
	const ttsSettingsRef = useRef(ttsSettings);

	// Update refs when props change
	useEffect(() => {
		wordsRef.current = words;
		enabledRef.current = enabled;
		ttsSettingsRef.current = ttsSettings;
	}, [words, enabled, ttsSettings]);

	// Initialize playNext function in effect
	useEffect(() => {
		playNextRef.current = () => {
			if (!enabledRef.current || wordsRef.current.length === 0) {
				setIsPlaying(false);
				isPlayingRef.current = false;
				return;
			}

			const index = currentIndexRef.current;
			const word = wordsRef.current[index];

			if (!word) {
				// End of list
				if (repeatRef.current && isPlayingRef.current) {
					// Loop back to start
					setCurrentIndex(0);
					currentIndexRef.current = 0;
					// Longer delay before restarting when repeating
					setTimeout(() => {
						if (isPlayingRef.current && playNextRef.current) {
							playNextRef.current();
						}
					}, 1000);
				} else {
					setIsPlaying(false);
					isPlayingRef.current = false;
				}
				return;
			}

			// Get text to speak (prefer reading, fallback to surface)
			const textToSpeak = word.wordReading || word.wordSurface;

			if (!textToSpeak) {
				// Skip words without text
				const nextIndex = index + 1;
				setCurrentIndex(nextIndex);
				currentIndexRef.current = nextIndex;
				setTimeout(() => {
					if (isPlayingRef.current && playNextRef.current) {
						playNextRef.current();
					}
				}, 100);
				return;
			}

			// Create utterance with onend handler
			const utterance = new SpeechSynthesisUtterance(textToSpeak);
			utterance.rate = ttsSettingsRef.current.speed * 0.9;
			utterance.lang = 'ja-JP';

			// Set voice if available
			if (ttsSettingsRef.current.voiceUri && typeof window !== 'undefined') {
				const voices = window.speechSynthesis.getVoices();
				const voice = voices.find((v) => v.voiceURI === ttsSettingsRef.current.voiceUri);
				if (voice) utterance.voice = voice;
			}

			utterance.onend = () => {
				if (!isPlayingRef.current) return;

				const nextIndex = currentIndexRef.current + 1;
				setCurrentIndex(nextIndex);
				currentIndexRef.current = nextIndex;

				// Longer delay between words for better comprehension
				setTimeout(() => {
					if (isPlayingRef.current && playNextRef.current) {
						playNextRef.current();
					}
				}, 800);
			};

			utterance.onerror = () => {
				// On error, continue to next word
				if (isPlayingRef.current) {
					const nextIndex = currentIndexRef.current + 1;
					setCurrentIndex(nextIndex);
					currentIndexRef.current = nextIndex;
					setTimeout(() => {
						if (isPlayingRef.current && playNextRef.current) {
							playNextRef.current();
						}
					}, 300);
				}
			};

			// Speak the word
			window.speechSynthesis.speak(utterance);
		};
	}, []);

	// Start playback
	const start = useCallback(() => {
		if (words.length === 0 || !enabled) return;

		// Reset to start
		setCurrentIndex(0);
		currentIndexRef.current = 0;
		setIsPlaying(true);
		isPlayingRef.current = true;

		// Start playing
		if (playNextRef.current) {
			playNextRef.current();
		}
	}, [words.length, enabled]);

	// Stop playback
	const stopPlayback = useCallback(() => {
		window.speechSynthesis.cancel();
		stop();
		setIsPlaying(false);
		isPlayingRef.current = false;
		setCurrentIndex(0);
		currentIndexRef.current = 0;
	}, [stop]);

	// Toggle play/pause
	const toggle = useCallback(() => {
		if (isPlaying) {
			stopPlayback();
		} else {
			start();
		}
	}, [isPlaying, start, stopPlayback]);

	// Cleanup on unmount or when words change
	useEffect(() => {
		return () => {
			window.speechSynthesis.cancel();
			isPlayingRef.current = false;
		};
	}, []);

	// Stop if words list becomes empty - use callback to avoid setState in effect
	useEffect(() => {
		if (words.length === 0 && isPlayingRef.current) {
			window.speechSynthesis.cancel();
			stop();
			// Use setTimeout to defer state update
			setTimeout(() => {
				setIsPlaying(false);
				isPlayingRef.current = false;
				setCurrentIndex(0);
				currentIndexRef.current = 0;
			}, 0);
		}
	}, [words.length, stop]);

	return {
		isPlaying,
		currentIndex,
		totalWords: words.length,
		start,
		stop: stopPlayback,
		toggle,
	};
}
