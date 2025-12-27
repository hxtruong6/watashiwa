'use client';

import { RocketOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Typography, theme } from 'antd';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface StudyIntentChooserProps {
	dueCount: number;
	onDeckPickerOpen: () => void;
}

/**
 * 1-question Study Chooser: Quick 5 / Review due / Pick a deck
 * Zen-first, minimal decision point
 */
export default function StudyIntentChooser({
	dueCount,
	onDeckPickerOpen,
}: StudyIntentChooserProps) {
	const { token } = useToken();
	const t = useTranslations('Dashboard');
	const tForecast = useTranslations('Dashboard.SmartForecast');

	// Primary CTA: Start Review (goes to /study, auto-resumes/auto-starts)
	const handleStartReview = () => {
		// No-op, Link handles navigation
	};

	// Quick 5 mode
	const handleQuick5 = () => {
		// No-op, Link handles navigation
	};

	// Pick a deck
	const handlePickDeck = () => {
		onDeckPickerOpen();
	};

	// Guard against negative values
	const safeDueCount = Math.max(0, dueCount);

	if (safeDueCount > 0) {
		// Has due cards: Show primary CTA + optional chooser
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				style={{ marginBottom: 24 }}
			>
				<Card
					style={{
						borderRadius: 20,
						boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
						background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgContainer} 100%)`,
					}}
				>
					<Flex vertical gap="middle" align="center">
						{/* Primary CTA */}
						<Link
							href="/study"
							style={{
								display: 'block',
								width: '100%',
								maxWidth: 'min(360px, 100%)',
							}}
							aria-label={t('startReview')}
						>
							<motion.div
								whileHover={
									typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
										? { scale: 1.03 }
										: {}
								}
								whileTap={{ scale: 0.97 }}
								animate={{
									boxShadow: [
										`0 8px 24px ${token.colorPrimary}33`,
										`0 12px 32px ${token.colorPrimary}4d`,
										`0 8px 24px ${token.colorPrimary}33`,
									],
								}}
								transition={{ boxShadow: { repeat: Infinity, duration: 2 } }}
								style={{ borderRadius: 32 }}
							>
								<Button
									type="primary"
									size="large"
									block
									icon={<ThunderboltOutlined />}
									style={{
										height: 64,
										minHeight: 44,
										fontSize: 'clamp(1rem, 4vw, 1.25rem)',
										borderRadius: 32,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										gap: 12,
										fontWeight: 600,
									}}
									onClick={handleStartReview}
									aria-label={`${t('startReview')} - ${safeDueCount} ${t('dueCount', { count: safeDueCount })}`}
									onFocus={(e) => {
										e.currentTarget.style.outline = `2px solid ${token.colorPrimary}`;
										e.currentTarget.style.outlineOffset = '2px';
									}}
									onBlur={(e) => {
										e.currentTarget.style.outline = 'none';
									}}
								>
									{t('startReview')}{' '}
									<span style={{ opacity: 0.7, fontSize: 'clamp(0.875rem, 3.5vw, 1rem)' }}>
										({safeDueCount})
									</span>
								</Button>
							</motion.div>
						</Link>

						{/* Optional Chooser: Quick 5 or Pick Deck */}
						<Flex gap="small" wrap="wrap" style={{ width: '100%', maxWidth: 'min(360px, 100%)' }}>
							<Link href="/study?mode=quick" style={{ flex: '1 1 auto', minWidth: '120px' }}>
								<Button
									type="default"
									size="large"
									block
									icon={<RocketOutlined />}
									style={{
										borderRadius: 16,
										fontWeight: 500,
										minHeight: 44,
									}}
									onClick={handleQuick5}
									aria-label={tForecast('actionQuick')}
								>
									{tForecast('actionQuick')}
								</Button>
							</Link>
							<Button
								type="default"
								size="large"
								block
								style={{
									borderRadius: 16,
									fontWeight: 500,
									minHeight: 44,
									flex: '1 1 auto',
									minWidth: '120px',
								}}
								onClick={handlePickDeck}
								aria-label={t('viewDecks')}
							>
								{t('viewDecks')}
							</Button>
						</Flex>
					</Flex>
				</Card>
			</motion.div>
		);
	}

	// No due cards: Show "All caught up" + optional actions
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.1 }}
			whileHover={{ y: -4 }}
			style={{ marginBottom: 24 }}
		>
			<Card
				style={{
					borderRadius: 24,
					textAlign: 'center',
					boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
					border: 'none',
				}}
			>
				<Flex vertical align="center" gap="middle" style={{ padding: 16 }}>
					<Text
						style={{
							fontSize: 48,
							color: token.colorSuccess,
							marginBottom: 8,
						}}
					>
						✓
					</Text>
					<div>
						<Text strong style={{ fontSize: 18, display: 'block', marginBottom: 8 }}>
							{t('allCaughtUp')}
						</Text>
						<Text type="secondary">{t('allCaughtUpSubtitle')}</Text>
					</div>
					<Flex gap="small" wrap="wrap" style={{ width: '100%', maxWidth: 'min(360px, 100%)' }}>
						<Link href="/decks" style={{ flex: '1 1 auto', minWidth: '120px' }}>
							<Button size="large" type="primary" block style={{ minHeight: 44 }}>
								{t('browseDecks')}
							</Button>
						</Link>
						<Button
							size="large"
							type="default"
							block
							onClick={handlePickDeck}
							style={{ flex: '1 1 auto', minWidth: '120px', minHeight: 44 }}
							aria-label={t('viewDecks')}
						>
							{t('viewDecks')}
						</Button>
					</Flex>
				</Flex>
			</Card>
		</motion.div>
	);
}
