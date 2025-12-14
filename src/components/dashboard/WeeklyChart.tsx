'use client';

import React from 'react';
import { Typography, Card, Flex, theme } from 'antd';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;
const { useToken } = theme;

interface DayData {
	day: string; // e.g., "Mon", "Tue"
	count: number;
	isToday?: boolean;
}

interface WeeklyChartProps {
	data: DayData[];
	thisWeekTotal: number;
	bestDay?: { day: string; count: number };
}

/**
 * Weekly progress chart showing last 7 days of review activity
 */
export default function WeeklyChart({ data, thisWeekTotal, bestDay }: WeeklyChartProps) {
	const { token } = useToken();
	const t = useTranslations('Dashboard');

	const maxCount = Math.max(...data.map((d) => d.count), 1);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
			style={{ marginBottom: 32 }}
		>
			<Card
				style={{
					borderRadius: 20,
					boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
				}}
			>
				<Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
					<Title level={5} style={{ margin: 0, color: token.colorPrimary }}>
						{t('weeklyProgress')}
					</Title>
					<Text type="secondary" style={{ fontSize: 13 }}>
						{t('thisWeek')}: <strong>{thisWeekTotal}</strong>
					</Text>
				</Flex>

				{/* Bar Chart */}
				<Flex
					justify="space-between"
					align="flex-end"
					gap={8}
					style={{ height: 100, marginBottom: 8 }}
				>
					{data.map((day, index) => {
						const height = day.count > 0 ? Math.max((day.count / maxCount) * 80, 8) : 4;
						const isBest = bestDay && day.day === bestDay.day && day.count === bestDay.count;

						return (
							<motion.div
								key={day.day}
								initial={{ height: 0 }}
								animate={{ height }}
								transition={{ delay: index * 0.05, duration: 0.4 }}
								style={{
									flex: 1,
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
								}}
							>
								{day.count > 0 && (
									<Text style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>
										{day.count}
									</Text>
								)}
								<div
									style={{
										width: '100%',
										maxWidth: 32,
										height,
										borderRadius: 6,
										background: day.isToday
											? `linear-gradient(180deg, ${token.colorPrimary} 0%, #2D5A8F 100%)`
											: isBest
												? `linear-gradient(180deg, ${token.colorSuccess} 0%, #8FA84A 100%)`
												: day.count > 0
													? '#e0e0e0'
													: '#f5f5f5',
										transition: 'background 0.3s',
									}}
								/>
							</motion.div>
						);
					})}
				</Flex>

				{/* Day Labels */}
				<Flex justify="space-between">
					{data.map((day) => (
						<Text
							key={day.day}
							style={{
								flex: 1,
								textAlign: 'center',
								fontSize: 11,
								color: day.isToday ? token.colorPrimary : '#8c8c8c',
								fontWeight: day.isToday ? 600 : 400,
							}}
						>
							{day.day}
						</Text>
					))}
				</Flex>

				{/* Best Day */}
				{bestDay && bestDay.count > 0 && (
					<Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 12 }}>
						🏆 {t('bestDay')}: {bestDay.day} ({bestDay.count})
					</Text>
				)}
			</Card>
		</motion.div>
	);
}
