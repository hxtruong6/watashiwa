'use client';

import { useUIStore } from '@/modules/ui/store/useUIStore';
import {
	CheckCircleFilled,
	FireFilled,
	PlayCircleFilled,
	RightOutlined,
	TrophyOutlined,
} from '@ant-design/icons';
import { Button, Card, Flex, GlobalToken, Grid, Typography, theme } from 'antd';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const { Title, Text } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

const MotionCard = motion(Card);

interface DeckStats {
	dueCount: number;
	totalCards: number;
	masteredCount: number;
}

interface Deck {
	id: string;
	title: string;
	learningStats?: DeckStats | null;
}

interface DashboardStats {
	due: number;
	new: number;
	streak: number;
	accuracy: number;
	focusPoints: number;
}

interface StudyDashboardProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	user: any;
	stats: DashboardStats;
	recentDecks: Deck[];
}

// --- SUB-COMPONENTS (Extracted) ---

const StatPill = ({
	icon,
	value,
	label,
	color,
	token,
}: {
	icon: React.ReactNode;
	value: string | number;
	label: string;
	color: string;
	token: GlobalToken;
}) => (
	<div
		style={{
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			padding: '12px',
			background: token.colorFillQuaternary,
			borderRadius: 16,
			flex: 1,
		}}
	>
		<div style={{ color, fontSize: 20, marginBottom: 4 }}>{icon}</div>
		<Text strong style={{ fontSize: 18, lineHeight: 1 }}>
			{value}
		</Text>
		<Text type="secondary" style={{ fontSize: 11 }}>
			{label}
		</Text>
	</div>
);

const DeckItem = ({
	deck,
	color,
	token,
	router,
	t,
}: {
	deck: Deck;
	color: string;
	token: GlobalToken;
	router: AppRouterInstance;
	t: ReturnType<typeof useTranslations<'Dashboard'>>;
}) => {
	const due = deck.learningStats?.dueCount || 0;

	return (
		<MotionCard
			whileHover={{ y: -4 }}
			style={{
				background: token.colorFillTertiary, // Theme-aware glassy feel
				border: `1px solid ${token.colorBorderSecondary}`,
				borderRadius: 16,
				cursor: 'pointer',
				marginTop: 8,
			}}
			styles={{ body: { padding: '16px' } }}
			onClick={() => router.push(`/study?deckId=${deck.id}`)}
		>
			<Flex justify="space-between" align="center">
				<Flex gap="middle" align="center">
					<div
						style={{
							width: 44,
							height: 44,
							borderRadius: 12,
							background: `color-mix(in srgb, ${color} 15%, transparent)`, // Subtle bg
							border: `1px solid ${color}`, // Mastery Ring hint
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: color,
							fontWeight: 'bold',
							fontSize: 18,
						}}
					>
						{deck.title.charAt(0)}
					</div>
					<Flex vertical gap={2}>
						<Text strong>{deck.title}</Text>
						<Text type="secondary" style={{ fontSize: 12 }}>
							{due > 0 ? (
								<span style={{ color: token.colorWarning }}>
									{t('dueForReview', { count: due })}
								</span>
							) : (
								<span style={{ color: token.colorSuccess }}>{t('allCaughtUpDeck')}</span>
							)}
						</Text>
					</Flex>
				</Flex>
				<Button shape="circle" icon={<RightOutlined />} type="text" />
			</Flex>
		</MotionCard>
	);
};

