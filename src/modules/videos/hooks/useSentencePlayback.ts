'use client';

import { useCallback, useEffect } from 'react';

import type { Subtitle } from '../types';

export interface UseSentencePlaybackOptions {
	videoRef: React.RefObject<HTMLVideoElement | null>;
	seek: (time: number) => void;
	play: () => Promise<void>;
	pause: () => void;
	currentSubtitle: Subtitle | null;
}

export interface UseSentencePlaybackReturn {
	playCurrentSentence: () => Promise<void>;
	repeatCurrentSentence: () => Promise<void>;
}

/**
 * Hook for per-sentence playback: seek to sentence start, play, pause at sentence end.
 * No auto-advance; user must click Next/Submit.
 */
export function useSentencePlayback({
	videoRef,
	seek,
	play,
	pause,
	currentSubtitle,
}: UseSentencePlaybackOptions): UseSentencePlaybackReturn {
	const playCurrentSentence = useCallback(async () => {
		if (!currentSubtitle) return;
		const video = videoRef.current;
		if (!video) return;
		const startTime = currentSubtitle.startTime;
		const endTime = currentSubtitle.endTime;
		if (startTime >= endTime) return;
		seek(startTime);
		await play();
	}, [currentSubtitle, videoRef, seek, play]);

	const repeatCurrentSentence = useCallback(async () => {
		await playCurrentSentence();
	}, [playCurrentSentence]);

	// Pause when playback reaches end of current sentence
	useEffect(() => {
		const video = videoRef.current;
		if (!video || !currentSubtitle) return;
		const endTime = currentSubtitle.endTime;
		const handleTimeUpdate = () => {
			if (!video.paused && video.currentTime >= endTime) {
				pause();
			}
		};
		video.addEventListener('timeupdate', handleTimeUpdate);
		return () => video.removeEventListener('timeupdate', handleTimeUpdate);
	}, [videoRef, currentSubtitle, pause]);

	return { playCurrentSentence, repeatCurrentSentence };
}
