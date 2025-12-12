'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import {
	HeroSection,
	DueCTA,
	StatsGrid,
	WeeklyChart,
	QuickActions,
	MyDecks,
} from '@/components/dashboard';

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
}: DashboardContentProps) {
	const [hasShownConfetti, setHasShownConfetti] = useState(false);

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

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}
		>
			{/* Hero: Greeting + Streak + Daily Goal */}
			<HeroSection
				userName={userName}
				streak={stats.streak}
				dailyProgress={stats.totalReviewed}
				dailyGoal={dailyGoal}
			/>

			{/* Primary CTA: Start Review */}
			<DueCTA dueCount={reviewCount} />

			{/* Weekly Progress Chart */}
			{weeklyStats && (
				<WeeklyChart
					data={weeklyStats.days}
					thisWeekTotal={weeklyStats.thisWeekTotal}
					bestDay={weeklyStats.bestDay}
				/>
			)}

			{/* Stats Grid */}
			<StatsGrid streak={stats.streak} reviewedToday={stats.totalReviewed} />

			{/* Quick Actions */}
			<QuickActions />

			{/* My Decks */}
			<MyDecks decks={decks} />
		</motion.div>
	);
}
