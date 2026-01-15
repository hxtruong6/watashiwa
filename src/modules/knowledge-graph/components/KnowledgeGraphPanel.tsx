'use client';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Flex, Grid, Popover, Segmented, Tooltip, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { useKnowledgeGraphOnboarding } from '../hooks/useKnowledgeGraphOnboarding';
import { useKnowledgeGraphSelection } from '../hooks/useKnowledgeGraphSelection';
import type { KnowledgeGraphPayload } from '../types';
import { type KanjiInfo, KnowledgeGraphCanvas } from './KnowledgeGraphCanvas';
import { KnowledgeGraphKanjiLegend } from './KnowledgeGraphKanjiLegend';
import { KnowledgeGraphList } from './KnowledgeGraphList';
import { KnowledgeGraphMobileDrawer } from './KnowledgeGraphMobileDrawer';
import styles from './KnowledgeGraphPanel.module.css';
import { KnowledgeGraphSidebar } from './KnowledgeGraphSidebar';

const { Title, Text } = Typography;

type KnowledgeGraphPanelProps = {
	payload: KnowledgeGraphPayload | null;
	errorMessage?: string;
};

type GraphLayout = 'force' | 'radial' | 'tree' | 'cards';
type GraphControls = {
	zoomIn: () => void;
	zoomOut: () => void;
	reset: () => void;
};

export function KnowledgeGraphPanel({ payload, errorMessage }: KnowledgeGraphPanelProps) {
	const screens = Grid.useBreakpoint();
	const isMobile = !screens.md;
	const nodes = payload?.nodes ?? [];
	const [layout, setLayout] = useState<GraphLayout>('cards');
	const graphControlsRef = useRef<GraphControls | null>(null);
	const { selectedNode, selectedNodeId, setSelectedNodeId } = useKnowledgeGraphSelection(nodes);
	const [kanjiInfo, setKanjiInfo] = useState<KanjiInfo[]>([]);
	const [isHoverLocked, setIsHoverLocked] = useState(false);
	const [lockedNodeId, setLockedNodeId] = useState<string | null>(null);
	const { showOnboarding, dismissOnboarding } = useKnowledgeGraphOnboarding();

	const handleLockToggle = () => {
		if (isHoverLocked) {
			setIsHoverLocked(false);
			setLockedNodeId(null);
		} else if (selectedNodeId) {
			setIsHoverLocked(true);
			setLockedNodeId(selectedNodeId);
		}
	};

	useEffect(() => {
		// Delay reset to ensure graph is rendered and ready
		const timer = setTimeout(() => {
			graphControlsRef.current?.reset();
		}, 100);
		return () => clearTimeout(timer);
	}, [layout]);

	if (errorMessage) {
		return <Alert type="error" message={errorMessage} showIcon />;
	}

	if (!payload || payload.nodes.length === 0) {
		return (
			<Card className={styles.emptyState}>
				<Title level={4}>Knowledge Graph</Title>
				<Text type="secondary">No graph data available yet.</Text>
			</Card>
		);
	}

	if (isMobile) {
		return (
			<Flex vertical gap="middle" className={styles.panel}>
				<KnowledgeGraphList nodes={payload.nodes} onSelect={setSelectedNodeId} />
				{payload.hasMore ? (
					<Button block type="default">
						View more connections
					</Button>
				) : null}
				<KnowledgeGraphMobileDrawer
					open={Boolean(selectedNode)}
					node={selectedNode}
					onClose={() => setSelectedNodeId(null)}
				/>
			</Flex>
		);
	}

	return (
		<Flex gap="large" align="start" className={styles.graphLayout}>
			<Card className={styles.graphCard} title="Knowledge Graph" size="small">
				<Flex gap="middle" align="center" wrap className={styles.graphHeader}>
					<Segmented
						options={[
							{ label: 'Force', value: 'force' },
							{ label: 'Tree', value: 'tree' },
							{ label: 'Radial', value: 'radial' },
							{ label: 'Cards', value: 'cards' },
						]}
						value={layout}
						onChange={(value) => setLayout(value as GraphLayout)}
					/>
					<Flex gap="small" className={styles.graphControlsRight}>
						{layout !== 'cards' ? (
							<>
								<Button onClick={() => graphControlsRef.current?.zoomOut()}>-</Button>
								<Button onClick={() => graphControlsRef.current?.zoomIn()}>+</Button>
							</>
						) : null}
						<Button onClick={() => graphControlsRef.current?.reset()}>Reset</Button>
						<Tooltip
							title={isHoverLocked ? 'Unlock hover highlight' : 'Lock hover highlight to explore'}
						>
							<Button
								type={isHoverLocked ? 'primary' : 'default'}
								icon={isHoverLocked ? <LockOutlined /> : <UnlockOutlined />}
								onClick={handleLockToggle}
								disabled={!selectedNodeId && !isHoverLocked}
							/>
						</Tooltip>
					</Flex>
				</Flex>
				<Popover
					open={showOnboarding}
					placement="top"
					title="Discover Shared Kanji"
					content={
						<Flex vertical gap="small">
							<Text>
								Hover over any word to see which kanji it shares with other words. Each color
								represents a different kanji.
							</Text>
							<Button type="primary" size="small" onClick={dismissOnboarding} block>
								Got it!
							</Button>
						</Flex>
					}
					overlayStyle={{ maxWidth: 280 }}
					onOpenChange={(open) => {
						if (!open) dismissOnboarding();
					}}
				>
					<div>
						<KnowledgeGraphCanvas
							nodes={payload.nodes}
							edges={payload.edges}
							selectedNodeId={selectedNodeId}
							onNodeSelect={setSelectedNodeId}
							layout={layout}
							centerNodeId={payload.centerNodeId}
							onGraphReady={(controls) => {
								graphControlsRef.current = controls;
							}}
							onKanjiInfoChange={setKanjiInfo}
							isHoverLocked={isHoverLocked}
							lockedNodeId={lockedNodeId}
						/>
					</div>
				</Popover>
			</Card>
			<Flex vertical gap="middle" style={{ width: 320, minWidth: 280 }}>
				<KnowledgeGraphSidebar selectedNode={selectedNode} />
				<KnowledgeGraphKanjiLegend kanjiInfo={kanjiInfo} activeNode={selectedNode} />
			</Flex>
		</Flex>
	);
}
