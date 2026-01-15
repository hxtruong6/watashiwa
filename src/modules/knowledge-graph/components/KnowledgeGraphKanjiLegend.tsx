'use client';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Card, Flex, Tag, Tooltip, Typography } from 'antd';

import type { KnowledgeGraphNode } from '../types';
import styles from './KnowledgeGraphPanel.module.css';

const { Text } = Typography;

type KanjiInfo = {
	kanji: string;
	color: string;
	nodeCount: number;
	nodeIds: Set<string>;
};

type KnowledgeGraphKanjiLegendProps = {
	kanjiInfo: KanjiInfo[];
	activeNode: KnowledgeGraphNode | null;
};

export function KnowledgeGraphKanjiLegend({
	kanjiInfo,
	activeNode,
}: KnowledgeGraphKanjiLegendProps) {
	if (kanjiInfo.length === 0) return null;

	return (
		<Card
			title={
				<Flex align="center" gap="small">
					<Text strong>Shared Kanji</Text>
					<Tooltip title="Hover over words to see which kanji they share with other words. Each color represents a different kanji.">
						<QuestionCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
					</Tooltip>
				</Flex>
			}
			size="small"
			className={styles.legendCard}
		>
			<Flex vertical gap="small">
				{kanjiInfo.map(({ kanji, color, nodeCount }) => {
					const isInActiveNode = activeNode?.sharedKanji.includes(kanji) ?? false;
					return (
						<Flex key={kanji} align="center" gap="small" justify="space-between">
							<Flex align="center" gap="small">
								<div
									style={{
										width: 16,
										height: 16,
										background: color,
										borderRadius: 4,
										border: `1px solid ${color}80`,
										flexShrink: 0,
									}}
								/>
								<Text strong style={{ fontSize: 16 }}>
									{kanji}
								</Text>
								{isInActiveNode && <Tag color="blue">Active</Tag>}
							</Flex>
							<Text type="secondary" style={{ fontSize: 12 }}>
								{nodeCount} {nodeCount === 1 ? 'word' : 'words'}
							</Text>
						</Flex>
					);
				})}
			</Flex>
		</Card>
	);
}
