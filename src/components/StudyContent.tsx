'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layout, theme, Drawer } from 'antd';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

// Hooks
import { useStudySession } from '@/hooks/study/useStudySession';
import { useStudyShortcuts } from '@/hooks/study/useStudyShortcuts';
import { useZenMode } from '@/hooks/study/useZenMode';
import { useStudyTutorialSteps } from '@/hooks/study/useStudyTutorialSteps';

// Components
import FlashCard, { FlashCardHandle } from '@/components/FlashCard';
import VocabSettings from '@/components/VocabSettings';
import ReportModal from '@/components/ReportModal';
import RatingBar from '@/components/RatingBar';
import CommentDrawer from '@/components/comments/CommentDrawer';
import StudyHeader from '@/components/Study/StudyHeader';
import SessionSummary from '@/components/Study/SessionSummary';
import SessionBriefing from '@/components/Study/SessionBriefing';
import Loading from '@/components/Shared/Loading';
import { getUserSettings } from '@/services/actions';
import { DEFAULT_LIMIT_NEW_CARDS, DEFAULT_LIMIT_REVIEWS } from '@/lib/constants';
import AppTutorial from '@/components/Shared/AppTutorial';
import { useTutorialStore } from '@/hooks/useTutorialStore';
import { getCompletedTutorials } from '@/services/actions';
import type { User } from '@prisma/client';

const { Content } = Layout;
const { useToken } = theme;

