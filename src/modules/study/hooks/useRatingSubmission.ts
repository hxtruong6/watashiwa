'use client';

import { mapRememberToRating } from '@/modules/study/utils/timeToRating';
import { message, theme } from 'antd';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseRatingSubmissionOptions {
	submitRating: (rating: 1 | 2 | 3 | 4, duration?: number) => Promise<void>;
	stopTimer: () => number;
	resetTimer: () => void;
	resetReactionTimer: () => void;
	showAnswer: boolean;
	setShowAnswer: (show: boolean) => void;
}

export interface UseRatingSubmissionReturn {
	// Submission handlers
	handleRate: (action: 'forgot' | 'remember' | 'easy', duration?: number) => Promise<void>;
	handleNumericRate: (rating: number) => Promise<void>;

	// State
	isSubmitting: boolean;
	isCardExiting: boolean;
	exitColor: string | undefined;

	// Internal (for advanced use cases)
	submitRatingWithAnimation: (
		rating: 1 | 2 | 3 | 4,
		timeToAnswer: number,
		isExplicitEasy?: boolean,
	) => Promise<void>;
}

/**
 * Hook to manage rating submission with animations and state management.
 *
 * Handles:
 * - Rating submission with exit animations
 * - Action-to-rating mapping (forgot/remember/easy)
 * - Toast notifications
 * - Race condition prevention
 * - Error handling and retry logic
 *
 * @param options - Configuration for rating submission
 * @returns Rating submission handlers and state
 */
