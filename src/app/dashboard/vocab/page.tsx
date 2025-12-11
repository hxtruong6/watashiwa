'use client';

import React, { useEffect, useState } from 'react';
import { Table, Typography, Tag, Space, Layout, Button, Flex } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getAllVocab } from '@/services/actions';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { Content } = Layout;

// Define a type for the data source
interface VocabDataType {
	id: string;
	wordSurface: string;
	readingKana: string;
	meaning: string;
	hanViet: string;
	deckName: string;
	state: string; // Derived from studyCard
}

export default function VocabListPage() {
	const router = useRouter();
	const [data, setData] = useState<VocabDataType[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			const vocab = await getAllVocab();
			const formatted: VocabDataType[] = vocab.map((v) => {
				const card = v.studyCards?.[0];
				let stateText = 'New';
				if (card) {
					// 0=New, 1=Learning, 2=Review, 3=Relearning
					const map = ['New', 'Learning', 'Review', 'Relearning'];
					stateText = map[card.state] || 'Unknown';
				}

				return {
					id: v.id,
					wordSurface: v.wordSurface,
					readingKana: v.readingKana,
					meaning: v.meaning,
					hanViet: v.hanViet,
					deckName: v.deck?.title || '-',
					state: stateText,
				};
			});
			setData(formatted);
			setLoading(false);
		}
		fetchData();
	}, []);

	const columns: ColumnsType<VocabDataType> = [
		{
			title: 'Word',
			dataIndex: 'wordSurface',
			key: 'word',
			render: (text) => <Text strong>{text}</Text>,
		},
		{
			title: 'Reading',
			dataIndex: 'readingKana',
			key: 'reading',
		},
		{
			title: 'Meaning',
			dataIndex: 'meaning',
			key: 'meaning',
		},
		{
			title: 'Han-Viet',
			dataIndex: 'hanViet',
			key: 'hanViet',
			render: (text) => (text ? <Tag color="volcano">{text}</Tag> : '-'),
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
		<Layout style={{ minHeight: '100vh', background: '#fff' }}>
			<Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
				<Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
					<Space>
						<Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/')} />
						<Title level={2} style={{ margin: 0 }}>
							Vocabulary List
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
