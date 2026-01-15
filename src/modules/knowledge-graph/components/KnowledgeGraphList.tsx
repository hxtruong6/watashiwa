'use client';
import { Card, Flex, List, Tag, Typography } from 'antd';

import type { KnowledgeGraphNode } from '../types';
import styles from './KnowledgeGraphPanel.module.css';

const { Text, Title } = Typography;

type KnowledgeGraphListProps = {
	nodes: KnowledgeGraphNode[];
	onSelect: (nodeId: string) => void;
};

export function KnowledgeGraphList({ nodes, onSelect }: KnowledgeGraphListProps) {
	return (
		<Card size="small" title="Related Words You Know">
			<List
				dataSource={nodes}
				renderItem={(node) => (
					<List.Item className={styles.listItem} onClick={() => onSelect(node.id)}>
						<Flex vertical gap="xs" className={styles.listItemContent}>
							<Title level={5}>{node.word}</Title>
							<Text type="secondary">
								{node.reading} • {node.meaning}
							</Text>
							<Flex gap="small" wrap="wrap">
								{node.sharedKanji.map((kanji) => (
									<Tag key={kanji} color="geekblue" className={styles.nodeBadge}>
										{kanji}
									</Tag>
								))}
							</Flex>
						</Flex>
					</List.Item>
				)}
			/>
		</Card>
	);
}
