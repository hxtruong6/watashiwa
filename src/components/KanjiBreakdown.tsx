'use client';

import React from 'react';
import { Typography, Flex, Card } from 'antd';

const { Text } = Typography;

interface KanjiItem {
	kanji: string;
	han_viet: string;
	meaning: string;
}

interface KanjiBreakdownProps {
	breakdown: KanjiItem[];
}

export default function KanjiBreakdown({ breakdown }: KanjiBreakdownProps) {
	if (!breakdown || breakdown.length === 0) return null;

	return (
		<Flex vertical gap="small" style={{ width: '100%', marginTop: 16 }}>
			<Text strong style={{ color: '#1E3A5F', fontSize: 14 }}>
				Kanji Breakdown
			</Text>
			<Flex wrap="wrap" gap="small">
				{breakdown.map((item, index) => (
					<Card
						key={index}
						size="small"
						style={{
							minWidth: 100,
							flex: '1 1 auto',
							background: '#fff',
							borderColor: '#e0e0e0',
							textAlign: 'center',
						}}
						bodyStyle={{ padding: '8px 12px' }}
					>
						<Text style={{ fontSize: 24, display: 'block', color: '#1E3A5F', lineHeight: 1.2 }}>
							{item.kanji}
						</Text>
						<Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
							{item.han_viet}
						</Text>
						<Text style={{ fontSize: 13, display: 'block', marginTop: 4, color: '#444' }}>
							{item.meaning}
						</Text>
					</Card>
				))}
			</Flex>
		</Flex>
	);
}
