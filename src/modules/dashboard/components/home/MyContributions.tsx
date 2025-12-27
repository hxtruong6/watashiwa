'use client';

import { getUserContributions } from '@/modules/community/community.actions';
import { FireOutlined, LikeOutlined } from '@ant-design/icons';
import { Card, Col, Flex, Row, Tag, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

const { Title, Text } = Typography;

export default function MyContributions() {
	const tDashboard = useTranslations('Dashboard');
	const tComment = useTranslations('Comments');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [comments, setComments] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getUserContributions()
			.then(setComments)
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	if (!loading && comments.length === 0) {
		return null; // Don't show if no contributions
	}

	return (
		<div style={{ marginTop: 32 }}>
			<Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
				<Title level={4} style={{ margin: 0 }}>
					<FireOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
					{tDashboard('yourTopTips')}
				</Title>
			</Flex>

			<Row gutter={[16, 16]}>
				{comments.map((item) => (
					<Col xs={24} sm={12} md={8} xl={6} key={item.id}>
						<Card size="small" hoverable style={{ height: '100%', borderRadius: 8 }}>
							<Flex vertical gap="small" justify="space-between" style={{ height: '100%' }}>
								<div>
									<Flex justify="space-between" align="start" style={{ marginBottom: 8 }}>
										<Text strong>{item.vocab ? item.vocab.wordSurface : item.kanji?.kanji}</Text>
										<Tag>
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
									<Text type="secondary" style={{ fontSize: 13 }} ellipsis={true}>
										{item.content}
									</Text>
								</div>

								<Flex justify="space-between" align="center" style={{ marginTop: 12 }}>
									<Text type="secondary" style={{ fontSize: 12 }}>
										<LikeOutlined /> {item.score}
									</Text>
									{/* Could link to deck/study here */}
								</Flex>
							</Flex>
						</Card>
					</Col>
				))}
			</Row>
		</div>
	);
}
