'use client';

import React from 'react';
import { Typography, Flex, Progress, Button, theme } from 'antd';
import { FireOutlined, SettingOutlined } from '@ant-design/icons';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;
const { useToken } = theme;

interface HeroSectionProps {
	userName?: string | null;
	streak: number;
	dailyProgress: number;
	dailyGoal: number;
	onOpenSettings?: () => void;
}

/**
 * Hero section with personalized greeting, streak display, and daily goal progress
 */
export default function HeroSection({
	userName,
	streak,
	dailyProgress,
	dailyGoal,
	onOpenSettings,
}: HeroSectionProps) {
	const { token } = useToken();
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
			style={{ position: 'relative' }}
		>
			<Button
				icon={<SettingOutlined style={{ fontSize: 18 }} />}
				type="text"
				onClick={onOpenSettings}
				style={{
					position: 'absolute',
					top: 0,
					right: 0,
					opacity: 0.5,
					transition: 'opacity 0.2s',
				}}
				onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
				onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
			/>

			<Flex
				vertical
				align="center"
				justify="center"
				style={{ textAlign: 'center', marginBottom: 24 }}
			>
				{/* Personalized Greeting */}
				<Text type="secondary" style={{ fontSize: 16, marginBottom: 8 }}>
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
						<FireOutlined style={{ color: token.colorWarning, fontSize: 32 }} />
					</motion.div>
					<Title level={2} style={{ margin: 0, color: token.colorPrimary }}>
						{streak} {t('dayStreak')}
					</Title>
				</Flex>

				{/* Daily Goal Progress */}
				<div style={{ width: '100%', maxWidth: 400 }}>
					<Flex justify="space-between" style={{ marginBottom: 4 }}>
						<Text type="secondary">{t('dailyGoal')}</Text>
						<Text
							type="secondary"
							style={{ color: isGoalComplete ? token.colorSuccess : undefined }}
						>
							{t('dailyGoalProgress', { current: dailyProgress, goal: dailyGoal })}
						</Text>
					</Flex>
					<Progress
						percent={progressPercent}
						showInfo={false}
						strokeColor={{
							'0%': token.colorPrimary,
							'100%': '#4F46E5', // Keep gradient for now or replace with token variation
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
		</motion.div>
	);
}
