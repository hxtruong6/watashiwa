'use client';

import React from 'react';
import { Typography, Row, Col, Card, Button, Flex, Tag, Empty } from 'antd';
import Link from 'next/link';
import { BookOutlined, RightOutlined } from '@ant-design/icons';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

const { Title, Text, Paragraph } = Typography;

interface DecksContentProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	decks: any[];
}

export default function DecksContent({ decks }: DecksContentProps) {
	const t = useTranslations('Decks');
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	};

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}
		>
			<Flex justify="space-between" align="center" style={{ marginBottom: 32 }}>
				<motion.div variants={itemVariants}>
					<Title level={2} style={{ margin: 0, color: '#1E3A5F', fontSize: '1.75rem' }}>
						{t('libraryTitle')}
					</Title>
					<Text type="secondary" style={{ fontSize: '0.9rem' }}>
						{t('librarySubtitle')}
					</Text>
				</motion.div>
				<motion.div variants={itemVariants}>
					<Link href="/decks/new">
						<Button type="primary" size="large">
							{t('newDeck')}
						</Button>
					</Link>
				</motion.div>
			</Flex>

			{decks.length > 0 ? (
				<Row gutter={[24, 24]}>
					{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
					{decks.map((deck: any) => (
						<Col xs={24} sm={12} md={8} lg={6} key={deck.id}>
							<motion.div variants={itemVariants} whileHover={{ y: -5 }} style={{ height: '100%' }}>
								<Card
									hoverable
									style={{
										borderRadius: 16,
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
										boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
									}}
									styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}
								>
									<Flex justify="space-between" align="start" style={{ marginBottom: 16 }}>
										<div
											style={{
												width: 48,
												height: 48,
												borderRadius: 12,
												background: '#F0F2F5',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											<BookOutlined style={{ fontSize: 24, color: '#1E3A5F' }} />
										</div>
										{deck.isPublic && <Tag color="blue">{t('publicTag')}</Tag>}
									</Flex>

									<Title level={4} style={{ margin: '0 0 8px', color: '#1E3A5F' }}>
										{deck.title}
									</Title>

									<Paragraph
										type="secondary"
										ellipsis={{ rows: 2 }}
										style={{ flex: 1, marginBottom: 24 }}
									>
										{deck.description || t('noDescription')}
									</Paragraph>

									<Flex align="center" justify="space-between" style={{ marginTop: 'auto' }}>
										<Tag color="default" style={{ margin: 0 }}>
											{t('cardsCount', { count: deck._count?.vocab || 0 })}
										</Tag>
										<Link href={`/decks/${deck.id}`}>
											<Button type="text" icon={<RightOutlined />} iconPlacement="end">
												{t('detailsButton')}
											</Button>
										</Link>
									</Flex>
								</Card>
							</motion.div>
						</Col>
					))}
				</Row>
			) : (
				<motion.div variants={itemVariants}>
					<Empty
						image={Empty.PRESENTED_IMAGE_SIMPLE}
						description={<Text type="secondary">{t('noDecksDescription')}</Text>}
					>
						<Link href="/decks/new">
							<Button type="primary">{t('createDeckButton')}</Button>
						</Link>
					</Empty>
				</motion.div>
			)}
		</motion.div>
	);
}
