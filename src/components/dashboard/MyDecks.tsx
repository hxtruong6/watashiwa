'use client';

import { PlusOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Card, Col, Flex, Row, Tag, Typography, theme } from 'antd';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';

const { Title, Text } = Typography;
const { useToken } = theme;

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
	const { token } = useToken();
	const t = useTranslations('Dashboard');

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
		>
			<Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
				<Title level={5} style={{ margin: 0, color: token.colorPrimary }}>
					{t('myDecks')}
				</Title>
				<Flex gap={8}>
					<Link href="/dashboard/decks">
						<Button type="text" size="small" icon={<PlusOutlined />} style={{ fontSize: 12 }}>
							{t('newDeck')}
						</Button>
					</Link>
					<Link href="/dashboard/decks">
						<Button
							type="link"
							style={{ fontSize: 12 }}
							size="small"
							icon={<RightOutlined />}
							iconPlacement="end"
						>
							{t('viewAll')}
						</Button>
					</Link>
				</Flex>
			</Flex>

			{decks.length > 0 ? (
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
											<Text strong ellipsis style={{ color: token.colorPrimary }}>
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
			) : (
				<div
					style={{ textAlign: 'center', padding: '24px', background: '#f5f5f5', borderRadius: 16 }}
				>
					<Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
						You haven&apos;t created any decks yet.
					</Text>
					<Link href="/dashboard/decks">
						<Button type="primary" size="small" icon={<PlusOutlined />}>
							Create Your First Deck
						</Button>
					</Link>
				</div>
			)}
		</motion.div>
	);
}
