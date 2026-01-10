'use client';

import { AnalyticsEvents, trackEvent } from '@/lib/analytics';
import { SmartCard } from '@/modules/flashcard/types';
import type { StudyPhase } from '@/modules/study/hooks/useSessionPhase';
import { useSessionStore } from '@/modules/study/store/useSessionStore';
import { useCallback, useEffect, useState } from 'react';

export interface UseSessionAnalyticsOptions {
	deckId?: string;
	courseId?: string;
	mode?: string;
	isFirstSession: boolean;
	dueCount: number;
	queue: SmartCard[];
	studyPhase: StudyPhase;
	currentCard: SmartCard | null;
	sessionStartTime: number | null;
	isLoading: boolean;
}

export interface UseSessionAnalyticsReturn {
	// Internal state (for component use)
	hasTrackedSessionStart: boolean;
	firstCardShown: boolean;
}

/**
 * Hook to manage automatic analytics tracking for study sessions.
 *
 * Handles automatic tracking via useEffects:
 * - Session start tracking (when queue is populated)
 * - First card shown tracking (when entering quiz phase)
 * - Session completion tracking (when entering summary phase)
 *
 * Note: Manual tracking calls (session reset, priming skipped) should be
 * made inline using trackEvent directly.
 *
 * @param options - Configuration for analytics tracking
 * @returns Tracking state (for component dependencies)
 */
export function useSessionAnalytics(
	options: UseSessionAnalyticsOptions,
): UseSessionAnalyticsReturn {
	const {
		deckId,
		courseId,
		mode,
		isFirstSession,
		dueCount,
		queue,
		studyPhase,
		currentCard,
		sessionStartTime,
		isLoading,
	} = options;

	// Internal state to prevent duplicate tracking
	const [hasTrackedSessionStart, setHasTrackedSessionStart] = useState(false);
	const [firstCardShown, setFirstCardShown] = useState(false);

	// Helper to get entry type (memoized to avoid dependency issues)
	const getEntryType = useCallback(() => {
		return deckId ? 'explicit_deck' : courseId ? 'explicit_course' : 'auto_start';
	}, [deckId, courseId]);

	// Track session start when queue is populated
	useEffect(() => {
		if (queue.length > 0 && !hasTrackedSessionStart && !isLoading) {
			const entryType = getEntryType();

			// Track first session start
			if (isFirstSession) {
				trackEvent(AnalyticsEvents.Study.FirstSessionStarted, {
					entry_method: entryType,
					deck_id: deckId || null,
					queue_size: queue.length,
					due_count: dueCount,
				});
			}

			// Track regular session start
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const nav = navigator as any;
			trackEvent(AnalyticsEvents.Study.SessionStarted, {
				entry_type: entryType,
				deck_id: deckId || null,
				course_id: courseId || null,
				mode: mode || null,
				queue_size: queue.length,
				due_count: dueCount,
				device_memory: nav?.deviceMemory, // RAM in GB
				hardware_concurrency: navigator?.hardwareConcurrency, // CPU cores
				connection_type: nav?.connection?.effectiveType, // 4G, 3G, etc.
				is_pwa: window?.matchMedia('(display-mode: standalone)').matches,
			});

			// eslint-disable-next-line react-hooks/set-state-in-effect
			setHasTrackedSessionStart(true);
		}
	}, [
		queue.length,
		hasTrackedSessionStart,
		isLoading,
		studyPhase,
		isFirstSession,
		deckId,
		courseId,
		mode,
		dueCount,
		getEntryType,
	]);

	// Track first card shown
	useEffect(() => {
		if (studyPhase === 'quiz' && currentCard && !firstCardShown && sessionStartTime) {
			const timeToFirstCard = Date.now() - sessionStartTime;
			const entryType = getEntryType();

			trackEvent(AnalyticsEvents.Study.FirstCardShown, {
				time_to_first_card_ms: timeToFirstCard,
				entry_type: entryType,
			});

			// eslint-disable-next-line react-hooks/set-state-in-effect
			setFirstCardShown(true);
		}
	}, [studyPhase, currentCard, firstCardShown, sessionStartTime, deckId, courseId, getEntryType]);

	// Track session completion
	useEffect(() => {
		if (studyPhase === 'summary' && hasTrackedSessionStart && sessionStartTime) {
			// Use a small delay to ensure sessionStats are updated
			setTimeout(() => {
				const { sessionStats: latestStats } = useSessionStore.getState();
				const totalCards =
					latestStats.reviews[1] +
					latestStats.reviews[2] +
					latestStats.reviews[3] +
					latestStats.reviews[4];
				const sessionDuration = (latestStats.endTime || Date.now()) - sessionStartTime;
				const averageRating =
					totalCards > 0
						? (latestStats.reviews[1] * 1 +
								latestStats.reviews[2] * 2 +
								latestStats.reviews[3] * 3 +
								latestStats.reviews[4] * 4) /
							totalCards
						: 0;

				const entryType = getEntryType();

				const newCards = queue.filter((c) => c.srsStage === 0).length;
				const reviewCards = totalCards - newCards;

				// Track first session completion
				if (isFirstSession) {
					trackEvent(AnalyticsEvents.Study.FirstSessionCompleted, {
						cards_reviewed: totalCards,
						session_duration_ms: sessionDuration,
						completion_rate: 1.0, // Assuming completed if we reached summary
					});
				}

				// Track regular session completion
				trackEvent(AnalyticsEvents.Study.SessionCompleted, {
					cards_reviewed: totalCards,
					cards_new: newCards,
					cards_review: reviewCards,
					session_duration_ms: sessionDuration,
					average_rating: averageRating,
					entry_type: entryType,
					abandoned: false,
				});
			}, 100);
		}
	}, [
		studyPhase,
		hasTrackedSessionStart,
		sessionStartTime,
		isFirstSession,
		deckId,
		courseId,
		queue,
		getEntryType,
	]);

	return {
		hasTrackedSessionStart,
		firstCardShown,
	};
}
