import { useState, useEffect, useCallback } from 'react';
import {
	submitReview,
	getDailyProgress,
	getReviewQueue,
	type StudyCardWithDetails,
} from '@/services/actions';
import { getCourseById } from '@/services/course-actions';
import { App } from 'antd';
import { useTranslations } from 'next-intl';

interface UseStudySessionProps {
	courseId?: string;
	deckId?: string;
	mode?: 'quick' | null;
	userSettings?: {
		limitReviews: number;
		limitNewCards: number;
	} | null;
}

export function useStudySession({ courseId, deckId, mode, userSettings }: UseStudySessionProps) {
	const { message } = App.useApp();
	const t = useTranslations('Study');

	// State
	const [card, setCard] = useState<StudyCardWithDetails | null>(null);
	const [queue, setQueue] = useState<StudyCardWithDetails[]>([]);
	const [loading, setLoading] = useState(true);
	const [sessionComplete, setSessionComplete] = useState(false);
	const [targetDeckIds, setTargetDeckIds] = useState<string | string[] | undefined>(
		deckId || undefined,
	);
	const [error, setError] = useState<string | null>(null);
	const [submittingRating, setSubmittingRating] = useState<number | null>(null);
	const [showAnswer, setShowAnswer] = useState(false);

	// Quick Mode Limits
	const isQuickMode = mode === 'quick';
	const [sessionLimit] = useState<number | null>(isQuickMode ? 5 : null);
	const [cardsReviewedInSession, setCardsReviewedInSession] = useState(0);

	// Stats
	const [dailyStats, setDailyStats] = useState({
		reviewsToday: 0,
		limitReviews: 200,
		newCardsToday: 0,
		limitNewCards: 20,
		dueCount: 0,
	});

	// Sync Stats with User Settings
	useEffect(() => {
		if (userSettings) {
			setDailyStats((prev) => ({
				...prev,
				limitReviews: userSettings.limitReviews,
				limitNewCards: userSettings.limitNewCards, // Assuming userSettings has this
			}));
		}
	}, [userSettings]);

	// Initial Stats Load
	useEffect(() => {
		getDailyProgress().then((stats) => {
			if (stats) setDailyStats(stats);
		});
	}, []);

	// Update Stats Helper
	const updateStats = useCallback(() => {
		getDailyProgress().then((stats) => {
			if (stats) setDailyStats(stats);
		});
	}, []);

	// Resolve Course ID to Deck IDs
	useEffect(() => {
		if (courseId) {
			setLoading(true);
			getCourseById(courseId)
				.then((course) => {
					if (course && course.decks.length > 0) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const ids = course.decks.map((cd: any) => cd.deckId);
						setTargetDeckIds(ids);
					} else {
						const msg = t('errorCourseNotFound');
						message.error(msg);
						setError(msg);
						setLoading(false);
					}
				})
				.catch(() => {
					const msg = t('errorLoadCourse');
					message.error(msg);
					setError(msg);
					setLoading(false);
				});
		} else if (deckId) {
			setTargetDeckIds(deckId);
		}
	}, [courseId, deckId, message, t]);

	// Fetch Next Card / Manage Queue
	const fetchNextCard = useCallback(async () => {
		try {
			if (courseId && !Array.isArray(targetDeckIds)) {
				return; // Wait for course resolution
			}

			// Check Quick Mode Limit
			if (sessionLimit && cardsReviewedInSession >= sessionLimit) {
				setCard(null);
				setSessionComplete(true);
				updateStats();
				return;
			}

			// If we have cards in queue, use them immediately (client side)
			if (queue.length > 0) {
				const nextCard = queue[0];
				setCard(nextCard);
				setQueue((prev) => prev.slice(1)); // Remove from queue
				setShowAnswer(false);
				setSessionComplete(false);
				setLoading(false);
				return;
			}

			// Otherwise fetch from server
			setLoading(true);

			// Calc how many to fetch
			const fetchCount = sessionLimit ? Math.min(3, sessionLimit - cardsReviewedInSession) : 3;
			if (fetchCount <= 0) {
				setCard(null);
				setSessionComplete(true);
				updateStats();
				setLoading(false);
				return;
			}

			// Use Queue Fetcher instead of single card
			const newQueue = await getReviewQueue(targetDeckIds, fetchCount); // Buffer cards

			if (newQueue.length > 0) {
				const nextCard = newQueue[0];
				setCard(nextCard);
				setQueue(newQueue.slice(1));
				setShowAnswer(false);
				setSessionComplete(false);
			} else {
				setCard(null);
				setSessionComplete(true);
				updateStats();
			}
		} catch (err) {
			console.error('Failed to fetch card', err);
			message.error(t('failedLoadCards'));
			setError(t('failedLoadCards'));
		} finally {
			setLoading(false);
		}
	}, [
		courseId,
		targetDeckIds,
		queue,
		message,
		t,
		updateStats,
		sessionLimit,
		cardsReviewedInSession,
	]);

	// Initial Load Trigger
	useEffect(() => {
		if (!card && !loading && !sessionComplete && !error) {
			// Only fetch if we are idle and not complete/error
			fetchNextCard();
		}
	}, [card, loading, sessionComplete, error, fetchNextCard]);

	// Submit Review Logic
	const handleRate = useCallback(
		async (rating: number) => {
			if (!card || submittingRating !== null) return;

			const currentCardId = card.id;
			setSubmittingRating(rating);

			// Update count
			const newReviewedCount = cardsReviewedInSession + 1;
			setCardsReviewedInSession(newReviewedCount);

			// Check Session Limit
			if (sessionLimit && newReviewedCount >= sessionLimit) {
				// Finish session immediately
				setCard(null);
				setSessionComplete(true);
				setSubmittingRating(null);

				// Background sync the final review
				submitReview(currentCardId, rating, targetDeckIds).catch((err) => console.error(err));
				updateStats(); // Update stats one last time
				return;
			}

			// 1. Prepare Next Card (Optimistic)
			let nextCard: StudyCardWithDetails | null = null;
			if (queue.length > 0) {
				nextCard = queue[0];
				setQueue((prev) => prev.slice(1));
			}

			// 2. Update UI State Instantly
			if (nextCard) {
				setCard(nextCard);
				setShowAnswer(false);
				setSubmittingRating(null);
			} else {
				setLoading(true); // Will show loading until fetch completes
			}

			// 3. Update Stats Optimistically
			setDailyStats((prev) => ({
				...prev,
				reviewsToday: prev.reviewsToday + 1,
			}));

			// 4. Background Sync
			submitReview(currentCardId, rating, targetDeckIds)
				.then((result) => {
					if (!result.success) {
						console.error('Background review submission failed', result.error);
						message.error(t('failedSubmitReview'));
					} else {
						// Replenish queue if low
						if (queue.length < 2) {
							getReviewQueue(targetDeckIds, 3).then((newCards) => {
								setQueue((prev) => {
									const allIds = new Set(prev.map((c) => c.id));
									allIds.add(card.id);
									if (nextCard) allIds.add(nextCard.id);

									const validNew = newCards.filter((c) => !allIds.has(c.id));
									return [...prev, ...validNew];
								});
							});
						}
					}
				})
				.catch((err) => console.error('BG Submit Error', err));

			// 5. If we didn't have a next card, we must wait for fetch
			if (!nextCard) {
				const fetchCount = sessionLimit ? Math.min(3, sessionLimit - newReviewedCount) : 3;

				if (fetchCount <= 0) {
					setCard(null);
					setSessionComplete(true);
					updateStats();
					setLoading(false);
					setSubmittingRating(null);
					return;
				}

				const newQueue = await getReviewQueue(targetDeckIds, fetchCount);
				if (newQueue.length > 0) {
					setCard(newQueue[0]);
					setQueue(newQueue.slice(1));
					setShowAnswer(false);
					setSessionComplete(false);
				} else {
					setCard(null);
					setSessionComplete(true);
				}
				setLoading(false);
				setSubmittingRating(null);
			}
		},
		[
			card,
			submittingRating,
			queue,
			targetDeckIds,
			message,
			t,
			cardsReviewedInSession,
			sessionLimit,
			updateStats,
		],
	);

	return {
		card,
		loading,
		sessionComplete,
		dailyStats,
		error,
		submittingRating,
		handleRate,
		fetchNextCard, // Exposed just in case
		targetDeckIds, // Exposed if needed
		showAnswer,
		setShowAnswer,
	};
}
