'use client';

import React from 'react';
import { Typography } from 'antd';
import CommunityFeed from '@/components/community/CommunityFeed';
import { useTranslations } from 'next-intl';

const { Title } = Typography;

export default function CommunityPage() {
	const tDashboard = useTranslations('Dashboard');

	return (
		<div style={{ padding: '24px 16px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
			<div style={{ maxWidth: 800, margin: '0 auto' }}>
				<Title level={2} style={{ color: '#1E3A5F', marginBottom: 24, paddingLeft: 8 }}>
					{tDashboard('communityHighlights')}
				</Title>
				<CommunityFeed />
			</div>
		</div>
	);
}
