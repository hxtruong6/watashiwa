'use client';

import { Card, Flex, Typography, theme } from 'antd';
import React from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface KanjiItem {
	kanji: string;
	han_viet: string;
	meaning: string;
}

interface KanjiBreakdownProps {
	breakdown: KanjiItem[];
}

export default function KanjiBreakdown({ breakdown }: KanjiBreakdownProps) {
	const { token } = useToken();
	if (!breakdown || breakdown.length === 0) return null;

	return (
		<Flex vertical gap="small" style={{ width: '100%', marginTop: 16 }}>
			<Text strong style={{ color: token.colorPrimary, fontSize: 14 }}>
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
							background: token.colorFillQuaternary, // Subtle contrast against card bg
							borderColor: token.colorBorderSecondary,
							textAlign: 'center',
						}}
						styles={{ body: { padding: '8px 12px' } }}
					>
						<Text
							style={{ fontSize: 24, display: 'block', color: token.colorPrimary, lineHeight: 1.2 }}
						>
							{item.kanji}
						</Text>
						<Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
							{item.han_viet}
						</Text>
						<Text style={{ fontSize: 13, display: 'block', marginTop: 4, color: token.colorText }}>
							{item.meaning}
						</Text>
					</Card>
				))}
			</Flex>
		</Flex>
	);
}
