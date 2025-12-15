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
	theme,
	Modal,
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
	PlaySquareOutlined,
	CommentOutlined,
	CloseOutlined,
	SyncOutlined,
	RocketOutlined,
} from '@ant-design/icons';
import CommentDrawer from '@/components/comments/CommentDrawer';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useTranslations } from 'next-intl';
import SmartContentInput from '@/components/SmartContentInput';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/BackButton';
import FlashCard from '@/components/FlashCard';

const { Title, Paragraph, Text } = Typography;
const { useToken } = theme;

export default function DeckView({ deck, isOwner }: { deck: any; isOwner?: boolean }) {
	const { token } = useToken();
	const router = useRouter();
	const t = useTranslations('Decks');
	const [viewMode, setViewMode] = useState<'List' | 'Grid'>('Grid');

	const [activeTab, setActiveTab] = useState<'vocab' | 'kanji'>('vocab');

	// Comment Drawer State
	const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
	const [selectedEntityId, setSelectedEntityId] = useState<string | undefined>(undefined);
	const [selectedEntityType, setSelectedEntityType] = useState<'vocab' | 'kanji' | undefined>(
		undefined,
	);
	const [selectedEntityTitle, setSelectedEntityTitle] = useState<string | undefined>(undefined);

	// Flashcard Preview State
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewItem, setPreviewItem] = useState<any>(null);
	const [previewType, setPreviewType] = useState<'vocab' | 'kanji'>('vocab');
	const [isFlipped, setIsFlipped] = useState(false);

	const openComments = (item: any, type: 'vocab' | 'kanji') => {
		setSelectedEntityId(item.id);
		setSelectedEntityType(type);
		setSelectedEntityTitle(type === 'vocab' ? item.wordSurface : item.kanji);
		setCommentDrawerOpen(true);
	};

	const openPreview = (item: any, type: 'vocab' | 'kanji') => {
		setPreviewItem(item);
		setPreviewType(type);
		setIsFlipped(false);
		setPreviewOpen(true);
	};

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
					<div style={{ fontSize: 12, color: token.colorTextSecondary }}>{record.readingKana}</div>
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
			title: t('columnStatus'), // Or 'Actions'
			key: 'actions',
			width: 80,
			render: (_: any, record: any) => (
				<Button
					type="text"
					icon={<CommentOutlined />}
					onClick={(e) => {
						e.stopPropagation();
						openComments(record, 'vocab');
					}}
				/>
			),
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
					onRow={(record) => ({
						onClick: () => openPreview(record, type),
						style: { cursor: 'pointer' },
					})}
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
						<Card
							hoverable
							style={{ height: '100%', borderRadius: 12, borderColor: token.colorBorderSecondary }}
							className="hover-trigger"
							onClick={() => openPreview(item, type)}
						>
							<Flex vertical gap="small">
								<Flex justify="space-between" align="start">
									<Text strong style={{ fontSize: 20, color: token.colorPrimary }}>
										{type === 'vocab' ? item.wordSurface : item.kanji}
									</Text>
									<div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
										{item.hanViet && (
											<Tag color="gold" style={{ margin: 0 }}>
												{item.hanViet}
											</Tag>
										)}
										<div
											className={`hover-target ${item._count?.cardComments > 0 ? 'visible' : ''}`}
										>
											<Button
												size="small"
												type="text"
												icon={<CommentOutlined />}
												onClick={(e) => {
													e.stopPropagation(); // Prevent card click if we had one
													openComments(item, type);
												}}
											/>
										</div>
									</div>
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

	// Add Content Toggle
	const [showAddContent, setShowAddContent] = useState(false);

	// Construct flashcard data from preview item
	const getFlashCardData = () => {
		if (!previewItem) return null;
		if (previewType === 'vocab') {
			return {
				id: previewItem.id,
				vocab: previewItem,
				kanji: null,
				reviewLogs: [],
				state: 0, // Mock state for preview
			};
		} else {
			return {
				id: previewItem.id,
				kanji: previewItem,
				vocab: null,
				reviewLogs: [],
				state: 0,
			};
		}
	};

	const flashCardData = getFlashCardData();

	return (
		<div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
			<Flex align="center" gap="middle" style={{ marginBottom: 24 }}>
				<BackButton fallbackPath="/decks" />
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
				/>
			</Flex>

			{isOwner && (
				<div style={{ marginBottom: 24 }}>
					{showAddContent ? (
						<div style={{ position: 'relative' }}>
							<SmartContentInput deckId={deck.id} onSuccess={() => router.refresh()} />
							<Button
								type="text"
								icon={<CloseOutlined />}
								onClick={() => setShowAddContent(false)}
								style={{ position: 'absolute', right: 16, top: 16, zIndex: 10 }}
								title={t('close')}
							/>
						</div>
					) : (
						<Button
							type="dashed"
							icon={<EditOutlined />}
							onClick={() => setShowAddContent(true)}
							block
							style={{ height: 48, borderRadius: 12, fontSize: 16 }}
						>
							{t('addNewContent')}
						</Button>
					)}
				</div>
			)}

			{/* Hero / Stats Card */}
			<Card
				variant="borderless"
				style={{
					borderRadius: 16,
					boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
					marginBottom: 24,
					background: token.colorBgContainer,
				}}
			>
				<Flex vertical gap="middle">
					{/* Top Header */}
					<Flex justify="space-between" align="start" wrap="wrap" gap="small">
						<div>
							<Title level={2} style={{ margin: 0, color: token.colorPrimary }}>
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
							<Paragraph
								style={{
									margin: '12px 0 0',
									color: token.colorTextSecondary,
									maxWidth: 600,
								}}
							>
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
							<Link href={`/exercises?deckId=${deck.id}`} style={{ width: '100%' }}>
								<Button
									icon={<RocketOutlined />}
									size="large"
									style={{ width: '100%', height: 48, fontSize: 16 }}
								>
									{t('exercises.title')}
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
									valueStyle={{ color: token.colorWarning, fontSize: 20 }}
									prefix={<SyncOutlined spin={false} />}
								/>
								<Statistic
									title={t('statActive')}
									value={stats.learning + stats.review} // Learning + Review
									valueStyle={{ color: token.colorPrimary, fontSize: 20 }}
									prefix={<ReadOutlined />}
								/>
								<Statistic
									title={t('statMastered')}
									value={0} // Placeholder until strict 'Mastered' metric (e.g. maturity > 21 days)
									valueStyle={{ color: token.colorSuccess, fontSize: 20 }}
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

			<CommentDrawer
				open={commentDrawerOpen}
				onClose={() => setCommentDrawerOpen(false)}
				entityId={selectedEntityId}
				entityType={selectedEntityType}
				entityTitle={selectedEntityTitle}
			/>

			<Modal
				open={previewOpen}
				onCancel={() => setPreviewOpen(false)}
				footer={null}
				destroyOnClose
				width={600}
				centered
				style={{ maxWidth: '100vw' }}
				styles={{ body: { padding: 0 } }}
			>
				{flashCardData && (
					<div onClick={() => setIsFlipped(!isFlipped)} style={{ cursor: 'pointer' }}>
						<FlashCard
							card={flashCardData as any}
							showAnswer={isFlipped}
							showFurigana={true}
							autoPlayAudio="off"
						/>
					</div>
				)}
			</Modal>
		</div>
	);
}
