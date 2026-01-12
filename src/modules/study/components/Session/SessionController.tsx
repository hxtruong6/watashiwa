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
import { PrimingModal } from '@/modules/priming/components/PrimingModal';
import { StoryReader } from '@/modules/priming/components/StoryReader';
import ReportModal from '@/modules/report/components/ReportModal';
import { RelatedWordDetailsDrawer } from '@/modules/study/components/RelatedWords/RelatedWordDetailsDrawer';
import { RelatedWordsSheet } from '@/modules/study/components/RelatedWords/RelatedWordsSheet';
import { useRatingSubmission } from '@/modules/study/hooks/useRatingSubmission';
import { useRelatedWords } from '@/modules/study/hooks/useRelatedWords';
import { useSessionAnalytics } from '@/modules/study/hooks/useSessionAnalytics';
import { useSessionInitialization } from '@/modules/study/hooks/useSessionInitialization';
import { useSessionPhase } from '@/modules/study/hooks/useSessionPhase';
import { useSessionUI } from '@/modules/study/hooks/useSessionUI';
import { useSessionStore } from '@/modules/study/store/useSessionStore';
import { useStudyPreferences } from '@/modules/study/store/useStudyPreferences';
import { CommentOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Drawer, Flex, Grid, Spin, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

	// Local State
	// Initialization state moved to useSessionInitialization hook (Task 2.7)
	// Analytics tracking state moved to useSessionAnalytics hook (Task 5.6)

	// UI State Management Hook (Task 4.4)
	const uiHook = useSessionUI({
		currentCard,
	});

	// Settings STORE
	const { showFurigana, showRomaji, autoPlayAudio, cardBackSettings } = useStudyPreferences();
	// userSettings moved to useSessionInitialization hook (Task 2.7)
	const [showAnswer, setShowAnswer] = useState(false);
	// Rating submission state moved to useRatingSubmission hook (Task 3.7)

	// Refs
	const scrollRef = useRef<HTMLDivElement>(null);
	const settingsRef = useRef<HTMLButtonElement>(null);
	const cardWrapperRef = useRef<HTMLDivElement>(null);
	const ratingBarRef = useRef<HTMLDivElement>(null);
	// timeoutRef and isMountedRef moved to useRatingSubmission hook (Task 3.7)
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

	// Initialization Hook (Parallel Implementation - Task 2.6)
	// Using hook alongside existing state for safety during migration
	// Note: We create init hook first with temporary phase values, then update via refs
	const initHook = useSessionInitialization({
		deckId,
		courseId,
		queueLength: queue.length,
		hasSkippedBriefing: false, // Will be updated via options ref when phase hook is ready
		hasSkippedPriming: false, // Will be updated via options ref when phase hook is ready
		startSession,
		mergeTutorials,
		setStudyPhase: () => {}, // Will be updated via options ref when phase hook is ready
		redirectToDashboard,
	});

	// Phase Management Hook (Parallel Implementation - Task 1.6)
	// Using hook alongside existing state for safety during migration
	// Note: Phase hook uses refs for isLoading to break circular dependency
	const phaseHook = useSessionPhase({
		queue,
		currentCard,
		currentIndex,
		isSessionActive,
		isLoading: initHook.isLoading, // Use actual isLoading from init hook
		redirectToDashboard,
	});

	// Extract phase state from hook (Task 1.7)
	const studyPhase = phaseHook.studyPhase;
	const setStudyPhase = phaseHook.setStudyPhase;
	const hasSkippedBriefing = phaseHook.hasSkippedBriefing;
	const setHasSkippedBriefing = phaseHook.setHasSkippedBriefing;
	const hasSkippedPriming = phaseHook.hasSkippedPriming;
	const setHasSkippedPriming = phaseHook.setHasSkippedPriming;

	// Extract initialization state from hook (Task 2.7)
	const isLoading = initHook.isLoading;
	const dailyStats = initHook.dailyStats;
	const userSettings = initHook.userSettings;
	const primingStory = initHook.primingStory;
	const showPrimingModal = initHook.showPrimingModal;
	const setShowPrimingModal = initHook.setShowPrimingModal;
	const sessionStartTime = initHook.sessionStartTime;

	// Update initialization hook options with phase values (Task 2.7)
	// The hook uses refs to always get latest values, so we update the options object
	// This ensures the hook's callbacks use the latest phase values
	useEffect(() => {
		// The hook's optionsRef will pick up the new values automatically
		// This effect ensures the options object is recreated when phase values change
		// The hook's useEffect watching options will update the ref
	}, [hasSkippedBriefing, hasSkippedPriming, setStudyPhase]);

	// Debug comparison removed - using hook values directly now (Task 2.7)

	// Analytics Tracking Hook (Task 5.6)
	// Declared early to be available for dependency arrays
	// Handles automatic tracking (session start, first card, completion)
	// Manual tracking (reset, priming skipped) is done inline with trackEvent
	const analyticsHook = useSessionAnalytics({
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
	});

	// Call initialization hook (Task 2.6)
	useEffect(() => {
		initHook.initializeSession();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		deckId,
		courseId,
		queue.length,
		analyticsHook.hasTrackedSessionStart,
		hasSkippedBriefing,
		hasSkippedPriming,
		// Note: initHook.initializeSession is intentionally omitted to match original dependencies
		// The hook will handle its own memoization
	]);

	// Zen Mode
	const { headerVisible, forceShow, resetTimer } = useZenMode(10, scrollRef, 3000);

	// Reaction Time Tracking
	const {
		startTimer,
		stopTimer,
		resetTimer: resetReactionTimer,
		duration: reactionDuration,
	} = useReactionTime();

	// Rating Submission Hook (Parallel Implementation - Task 3.6)
	// Using hook alongside existing handlers for safety during migration
	const ratingHook = useRatingSubmission({
		submitRating,
		stopTimer,
		resetTimer,
		resetReactionTimer,
		showAnswer,
		setShowAnswer,
	});

	// Navbar visibility is now handled by route-based logic in useNavBarVisibility hook
	// When study session has deckId/courseId in URL, navbar is automatically hidden
	// When summary phase is reached, URL changes and navbar shows automatically

	// Tutorial -  TODO: later
	// const tutorialSteps = useStudyTutorialSteps({
	// 	showAnswer,
	// 	cardWrapperRef,
	// 	ratingBarRef,
	// 	settingsRef,
	// });

	// Initialization logic moved to useSessionInitialization hook (Task 2.7)
	// The hook handles:
	// - Fetching daily stats, user settings, tutorials
	// - Checking priming requirements
	// - Fetching and starting session with cards
	// - Resuming existing sessions
	// - Error handling and redirects

	// Session start tracking moved to useSessionAnalytics hook (Task 5.6)

	// Phase transition logic moved to useSessionPhase hook (Task 1.3)
	// The hook handles:
	// - Loading → briefing/quiz transitions
	// - Ensuring currentCard is set when entering quiz
	// - Session completion detection → summary transition

	// First card tracking moved to useSessionAnalytics hook (Task 5.6)

	// Session completion tracking moved to useSessionAnalytics hook (Task 5.6)

	// Rating submission helpers moved to useRatingSubmission hook (Task 3.7)

	// Compute card to show - use currentCard or fallback to queue[0]
	const cardToShow = studyPhase === 'quiz' ? currentCard || queue[0] : null;

	// Fetch related words for current card (non-blocking)
	const { relatedWords } = useRelatedWords(cardToShow?.vocabId);

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

	// Card navigation logic moved to useSessionUI hook (Task 4.4)

	// Rating submission logic moved to useRatingSubmission hook (Task 3.7)
	// Use hook handlers and state directly

	const handleSpaceKey = useCallback(() => {
		if (!showAnswer) {
			setShowAnswer(true);
			resetTimer();
		} else {
			// Space key defaults to "remember" action (time-based mapping)
			ratingHook.handleRate('remember');
		}
	}, [showAnswer, ratingHook, resetTimer]);

	useStudyShortcuts({
		onSpace: handleSpaceKey,
		onRate: ratingHook.handleNumericRate, // Use numeric handler for keyboard shortcuts
		showAnswer,
		disabled: uiHook.hasAnyDrawerOpen || studyPhase !== 'quiz',
		onAudio: audioHook.toggleAudio,
		onExampleAudio: audioHook.playExampleAudio,
		onToggleHeader: () => (headerVisible ? {} : forceShow()),
		onEscape: uiHook.closeAllDrawers,
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
						// Re-initialize to fetch cards
						initHook.initializeSession();
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
							onClick={() => uiHook.setSettingsVisible(true)}
						/>
					</>
				}
			>
				<StoryReader
					story={primingStory}
					onComplete={() => {
						// After story is read, proceed to fetch cards
						setHasSkippedPriming(false);
						// Re-initialize to fetch cards
						initHook.initializeSession();
					}}
					onSkip={() => {
						// Soft Gate: Allow skipping
						trackEvent('priming_skipped', {
							unit_id: deckId,
							source: 'story',
						});
						setHasSkippedPriming(true);
						// Re-initialize to fetch cards
						initHook.initializeSession();
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
						onClick={() => uiHook.setIsCommentDrawerOpen(true)}
					/>
					<Button
						ref={settingsRef}
						type="text"
						shape="circle"
						icon={<SettingOutlined />}
						onClick={() => uiHook.setSettingsVisible(true)}
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
				open={uiHook.isCommentDrawerOpen}
				onClose={() => uiHook.setIsCommentDrawerOpen(false)}
				entityId={currentCard?.vocabId || currentCard?.id || ''}
				entityType="vocab"
				entityTitle={currentCard?.back?.details?.wordSurface || 'Card'}
			/>

			{/* Related Word Details Drawer */}
			<RelatedWordDetailsDrawer
				open={uiHook.isRelatedWordDrawerOpen}
				onClose={() => {
					uiHook.setIsRelatedWordDrawerOpen(false);
					uiHook.setSelectedRelatedWord(null);
				}}
				relatedWord={uiHook.selectedRelatedWord}
			/>

			{/* Responsive Related Words Sheet (Mobile) - replaces separate RelatedWordDetailsDrawer usage for the list */}
			<RelatedWordsSheet
				open={uiHook.isRelatedWordDrawerOpen && !uiHook.selectedRelatedWord && !isDesktop} // Only show sheet on mobile when looking at list
				onClose={() => uiHook.setIsRelatedWordDrawerOpen(false)}
				relatedWords={relatedWords}
				onSelectWord={(word) => {
					// When selecting from sheet, open details
					uiHook.setSelectedRelatedWord(word);
					// Keep sheet open or close it? UX decision: Close sheet, open details drawer
					// But details drawer replaces sheet usually.
					// Let's rely on RelatedWordDetailsDrawer to handle the details view
				}}
			/>

			{/* Study Settings Drawer */}
			<Drawer
				open={uiHook.settingsVisible}
				onClose={() => uiHook.setSettingsVisible(false)}
				title={t('settings')}
				styles={{ wrapper: { width: 600 } }}
			>
				<StudySettings userSettings={userSettings} onSettingsChange={() => {}} />
			</Drawer>

			{/* Report Modal */}
			<ReportModal
				open={uiHook.isReportModalOpen}
				onClose={() => uiHook.setIsReportModalOpen(false)}
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
						// Transition to quiz phase using hook helper
						phaseHook.transitionToQuiz();
						setShowAnswer(false);
						resetTimer();
					}}
					onSkip={() => {
						// Skip briefing and go directly to quiz
						// Mark that user has skipped briefing
						setHasSkippedBriefing(true);
						// Transition using hook helper
						console.log('[SessionController] User clicked skip, transitioning to quiz');
						phaseHook.transitionToQuiz();
						setShowAnswer(false);
						resetTimer();
					}}
				/>
			)}

			{/* Quiz Phase study content */}
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
							position: 'relative', // Needed for absolutely positioned sidebar
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
								// Add right padding when sidebar is visible to prevent overlap
								// paddingRight: isDesktop && showAnswer ? 352 : 0, // 320px sidebar + 32px gap
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
									isExiting={ratingHook.isCardExiting}
									exitColor={ratingHook.exitColor}
									isPlaying={audioHook.isPlaying}
									onPlayAudio={audioHook.toggleAudio}
									cardBackSettings={cardBackSettings}
								/>
							</div>

							{/* Mobile Action Bar */}
							{/* {!isDesktop && showAnswer && (
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
									onRelatedWords={() => uiHook.setIsRelatedWordDrawerOpen(true)}
									onConfusions={() => {}} // Placeholder: Could scroll to section
									onEtymology={() => {}} // Placeholder
									onMoreExamples={() => {}} // Placeholder
								/>
							)} */}
						</Flex>

						{/* Desktop Sidebar (Slide-in) */}
						{/* {isDesktop && showAnswer && (
							<StudySidebar
								visible={showAnswer}
								relatedWords={relatedWords}
								vocabId={cardToShow.vocabId}
								onSelectRelatedWord={(word) => {
									uiHook.setSelectedRelatedWord(word);
									uiHook.setIsRelatedWordDrawerOpen(true);
								}}
							/>
						)} */}
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
								pointerEvents: showAnswer && !ratingHook.isSubmitting ? 'auto' : 'none',
								width: '100%',
								maxWidth: 500,
								transform: showAnswer ? 'translateY(0)' : 'translateY(100px)',
								opacity: showAnswer ? 1 : 0,
								transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
							}}
						>
							{showAnswer && (
								<RatingBar
									onRate={ratingHook.handleRate}
									disabled={ratingHook.isSubmitting}
									selectedRating={ratingHook.isSubmitting ? (currentCard ? 3 : null) : null}
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
