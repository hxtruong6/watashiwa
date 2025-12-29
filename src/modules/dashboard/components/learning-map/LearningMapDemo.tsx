'use client';

/**
 * Learning Map Demo Showcase
 *
 * Displays all UI variations side by side for comparison.
 */

import {
	LearningMapHeatmap,
	LearningMapNetwork,
	LearningMapRadial,
	LearningMapTimeline,
} from './components';
import { generateLearningMapDemoData } from './utils/demo-data';
import type { LearningMapData, LearningMapNode } from './types';
import { Card, Flex, Segmented, Tabs, Typography, theme } from 'antd';
import React, { useEffect, useState } from 'react';

const { Title, Text } = Typography;
const { useToken } = theme;

export default function LearningMapDemo() {
	const { token } = useToken();
	const [data, setData] = useState<LearningMapData | null>(null);
	const [selectedVariant, setSelectedVariant] = useState<string>('timeline');
	const [selectedNode, setSelectedNode] = useState<LearningMapNode | null>(null);

	useEffect(() => {
		// Generate demo data
		const demoData = generateLearningMapDemoData();
		setData(demoData);
	}, []);

	const handleNodeClick = (node: LearningMapNode) => {
		setSelectedNode(node);
		console.log('Node clicked:', node);
	};

	const tabItems = [
		{
			key: 'timeline',
			label: 'Timeline View',
			children: (
				<LearningMapTimeline
					data={data}
					onNodeClick={handleNodeClick}
					height={500}
				/>
			),
		},
		{
			key: 'network',
			label: 'Network View',
			children: (
				<LearningMapNetwork
					data={data}
					onNodeClick={handleNodeClick}
					height={500}
				/>
			),
		},
		{
			key: 'heatmap',
			label: 'Heatmap View',
			children: (
				<LearningMapHeatmap
					data={data}
					onNodeClick={handleNodeClick}
					height={500}
				/>
			),
		},
		{
			key: 'radial',
			label: 'Radial View',
			children: (
				<LearningMapRadial
					data={data}
					onNodeClick={handleNodeClick}
					height={500}
				/>
			),
		},
	];

	return (
		<div
			style={{
				minHeight: '100vh',
				background: token.colorBgLayout,
				padding: '24px 16px',
			}}
		>
			<div style={{ maxWidth: 1200, margin: '0 auto' }}>
				<Card
					style={{
						marginBottom: 24,
						background: token.colorBgContainer,
					}}
				>
					<Flex vertical gap={16}>
						<Title level={2} style={{ margin: 0 }}>
							2D Learning Map - UI Variations Demo
						</Title>
						<Text type="secondary">
							Explore different visualization approaches for showing how users learn/remember words
							and how words connect to each other.
						</Text>
						{data && (
							<Flex gap={24} wrap="wrap">
								<Flex vertical>
									<Text type="secondary" style={{ fontSize: 12 }}>
										Total Words
									</Text>
									<Text strong style={{ fontSize: 20 }}>
										{data.totalNodes}
									</Text>
								</Flex>
								<Flex vertical>
									<Text type="secondary" style={{ fontSize: 12 }}>
										Connections
									</Text>
									<Text strong style={{ fontSize: 20 }}>
										{data.totalEdges}
									</Text>
								</Flex>
								<Flex vertical>
									<Text type="secondary" style={{ fontSize: 12 }}>
										Date Range
									</Text>
									<Text strong style={{ fontSize: 20 }}>
										{Math.ceil(
											(data.dateRange.end.getTime() - data.dateRange.start.getTime()) /
												(24 * 60 * 60 * 1000),
										)}{' '}
										days
									</Text>
								</Flex>
							</Flex>
						)}
					</Flex>
				</Card>

				{selectedNode && (
					<Card
						style={{
							marginBottom: 24,
							background: token.colorInfoBg,
							border: `1px solid ${token.colorInfoBorder}`,
						}}
					>
						<Flex vertical gap={8}>
							<Text strong>Selected Word:</Text>
							<Text>
								<strong>{selectedNode.wordSurface}</strong> - {selectedNode.meaning}
							</Text>
							<Flex gap={16} wrap="wrap">
								<Text type="secondary">
									Stability: {selectedNode.stability.toFixed(1)} days
								</Text>
								<Text type="secondary">Reviews: {selectedNode.reviewCount}</Text>
								<Text type="secondary">
									Learned: {selectedNode.learnedAt.toLocaleDateString()}
								</Text>
								{selectedNode.deckName && (
									<Text type="secondary">Deck: {selectedNode.deckName}</Text>
								)}
							</Flex>
						</Flex>
					</Card>
				)}

				<Card>
					<Tabs
						defaultActiveKey="timeline"
						items={tabItems}
						size="large"
						onChange={(key) => setSelectedVariant(key)}
					/>
				</Card>

				<Card style={{ marginTop: 24 }}>
					<Flex vertical gap={16}>
						<Title level={4}>UI Variation Descriptions</Title>
						<Flex vertical gap={12}>
							<div>
								<Text strong>Timeline View:</Text>
								<Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
									Shows learning progression chronologically. Words appear on the timeline
									when they were first learned. X-axis represents time, Y-axis groups words by
									deck or kanji root.
								</Text>
							</div>
							<div>
								<Text strong>Network View:</Text>
								<Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
									Force-directed graph showing word connections. Different edge colors represent
									different connection types (etymology, temporal, deck). Node size reflects
									memory strength.
								</Text>
							</div>
							<div>
								<Text strong>Heatmap View:</Text>
								<Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
									Grid visualization where each cell represents a word on a specific day. Color
									intensity shows review activity and learning progress over time.
								</Text>
							</div>
							<div>
								<Text strong>Radial View:</Text>
								<Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
									Circular layout with the most-learned word at the center. Connected words
									form rings around the center, showing relationships and learning clusters.
								</Text>
							</div>
						</Flex>
					</Flex>
				</Card>
			</div>
		</div>
	);
}

