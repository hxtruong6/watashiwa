'use client';

/**
 * Network Variant
 *
 * Shows words as nodes connected by edges (etymology, temporal, semantic).
 * Uses force-directed layout similar to EtymologyGraph but with temporal data.
 */

import { Card, theme, Typography } from 'antd';
import React, { useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

import type { LearningMapData, LearningMapNode } from '../types';

const { Text } = Typography;
const { useToken } = theme;

interface LearningMapNetworkProps {
	data: LearningMapData | null;
	onNodeClick?: (node: LearningMapNode) => void;
	height?: number;
}

const COLORS = {
	mastered: '#708238', // Matcha Green
	learning: '#1E3A5F', // Indigo
	leech: '#E64A19', // Vermilion
	edge: {
		etymology: '#708238',
		temporal: '#1E3A5F',
		deck: '#D1D5DB',
		semantic: '#F59E0B',
	},
} as const;

export default function LearningMapNetwork({
	data,
	onNodeClick,
	height = 600,
}: LearningMapNetworkProps) {
	const { token } = useToken();

	const graphData = useMemo(() => {
		if (!data || !data.nodes || !data.edges) {
			return { nodes: [], links: [] };
		}

		return {
			nodes: data.nodes,
			links: data.edges.map((edge) => ({
				source: edge.source,
				target: edge.target,
				connectionType: edge.connectionType,
				strength: edge.strength,
			})),
		};
	}, [data]);

	if (!data || data.nodes.length === 0) {
		return (
			<Card>
				<Text type="secondary">No learning data available yet.</Text>
			</Card>
		);
	}

	const getNodeColor = (node: LearningMapNode): string => {
		if (node.isLeech) return COLORS.leech;
		if (node.stability > 21) return COLORS.mastered;
		return COLORS.learning;
	};

	const getNodeSize = (node: LearningMapNode): number => {
		const baseSize = 8;
		const stabilityMultiplier = Math.min(node.stability / 100, 1.0);
		return baseSize + stabilityMultiplier * 6;
	};

	const getLinkColor = (link: { connectionType?: string }): string => {
		const type = link.connectionType || 'deck';
		return COLORS.edge[type as keyof typeof COLORS.edge] || COLORS.edge.deck;
	};

	const getLinkWidth = (link: { strength?: number }): number => {
		return (link.strength || 0.5) * 3;
	};

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
				Network View: Word Connections (Etymology, Temporal, Deck)
			</Text>
			<ForceGraph2D
				graphData={graphData}
				nodeColor={(node: unknown) => {
					const n = node as LearningMapNode;
					return getNodeColor(n);
				}}
				nodeVal={(node: unknown) => {
					const n = node as LearningMapNode;
					return getNodeSize(n);
				}}
				nodeLabel={(node: unknown) => {
					const n = node as LearningMapNode;
					return `${n.wordSurface} (${n.meaning})`;
				}}
				linkColor={(link: unknown) => {
					const l = link as { connectionType?: string };
					return getLinkColor(l);
				}}
				linkWidth={(link: unknown) => {
					const l = link as { strength?: number };
					return getLinkWidth(l);
				}}
				onNodeClick={(node: unknown) => {
					const n = node as LearningMapNode;
					onNodeClick?.(n);
				}}
				width={800}
				height={height - 60}
				backgroundColor={token.colorBgLayout}
			/>
		</div>
	);
}

