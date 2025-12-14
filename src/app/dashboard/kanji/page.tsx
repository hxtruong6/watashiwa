'use client';

import React, { useEffect, useState } from 'react';
import { Table, Typography, Tag, Space, Layout, Button, Flex, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getAllKanji } from '@/services/actions';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { Content } = Layout;

// Define a type for the data source
interface KanjiDataType {
	id: string;
	kanji: string;
	onyomi: string[];
	kunyomi: string[];
	meaning: string;
	hanViet: string;
	strokes: number;
	deckName: string;
	state: string; // Derived from studyCard
}

export default function KanjiListPage() {
	const router = useRouter();
	const { token } = theme.useToken();
	const [data, setData] = useState<KanjiDataType[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			const kanjiList = await getAllKanji();
			const formatted: KanjiDataType[] = kanjiList.map((k) => {
				const card = k.studyCards?.[0];
				let stateText = 'New';
				if (card) {
					// 0=New, 1=Learning, 2=Review, 3=Relearning
					const map = ['New', 'Learning', 'Review', 'Relearning'];
					stateText = map[card.state] || 'Unknown';
				}

				return {
					id: k.id,
					kanji: k.kanji,
					onyomi: k.onyomi,
					kunyomi: k.kunyomi,
					meaning: k.meaning,
					hanViet: k.hanViet,
					strokes: k.strokes,
					deckName: k.deck?.title || '-',
					state: stateText,
				};
			});
			setData(formatted);
			setLoading(false);
		}
		fetchData();
	}, []);

	const columns: ColumnsType<KanjiDataType> = [
		{
			title: 'Kanji',
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
			title: 'Han-Viet',
			dataIndex: 'hanViet',
			key: 'hanViet',
			render: (text) => (text ? <Tag color="volcano">{text}</Tag> : '-'),
		},
		{
			title: 'Meaning',
			dataIndex: 'meaning',
			key: 'meaning',
		},
		{
			title: 'Onyomi',
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
		},
		{
			title: 'Kunyomi',
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
		},
		{
			title: 'Strokes',
			dataIndex: 'strokes',
			key: 'strokes',
			width: 80,
			align: 'center',
		},
		{
			title: 'Deck',
			dataIndex: 'deckName',
			key: 'deck',
			render: (text) => <Tag>{text}</Tag>,
		},
		{
			title: 'State',
			dataIndex: 'state',
			key: 'state',
			render: (text) => {
				let color = 'default';
				if (text === 'Learning') color = 'processing';
				if (text === 'Review') color = 'success';
				if (text === 'Relearning') color = 'warning';
				return <Tag color={color}>{text}</Tag>;
			},
		},
	];

	return (
		<Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
			<Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
				<Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
					<Space>
						<Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/')} />
						<Title level={2} style={{ margin: 0 }}>
							Kanji List
						</Title>
					</Space>
				</Flex>

				<Table
					columns={columns}
					dataSource={data}
					rowKey="id"
					loading={loading}
					pagination={{ pageSize: 20 }}
				/>
			</Content>
		</Layout>
	);
}
