'use client';

import React from 'react';
import { Typography, Card, Statistic, Row, Col, theme } from 'antd';
import {
	FireOutlined,
	ClockCircleOutlined,
	BookOutlined,
	CheckCircleOutlined,
} from '@ant-design/icons';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

const { Text } = Typography;
const { useToken } = theme;

interface StatsGridProps {
	streak: number;
	reviewedToday: number;
	totalCards?: number;
	masteredCards?: number;
}

/**
 * Stats grid showing key metrics: streak, today's reviews, etc.
 */
export default function StatsGrid({
	streak,
	reviewedToday,
	totalCards,
	masteredCards,
}: StatsGridProps) {
	const { token } = useToken();
	const t = useTranslations('Dashboard');

	const cardStyle = {
		boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
		borderRadius: 16,
		height: '100%',
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	};

	return (
		<Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
			<Col xs={12} sm={6}>
				<motion.div variants={itemVariants} whileHover={{ y: -4 }}>
					<Card variant="borderless" style={cardStyle}>
						<Statistic
							title={
								<Text type="secondary" style={{ fontSize: 11 }}>
									{t('dayStreak')}
								</Text>
							}
							value={streak}
							prefix={<FireOutlined style={{ color: token.colorWarning, fontSize: 20 }} />}
							styles={{
								content: { color: token.colorPrimary, fontWeight: 600, fontSize: '1.5rem' },
							}}
						/>
					</Card>
				</motion.div>
			</Col>
			<Col xs={12} sm={6}>
				<motion.div variants={itemVariants} whileHover={{ y: -4 }}>
					<Card variant="borderless" style={cardStyle}>
						<Statistic
							title={
								<Text type="secondary" style={{ fontSize: 11 }}>
									{t('reviewedToday')}
								</Text>
							}
							value={reviewedToday}
							prefix={<ClockCircleOutlined style={{ color: token.colorSuccess, fontSize: 20 }} />}
							styles={{
								content: { color: token.colorPrimary, fontWeight: 600, fontSize: '1.5rem' },
							}}
						/>
					</Card>
				</motion.div>
			</Col>
			{totalCards !== undefined && (
				<Col xs={12} sm={6}>
					<motion.div variants={itemVariants} whileHover={{ y: -4 }}>
						<Card variant="borderless" style={cardStyle}>
							<Statistic
								title={
									<Text type="secondary" style={{ fontSize: 11 }}>
										{t('totalCards')}
									</Text>
								}
								value={totalCards}
								prefix={<BookOutlined style={{ color: token.colorPrimary, fontSize: 20 }} />}
								styles={{
									content: { color: token.colorPrimary, fontWeight: 600, fontSize: '1.5rem' },
								}}
							/>
						</Card>
					</motion.div>
				</Col>
			)}
			{masteredCards !== undefined && (
				<Col xs={12} sm={6}>
					<motion.div variants={itemVariants} whileHover={{ y: -4 }}>
						<Card variant="borderless" style={cardStyle}>
							<Statistic
								title={
									<Text type="secondary" style={{ fontSize: 11 }}>
										{t('mastered')}
									</Text>
								}
								value={masteredCards}
								prefix={<CheckCircleOutlined style={{ color: token.colorSuccess, fontSize: 20 }} />}
								styles={{
									content: { color: token.colorPrimary, fontWeight: 600, fontSize: '1.5rem' },
								}}
							/>
						</Card>
					</motion.div>
				</Col>
			)}
		</Row>
	);
}
