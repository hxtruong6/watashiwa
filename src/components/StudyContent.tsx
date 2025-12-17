'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Button, Flex, Result, Drawer, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';

// Hooks
import { useStudySession } from '@/hooks/study/useStudySession';
import { useStudyShortcuts } from '@/hooks/study/useStudyShortcuts';
import { useZenMode } from '@/hooks/study/useZenMode';

// Components
import FlashCard, { FlashCardHandle } from '@/components/FlashCard';
import VocabSettings from '@/components/VocabSettings';
import ReportModal from '@/components/ReportModal';
import RatingBar from '@/components/RatingBar';
import CommentDrawer from '@/components/comments/CommentDrawer';
import StudyHeader from '@/components/Study/StudyHeader';
import SessionSummary from '@/components/Study/SessionSummary';
import Loading from '@/components/Shared/Loading';
import { FlagOutlined } from '@ant-design/icons';
import { getUserSettings } from '@/services/actions';
import type { User } from '@prisma/client';

const { Content } = Layout;
const { Text } = Typography;
const { useToken } = theme;

export default function StudyContent() {
	const { token } = useToken();
	const t = useTranslations('Study');
	const tCommon = useTranslations('Common');
	const router = useRouter();
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
	const [autoShowAnswer, setAutoShowAnswer] = useState(false);
	const [autoShowAnswerDelay, setAutoShowAnswerDelay] = useState(10);

	// 1. Core Logic Hook
	const {
		card,
		loading,
		sessionComplete,
		dailyStats,
		error,
		submittingRating,
		handleRate,
		showAnswer,
		setShowAnswer,
	} = useStudySession({
		courseId: courseIdParam || undefined,
		deckId: deckIdParam || undefined,
		mode: modeParam,
		userSettings: userSettings
			? {
					limitReviews: userSettings.limitReviews || 200,
					limitNewCards: userSettings.limitNewCards || 20,
				}
			: null,
	});

	// 2. Refs
	const flashCardRef = React.useRef<FlashCardHandle>(null);
	const scrollRef = React.useRef<HTMLDivElement>(null);

	// 3. Zen Mode Hook (Now using scrollRef)
	const { headerVisible } = useZenMode(10, scrollRef);

	const refreshSettings = useCallback(async () => {
		const settings = await getUserSettings();
		if (settings) {
			setSpaceKeyRating(settings.spaceKeyRating);
			setAutoShowAnswer(settings.autoShowAnswer);
			setAutoShowAnswerDelay(settings.autoShowAnswerDelay ?? 10);
			setUserSettings(settings);
		}
	}, []);

	// ... (Effect omitted for brevity, logic remains same)

	// ... (Shortcuts omitted)

	// Render Logic
	// ... (Loading/Error/SessionComplete omitted)

	// Session Complete
	if (sessionComplete) {
		return <SessionSummary stats={dailyStats} />;
	}

	const progressPercent = Math.min(
		100,
		(dailyStats.reviewsToday / (dailyStats.limitReviews || 1)) * 100,
	);

	const commentCount = card?.vocab?._count?.cardComments || card?.kanji?._count?.cardComments || 0;

	return (
		<Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
			<StudyHeader
				visible={headerVisible}
				progressPercent={progressPercent}
				dueCount={dailyStats.dueCount}
				commentCount={commentCount}
				courseId={courseIdParam}
				deckId={deckIdParam}
				onOpenSettings={() => setSettingsVisible(true)}
				onOpenComments={() => setIsCommentDrawerOpen(true)}
			/>

			{/* Comment Drawer ... */}
			{/* Settings Drawer ... */}
			{/* ReportModal ... */}

			{/* Main Content */}
			<Content
				style={{
					display: 'flex',
					flexDirection: 'column',
					height: '100vh',
					width: '100%',
				}}
			>
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

				{/* Thumb Zone Controls - Rating Bar */}
				<div
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
			</Content>
		</Layout>
	);
}
