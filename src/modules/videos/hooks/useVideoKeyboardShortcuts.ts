/**
 * Video Keyboard Shortcuts Hook
 *
 * Handles keyboard shortcuts for video playback
 * - Spacebar: Play/Pause
 * - Arrow Left/Right: Seek backward/forward (5-10s)
 * - Arrow Up/Down: Volume control
 * - M: Mute toggle
 * - F: Fullscreen
 * - Number keys (0-9): Jump to percentage (0-90%)
 */
'use client';

import { useEffect, useRef } from 'react';

import { KEYBOARD_SEEK_STEP_SECONDS, KEYBOARD_VOLUME_STEP } from '../constants';

interface UseVideoKeyboardShortcutsOptions {
	videoRef: React.RefObject<HTMLVideoElement | null>;
	isPlaying: boolean;
	play: () => Promise<void>;
	pause: () => void;
	seek: (time: number) => void;
	setVolume: (volume: number) => void;
	toggleMute: () => void;
	volume: number;
	duration: number;
	enabled?: boolean;
}

/**
 * Custom hook for video keyboard shortcuts
 */
export function useVideoKeyboardShortcuts({
	videoRef,
	isPlaying,
	play,
	pause,
	seek,
	setVolume,
	toggleMute,
	volume,
	duration,
	enabled = true,
}: UseVideoKeyboardShortcutsOptions) {
	const isEnabledRef = useRef(enabled);

	useEffect(() => {
		isEnabledRef.current = enabled;
	}, [enabled]);

	useEffect(() => {
		if (!enabled) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			// Ignore if user is typing in an input/textarea
			const target = e.target as HTMLElement;
			if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
				return;
			}

			// Prevent default browser behavior for media keys
			if (
				[' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'm', 'M', 'f', 'F'].includes(e.key)
			) {
				e.preventDefault();
			}

			const video = videoRef.current;
			if (!video) return;

			switch (e.key) {
				case ' ': // Spacebar: Play/Pause
					if (isPlaying) {
						pause();
					} else {
						play();
					}
					break;

				case 'ArrowLeft': // Seek backward
					seek(Math.max(0, video.currentTime - KEYBOARD_SEEK_STEP_SECONDS));
					break;

				case 'ArrowRight': // Seek forward
					seek(Math.min(duration, video.currentTime + KEYBOARD_SEEK_STEP_SECONDS));
					break;

				case 'ArrowDown': // Volume down
					setVolume(Math.max(0, volume - KEYBOARD_VOLUME_STEP));
					break;

				case 'ArrowUp': // Volume up
					setVolume(Math.min(1, volume + KEYBOARD_VOLUME_STEP));
					break;

				case 'm':
				case 'M': // Mute toggle
					toggleMute();
					break;

				case 'f':
				case 'F': // Fullscreen toggle
					if (video.requestFullscreen) {
						if (document.fullscreenElement) {
							document.exitFullscreen();
						} else {
							video.requestFullscreen();
						}
					}
					break;

				// Number keys: Jump to percentage (0-9 = 0-90%)
				case '0':
					seek(0);
					break;
				case '1':
					seek((duration * 10) / 100);
					break;
				case '2':
					seek((duration * 20) / 100);
					break;
				case '3':
					seek((duration * 30) / 100);
					break;
				case '4':
					seek((duration * 40) / 100);
					break;
				case '5':
					seek((duration * 50) / 100);
					break;
				case '6':
					seek((duration * 60) / 100);
					break;
				case '7':
					seek((duration * 70) / 100);
					break;
				case '8':
					seek((duration * 80) / 100);
					break;
				case '9':
					seek((duration * 90) / 100);
					break;
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [enabled, videoRef, isPlaying, play, pause, seek, setVolume, toggleMute, volume, duration]);
}
