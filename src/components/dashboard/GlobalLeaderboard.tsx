'use client';

import React from 'react';
import { Card, Typography, List, Avatar, Badge, Flex } from 'antd';
import { TrophyOutlined, FireOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

interface LeaderboardUser {
	id: string;
	name: string;
	currentStreak: number;
}

interface GlobalLeaderboardProps {
	users: LeaderboardUser[];
	currentUserId?: string;
}

export default function GlobalLeaderboard({ users, currentUserId }: GlobalLeaderboardProps) {
	const t = useTranslations('Dashboard');

	const getRankIcon = (index: number) => {
		switch (index) {
			case 0:
				return <TrophyOutlined style={{ color: '#FFD700', fontSize: 24 }} />; // Gold
			case 1:
				return <TrophyOutlined style={{ color: '#C0C0C0', fontSize: 20 }} />; // Silver
			case 2:
				return <TrophyOutlined style={{ color: '#CD7F32', fontSize: 18 }} />; // Bronze
			default:
				return (
					<div
						style={{
							width: 24,
							height: 24,
							borderRadius: '50%',
							background: '#F0F2F5',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontWeight: 'bold',
							color: '#666',
						}}
					>
						{index + 1}
					</div>
				);
		}
	};

	return (
		<Card
			bordered={false}
			style={{
				borderRadius: 16,
				boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
				height: '100%',
			}}
			styles={{ body: { padding: '24px' } }}
		>
			<Flex align="center" gap="small" style={{ marginBottom: 24 }}>
				<TrophyOutlined style={{ fontSize: 24, color: '#1E3A5F' }} />
				<div>
					<Title level={4} style={{ margin: 0, color: '#1E3A5F' }}>
						{t('leaderboard')}
					</Title>
					<Text type="secondary" style={{ fontSize: '0.85rem' }}>
						{t('leaderboardSubtitle')}
					</Text>
				</div>
			</Flex>

			<List
				itemLayout="horizontal"
				dataSource={users}
				renderItem={(user, index) => (
					<List.Item
						style={{
							padding: '12px 16px',
							background: user.id === currentUserId ? '#F0F7FF' : 'transparent',
							borderRadius: 12,
							marginBottom: 8,
							border: 'none',
						}}
					>
						<List.Item.Meta
							avatar={
								<Flex align="center" gap="middle">
									{getRankIcon(index)}
									<Avatar
										style={{
											backgroundColor:
												index === 0
													? '#FFD700'
													: index === 1
														? '#C0C0C0'
														: index === 2
															? '#CD7F32'
															: '#1E3A5F',
											color: '#fff',
										}}
									>
										{user.name.charAt(0).toUpperCase()}
									</Avatar>
								</Flex>
							}
							title={
								<Text strong style={{ color: user.id === currentUserId ? '#1E3A5F' : undefined }}>
									{user.name} {user.id === currentUserId && '(You)'}
								</Text>
							}
						/>
						<Flex align="center" gap={4}>
							<FireOutlined style={{ color: '#E64A19' }} />
							<Text strong>{t('streakDays', { count: user.currentStreak })}</Text>
						</Flex>
					</List.Item>
				)}
			/>
		</Card>
	);
}
