'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
	Layout,
	Button,
	Flex,
	Result,
	Spin,
	App,
	Modal,
	Progress,
	Typography,
	Divider,
	Statistic,
} from 'antd';
import {
	getNextReviewCard,
	submitReview,
	getUserSettings,
	getDailyProgress,
} from '@/services/actions';
import FlashCard from '@/components/FlashCard';
import VocabSettings from '@/components/VocabSettings';
import RatingBar from '@/components/RatingBar';
import {
	LoadingOutlined,
	CheckCircleFilled,
	CloseOutlined,
	SettingOutlined,
	FireOutlined,
	TrophyOutlined,
} from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';

const { Content } = Layout;
const { Text, Title, Paragraph } = Typography;

export default function StudyPage() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [card, setCard] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [showAnswer, setShowAnswer] = useState(false);
	const [sessionComplete, setSessionComplete] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [headerVisible, setHeaderVisible] = useState(true);

	// Progress Stats
	const [dailyStats, setDailyStats] = useState({
		reviewsToday: 0,
		limitReviews: 200,
		newCardsToday: 0,
		limitNewCards: 20,
		dueCount: 0,
	});

	const searchParams = useSearchParams();
	const deckId = searchParams.get('deckId') || undefined;

	// Settings State
	const [showFurigana, setShowFurigana] = useState(true);
	const [showRomaji, setShowRomaji] = useState(false);
	const [autoPlayAudio, setAutoPlayAudio] = useState(false);
	const [settingsVisible, setSettingsVisible] = useState(false);

	// User Preferences from DB
	const [allowSpaceKey, setAllowSpaceKey] = useState(true);
	const [spaceKeyRating, setSpaceKeyRating] = useState(3);
	const [autoShowAnswer, setAutoShowAnswer] = useState(false);
	const [autoShowAnswerDelay, setAutoShowAnswerDelay] = useState(40);

	const { message } = App.useApp();
	const router = useRouter();

	// Load Initial Data
	useEffect(() => {
		Promise.all([getUserSettings(), getDailyProgress()]).then(([settings, stats]) => {
			if (settings) {
				setAllowSpaceKey(settings.allowSpaceKey);
				setSpaceKeyRating(settings.spaceKeyRating);
				setAutoShowAnswer(settings.autoShowAnswer);
				setAutoShowAnswerDelay(settings.autoShowAnswerDelay);
			}
			if (stats) {
				setDailyStats(stats);
			}
		});
	}, []);

	// Scroll Detection for Distraction Free Mode
	useEffect(() => {
		let lastScrollY = window.scrollY;
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			if (currentScrollY > lastScrollY && currentScrollY > 50) {
				setHeaderVisible(false); // Hide on scroll down
			} else {
				setHeaderVisible(true); // Show on scroll up
			}
			lastScrollY = currentScrollY;
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
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
			setLoading(true);
			const nextCard = await getNextReviewCard(deckId);
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
			message.error('Failed to load cards. Please try refreshing.');
		} finally {
			setLoading(false);
		}
	}, [deckId, message, updateStats]);

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
			if (!card || submitting) return;

			try {
				setSubmitting(true);
				// Optimistic UI update for stats could happen here, but safer to re-fetch or increment local state
				const result = await submitReview(card.id, rating, deckId);

				if (result.success) {
					// Increment local stats for immediate feedback
					setDailyStats((prev) => ({
						...prev,
						reviewsToday: prev.reviewsToday + 1,
						// If card was new (state 0), increment newCardsToday. But we depend on backend card state which we might not have perfectly sync here easily without complex check.
						// Simplifying: Just re-fetch stats periodically or after session?
						// For smooth UI, let's just re-fetch in background.
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
					message.error(result.error || 'Failed to submit review');
				}
			} catch (error) {
				console.error('Review error', error);
				message.error('An unexpected error occurred.');
			} finally {
				setSubmitting(false);
			}
		},
		[card, submitting, message, deckId],
	);

	// Keyboard Shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (loading || submitting || sessionComplete || settingsVisible) return;

			if (e.code === 'Space') {
				e.preventDefault();
				if (!allowSpaceKey) return; // Respect setting

				if (!showAnswer) {
					setShowAnswer(true);
				} else {
					// User requested Space to auto-select configured rating (default 3/Good)
					handleRate(spaceKeyRating);
				}
			} else if (showAnswer) {
				// Prevent default to avoid scrolling or other browser actions?
				// Actually, numbers usually don't scroll.
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
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [
		card,
		showAnswer,
		loading,
		submitting,
		sessionComplete,
		handleRate,
		settingsVisible,
		allowSpaceKey,
		spaceKeyRating,
	]);

	// Loading State
	if (loading && !card) {
		return (
			<Flex justify="center" align="center" style={{ height: '100vh', background: '#F9F7F2' }}>
				<Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1E3A5F' }} spin />} />
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
						title="Session Complete!"
						subTitle="Great job! Here is your daily progress:"
						extra={[
							<div key="stats" style={{ marginBottom: 24, textAlign: 'left' }}>
								<div style={{ marginBottom: 16 }}>
									<Flex justify="space-between">
										<Text strong>
											<FireOutlined /> Daily Reviews
										</Text>
										<Text>
											{dailyStats.reviewsToday} / {dailyStats.limitReviews}
										</Text>
									</Flex>
									<Progress percent={reviewPercent} status="active" strokeColor="#1890ff" />
								</div>
								<div>
									<Flex justify="space-between">
										<Text strong>
											<TrophyOutlined /> New Words
										</Text>
										<Text>
											{dailyStats.newCardsToday} / {dailyStats.limitNewCards}
										</Text>
									</Flex>
									<Progress percent={newPercent} status="active" strokeColor="#faad14" />
								</div>
							</div>,
							<Button
								type="primary"
								key="home"
								size="large"
								shape="round"
								onClick={() => router.push('/')}
								style={{ width: '100%', height: 48 }}
							>
								Return to Dashboard
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

			{/* Exit Button - Top Right */}
			<div style={{ ...headerStyle, top: 16, right: 16 }}>
				<Button
					shape="circle"
					icon={<CloseOutlined />}
					onClick={() => router.push('/')}
					style={{ border: 'none', background: 'rgba(0,0,0,0.05)', width: 44, height: 44 }}
				/>
			</div>

			{/* Settings Button - Top Left */}
			<div style={{ ...headerStyle, top: 16, left: 16 }}>
				<Flex gap="small" align="center">
					<Button
						shape="circle"
						icon={<SettingOutlined />}
						onClick={() => setSettingsVisible(true)}
						style={{ border: 'none', background: 'rgba(0,0,0,0.05)', width: 44, height: 44 }}
					/>
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
						{dailyStats.dueCount > 0 ? `${dailyStats.dueCount} left` : 'Wait...'}
					</div>
				</Flex>
			</div>

			<Modal
				title="Learning Settings"
				open={settingsVisible}
				onCancel={() => setSettingsVisible(false)}
				footer={[
					<Button key="ok" type="primary" onClick={() => setSettingsVisible(false)}>
						Done
					</Button>,
				]}
				centered
			>
				<VocabSettings
					showFurigana={showFurigana}
					setShowFurigana={setShowFurigana}
					showRomaji={showRomaji}
					setShowRomaji={setShowRomaji}
					autoPlayAudio={autoPlayAudio}
					setAutoPlayAudio={setAutoPlayAudio}
				/>
			</Modal>

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
						paddingBottom: 150, // Increased bottom padding for larger RatingBar area
						paddingTop: 60, // Space for header buttons
					}}
				>
					<FlashCard
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
								Show Answer (Space)
							</Button>
						) : (
							<RatingBar onRate={handleRate} disabled={submitting} />
						)}
					</div>
				</div>
			</Content>
		</Layout>
	);
}
