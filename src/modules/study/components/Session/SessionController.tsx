'use client';

// Components
import AppTutorial from '@/components/Shared/AppTutorial';
import CommentDrawer from '@/components/comments/CommentDrawer';
// Hooks
import { useStudyShortcuts } from '@/hooks/study/useStudyShortcuts';
import { useStudyTutorialSteps } from '@/hooks/study/useStudyTutorialSteps';
import { useZenMode } from '@/hooks/study/useZenMode';
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
}

export default function SessionController({ deckId, courseId }: SessionControllerProps) {
	const t = useTranslations('Study');
	const screens = useBreakpoint();

	// Store
	const { startSession, queue, currentIndex, submitRating, isSessionActive, currentCard } =
		useSessionStore();

	// Local State
	const [isLoading, setIsLoading] = useState(true);
	const [studyPhase, setStudyPhase] = useState<'loading' | 'briefing' | 'quiz' | 'summary'>(
		'loading',
	);
	const [dailyStats, setDailyStats] = useState({
		reviewsToday: 0,
		limitReviews: 200,
	});

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
				const [stats, settings, tutorials] = await Promise.all([
					getDailyProgress(),
					getUserSettings(),
					getCompletedTutorials(),
				]);

				if (stats) setDailyStats(stats);
				if (settings) {
					setUserSettings(settings);
					// setSpaceKeyRating(settings.spaceKeyRating); // Uncomment if exists
				}

				// Fetch Cards if queue is empty
				if (queue.length === 0) {
					const response = await fetchSessionAction({ deckId, courseId });
					if (response.success && response.data && response.data.length > 0) {
						startSession(response.data);
					} else {
						// Handle empty or error
						console.warn('No cards found');
						setStudyPhase('summary'); // Or empty state
					}
				}
			} catch (error) {
				console.error('Failed to init session:', error);
			} finally {
				setIsLoading(false);
			}
		}

		init();
	}, [deckId, courseId, startSession, queue.length]);

	// 2. Phase Transition Logic
	useEffect(() => {
		if (!isLoading && studyPhase === 'loading') {
			if (queue.length === 0) {
				setStudyPhase('summary');
				return;
			}

			// Check for Briefing Candidates
			const hasNew = queue.some((c) => c.srsStage === 0);
			// const hasLeech = queue.some((c) => (c.lapses ?? 0) > 0 || c.difficulty > 6);
			const hasLeech = false; // TODO: Add lapses to SmartCard type

			if (hasNew || hasLeech) {
				setStudyPhase('briefing');
			} else {
				setStudyPhase('quiz');
			}
		}
	}, [isLoading, queue, studyPhase]);

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

	return (
		<SessionContainer
			progress={progressPercent}
			headerVisible={headerVisible}
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
			<AppTutorial tutorialId="study_page_v1" steps={tutorialSteps} />

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

			{studyPhase === 'briefing' && (
				<SessionBriefing queue={queue} stats={dailyStats} onStart={() => setStudyPhase('quiz')} />
			)}

			{studyPhase === 'quiz' && currentCard && (
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
								key={currentCard.id}
								card={currentCard}
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
