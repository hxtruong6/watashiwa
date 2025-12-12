'use client';

import React from 'react';
import { Typography, Flex, Progress } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

interface HeroSectionProps {
	userName?: string | null;
	streak: number;
	dailyProgress: number;
	dailyGoal: number;
}

/**
 * Hero section with personalized greeting, streak display, and daily goal progress
 */
export default function HeroSection({
	userName,
	streak,
	dailyProgress,
	dailyGoal,
}: HeroSectionProps) {
	const t = useTranslations('Dashboard');

	// Get time-based greeting
	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return t('greetingMorning');
		if (hour < 18) return t('greetingAfternoon');
		return t('greetingEvening');
	};

	const progressPercent = Math.min(Math.round((dailyProgress / dailyGoal) * 100), 100);
	const isGoalComplete = dailyProgress >= dailyGoal;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
		>
			<Flex
				vertical
				align="center"
				justify="center"
				style={{ textAlign: 'center', marginBottom: 24 }}
			>
				{/* Personalized Greeting */}
				<Text type="secondary" style={{ fontSize: 16, marginBottom: 8 }}>
					{getGreeting()}
					{userName && `, ${userName}`}!
				</Text>

				{/* Streak Badge */}
				<Flex align="center" gap={8} style={{ marginBottom: 16 }}>
					<motion.div
						animate={{ scale: [1, 1.1, 1] }}
						transition={{ repeat: Infinity, duration: 2 }}
					>
						<FireOutlined style={{ color: '#FAAD14', fontSize: 32 }} />
					</motion.div>
					<Title level={2} style={{ margin: 0, color: '#1E3A5F' }}>
						{streak} {t('dayStreak')}
					</Title>
				</Flex>

				{/* Daily Goal Progress */}
				<div style={{ width: '100%', maxWidth: 400 }}>
					<Flex justify="space-between" style={{ marginBottom: 4 }}>
						<Text type="secondary">{t('dailyGoal')}</Text>
						<Text type="secondary" style={{ color: isGoalComplete ? '#708238' : undefined }}>
							{t('dailyGoalProgress', { current: dailyProgress, goal: dailyGoal })}
						</Text>
					</Flex>
					<Progress
						percent={progressPercent}
						showInfo={false}
						strokeColor={
							isGoalComplete
								? '#708238'
								: {
										'0%': '#708238',
										'100%': '#1E3A5F',
									}
						}
						trailColor="#e8e8e8"
						strokeWidth={10}
						style={{ marginBottom: 0 }}
					/>
					{isGoalComplete && (
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							style={{ marginTop: 8 }}
						>
							<Text style={{ color: '#708238', fontWeight: 600 }}>🎉 {t('goalComplete')}</Text>
						</motion.div>
					)}
				</div>
			</Flex>
		</motion.div>
	);
}
