'use client';

import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { type Edge, MarkerType, type Node } from 'reactflow';
import 'reactflow/dist/style.css';

import { expandKanjiNode } from '../actions';
import { GraphEdge, GraphNode, NodeType } from '../types';
import { KanjiNode } from './nodes/KanjiNode';
import { WordNode } from './nodes/WordNode';

// Dynamically import ReactFlow to avoid SSR issues
const ReactFlow = dynamic(() => import('reactflow').then((mod) => mod.ReactFlow), { ssr: false });

const Background = dynamic(() => import('reactflow').then((mod) => mod.Background), { ssr: false });

const Controls = dynamic(() => import('reactflow').then((mod) => mod.Controls), { ssr: false });

interface OrigamiCanvasProps {
	initialNodes: GraphNode[];
	initialEdges: GraphEdge[];
}

// Custom node types for React Flow
const nodeTypes = {
	word: WordNode,
	kanji: KanjiNode,
};

export function OrigamiCanvas({ initialNodes, initialEdges }: OrigamiCanvasProps) {
	const [nodes, setNodes] = useState<Node[]>(
		initialNodes.map((node) => ({
			id: node.id,
			type: node.type,
			data: node.data,
			position: node.position || { x: 0, y: 0 },
		})),
	);
	const [edges, setEdges] = useState<Edge[]>(
		initialEdges.map((edge) => ({
			id: edge.id,
			source: edge.source,
			target: edge.target,
			label: edge.label,
			labelStyle: {
				fill: edge.type === 'ONYOMI' ? '#1890ff' : edge.type === 'KUNYOMI' ? '#eb2f96' : '#fa8c16',
				fontWeight: 'bold',
			},
			style: {
				stroke:
					edge.type === 'ONYOMI' ? '#1890ff' : edge.type === 'KUNYOMI' ? '#eb2f96' : '#fa8c16',
				strokeWidth: 2,
				strokeDasharray: edge.type === 'KUNYOMI' ? '5,5' : edge.type === 'IRREGULAR' ? '2,2' : '0',
			},
			markerEnd: {
				type: MarkerType.ArrowClosed,
				color: edge.type === 'ONYOMI' ? '#1890ff' : edge.type === 'KUNYOMI' ? '#eb2f96' : '#fa8c16',
			},
		})),
	);
	const [loading, setLoading] = useState(false);
	const [_selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

	const handleNodeClick = useCallback(async (_event: React.MouseEvent, node: Node) => {
		// Only expand kanji nodes
		if (node.type !== 'kanji') {
			return;
		}

		setLoading(true);
		setSelectedNodeId(node.id);

		try {
			const result = await expandKanjiNode({ kanjiId: node.id });

			if (result.success && result.data) {
				// Add new nodes and edges
				const newNodes = result.data.nodes.map((n) => ({
					id: n.id,
					type: n.type as NodeType,
					data: n.data,
					position: {
						x: Math.random() * 400 - 200, // Random position around center
						y: Math.random() * 400 - 200,
					},
				}));

				const newEdges = result.data.edges.map((e) => ({
					id: e.id,
					source: e.source,
					target: e.target,
					label: e.label,
					labelStyle: {
						fill: e.type === 'ONYOMI' ? '#1890ff' : e.type === 'KUNYOMI' ? '#eb2f96' : '#fa8c16',
						fontWeight: 'bold',
					},
					style: {
						stroke: e.type === 'ONYOMI' ? '#1890ff' : e.type === 'KUNYOMI' ? '#eb2f96' : '#fa8c16',
						strokeWidth: 2,
						strokeDasharray: e.type === 'KUNYOMI' ? '5,5' : e.type === 'IRREGULAR' ? '2,2' : '0',
					},
					markerEnd: {
						type: MarkerType.ArrowClosed,
						color: e.type === 'ONYOMI' ? '#1890ff' : e.type === 'KUNYOMI' ? '#eb2f96' : '#fa8c16',
					},
				}));

				setNodes((prev) => [...prev, ...newNodes]);
				setEdges((prev) => [...prev, ...newEdges] as Edge[]);

				// Re-center on clicked node (simple implementation)
				// In Phase 2, we'll add smooth transitions
			}
		} catch (error) {
			console.error('Failed to expand node:', error);
		} finally {
			setLoading(false);
		}
	}, []);

	if (loading && nodes.length === 0) {
		return <Skeleton active paragraph={{ rows: 8 }} />;
	}

	return (
		<div style={{ width: '100%', height: '100vh' }}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				onNodeClick={handleNodeClick}
				fitView
				minZoom={0.5}
				maxZoom={2.0}
			>
				<Background />
				<Controls />
			</ReactFlow>
		</div>
	);
}
