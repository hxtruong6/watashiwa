'use client';

import themeConfig from '@/lib/theme/themeConfig';
import {
	CheckCircleOutlined,
	ClockCircleOutlined,
	FileTextOutlined,
	WarningOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Statistic } from 'antd';
import Link from 'next/link';
import React from 'react';

interface QAStatsProps {
	stats: Record<string, number>;
}

export const QAStats: React.FC<QAStatsProps> = ({ stats }) => {
	const data = [
		{
			title: 'Total Pending',
			value: (stats['AI_GENERATED'] || 0) + (stats['DRAFT'] || 0),
			icon: <ClockCircleOutlined />,
			color: themeConfig.token?.colorPrimary,
			statusFilter: 'AI_GENERATED',
		},
		{
			title: 'Verified',
			value: stats['VERIFIED'] || 0,
			icon: <CheckCircleOutlined />,
			color: themeConfig.token?.colorSuccess,
			statusFilter: 'VERIFIED',
		},
		{
			title: 'Flagged',
			value: stats['FLAGGED'] || 0,
			icon: <WarningOutlined />,
			color: themeConfig.token?.colorError,
			statusFilter: 'FLAGGED',
		},
		{
			title: 'Published',
			value: stats['PUBLISHED'] || 0,
			icon: <FileTextOutlined />,
			color: '#8c8c8c', // Neutral
			statusFilter: 'PUBLISHED',
		},
	];

	return (
		<Row gutter={[16, 16]}>
			{data.map((item) => (
				<Col xs={24} sm={12} md={6} key={item.title}>
					<Link
						href={`/admin/content?status=${item.statusFilter}`}
						style={{ textDecoration: 'none' }}
					>
						<Card hoverable styles={{ body: { padding: '20px' } }}>
							<Statistic
								title={
									<span
										style={{
											fontSize: 14,
											color: '#8c8c8c',
											display: 'flex',
											alignItems: 'center',
											gap: 8,
										}}
									>
										{item.icon} {item.title}
									</span>
								}
								value={item.value}
								valueStyle={{ color: item.color, fontWeight: 'bold' }}
							/>
						</Card>
					</Link>
				</Col>
			))}
		</Row>
	);
};
