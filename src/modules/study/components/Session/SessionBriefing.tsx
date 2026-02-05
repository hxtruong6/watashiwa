'use client';

import type { SmartCard } from '@/modules/flashcard/types';
import { Button, Space, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

const { Title, Text } = Typography;

interface SessionBriefingProps {
	queue: SmartCard[];
	stats?: { newCount?: number; reviewCount?: number };
	onStart: () => void;
	onSkip?: () => void;
}

export default function SessionBriefing({ queue, onStart, onSkip }: SessionBriefingProps) {
	const t = useTranslations('Study.briefing');

	const { newCount, reviewCount } = useMemo(() => {
		const newC = queue.filter((c) => c.srsStage === 0).length;
		const reviewC = queue.length - newC;
		return { newCount: newC, reviewCount: reviewC };
	}, [queue]);

	const hasNew = newCount > 0;
	const hasReview = reviewCount > 0;

	return (
		<div style={{ padding: 24, textAlign: 'center' }}>
			<Title level={3}>{t('title')}</Title>
			<Text>{t('readyToReview', { count: queue.length })}</Text>

			{(hasNew || hasReview) && (
				<div style={{ marginTop: 20, textAlign: 'left', maxWidth: 320, margin: '20px auto 0' }}>
					<Space direction="vertical" size="middle" style={{ width: '100%' }}>
						{hasNew && (
							<div>
								<Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>
									{t('sectionNew')}
								</Text>
								<div>
									<Text strong>{t('missionNew', { count: newCount })}</Text>
								</div>
							</div>
						)}
						{hasReview && (
							<div>
								<Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>
									{t('sectionReview')}
								</Text>
								<div>
									<Text strong>{t('missionReview', { count: reviewCount })}</Text>
								</div>
							</div>
						)}
					</Space>
				</div>
			)}

			<div style={{ marginTop: 24 }}>
				<Space orientation="vertical" size="middle" style={{ width: '100%' }}>
					<Button type="primary" size="large" onClick={onStart} block>
						{t('startSession')}
					</Button>
					{onSkip && (
						<Button type="text" size="large" onClick={onSkip} block>
							{t('skipBriefing')}
						</Button>
					)}
				</Space>
			</div>
		</div>
	);
}
