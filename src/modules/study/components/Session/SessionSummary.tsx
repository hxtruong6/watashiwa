'use client';

import { StandardCard } from '@/modules/flashcard/types';
import { getDailyProgress } from '@/modules/study/study.actions';
import {
	CheckCircleOutlined,
	DashboardOutlined,
	PlayCircleOutlined,
	UnorderedListOutlined,
} from '@ant-design/icons';
import { Button, Card, Flex, Grid, Spin, Typography, theme } from 'antd';
import confetti from 'canvas-confetti';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { useSessionStore } from '../../store/useSessionStore';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function SessionSummary() {
	const { sessionStats } = useSessionStore();
	const { token } = theme.useToken();
	const t = useTranslations('Study');
	const router = useRouter();
	const screens = useBreakpoint();
	const isMobile = screens.xs || screens.sm;

	const { reviews, startTime, endTime, forgottenCards } = sessionStats;
	const [hasMoreCards, setHasMoreCards] = useState<boolean | null>(null);
	const [isCheckingCards, setIsCheckingCards] = useState(true);

	// Check if there are more cards available
	useEffect(() => {
		const checkMoreCards = async () => {
			try {
				const progress = await getDailyProgress();
				setHasMoreCards((progress?.dueCount || 0) > 0);
			} catch (error) {
				console.error('Failed to check for more cards:', error);
				setHasMoreCards(false);
			} finally {
				setIsCheckingCards(false);
			}
		};
		checkMoreCards();
	}, []);

	// Calculate Duration with better formatting
	const currentTime = Date.now();
	const durationMs = (endTime || currentTime) - (startTime || currentTime);
	const durationSec = Math.round(durationMs / 1000);
	const durationMin = Math.floor(durationSec / 60);
	const durationSecRemainder = durationSec % 60;

	// Format time: "19m 30s" or "45s" or "1h 5m"
	const formatDuration = () => {
		if (durationSec < 60) {
			return `${durationSec}s`;
		}
		if (durationMin < 60) {
			return durationSecRemainder > 0
				? `${durationMin}m ${durationSecRemainder}s`
				: `${durationMin}m`;
		}
		const hours = Math.floor(durationMin / 60);
		const minutes = durationMin % 60;
		return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
	};

	// Calculate total reviews
	const totalReviews = reviews[1] + reviews[2] + reviews[3] + reviews[4];
	const forgottenCount = forgottenCards.length;

	// Trigger Confetti on Mount
	useEffect(() => {
		const duration = 3000;
		const end = Date.now() + duration;

		const frame = () => {
			confetti({
				particleCount: 2,
				angle: 60,
				spread: 55,
				origin: { x: 0 },
			});
			confetti({
				particleCount: 2,
				angle: 120,
				spread: 55,
				origin: { x: 1 },
			});

			if (Date.now() < end) {
				requestAnimationFrame(frame);
			}
		};

		frame();
	}, []);

	return (
		<div
			style={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: isMobile ? '20px 16px' : '32px 24px',
				background: token.colorBgLayout,
			}}
		>
			<Flex
				vertical
				align="center"
				gap={isMobile ? 20 : 28}
				style={{
					maxWidth: isMobile ? '100%' : 'min(560px, 90vw)',
					width: '100%',
				}}
			>
				{/* Success Icon */}
				<CheckCircleOutlined
					style={{
						fontSize: isMobile ? 72 : 96,
						color: token.colorSuccess,
					}}
				/>

				{/* Title */}
				<Flex vertical align="center" gap={isMobile ? 6 : 8}>
					<Title
						level={isMobile ? 3 : 2}
						style={{
							margin: 0,
							textAlign: 'center',
							fontSize: isMobile ? 22 : 28,
							fontWeight: 600,
						}}
					>
						{t('summary.title')}
					</Title>
					<Text
						type="secondary"
						style={{
							fontSize: isMobile ? 13 : 15,
							textAlign: 'center',
							padding: '0 16px',
							lineHeight: 1.5,
						}}
					>
						{t('summary.subtitle')}
					</Text>
				</Flex>

				{/* Statistics Cards - Better Visual Hierarchy */}
				<Flex
					gap={isMobile ? 12 : 16}
					wrap="wrap"
					justify="center"
					style={{
						width: '100%',
						marginTop: isMobile ? 8 : 12,
					}}
				>
					{/* Total Reviews */}
					<Card
						size="small"
						style={{
							flex: isMobile ? '1 1 calc(50% - 6px)' : '0 1 auto',
							minWidth: isMobile ? 'calc(50% - 6px)' : 120,
							textAlign: 'center',
							borderRadius: token.borderRadiusLG,
							background: token.colorFillAlter,
						}}
						bodyStyle={{ padding: isMobile ? '16px 12px' : '20px 16px' }}
					>
						<Text
							type="secondary"
							style={{
								fontSize: isMobile ? 11 : 12,
								display: 'block',
								marginBottom: isMobile ? 6 : 8,
							}}
						>
							{t('summary.totalReviews')}
						</Text>
						<Text
							strong
							style={{
								fontSize: isMobile ? 28 : 32,
								lineHeight: 1,
								display: 'block',
								color: token.colorText,
							}}
						>
							{totalReviews}
						</Text>
					</Card>

					{/* Time */}
					<Card
						size="small"
						style={{
							flex: isMobile ? '1 1 calc(50% - 6px)' : '0 1 auto',
							minWidth: isMobile ? 'calc(50% - 6px)' : 120,
							textAlign: 'center',
							borderRadius: token.borderRadiusLG,
							background: token.colorFillAlter,
						}}
						bodyStyle={{ padding: isMobile ? '16px 12px' : '20px 16px' }}
					>
						<Text
							type="secondary"
							style={{
								fontSize: isMobile ? 11 : 12,
								display: 'block',
								marginBottom: isMobile ? 6 : 8,
							}}
						>
							{t('summary.time')}
						</Text>
						<Text
							strong
							style={{
								fontSize: isMobile ? 28 : 32,
								lineHeight: 1,
								display: 'block',
								color: token.colorText,
							}}
						>
							{formatDuration()}
						</Text>
					</Card>

					{/* New L1 */}
					<Card
						size="small"
						style={{
							flex: isMobile ? '1 1 calc(50% - 6px)' : '0 1 auto',
							minWidth: isMobile ? 'calc(50% - 6px)' : 120,
							textAlign: 'center',
							borderRadius: token.borderRadiusLG,
							background: token.colorFillAlter,
						}}
						bodyStyle={{ padding: isMobile ? '16px 12px' : '20px 16px' }}
					>
						<Text
							type="secondary"
							style={{
								fontSize: isMobile ? 11 : 12,
								display: 'block',
								marginBottom: isMobile ? 6 : 8,
							}}
						>
							{t('summary.newL1')}
						</Text>
						<Text
							strong
							style={{
								fontSize: isMobile ? 28 : 32,
								lineHeight: 1,
								display: 'block',
								color: token.colorError,
							}}
						>
							{reviews[1]}
						</Text>
					</Card>

					{/* Perfect L4 */}
					<Card
						size="small"
						style={{
							flex: isMobile ? '1 1 calc(50% - 6px)' : '0 1 auto',
							minWidth: isMobile ? 'calc(50% - 6px)' : 120,
							textAlign: 'center',
							borderRadius: token.borderRadiusLG,
							background: token.colorFillAlter,
						}}
						bodyStyle={{ padding: isMobile ? '16px 12px' : '20px 16px' }}
					>
						<Text
							type="secondary"
							style={{
								fontSize: isMobile ? 11 : 12,
								display: 'block',
								marginBottom: isMobile ? 6 : 8,
							}}
						>
							{t('summary.perfectL4')}
						</Text>
						<Text
							strong
							style={{
								fontSize: isMobile ? 28 : 32,
								lineHeight: 1,
								display: 'block',
								color: token.colorSuccess,
							}}
						>
							{reviews[4]}
						</Text>
					</Card>
				</Flex>

				{/* Action Buttons - Improved Hierarchy */}
				<Flex
					vertical
					gap={isMobile ? 10 : 12}
					style={{
						width: isMobile ? '100%' : 320,
						maxWidth: '100%',
						marginTop: isMobile ? 8 : 12,
					}}
				>
					{/* Primary Action: Continue Studying or Study Dashboard */}
					{isCheckingCards ? (
						<Button
							type="primary"
							size="large"
							block
							icon={<Spin size="small" />}
							disabled
							style={{
								height: isMobile ? 48 : 40,
								fontSize: isMobile ? 15 : 15,
								fontWeight: 600,
								borderRadius: 12,
							}}
						>
							{t('summary.loading')}
						</Button>
					) : hasMoreCards ? (
						<Button
							type="primary"
							size="large"
							icon={<PlayCircleOutlined />}
							block
							onClick={() => router.push('/study')}
							style={{
								height: isMobile ? 48 : 40,
								fontSize: isMobile ? 15 : 15,
								fontWeight: 600,
								borderRadius: 12,
							}}
						>
							{t('summary.continueStudying')}
						</Button>
					) : (
						<Button
							type="primary"
							size="large"
							icon={<DashboardOutlined />}
							block
							onClick={() => router.push('/study')}
							style={{
								height: isMobile ? 48 : 40,
								fontSize: isMobile ? 15 : 15,
								fontWeight: 600,
								borderRadius: 12,
							}}
						>
							{t('summary.studyDashboard')}
						</Button>
					)}

					{/* Secondary Actions */}
					<Flex gap={isMobile ? 8 : 10} style={{ width: '100%' }}>
						<Button
							size="large"
							icon={<DashboardOutlined />}
							block
							onClick={() => router.push('/dashboard')}
							style={{
								height: isMobile ? 48 : 40,
								fontSize: isMobile ? 14 : 14,
								borderRadius: 12,
								flex: 1,
							}}
						>
							{t('summary.dashboard')}
						</Button>
						<Button
							size="large"
							icon={<UnorderedListOutlined />}
							block
							onClick={() => router.push('/decks')}
							style={{
								height: isMobile ? 48 : 40,
								fontSize: isMobile ? 14 : 14,
								borderRadius: 12,
								flex: 1,
							}}
						>
							{t('summary.browseDecks')}
						</Button>
					</Flex>
				</Flex>

				{/* Forgotten Words Section */}
				{forgottenCount > 0 && (
					<Card
						style={{
							width: '100%',
							marginTop: isMobile ? 8 : 12,
							borderRadius: token.borderRadiusLG,
						}}
						bodyStyle={{ padding: isMobile ? '16px' : '20px' }}
					>
						<Flex vertical gap={isMobile ? 10 : 12}>
							<Text strong style={{ fontSize: isMobile ? 14 : 16, color: token.colorError }}>
								{t('summary.forgottenWordsTitle', { count: forgottenCount })}
							</Text>
							<Text
								type="secondary"
								style={{ fontSize: isMobile ? 12 : 13, marginBottom: isMobile ? 6 : 8 }}
							>
								{t('summary.forgottenWordsDescription')}
							</Text>
							<Flex
								vertical
								gap={isMobile ? 6 : 8}
								style={{
									maxHeight: isMobile ? 180 : 200,
									overflowY: 'auto',
									paddingRight: isMobile ? 4 : 8,
									// Better scrollbar on mobile
									WebkitOverflowScrolling: 'touch',
								}}
							>
								{forgottenCards.map((card, index) => {
									// Type guard: Check if card is StandardCard (BASIC variant)
									if (card.variant !== 'BASIC') {
										// For non-BASIC variants, use card ID as fallback
										return (
											<Flex
												key={card.id || index}
												justify="space-between"
												align="center"
												style={{
													padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 2.5vw, 12px)',
													background: token.colorBgContainer,
													borderRadius: token.borderRadius,
													border: `1px solid ${token.colorBorder}`,
												}}
											>
												<Flex vertical gap={isMobile ? 1 : 2}>
													<Text strong style={{ fontSize: isMobile ? 13 : 14 }}>
														{t('summary.cardNumber', { number: index + 1 })}
													</Text>
												</Flex>
											</Flex>
										);
									}

									// Type-safe extraction for StandardCard
									const standardCard = card as StandardCard;
									const vocab = standardCard.back.details;

									// Extract word surface: prefer front.hero (the kanji shown), fallback to vocab.wordSurface
									const wordSurface = standardCard.front.hero || vocab.wordSurface || 'Unknown';

									// Extract reading: use vocab.wordReading (Vocabulary type has wordReading, not kana)
									const reading = vocab.wordReading || '';

									// Extract meaning: meanings is Record<string, string[]> (e.g., {vi: ["đi"], en: ["to go"]})
									const meaning =
										vocab.meanings &&
										typeof vocab.meanings === 'object' &&
										!Array.isArray(vocab.meanings)
											? vocab.meanings.vi?.[0] || vocab.meanings.en?.[0] || ''
											: '';

									return (
										<Flex
											key={card.id || index}
											justify="space-between"
											align="center"
											style={{
												padding: isMobile ? '10px 12px' : '8px 12px',
												background: token.colorBgContainer,
												borderRadius: token.borderRadius,
												border: `1px solid ${token.colorBorder}`,
											}}
										>
											<Flex vertical gap={isMobile ? 1 : 2}>
												<Text strong style={{ fontSize: isMobile ? 13 : 14 }}>
													{wordSurface}
												</Text>
												{reading && (
													<Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>
														{reading}
													</Text>
												)}
												{meaning && (
													<Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>
														{meaning}
													</Text>
												)}
											</Flex>
										</Flex>
									);
								})}
							</Flex>
						</Flex>
					</Card>
				)}
			</Flex>
		</div>
	);
}
