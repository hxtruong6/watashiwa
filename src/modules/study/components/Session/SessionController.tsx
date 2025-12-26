'use client';

// Components
import AppTutorial from '@/components/Shared/AppTutorial';
import CommentDrawer from '@/components/comments/CommentDrawer';
import { useStudyShortcuts } from '@/hooks/study/useStudyShortcuts';
import { useStudyTutorialSteps } from '@/hooks/study/useStudyTutorialSteps';
import { useZenMode } from '@/hooks/study/useZenMode';
// Hooks
import { useTutorialStore } from '@/hooks/useTutorialStore';
import { trackEvent } from '@/lib/analytics';
import FlashCard, { FlashCardHandle } from '@/modules/flashcard/components/FlashCard';
import { fetchSessionAction } from '@/modules/flashcard/flashcard.actions';
import ReportModal from '@/modules/report/components/ReportModal';
import { useSessionStore } from '@/modules/study/store/useSessionStore';
import { useStudyPreferences } from '@/modules/study/store/useStudyPreferences';
import { getDailyProgress } from '@/modules/study/study.actions';
import { getCompletedTutorials, getUserSettings } from '@/modules/user/user.actions';
import { CommentOutlined, SettingOutlined } from '@ant-design/icons';
import type { User } from '@prisma/client';
import { Button, Drawer, Grid } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useRef, useState } from 'react';

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
	const [studyPhase, setStudyPhase] = useState<'loading' | 'briefing' | 'quiz' | 'summary'>(
		'loading',
	);
	const [hasSkippedBriefing, setHasSkippedBriefing] = useState(false);
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

	// Refs
	const flashCardRef = useRef<FlashCardHandle>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const settingsRef = useRef<HTMLButtonElement>(null);
	const cardWrapperRef = useRef<HTMLDivElement>(null);
	const ratingBarRef = useRef<HTMLDivElement>(null);

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
	}, [isLoading, queue.length, studyPhase, hasSkippedBriefing]);

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

	// 3. Shortcuts
	const handleRate = useCallback(
		async (rating: number) => {
			await submitRating(rating as 1 | 2 | 3 | 4);
			setShowAnswer(false);
			resetTimer();
		},
		[submitRating, resetTimer],
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
		onAudio: () => flashCardRef.current?.playAudio(),
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

	// Compute card to show - use currentCard or fallback to queue[0]
	const cardToShow = studyPhase === 'quiz' ? currentCard || queue[0] : null;

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
							style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
						>
							<FlashCard
								ref={flashCardRef}
								key={cardToShow.id}
								card={cardToShow}
								showAnswer={showAnswer}
								showFurigana={showFurigana}
								showRomaji={showRomaji}
								autoPlayAudio={autoPlayAudio}
								onReveal={() => setShowAnswer(true)}
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
