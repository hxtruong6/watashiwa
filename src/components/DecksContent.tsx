'use client';

import React, { useState } from 'react';
import {
	Typography,
	Row,
	Col,
	Card,
	Button,
	Flex,
	Tag,
	Empty,
	Input,
	Segmented,
	theme,
} from 'antd';
import Link from 'next/link';
import { BookOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

interface DecksContentProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	decks: any[];
	userId: string;
}

export default function DecksContent({ decks, userId }: DecksContentProps) {
	const { token } = useToken();
	const t = useTranslations('Decks');
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState('');
	const [filter, setFilter] = useState<'all' | 'mine' | 'public'>('all');

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

	interface Deck {
		id: string;
		title: string;
		description: string;
		isPublic: boolean;
		authorId: string;
		headerImage: string;
		_count: {
			vocab: number;
			kanji: number;
		};
	}

	const filteredDecks = decks.filter((deck: Deck) => {
		const deckTitle = deck.title || '';
		const matchesSearch = deckTitle.toLowerCase().includes(searchTerm.toLowerCase());

		let matchesFilter = true;
		if (filter === 'mine') {
			matchesFilter = deck.authorId === userId;
		} else if (filter === 'public') {
			matchesFilter = deck.isPublic === true;
		}

		return matchesSearch && matchesFilter;
	});

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}
		>
			<Flex
				justify="space-between"
				align="center"
				style={{ marginBottom: 32 }}
				wrap="wrap"
				gap="small"
			>
				<motion.div variants={itemVariants}>
					<Title level={2} style={{ margin: 0, color: token.colorPrimary, fontSize: '1.75rem' }}>
						{t('libraryTitle')}
					</Title>
					<Text type="secondary" style={{ fontSize: '0.9rem' }}>
						{t('librarySubtitle')}
					</Text>
				</motion.div>
				<motion.div variants={itemVariants}>
					<Link href="/dashboard/decks">
						<Button type="primary" size="middle">
							{t('newDeck')}
						</Button>
					</Link>
				</motion.div>
			</Flex>

			<motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
				<Flex gap="middle" wrap="wrap">
					<Input
						placeholder={t('searchPlaceholder')}
						prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						style={{ maxWidth: 300 }}
						allowClear
					/>
					<Segmented
						options={[
							{ label: t('filterAll'), value: 'all' },
							{ label: t('filterMine'), value: 'mine' },
							{ label: t('filterPublic'), value: 'public' },
						]}
						value={filter}
						onChange={(val) => setFilter(val as 'all' | 'mine' | 'public')}
					/>
				</Flex>
			</motion.div>

			{filteredDecks.length > 0 ? (
				<Row gutter={[24, 24]}>
					{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
					{filteredDecks.map((deck: any) => (
						<Col xs={24} sm={12} md={8} lg={6} key={deck.id}>
							<motion.div variants={itemVariants} whileHover={{ y: -5 }} style={{ height: '100%' }}>
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
													alt={deck.title}
													style={{ width: '100%', height: '100%', objectFit: 'cover' }}
												/>
											) : (
												<BookOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
											)}
										</div>
										{deck.isPublic && <Tag color="blue">{t('publicTag')}</Tag>}
									</Flex>

									<Title level={4} style={{ margin: '0 0 8px', color: token.colorPrimary }}>
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
										<div onClick={(e) => e.stopPropagation()}>
											<Link href={`/decks/${deck.id}`}>
												<Button type="text" icon={<RightOutlined />} iconPlacement="end">
													{t('detailsButton')}
												</Button>
											</Link>
										</div>
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
						<Link href="/dashboard/decks">
							<Button type="primary">{t('createDeckButton')}</Button>
						</Link>
					</Empty>
				</motion.div>
			)}
		</motion.div>
	);
}
