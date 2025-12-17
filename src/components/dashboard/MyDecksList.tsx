'use client';

import React from 'react';
import { Typography, Row, Col, Card, Button, Flex, Tag, Empty, theme } from 'antd';
import Link from 'next/link';
import { BookOutlined } from '@ant-design/icons';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import DeckListActions from '@/app/dashboard/decks/DeckListActions';

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

interface MyDecksListProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	decks: any[];
}

export default function MyDecksList({ decks }: MyDecksListProps) {
	const { token } = useToken();
	const t = useTranslations('MyDecks');
	const locale = useLocale();
	const router = useRouter();

	return (
		<div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
			<Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: 32 }}>
				<Col xs={24} sm={16}>
					<Title level={2} style={{ margin: 0, color: token.colorPrimary, fontSize: '1.75rem' }}>
						{t('title')}
					</Title>
					<Text type="secondary" style={{ fontSize: '0.9rem' }}>
						{t('subtitle')}
					</Text>
				</Col>
				<Col xs={24} sm={8}>
					<Flex justify="end" gap="small" wrap="wrap">
						<Link href="/decks">
							<Button>{t('browseLibrary')}</Button>
						</Link>
						<DeckListActions mode="create" />
					</Flex>
				</Col>
			</Row>

			{decks.length > 0 ? (
				<Row gutter={[24, 24]}>
					{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
					{decks.map((deck: any) => {
						const displayTitle = locale === 'en' ? deck.titleEn || deck.title : deck.title;
						const displayDescription =
							locale === 'en' ? deck.descriptionEn || deck.description : deck.description;

						return (
							<Col xs={24} sm={12} md={8} lg={6} key={deck.id}>
								<Card
									hoverable
									onClick={() => router.push(`/decks/${deck.id}`)}
									style={{
										borderRadius: 16,
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
										boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
										cursor: 'pointer',
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
												overflow: 'hidden',
											}}
										>
											{deck.headerImage ? (
												/* eslint-disable-next-line @next/next/no-img-element */
												<img
													src={deck.headerImage}
													alt={displayTitle}
													style={{ width: '100%', height: '100%', objectFit: 'cover' }}
												/>
											) : (
												<BookOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
											)}
										</div>
										{deck.isPublic ? (
											<Tag color="blue">{t('public')}</Tag>
										) : (
											<Tag color="orange">{t('private')}</Tag>
										)}
									</Flex>

									<Title level={4} style={{ margin: '0 0 8px', color: token.colorPrimary }}>
										{displayTitle}
									</Title>

									<Paragraph
										type="secondary"
										ellipsis={{ rows: 2 }}
										style={{ flex: 1, marginBottom: 24 }}
									>
										{displayDescription || t('noDescription')}
									</Paragraph>

									<Flex align="center" justify="space-between" style={{ marginTop: 'auto' }}>
										<Tag color="default" style={{ margin: 0 }}>
											{t('cardsCount', {
												count: (deck._count?.vocab || 0) + (deck._count?.kanji || 0),
											})}
										</Tag>
										<Flex gap="small" onClick={(e) => e.stopPropagation()}>
											<Link href={`/decks/${deck.id}`}>
												<Button type="text" size="small">
													{t('view')}
												</Button>
											</Link>
											<DeckListActions mode="edit" deck={deck} />
										</Flex>
									</Flex>
								</Card>
							</Col>
						);
					})}
				</Row>
			) : (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={<Text type="secondary">{t('emptyState')}</Text>}
				>
					<DeckListActions mode="create" />
				</Empty>
			)}
		</div>
	);
}
