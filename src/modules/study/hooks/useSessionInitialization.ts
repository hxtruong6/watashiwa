'use client';

import { trackEvent } from '@/lib/analytics';
import { fetchSessionAction } from '@/modules/flashcard/flashcard.actions';
import { SmartCard } from '@/modules/flashcard/types';
import { getStoryByUnitAction } from '@/modules/priming/actions';
import { hasSeenPrimingModal } from '@/modules/priming/components/PrimingModal';
import type { StoryWithContent } from '@/modules/priming/types';
import type { StudyPhase } from '@/modules/study/hooks/useSessionPhase';
import { getDailyProgress } from '@/modules/study/study.actions';
import { getCompletedTutorials, getUserSettings } from '@/modules/user/user.actions';
import type { User } from '@prisma/client';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Daily progress statistics
 */
export interface DailyStats {
	reviewsToday: number;
	newCardsToday: number;
	limitReviews: number;
	limitNewCards: number;
	hasReachedReviewLimit: boolean;
	hasReachedNewCardLimit: boolean;
	dueCount: number;
	reviewsAvailable: number;
	focusPoints: number;
	accuracy: number;
}

/**
 * Options for useSessionInitialization hook
 */
export interface UseSessionInitializationOptions {
	deckId?: string;
	courseId?: string;
	queueLength: number;
	hasSkippedBriefing: boolean;
	hasSkippedPriming: boolean;
	startSession: (cards: SmartCard[]) => void;
	mergeTutorials: (tutorials: Record<string, boolean>) => void;
	setStudyPhase: (phase: StudyPhase) => void;
	redirectToDashboard: () => void;
}

/**
 * Return type for useSessionInitialization hook
 */
export interface UseSessionInitializationReturn {
	isLoading: boolean;
	dailyStats: DailyStats;
	userSettings: Partial<User> | null;
	primingStory: StoryWithContent | null;
	showPrimingModal: boolean;
	setShowPrimingModal: (show: boolean) => void;
	sessionStartTime: number | null;
	initializeSession: () => Promise<void>;
	error: Error | null;
}

/**
 * Hook to manage session initialization and data fetching.
 *
 * Handles:
 * - Fetching daily stats, user settings, tutorials
 * - Checking priming requirements
 * - Fetching and starting session with cards
 * - Resuming existing sessions
 * - Error handling and redirects
 *
 * @param options - Configuration for initialization
 * @returns Initialization state and functions
 */
