'use client';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ItemCard from '@/components/dashboard/ItemCard';
import StatsOverview from '@/components/dashboard/StatsOverview';
import { getAllVocab } from '@/services/actions';
import { CardState, VocabDataType } from '@/types/common.types';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Flex, Grid, Layout, List, Table, Tag, Typography, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

const { Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function VocabListPage() {
	const t = useTranslations('Dashboard');
	const router = useRouter();
	const { token } = theme.useToken();
	const screens = useBreakpoint();
	const [data, setData] = useState<VocabDataType[]>([]);
	const [loading, setLoading] = useState(true);

	const [searchText, setSearchText] = useState('');
	const [filterState, setFilterState] = useState<any>('all'); // match internal keys
	const [sortState, setSortState] = useState<any>('date');

	// Deck Filter State
	const [selectedDecks, setSelectedDecks] = useState<string[]>([]);
	const [deckOptions, setDeckOptions] = useState<{ label: string; value: string }[]>([]);

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			const vocab = await getAllVocab();
			const formatted: VocabDataType[] = vocab.map((v) => {
				const card = v.studyCards?.[0];
				let stateText: CardState = 'new';
				if (card) {
					const map: CardState[] = ['new', 'learning', 'review', 'relearning'];
					stateText = map[card.state] || 'new';
				}

				return {
					id: v.id,
					wordSurface: v.wordSurface,
					readingKana: v.readingKana || '',
					meaning: v.meaning,
					hanViet: v.hanViet,
					deckName: v.deck?.title || 'Unknown Deck',
					state: stateText,
					nextReview: card?.due,
					createdAt: v.createdAt,
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
				item.wordSurface.toLowerCase().includes(searchText.toLowerCase()) ||
				item.meaning.toLowerCase().includes(searchText.toLowerCase()) ||
				item.readingKana.toLowerCase().includes(searchText.toLowerCase()) ||
				item.hanViet.toLowerCase().includes(searchText.toLowerCase());

			const matchesFilter = filterState === 'all' || item.state === filterState;

			const matchesDeck = selectedDecks.length === 0 || selectedDecks.includes(item.deckName);

			return matchesSearch && matchesFilter && matchesDeck;
		});

		// Sort
		result.sort((a, b) => {
			if (sortState === 'date') {
				// Newest first
				return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
			}
			if (sortState === 'alpha') {
				return a.wordSurface.localeCompare(b.wordSurface);
			}
			if (sortState === 'importance') {
				// Urgency: Next review date (earliest first).
				// If no review (New), put them last? Or first?
				// Usually "Due" items first.
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
		// Calculate stats based on TOTAL data (or filtered? usually global stats are helpful, but visible stats match the table)
		// Let's stick to global stats for the "Overview" cards, as they represent "My Learning" status.
		// If I select a deck, maybe I want to see stats for that deck?
		// Let's use `data` (all user vocab) for now to keep it stable.
		// User feedback: "Mastered" filter.
		// We track Review count.

		// Wait, if I filter by deck, I probably WANT to see stats for that deck.
		// Let's use a separate calculation for the currently visible set?
		// No, `processedData` is affected by pagination (not here, client side) and search.
		// Let's filter `data` only by `selectedDecks` for stats, but NOT by `filterState` (e.g. New/Learning).

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

	const columns: ColumnsType<VocabDataType> = [
		{
			title: t('word'),
			dataIndex: 'wordSurface',
			key: 'word',
			render: (text) => (
				<Text strong style={{ fontSize: 16 }}>
					{text}
				</Text>
			),
		},
		{
			title: t('reading'),
			dataIndex: 'readingKana',
			key: 'reading',
		},
		{
			title: t('meaning'),
			dataIndex: 'meaning',
			key: 'meaning',
		},
		{
			title: t('hanViet'),
			dataIndex: 'hanViet',
			key: 'hanViet',
			render: (text) => (text ? <Tag color="volcano">{text}</Tag> : '-'),
			responsive: ['md'],
		},
		{
			title: t('deck'),
			dataIndex: 'deckName',
			key: 'deck',
			render: (text) => <Tag>{text}</Tag>,
			responsive: ['lg'],
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
				{/* Header & Stats */}
				<Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
					<Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/')}>
						{t('back')}
					</Button>
				</Flex>

				<DashboardHeader
					title={t('vocabList')}
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

				{/* Desktop Table */}
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
					/* Mobile List */
					<List
						grid={{ gutter: 16, column: 1 }}
						dataSource={processedData}
						loading={loading}
						pagination={{ pageSize: 10, align: 'center' }}
						renderItem={(item) => (
							<List.Item>
								<ItemCard
									mainText={item.wordSurface}
									subText={item.readingKana}
									meaning={item.meaning}
									hanViet={item.hanViet}
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
