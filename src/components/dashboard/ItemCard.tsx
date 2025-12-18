import { CardState } from '@/types/common.types';
import { Card, Flex, Tag, Typography, theme } from 'antd';
import React from 'react';

const { Text, Title } = Typography;
const { useToken } = theme;

interface ItemCardProps {
	mainText: string;
	subText?: string;
	meaning: string;
	hanViet?: string;
	state: CardState;
	deckName?: string;
	onClick?: () => void;
}

export default function ItemCard({
	mainText,
	subText,
	meaning,
	hanViet,
	state,
	deckName,
	onClick,
}: ItemCardProps) {
	const { token } = useToken();

	let stateColor = 'default';
	if (state === 'learning') stateColor = 'processing';
	if (state === 'review') stateColor = 'success';
	if (state === 'relearning') stateColor = 'warning';
	if (state === 'mastered') stateColor = 'purple';

	return (
		<Card
			hoverable
			onClick={onClick}
			style={{ marginBottom: 16, borderColor: token.colorBorderSecondary }}
			styles={{ body: { padding: 16 } }}
		>
			<Flex justify="space-between" align="start">
				<Flex vertical gap={4}>
					<Title level={3} style={{ margin: 0 }}>
						{mainText}
					</Title>
					{subText && <Text type="secondary">{subText}</Text>}
				</Flex>
				<Tag color={stateColor}>{state}</Tag>
			</Flex>

			<Flex vertical gap={8} style={{ marginTop: 12 }}>
				<Text strong>{meaning}</Text>
				<Flex gap="small" wrap="wrap">
					{hanViet && <Tag color="volcano">{hanViet}</Tag>}
					{deckName && <Tag>{deckName}</Tag>}
				</Flex>
			</Flex>
		</Card>
	);
}