export default function StudyContent() {
	const { token } = useToken();
	const t = useTranslations('Study');
	// const tCommon = useTranslations('Common');
	// const router = useRouter();
	const searchParams = useSearchParams();

	// Params
	const deckIdParam = searchParams.get('deckId');
	const courseIdParam = searchParams.get('courseId');
	const modeParam = searchParams.get('mode') as 'quick' | null;

	// Local UI State
	const [settingsVisible, setSettingsVisible] = useState(false);
	const [isReportModalOpen, setIsReportModalOpen] = useState(false);
	const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);

	// Settings State
	const [showFurigana, setShowFurigana] = useState(true);
	const [showRomaji, setShowRomaji] = useState(false);
	const [autoPlayAudio, setAutoPlayAudio] = useState<'off' | 'question' | 'answer'>('answer');
	const [userSettings, setUserSettings] = useState<Partial<User> | null>(null);
	const [spaceKeyRating, setSpaceKeyRating] = useState(3);

	// 1. Core Logic Hook
	const studySessionSettings = React.useMemo(() => {
		return userSettings
			? {
					limitReviews: userSettings.limitReviews || DEFAULT_LIMIT_REVIEWS,
					limitNewCards: userSettings.limitNewCards || DEFAULT_LIMIT_NEW_CARDS,
				}
			: null;
	}, [userSettings]);

	const {
		card,
		loading,
		sessionComplete,
		dailyStats,
		// error,
		submittingRating,
		handleRate,
		showAnswer,
		setShowAnswer,
		queue,
	} = useStudySession({
		courseId: courseIdParam || undefined,
		deckId: deckIdParam || undefined,
		mode: modeParam,
		userSettings: studySessionSettings,
	});

	// 2. Refs
	const flashCardRef = React.useRef<FlashCardHandle>(null);
	const scrollRef = React.useRef<HTMLDivElement>(null);
	const settingsRef = React.useRef<HTMLButtonElement>(null);
	const cardWrapperRef = React.useRef<HTMLDivElement>(null);
	const ratingBarRef = React.useRef<HTMLDivElement>(null);

	// 3. Zen Mode Hook (Now using scrollRef with auto-hide)
	const { headerVisible, forceShow, resetTimer } = useZenMode(10, scrollRef, 3000);

	// 4. Tutorial Steps - must be called before any conditional returns
	const tutorialSteps = useStudyTutorialSteps({
		showAnswer,
		cardWrapperRef,
		ratingBarRef,
		settingsRef,
	});

	const refreshSettings = useCallback(async () => {
		const [settings, tutorials] = await Promise.all([getUserSettings(), getCompletedTutorials()]);

		if (settings) {
			setSpaceKeyRating(settings.spaceKeyRating);
			setUserSettings(settings);
		}

		if (tutorials) {
			useTutorialStore.getState().mergeTutorials(tutorials);
		}
	}, []);

	useEffect(() => {
		// Offload to macro-task to avoid sync rendering updates warning
		setTimeout(() => {
			refreshSettings();
		}, 0);
	}, [refreshSettings]);

	// ... (Effect omitted for brevity, logic remains same)

	// Shortcuts
	const handleSpaceKey = useCallback(() => {
		if (!showAnswer) {
			setShowAnswer(true);
			resetTimer(); // Reset timer when revealing
		} else {
			handleRate(spaceKeyRating);
			resetTimer(); // Reset timer when rating
		}
	}, [showAnswer, setShowAnswer, handleRate, spaceKeyRating, resetTimer]);

	useStudyShortcuts({
		onSpace: handleSpaceKey,
		onRate: handleRate,
		showAnswer,
		disabled: isReportModalOpen || isCommentDrawerOpen || settingsVisible,
		onAudio: () => flashCardRef.current?.playAudio(),
		onToggleHeader: () => {
			if (headerVisible) {
				// Manual hide doesn't need timer logic
			} else {
				forceShow();
			}
		},
		// onExampleAudio: () => flashCardRef.current?.playExampleAudio(),
		onEscape: () => {
			if (isReportModalOpen) setIsReportModalOpen(false);
			if (isCommentDrawerOpen) setIsCommentDrawerOpen(false);
			if (settingsVisible) setSettingsVisible(false);
		},
	});

	// 4. Session Phase Logic
	const [studyPhase, setStudyPhase] = useState<'loading' | 'briefing' | 'quiz' | 'summary'>(
		'loading',
	);

	// Determine Initial Phase
	useEffect(() => {
		if (!loading && studyPhase === 'loading') {
			if (sessionComplete) {
				setTimeout(() => setStudyPhase('summary'), 0);
				return;
			}

			// Check for Briefing Candidates (New or Leech)
			const allUpcoming = card ? [card, ...queue] : queue;

			const hasNew = allUpcoming.some((c) => c.state === 0);
			const hasLeech = allUpcoming.some((c) => (c.lapses ?? 0) > 0 || c.difficulty > 6);

			// Avoid sync state update during render cycle
			setTimeout(() => {
				if (hasNew || hasLeech) {
					setStudyPhase('briefing');
				} else {
					setStudyPhase('quiz');
				}
			}, 0);
		} else if (sessionComplete && studyPhase !== 'summary') {
			setTimeout(() => setStudyPhase('summary'), 0);
		}
	}, [loading, sessionComplete, studyPhase, card, queue]);

	// Session Complete (Handled by phase)
	if (studyPhase === 'summary') {
		return <SessionSummary stats={dailyStats} />;
	}

	const progressPercent = Math.min(
		100,
		(dailyStats.reviewsToday / (dailyStats.limitReviews || 1)) * 100,
	);

	const commentCount = card?.vocab?._count?.cardComments || card?.kanji?._count?.cardComments || 0;

	return (
		<Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
			<AppTutorial tutorialId="study_page_v1" steps={tutorialSteps} />

			<StudyHeader
				visible={headerVisible}
				progressPercent={progressPercent}
				dueCount={dailyStats.dueCount}
				commentCount={commentCount}
				courseId={courseIdParam}
				deckId={deckIdParam}
				settingsRef={settingsRef}
				onOpenSettings={() => setSettingsVisible(true)}
				onOpenComments={() => setIsCommentDrawerOpen(true)}
			/>

			{/* Comment Drawer */}
			<CommentDrawer
				open={isCommentDrawerOpen}
				onClose={() => setIsCommentDrawerOpen(false)}
				entityId={card?.vocabId || card?.kanjiId || card?.id || ''}
				entityType={card?.vocabId ? 'vocab' : 'kanji'}
				entityTitle={card?.vocab?.wordSurface || card?.kanji?.kanji || 'Card'}
			/>

			{/* Settings Drawer */}
			<Drawer
				open={settingsVisible}
				onClose={() => setSettingsVisible(false)}
				title={t('settings') || 'Settings'}
				width={600}
				placement="right"
			>
				<VocabSettings
					showFurigana={showFurigana}
					setShowFurigana={setShowFurigana}
					showRomaji={showRomaji}
					setShowRomaji={setShowRomaji}
					autoPlayAudio={autoPlayAudio}
					setAutoPlayAudio={setAutoPlayAudio}
					userSettings={userSettings}
					onSettingsChange={refreshSettings}
				/>
			</Drawer>

			{/* ReportModal */}
			<ReportModal
				open={isReportModalOpen}
				onClose={() => setIsReportModalOpen(false)}
				vocabId={card?.vocabId || undefined}
				kanjiId={card?.kanjiId || undefined}
				currentText={card?.vocab?.wordSurface || card?.kanji?.kanji || undefined}
			/>

			{/* Main Content */}
			<Content
				style={{
					display: 'flex',
					flexDirection: 'column',
					height: '100vh',
					width: '100%',
				}}
			>
				{studyPhase === 'loading' && <Loading />}

				{studyPhase === 'briefing' && (
					<SessionBriefing
						queue={card ? [card, ...queue] : queue}
						stats={dailyStats}
						onStart={() => setStudyPhase('quiz')}
					/>
				)}

				{studyPhase === 'quiz' && (
					<>
						{/* Top-Edge Tap Zone - Show Header When Hidden */}
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
									height: 64,
									zIndex: 999,
									cursor: 'pointer',
									background: 'transparent',
								}}
								aria-label="Tap to show header"
							/>
						)}

						{/* Scrollable Card Area */}
						<div
							ref={scrollRef}
							onClick={() => {
								// Global "Click to Reveal" handler
								if (!showAnswer) {
									setShowAnswer(true);
								}
							}}
							style={{
								flex: 1,
								overflowY: 'auto',
								display: 'flex',
								flexDirection: 'column',
								paddingBottom: 220,
								paddingTop: 60,
								paddingLeft: 16,
								paddingRight: 16,
								cursor: !showAnswer ? 'pointer' : 'default', // Hint that it's clickable
							}}
						>
							<div
								ref={cardWrapperRef}
								style={{
									width: '100%',
									display: 'flex',
									justifyContent: 'center',
									position: 'relative',
								}}
							>
								{/* Loading Indicator - Shown when fetching next batch */}
								{loading && (
									<div
										style={{
											position: 'absolute',
											top: '50%',
											left: '50%',
											transform: 'translate(-50%, -50%)',
											zIndex: 100,
											background: `${token.colorBgContainer}CC`,
											backdropFilter: 'blur(8px)',
											padding: '16px 24px',
											borderRadius: 12,
											boxShadow: `0 4px 16px ${token.colorPrimary}1A`,
										}}
									>
										<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
											<div
												style={{
													width: 20,
													height: 20,
													border: `3px solid ${token.colorPrimary}30`,
													borderTop: `3px solid ${token.colorPrimary}`,
													borderRadius: '50%',
													animation: 'spin 0.8s linear infinite',
												}}
											/>
											<span style={{ color: token.colorText, fontSize: 14 }}>
												{t('loadingNextCards')}
											</span>
										</div>
									</div>
								)}

								<FlashCard
									ref={flashCardRef}
									key={card?.id || 'empty'}
									card={card}
									showAnswer={showAnswer}
									showFurigana={showFurigana}
									showRomaji={showRomaji}
									autoPlayAudio={autoPlayAudio}
									onReveal={() => setShowAnswer(true)}
								/>
							</div>
						</div>

						{/* Thumb Zone Controls - Rating Bar */}
						<div
							ref={ratingBarRef}
							style={{
								position: 'fixed',
								bottom: 0,
								left: 0,
								right: 0,
								padding: '16px 24px 40px',
								background: showAnswer
									? `linear-gradient(to top, ${token.colorBgLayout} 90%, ${token.colorBgLayout}00)`
									: 'transparent',
								display: 'flex',
								justifyContent: 'center',
								zIndex: 50,
								pointerEvents: 'none',
								transition: 'background 0.3s ease',
							}}
						>
							<div
								style={{
									pointerEvents: 'auto',
									width: '100%',
									maxWidth: 500,
									textAlign: 'center',
									transform: showAnswer ? 'translateY(0)' : 'translateY(100px)',
									opacity: showAnswer ? 1 : 0,
									transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
								}}
							>
								{showAnswer && (
									<RatingBar
										key={card ? card.id : 'empty'}
										onRate={handleRate}
										disabled={submittingRating !== null}
										selectedRating={submittingRating}
									/>
								)}
							</div>
						</div>
					</>
				)}
			</Content>
		</Layout>
	);
}