export default function StudyDashboard({ user, stats, recentDecks }: StudyDashboardProps) {
	const router = useRouter();
	const t = useTranslations('Dashboard');
	const { token } = useToken();
	const screens = useBreakpoint();
	const isMobile = screens.xs;
	const { setNavBarVisible } = useUIStore();

	// Ensure navbar is visible on dashboard
	useEffect(() => {
		setNavBarVisible(true);
	}, [setNavBarVisible]);

	// --- COLORS FOR DECKS ---
	const deckColors = ['#FF6B6B', '#4ECDC4', '#FFE66D'];

	return (
		<div
			style={{
				padding: isMobile ? '24px 16px' : '40px',
				maxWidth: 800,
				margin: '0 auto',
				minHeight: '100vh',
			}}
		>
			{/* 1. HEADER: The Personal Hook */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<Flex justify="space-between" align="end" style={{ marginBottom: 32 }}>
					<div>
						<Text type="secondary" style={{ fontSize: 14 }}>
							{new Date().toLocaleDateString('en-US', {
								weekday: 'long',
								month: 'long',
								day: 'numeric',
							})}
						</Text>
						<Title level={isMobile ? 2 : 1} style={{ margin: 0, marginTop: 4 }}>
							{stats.due > 0 ? t('readyToFocus') : t('allClean')}
						</Title>
						<Text type="secondary">
							{stats.due > 0 ? (
								<>
									{t('reviewIntro', {
										count: stats.due,
									})
										.split('<bold>')
										.map((part, i) => {
											if (part.includes('</bold>')) {
												const [boldText, rest] = part.split('</bold>');
												return (
													<React.Fragment key={i}>
														<Text strong>{boldText}</Text>
														{rest}
													</React.Fragment>
												);
											}
											return <React.Fragment key={i}>{part}</React.Fragment>;
										})}
								</>
							) : (
								t('reviewComplete')
							)}
						</Text>
					</div>
					{!isMobile && (
						<div style={{ textAlign: 'right' }}>
							<Flex gap={4} align="center" justify="end">
								<FireFilled style={{ color: token.colorWarning, fontSize: 20 }} />
								<Title level={3} style={{ margin: 0 }}>
									{stats.streak}
								</Title>
							</Flex>
							<Text type="secondary">{t('dayStreak')}</Text>
						</div>
					)}
				</Flex>
			</motion.div>

			{/* 2. MAIN ACTION: The "Flow State" Button */}
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 0.1, duration: 0.5 }}
			>
				{stats.due > 0 ? (
					<Card
						style={{
							background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
							border: 'none',
							borderRadius: 24,
							boxShadow: `0 20px 40px -10px ${token.colorPrimaryActive}55`,
							marginBottom: 32,
							overflow: 'hidden',
						}}
						styles={{ body: { padding: isMobile ? 24 : 40 } }}
					>
						{/* Background Decorative Icon */}
						<div
							style={{
								position: 'absolute',
								top: -20,
								right: -20,
								fontSize: 200,
								opacity: 0.15,
								color: token.colorWhite,
								rotate: '15deg',
								pointerEvents: 'none',
							}}
						>
							<PlayCircleFilled />
						</div>

						<Flex justify="space-between" align="center" wrap="wrap" gap="large">
							<div style={{ position: 'relative', zIndex: 1 }}>
								<Title level={3} style={{ color: token.colorWhite, margin: 0, marginBottom: 8 }}>
									{t('dailyReview')}
								</Title>
								<Text
									style={{
										color: token.colorWhite,
										opacity: 0.9,
										display: 'block',
										marginBottom: 24,
									}}
								>
									{t('brainPrimed', { count: stats.due })}
								</Text>
								<Button
									size="large"
									style={{
										height: 48,
										padding: '0 32px',
										borderRadius: 24,
										border: 'none',
										fontWeight: 600,
										fontSize: 16,
										color: token.colorPrimary,
										boxShadow: `0 4px 12px ${token.colorText}33`,
									}}
									onClick={() => {
										if (recentDecks.length > 0 && recentDecks[0]?.id) {
											router.push(`/study?deckId=${recentDecks[0].id}`);
										} else {
											router.push('/dashboard/decks');
										}
									}}
								>
									{t('startSession')}
								</Button>
							</div>

							{/* Simple Progress Visualization */}
							<div style={{ position: 'relative', zIndex: 1, minWidth: 120 }}>
								<Flex vertical align="center" gap={8}>
									<div
										style={{
											width: 80,
											height: 80,
											borderRadius: '50%',
											border: `6px solid ${token.colorWhite}`,
											opacity: 0.3,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											position: 'relative',
										}}
									>
										<div
											style={{
												position: 'absolute',
												inset: -6,
												borderRadius: '50%',
												border: `6px solid ${token.colorWhite}`,
												borderRightColor: 'transparent',
												borderBottomColor: 'transparent',
												transform: 'rotate(45deg)',
											}}
										/>
										<span style={{ fontSize: 24, fontWeight: 'bold', color: token.colorWhite }}>
											{stats.accuracy}%
										</span>
									</div>
									<Text style={{ color: token.colorWhite, opacity: 0.9 }}>{t('accuracy')}</Text>
								</Flex>
							</div>
						</Flex>
					</Card>
				) : (
					/* ZERO STATE CARD */
					<Card
						style={{
							background: `linear-gradient(135deg, ${token.colorSuccess} 0%, ${token.colorSuccessActive} 100%)`,
							border: 'none',
							borderRadius: 24,
							boxShadow: `0 20px 40px -10px ${token.colorSuccess}55`,
							marginBottom: 32,
							overflow: 'hidden',
						}}
						styles={{ body: { padding: isMobile ? 24 : 40 } }}
					>
						<div
							style={{
								position: 'absolute',
								top: -30,
								right: -30,
								fontSize: 220,
								opacity: 0.15,
								color: token.colorWhite, // Use token
								rotate: '-15deg',
								pointerEvents: 'none',
							}}
						>
							<CheckCircleFilled />
						</div>

						<Flex justify="space-between" align="center" wrap="wrap" gap="large">
							<div style={{ position: 'relative', zIndex: 1 }}>
								<Title
									level={3}
									style={{ color: token.colorWhite, margin: 0, marginBottom: 8 }} // Use token
								>
									{t('allCaughtUp')}
								</Title>
								<Text
									style={{
										color: token.colorWhite,
										opacity: 0.9,
										display: 'block',
										marginBottom: 24,
									}}
								>
									{t('allCaughtUpSubtitle')}
								</Text>
								<Button
									size="large"
									ghost
									style={{
										height: 48,
										padding: '0 32px',
										borderRadius: 24,
										fontWeight: 600,
										fontSize: 16,
										color: token.colorWhite,
										borderColor: token.colorWhite,
										boxShadow: `0 4px 12px ${token.colorText}1A`,
									}}
									onClick={() => router.push('/dashboard/decks')}
								>
									{t('browseDecks')}
								</Button>
							</div>

							<div style={{ position: 'relative', zIndex: 1, minWidth: 120 }}>
								<TrophyOutlined style={{ fontSize: 80, color: token.colorWhite, opacity: 0.8 }} />
							</div>
						</Flex>
					</Card>
				)}
			</motion.div>

			{/* 3. QUICK STATS (Mobile Streak is here) */}
			{isMobile && (
				<Flex gap="small" style={{ marginBottom: 32 }}>
					<StatPill
						icon={<FireFilled />}
						value={stats.streak}
						label={t('dayStreak')}
						color={token.colorWarning}
						token={token}
					/>
					<StatPill
						icon={<TrophyOutlined />}
						value={stats.focusPoints}
						label={t('focusGained')}
						color={token.colorSuccess}
						token={token}
					/>
				</Flex>
			)}

			{/* 4. RECENT DECKS */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2, duration: 0.5 }}
			>
				<Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
					<Title level={4} style={{ margin: 0 }}>
						{t('recentDecks')}
					</Title>
					<Button type="link" size="small" onClick={() => router.push('/dashboard/decks')}>
						{t('viewAll')}
					</Button>
				</Flex>

				{recentDecks.length > 0 ? (
					recentDecks.map((deck, index) => (
						<DeckItem
							key={deck.id}
							deck={deck}
							color={deckColors[index % deckColors.length]}
							token={token}
							router={router}
							t={t}
						/>
					))
				) : (
					<div
						style={{
							padding: 32,
							textAlign: 'center',
							background: token.colorFillQuaternary,
							borderRadius: 16,
						}}
					>
						<Text type="secondary">{t('noRecentActivity')}</Text>
					</div>
				)}
			</motion.div>
		</div>
	);
}
