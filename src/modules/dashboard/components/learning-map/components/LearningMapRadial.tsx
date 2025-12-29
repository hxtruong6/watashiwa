'use client';

/**
 * Radial Variant
 *
 * Shows words in a radial/circular layout with connections.
 * Center: Most learned word or deck
 * Outer rings: Related words
 */

import { Card, theme, Typography } from 'antd';
import React, { useMemo } from 'react';

import type { LearningMapData, LearningMapNode } from '../types';

const { Text } = Typography;
const { useToken } = theme;

interface LearningMapRadialProps {
	data: LearningMapData | null;
	onNodeClick?: (node: LearningMapNode) => void;
	height?: number;
}

export default function LearningMapRadial({
	data,
	onNodeClick,
	height = 600,
}: LearningMapRadialProps) {
	const { token } = useToken();

	const radialLayout = useMemo(() => {
		if (!data || !data.nodes.length) return null;

		// Find center node (most reviewed or highest stability)
		const centerNode = data.nodes.reduce((prev, curr) =>
			curr.reviewCount > prev.reviewCount ? curr : prev,
		);

		// Group other nodes by connection to center
		const connectedNodes = data.nodes.filter(
			(node) =>
				node.id !== centerNode.id &&
				data.edges.some(
					(edge) =>
						(edge.source === centerNode.id && edge.target === node.id) ||
						(edge.source === node.id && edge.target === centerNode.id),
				),
		);

		const unconnectedNodes = data.nodes.filter(
			(node) => node.id !== centerNode.id && !connectedNodes.includes(node),
		);

		return { centerNode, connectedNodes, unconnectedNodes };
	}, [data]);

	if (!data || data.nodes.length === 0) {
		return (
			<Card>
				<Text type="secondary">No learning data available yet.</Text>
			</Card>
		);
	}

	if (!radialLayout) {
		return (
			<Card>
				<Text type="secondary">Processing radial layout...</Text>
			</Card>
		);
	}

	const centerX = 400;
	const centerY = height / 2;
	const radius1 = 120; // First ring (connected)
	const radius2 = 200; // Second ring (unconnected)

	const getNodeColor = (node: LearningMapNode): string => {
		if (node.isLeech) return token.colorError;
		if (node.stability > 21) return token.colorSuccess;
		return token.colorPrimary;
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
				Radial View: Central Word with Connections
			</Text>
			<svg width={800} height={height - 60} style={{ border: `1px solid ${token.colorBorder}` }}>
				{/* Draw edges */}
				{data.edges
					.filter(
						(edge) =>
							edge.source === radialLayout.centerNode.id ||
							edge.target === radialLayout.centerNode.id,
					)
					.map((edge, idx) => {
						const targetNode =
							edge.target === radialLayout.centerNode.id
								? data.nodes.find((n) => n.id === edge.source)!
								: data.nodes.find((n) => n.id === edge.target)!;

						const angle =
							(radialLayout.connectedNodes.indexOf(targetNode) /
								radialLayout.connectedNodes.length) *
							2 *
							Math.PI;

						const x = centerX + radius1 * Math.cos(angle);
						const y = centerY + radius1 * Math.sin(angle);

						return (
							<line
								key={idx}
								x1={centerX}
								y1={centerY}
								x2={x}
								y2={y}
								stroke={token.colorBorder}
								strokeWidth={1}
								opacity={0.3}
							/>
						);
					})}

				{/* Center node */}
				<circle
					cx={centerX}
					cy={centerY}
					r={20}
					fill={getNodeColor(radialLayout.centerNode)}
					onClick={() => onNodeClick?.(radialLayout.centerNode)}
					style={{ cursor: 'pointer' }}
				/>
				<text
					x={centerX}
					y={centerY - 30}
					textAnchor="middle"
					fontSize={12}
					fill={token.colorText}
				>
					{radialLayout.centerNode.wordSurface}
				</text>

				{/* Connected nodes (first ring) */}
				{radialLayout.connectedNodes.map((node, idx) => {
					const angle = (idx / radialLayout.connectedNodes.length) * 2 * Math.PI;
					const x = centerX + radius1 * Math.cos(angle);
					const y = centerY + radius1 * Math.sin(angle);

					return (
						<g key={node.id}>
							<circle
								cx={x}
								cy={y}
								r={12}
								fill={getNodeColor(node)}
								onClick={() => onNodeClick?.(node)}
								style={{ cursor: 'pointer' }}
							/>
							<text
								x={x}
								y={y - 18}
								textAnchor="middle"
								fontSize={10}
								fill={token.colorText}
							>
								{node.wordSurface}
							</text>
						</g>
					);
				})}

				{/* Unconnected nodes (second ring) */}
				{radialLayout.unconnectedNodes.slice(0, 12).map((node, idx) => {
					const angle = (idx / 12) * 2 * Math.PI;
					const x = centerX + radius2 * Math.cos(angle);
					const y = centerY + radius2 * Math.sin(angle);

					return (
						<g key={node.id}>
							<circle
								cx={x}
								cy={y}
								r={8}
								fill={getNodeColor(node)}
								opacity={0.6}
								onClick={() => onNodeClick?.(node)}
								style={{ cursor: 'pointer' }}
							/>
							<text
								x={x}
								y={y - 12}
								textAnchor="middle"
								fontSize={9}
								fill={token.colorTextSecondary}
							>
								{node.wordSurface}
							</text>
						</g>
					);
				})}
			</svg>
		</div>
	);
}

