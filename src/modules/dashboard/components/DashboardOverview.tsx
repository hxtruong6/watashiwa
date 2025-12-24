'use client';

import {
	DonationButton,
	DueCTA,
	GlobalLeaderboard,
	HeroSection,
	MatchaWisdomWidget,
	MyContributions,
	MyDecks,
	NextReviewWidget,
	QuickActions,
	StatsGrid,
	TrendingTips,
	WeeklyChart,
} from '@/components/dashboard';
import StudySettings from '@/modules/study/components/StudySettings';
import type { User } from '@prisma/client';
import { Divider, Drawer, theme } from 'antd';
import confetti from 'canvas-confetti';
import { Variants, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const { useToken } = theme;

interface WeeklyStatsData {
	days: { day: string; count: number; isToday?: boolean }[];
	thisWeekTotal: number;
	bestDay: { day: string; count: number };
}

interface DeckWithStats {
	id: string;
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
}

/**
 * Main Dashboard component using modular sub-components
 */
export default function DashboardOverview({
	reviewCount,
	stats,
	weeklyStats,
	decks = [],
	userName,
	dailyGoal,
	userRole,
	leaderboard = [],
	userId,
	userSettings,
	forecast,
}: DashboardOverviewProps) {
	const { token } = useToken();
	const [hasShownConfetti] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const router = useRouter();

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
			// setHasShownConfetti(true);
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
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 16px 80px', position: 'relative' }} // Reduced top padding, added bottom for nav
		>
			{/* Hero: Greeting + Streak + Daily Goal */}
			<HeroSection
				userName={userName}
				streak={stats.streak}
				dailyProgress={stats.totalReviewed}
				dailyGoal={dailyGoal}
			/>
			{/* Primary CTA: Start Review */}
			<motion.div variants={itemVariants}>
				<DueCTA dueCount={reviewCount} />
			</motion.div>

			{/* Forecast Widget */}
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

			{/* Ambient: Matcha Wisdom */}
			<MatchaWisdomWidget />

			{/* Weekly Progress Chart */}
			{weeklyStats && (
				<motion.div variants={itemVariants}>
					<WeeklyChart
						data={weeklyStats.days}
						thisWeekTotal={weeklyStats.thisWeekTotal}
						bestDay={weeklyStats.bestDay}
					/>
				</motion.div>
			)}

			{/* Stats Grid */}
			<motion.div variants={itemVariants}>
				<StatsGrid streak={stats.streak} reviewedToday={stats.totalReviewed} />
			</motion.div>

			{/* Global Leaderboard */}
			<motion.div variants={itemVariants} style={{ marginTop: 24 }}>
				<GlobalLeaderboard users={leaderboard} currentUserId={userId} />
			</motion.div>

			{/* Your Top Tips (Small section under progress) */}
			<motion.div variants={itemVariants}>
				<MyContributions />
			</motion.div>

			{/* Quick Actions */}
			<motion.div variants={itemVariants}>
				<QuickActions />
			</motion.div>

			{/* My Decks */}
			<motion.div variants={itemVariants}>
				<MyDecks decks={decks} />
			</motion.div>

			{/* Community Highlights (Trending) - Bottom of page */}
			<motion.div variants={itemVariants}>
				<Divider />
				<TrendingTips />
			</motion.div>

			{/* Admin Button */}
			{(userRole === 'ADMIN' || userRole === 'MODERATOR') && (
				<motion.div variants={itemVariants} style={{ marginTop: 24, textAlign: 'center' }}>
					<Link
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
						Go to Admin Panel
					</Link>
				</motion.div>
			)}

			{/* Donation Button */}
			<motion.div variants={itemVariants}>
				<DonationButton />
			</motion.div>

			{/* Settings Drawer */}
			<Drawer
				title="Settings"
				placement="right"
				onClose={() => setIsSettingsOpen(false)}
				open={isSettingsOpen}
				size="default"
			>
				<StudySettings
					showFurigana={true} // Default or fetched if global state
					setShowFurigana={() => {}} // Placeholder if not strictly needed here or create local state if user wants preview
					showRomaji={false}
					setShowRomaji={() => {}}
					autoPlayAudio="answer"
					setAutoPlayAudio={() => {}}
					userSettings={userSettings || null}
					onSettingsChange={() => {
						router.refresh();
						// Optional: keep open or close
					}}
				/>
			</Drawer>
		</motion.div>
	);
}
