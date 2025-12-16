'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Layout, Table, Typography, Tag, Space, Button, Flex, theme, List, Grid } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { getAllKanji } from '@/services/actions';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsOverview from '@/components/dashboard/StatsOverview';
import ItemCard from '@/components/dashboard/ItemCard';
import type { ColumnsType } from 'antd/es/table';
import { useTranslations } from 'next-intl';
import { KanjiDataType, CardState } from '@/types/common.types';

const { Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function KanjiListPage() {
	const t = useTranslations('Dashboard');
	const router = useRouter();
	const { token } = theme.useToken();
	const screens = useBreakpoint();
	const [data, setData] = useState<KanjiDataType[]>([]);
	const [loading, setLoading] = useState(true);

	const [searchText, setSearchText] = useState('');
	const [filterState, setFilterState] = useState<any>('all');
	const [sortState, setSortState] = useState<any>('date');

	// Deck Filter State
	const [selectedDecks, setSelectedDecks] = useState<string[]>([]);
	const [deckOptions, setDeckOptions] = useState<{ label: string; value: string }[]>([]);

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			const kanjiList = await getAllKanji();
			const formatted: KanjiDataType[] = kanjiList.map((k) => {
				const card = k.studyCards?.[0];
				let stateText: CardState = 'new';
				if (card) {
					const map: CardState[] = ['new', 'learning', 'review', 'relearning'];
					stateText = map[card.state] || 'new';
				}

				return {
					id: k.id,
					kanji: k.kanji,
					onyomi: k.onyomi,
					kunyomi: k.kunyomi,
					meaning: k.meaning,
					hanViet: k.hanViet,
					strokes: k.strokes,
					deckName: k.deck?.title || 'Unknown Deck',
					state: stateText,
					nextReview: card?.due,
					createdAt: k.createdAt,
				};
			});
			setData(formatted);

			// Extract unique decks
			const decks = Array.from(new Set(formatted.map((i) => i.deckName))).sort();
			setDeckOptions(decks.map((d) => ({ label: d, value: d })));

			setLoading(false);
		}
		fetchData();
	}, []);

	// Filter & Sort Logic
	const processedData = useMemo(() => {
		const result = data.filter((item) => {
			const matchesSearch =
				item.kanji.includes(searchText) ||
				item.meaning.toLowerCase().includes(searchText.toLowerCase()) ||
				item.hanViet.toLowerCase().includes(searchText.toLowerCase());

			const matchesFilter = filterState === 'all' || item.state === filterState;

			const matchesDeck = selectedDecks.length === 0 || selectedDecks.includes(item.deckName);

			return matchesSearch && matchesFilter && matchesDeck;
		});

		// Sort
		result.sort((a, b) => {
			if (sortState === 'date') {
				return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
			}
			if (sortState === 'alpha') {
				return a.kanji.localeCompare(b.kanji);
			}
			if (sortState === 'importance') {
				const dateA = a.nextReview ? new Date(a.nextReview).getTime() : 9999999999999;
				const dateB = b.nextReview ? new Date(b.nextReview).getTime() : 9999999999999;
				return dateA - dateB;
			}
			return 0;
		});

		return result;
	}, [data, searchText, filterState, sortState, selectedDecks]);

	// Stats Calculation
	const stats = useMemo(() => {
		const statsSource =
			selectedDecks.length > 0 ? data.filter((d) => selectedDecks.includes(d.deckName)) : data;

		const total = statsSource.length;
		const newCount = statsSource.filter((d) => d.state === 'new').length;
		const learningCount = statsSource.filter(
			(d) => d.state === 'learning' || d.state === 'relearning',
		).length;
		const reviewCount = statsSource.filter((d) => d.state === 'review').length;

		return { total, newCount, learningCount, reviewCount };
	}, [data, selectedDecks]);

	const columns: ColumnsType<KanjiDataType> = [
		{
			title: t('kanji'),
			dataIndex: 'kanji',
			key: 'kanji',
			render: (text) => (
				<Text strong style={{ fontSize: 24 }}>
					{text}
				</Text>
			),
			width: 80,
			align: 'center',
		},
		{
			title: t('hanViet'),
			dataIndex: 'hanViet',
			key: 'hanViet',
			render: (text) => (text ? <Tag color="volcano">{text}</Tag> : '-'),
		},
		{
			title: t('meaning'),
			dataIndex: 'meaning',
			key: 'meaning',
		},
		{
			title: t('onyomi'),
			dataIndex: 'onyomi',
			key: 'onyomi',
			render: (list: string[]) => (
				<Space wrap>
					{list.map((r) => (
						<Tag key={r} color="red">
							{r}
						</Tag>
					))}
				</Space>
			),
			responsive: ['lg'],
		},
		{
			title: t('kunyomi'),
			dataIndex: 'kunyomi',
			key: 'kunyomi',
			render: (list: string[]) => (
				<Space wrap>
					{list.map((r) => (
						<Tag key={r} color="green">
							{r}
						</Tag>
					))}
				</Space>
			),
			responsive: ['lg'],
		},
		{
			title: t('strokes'),
			dataIndex: 'strokes',
			key: 'strokes',
			width: 80,
			align: 'center',
			responsive: ['md'],
		},
		{
			title: t('deck'),
			dataIndex: 'deckName',
			key: 'deck',
			render: (text) => <Tag>{text}</Tag>,
			responsive: ['xl'],
		},
		{
			title: t('state'),
			dataIndex: 'state',
			key: 'state',
			render: (text) => {
				let color = 'default';
				if (text === 'learning') color = 'processing';
				if (text === 'review') color = 'success';
				if (text === 'relearning') color = 'warning';
				return (
					<Tag color={color} style={{ minWidth: 60, textAlign: 'center' }}>
						{text.charAt(0).toUpperCase() + text.slice(1)}
					</Tag>
				);
			},
		},
	];

	return (
		<Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
			<Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
				<Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
					<Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/')}>
						{t('back')}
					</Button>
				</Flex>

				<DashboardHeader
					title={t('kanjiList')}
					onSearch={setSearchText}
					onFilterChange={setFilterState}
					currentFilter={filterState}
					onSortChange={setSortState}
					currentSort={sortState}
					// Deck Filter
					deckOptions={deckOptions}
					selectedDecks={selectedDecks}
					onDeckFilterChange={setSelectedDecks}
				/>

				<StatsOverview
					total={stats.total}
					newCount={stats.newCount}
					learningCount={stats.learningCount}
					masteredCount={stats.reviewCount}
				/>

				{screens.md ? (
					<Table
						columns={columns}
						dataSource={processedData}
						rowKey="id"
						loading={loading}
						pagination={{ pageSize: 20 }}
						scroll={{ x: true }}
						style={{
							borderRadius: 12,
							overflow: 'hidden',
							boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
						}}
					/>
				) : (
					<List
						grid={{ gutter: 16, column: 1 }}
						dataSource={processedData}
						loading={loading}
						pagination={{ pageSize: 10, align: 'center' }}
						renderItem={(item) => (
							<List.Item>
								<ItemCard
									mainText={item.kanji}
									subText={`${item.hanViet}`}
									meaning={item.meaning}
									hanViet={`${item.onyomi.join(', ')} / ${item.kunyomi.join(', ')}`}
									state={item.state}
									deckName={item.deckName}
								/>
							</List.Item>
						)}
					/>
				)}
			</Content>
		</Layout>
	);
}
