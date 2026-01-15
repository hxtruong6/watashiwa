'use client';
import { Card, Empty, Flex, Tag, Typography } from 'antd';

import type { KnowledgeGraphNode } from '../types';
import styles from './KnowledgeGraphPanel.module.css';

const { Title, Text } = Typography;

type KnowledgeGraphSidebarProps = {
	selectedNode: KnowledgeGraphNode | null;
};

export function KnowledgeGraphSidebar({ selectedNode }: KnowledgeGraphSidebarProps) {
	if (!selectedNode) {
		return (
			<Card className={styles.sidebarCard} size="small">
				<Empty className={styles.emptyState} description="Select a node to view details" />
			</Card>
		);
	}

	return (
		<Card className={styles.sidebarCard} size="small" title="Word Details">
			<Flex vertical gap="small">
				<Title level={4}>{selectedNode.word}</Title>
				<Text type="secondary">{selectedNode.reading}</Text>
				<Text>{selectedNode.meaning}</Text>
				<Flex gap="small" wrap="wrap">
					{selectedNode.sharedKanji.map((kanji) => (
						<Tag key={kanji} color="geekblue" className={styles.nodeBadge}>
							{kanji}
						</Tag>
					))}
				</Flex>
				<Text type="secondary">Mastery weight: {selectedNode.weight.toFixed(2)}</Text>
			</Flex>
		</Card>
	);
}
