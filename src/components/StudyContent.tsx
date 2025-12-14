'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Button, Flex, Result, Spin, App, Drawer, Progress, Typography, Badge } from 'antd';
import { useTranslations } from 'next-intl';
import {
	getNextReviewCard,
	submitReview,
	getUserSettings,
	getDailyProgress,
} from '@/services/actions';
import { getCourseById } from '@/services/course-actions';
import type { User } from '@/generated/prisma';
import FlashCard, { FlashCardHandle } from '@/components/FlashCard';
import VocabSettings from '@/components/VocabSettings';
import ReportModal from '@/components/ReportModal';
import RatingBar from '@/components/RatingBar';
import CommentDrawer from '@/components/comments/CommentDrawer';
import {
	LoadingOutlined,
	CheckCircleFilled,
	CloseOutlined,
	SettingOutlined,
	FireOutlined,
	TrophyOutlined,
	FlagOutlined,
	TeamOutlined,
} from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';

const { Content } = Layout;
const { Text } = Typography;

export default function StudyContent() {
	const t = useTranslations('Study');
	const tCommon = useTranslations('Common');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [card, setCard] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [showAnswer, setShowAnswer] = useState(false);
	const [sessionComplete, setSessionComplete] = useState(false);
	const [submittingRating, setSubmittingRating] = useState<number | null>(null);
	const [headerVisible, setHeaderVisible] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Progress Stats
	const [dailyStats, setDailyStats] = useState({
		reviewsToday: 0,
		limitReviews: 200,
		newCardsToday: 0,
		limitNewCards: 20,
		dueCount: 0,
	});

	const searchParams = useSearchParams();
	const deckIdParam = searchParams.get('deckId');
	const courseIdParam = searchParams.get('courseId');

	const [targetDeckIds, setTargetDeckIds] = useState<string | string[] | undefined>(
		deckIdParam || undefined,
	);

	// Settings State
	const [showFurigana, setShowFurigana] = useState(true);
	const [showRomaji, setShowRomaji] = useState(false);
	const [autoPlayAudio, setAutoPlayAudio] = useState<'off' | 'question' | 'answer'>('answer');
	const [settingsVisible, setSettingsVisible] = useState(false);

	// User Preferences from DB
	const [spaceKeyRating, setSpaceKeyRating] = useState(3);
	const [autoShowAnswer, setAutoShowAnswer] = useState(false);
	const [autoShowAnswerDelay, setAutoShowAnswerDelay] = useState(40);
	const [isReportModalOpen, setIsReportModalOpen] = useState(false);

	const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
	const flashCardRef = React.useRef<FlashCardHandle>(null);

	const { message } = App.useApp();
	const router = useRouter();

	// Load Initial Data
	const [userSettings, setUserSettings] = useState<Partial<User> | null>(null); // Use appropriate type if available or infer

	const fetchSettings = useCallback(async () => {
		const settings = await getUserSettings();
		if (settings) {
			setDailyStats((prev) => ({
				...prev,
				limitReviews: settings.limitReviews,
			}));
			setSpaceKeyRating(settings.spaceKeyRating);
			setAutoShowAnswer(settings.autoShowAnswer);
			setAutoShowAnswerDelay(settings.autoShowAnswerDelay);
			setUserSettings(settings);
		}
	}, []);

	useEffect(() => {
		fetchSettings();
	}, [fetchSettings]);

	useEffect(() => {
		Promise.all([getDailyProgress()]).then(([stats]) => {
			if (stats) {
				setDailyStats(stats);
			}
		});
	}, []);

	// Scroll Detection for Distraction Free Mode
	// Scroll & Inactivity Detection
	useEffect(() => {
		let lastScrollY = window.scrollY;
		let timeoutId: NodeJS.Timeout;

		const resetTimer = () => {
			clearTimeout(timeoutId);
			// Only auto-hide if scrolled down a bit (not at very top) to avoid annoying behavior?
			// User request: "auto hide ... after 5s. show again if scroll".
			// Let's just strict 5s hide.
			timeoutId = setTimeout(() => {
				setHeaderVisible(false);
			}, 5000);
		};

		const handleScroll = () => {
			const currentScrollY = window.scrollY;

			// Standard Scroll Logic
			if (currentScrollY > lastScrollY && currentScrollY > 50) {
				setHeaderVisible(false); // Hide on scroll down (swipe up)
			} else {
				// Show on scroll up (swipe down) OR tap
				setHeaderVisible(true);
				resetTimer(); // Reset inactivity timer on show
			}
			lastScrollY = currentScrollY;
		};

		// Also listen for touches to show header
		const handleInteraction = () => {
			setHeaderVisible(true);
			resetTimer();
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('touchstart', handleInteraction, { passive: true });
		window.addEventListener('click', handleInteraction, { passive: true });

		resetTimer(); // Start initial timer

		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('touchstart', handleInteraction);
			window.removeEventListener('click', handleInteraction);
			clearTimeout(timeoutId);
		};
	}, []);

	// Update Stats helper
	const updateStats = useCallback(() => {
		getDailyProgress().then((stats) => {
			if (stats) setDailyStats(stats);
		});
	}, []);

	// Fetch Initial Card
	const fetchNextCard = useCallback(async () => {
		try {
			// If courseId is present but targetDeckIds is not yet resolved (still string or undefined), wait or fetch
			// Logic: If courseId is set, we need to resolve it to an array of deck IDs first.
			// Handled in a separate effect below.

			if (courseIdParam && !Array.isArray(targetDeckIds)) {
				return; // Wait for course resolution
			}

			setLoading(true);
			const nextCard = await getNextReviewCard(targetDeckIds);
			if (nextCard) {
				setCard(nextCard);
				setShowAnswer(false);
				setSessionComplete(false);
			} else {
				setCard(null);
				setSessionComplete(true);
				updateStats(); // Ensure final stats are fresh
			}
		} catch (error) {
			console.error('Failed to fetch card', error);
			message.error(t('failedLoadCards'));
		} finally {
			setLoading(false);
		}
	}, [targetDeckIds, message, updateStats, t, courseIdParam]);

	// Resolve Course ID to Deck IDs
	useEffect(() => {
		if (courseIdParam) {
			setLoading(true);
			getCourseById(courseIdParam)
				.then((course) => {
					if (course && course.decks.length > 0) {
						// Extract deck IDs
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
		} else if (deckIdParam) {
			setTargetDeckIds(deckIdParam);
		}
	}, [courseIdParam, deckIdParam, message]);

	useEffect(() => {
		fetchNextCard();
	}, [fetchNextCard]);

	// Auto-Reveal Timer
	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (card && !showAnswer && autoShowAnswer) {
			timer = setTimeout(() => {
				if (!showAnswer) {
					setShowAnswer(true);
				}
			}, autoShowAnswerDelay * 1000);
		}
		return () => clearTimeout(timer);
	}, [card, showAnswer, autoShowAnswer, autoShowAnswerDelay]);

	// Handle Rating Submission
	const handleRate = useCallback(
		async (rating: number) => {
			if (!card || submittingRating !== null) return;

			try {
				setSubmittingRating(rating);
				// Optimistic UI update for stats could happen here, but safer to re-fetch or increment local state
				const result = await submitReview(card.id, rating, targetDeckIds);

				if (result.success) {
					// Increment local stats for immediate feedback
					setDailyStats((prev) => ({
						...prev,
						reviewsToday: prev.reviewsToday + 1,
						// If card was new (state 0), increment newCardsToday. But we depend on backend card state which we might not have perfectly sync here easily without complex check.
						// Simplifying: Just re-fetch in background.
					}));
					getDailyProgress().then((s) => s && setDailyStats(s));

					if (result.nextCard) {
						setCard(result.nextCard);
						setShowAnswer(false);
					} else {
						setCard(null);
						setSessionComplete(true);
					}
				} else {
					message.error(result.error || t('failedSubmitReview'));
				}
			} catch (error) {
				console.error('Review error', error);
				message.error(t('unexpectedError'));
			} finally {
				setSubmittingRating(null);
			}
		},
		[card, submittingRating, message, targetDeckIds, t],
	);

	// Keyboard Shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Disable shortcuts if modal is open, or typing in an input
			const target = e.target as HTMLElement;
			const isInput =
				target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

			// Handle Escape to close settings
			if (e.key === 'Escape' || e.code === 'Escape') {
				if (settingsVisible) {
					setSettingsVisible(false);
					return;
				}
			}

			if (
				loading ||
				submittingRating !== null ||
				sessionComplete ||
				settingsVisible ||
				isReportModalOpen ||
				isCommentDrawerOpen ||
				isInput
			)
				return;

			if (e.code === 'Space') {
				if (e.repeat) return; // Prevent holding key triggering multiple actions
				e.preventDefault(); // Prevent scrolling

				if (!showAnswer) {
					setShowAnswer(true);
				} else {
					// User requested Space to auto-select configured rating (default 3/Good)
					handleRate(spaceKeyRating);
				}
			} else if (showAnswer) {
				switch (e.key) {
					case '1':
						handleRate(1); // Again
						break;
					case '2':
						handleRate(2); // Hard
						break;
					case '3':
						handleRate(3); // Good
						break;
					case '4':
						handleRate(4); // Easy
						break;
				}
			}

			// Audio Shortcuts
			if (e.key.toLowerCase() === 'r') {
				flashCardRef.current?.playAudio();
			} else if (e.key.toLowerCase() === 'e') {
				flashCardRef.current?.playExampleAudio();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [
		card,
		showAnswer,
		loading,
		submittingRating,
		sessionComplete,
		handleRate,
		settingsVisible,
		isReportModalOpen,
		isCommentDrawerOpen,
		spaceKeyRating,
	]);

	// Session Complete Confetti
	useEffect(() => {
		if (sessionComplete) {
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 },
			});
		}
	}, [sessionComplete]);

	// Loading State
	if (loading && !card && !error) {
		return (
			<Flex justify="center" align="center" style={{ height: '100vh', background: '#F9F7F2' }}>
				<Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1E3A5F' }} spin />} />
			</Flex>
		);
	}

	// Error State
	if (error) {
		return (
			<Flex justify="center" align="center" style={{ height: '100vh', background: '#F9F7F2' }}>
				<Result
					status="warning"
					title={t('unableToStart')}
					subTitle={error}
					extra={
						<Button
							type="primary"
							onClick={() => router.push(courseIdParam ? `/courses/${courseIdParam}` : '/')}
						>
							{t('goBack')}
						</Button>
					}
				/>
			</Flex>
		);
	}

	// Session Complete State
	if (sessionComplete) {
		const reviewPercent = Math.min(
			100,
			Math.round((dailyStats.reviewsToday / dailyStats.limitReviews) * 100),
		);
		const newPercent = Math.min(
			100,
			Math.round((dailyStats.newCardsToday / dailyStats.limitNewCards) * 100),
		);

		return (
			<Flex
				justify="center"
				align="center"
				style={{ minHeight: '100vh', background: '#F9F7F2', padding: 20 }}
			>
				<div
					style={{
						background: 'white',
						padding: 40,
						borderRadius: 24,
						boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
						maxWidth: 500,
						width: '100%',
						textAlign: 'center',
					}}
				>
					<Result
						icon={<CheckCircleFilled style={{ color: '#52c41a', fontSize: 72 }} />}
						title={t('sessionComplete')}
						subTitle={t('sessionCompleteSubtitle')}
						extra={[
							<div key="stats" style={{ marginBottom: 24, textAlign: 'left' }}>
								<Flex justify="space-between">
									<Text strong>
										<FireOutlined /> {t('dailyReviews')}
									</Text>
									<Text>
										{dailyStats.reviewsToday} / {dailyStats.limitReviews}
									</Text>
								</Flex>
								<Progress percent={reviewPercent} status="active" strokeColor="#1890ff" />
							</div>,
							<div key="new-cards-stats" style={{ marginBottom: 16 }}>
								<Flex justify="space-between">
									<Text strong>
										<TrophyOutlined /> {t('newWords')}
									</Text>
									<Text>
										{dailyStats.newCardsToday} / {dailyStats.limitNewCards}
									</Text>
								</Flex>
								<Progress percent={newPercent} status="active" strokeColor="#faad14" />
							</div>,
							<Button
								type="primary"
								key="home"
								size="large"
								shape="round"
								onClick={() => router.push('/')}
								style={{ width: '100%', height: 48 }}
							>
								{t('returnDashboard')}
							</Button>,
						]}
					/>
				</div>
			</Flex>
		);
	}

	const headerStyle: React.CSSProperties = {
		position: 'fixed',
		zIndex: 100,
		transition: 'opacity 0.3s ease, transform 0.3s ease',
		opacity: headerVisible ? 1 : 0,
		transform: headerVisible ? 'translateY(0)' : 'translateY(-20px)',
		pointerEvents: headerVisible ? 'auto' : 'none',
	};

	// Calculate Progress for Top Bar
	// Goal: Fill bar based on Review Limit
	const progressPercent = Math.min(
		100,
		(dailyStats.reviewsToday / (dailyStats.limitReviews || 1)) * 100,
	);

	// Get comment count // Safely handle if _count is missing (if prisma not updated yet)
	const commentCount = card?.vocab?._count?.cardComments || card?.kanji?._count?.cardComments || 0;

	return (
		<Layout style={{ minHeight: '100vh', background: '#F9F7F2' }}>
			{/* Minimal Top Progress Bar */}
			<div
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					height: 4,
					background: 'rgba(0,0,0,0.05)',
					zIndex: 200,
				}}
			>
				<div
					style={{
						height: '100%',
						width: `${progressPercent}%`,
						background: '#52c41a',
						transition: 'width 0.5s ease',
					}}
				/>
			</div>

			{/* Top Right Controls (Close Only) */}
			<div style={{ ...headerStyle, top: 16, right: 16 }}>
				<Button
					shape="circle"
					icon={<CloseOutlined />}
					onClick={() => {
						if (courseIdParam) {
							router.push(`/courses/${courseIdParam}`);
						} else if (deckIdParam && !deckIdParam.includes(',')) {
							router.push(`/decks/${deckIdParam}`);
						} else {
							router.push('/');
						}
					}}
					onMouseDown={(e) => e.preventDefault()}
					style={{ border: 'none', background: 'rgba(0,0,0,0.05)', width: 44, height: 44 }}
				/>
			</div>

			{/* Comment Drawer */}
			<CommentDrawer
				open={isCommentDrawerOpen}
				onClose={() => setIsCommentDrawerOpen(false)}
				entityId={card?.vocab?.id || card?.kanji?.id}
				entityType={card?.vocab ? 'vocab' : card?.kanji ? 'kanji' : undefined}
				entityTitle={card?.vocab?.wordSurface || card?.kanji?.kanji}
			/>

			{/* Top Left Controls (Settings + Community + Counter) */}
			<div style={{ ...headerStyle, top: 16, left: 16 }}>
				<Flex gap="small" align="center">
					<Button
						shape="circle"
						icon={<SettingOutlined />}
						onClick={() => setSettingsVisible(true)}
						onMouseDown={(e) => e.preventDefault()}
						style={{ border: 'none', background: 'rgba(0,0,0,0.05)', width: 44, height: 44 }}
					/>

					{/* Community Component (Moved) */}
					<Badge count={commentCount} size="small" color="blue" offset={[-5, 5]}>
						<Button
							shape="circle"
							icon={<TeamOutlined />}
							onClick={() => setIsCommentDrawerOpen(true)}
							onMouseDown={(e) => e.preventDefault()}
							style={{
								border: 'none',
								background: 'rgba(0,0,0,0.05)',
								width: 44,
								height: 44,
								color: '#1E3A5F', // Indigo brand color
							}}
						/>
					</Badge>

					{/* Cards Left Counter */}
					<div
						style={{
							background: 'rgba(0,0,0,0.05)',
							padding: '4px 12px',
							borderRadius: 20,
							fontSize: 14,
							fontWeight: 600,
							color: '#666',
						}}
					>
						{dailyStats.dueCount > 0 ? `${dailyStats.dueCount} ${t('left')}` : t('wait')}
					</div>
				</Flex>
			</div>

			{/* Settings Drawer - Side Panel */}
			<Drawer
				title={t('settingsTitle')}
				placement="left"
				onClose={() => setSettingsVisible(false)}
				open={settingsVisible}
				size={'default'}
				mask={false}
				styles={{ body: { paddingBottom: 80 } }}
			>
				<VocabSettings
					showFurigana={showFurigana}
					setShowFurigana={setShowFurigana}
					showRomaji={showRomaji}
					setShowRomaji={setShowRomaji}
					autoPlayAudio={autoPlayAudio}
					setAutoPlayAudio={setAutoPlayAudio}
					userSettings={userSettings}
					onSettingsChange={fetchSettings}
				/>

				<div style={{ marginTop: 32 }}>
					<Button
						danger
						icon={<FlagOutlined />}
						block
						onClick={() => {
							setSettingsVisible(false);
							setIsReportModalOpen(true);
						}}
					>
						{tCommon('reportIssue')}
					</Button>
					<div style={{ marginTop: 8, textAlign: 'center' }}>
						<Text type="secondary" style={{ fontSize: 10 }}>
							ID: {card?.id || 'N/A'}
						</Text>
					</div>
				</div>
			</Drawer>

			<ReportModal
				open={isReportModalOpen}
				onClose={() => setIsReportModalOpen(false)}
				vocabId={card?.vocab?.id}
				kanjiId={card?.kanji?.id}
				currentText={card?.vocab?.wordSurface || card?.kanji?.kanji || ''}
			/>

			<Content
				style={{
					padding: '16px',
					display: 'flex',
					flexDirection: 'column',
					height: '100vh',
					maxWidth: 600,
					margin: '0 auto',
					width: '100%',
				}}
			>
				{/* Scrollable Card Area */}
				<div
					style={{
						flex: 1,
						overflowY: 'auto',
						display: 'flex',
						flexDirection: 'column',
						paddingBottom: 220, // Increased bottom padding for larger RatingBar area on mobile
						paddingTop: 60, // Space for header buttons
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
					/>
				</div>

				{/* Thumb Zone Controls - Fixed Bottom */}
				<div
					style={{
						position: 'fixed',
						bottom: 0,
						left: 0,
						right: 0,
						padding: '16px 24px 32px',
						background: 'linear-gradient(to top, #F9F7F2 90%, rgba(249, 247, 242, 0))',
						display: 'flex',
						justifyContent: 'center',
						zIndex: 50,
						pointerEvents: 'none', // Allow clicking through gradient area
					}}
				>
					<div style={{ pointerEvents: 'auto', width: '100%', maxWidth: 500, textAlign: 'center' }}>
						{!showAnswer ? (
							<Button
								size="large"
								type="primary"
								block
								style={{
									height: 56,
									fontSize: 18,
									borderRadius: 28,
									boxShadow: '0 4px 12px rgba(30, 58, 95, 0.2)',
								}}
								onClick={() => setShowAnswer(true)}
							>
								{t('showAnswer')}
							</Button>
						) : (
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
