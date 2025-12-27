'use client';

import { StandardCard } from '@/modules/flashcard/types';
import { CheckCircleOutlined, DashboardOutlined } from '@ant-design/icons';
import { Button, Flex, Grid, Typography, theme } from 'antd';
import confetti from 'canvas-confetti';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { useEffect } from 'react';

import { useSessionStore } from '../../store/useSessionStore';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function SessionSummary() {
	const { sessionStats } = useSessionStore();
	const { token } = theme.useToken();
	const t = useTranslations('Study');
	const screens = useBreakpoint();
	const isMobile = screens.xs || screens.sm;

	const { reviews, startTime, endTime, forgottenCards } = sessionStats;

	// Calculate Duration
	// eslint-disable-next-line react-hooks/purity
	const currentTime = Date.now();
	const durationMs = (endTime || currentTime) - (startTime || currentTime);
	const durationSec = Math.round(durationMs / 1000);
	const durationMin = Math.floor(durationSec / 60);

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
				padding: isMobile ? '24px 16px' : '40px 24px',
				background: token.colorBgLayout,
			}}
		>
			<Flex
				vertical
				align="center"
				gap={isMobile ? 24 : 32}
				style={{
					maxWidth: isMobile ? '100%' : 'min(500px, 90vw)',
					width: '100%',
				}}
			>
				{/* Success Icon */}
				<CheckCircleOutlined
					style={{
						fontSize: isMobile ? 80 : 120,
						color: token.colorSuccess, // Uses theme token for dark mode support
					}}
				/>

				{/* Title */}
				<Flex vertical align="center" gap={isMobile ? 6 : 8}>
					<Title
						level={isMobile ? 3 : 2}
						style={{ margin: 0, textAlign: 'center', fontSize: isMobile ? 24 : 32 }}
					>
						{t('summary.title')}
					</Title>
					<Text
						type="secondary"
						style={{ fontSize: isMobile ? 14 : 16, textAlign: 'center', padding: '0 16px' }}
					>
						{t('summary.subtitle')}
					</Text>
				</Flex>

				{/* Action Buttons */}
				<Flex
					vertical
					gap={isMobile ? 10 : 12}
					style={{ width: '100%', maxWidth: isMobile ? '100%' : 300 }}
				>
					<Link href="/dashboard" prefetch={true}>
						<Button
							type="primary"
							size="large"
							icon={<DashboardOutlined />}
							block
							style={{
								height: isMobile ? 52 : 56, // Better touch target on mobile (min 44px recommended)
								fontSize: isMobile ? 16 : 18,
								fontWeight: 600,
								borderRadius: 12,
							}}
						>
							{t('summary.dashboard')}
						</Button>
					</Link>
					<Link href="/decks" prefetch={true}>
						<Button
							size="large"
							block
							style={{
								height: isMobile ? 52 : 56, // Better touch target on mobile
								fontSize: isMobile ? 16 : 18,
								fontWeight: 600,
								borderRadius: 12,
							}}
						>
							{t('summary.browseDecks')}
						</Button>
					</Link>
				</Flex>

				{/* Statistics */}
				<Flex
					gap={isMobile ? 16 : 24}
					wrap="wrap"
					justify="center"
					style={{
						marginTop: isMobile ? 20 : 24,
						width: '100%',
					}}
				>
					<Flex
						vertical
						align="center"
						gap={isMobile ? 3 : 4}
						style={{ minWidth: isMobile ? '45%' : 'auto' }}
					>
						<Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>
							{t('summary.totalReviews')}
						</Text>
						<Text strong style={{ fontSize: isMobile ? 28 : 32, lineHeight: 1 }}>
							{totalReviews}
						</Text>
					</Flex>
					<Flex
						vertical
						align="center"
						gap={isMobile ? 3 : 4}
						style={{ minWidth: isMobile ? '45%' : 'auto' }}
					>
						<Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>
							{t('summary.time')}
						</Text>
						<Text strong style={{ fontSize: isMobile ? 28 : 32, lineHeight: 1 }}>
							{durationSec > 60 ? `${durationMin}m` : `${durationSec}s`}
						</Text>
					</Flex>
					<Flex
						vertical
						align="center"
						gap={isMobile ? 3 : 4}
						style={{ minWidth: isMobile ? '45%' : 'auto' }}
					>
						<Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>
							{t('summary.newL1')}
						</Text>
						<Text
							strong
							style={{ fontSize: isMobile ? 28 : 32, lineHeight: 1, color: token.colorError }}
						>
							{reviews[1]}
						</Text>
					</Flex>
					<Flex
						vertical
						align="center"
						gap={isMobile ? 3 : 4}
						style={{ minWidth: isMobile ? '45%' : 'auto' }}
					>
						<Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>
							{t('summary.perfectL4')}
						</Text>
						<Text
							strong
							style={{
								fontSize: isMobile ? 28 : 32,
								lineHeight: 1,
								color: token.colorSuccess,
							}}
						>
							{reviews[4]}
						</Text>
					</Flex>
				</Flex>

				{/* Forgotten Words Section */}
				{forgottenCount > 0 && (
					<Flex
						vertical
						gap={isMobile ? 10 : 12}
						style={{
							width: '100%',
							maxWidth: isMobile ? '100%' : 400,
							marginTop: isMobile ? 12 : 16,
							padding: isMobile ? '16px' : '20px',
							background: token.colorFillAlter,
							borderRadius: token.borderRadiusLG,
							border: `1px solid ${token.colorBorderSecondary}`,
						}}
					>
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
				)}
			</Flex>
		</div>
	);
}
