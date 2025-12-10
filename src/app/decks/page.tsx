'use client';

import React from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Card, Typography, List, Button, Tag, Flex } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

// Mock Data for Phase 2
const decks = [
	{
		id: 'n5-core',
		title: 'JLPT N5 Core Vocabulary',
		count: 800,
		tags: ['N5', 'Vocabulary', 'Core'],
		color: 'blue',
	},
	{
		id: 'n4-core',
		title: 'JLPT N4 Core Vocabulary (Coming Soon)',
		count: 0,
		tags: ['N4', 'Vocabulary'],
		color: 'orange',
	},
];

export default function DecksPage() {
	const router = useRouter();

	return (
		<DashboardLayout>
			<Title level={2}>My Decks</Title>
			<List
				grid={{ gutter: 16, column: 1 }}
				dataSource={decks}
				renderItem={(item) => (
					<List.Item>
						<Card
							hoverable
							style={{ borderRadius: 12 }}
							actions={[
								<Button
									type="text"
									icon={<PlayCircleOutlined />}
									key="study"
									onClick={() => router.push('/study')}
								>
									Start Study
								</Button>,
							]}
						>
							<Flex justify="space-between" align="start">
								<div>
									<Title level={4} style={{ marginTop: 0 }}>
										{item.title}
									</Title>
									<Text type="secondary">{item.count} cards available</Text>
									<div style={{ marginTop: 12 }}>
										{item.tags.map((tag) => (
											<Tag color={item.color} key={tag}>
												{tag}
											</Tag>
										))}
									</div>
								</div>
							</Flex>
						</Card>
					</List.Item>
				)}
			/>
		</DashboardLayout>
	);
}
