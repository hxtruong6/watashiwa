'use client';

import { useFeatureDiscovery } from '@/hooks/useFeatureDiscovery';
import CommunityFeed from '@/modules/community/components/feed/CommunityFeed';
import { Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

const { Title } = Typography;
const { useToken } = theme;

export default function CommunityPage() {
	const { token } = useToken();
	const tDashboard = useTranslations('Dashboard');
	useFeatureDiscovery('community', 'navigation');

	return (
		<div
			style={{
				padding: '24px 16px',
				background: token.colorBgLayout,
				minHeight: 'calc(100vh - 64px)',
			}}
		>
			<div style={{ maxWidth: 800, margin: '0 auto' }}>
				<Title level={2} style={{ color: token.colorPrimary, marginBottom: 24, paddingLeft: 8 }}>
					{tDashboard('communityHighlights')}
				</Title>
				<CommunityFeed />
			</div>
		</div>
	);
}
