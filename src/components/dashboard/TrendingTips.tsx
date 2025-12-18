'use client';

import React, { useEffect, useState } from 'react';
import { Card, Tag, Typography, Flex, theme } from 'antd';
import { LikeOutlined } from '@ant-design/icons';
import { getTrendingComments } from '@/services/comments';
import Link from 'next/link';

const { Text, Title } = Typography;
const { useToken } = theme;

import { useTranslations } from 'next-intl';

export default function TrendingTips() {
	const { token } = useToken();
	const tDashboard = useTranslations('Dashboard');
	const tComment = useTranslations('Comments');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [tips, setTips] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getTrendingComments().then((data) => {
			setTips(data);
			setLoading(false);
		});
	}, []);

	if (!loading && tips.length === 0) return null;

	return (
		<Card
			title={
				<Title level={4} style={{ margin: 0 }}>
					{tDashboard('communityHighlights')}
				</Title>
			}
			style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 24 }}
			styles={{ body: { padding: '12px' } }}
		>
			<Flex vertical gap="middle">
				{tips.map((item, index) => (
					<div
						key={index}
						style={{
							borderBottom: index < tips.length - 1 ? '1px solid #f0f0f0' : 'none',
							paddingBottom: 12,
						}}
					>
						<Flex vertical style={{ width: '100%' }} gap="4px">
							<Flex justify="space-between" align="center">
								<Link href={item.vocabId ? `/study?deckId=${item.vocab?.deckId || ''}` : '#'}>
									<Text strong style={{ fontSize: 16, color: token.colorPrimary }}>
										{item.vocab?.wordSurface || item.kanji?.kanji}
									</Text>
								</Link>
								<Tag color="geekblue">
									{{
										MNEMONIC: tComment('typeMnemonic'),
										USAGE_TIP: tComment('typeTip'),
										CULTURAL_NOTE: tComment('typeCulture'),
										EXAMPLE: tComment('typeExample'),
										GRAMMAR: tComment('typeGrammar'),
										GENERAL: tComment('typeGeneral'),
									}[item.type as string] || item.type}
								</Tag>
							</Flex>

							<Text type="secondary" style={{ fontSize: 13 }} ellipsis={{ tooltip: true }}>
								{item.content}
							</Text>

							<Flex justify="space-between" align="center" style={{ marginTop: 4 }}>
								<Text type="secondary" style={{ fontSize: 12 }}>
									by {item.author.name}
								</Text>
								<Space>
									<LikeOutlined /> {item.score}
								</Space>
							</Flex>
						</Flex>
					</div>
				))}
			</Flex>
			<div style={{ textAlign: 'center', marginTop: 12 }}>
				<Link href="/community" style={{ color: '#888', fontSize: 12 }}>
					View all activity
				</Link>
			</div>
		</Card>
	);
}

import { Space } from 'antd';
