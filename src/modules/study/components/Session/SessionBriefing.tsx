'use client';
import { Button, Space, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

const { Title, Text } = Typography;

interface SessionBriefingProps {
	queue: any[];
	stats?: any;
	onStart: () => void;
	onSkip?: () => void;
}

export default function SessionBriefing({ queue, onStart, onSkip }: SessionBriefingProps) {
	const t = useTranslations('Study.briefing');

	return (
		<div style={{ padding: 24, textAlign: 'center' }}>
			<Title level={3}>{t('title')}</Title>
			<Text>{t('readyToReview', { count: queue.length })}</Text>
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
