'use client';

import { FireOutlined } from '@ant-design/icons';
import { Card, Flex, Progress, Typography, theme } from 'antd';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import React from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface DashboardDailyRitualProps {
	userName?: string | null;
	streak: number;
	dailyProgress: number;
	dailyGoal: number;
}

/**
 * Daily Ritual: Greeting + Streak + Daily Goal Progress
 * Zen-first, minimal, above-the-fold
 */
export default function DashboardDailyRitual({
	userName,
	streak,
	dailyProgress,
	dailyGoal,
}: DashboardDailyRitualProps) {
	const { token } = useToken();
	const t = useTranslations('Dashboard');

	// Get time-based greeting
	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return t('greetingMorning');
		if (hour < 18) return t('greetingAfternoon');
		return t('greetingEvening');
	};

	// Guard against division by zero and negative values
	const safeDailyGoal = Math.max(1, dailyGoal);
	const safeDailyProgress = Math.max(0, dailyProgress);
	const progressPercent = Math.min(Math.round((safeDailyProgress / safeDailyGoal) * 100), 100);
	const isGoalComplete = safeDailyProgress >= safeDailyGoal;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			style={{ marginBottom: 24 }}
		>
			<Card
				variant="borderless"
				style={{
					borderRadius: 20,
					boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
					background: token.colorBgContainer,
				}}
			>
				<Flex
					vertical
					align="center"
					justify="center"
					style={{ textAlign: 'center', padding: '8px 0' }}
				>
					{/* Personalized Greeting */}
					<Text type="secondary" style={{ fontSize: 'clamp(14px, 4vw, 16px)', marginBottom: 12 }}>
						{getGreeting()}
						{userName && (
							<>
								, <span style={{ color: token.colorPrimary, fontWeight: 600 }}>{userName}</span>
							</>
						)}
						!
					</Text>

					{/* Streak Badge */}
					<Flex align="center" gap={8} style={{ marginBottom: 16 }}>
						<motion.div
							animate={{ scale: [1, 1.1, 1] }}
							transition={{ repeat: Infinity, duration: 2 }}
						>
							<FireOutlined
								style={{ color: token.colorWarning, fontSize: 'clamp(24px, 6vw, 32px)' }}
							/>
						</motion.div>
						<Text
							strong
							style={{
								fontSize: 'clamp(18px, 5vw, 24px)',
								color: token.colorPrimary,
								fontWeight: 600,
							}}
						>
							{Math.max(0, streak)} {t('dayStreak')}
						</Text>
					</Flex>

					{/* Daily Goal Progress */}
					<div style={{ width: '100%', maxWidth: 'min(400px, 100%)' }}>
						<Flex justify="space-between" style={{ marginBottom: 4 }}>
							<Text type="secondary">{t('dailyGoal')}</Text>
							<Text
								type="secondary"
								style={{ color: isGoalComplete ? token.colorSuccess : undefined }}
							>
								{t('dailyGoalProgress', { current: safeDailyProgress, goal: safeDailyGoal })}
							</Text>
						</Flex>
						<Progress
							percent={progressPercent}
							showInfo={false}
							strokeColor={{
								'0%': token.colorPrimary,
								'100%': token.colorSuccess,
							}}
							railColor="rgba(0,0,0,0.06)"
							size={['100%', 12]}
						/>
						{isGoalComplete && (
							<motion.div
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								style={{ marginTop: 8 }}
							>
								<Text style={{ color: token.colorSuccess, fontWeight: 600 }}>
									🎉 {t('goalComplete')}
								</Text>
							</motion.div>
						)}
					</div>
				</Flex>
			</Card>
		</motion.div>
	);
}