export function useRatingSubmission(
	options: UseRatingSubmissionOptions,
): UseRatingSubmissionReturn {
	const { submitRating, stopTimer, resetTimer, resetReactionTimer, showAnswer, setShowAnswer } =
		options;

	// Translation hook
	const t = useTranslations('Study');

	// Theme token for colors
	const { token } = theme.useToken();

	// State
	const [isSubmittingRating, setIsSubmittingRating] = useState(false);
	const [isCardExiting, setIsCardExiting] = useState(false);
	const [exitColor, setExitColor] = useState<string | undefined>(undefined);

	// Refs
	const isSubmittingRef = useRef(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const isMountedRef = useRef(true);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			isMountedRef.current = false;
		};
	}, []);

	// Helper: Show toast notification for rating
	const showRatingToast = useCallback(
		(rating: number, isExplicitEasy: boolean = false) => {
			// Only show toast for EXPLICIT Easy button press (rating 4 from "easy" action)
			// NOT for time-based mappings (fast "remember" clicks that map to 4)
			// This prevents false positives when users click "remember" quickly
			if (rating === 4 && isExplicitEasy) {
				const toastMessage = t('ratingToast.easy'); // "Fluency achieved" / "Mastered!"
				message.success(toastMessage, 0.8);
			}
		},
		[t],
	);

	// Helper: Get exit color based on rating
	const getExitColor = useCallback(
		(rating: number) => {
			const colors = {
				1: token.colorError, // Red for "Again"
				3: token.colorSuccess, // Green for "Good"
				4: token.colorPrimary, // Indigo for "Easy"
			};
			return colors[rating as keyof typeof colors];
		},
		[token],
	);

	// Core submission logic with animation
	const submitRatingWithAnimation = useCallback(
		async (rating: 1 | 2 | 3 | 4, timeToAnswer: number, isExplicitEasy: boolean = false) => {
			// Clear any existing timeout (Memory Leak Fix)
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}

			// Set exit animation
			const color = getExitColor(rating);
			setExitColor(color);
			setIsCardExiting(true);

			// Show toast immediately (optimistic feedback) - non-blocking
			// Only show for explicit "easy" button, not time-based mappings
			showRatingToast(rating, isExplicitEasy);

			// Wait for animation to complete (with proper cleanup)
			timeoutRef.current = setTimeout(async () => {
				if (!isMountedRef.current) {
					setIsSubmittingRating(false);
					isSubmittingRef.current = false;
					return;
				}

				try {
					await submitRating(rating, timeToAnswer);

					if (!isMountedRef.current) {
						setIsSubmittingRating(false);
						isSubmittingRef.current = false;
						return;
					}

					// Success path: Reset exit state BEFORE other updates (State Sync Fix)
					setIsCardExiting(false);
					setExitColor(undefined);
					setShowAnswer(false);
					resetTimer();
					resetReactionTimer();
				} catch (error) {
					// Error Handling Fix
					console.error('[useRatingSubmission] Rating submission failed:', error);

					if (!isMountedRef.current) {
						setIsSubmittingRating(false);
						isSubmittingRef.current = false;
						return;
					}

					// Revert exit animation on error
					setIsCardExiting(false);
					setExitColor(undefined);

					// Show error toast
					message.error(t('failedSubmitReview') || 'Failed to submit review. Please try again.', 3);

					// Keep card visible for retry - don't reset showAnswer
				} finally {
					if (isMountedRef.current) {
						setIsSubmittingRating(false);
						isSubmittingRef.current = false;
					}
					timeoutRef.current = null;
				}
			}, 400); // Match animation duration
		},
		[submitRating, showRatingToast, resetTimer, resetReactionTimer, getExitColor, setShowAnswer, t],
	);

	// Handle action-based rating (from UI buttons)
	const handleRate = useCallback(
		async (action: 'forgot' | 'remember' | 'easy', duration?: number) => {
			// Guard: Prevent multiple submissions (Race Condition Fix)
			if (isSubmittingRating || isSubmittingRef.current) {
				console.warn('[useRatingSubmission] Rating already in progress, ignoring duplicate click');
				return;
			}

			isSubmittingRef.current = true;
			setIsSubmittingRating(true);

			// Get duration from timer if not provided
			const timeToAnswer = duration ?? stopTimer();

			// Edge case: Timer not started (race condition) - default to GOOD for "remember"
			if (timeToAnswer === 0 && action === 'remember') {
				console.warn('[useRatingSubmission] Timer not started, defaulting to GOOD');
			}

			// Map action to rating
			let rating: 1 | 2 | 3 | 4;
			let isExplicitEasy = false;

			if (action === 'forgot') {
				rating = 1; // Always AGAIN
			} else if (action === 'easy') {
				rating = 4; // Explicit Easy (long-press override)
				isExplicitEasy = true; // Mark as explicit Easy button press
			} else {
				// action === 'remember': Use time-based mapping
				rating = mapRememberToRating(timeToAnswer);
				// Even if time-based mapping returns 4, it's NOT explicit Easy
				isExplicitEasy = false;
			}

			await submitRatingWithAnimation(rating, timeToAnswer, isExplicitEasy);
		},
		[isSubmittingRating, stopTimer, submitRatingWithAnimation],
	);

	// Handle numeric rating (from keyboard shortcuts)
	const handleNumericRate = useCallback(
		async (rating: number) => {
			// Guard: Prevent multiple submissions
			if (isSubmittingRating || isSubmittingRef.current) {
				return;
			}

			// Validate rating
			if (![1, 2, 3, 4].includes(rating)) {
				console.error('[useRatingSubmission] Invalid rating value:', rating);
				return;
			}

			isSubmittingRef.current = true;
			setIsSubmittingRating(true);

			// Get duration from timer
			const timeToAnswer = stopTimer();

			// Numeric ratings from keyboard are explicit (user pressed 4 for Easy)
			const isExplicitEasy = rating === 4;

			await submitRatingWithAnimation(rating as 1 | 2 | 3 | 4, timeToAnswer, isExplicitEasy);
		},
		[isSubmittingRating, stopTimer, submitRatingWithAnimation],
	);

	return {
		handleRate,
		handleNumericRate,
		isSubmitting: isSubmittingRating,
		isCardExiting,
		exitColor,
		submitRatingWithAnimation,
	};
}
