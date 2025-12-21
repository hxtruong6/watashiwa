'use client';

import { Card, Flex, Statistic } from 'antd';
import React from 'react';

interface StatCardProps {
	title: string;
	value: number | string;
	icon: React.ReactNode;
	color?: string; // Hex color or token
	loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, loading }) => {
	return (
		<Card
			bordered={false}
			loading={loading}
			style={{ height: '100%', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
		>
			<Flex gap="middle" vertical>
				<Flex align="center" gap="small" style={{ color: '#8c8c8c' }}>
					<span style={{ fontSize: 24, color: color, display: 'flex' }}>{icon}</span>
					<span style={{ fontSize: 14 }}>{title}</span>
				</Flex>
				<Statistic
					value={value}
					valueStyle={{ fontSize: 32, fontWeight: 'bold', color: color || '#1f1f1f' }}
				/>
			</Flex>
		</Card>
	);
};
