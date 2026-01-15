/**
 * Video Progress Hook
 *
 * Auto-saves video progress and loads saved progress on mount
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { markVideoCompleted, updateVideoProgress } from '../actions';
import {
	COMPLETION_TOLERANCE_SECONDS,
	MAX_RETRIES,
	MIN_TIME_DELTA_SECONDS,
	PROGRESS_SAVE_INTERVAL_MS,
	RETRY_BASE_DELAY_MS,
} from '../constants';
import type { VideoProgress } from '../types';

interface UseVideoProgressOptions {
	videoId: string;
	currentTime: number;
	duration: number;
	isPlaying: boolean;
	onCompleted?: () => void;
}

export interface UseVideoProgressReturn {
	isSaving: boolean;
	progress: VideoProgress | null;
	loadProgress: () => Promise<void>;
}

/**
 * Custom hook for video progress tracking
 */
export function useVideoProgress({
	videoId,
	currentTime,
	duration,
	isPlaying,
	onCompleted,
}: UseVideoProgressOptions): UseVideoProgressReturn {
	const [isSaving, setIsSaving] = useState(false);
	const [progress, setProgress] = useState<VideoProgress | null>(null);
	const lastSavedTimeRef = useRef(0);
	const lastSaveTimeRef = useRef(0);
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const retryCountRef = useRef(0);
	const watchTimeRef = useRef(0);
	const lastCurrentTimeRef = useRef(0);
	const startTimeRef = useRef<number | null>(null);

	// Track watch time
	useEffect(() => {
		if (isPlaying) {
			if (startTimeRef.current === null) {
				startTimeRef.current = Date.now();
			}
		} else {
			if (startTimeRef.current !== null) {
				const elapsed = (Date.now() - startTimeRef.current) / 1000;
				watchTimeRef.current += elapsed;
				startTimeRef.current = null;
			}
		}
	}, [isPlaying]);

	// Auto-save progress
	const saveProgress = useCallback(async () => {
		const now = Date.now();

		// Don't save if time hasn't changed significantly
		const timeDelta = Math.abs(currentTime - lastSavedTimeRef.current);
		if (
			timeDelta < MIN_TIME_DELTA_SECONDS &&
			now - lastSaveTimeRef.current < PROGRESS_SAVE_INTERVAL_MS
		) {
			return;
		}

		// Calculate watch time
		if (isPlaying && startTimeRef.current !== null) {
			const elapsed = (now - startTimeRef.current) / 1000;
			watchTimeRef.current += elapsed;
			startTimeRef.current = now;
		}

		setIsSaving(true);
		lastSavedTimeRef.current = currentTime;
		lastSaveTimeRef.current = now;

		try {
			const result = await updateVideoProgress({
				videoId,
				currentTime,
				watchTime: Math.floor(watchTimeRef.current),
			});

			if (result.success && result.data) {
				setProgress(result.data);
				retryCountRef.current = 0; // Reset retry count on success
			} else if (result.error && retryCountRef.current < MAX_RETRIES) {
				console.error('Error saving video progress:', result.error);
				retryCountRef.current += 1;
				// Exponential backoff
				const retryDelay = RETRY_BASE_DELAY_MS * retryCountRef.current;
				retryTimeoutRef.current = setTimeout(() => {
					saveProgress();
				}, retryDelay);
			} else if (result.error) {
				console.error('Max retries reached for video progress save');
				retryCountRef.current = 0; // Reset for next save attempt
			}
		} catch (error) {
			console.error('Error saving video progress:', error);
			// Don't block UI on save errors - will retry on next save interval
		} finally {
			setIsSaving(false);
		}
	}, [videoId, currentTime, isPlaying]);

	// Auto-save on interval or pause
	useEffect(() => {
		// Clear existing timeout
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}

		// Save on pause
		if (!isPlaying && lastCurrentTimeRef.current !== currentTime) {
			saveProgress();
			lastCurrentTimeRef.current = currentTime;
			return;
		}

		// Save on interval while playing
		if (isPlaying) {
			saveTimeoutRef.current = setTimeout(() => {
				saveProgress();
			}, PROGRESS_SAVE_INTERVAL_MS);
		}

		lastCurrentTimeRef.current = currentTime;

		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
		};
	}, [currentTime, isPlaying, saveProgress]);

	// Mark as completed when video ends
	useEffect(() => {
		if (
			duration > 0 &&
			currentTime >= duration - COMPLETION_TOLERANCE_SECONDS &&
			!progress?.completed
		) {
			// Video ended (with tolerance)
			markVideoCompleted({ videoId })
				.then((result) => {
					if (result.success && result.data) {
						setProgress(result.data);
						onCompleted?.();
					}
				})
				.catch((error) => {
					console.error('Error marking video as completed:', error);
				});
		}
	}, [currentTime, duration, videoId, progress?.completed, onCompleted]);

	// Cleanup timers on unmount
	useEffect(() => {
		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
			if (retryTimeoutRef.current) {
				clearTimeout(retryTimeoutRef.current);
			}
		};
	}, []);

	const loadProgress = useCallback(async () => {
		// TODO: Implement manual progress refresh if needed
		console.warn('loadProgress not yet implemented');
	}, []);

	return {
		isSaving,
		progress,
		loadProgress,
	};
}
