import React from 'react';
import { Row, Col, Card, Statistic, theme, Flex, Tooltip, Typography, Button } from 'antd';
import { useRouter } from 'next/navigation';
import {
	DatabaseOutlined,
	SafetyCertificateOutlined,
	ReadOutlined,
	StarOutlined,
	InfoCircleOutlined,
	ArrowRightOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';

const { useToken } = theme;
const { Text } = Typography;

interface StatsOverviewProps {
	total: number;
	newCount: number;
	learningCount: number;
	masteredCount: number; // Represents 'Review' or 'Mastered'
}

export default function StatsOverview({
	total,
	newCount,
	learningCount,
	masteredCount,
}: StatsOverviewProps) {
	const { token } = useToken();
	const t = useTranslations('Dashboard');
	const router = useRouter();

	// Calculate percentages for visualization
	const newPercent = total > 0 ? (newCount / total) * 100 : 0;
	const learningPercent = total > 0 ? (learningCount / total) * 100 : 0;
	const masteredPercent = total > 0 ? (masteredCount / total) * 100 : 0;

	const cardStyle = {
		boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
		borderRadius: 12,
		height: '100%',
		border: `1px solid ${token.colorBorderSecondary}`,
	};

	return (
		<Flex vertical gap="middle" style={{ marginBottom: 24 }}>
			{/* SRS Distribution Visualization */}
			<Card
				variant="borderless"
				style={{ ...cardStyle, padding: 0 }}
				styles={{ body: { padding: '16px 24px' } }}
			>
				<Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
					<Text strong style={{ fontSize: 16 }}>
						{t('overallProgress')}
					</Text>
					<Flex gap="small">
						<Tooltip title={t('viewAnalyticsTooltip') || 'View detailed analytics'}>
							<Button
								type="text"
								size="small"
								icon={<ArrowRightOutlined />}
								onClick={() => router.push('/analytics')}
								style={{ color: token.colorTextSecondary }}
							>
								{t('viewAnalytics') || 'More Insights'}
							</Button>
						</Tooltip>
						<Tooltip
							title={t('srsDistributionTooltip') || 'Distribution of your cards by SRS state'}
						>
							<InfoCircleOutlined style={{ color: token.colorTextDescription }} />
						</Tooltip>
					</Flex>
				</Flex>

				{/* Custom Stacked Bar */}
				<Flex
					style={{
						height: 12,
						borderRadius: 10,
						overflow: 'hidden',
						background: token.colorFillSecondary,
					}}
				>
					{masteredCount > 0 && (
						<Tooltip
							title={`${t('filterReview')}: ${masteredCount} (${masteredPercent.toFixed(1)}%)`}
						>
							<div
								style={{
									width: `${masteredPercent}%`,
									background: token.colorSuccess,
									transition: 'all 0.3s',
								}}
							/>
						</Tooltip>
					)}
					{learningCount > 0 && (
						<Tooltip
							title={`${t('filterLearning')}: ${learningCount} (${learningPercent.toFixed(1)}%)`}
						>
							<div
								style={{
									width: `${learningPercent}%`,
									background: token.colorWarning,
									transition: 'all 0.3s',
								}}
							/>
						</Tooltip>
					)}
					{newCount > 0 && (
						<Tooltip title={`${t('filterNew')}: ${newCount} (${newPercent.toFixed(1)}%)`}>
							<div
								style={{
									width: `${newPercent}%`,
									background: token.colorTextQuaternary,
									transition: 'all 0.3s',
								}}
							/>
						</Tooltip>
					)}
				</Flex>

				<Flex justify="space-between" style={{ marginTop: 8 }}>
					<Text type="secondary" style={{ fontSize: 12 }}>
						0%
					</Text>
					<Text type="secondary" style={{ fontSize: 12 }}>
						100%
					</Text>
				</Flex>
			</Card>

			{/* Detail Cards */}
			<Row gutter={[16, 16]}>
				<Col xs={12} sm={6} md={6}>
					<Card variant="borderless" style={cardStyle}>
						<Statistic
							title={t('totalCards')}
							value={total}
							prefix={<DatabaseOutlined style={{ color: token.colorPrimary }} />}
							valueStyle={{ color: token.colorTextHeading, fontWeight: 600 }}
						/>
					</Card>
				</Col>
				<Col xs={12} sm={6} md={6}>
					<Card variant="borderless" style={cardStyle}>
						<Statistic
							title={t('filterNew')}
							value={newCount}
							prefix={<StarOutlined style={{ color: token.colorTextDescription }} />}
							valueStyle={{ color: token.colorTextDescription, fontWeight: 600 }}
						/>
					</Card>
				</Col>
				<Col xs={12} sm={6} md={6}>
					<Card variant="borderless" style={cardStyle}>
						<Statistic
							title={t('filterLearning')}
							value={learningCount}
							prefix={<ReadOutlined style={{ color: token.colorWarning }} />}
							valueStyle={{ color: token.colorWarning, fontWeight: 600 }}
						/>
					</Card>
				</Col>
				<Col xs={12} sm={6} md={6}>
					<Card variant="borderless" style={cardStyle}>
						<Statistic
							title={t('filterReview')} // Changed from Mastered to Review to match FSRS
							value={masteredCount}
							prefix={<SafetyCertificateOutlined style={{ color: token.colorSuccess }} />}
							valueStyle={{ color: token.colorSuccess, fontWeight: 600 }}
						/>
					</Card>
				</Col>
			</Row>
		</Flex>
	);
}
