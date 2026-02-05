'use client';

import { SmartCard } from '@/modules/flashcard/types';
import { useSessionStore } from '@/modules/study/store/useSessionStore';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Study session phase types
 */
export type StudyPhase = 'loading' | 'priming-modal' | 'priming' | 'briefing' | 'quiz' | 'summary';

/**
 * Options for useSessionPhase hook
 */
export interface UseSessionPhaseOptions {
	queue: SmartCard[];
	currentCard: SmartCard | null;
	currentIndex: number;
	isSessionActive: boolean;
	isLoading: boolean;
	redirectToDashboard: () => void;
	/** When true, skip briefing and go straight to quiz when session has new/leech cards. */
	skipBriefingByDefault?: boolean;
}

/**
 * Return type for useSessionPhase hook
 */
export interface UseSessionPhaseReturn {
	studyPhase: StudyPhase;
	setStudyPhase: (phase: StudyPhase) => void;
	hasSkippedBriefing: boolean;
	setHasSkippedBriefing: (value: boolean) => void;
	hasSkippedPriming: boolean;
	setHasSkippedPriming: (value: boolean) => void;
	transitionToQuiz: () => void;
	transitionToSummary: () => void;
}

/**
 * Hook to manage study session phase state and transitions.
 *
 * Handles:
 * - Phase transitions (loading → briefing/quiz → summary)
 * - User preferences (skipped briefing/priming)
 * - Session completion detection
 *
 * @param options - Configuration for phase management
 * @returns Phase state and transition functions
 */
export function useSessionPhase(options: UseSessionPhaseOptions): UseSessionPhaseReturn {
	const {
		queue,
		currentCard,
		currentIndex,
		isSessionActive,
		isLoading: isLoadingOption,
		redirectToDashboard,
		skipBriefingByDefault = false,
	} = options;

	// Use ref to always have latest isLoading value (breaks circular dependency)
	const isLoadingRef = useRef(isLoadingOption);
	useEffect(() => {
		isLoadingRef.current = isLoadingOption;
	}, [isLoadingOption]);

	// Phase state
	const [studyPhase, setStudyPhase] = useState<StudyPhase>('loading');
	const [hasSkippedBriefing, setHasSkippedBriefing] = useState(false);
	const [hasSkippedPriming, setHasSkippedPriming] = useState(false);

	// Task 1.3: Phase transition from loading → briefing/quiz
	useEffect(() => {
		const currentIsLoading = isLoadingRef.current;
		console.log('[useSessionPhase] Phase transition effect:', {
			isLoading: currentIsLoading,
			studyPhase,
			queueLength: queue.length,
			hasSkippedBriefing,
		});

		// Don't transition if user has explicitly skipped briefing or already in quiz
		if (hasSkippedBriefing || studyPhase === 'quiz') {
			return;
		}

		if (!currentIsLoading && studyPhase === 'loading') {
			console.log('[useSessionPhase] Phase transition check:', {
				queueLength: queue.length,
				currentCard: !!useSessionStore.getState().currentCard,
			});

			if (queue.length === 0) {
				console.warn('[useSessionPhase] Queue is empty, redirecting to dashboard');
				redirectToDashboard();
				return;
			}

			// Ensure currentCard is set before transitioning
			const { currentCard: storeCurrentCard } = useSessionStore.getState();
			if (!storeCurrentCard && queue.length > 0) {
				console.log('[useSessionPhase] Setting currentCard from queue[0]');
				useSessionStore.setState({ currentCard: queue[0], currentIndex: 0 });
			}

			// Check for Briefing Candidates
			const hasNew = queue.some((c) => c.srsStage === 0);
			const hasLeech = false; // TODO: Add lapses to SmartCard type

			// Debug: Log briefing decision
			const newCount = queue.filter((c) => c.srsStage === 0).length;
			const reviewCount = queue.filter((c) => c.srsStage > 0).length;
			console.log('[useSessionPhase] Briefing decision:', {
				hasNew,
				hasLeech,
				newCount,
				reviewCount,
				total: queue.length,
			});

			if (hasNew || hasLeech) {
				if (skipBriefingByDefault) {
					// User preference: skip briefing and go straight to quiz
					useSessionStore.setState({
						currentCard: queue[0],
						currentIndex: 0,
						isSessionActive: true,
					});
					// eslint-disable-next-line react-hooks/set-state-in-effect
					setStudyPhase('quiz');
				} else {
					setStudyPhase('briefing');
				}
			} else {
				setStudyPhase('quiz');
			}
		}
	}, [
		queue,
		studyPhase,
		hasSkippedBriefing,
		redirectToDashboard,
		isLoadingOption,
		skipBriefingByDefault,
	]);

	// Task 1.5: Ensure currentCard is set when entering quiz phase
	useEffect(() => {
		if (studyPhase === 'quiz' && queue.length > 0 && !currentCard) {
			// Force set currentCard from queue
			useSessionStore.setState({ currentCard: queue[0], currentIndex: 0 });
		}
	}, [studyPhase, queue, currentCard]);

	// Task 1.3: Detect session completion and transition to summary
	useEffect(() => {
		// Only check during quiz phase (active study session)
		if (studyPhase !== 'quiz') {
			return;
		}

		// Session is complete when:
		// 1. isSessionActive is false (set by nextCard() when queue exhausted)
		//    OR
		// 2. currentIndex >= queue.length (all cards reviewed, including re-queued "Again" cards)
		//    Note: queue.length can grow if "Again" cards are re-queued, so we check index vs length
		const isComplete = !isSessionActive || (currentIndex >= queue.length && queue.length > 0);

		if (isComplete) {
			console.log('[useSessionPhase] Session complete detected, transitioning to summary', {
				isSessionActive,
				currentCard: !!currentCard,
				queueLength: queue.length,
				currentIndex,
			});

			// End session in store (ensures stats are finalized)
			useSessionStore.getState().endSession();

			// Transition to summary phase
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setStudyPhase('summary');
		}
	}, [studyPhase, isSessionActive, currentCard, queue.length, currentIndex]);

	// Task 1.4: Helper function to transition to quiz
	const transitionToQuiz = useCallback(() => {
		if (queue.length > 0 && queue[0]) {
			// CRITICAL: Always set currentCard BEFORE transitioning
			useSessionStore.setState({
				currentCard: queue[0],
				currentIndex: 0,
				isSessionActive: true,
			});
			// Transition immediately - state update is synchronous
			setStudyPhase('quiz');
		}
	}, [queue]);

	// Task 1.4: Helper function to transition to summary
	const transitionToSummary = useCallback(() => {
		useSessionStore.getState().endSession();
		setStudyPhase('summary');
	}, []);

	return {
		studyPhase,
		setStudyPhase,
		hasSkippedBriefing,
		setHasSkippedBriefing,
		hasSkippedPriming,
		setHasSkippedPriming,
		transitionToQuiz,
		transitionToSummary,
	};
}
