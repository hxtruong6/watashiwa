'use client';

import React from 'react';
import { Typography, Card, Row, Col, Button, Flex, Tag } from 'antd';
import Link from 'next/link';
import { RightOutlined, PlusOutlined } from '@ant-design/icons';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

interface DeckWithStats {
	id: string;
	title: string;
	cardCount: number;
	dueCount: number;
}

interface MyDecksProps {
	decks: DeckWithStats[];
}

/**
 * My Decks section showing user's decks with card and due counts
 */
export default function MyDecks({ decks }: MyDecksProps) {
	const t = useTranslations('Dashboard');

	if (decks.length === 0) {
		return null;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
		>
			<Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
				<Title level={5} style={{ margin: 0, color: '#1E3A5F' }}>
					{t('myDecks')}
				</Title>
				<Flex gap={8}>
					<Link href="/decks/new">
						<Button type="text" size="small" icon={<PlusOutlined />}>
							{t('newDeck')}
						</Button>
					</Link>
					<Link href="/decks">
						<Button type="link" size="small" icon={<RightOutlined />} iconPlacement="end">
							{t('viewAll')}
						</Button>
					</Link>
				</Flex>
			</Flex>

			<Row gutter={[16, 16]}>
				{decks.slice(0, 6).map((deck, index) => (
					<Col xs={12} sm={8} md={6} key={deck.id}>
						<Link href={`/decks/${deck.id}`}>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 + index * 0.05 }}
								whileHover={{ y: -4 }}
							>
								<Card
									size="small"
									style={{
										borderRadius: 16,
										boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
										cursor: 'pointer',
										height: '100%',
									}}
									hoverable
								>
									<Flex vertical gap={8}>
										<Text strong ellipsis style={{ color: '#1E3A5F' }}>
											{deck.title}
										</Text>
										<Flex justify="space-between" align="center">
											<Text type="secondary" style={{ fontSize: 12 }}>
												{t('cardsCount', { count: deck.cardCount })}
											</Text>
											{deck.dueCount > 0 ? (
												<Tag color="volcano" style={{ margin: 0, fontSize: 11 }}>
													{t('dueCount', { count: deck.dueCount })}
												</Tag>
											) : (
												<Tag color="success" style={{ margin: 0, fontSize: 11 }}>
													{t('noDue')}
												</Tag>
											)}
										</Flex>
									</Flex>
								</Card>
							</motion.div>
						</Link>
					</Col>
				))}
			</Row>
		</motion.div>
	);
}
