'use client';

// Components
import { useFlashCardAudio } from '@/hooks/study/useFlashCardAudio';
import { useReactionTime } from '@/hooks/study/useReactionTime';
import { useStudyShortcuts } from '@/hooks/study/useStudyShortcuts';
import { useZenMode } from '@/hooks/study/useZenMode';
// Hooks
import { useTutorialStore } from '@/hooks/useTutorialStore';
import { AnalyticsEvents, trackEvent } from '@/lib/analytics';
import CommentDrawer from '@/modules/community/components/comments/CommentDrawer';
import { CardShell } from '@/modules/flashcard/components/CardShell';
import { fetchSessionAction } from '@/modules/flashcard/flashcard.actions';
import { getSessionDataWithPriming } from '@/modules/priming/actions';
import { PrimingModal, hasSeenPrimingModal } from '@/modules/priming/components/PrimingModal';
import { StoryReader } from '@/modules/priming/components/StoryReader';
import { StoryWithContent } from '@/modules/priming/types';
import ReportModal from '@/modules/report/components/ReportModal';
import { RelatedWordDetailsDrawer } from '@/modules/study/components/RelatedWords/RelatedWordDetailsDrawer';
import { RelatedWordsSheet } from '@/modules/study/components/RelatedWords/RelatedWordsSheet';
import { useRelatedWords } from '@/modules/study/hooks/useRelatedWords';
import { useSessionStore } from '@/modules/study/store/useSessionStore';
import { useStudyPreferences } from '@/modules/study/store/useStudyPreferences';
import { getDailyProgress } from '@/modules/study/study.actions';
import type { RelatedWord } from '@/modules/study/types/related-words';
import { mapRememberToRating } from '@/modules/study/utils/timeToRating';
import { useUIStore } from '@/modules/ui/store/useUIStore';
import { getCompletedTutorials, getUserSettings } from '@/modules/user/user.actions';
import { CommentOutlined, SettingOutlined } from '@ant-design/icons';
import type { User } from '@prisma/client';
import { Button, Drawer, Flex, Grid, Spin, Typography, message, theme } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Local Components
import RatingBar from './RatingBar';
import SessionBriefing from './SessionBriefing';
import { SessionContainer } from './SessionContainer';
import SessionSummary from './SessionSummary';
import StudySettings from './StudySettings';
import { StudySidebar } from './StudySidebar';
import { SubtleActionBar } from './SubtleActionBar';

const { useBreakpoint } = Grid;

interface SessionControllerProps {
	deckId?: string;
	courseId?: string;
	mode?: string;
	isFirstSession?: boolean;
	dueCount?: number;
}

