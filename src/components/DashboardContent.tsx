'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, Variants } from 'motion/react';
import {
	HeroSection,
	DueCTA,
	StatsGrid,
	WeeklyChart,
	QuickActions,
	MyDecks,
	TrendingTips,
	MyContributions,
	DonationButton,
	GlobalLeaderboard,
} from '@/components/dashboard';
import { Divider } from 'antd';

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

interface DashboardContentProps {
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
	leaderboard?: any[]; // Added
	userId?: string; // Added
}

/**
 * Main Dashboard component using modular sub-components
 */
export default function DashboardContent({
	reviewCount,
	stats,
	weeklyStats,
	decks = [],
	userName,
	dailyGoal,
	userRole,
	leaderboard = [], // Added
	userId, // Added
}: DashboardContentProps) {
	const [hasShownConfetti] = useState(false);

	// Trigger confetti when daily goal is reached
	const isGoalComplete = stats.totalReviewed >= dailyGoal;

	useEffect(() => {
		if (isGoalComplete && !hasShownConfetti) {
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.3 },
				colors: ['#708238', '#1E3A5F', '#FAAD14'],
			});
			// setHasShownConfetti(true);
		}
	}, [isGoalComplete, hasShownConfetti]);

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
			style={{ maxWidth: 1000, margin: '0 auto', padding: '30px 16px' }}
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
					<a
						href="/admin"
						style={{
							display: 'inline-block',
							padding: '12px 24px',
							background: '#1E3A5F',
							color: 'white',
							borderRadius: 12,
							fontWeight: 600,
							textDecoration: 'none',
							boxShadow: '0 4px 12px rgba(30, 58, 95, 0.2)',
						}}
					>
						Go to Admin Panel
					</a>
				</motion.div>
			)}

			{/* Donation Button */}
			<motion.div variants={itemVariants}>
				<DonationButton />
			</motion.div>
		</motion.div>
	);
}
