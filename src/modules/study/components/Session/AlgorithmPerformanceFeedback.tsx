'use client';

import { useStudyPreferences } from '@/modules/study/store/useStudyPreferences';
import { Card, Flex, Progress, Statistic, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';

const { Text, Title } = Typography;
const { useToken } = theme;

interface AlgorithmPerformanceFeedbackProps {
	metrics?: {
		responseTime?: number;
		relationshipQuality?: number;
		retentionImprovement?: number;
	};
}

/**
 * Algorithm Performance Feedback Component
 * Displays metrics about semantic algorithm effectiveness
 * Shows recommendation to switch to SRS if performance is poor
 */
export function AlgorithmPerformanceFeedback({ metrics }: AlgorithmPerformanceFeedbackProps) {
	const t = useTranslations('Study');
	const { token } = useToken();
	const { algorithmMode } = useStudyPreferences();

	// Only show for semantic mode
	if (algorithmMode !== 'semantic') {
		return null;
	}

	// Placeholder metrics (would come from analytics/backend in production)
	const responseTime = metrics?.responseTime ?? 0;
	const relationshipQuality = metrics?.relationshipQuality ?? 0;
	const retentionImprovement = metrics?.retentionImprovement ?? 0;

	// Determine if recommendation to switch is needed
	const shouldRecommendSRS = responseTime > 1000 || relationshipQuality < 0.3;

	return (
		<Card size="small" title={t('algorithmPerformance')} style={{ marginTop: 16 }}>
			<Flex vertical gap="middle">
				<Statistic
					title={t('responseTime')}
					value={responseTime}
					suffix="ms"
					valueStyle={{ fontSize: 16 }}
				/>
				<Statistic
					title={t('relationshipQuality')}
					value={relationshipQuality * 100}
					suffix="%"
					valueStyle={{ fontSize: 16 }}
				/>
				<Statistic
					title={t('retentionImprovement')}
					value={retentionImprovement * 100}
					suffix="%"
					valueStyle={{ fontSize: 16 }}
				/>

				{shouldRecommendSRS && (
					<div
						style={{
							marginTop: 8,
							padding: 12,
							background: token.colorWarningBg,
							borderRadius: 4,
						}}
					>
						<Text type="warning">{t('recommendationSwitchSRS')}</Text>
					</div>
				)}
			</Flex>
		</Card>
	);
}