export function useSessionInitialization(
	options: UseSessionInitializationOptions,
): UseSessionInitializationReturn {
	const { deckId, courseId, queueLength, startSession, mergeTutorials, redirectToDashboard } =
		options;

	// Use refs to always have latest values from options
	// This allows the hook to work even when phase values aren't available initially
	// The ref pattern ensures callbacks always use the latest phase values
	const optionsRef = useRef(options);
	useEffect(() => {
		optionsRef.current = options;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		options.deckId,
		options.courseId,
		options.queueLength,
		options.hasSkippedBriefing,
		options.hasSkippedPriming,
		options.startSession,
		options.mergeTutorials,
		options.setStudyPhase,
		options.redirectToDashboard,
	]);

	// Initialization state
	const [isLoading, setIsLoading] = useState(true);
	const [dailyStats, setDailyStats] = useState<DailyStats>({
		reviewsToday: 0,
		newCardsToday: 0,
		limitReviews: 200,
		limitNewCards: 20,
		hasReachedReviewLimit: false,
		hasReachedNewCardLimit: false,
		dueCount: 0,
		reviewsAvailable: 0,
		focusPoints: 0,
		accuracy: 0,
	});
	const [userSettings, setUserSettings] = useState<Partial<User> | null>(null);
	const [primingStory, setPrimingStory] = useState<StoryWithContent | null>(null);
	const [showPrimingModal, setShowPrimingModal] = useState(false);
	const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
	const [error, setError] = useState<Error | null>(null);

	// Task 2.4: Check priming requirement
	const checkPriming = useCallback(async (): Promise<boolean> => {
		const currentHasSkippedPriming = optionsRef.current.hasSkippedPriming;
		if (!deckId || currentHasSkippedPriming) {
			return false;
		}

		try {
			const primingData = await getStoryByUnitAction({ deckId });
			if (primingData.success && primingData.data) {
				const { story, requiresPriming } = primingData.data;
				if (requiresPriming && story) {
					console.log('[useSessionInitialization] Priming required');
					setPrimingStory(story);

					// Smart Modal: Show modal only if user hasn't seen it before
					const hasSeenModal = hasSeenPrimingModal();
					if (!hasSeenModal) {
						console.log('[useSessionInitialization] Showing priming modal (first time)');
						setShowPrimingModal(true);
						optionsRef.current.setStudyPhase('priming-modal');
					} else {
						console.log('[useSessionInitialization] User has seen modal, showing story directly');
						optionsRef.current.setStudyPhase('priming');
					}

					setIsLoading(false);
					return true; // Priming required, don't fetch cards yet
				}
			}
		} catch (error) {
			console.error('[useSessionInitialization] Failed to check priming:', error);
			// Continue to normal flow on error (graceful degradation)
		}

		return false; // No priming required
	}, [deckId]);

	// Task 2.5: Start session with cards
	const startSessionWithCards = useCallback(async () => {
		console.log(
			'[useSessionInitialization] Fetching cards for deckId:',
			deckId,
			'courseId:',
			courseId,
		);
		const response = await fetchSessionAction({ deckId, courseId });
		console.log('[useSessionInitialization] Fetch response:', {
			success: response.success,
			dataLength: response.data?.length || 0,
			error: response.error,
		});

		if (response.success && response.data) {
			if (response.data.length > 0) {
				// Debug: Log card distribution
				const newCards = response.data.filter((c) => c.srsStage === 0);
				const reviewCards = response.data.filter((c) => c.srsStage > 0);
				console.log('[useSessionInitialization] Card distribution:', {
					total: response.data.length,
					new: newCards.length,
					review: reviewCards.length,
					newCardIds: newCards.map((c) => c.id).slice(0, 3), // First 3 for debugging
				});

				startSession(response.data);
				setSessionStartTime(Date.now());

				// Immediately check phase transition after starting session
				// This ensures phase transitions even if useEffect doesn't trigger
				// BUT: Only if user hasn't skipped briefing before
				const currentHasSkippedBriefing = optionsRef.current.hasSkippedBriefing;
				if (!currentHasSkippedBriefing) {
					const hasNew = response.data.some((c) => c.srsStage === 0);
					if (hasNew) {
						console.log('[useSessionInitialization] Direct transition to briefing (has new cards)');
						optionsRef.current.setStudyPhase('briefing');
					} else {
						console.log(
							'[useSessionInitialization] Direct transition to quiz (no new cards, pure review)',
						);
						optionsRef.current.setStudyPhase('quiz');
					}
				} else {
					// User has skipped before, go directly to quiz
					console.log('[useSessionInitialization] User skipped briefing, going to quiz');
					optionsRef.current.setStudyPhase('quiz');
				}
			} else {
				// No cards available - redirect to dashboard
				console.warn('[useSessionInitialization] No cards found for deckId:', deckId);
				trackEvent('study_empty_state_shown', {
					deck_id: deckId || null,
					course_id: courseId || null,
					total_due_count: 0,
				});
				redirectToDashboard();
			}
		} else {
			// Error fetching cards - redirect to dashboard
			console.error('[useSessionInitialization] Failed to fetch cards:', response.error);
			redirectToDashboard();
		}
	}, [deckId, courseId, startSession, redirectToDashboard]);

	// Task 2.5: Resume existing session
	// Note: Phase transitions for resume are handled by phase hook
	// This function just sets the session start time
	const resumeSession = useCallback(() => {
		if (queueLength > 0) {
			console.log('[useSessionInitialization] Resuming session with', queueLength, 'cards');
			setSessionStartTime(Date.now());
			// Phase transition will be handled by phase hook based on queue state
		}
	}, [queueLength]);

	// Task 2.3: Main initialization function
	const initializeSession = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			// 1. Fetch initial data (parallel)
			const [stats, settings, tutorialsResponse] = await Promise.all([
				getDailyProgress(),
				getUserSettings(),
				getCompletedTutorials(),
			]);

			if (stats) setDailyStats(stats);
			if (settings) {
				setUserSettings(settings);
				// setSpaceKeyRating(settings.spaceKeyRating); // Uncomment if exists
			}

			// Merge server tutorials into the store
			if (tutorialsResponse?.success && tutorialsResponse.data) {
				mergeTutorials(tutorialsResponse.data);
			}

			// 2. Check priming requirement (Soft Gate) - only for specific deckId
			const primingRequired = await checkPriming();
			if (primingRequired) {
				// Priming required, don't fetch cards yet
				return;
			}

			// 3. Fetch Cards if queue is empty
			if (queueLength === 0) {
				await startSessionWithCards();
			} else {
				// Session already started (e.g., from resume)
				// Phase transitions are handled by phase hook
				resumeSession();
			}
		} catch (error) {
			console.error('[useSessionInitialization] Failed to init session:', error);
			setError(error as Error);
			// On error, redirect to dashboard
			redirectToDashboard();
		} finally {
			setIsLoading(false);
		}
	}, [
		checkPriming,
		queueLength,
		startSessionWithCards,
		resumeSession,
		mergeTutorials,
		redirectToDashboard,
	]);

	return {
		isLoading,
		dailyStats,
		userSettings,
		primingStory,
		showPrimingModal,
		setShowPrimingModal,
		sessionStartTime,
		initializeSession,
		error,
	};
}
