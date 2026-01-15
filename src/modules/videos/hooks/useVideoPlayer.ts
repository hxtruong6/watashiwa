/**
 * Video Player Hook
 *
 * Manages video playback state and controls
 * Throttles time updates to 100ms for performance
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { TIME_UPDATE_THROTTLE_MS, VALID_PLAYBACK_RATES } from '../constants';

export interface UseVideoPlayerReturn {
	// State
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	playbackRate: number;
	volume: number;
	isMuted: boolean;
	error: Error | null;

	// Refs
	videoRef: React.RefObject<HTMLVideoElement | null>;

	// Controls
	play: () => Promise<void>;
	pause: () => void;
	stop: () => void;
	seek: (time: number) => void;
	setPlaybackRate: (rate: number) => void;
	setVolume: (volume: number) => void;
	toggleMute: () => void;
}

/**
 * Custom hook for video player controls
 */
export function useVideoPlayer(): UseVideoPlayerReturn {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [playbackRate, setPlaybackRateState] = useState(1.0);
	const [volume, setVolumeState] = useState(1.0);
	const [isMuted, setIsMuted] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	// Throttle time updates
	const lastUpdateTimeRef = useRef(0);
	const rafRef = useRef<number | null>(null);

	// Update current time (throttled)
	const handleTimeUpdate = useCallback(() => {
		const now = performance.now();
		if (now - lastUpdateTimeRef.current < TIME_UPDATE_THROTTLE_MS) {
			// Cancel previous RAF if still pending
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current);
			}
			// Schedule update for next frame
			rafRef.current = requestAnimationFrame(() => {
				const video = videoRef.current;
				if (video && !video.paused) {
					setCurrentTime(video.currentTime);
					lastUpdateTimeRef.current = performance.now();
				}
			});
			return;
		}

		const video = videoRef.current;
		if (video) {
			setCurrentTime(video.currentTime);
			lastUpdateTimeRef.current = now;
		}
	}, []);

	// Event handlers
	const handlePlay = useCallback(() => {
		setIsPlaying(true);
		setError(null);
	}, []);

	const handlePause = useCallback(() => {
		setIsPlaying(false);
	}, []);

	const handleEnded = useCallback(() => {
		setIsPlaying(false);
		const video = videoRef.current;
		if (video) {
			setCurrentTime(video.duration);
		}
	}, []);

	const handleLoadedMetadata = useCallback(() => {
		const video = videoRef.current;
		if (video) {
			setDuration(video.duration);
		}
	}, []);

	const handleError = useCallback(() => {
		const video = videoRef.current;
		if (video) {
			const errorMessage = video.error?.message || 'An error occurred while loading the video';
			setError(new Error(errorMessage));
			setIsPlaying(false);
		}
	}, []);

	// Attach event listeners
	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		video.addEventListener('play', handlePlay);
		video.addEventListener('pause', handlePause);
		video.addEventListener('ended', handleEnded);
		video.addEventListener('loadedmetadata', handleLoadedMetadata);
		video.addEventListener('timeupdate', handleTimeUpdate);
		video.addEventListener('error', handleError);

		return () => {
			video.removeEventListener('play', handlePlay);
			video.removeEventListener('pause', handlePause);
			video.removeEventListener('ended', handleEnded);
			video.removeEventListener('loadedmetadata', handleLoadedMetadata);
			video.removeEventListener('timeupdate', handleTimeUpdate);
			video.removeEventListener('error', handleError);

			// Cancel pending RAF
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current);
			}
		};
	}, [handlePlay, handlePause, handleEnded, handleLoadedMetadata, handleTimeUpdate, handleError]);

	// Control methods
	const play = useCallback(async () => {
		const video = videoRef.current;
		if (!video) return;

		try {
			await video.play();
		} catch (err) {
			const error = err instanceof Error ? err : new Error('Failed to play video');
			setError(error);
			console.error('Error playing video:', error);
		}
	}, []);

	const pause = useCallback(() => {
		const video = videoRef.current;
		if (video) {
			video.pause();
		}
	}, []);

	const stop = useCallback(() => {
		const video = videoRef.current;
		if (video) {
			video.pause();
			video.currentTime = 0;
			setCurrentTime(0);
		}
	}, []);

	const seek = useCallback(
		(time: number) => {
			const video = videoRef.current;
			if (video) {
				const clampedTime = Math.max(0, Math.min(time, duration || video.duration));
				video.currentTime = clampedTime;
				setCurrentTime(clampedTime);
			}
		},
		[duration],
	);

	const setPlaybackRate = useCallback((rate: number) => {
		// Validate rate
		if (!VALID_PLAYBACK_RATES.includes(rate as (typeof VALID_PLAYBACK_RATES)[number])) {
			console.warn(`Invalid playback rate: ${rate}. Using 1.0`);
			rate = 1.0;
		}

		const video = videoRef.current;
		if (video) {
			video.playbackRate = rate;
			setPlaybackRateState(rate);
		}
	}, []);

	const setVolume = useCallback((vol: number) => {
		const clampedVolume = Math.max(0, Math.min(1, vol));
		const video = videoRef.current;
		if (video) {
			video.volume = clampedVolume;
			setVolumeState(clampedVolume);
		}
	}, []);

	const toggleMute = useCallback(() => {
		const video = videoRef.current;
		if (video) {
			video.muted = !video.muted;
			setIsMuted(video.muted);
		}
	}, []);

	// Note: Playback rate and volume are already synced in setPlaybackRate and setVolume callbacks
	// These effects are redundant but kept for safety in case video element is replaced

	return {
		// State
		isPlaying,
		currentTime,
		duration,
		playbackRate,
		volume,
		isMuted,
		error,

		// Refs
		videoRef,

		// Controls
		play,
		pause,
		stop,
		seek,
		setPlaybackRate,
		setVolume,
		toggleMute,
	};
}
