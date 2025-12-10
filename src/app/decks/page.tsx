'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, Typography, List, Button, Tag, Flex, Spin } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { getDecks } from '@/services/actions';
import type { Deck } from '@/generated/prisma';

const { Title, Text } = Typography;

// Extension of Prisma Deck with the count we are fetching
type DeckWithCount = Deck & {
	_count: {
		vocab: number;
	};
};

export default function DecksPage() {
	const router = useRouter();
	const [decks, setDecks] = useState<DeckWithCount[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchDecks() {
			try {
				const data = await getDecks();
				setDecks(data);
			} catch (error) {
				console.error('Failed to fetch decks', error);
			} finally {
				setLoading(false);
			}
		}
		fetchDecks();
	}, []);

	return (
		<DashboardLayout>
			<Title level={2}>My Decks</Title>
			{loading ? (
				<Flex justify="center" align="center" style={{ minHeight: 200 }}>
					<Spin size="large" />
				</Flex>
			) : (
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
										<Text type="secondary">{item._count.vocab} cards available</Text>
										<div style={{ marginTop: 12 }}>
											{/* Placeholder tags or derive from description if needed */}
											{item.isPublic && <Tag color="green">Public</Tag>}
											<Tag color="blue">Vocabulary</Tag>
										</div>
										{item.description && (
											<Text style={{ display: 'block', marginTop: 8 }}>{item.description}</Text>
										)}
									</div>
								</Flex>
							</Card>
						</List.Item>
					)}
				/>
			)}
		</DashboardLayout>
	);
}
