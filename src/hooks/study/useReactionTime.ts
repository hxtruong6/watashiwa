import { useEffect, useRef, useState } from 'react';

interface UseReactionTimeReturn {
	duration: number;
	startTimer: () => void;
	stopTimer: () => number;
	resetTimer: () => void;
	isRunning: boolean;
}

/**
 * Custom hook to track reaction time from card reveal to rating selection
 * Handles edge cases: app backgrounding, tab switching, focus loss
 */
export function useReactionTime(): UseReactionTimeReturn {
	const [duration, setDuration] = useState(0);
	const [isRunning, setIsRunning] = useState(false);
	const startTimeRef = useRef<number | null>(null);
	const pausedTimeRef = useRef<number>(0); // Accumulated paused time
	const lastPauseTimeRef = useRef<number | null>(null);
	const isPausedRef = useRef(false);

	// Handle visibility changes (app backgrounding, tab switching)
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.hidden && isRunning && !isPausedRef.current) {
				// App was backgrounded - pause timer
				lastPauseTimeRef.current = performance.now();
				isPausedRef.current = true;
			} else if (!document.hidden && isPausedRef.current && isRunning) {
				// App was foregrounded - resume timer
				if (lastPauseTimeRef.current) {
					const pauseDuration = performance.now() - lastPauseTimeRef.current;
					pausedTimeRef.current += pauseDuration;
					lastPauseTimeRef.current = null;
				}
				isPausedRef.current = false;
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [isRunning]);

	const startTimer = () => {
		startTimeRef.current = performance.now();
		pausedTimeRef.current = 0;
		lastPauseTimeRef.current = null;
		isPausedRef.current = false;
		setIsRunning(true);
		setDuration(0);
	};

	const stopTimer = (): number => {
		if (!startTimeRef.current) {
			return 0;
		}

		// Calculate final duration accounting for pauses
		let finalDuration = performance.now() - startTimeRef.current - pausedTimeRef.current;

		// If currently paused, add the current pause duration
		if (isPausedRef.current && lastPauseTimeRef.current) {
			const currentPauseDuration = performance.now() - lastPauseTimeRef.current;
			finalDuration -= currentPauseDuration;
		}

		// Ensure non-negative duration and cap at reasonable max (1 hour)
		finalDuration = Math.max(0, Math.min(finalDuration, 3600000));

		setDuration(finalDuration);
		setIsRunning(false);
		startTimeRef.current = null;
		pausedTimeRef.current = 0;
		lastPauseTimeRef.current = null;
		isPausedRef.current = false;

		return finalDuration;
	};

	const resetTimer = () => {
		startTimeRef.current = null;
		pausedTimeRef.current = 0;
		lastPauseTimeRef.current = null;
		isPausedRef.current = false;
		setIsRunning(false);
		setDuration(0);
	};

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			// Reset all state on unmount
			startTimeRef.current = null;
			pausedTimeRef.current = 0;
			lastPauseTimeRef.current = null;
			isPausedRef.current = false;
			setIsRunning(false);
			setDuration(0);
		};
	}, []);

	return {
		duration,
		startTimer,
		stopTimer,
		resetTimer,
		isRunning,
	};
}
