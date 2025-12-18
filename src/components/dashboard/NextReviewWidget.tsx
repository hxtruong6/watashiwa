'use client';

import { useReviewStatus } from '@/hooks/useReviewStatus';
import {
	ClockCircleOutlined,
	CoffeeOutlined,
	RocketOutlined,
	ThunderboltFilled,
} from '@ant-design/icons';
import { Button, Card, Typography, theme } from 'antd';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { useMemo } from 'react';

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

	const { status, timeLeftString } = useReviewStatus({
		nextReview,
		urgentCard,
		streak,
		reviewedToday,
	});

	// Format time for display (e.g. 18:30)
	// Memoize to avoid recreation on every render
	const nextReviewTimeStr = useMemo(() => {
		if (!nextReview) return '';
		return new Intl.DateTimeFormat('vi-VN', {
			hour: '2-digit',
			minute: '2-digit',
		}).format(nextReview);
	}, [nextReview]);

	const styles = useMemo(() => {
		// Common gradients based on token colors for Dark/Light mode compatibility
		// We use standard tokens to ensure it looks good in both modes
		const gradients = {
			streak: `linear-gradient(135deg, ${token.colorWarningBg} 0%, ${token.colorErrorBg} 100%)`,
			urgent: `linear-gradient(135deg, ${token.colorErrorBg} 0%, ${token.colorBgContainer} 100%)`,
			ready: `linear-gradient(135deg, ${token.colorSuccessBg} 0%, ${token.colorBgContainer} 100%)`,
			sleep: `linear-gradient(135deg, ${token.colorFillQuaternary} 0%, ${token.colorBgContainer} 100%)`,
			chill: `linear-gradient(135deg, ${token.colorInfoBg || token.colorPrimaryBg} 0%, ${token.colorBgContainer} 100%)`,
		};

		return {
			gradient: gradients[status === 'streak-rescue' ? 'streak' : status],
			borderColor: {
				'streak-rescue': token.colorWarningBorder,
				urgent: token.colorErrorBorder,
				ready: token.colorSuccessBorder,
				sleep: 'transparent',
				chill: 'transparent',
			}[status],
			iconColor: {
				'streak-rescue': token.colorWarning,
				urgent: token.colorError,
				ready: token.colorSuccess,
				sleep: token.colorTextSecondary,
				chill: token.colorPrimary,
			}[status],
			shadow:
				status === 'urgent' || status === 'streak-rescue'
					? `0 4px 12px ${token.colorError}1A`
					: `0 4px 16px ${token.colorText}0A`,
		};
	}, [status, token]);

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

	if (!nextReview && !urgentCard && status !== 'sleep' && status !== 'streak-rescue') return null;

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
						padding: '20px 24px',
						background: styles.gradient,
					},
				}}
				style={{
					border: `1px solid ${styles.borderColor}`,
					borderRadius: 16,
					overflow: 'hidden',
					boxShadow: styles.shadow,
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						flexWrap: 'wrap',
					}}
				>
					{/* Icon Section */}
					<motion.div
						variants={iconVariants}
						animate={shouldPulse ? 'pulse' : 'static'}
						style={{
							width: 48,
							height: 48,
							borderRadius: '50%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: 24,
							background: token.colorBgContainer,
							color: styles.iconColor,
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
															{timeLeftString || nextReviewTimeStr}
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
							flex: '1 1 auto',
							minWidth: 120,
						}}
					>
						{(status === 'urgent' || status === 'ready' || status === 'streak-rescue') && (
							<Link
								href="/study"
								tabIndex={-1}
								style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
							>
								<Button
									type="primary"
									shape="round"
									size="large"
									danger={status === 'urgent' || status === 'streak-rescue'}
									style={{
										fontWeight: 600,
										width: 'fit-content',
										minWidth: 150,
										height: 48,
										boxShadow: `0 4px 12px ${token.colorText}1A`,
									}}
									aria-label={t('actionReview')}
								>
									{t('actionReview')}
								</Button>
							</Link>
						)}

						{/* Study Ahead / Quick 5 Button */}
						{/* Available in Ready, Urgent (as secondary) or Chill (as primary if user wants to study ahead) */}
						<Link href="/study?mode=quick" tabIndex={-1} style={{ width: '100%' }}>
							<Button
								type={status === 'chill' ? 'primary' : 'default'}
								ghost={status === 'chill'}
								shape="round"
								size={status === 'chill' ? 'large' : 'small'}
								style={{
									fontWeight: 600,
									width: '100%',
									border: status === 'chill' ? `1px solid ${token.colorPrimary}` : 'none',
									background: 'transparent',
									color: status === 'chill' ? token.colorPrimary : token.colorTextSecondary,
									boxShadow: 'none',
									marginTop: status === 'chill' ? 0 : 4,
								}}
								icon={status === 'chill' ? <RocketOutlined /> : undefined}
							>
								{status === 'chill' ? t('actionStudyAhead') : t('actionQuick')}
							</Button>
						</Link>
					</div>
				</div>
			</Card>
		</motion.div>
	);
}