export default function SessionController({
	deckId,
	courseId,
	mode,
	isFirstSession = false,
	dueCount = 0,
}: SessionControllerProps) {
	const t = useTranslations('Study');
	const router = useRouter();
	const screens = useBreakpoint();
	const isDesktop = screens.md; // Vertical Slice Logic: ≥768px is desktop-like

	// Store
	const { startSession, queue, currentIndex, submitRating, isSessionActive, currentCard } =
		useSessionStore();
	const { mergeTutorials } = useTutorialStore();
	const { setNavBarVisible } = useUIStore();

	// Local State
	const [isLoading, setIsLoading] = useState(true);
	const [studyPhase, setStudyPhase] = useState<
		'loading' | 'priming-modal' | 'priming' | 'briefing' | 'quiz' | 'summary'
	>('loading');
	const [hasSkippedBriefing, setHasSkippedBriefing] = useState(false);
	const [primingStory, setPrimingStory] = useState<StoryWithContent | null>(null);
	const [hasSkippedPriming, setHasSkippedPriming] = useState(false);
	const [showPrimingModal, setShowPrimingModal] = useState(false);
	const [dailyStats, setDailyStats] = useState({
		reviewsToday: 0,
		limitReviews: 200,
	});
	const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
	const [firstCardShown, setFirstCardShown] = useState(false);
	const [hasTrackedSessionStart, setHasTrackedSessionStart] = useState(false);

	// UI Visibility
	const [settingsVisible, setSettingsVisible] = useState(false);
	const [isReportModalOpen, setIsReportModalOpen] = useState(false);
	const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
	const [selectedRelatedWord, setSelectedRelatedWord] = useState<RelatedWord | null>(null);
	const [isRelatedWordDrawerOpen, setIsRelatedWordDrawerOpen] = useState(false);

	// Settings STORE
	const { showFurigana, showRomaji, autoPlayAudio, cardBackSettings } = useStudyPreferences();
	const [userSettings, setUserSettings] = useState<Partial<User> | null>(null);
	const [showAnswer, setShowAnswer] = useState(false);
	const [isCardExiting, setIsCardExiting] = useState(false);
	const [exitColor, setExitColor] = useState<string | undefined>(undefined);
	const [isSubmittingRating, setIsSubmittingRating] = useState(false);

	// Refs
	const scrollRef = useRef<HTMLDivElement>(null);
	const settingsRef = useRef<HTMLButtonElement>(null);
	const cardWrapperRef = useRef<HTMLDivElement>(null);
	const ratingBarRef = useRef<HTMLDivElement>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const isMountedRef = useRef(true);
	const hasRedirectedRef = useRef(false);

	// Helper function to redirect to dashboard (prevents infinite loops)
	const redirectToDashboard = useCallback(() => {
		if (hasRedirectedRef.current) {
			console.warn('[SessionController] Already redirected, preventing loop');
			return;
		}
		hasRedirectedRef.current = true;
		useSessionStore.getState().resetSession();

		// Track analytics
		trackEvent(AnalyticsEvents.Study.SessionReset, {
			reason: 'empty_queue',
			deck_id: deckId || null,
			course_id: courseId || null,
		});

		try {
			router.push('/study');
		} catch (error) {
			console.error('[SessionController] Navigation failed:', error);
			// Fallback: reload page
			window.location.href = '/study';
		}
	}, [router, deckId, courseId]);

	// Zen Mode
	const { headerVisible, forceShow, resetTimer } = useZenMode(10, scrollRef, 3000);

	// Reaction Time Tracking
	const {
		startTimer,
		stopTimer,
		resetTimer: resetReactionTimer,
		duration: reactionDuration,
	} = useReactionTime();

	// Navbar Control: Hide navbar during active session, show on summary
	useEffect(() => {
		// Show navbar on summary phase, hide during active session
		if (studyPhase === 'summary') {
			setNavBarVisible(true);
		} else {
			setNavBarVisible(false);
		}

		// Restore navbar when component unmounts
		return () => {
			setNavBarVisible(true);
		};
	}, [studyPhase, setNavBarVisible]);

	// Tutorial -  TODO: later
	// const tutorialSteps = useStudyTutorialSteps({
	// 	showAnswer,
	// 	cardWrapperRef,
	// 	ratingBarRef,
	// 	settingsRef,
	// });

	// 1. Initial Data Fetch
	useEffect(() => {
		async function init() {
			try {
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

				// Check priming requirement (Soft Gate) - only for specific deckId
				if (deckId && !hasSkippedPriming) {
					try {
						const primingData = await getSessionDataWithPriming({ deckId });
						if (primingData.success && primingData.data) {
							const { story, requiresPriming } = primingData.data;
							if (requiresPriming && story) {
								console.log('[SessionController] Priming required');
								setPrimingStory(story);

								// Smart Modal: Show modal only if user hasn't seen it before
								const hasSeenModal = hasSeenPrimingModal();
								if (!hasSeenModal) {
									console.log('[SessionController] Showing priming modal (first time)');
									setShowPrimingModal(true);
									setStudyPhase('priming-modal');
								} else {
									console.log('[SessionController] User has seen modal, showing story directly');
									setStudyPhase('priming');
								}

								setIsLoading(false);
								return; // Don't fetch cards yet
							}
						}
					} catch (error) {
						console.error('[SessionController] Failed to check priming:', error);
						// Continue to normal flow on error (graceful degradation)
					}
				}

				// Fetch Cards if queue is empty
				if (queue.length === 0) {
					console.log(
						'[SessionController] Fetching cards for deckId:',
						deckId,
						'courseId:',
						courseId,
					);
					const response = await fetchSessionAction({ deckId, courseId });
					console.log('[SessionController] Fetch response:', {
						success: response.success,
						dataLength: response.data?.length || 0,
						error: response.error,
					});

					if (response.success && response.data) {
						if (response.data.length > 0) {
							console.log(
								'[SessionController] Starting session with',
								response.data.length,
								'cards',
							);
							startSession(response.data);
							setSessionStartTime(Date.now());

							// Immediately check phase transition after starting session
							// This ensures phase transitions even if useEffect doesn't trigger
							// BUT: Only if user hasn't skipped briefing before
							if (!hasSkippedBriefing) {
								const hasNew = response.data.some((c) => c.srsStage === 0);
								if (hasNew) {
									console.log('[SessionController] Direct transition to briefing');
									setStudyPhase('briefing');
								} else {
									console.log('[SessionController] Direct transition to quiz');
									setStudyPhase('quiz');
								}
							} else {
								// User has skipped before, go directly to quiz
								console.log('[SessionController] User skipped briefing, going to quiz');
								setStudyPhase('quiz');
							}
						} else {
							// No cards available - redirect to dashboard
							console.warn('[SessionController] No cards found for deckId:', deckId);
							trackEvent('study_empty_state_shown', {
								deck_id: deckId || null,
								course_id: courseId || null,
								total_due_count: 0,
							});
							redirectToDashboard();
							return;
						}
					} else {
						// Error fetching cards - redirect to dashboard
						console.error('[SessionController] Failed to fetch cards:', response.error);
						redirectToDashboard();
						return;
					}
				} else if (queue.length > 0 && !hasTrackedSessionStart) {
					// Session already started (e.g., from resume)
					console.log('[SessionController] Resuming session with', queue.length, 'cards');
					setSessionStartTime(Date.now());
					// Ensure phase transitions if we have cards
					if (studyPhase === 'loading') {
						const hasNew = queue.some((c) => c.srsStage === 0);
						if (hasNew && !hasSkippedBriefing) {
							setStudyPhase('briefing');
						} else {
							setStudyPhase('quiz');
						}
					}
				}
			} catch (error) {
				console.error('Failed to init session:', error);
				// On error, redirect to dashboard
				redirectToDashboard();
			} finally {
				setIsLoading(false);
			}
		}

		init();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		deckId,
		courseId,
		startSession,
		queue.length,
		hasTrackedSessionStart,
		mergeTutorials,
		hasSkippedBriefing,
		hasSkippedPriming,
		redirectToDashboard,
		// Note: queue and studyPhase are intentionally omitted to prevent unnecessary re-runs
		// We use queue.length and check studyPhase conditionally
	]);

	// Track session start when queue is populated
	useEffect(() => {
		if (queue.length > 0 && !hasTrackedSessionStart && !isLoading) {
			const entryType = deckId ? 'explicit_deck' : courseId ? 'explicit_course' : 'auto_start';

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
	]);

	// 2. Phase Transition Logic
	useEffect(() => {
		console.log('[SessionController] Phase transition effect:', {
			isLoading,
			studyPhase,
			queueLength: queue.length,
			hasSkippedBriefing,
		});

		// Don't transition if user has explicitly skipped briefing or already in quiz
		if (hasSkippedBriefing || studyPhase === 'quiz') {
			return;
		}

		if (!isLoading && studyPhase === 'loading') {
			console.log('[SessionController] Phase transition check:', {
				queueLength: queue.length,
				currentCard: !!useSessionStore.getState().currentCard,
			});

			if (queue.length === 0) {
				console.warn('[SessionController] Queue is empty, redirecting to dashboard');
				redirectToDashboard();
				return;
			}

			// Ensure currentCard is set before transitioning
			const { currentCard: storeCurrentCard } = useSessionStore.getState();
			if (!storeCurrentCard && queue.length > 0) {
				console.log('[SessionController] Setting currentCard from queue[0]');
				useSessionStore.setState({ currentCard: queue[0], currentIndex: 0 });
			}

			// Check for Briefing Candidates
			const hasNew = queue.some((c) => c.srsStage === 0);
			// const hasLeech = queue.some((c) => (c.lapses ?? 0) > 0 || c.difficulty > 6);
			const hasLeech = false; // TODO: Add lapses to SmartCard type

			if (hasNew || hasLeech) {
				console.log('[SessionController] Transitioning to briefing (hasNew:', hasNew, ')');
				setStudyPhase('briefing');
			} else {
				console.log('[SessionController] Transitioning to quiz');
				setStudyPhase('quiz');
			}
		}
	}, [isLoading, queue, studyPhase, hasSkippedBriefing, redirectToDashboard]);

	// Ensure currentCard is set when entering quiz phase from briefing
	useEffect(() => {
		if (studyPhase === 'quiz' && queue.length > 0 && !currentCard) {
			// Force set currentCard from queue
			useSessionStore.setState({ currentCard: queue[0], currentIndex: 0 });
		}
	}, [studyPhase, queue, currentCard]);

	// Detect session completion and transition to summary
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
			console.log('[SessionController] Session complete detected, transitioning to summary', {
				isSessionActive,
				currentCard: !!currentCard,
				queueLength: queue.length,
				currentIndex,
			});

			// End session in store (ensures stats are finalized)
			useSessionStore.getState().endSession();

			// Transition to summary phase
			setStudyPhase('summary');
		}
	}, [studyPhase, isSessionActive, currentCard, queue.length, currentIndex]);

	// Track first card shown
	useEffect(() => {
		if (studyPhase === 'quiz' && currentCard && !firstCardShown && sessionStartTime) {
			const timeToFirstCard = Date.now() - sessionStartTime;
			const entryType = deckId ? 'explicit_deck' : courseId ? 'explicit_course' : 'auto_start';

			trackEvent(AnalyticsEvents.Study.FirstCardShown, {
				time_to_first_card_ms: timeToFirstCard,
				entry_type: entryType,
			});

			setFirstCardShown(true);
		}
	}, [studyPhase, currentCard, firstCardShown, sessionStartTime, deckId, courseId]);

	// Track session completion
	useEffect(() => {
		if (studyPhase === 'summary' && hasTrackedSessionStart && sessionStartTime) {
			// Use a small delay to ensure sessionStats are updated
			setTimeout(() => {
				const { sessionStats } = useSessionStore.getState();
				const totalCards =
					sessionStats.reviews[1] +
					sessionStats.reviews[2] +
					sessionStats.reviews[3] +
					sessionStats.reviews[4];
				const sessionDuration = (sessionStats.endTime || Date.now()) - sessionStartTime;
				const averageRating =
					totalCards > 0
						? (sessionStats.reviews[1] * 1 +
								sessionStats.reviews[2] * 2 +
								sessionStats.reviews[3] * 3 +
								sessionStats.reviews[4] * 4) /
							totalCards
						: 0;

				const entryType = deckId ? 'explicit_deck' : courseId ? 'explicit_course' : 'auto_start';

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
	]);

	// Toast notification for rating (only show for meaningful achievements)
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

	// Get exit color based on rating
	const { token } = theme.useToken();
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

	// Compute card to show - use currentCard or fallback to queue[0]
	const cardToShow = studyPhase === 'quiz' ? currentCard || queue[0] : null;

	// Fetch related words for current card (non-blocking)
	const { relatedWords, loading: relatedWordsLoading } = useRelatedWords(cardToShow?.vocabId);

	// Audio Integration: Adapt SmartCard to format expected by useFlashCardAudio
	// The hook expects card.vocab structure (we only have vocabulary cards, no separate kanji cards)
	const adaptedCardForAudio = useMemo(() => {
		if (!cardToShow) return null;

		// SmartCard structure: card.front.hero, card.back.details
		// Type guard: Only BASIC variant has hero in front
		const front = cardToShow.front;
		const isBasicVariant = cardToShow.variant === 'BASIC' && 'hero' in front;
		// Access kana directly from SmartCard structure
		const kana = (cardToShow.back?.details as { kana?: string })?.kana || '';
		const hero = isBasicVariant ? front.hero : '';

		return {
			vocab: {
				wordSurface: hero,
				wordReading: kana,
				audioUrl: isBasicVariant && 'audio' in front ? front.audio : undefined,
				// kanji field is same as wordSurface since all cards are vocabulary
				// (vocabulary words contain kanji, but we don't have separate kanji-only cards)
				kanji: hero,
				reading: kana,
				exampleSentence: null, // Can be extracted from examples if needed
			},
		};
	}, [cardToShow]);

	// Audio Hook Integration
	const audioHook = useFlashCardAudio({
		card: adaptedCardForAudio,
		showAnswer,
		autoPlayAudio: autoPlayAudio || 'off',
	});

	// Start/stop reaction timer based on showAnswer state
	useEffect(() => {
		if (showAnswer && currentCard) {
			startTimer();
		} else {
			resetReactionTimer();
		}
	}, [showAnswer, currentCard, startTimer, resetReactionTimer]);

	// Close Related Words Sheet on card navigation (AC5: State Management)
	// Track previous vocab ID to detect card changes
	const prevVocabIdRef = useRef<string | null>(null);
	useEffect(() => {
		const currentVocabId = currentCard?.vocabId;
		if (
			currentVocabId &&
			prevVocabIdRef.current !== null &&
			prevVocabIdRef.current !== currentVocabId
		) {
			// Card changed - close sheet if open
			if (isRelatedWordDrawerOpen) {
				setIsRelatedWordDrawerOpen(false);
				setSelectedRelatedWord(null);
			}
		}
		prevVocabIdRef.current = currentVocabId || null;
	}, [currentCard?.vocabId, isRelatedWordDrawerOpen]);

	// Ref-based guard to prevent rapid double-clicks (more reliable than state)
	const isSubmittingRef = useRef(false);

	// Shared submission logic with animation (declared first to be used by handlers)
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
					console.error('[SessionController] Rating submission failed:', error);

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
		[submitRating, showRatingToast, resetTimer, resetReactionTimer, getExitColor, t],
	);

	// 3. Shortcuts
	// Handle action-based rating (from UI buttons)
	const handleRate = useCallback(
		async (action: 'forgot' | 'remember' | 'easy', duration?: number) => {
			// Guard: Prevent multiple submissions (Race Condition Fix)
			if (isSubmittingRating || isSubmittingRef.current) {
				console.warn('[SessionController] Rating already in progress, ignoring duplicate click');
				return;
			}

			isSubmittingRef.current = true;
			setIsSubmittingRating(true);

			// Get duration from timer if not provided
			const timeToAnswer = duration ?? stopTimer();

			// Edge case: Timer not started (race condition) - default to GOOD for "remember"
			if (timeToAnswer === 0 && action === 'remember') {
				console.warn('[SessionController] Timer not started, defaulting to GOOD');
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
				console.error('[SessionController] Invalid rating value:', rating);
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

	const handleSpaceKey = useCallback(() => {
		if (!showAnswer) {
			setShowAnswer(true);
			resetTimer();
		} else {
			// Space key defaults to "remember" action (time-based mapping)
			handleRate('remember');
		}
	}, [showAnswer, handleRate, resetTimer]);

	useStudyShortcuts({
		onSpace: handleSpaceKey,
		onRate: handleNumericRate, // Use numeric handler for keyboard shortcuts
		showAnswer,
		disabled: isReportModalOpen || isCommentDrawerOpen || settingsVisible || studyPhase !== 'quiz',
		onAudio: audioHook.toggleAudio,
		onExampleAudio: audioHook.playExampleAudio,
		onToggleHeader: () => (headerVisible ? {} : forceShow()),
		onEscape: () => {
			setSettingsVisible(false);
			setIsReportModalOpen(false);
			setIsCommentDrawerOpen(false);
		},
	});

	// Calculated Progress
	// Session progress: how many cards have been reviewed in this session
	// During briefing: Shows 0% (session not started yet, but queue is loaded)
	// During quiz: Shows actual progress (e.g., "3/10 cards" = 30%)
	const sessionProgressPercent =
		queue.length > 0 ? Math.min(100, Math.round(((currentIndex + 1) / queue.length) * 100)) : 0;

	// Daily progress (for loading/priming/other phases where session queue isn't ready)
	// Shows overall daily goal progress (e.g., "50/200 reviews today" = 25%)
	const dailyProgressPercent = Math.min(
		100,
		(dailyStats.reviewsToday / (dailyStats.limitReviews || 1)) * 100,
	);

	// UX Improvement: Show session progress during briefing and quiz phases
	// This gives users context about what they're about to study (briefing) or current progress (quiz)
	const shouldShowSessionProgress = studyPhase === 'quiz' || studyPhase === 'briefing';
	const displayProgress = shouldShowSessionProgress ? sessionProgressPercent : dailyProgressPercent;

	if (studyPhase === 'summary') {
		return <SessionSummary />;
	}

	// Priming modal phase - show value proposition modal (first time only)
	if (studyPhase === 'priming-modal' && primingStory) {
		return (
			<>
				<PrimingModal
					open={showPrimingModal}
					onRead={() => {
						setShowPrimingModal(false);
						setStudyPhase('priming');
					}}
					onSkip={() => {
						// Track skip from modal
						trackEvent('priming_skipped', {
							unit_id: deckId,
							source: 'modal',
						});
						setHasSkippedPriming(true);
						setShowPrimingModal(false);
						setIsLoading(true);
						setStudyPhase('loading');
					}}
					unitId={deckId}
				/>
				{/* Render empty container while modal is open */}
				<div style={{ display: 'none' }} />
			</>
		);
	}

	// Priming phase - show story reader
	if (studyPhase === 'priming' && primingStory) {
		return (
			<SessionContainer
				progress={0}
				headerVisible={true}
				actions={
					<>
						<Button
							type="text"
							shape="circle"
							icon={<SettingOutlined />}
							onClick={() => setSettingsVisible(true)}
						/>
					</>
				}
			>
				<StoryReader
					story={primingStory}
					onComplete={() => {
						// After story is read, proceed to fetch cards
						setHasSkippedPriming(false);
						setIsLoading(true);
						// Trigger card fetch by resetting queue
						// This will cause the init effect to run again
						setStudyPhase('loading');
					}}
					onSkip={() => {
						// Soft Gate: Allow skipping
						trackEvent('priming_skipped', {
							unit_id: deckId,
						});
						setHasSkippedPriming(true);
						setIsLoading(true);
						setStudyPhase('loading');
					}}
				/>
			</SessionContainer>
		);
	}

	return (
		<SessionContainer
			progress={displayProgress}
			headerVisible={studyPhase === 'briefing' ? true : headerVisible} // Always show header during briefing for UX
			showProgressBar={studyPhase === 'quiz' || studyPhase === 'briefing'} // Always show progress bar during quiz/briefing
			actions={
				<>
					<Button
						type="text"
						shape="circle"
						icon={<CommentOutlined />}
						onClick={() => setIsCommentDrawerOpen(true)}
					/>
					<Button
						ref={settingsRef}
						type="text"
						shape="circle"
						icon={<SettingOutlined />}
						onClick={() => setSettingsVisible(true)}
					/>
				</>
			}
		>
			{/* Only show tutorial during quiz phase when card is visible */}
			{/* {studyPhase === 'quiz' && (
				<AppTutorial tutorialId="study_page_v1" steps={tutorialSteps} showAnswer={showAnswer} />
			)} */}

			{/* Drawers */}
			<CommentDrawer
				open={isCommentDrawerOpen}
				onClose={() => setIsCommentDrawerOpen(false)}
				entityId={currentCard?.vocabId || currentCard?.id || ''}
				entityType="vocab"
				entityTitle={currentCard?.back?.details?.wordSurface || 'Card'}
			/>

			{/* Related Word Details Drawer */}
			<RelatedWordDetailsDrawer
				open={isRelatedWordDrawerOpen}
				onClose={() => {
					setIsRelatedWordDrawerOpen(false);
					setSelectedRelatedWord(null);
				}}
				relatedWord={selectedRelatedWord}
			/>

			{/* Responsive Related Words Sheet (Mobile) - replaces separate RelatedWordDetailsDrawer usage for the list */}
			<RelatedWordsSheet
				open={isRelatedWordDrawerOpen && !selectedRelatedWord && !isDesktop} // Only show sheet on mobile when looking at list
				onClose={() => setIsRelatedWordDrawerOpen(false)}
				relatedWords={relatedWords}
				onSelectWord={(word) => {
					// When selecting from sheet, open details
					setSelectedRelatedWord(word);
					// Keep sheet open or close it? UX decision: Close sheet, open details drawer
					// But details drawer replaces sheet usually.
					// Let's rely on RelatedWordDetailsDrawer to handle the details view
				}}
			/>

			<Drawer
				open={settingsVisible}
				onClose={() => setSettingsVisible(false)}
				title={t('settings')}
				styles={{ wrapper: { width: 600 } }}
			>
				<StudySettings userSettings={userSettings} onSettingsChange={() => {}} />
			</Drawer>

			<ReportModal
				open={isReportModalOpen}
				onClose={() => setIsReportModalOpen(false)}
				vocabId={currentCard?.vocabId}
				currentText={currentCard?.back?.details?.wordSurface}
			/>

			{/* Content Zones */}
			{studyPhase === 'loading' && (
				<Flex
					vertical
					align="center"
					justify="center"
					gap="large"
					style={{
						minHeight: '60vh',
						padding: 24,
						textAlign: 'center',
					}}
				>
					<Spin size="large" />
					<Flex vertical gap="small" align="center">
						<Typography.Text
							type="secondary"
							style={{
								fontSize: 16,
								fontWeight: 500,
							}}
						>
							{t('preparingSession')}
						</Typography.Text>
						<Typography.Text
							type="secondary"
							style={{
								fontSize: 13,
								fontStyle: 'italic',
								maxWidth: 400,
								opacity: 0.7,
							}}
						>
							{t('preparingSessionHint')}
						</Typography.Text>
						<Typography.Text
							type="secondary"
							style={{
								fontSize: 12,
								marginTop: 8,
								opacity: 0.6,
							}}
						>
							{t('checkingForCards')}
						</Typography.Text>
					</Flex>
				</Flex>
			)}

			{/* Ensure currentCard is set when entering quiz phase */}
			{studyPhase === 'quiz' && queue.length > 0 && !currentCard && (
				<Flex
					vertical
					align="center"
					justify="center"
					gap="middle"
					style={{
						padding: 24,
						textAlign: 'center',
					}}
				>
					<Spin size="default" />
					<Typography.Text type="secondary" style={{ fontSize: 14 }}>
						{t('preparingCard')}
					</Typography.Text>
				</Flex>
			)}

			{studyPhase === 'briefing' && (
				<SessionBriefing
					queue={queue}
					stats={dailyStats}
					onStart={() => {
						// Transition to quiz phase
						if (queue.length > 0 && queue[0]) {
							// CRITICAL: Always set currentCard BEFORE transitioning
							useSessionStore.setState({
								currentCard: queue[0],
								currentIndex: 0,
								isSessionActive: true,
							});
							// Transition immediately - state update is synchronous
							setStudyPhase('quiz');
							setShowAnswer(false);
							resetTimer();
						}
					}}
					onSkip={() => {
						// Skip briefing and go directly to quiz
						if (queue.length > 0 && queue[0]) {
							// Mark that user has skipped briefing
							setHasSkippedBriefing(true);
							// CRITICAL: Always set currentCard BEFORE transitioning
							useSessionStore.setState({
								currentCard: queue[0],
								currentIndex: 0,
								isSessionActive: true,
							});
							// Transition immediately - state update is synchronous
							console.log('[SessionController] User clicked skip, transitioning to quiz');
							setStudyPhase('quiz');
							setShowAnswer(false);
							resetTimer();
						}
					}}
				/>
			)}

			{studyPhase === 'quiz' && queue.length > 0 && cardToShow && (
				<>
					{/* Invisible Top Tap Zone */}
					{!headerVisible && (
						<div
							onClick={(e) => {
								e.stopPropagation();
								forceShow();
							}}
							style={{
								position: 'fixed',
								top: 0,
								left: 0,
								right: 0,
								height: 80,
								zIndex: 999,
								cursor: 'pointer',
							}}
						/>
					)}

					<Flex
						ref={scrollRef}
						vertical={!isDesktop}
						align={isDesktop ? 'start' : 'center'}
						justify="center"
						gap={isDesktop ? 32 : 0}
						style={{
							flex: 1,
							paddingBottom: 160,
							width: '100%',
							maxWidth: 1200, // Max width for desktop comfort
						}}
					>
						{/* Card Column */}
						<Flex
							vertical
							align="center"
							style={{
								flex: 1,
								width: '100%',
								maxWidth: isDesktop ? 800 : '100%',
							}}
						>
							<div
								ref={cardWrapperRef}
								onClick={(e) => e.stopPropagation()}
								onTouchStart={(e) => e.stopPropagation()}
								style={{
									width: '100%',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									position: 'relative',
									minHeight: isDesktop ? 'auto' : '65vh',
									zIndex: 10, // Ensure card is above RatingBar during reveal
								}}
							>
								<CardShell
									key={cardToShow.id}
									card={cardToShow}
									isActive={true}
									isNext={false}
									showAnswer={showAnswer}
									onReveal={() => setShowAnswer(!showAnswer)} // Toggle: allows flipping back to front
									showFurigana={showFurigana}
									showRomaji={showRomaji}
									isExiting={isCardExiting}
									exitColor={exitColor}
									isPlaying={audioHook.isPlaying}
									onPlayAudio={audioHook.toggleAudio}
									cardBackSettings={cardBackSettings}
								/>
							</div>

							{/* Mobile Action Bar */}
							{!isDesktop && showAnswer && (
								<SubtleActionBar
									visibility={{
										relatedWords: relatedWords.length > 0,
										confusions:
											!!cardBackSettings.showConfusions &&
											!!(cardToShow.back?.details as any)?.confusions?.length,
										etymology:
											!!cardBackSettings.showEtymology &&
											!!(cardToShow.back?.details as any)?.etymology,
										moreExamples:
											!!cardBackSettings.showMoreExamples &&
											((cardToShow.back?.details as any)?.examples?.length || 0) > 1,
									}}
									onRelatedWords={() => setIsRelatedWordDrawerOpen(true)}
									onConfusions={() => {}} // Placeholder: Could scroll to section
									onEtymology={() => {}} // Placeholder
									onMoreExamples={() => {}} // Placeholder
								/>
							)}
						</Flex>

						{/* Desktop Sidebar (Slide-in) */}
						{isDesktop && showAnswer && (
							<StudySidebar
								visible={showAnswer}
								relatedWords={relatedWords}
								vocabId={cardToShow.vocabId}
								onSelectRelatedWord={(word) => {
									setSelectedRelatedWord(word);
									setIsRelatedWordDrawerOpen(true);
								}}
							/>
						)}
					</Flex>

					<div
						ref={ratingBarRef}
						style={{
							position: 'fixed',
							bottom: 0,
							left: 0,
							right: 0,
							padding: '16px 24px 40px',
							display: 'flex',
							justifyContent: 'center',
							zIndex: 50,
							pointerEvents: 'none',
						}}
					>
						<div
							style={{
								// Only enable pointer events when fully visible and stable
								// Prevents intercepting clicks during animation
								pointerEvents: showAnswer && !isSubmittingRating ? 'auto' : 'none',
								width: '100%',
								maxWidth: 500,
								transform: showAnswer ? 'translateY(0)' : 'translateY(100px)',
								opacity: showAnswer ? 1 : 0,
								transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
							}}
						>
							{showAnswer && (
								<RatingBar
									onRate={handleRate}
									disabled={isSubmittingRating}
									selectedRating={isSubmittingRating ? (currentCard ? 3 : null) : null}
									reactionTime={reactionDuration}
								/>
							)}
						</div>
					</div>
				</>
			)}
		</SessionContainer>
	);
}
