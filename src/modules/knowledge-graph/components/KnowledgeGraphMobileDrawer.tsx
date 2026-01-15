'use client';
import { Drawer, Flex, Tag, Typography } from 'antd';

import type { KnowledgeGraphNode } from '../types';
import styles from './KnowledgeGraphPanel.module.css';

const { Text, Title } = Typography;

type KnowledgeGraphMobileDrawerProps = {
	open: boolean;
	node: KnowledgeGraphNode | null;
	onClose: () => void;
};

export function KnowledgeGraphMobileDrawer({
	open,
	node,
	onClose,
}: KnowledgeGraphMobileDrawerProps) {
	return (
		<Drawer open={open} placement="bottom" onClose={onClose} size="large">
			{node ? (
				<Flex vertical gap="small">
					<Title level={4}>{node.word}</Title>
					<Text type="secondary">{node.reading}</Text>
					<Text>{node.meaning}</Text>
					<Flex gap="small" wrap="wrap">
						{node.sharedKanji.map((kanji) => (
							<Tag key={kanji} color="geekblue" className={styles.nodeBadge}>
								{kanji}
							</Tag>
						))}
					</Flex>
					<Text type="secondary">Mastery weight: {node.weight.toFixed(2)}</Text>
				</Flex>
			) : (
				<Text type="secondary">Select a word to view details.</Text>
			)}
		</Drawer>
	);
}
