import React, { useEffect } from 'react';
import { Flex, Result, Button, Typography, Progress, theme } from 'antd';
import { CheckCircleFilled, FireOutlined, TrophyOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import confetti from 'canvas-confetti';

const { Text } = Typography;
const { useToken } = theme;

interface SessionSummaryProps {
	stats: {
		reviewsToday: number;
		limitReviews: number;
		newCardsToday: number;
		limitNewCards: number;
	};
}

export default function SessionSummary({ stats }: SessionSummaryProps) {
	const { token } = useToken();
	const t = useTranslations('Study');
	const router = useRouter();

	useEffect(() => {
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
		});
	}, []);

	const reviewPercent = Math.min(
		100,
		Math.round((stats.reviewsToday / (stats.limitReviews || 1)) * 100),
	);
	const newPercent = Math.min(
		100,
		Math.round((stats.newCardsToday / (stats.limitNewCards || 1)) * 100),
	);

	return (
		<Flex
			align="center"
			justify="center"
			style={{ minHeight: '100vh', background: token.colorBgLayout, padding: 20 }}
		>
			<div
				style={{
					background: token.colorBgContainer,
					padding: 40,
					borderRadius: 24,
					boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
					maxWidth: 500,
					width: '100%',
					textAlign: 'center',
				}}
			>
				<Result
					icon={<CheckCircleFilled style={{ color: token.colorSuccess, fontSize: 72 }} />}
					title={t('sessionComplete')}
					subTitle={t('sessionCompleteSubtitle')}
					extra={[
						<div key="stats" style={{ marginBottom: 24, textAlign: 'left' }}>
							<Flex justify="space-between">
								<Text strong>
									<FireOutlined /> {t('dailyReviews')}
								</Text>
								<Text>
									{stats.reviewsToday} / {stats.limitReviews}
								</Text>
							</Flex>
							<Progress percent={reviewPercent} status="active" strokeColor={token.colorPrimary} />
						</div>,
						<div key="new-cards-stats" style={{ marginBottom: 16 }}>
							<Flex justify="space-between">
								<Text strong>
									<TrophyOutlined /> {t('newWords')}
								</Text>
								<Text>
									{stats.newCardsToday} / {stats.limitNewCards}
								</Text>
							</Flex>
							<Progress percent={newPercent} status="active" strokeColor={token.colorWarning} />
						</div>,
						<Button
							type="primary"
							key="home"
							size="large"
							shape="round"
							onClick={() => router.push('/')}
							style={{ width: '100%', height: 48 }}
						>
							{t('returnDashboard')}
						</Button>,
					]}
				/>
			</div>
		</Flex>
	);
}
