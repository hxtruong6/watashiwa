/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import {
	Typography,
	Button,
	Card,
	List,
	Tag,
	Flex,
	Divider,
	Breadcrumb,
	Empty,
	Tabs,
	Segmented,
	Table,
	Progress,
	Statistic,
	Row,
	Col,
} from 'antd';
import {
	ReadOutlined,
	TeamOutlined,
	GlobalOutlined,
	HomeOutlined,
	AppstoreOutlined,
	BarsOutlined,
	EditOutlined,
	CheckCircleOutlined,
	SyncOutlined,
	PlaySquareOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useTranslations } from 'next-intl';

const { Title, Paragraph, Text } = Typography;

export default function DeckView({ deck }: { deck: any }) {
	const t = useTranslations('Decks');
	const [viewMode, setViewMode] = useState<'List' | 'Grid'>('Grid');

	const [activeTab, setActiveTab] = useState<'vocab' | 'kanji'>('vocab');

	const stats = deck.stats || {
		total: 0,
		started: 0,
		new: 0,
		learning: 0,
		review: 0,
		unseen: 0,
	};
	const percentLearned = stats.total > 0 ? Math.round((stats.started / stats.total) * 100) : 0;

	// Trigger confetti if deck is fully learned
	React.useEffect(() => {
		if (percentLearned === 100) {
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 },
			});
		}
	}, [percentLearned]);

	// --- Vocab Columns ---
	const vocabColumns = [
		{
			title: t('columnWord'),
			dataIndex: 'wordSurface',
			key: 'wordSurface',

			render: (text: string, record: any) => (
				<div>
					<Text strong style={{ fontSize: 16 }}>
						{text}
					</Text>
					<div style={{ fontSize: 12, color: '#888' }}>{record.readingKana}</div>
				</div>
			),

			sorter: (a: any, b: any) => a.wordSurface.localeCompare(b.wordSurface),
		},
		{
			title: t('columnMeaning'),
			dataIndex: 'meaning',
			key: 'meaning',

			sorter: (a: any, b: any) => a.meaning.localeCompare(b.meaning),
		},
		{
			title: t('columnHanViet'),
			dataIndex: 'hanViet',
			key: 'hanViet',
			responsive: ['sm'],
		},
		{
			title: t('columnStatus'),
			key: 'status',

			render: () => {
				// Assuming we joined studyCard logic or similar, but complex in Table.
				// For now, if no studyCard link in this view, we can't show status easily without extra data.
				// Let's check if the deck prop includes study status.
				// If not, we might skipped this column or show "Not Started".
				// The current `getDeck` might not join StudyCard for ALL items for performance.
				// Let's assume we don't have per-user card status here yet unless passed.
				// Placeholder:
				return <Tag color="default">N/A</Tag>;
			},
		},
	];

	// --- Kanji Columns ---
	const kanjiColumns = [
		{
			title: t('columnKanji'),
			dataIndex: 'kanji',
			key: 'kanji',

			render: (text: string) => (
				<Text strong style={{ fontSize: 20 }}>
					{text}
				</Text>
			),

			sorter: (a: any, b: any) => a.kanji.localeCompare(b.kanji),
		},
		{
			title: t('columnMeaning'),
			dataIndex: 'meaning',
			key: 'meaning',
		},
		{
			title: t('columnOnyomi'),
			dataIndex: 'onyomi',
			key: 'onyomi',

			render: (onyomi: string[]) => (
				<Flex gap="4px" wrap="wrap">
					{onyomi.map((r) => (
						<Tag key={r} color="geekblue" style={{ marginRight: 0 }}>
							{r}
						</Tag>
					))}
				</Flex>
			),
		},
		{
			title: t('columnKunyomi'),
			dataIndex: 'kunyomi',
			key: 'kunyomi',

			render: (kunyomi: string[]) => (
				<Flex gap="4px" wrap="wrap">
					{kunyomi.map((r) => (
						<Tag key={r} color="cyan" style={{ marginRight: 0 }}>
							{r}
						</Tag>
					))}
				</Flex>
			),
		},
	];

	// --- Render Content Helper ---
	const renderContent = (type: 'vocab' | 'kanji', data: any[]) => {
		if (!data || data.length === 0) {
			return <Empty description={t('noItems', { type })} />;
		}

		if (viewMode === 'List') {
			// Table View
			return (
				<Table
					columns={
						type === 'vocab'
							? (vocabColumns as any) // Status might be tricky
							: (kanjiColumns as any)
					}
					dataSource={data}
					rowKey="id"
					pagination={{ pageSize: 20 }}
				/>
			);
		}

		// Grid View
		return (
			<List
				grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
				dataSource={data}
				renderItem={(item: any) => (
					<List.Item>
						<Card hoverable style={{ height: '100%', borderRadius: 12 }}>
							<Flex vertical gap="small">
								<Flex justify="space-between" align="start">
									<Text strong style={{ fontSize: 20, color: '#1E3A5F' }}>
										{type === 'vocab' ? item.wordSurface : item.kanji}
									</Text>
									{item.hanViet && <Tag color="gold">{item.hanViet}</Tag>}
								</Flex>
								{type === 'vocab' && <Text type="secondary">{item.readingKana}</Text>}
								<div style={{ minHeight: 40 }}>
									<Text>{item.meaning}</Text>
								</div>
							</Flex>
						</Card>
					</List.Item>
				)}
			/>
		);
	};

	// Counts
	const vocabCount = deck.vocab ? deck.vocab.length : 0;
	// Use deck.kanji if available, else empty
	const kanjiCount = deck.kanji ? deck.kanji.length : 0;

	const tabItems = [
		{
			key: 'vocab',
			label: (
				<span>
					<ReadOutlined /> {t('tabVocab', { count: vocabCount })}
				</span>
			),
			children: renderContent('vocab', deck.vocab || []),
		},
		{
			key: 'kanji',
			label: (
				<span>
					<EditOutlined /> {t('tabKanji', { count: kanjiCount })}
				</span>
			),
			children: renderContent('kanji', deck.kanji || []),
		},
	];

	return (
		<div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
			<Breadcrumb
				items={[
					{
						title: (
							<Link href="/">
								<HomeOutlined />
							</Link>
						),
					},
					{ title: <Link href="/decks">{t('libraryTitle')}</Link> },
					{ title: deck.title },
				]}
				style={{ marginBottom: 24 }}
			/>

			{/* Hero / Stats Card */}
			<Card
				variant="borderless"
				style={{
					borderRadius: 16,
					boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
					marginBottom: 24,
					background: '#fff',
				}}
			>
				<Flex vertical gap="middle">
					{/* Top Header */}
					<Flex justify="space-between" align="start" wrap="wrap" gap="small">
						<div>
							<Title level={2} style={{ margin: 0, color: '#1E3A5F' }}>
								{deck.title}
							</Title>
							<div style={{ marginTop: 8 }}>
								{deck.isPublic ? (
									<Tag icon={<GlobalOutlined />} color="green">
										{t('publicTag')}
									</Tag>
								) : (
									<Tag icon={<TeamOutlined />} color="blue">
										Private
									</Tag>
								)}
								<Tag>{t('itemsCount', { count: vocabCount + kanjiCount })}</Tag>
							</div>
							<Paragraph style={{ margin: '12px 0 0', color: '#555', maxWidth: 600 }}>
								{deck.description || t('noDescription')}
							</Paragraph>
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 }}>
							<Link href={`/study?deckId=${deck.id}`} style={{ width: '100%' }}>
								<Button
									type="primary"
									icon={<PlaySquareOutlined />}
									size="large"
									style={{ width: '100%', height: 48, fontSize: 18 }}
								>
									{t('playButton')}
								</Button>
							</Link>
							{stats.unseen > 0 && (
								<Tag
									color="geekblue"
									style={{ textAlign: 'center', margin: 0, padding: 8, fontSize: 13 }}
								>
									{t('newItemsAvailable', { count: stats.unseen })}
								</Tag>
							)}
						</div>
					</Flex>

					<Divider style={{ margin: '12px 0' }} />

					{/* Progress Section */}
					<Row gutter={[24, 24]} align="middle">
						<Col xs={24} md={14}>
							<Flex vertical gap="small">
								<Flex justify="space-between">
									<Text strong>{t('overallProgress')}</Text>
									<Text type="secondary">
										{t('learnedCount', { started: stats.started, total: stats.total })}
									</Text>
								</Flex>
								<Progress
									percent={percentLearned}
									strokeColor={{
										'0%': '#108ee9',
										'100%': '#87d068',
									}}
									strokeWidth={12}
								/>
							</Flex>
						</Col>
						<Col xs={24} md={10}>
							<Flex justify="space-around">
								<Statistic
									title={t('statUnseen')}
									value={stats.unseen}
									valueStyle={{ color: '#faad14', fontSize: 20 }}
									prefix={<SyncOutlined spin={false} />}
								/>
								<Statistic
									title={t('statActive')}
									value={stats.learning + stats.review} // Learning + Review
									valueStyle={{ color: '#1890ff', fontSize: 20 }}
									prefix={<ReadOutlined />}
								/>
								<Statistic
									title={t('statMastered')}
									value={0} // Placeholder until strict 'Mastered' metric (e.g. maturity > 21 days)
									valueStyle={{ color: '#52c41a', fontSize: 20 }}
									prefix={<CheckCircleOutlined />}
								/>
							</Flex>
						</Col>
					</Row>
				</Flex>
			</Card>

			{/* Filter & Tabs Section */}
			<Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
				<Title level={4} style={{ margin: 0 }}>
					{t('deckContentsTitle')}
				</Title>
				<Segmented
					options={[
						{ value: 'Grid', icon: <AppstoreOutlined /> },
						{ value: 'List', icon: <BarsOutlined /> },
					]}
					value={viewMode}
					onChange={(val) => setViewMode(val as 'Grid' | 'List')}
				/>
			</Flex>

			<Tabs
				activeKey={activeTab}
				onChange={(key) => setActiveTab(key as any)}
				items={tabItems}
				type="card"
			/>
		</div>
	);
}
