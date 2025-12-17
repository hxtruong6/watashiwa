'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, theme } from 'antd';
import { motion } from 'motion/react';
import { ClockCircleOutlined, ThunderboltFilled, CoffeeOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const { Title } = Typography;

interface NextReviewWidgetProps {
	nextReview: Date | null;
	urgentCard: { surface: string; meaning: string } | null;
	forecastCount: number;
	streak: number;
	reviewedToday: number;
}

export default function NextReviewWidget({
	nextReview,
	urgentCard,
	forecastCount,
	streak,
	reviewedToday,
}: NextReviewWidgetProps) {
	const t = useTranslations('Dashboard.SmartForecast');
	const { token } = theme.useToken();
	// We only track "now" to trigger re-renders
	const [now, setNow] = useState<Date>(new Date());

	useEffect(() => {
		// Update "now" every minute
		const interval = setInterval(() => {
			setNow(new Date());
		}, 60000);
		return () => clearInterval(interval);
	}, []);

	// Derive state
	let status: 'chill' | 'ready' | 'urgent' | 'sleep' | 'streak-rescue' = 'chill';
	let timeLeftString = '';

	const hour = now.getHours();
	const isSleepTime = hour >= 22 || hour < 5;

	// Streak Savior Logic: Late (>20h), has streak, but 0 reviews today
	const isStreakAtRisk = streak > 0 && reviewedToday === 0 && hour >= 20;

	if (isStreakAtRisk) {
		status = 'streak-rescue';
	} else if (urgentCard) {
		status = 'urgent';
	} else if (nextReview) {
		const diff = nextReview.getTime() - now.getTime();
		if (diff <= 0) {
			status = 'ready';
		} else {
			status = 'chill';
			const hours = Math.floor(diff / (1000 * 60 * 60));
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			timeLeftString = `${hours}h ${minutes}m`;
		}
	} else {
		status = isSleepTime ? 'sleep' : 'chill';
	}

	// Override chill to sleep if it's late and nothing is urgent/ready (and not rescuing streak)
	if (status === 'chill' && isSleepTime) {
		status = 'sleep';
	}

	// Format time for display (e.g. 18:30)
	const formatTime = (date: Date) => {
		return new Intl.DateTimeFormat('vi-VN', {
			hour: '2-digit',
			minute: '2-digit',
		}).format(date);
	};

	if (!nextReview && !urgentCard && !isSleepTime && !isStreakAtRisk) return null;

	const getGradient = () => {
		switch (status) {
			case 'streak-rescue':
				// Intense orange/red gradient for rescue
				return `linear-gradient(135deg, ${token.colorWarningBg} 0%, ${token.colorErrorBg} 100%)`;
			case 'urgent':
				// Red-ish gradient using ErrorBg
				return `linear-gradient(135deg, ${token.colorErrorBg} 0%, ${token.colorBgContainer} 100%)`;
			case 'ready':
				// Green-ish gradient using SuccessBg
				return `linear-gradient(135deg, ${token.colorSuccessBg} 0%, ${token.colorBgContainer} 100%)`;
			case 'sleep':
				// Grey-ish gradient
				return `linear-gradient(135deg, ${token.colorFillQuaternary} 0%, ${token.colorBgContainer} 100%)`;
			default: // chill
				// Blue-ish gradient using InfoBg (or Check Primary)
				return `linear-gradient(135deg, ${token.colorInfoBg || token.colorPrimaryBg} 0%, ${token.colorBgContainer} 100%)`;
		}
	};

	const getBorderColor = () => {
		// Zen philosophy: use token borders
		switch (status) {
			case 'streak-rescue':
				return token.colorWarningBorder;
			case 'urgent':
				return token.colorErrorBorder;
			case 'ready':
				return token.colorSuccessBorder;
			default:
				return 'transparent';
		}
	};

	const getIconColor = () => {
		switch (status) {
			case 'streak-rescue':
				return token.colorWarning; // Use warning color (orange/fire)
			case 'urgent':
				return token.colorError;
			case 'ready':
				return token.colorSuccess;
			case 'sleep':
				return token.colorTextSecondary;
			default: // Chill
				return token.colorPrimary;
		}
	};

	// Variants for icon animation
	const iconVariants = {
		pulse: {
			scale: [1, 1.1, 1],
			opacity: [1, 0.8, 1],
			transition: {
				duration: 2,
				repeat: Infinity,
				ease: 'easeInOut' as const,
			},
		},
		static: {
			scale: 1,
			opacity: 1,
		},
	};

	const shouldPulse = status === 'urgent' || status === 'ready' || status === 'streak-rescue';

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			whileHover={{ scale: 1.01 }}
			style={{ marginBottom: 24 }}
			role="status"
			aria-live="polite"
		>
			<Card
				styles={{
					body: {
						padding: '20px 24px', // More breathing room
						background: getGradient(),
					},
				}}
				style={{
					border: `1px solid ${getBorderColor()}`,
					borderRadius: 16,
					overflow: 'hidden',
					// Enhanced shadow using token-based colors if possible, or keep semantic rgba
					boxShadow:
						status === 'urgent' || status === 'streak-rescue'
							? `0 4px 12px ${token.colorError}1A` // 10% opacity
							: `0 4px 16px ${token.colorText}0A`, // 4% opacity
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 16, // Use tighter gap
						flexWrap: 'wrap', // Allow wrapping
					}}
				>
					{/* Icon Section */}
					<motion.div
						variants={iconVariants}
						animate={shouldPulse ? 'pulse' : 'static'}
						style={{
							width: 48, // Slightly smaller icon
							height: 48,
							borderRadius: '50%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: 24,
							background: token.colorBgContainer,
							color: getIconColor(),
							flexShrink: 0,
							boxShadow: `0 4px 12px ${token.colorText}1A`,
						}}
					>
						{status === 'streak-rescue' ? (
							<ThunderboltFilled />
						) : status === 'urgent' ? (
							<ThunderboltFilled />
						) : status === 'ready' ? (
							<ClockCircleOutlined />
						) : status === 'sleep' ? (
							<CoffeeOutlined />
						) : (
							<ClockCircleOutlined />
						)}
					</motion.div>

					{/* Content Section */}
					<div style={{ flex: '1 1 200px' }}>
						{' '}
						{/* Min width 200px to force wrap */}
						<Title
							level={4}
							style={{ margin: 0, fontSize: 16, fontWeight: 600, color: token.colorText }}
						>
							{status === 'streak-rescue'
								? t.rich('forecastStreakRescue', {
										streak: () => (
											<span style={{ color: token.colorWarning, fontWeight: 800 }}>{streak}</span>
										),
									})
								: status === 'urgent'
									? urgentCard
										? t.rich('forecastUrgent', {
												card: () => (
													<span style={{ color: token.colorError, fontWeight: 800 }}>
														{urgentCard.surface}
													</span>
												),
											})
										: t('forecastUrgentBackup')
									: status === 'ready'
										? t.rich('forecastReady', {
												count: () => (
													<span style={{ color: token.colorSuccess, fontWeight: 700 }}>
														{forecastCount}
													</span>
												),
											})
										: status === 'sleep'
											? t('forecastSleep')
											: t.rich('forecastChill', {
													time: () => (
														<span style={{ color: token.colorPrimary, fontWeight: 700 }}>
															{timeLeftString || formatTime(nextReview!)}
														</span>
													),
												})}
						</Title>
					</div>

					{/* Action Section */}
					<div
						style={{
							display: 'flex',
							gap: 8,
							flexDirection: 'column',
							flex: '1 1 auto', // Allow grow
							minWidth: 120, // Min width for buttons
						}}
					>
						{(status === 'urgent' || status === 'ready' || status === 'streak-rescue') && (
							<Link href="/study" tabIndex={-1}>
								<Button
									type="primary"
									shape="round"
									size="large"
									danger={status === 'urgent' || status === 'streak-rescue'}
									style={{
										fontWeight: 600,
										width: '100%',
										height: 48, // Bigger touch target
										boxShadow: `0 4px 12px ${token.colorText}1A`,
									}}
									aria-label={t('actionReview')}
								>
									{t('actionReview')}
								</Button>
							</Link>
						)}
						{/* Quick 5 Button (Always show if reviews available/urgent OR chill but user wants to study) */}
						{/* Actually, user might want to do quick 5 even if chill? Or only when ready? */}
						{/* Plan says: "Do Quick 5" as friction reduction. So helps when reviews exist. */}
						{(status === 'ready' || status === 'urgent') && (
							<Link href="/study?mode=quick" tabIndex={-1}>
								<Button
									type="default"
									shape="round"
									size="small"
									style={{
										fontWeight: 600,
										width: '100%',
										border: 'none',
										background: 'transparent',
										color: token.colorTextSecondary,
										boxShadow: 'none',
									}}
								>
									{t('actionQuick')}
								</Button>
							</Link>
						)}
					</div>
				</div>
			</Card>
		</motion.div>
	);
}
