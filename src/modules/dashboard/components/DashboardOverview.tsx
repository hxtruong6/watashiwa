'use client';

import { OAuthCacheUpdater } from '@/modules/auth/components/OAuthCacheUpdater';
import StudySettings from '@/modules/study/components/Session/StudySettings';
import type { User } from '@prisma/client';
import { Drawer, theme } from 'antd';
import confetti from 'canvas-confetti';
import { Variants, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import DashboardDailyRitual from './home/DashboardDailyRitual';
import DeckPickerDrawer from './home/DeckPickerDrawer';
import MatchaWisdomWidget from './home/MatchaWisdomWidget';
import MyDecks from './home/MyDecks';
import NextReviewWidget from './home/NextReviewWidget';
import StudyIntentChooser from './home/StudyIntentChooser';
import WeeklyChart from './home/WeeklyChart';
import { MemoryGardenHero } from './memory-garden';
import type { MemoryGardenData } from './memory-garden';

const { useToken } = theme;

interface WeeklyStatsData {
	days: { day: string; count: number; isToday?: boolean }[];
	thisWeekTotal: number;
	bestDay: { day: string; count: number };
}

interface DeckWithStats {
	id: string;
	slug: string;
	title: string;
	cardCount: number;
	dueCount: number;
}

interface DashboardOverviewProps {
	reviewCount: number;
	stats: {
		streak: number;
		totalReviewed: number;
	};
	weeklyStats?: WeeklyStatsData | null;
	decks?: DeckWithStats[];
	userName?: string | null;
	dailyGoal: number;
	userRole?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	leaderboard?: any[];
	userId?: string;
	userSettings?: Partial<User> | null;
	forecast?: {
		nextReview: Date | null;
		urgentCard: { surface: string; meaning: string } | null;
		forecastCount: number;
	};
	memoryGarden?: MemoryGardenData | null;
}

/**
 * Main Dashboard component - Zen-first, study-start optimized
 * Layout: Daily Ritual → Study Intent → NextReviewWidget → MatchaWisdom → Weekly → Decks
 */
export default function DashboardOverview({
	reviewCount,
	stats,
	weeklyStats,
	decks = [],
	userName,
	dailyGoal,
	userRole,
	userSettings,
	forecast,
	memoryGarden,
}: DashboardOverviewProps) {
	const { token } = useToken();
	const t = useTranslations('Dashboard');
	const router = useRouter();
	const searchParams = useSearchParams();
	const [hasShownConfetti] = useState(false);
	// Initialize settings open state from URL param
	const [isSettingsOpen, setIsSettingsOpen] = useState(() => {
		if (typeof window === 'undefined') return false;
		return searchParams?.get('settings') === 'true';
	});
	const [isDeckPickerOpen, setIsDeckPickerOpen] = useState(false);
	const isInitialMount = useRef(true);

	// Sync settings state with URL param changes (after initial mount)
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}
		const settingsParam = searchParams?.get('settings');
		const shouldBeOpen = settingsParam === 'true';
		// Use setTimeout to defer state update and avoid synchronous setState warning
		const timeoutId = setTimeout(() => {
			setIsSettingsOpen(shouldBeOpen);
		}, 0);
		return () => clearTimeout(timeoutId);
	}, [searchParams]);

	// Close settings and clear URL param
	const handleSettingsClose = () => {
		setIsSettingsOpen(false);
		router.replace('/dashboard');
	};

	// Trigger confetti when daily goal is reached
	const isGoalComplete = stats.totalReviewed >= dailyGoal;

	useEffect(() => {
		if (isGoalComplete && !hasShownConfetti) {
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.3 },
				colors: [token.colorSuccess, token.colorPrimary, token.colorWarning],
			});
		}
	}, [
		isGoalComplete,
		hasShownConfetti,
		token.colorSuccess,
		token.colorPrimary,
		token.colorWarning,
	]);

	// Animation variants
	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.1,
			},
		},
	};

	const itemVariants: Variants = {
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				type: 'spring',
				stiffness: 50,
				damping: 20,
			},
		},
	};

	return (
		<>
			<OAuthCacheUpdater />
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				style={{
					maxWidth: 1000,
					margin: '0 auto',
					padding: '20px 16px 80px',
					position: 'relative',
				}}
			>
				{/* Section A: Daily Ritual (Above the fold) */}
				<motion.div variants={itemVariants}>
					<DashboardDailyRitual
						userName={userName}
						streak={stats.streak}
						dailyProgress={stats.totalReviewed}
						dailyGoal={dailyGoal}
					/>
				</motion.div>

				{/* Section A.5: Memory Garden Hero (Morning Reflection) */}
				{memoryGarden && (
					<motion.div variants={itemVariants}>
						<MemoryGardenHero data={memoryGarden} />
					</motion.div>
				)}

				{/* Section B: Study Intent Chooser (Primary CTA) */}
				<motion.div variants={itemVariants}>
					<StudyIntentChooser
						dueCount={reviewCount}
						onDeckPickerOpen={() => setIsDeckPickerOpen(true)}
					/>
				</motion.div>

				{/* Section C: NextReviewWidget (Smart Coach) */}
				{forecast && (
					<motion.div variants={itemVariants}>
						<NextReviewWidget
							nextReview={forecast.nextReview}
							urgentCard={forecast.urgentCard}
							forecastCount={forecast.forecastCount}
							streak={stats.streak}
							reviewedToday={stats.totalReviewed}
						/>
					</motion.div>
				)}

				{/* Section D: MatchaWisdomWidget (Zen micro-dose) */}
				<motion.div variants={itemVariants}>
					<MatchaWisdomWidget />
				</motion.div>

				{/* Section E: Weekly Progress (if data exists) */}
				{weeklyStats && (
					<motion.div variants={itemVariants}>
						<WeeklyChart
							data={weeklyStats.days}
							thisWeekTotal={weeklyStats.thisWeekTotal}
							bestDay={weeklyStats.bestDay}
						/>
					</motion.div>
				)}

				{/* Section F: My Decks (Actionable, top due first) */}
				{decks.length > 0 && (
					<motion.div variants={itemVariants}>
						<MyDecks decks={decks} />
					</motion.div>
				)}

				{/* Admin Button */}
				{(userRole === 'ADMIN' || userRole === 'MODERATOR') && (
					<motion.div variants={itemVariants} style={{ marginTop: 24, textAlign: 'center' }}>
						<a
							href="/admin"
							style={{
								display: 'inline-block',
								padding: '12px 24px',
								background: token.colorPrimary,
								color: 'white',
								borderRadius: 12,
								fontWeight: 600,
								textDecoration: 'none',
								boxShadow: '0 4px 12px rgba(30, 58, 95, 0.2)',
							}}
						>
							{t('goToAdminPanel')}
						</a>
					</motion.div>
				)}

				{/* Deck Picker Drawer */}
				<DeckPickerDrawer
					open={isDeckPickerOpen}
					onClose={() => setIsDeckPickerOpen(false)}
					decks={decks}
				/>

				{/* Settings Drawer */}
				<Drawer
					title="Settings"
					placement="right"
					onClose={handleSettingsClose}
					open={isSettingsOpen}
					size="default"
				>
					<StudySettings
						userSettings={userSettings || null}
						onSettingsChange={() => {
							router.refresh();
						}}
					/>
				</Drawer>
			</motion.div>
		</>
	);
}
