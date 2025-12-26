'use client';

// Components
import AppTutorial from '@/components/Shared/AppTutorial';
import CommentDrawer from '@/components/comments/CommentDrawer';
import { useFlashCardAudio } from '@/hooks/study/useFlashCardAudio';
import { useStudyShortcuts } from '@/hooks/study/useStudyShortcuts';
import { useStudyTutorialSteps } from '@/hooks/study/useStudyTutorialSteps';
import { useZenMode } from '@/hooks/study/useZenMode';
// Hooks
import { useTutorialStore } from '@/hooks/useTutorialStore';
import { trackEvent } from '@/lib/analytics';
import { CardShell } from '@/modules/flashcard/components/CardShell';
import { fetchSessionAction } from '@/modules/flashcard/flashcard.actions';
import { getSessionDataWithPriming } from '@/modules/priming/actions';
import { PrimingModal, hasSeenPrimingModal } from '@/modules/priming/components/PrimingModal';
import { StoryReader } from '@/modules/priming/components/StoryReader';
import { StoryWithContent } from '@/modules/priming/types';
import ReportModal from '@/modules/report/components/ReportModal';
import { useSessionStore } from '@/modules/study/store/useSessionStore';
import { useStudyPreferences } from '@/modules/study/store/useStudyPreferences';
import { getDailyProgress } from '@/modules/study/study.actions';
import { getCompletedTutorials, getUserSettings } from '@/modules/user/user.actions';
import { CommentOutlined, SettingOutlined } from '@ant-design/icons';
import type { User } from '@prisma/client';
import { Button, Drawer, Grid, message, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Local Components
import RatingBar from './RatingBar';
import SessionBriefing from './SessionBriefing';
import { SessionContainer } from './SessionContainer';
import SessionSummary from './SessionSummary';
import StudySettings from './StudySettings';

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
	const screens = useBreakpoint();

	// Store
	const { startSession, queue, currentIndex, submitRating, isSessionActive, currentCard } =
		useSessionStore();
	const { mergeTutorials } = useTutorialStore();

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

	// Settings STORE
	const { showFurigana, showRomaji, autoPlayAudio } = useStudyPreferences();
	const [userSettings, setUserSettings] = useState<Partial<User> | null>(null);
	const [spaceKeyRating, setSpaceKeyRating] = useState(3);
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

	// Zen Mode
	const { headerVisible, forceShow, resetTimer } = useZenMode(10, scrollRef, 3000);

	// Tutorial
	const tutorialSteps = useStudyTutorialSteps({
		showAnswer,
		cardWrapperRef,
		ratingBarRef,
		settingsRef,
	});

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
							// No cards available - show empty state
							console.warn('[SessionController] No cards found for deckId:', deckId);
							setStudyPhase('summary');
						}
					} else {
						// Error fetching cards
						console.error('[SessionController] Failed to fetch cards:', response.error);
						setStudyPhase('summary');
					}
				} else if (queue.length > 0 && !hasTrackedSessionStart) {
					// Session already started (e.g., from resume)
					console.log('[SessionController] Resuming session with', queue.length, 'cards');
					setSessionStartTime(Date.now());
				}
			} catch (error) {
				console.error('Failed to init session:', error);
			} finally {
				setIsLoading(false);
			}
		}

		init();
	}, [
		deckId,
		courseId,
		startSession,
		queue.length,
		hasTrackedSessionStart,
		mergeTutorials,
		hasSkippedBriefing,
		hasSkippedPriming,
	]);

	// Track session start when queue is populated
	useEffect(() => {
		if (queue.length > 0 && !hasTrackedSessionStart && !isLoading) {
			const entryType = deckId ? 'explicit_deck' : courseId ? 'explicit_course' : 'auto_start';

			// Track first session start
			if (isFirstSession) {
				trackEvent('user_first_study_session_started', {
					entry_method: entryType,
					deck_id: deckId || null,
					queue_size: queue.length,
					due_count: dueCount,
				});
			}

			// Track regular session start
			trackEvent('study_session_started', {
				entry_type: entryType,
				deck_id: deckId || null,
				course_id: courseId || null,
				mode: mode || null,
				queue_size: queue.length,
				due_count: dueCount,
			});

			setHasTrackedSessionStart(true);
		}
	}, [
		queue.length,
		hasTrackedSessionStart,
		isLoading,
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
				console.warn('[SessionController] Queue is empty, going to summary');
				setStudyPhase('summary');
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
	}, [isLoading, queue, studyPhase, hasSkippedBriefing]);

	// Ensure currentCard is set when entering quiz phase from briefing
	useEffect(() => {
		if (studyPhase === 'quiz' && queue.length > 0 && !currentCard) {
			// Force set currentCard from queue
			useSessionStore.setState({ currentCard: queue[0], currentIndex: 0 });
		}
	}, [studyPhase, queue, currentCard]);

	// Track first card shown
	useEffect(() => {
		if (studyPhase === 'quiz' && currentCard && !firstCardShown && sessionStartTime) {
			const timeToFirstCard = Date.now() - sessionStartTime;
			const entryType = deckId ? 'explicit_deck' : courseId ? 'explicit_course' : 'auto_start';

			trackEvent('study_session_first_card_shown', {
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
					trackEvent('user_first_study_session_completed', {
						cards_reviewed: totalCards,
						session_duration_ms: sessionDuration,
						completion_rate: 1.0, // Assuming completed if we reached summary
					});
				}

				// Track regular session completion
				trackEvent('study_session_completed', {
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

	// Toast notification for rating
	const showRatingToast = useCallback(
		(rating: number) => {
			const messages = {
				1: t('ratingToast.again'), // "Review scheduled"
				3: t('ratingToast.good'), // "Mastery recorded"
				4: t('ratingToast.easy'), // "Fluency achieved"
			};
			const toastMessage = messages[rating as keyof typeof messages];
			if (toastMessage) {
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

	// 3. Shortcuts
	const handleRate = useCallback(
		async (rating: number) => {
			// Guard: Prevent multiple submissions (Race Condition Fix)
			if (isSubmittingRating) {
				console.warn('[SessionController] Rating already in progress, ignoring duplicate click');
				return;
			}

			// Validate rating input (Defensive Coding)
			if (![1, 2, 3, 4].includes(rating)) {
				console.error('[SessionController] Invalid rating value:', rating);
				return;
			}

			setIsSubmittingRating(true);

			// Clear any existing timeout (Memory Leak Fix)
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}

			// Set exit animation
			const color = getExitColor(rating);
			setExitColor(color);
			setIsCardExiting(true);

			// Wait for animation to complete (with proper cleanup)
			timeoutRef.current = setTimeout(async () => {
				if (!isMountedRef.current) {
					setIsSubmittingRating(false);
					return;
				}

				try {
					await submitRating(rating as 1 | 2 | 3 | 4);

					if (!isMountedRef.current) {
						setIsSubmittingRating(false);
						return;
					}

					// Success path: Reset exit state BEFORE other updates (State Sync Fix)
					setIsCardExiting(false);
					setExitColor(undefined);
					showRatingToast(rating);
					setShowAnswer(false);
					resetTimer();
				} catch (error) {
					// Error Handling Fix
					console.error('[SessionController] Rating submission failed:', error);

					if (!isMountedRef.current) {
						setIsSubmittingRating(false);
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
					}
					timeoutRef.current = null;
				}
			}, 400); // Match animation duration
		},
		[isSubmittingRating, submitRating, showRatingToast, resetTimer, getExitColor, t],
	);

	const handleSpaceKey = useCallback(() => {
		if (!showAnswer) {
			setShowAnswer(true);
			resetTimer();
		} else {
			handleRate(spaceKeyRating);
		}
	}, [showAnswer, handleRate, spaceKeyRating, resetTimer]);

	useStudyShortcuts({
		onSpace: handleSpaceKey,
		onRate: handleRate,
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
	const progressPercent = Math.min(
		100,
		(dailyStats.reviewsToday / (dailyStats.limitReviews || 1)) * 100,
	);

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
						trackEvent('PRIMING_SKIPPED', {
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
						trackEvent('PRIMING_SKIPPED', {
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
			progress={progressPercent}
			headerVisible={studyPhase === 'briefing' ? true : headerVisible} // Always show header during briefing for UX
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
			{studyPhase === 'quiz' && (
				<AppTutorial tutorialId="study_page_v1" steps={tutorialSteps} showAnswer={showAnswer} />
			)}

			{/* Drawers */}
			<CommentDrawer
				open={isCommentDrawerOpen}
				onClose={() => setIsCommentDrawerOpen(false)}
				entityId={currentCard?.vocabId || currentCard?.id || ''}
				entityType="vocab"
				entityTitle={currentCard?.back?.details?.wordSurface || 'Card'}
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
			{studyPhase === 'loading' && <div>Loading...</div>}

			{/* Ensure currentCard is set when entering quiz phase */}
			{studyPhase === 'quiz' && queue.length > 0 && !currentCard && (
				<div style={{ padding: 24, textAlign: 'center' }}>
					<p>Preparing card...</p>
				</div>
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

					<div
						ref={scrollRef}
						onClick={() => !showAnswer && setShowAnswer(true)}
						style={{
							flex: 1,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							paddingBottom: 160,
							width: '100%',
							cursor: !showAnswer ? 'pointer' : 'default',
						}}
					>
						<div
							ref={cardWrapperRef}
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								position: 'relative',
								minHeight: '65vh',
							}}
						>
							<CardShell
								key={cardToShow.id}
								card={cardToShow}
								isActive={true}
								isNext={false}
								showAnswer={showAnswer}
								onReveal={() => setShowAnswer(true)}
								showFurigana={showFurigana}
								showRomaji={showRomaji}
								isExiting={isCardExiting}
								exitColor={exitColor}
								isPlaying={audioHook.isPlaying}
								onPlayAudio={audioHook.toggleAudio}
							/>
						</div>
					</div>

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
								pointerEvents: 'auto',
								width: '100%',
								maxWidth: 500,
								transform: showAnswer ? 'translateY(0)' : 'translateY(100px)',
								opacity: showAnswer ? 1 : 0,
								transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
							}}
						>
							{showAnswer && <RatingBar onRate={handleRate} disabled={false} />}
						</div>
					</div>
				</>
			)}
		</SessionContainer>
	);
}
