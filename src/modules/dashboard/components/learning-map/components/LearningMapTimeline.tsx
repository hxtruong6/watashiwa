'use client';

/**
 * Timeline Variant
 *
 * Shows learning progression over time with words appearing chronologically.
 * X-axis: Time (days)
 * Y-axis: Words (grouped by deck or kanji root)
 */
import { Card, Typography, theme } from 'antd';
import React from 'react';

import type { LearningMapData, LearningMapNode } from '../types';

const { Text } = Typography;
const { useToken } = theme;

interface LearningMapTimelineProps {
	data: LearningMapData | null;
	onNodeClick?: (node: LearningMapNode) => void;
	height?: number;
}

export default function LearningMapTimeline({
	data,
	onNodeClick,
	height = 600,
}: LearningMapTimelineProps) {
	const { token } = useToken();

	if (!data || data.nodes.length === 0) {
		return (
			<Card>
				<Text type="secondary">No learning data available yet.</Text>
			</Card>
		);
	}

	// Group nodes by deck or kanji root
	const groupedNodes = new Map<string, LearningMapNode[]>();
	for (const node of data.nodes) {
		const key = node.deckName || node.kanjiRoots[0] || 'Other';
		if (!groupedNodes.has(key)) {
			groupedNodes.set(key, []);
		}
		groupedNodes.get(key)!.push(node);
	}

	// Calculate date range
	const dateRange = data.dateRange.end.getTime() - data.dateRange.start.getTime();

	return (
		<div
			style={{
				height,
				position: 'relative',
				background: token.colorBgContainer,
				borderRadius: token.borderRadius,
				padding: 16,
			}}
		>
			<Text strong style={{ marginBottom: 16, display: 'block' }}>
				Timeline View: Learning Progression Over Time
			</Text>
			<div
				style={{
					position: 'relative',
					width: '100%',
					height: height - 60,
					border: `1px solid ${token.colorBorder}`,
					borderRadius: token.borderRadius,
					background: token.colorBgLayout,
				}}
			>
				{/* Render timeline */}
				{Array.from(groupedNodes.entries()).map(([group, nodes], groupIndex) => {
					const yPosition = (groupIndex * (height - 60)) / groupedNodes.size + 20;

					return (
						<div key={group} style={{ position: 'absolute', top: yPosition, width: '100%' }}>
							<Text
								style={{
									position: 'absolute',
									left: 8,
									fontSize: 12,
									color: token.colorTextSecondary,
								}}
							>
								{group}
							</Text>
							{nodes.map((node) => {
								const xPosition =
									((node.learnedAt.getTime() - data.dateRange.start.getTime()) / dateRange) * 100;

								const nodeColor = node.isLeech
									? token.colorError
									: node.stability > 21
										? token.colorSuccess
										: token.colorPrimary;

								return (
									<div
										key={node.id}
										onClick={() => onNodeClick?.(node)}
										style={{
											position: 'absolute',
											left: `${xPosition}%`,
											top: 0,
											width: 8,
											height: 8,
											borderRadius: '50%',
											background: nodeColor,
											cursor: 'pointer',
											border: `2px solid ${token.colorBgContainer}`,
										}}
										title={`${node.wordSurface} - ${node.meaning}`}
									/>
								);
							})}
						</div>
					);
				})}
			</div>
		</div>
	);
}
