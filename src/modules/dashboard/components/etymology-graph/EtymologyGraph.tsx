'use client';

/**
 * Etymology Graph Component
 *
 * Interactive 2D force-directed graph visualization showing semantic connections
 * between learned words via shared kanji roots (Hán Việt etymology).
 *
 * Features:
 * - Force-directed layout (automatic positioning)
 * - Node colors based on SRS stage (Zen aesthetic)
 * - Hover tooltips (word surface, meaning, stability)
 * - Click handler (navigate to word detail)
 * - Zoom/pan controls
 * - Responsive sizing
 *
 * Performance:
 * - Limits to 50 nodes (prevent overload)
 * - Debounced hover events
 * - Memoized graph data processing
 */
import { Collapse, theme } from 'antd';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

import type { EtymologyGraphData, EtymologyGraphEdge, EtymologyGraphNode } from './types';

const { useToken } = theme;

// Zen color palette (matches Memory Garden)
const COLORS = {
	mastered: '#708238', // Matcha Green (stability > 21)
	learning: '#1E3A5F', // Indigo (stability ≤ 21)
	leech: '#E64A19', // Vermilion (lapses ≥ 3)
	edge: '#D1D5DB', // Light gray (subtle connections)
	hover: '#F59E0B', // Amber (hover state)
} as const;

interface EtymologyGraphProps {
	/** Graph data (nodes + edges) */
	data: EtymologyGraphData | null;
	/** Callback when a node is clicked */
	onNodeClick?: (node: EtymologyGraphNode) => void;
	/** Height of the graph container */
	height?: number;
	width?: number;
	/** Show controls (zoom, pan) */
	showControls?: boolean;
	/** Loading state */
	loading?: boolean;
}

/**
 * Calculate node color based on SRS stage and stability
 * Matches Memory Garden color scheme (Zen aesthetic)
 */
function getNodeColor(node: EtymologyGraphNode): string {
	if (node.isLeech) {
		return COLORS.leech; // Vermilion for leeches
	}
	if (node.stability > 21) {
		return COLORS.mastered; // Matcha Green for mastered
	}
	return COLORS.learning; // Indigo for learning
}

/**
 * Calculate node size based on stability
 * Larger nodes = higher stability (more mastered)
 * Increased base size for better visibility
 */
function getNodeSize(node: EtymologyGraphNode): number {
	const baseSize = 10; // Increased from 8 to 10 for better visibility
	const stabilityMultiplier = Math.min(node.stability / 100, 1.0); // Normalize to 0-1
	return baseSize + stabilityMultiplier * 8; // Range: 10-18 (increased from 8-14)
}

export default function EtymologyGraph({
	data,
	onNodeClick,
	height = 600,
	loading = false,
	width = 800,
}: EtymologyGraphProps) {
	// Note: showControls prop is reserved for future use (zoom/pan UI controls)
	const { token } = useToken();
	const [hoveredNode, setHoveredNode] = useState<EtymologyGraphNode | null>(null);
	const [hoveredEdge, setHoveredEdge] = useState<EtymologyGraphEdge | null>(null);
	const [graphWidth, setGraphWidth] = useState(width);
	const [isExplanationExpanded, setIsExplanationExpanded] = useState(true);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const graphRef = useRef<any>(null); // react-force-graph-2d doesn't export types

	// Calculate graph width on mount and resize (debounced for performance)
	React.useEffect(() => {
		const updateWidth = () => {
			if (typeof window !== 'undefined') {
				// Defensive: Ensure width is positive and reasonable
				const calculatedWidth = Math.max(400, window.innerWidth - 64);
				setGraphWidth(calculatedWidth);
			}
		};

		// Initial calculation
		updateWidth();

		// Debounce resize events to prevent excessive re-renders
		let resizeTimeout: NodeJS.Timeout;
		const handleResize = () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(updateWidth, 150); // 150ms debounce
		};

		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
			clearTimeout(resizeTimeout);
		};
	}, []);

	// Memoize graph data to prevent unnecessary re-renders
	const graphData = useMemo(() => {
		if (!data || !data.nodes || !data.edges) {
			return { nodes: [], links: [] };
		}

		// Initialize node positions to spread them out (prevent all nodes at origin)
		// Don't set x/y if they already exist (allow force simulation to work)
		const nodesWithPositions = data.nodes.map((node, index) => {
			// Distribute nodes in a circle initially to prevent clustering at origin
			const angle = (index / data.nodes.length) * 2 * Math.PI;
			const radius = Math.sqrt(data.nodes.length) * 80; // Scale radius with node count
			const nodeWithPos = { ...node };
			// Only set initial position if node doesn't have one (first render)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			if (!(node as any).x && !(node as any).y) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(nodeWithPos as any).x = Math.cos(angle) * radius;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(nodeWithPos as any).y = Math.sin(angle) * radius;
			}
			return nodeWithPos;
		});

		// Transform edges to links format expected by react-force-graph
		const links = data.edges.map((edge) => ({
			source: edge.source,
			target: edge.target,
			sharedRoot: edge.sharedRoot,
		}));

		return {
			nodes: nodesWithPositions,
			links,
		};
	}, [data]);

	// Configure force simulation on first engine tick
	const hasConfiguredForces = useRef(false);

	// Handle node click
	const handleNodeClick = useCallback(
		(node: EtymologyGraphNode) => {
			if (onNodeClick) {
				onNodeClick(node);
			}
		},
		[onNodeClick],
	);

	// Handle node hover (for tooltip)
	const handleNodeHover = useCallback((node: EtymologyGraphNode | null) => {
		setHoveredNode(node);
	}, []);

	// Handle edge hover (for tooltip showing shared kanji root)
	const handleLinkHover = useCallback(
		(link: unknown) => {
			if (!link) {
				setHoveredEdge(null);
				return;
			}

			const l = link as {
				source: EtymologyGraphNode;
				target: EtymologyGraphNode;
				sharedRoot?: string;
			};
			if (!l.source || !l.target) {
				setHoveredEdge(null);
				return;
			}

			// Find the edge in our data to get sharedRoot
			const edge = data?.edges.find(
				(e) =>
					(e.source === (l.source as EtymologyGraphNode).id &&
						e.target === (l.target as EtymologyGraphNode).id) ||
					(e.source === (l.target as EtymologyGraphNode).id &&
						e.target === (l.source as EtymologyGraphNode).id),
			);

			if (edge) {
				setHoveredEdge(edge);
			} else {
				setHoveredEdge(null);
			}
		},
		[data],
	);

	// Memoize node color function to prevent recreation on every render
	const getNodeColorMemoized = useCallback(
		(node: EtymologyGraphNode): string => {
			// Highlight hovered node
			if (hoveredNode && hoveredNode.id === node.id) {
				return COLORS.hover;
			}
			return getNodeColor(node);
		},
		[hoveredNode],
	);

	// Memoize node size function (stable, doesn't depend on state)
	const getNodeSizeMemoized = useCallback((node: EtymologyGraphNode): number => {
		return getNodeSize(node);
	}, []);

	// Custom node rendering with always-visible labels
	const renderNodeWithLabel = useCallback(
		(node: unknown, ctx: CanvasRenderingContext2D, globalScale: number) => {
			const n = node as EtymologyGraphNode;
			if (!n || !n.wordSurface) {
				return;
			}

			const nodeSize = getNodeSizeMemoized(n);
			const nodeColor = getNodeColorMemoized(n);

			// Draw circle (node) - make it more visible
			ctx.beginPath();
			ctx.arc(0, 0, nodeSize, 0, 2 * Math.PI, false);
			ctx.fillStyle = nodeColor;
			ctx.fill();

			// Add border for better contrast
			ctx.strokeStyle = token.colorBorder;
			ctx.lineWidth = Math.max(1, 2 / globalScale);
			ctx.stroke();

			// Enable text rendering optimizations
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';

			// Calculate font size - ensure minimum readable size
			const baseFontSize = Math.max(12, nodeSize * 1.5); // Increased from 1.2 to 1.5
			const fontSize = Math.max(10, Math.min(baseFontSize / globalScale, 16)); // Increased max from 14 to 16, min 10
			ctx.font = `bold ${Math.round(fontSize)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Noto Sans JP', sans-serif`;

			// Measure text width for truncation
			const maxWidth = nodeSize * 3; // Increased from 2.5 to 3 for more space
			let displayText = n.wordSurface;

			// Truncate if text is too long
			const textMetrics = ctx.measureText(displayText);
			if (textMetrics.width > maxWidth) {
				// Truncate with ellipsis
				while (ctx.measureText(displayText + '...').width > maxWidth && displayText.length > 0) {
					displayText = displayText.slice(0, -1);
				}
				displayText += '...';
			}

			// Draw word surface (kanji) with outline for better readability
			const textY = -nodeSize - fontSize * 0.9;

			// Draw text outline (white stroke) for contrast
			ctx.strokeStyle = '#FFFFFF';
			ctx.lineWidth = Math.max(2, 3 / globalScale);
			ctx.lineJoin = 'round';
			ctx.miterLimit = 2;
			ctx.strokeText(displayText, 0, textY);

			// Draw text fill (dark color for contrast)
			ctx.fillStyle = '#1F2937'; // Dark gray for better contrast
			ctx.fillText(displayText, 0, textY);

			// Draw meaning (smaller, below node) - only if node is large enough
			if (nodeSize >= 10 && n.meaning) {
				const meaningFontSize = Math.max(9, Math.round(fontSize * 0.75)); // Increased min from 8 to 9
				ctx.font = `${meaningFontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;

				// Truncate meaning if needed
				let meaningText = n.meaning;
				const meaningMetrics = ctx.measureText(meaningText);
				if (meaningMetrics.width > maxWidth) {
					while (ctx.measureText(meaningText + '...').width > maxWidth && meaningText.length > 0) {
						meaningText = meaningText.slice(0, -1);
					}
					meaningText += '...';
				}

				const meaningY = nodeSize + meaningFontSize * 0.9;

				// Draw meaning with outline for readability
				ctx.strokeStyle = '#FFFFFF';
				ctx.lineWidth = Math.max(1.5, 2 / globalScale);
				ctx.strokeText(meaningText, 0, meaningY);

				// Draw meaning fill
				ctx.fillStyle = '#4B5563'; // Medium gray for secondary text
				ctx.fillText(meaningText, 0, meaningY);
			}
		},
		[getNodeSizeMemoized, getNodeColorMemoized, token],
	);

	// Defensive: Show empty state if no data
	if (!data || data.nodes.length === 0) {
		return (
			<div
				style={{
					height,
					width,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: token.colorBgContainer,
					borderRadius: token.borderRadius,
					border: `1px solid ${token.colorBorder}`,
				}}
			>
				<div style={{ textAlign: 'center', padding: 24 }}>
					<p style={{ color: token.colorTextSecondary, margin: 0 }}>
						{loading
							? 'Loading etymology graph...'
							: 'Not enough words with shared kanji roots yet. Keep learning!'}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div style={{ position: 'relative', width, height }}>
			{/* Explanation Panel */}
			<Collapse
				activeKey={isExplanationExpanded ? ['explanation'] : []}
				onChange={(keys) => setIsExplanationExpanded(keys.includes('explanation'))}
				style={{
					position: 'absolute',
					top: 16,
					left: 16,
					zIndex: 20,
					maxWidth: 320,
					background: token.colorBgElevated,
					borderRadius: token.borderRadius,
					boxShadow: token.boxShadow,
					border: `1px solid ${token.colorBorder}`,
				}}
				items={[
					{
						key: 'explanation',
						label: (
							<span style={{ fontWeight: 600, color: token.colorTextHeading }}>
								What is this graph?
							</span>
						),
						children: (
							<div style={{ fontSize: 13, lineHeight: 1.6, color: token.colorText }}>
								<p style={{ margin: '0 0 12px 0' }}>
									This graph shows how words connect via shared <strong>kanji roots</strong> (Hán
									Việt etymology).
								</p>
								<p style={{ margin: '0 0 12px 0' }}>
									<strong>Edges</strong> connect words sharing the same kanji. For example, 学
									(study) connects 学生 (student), 学校 (school), and 大学 (university).
								</p>
								<p style={{ margin: '0 0 12px 0' }}>
									<strong>Colors</strong> indicate memory strength:
									<br />• <span style={{ color: COLORS.mastered }}>Green</span> = Mastered
									<br />• <span style={{ color: COLORS.learning }}>Blue</span> = Learning
									<br />• <span style={{ color: COLORS.leech }}>Red</span> = Leech
								</p>
								<p style={{ margin: 0, fontSize: 12, color: token.colorTextTertiary }}>
									💡 Click nodes to view details, drag to reposition, hover edges to see shared
									roots.
								</p>
							</div>
						),
					},
				]}
			/>

			{/* Graph Visualization */}
			<ForceGraph2D
				ref={graphRef}
				graphData={graphData}
				nodeCanvasObject={renderNodeWithLabel}
				nodeLabel={() => ''} // Disable default label (we use custom rendering)
				nodeColor={(node: unknown) => {
					// Type-safe node color with memoization
					const n = node as EtymologyGraphNode;
					if (!n) {
						return COLORS.learning; // Default color
					}
					return getNodeColorMemoized(n);
				}}
				nodeVal={(node: unknown) => {
					// Type-safe node size with memoization
					const n = node as EtymologyGraphNode;
					if (!n) {
						return 10; // Default size (increased from 8 for better visibility)
					}
					return getNodeSizeMemoized(n);
				}}
				linkColor={() => COLORS.edge}
				linkWidth={1}
				onNodeClick={(node: unknown) => {
					// react-force-graph-2d passes (node, event) but we only need node
					const n = node as EtymologyGraphNode;
					if (n && handleNodeClick) {
						handleNodeClick(n);
					}
				}}
				onNodeHover={(node: unknown) => {
					// Type-safe hover handler
					const n = node as EtymologyGraphNode;
					handleNodeHover(n || null);
				}}
				onLinkHover={handleLinkHover}
				onNodeDragEnd={(node: unknown) => {
					// Fix node position after drag (type-safe)
					const n = node as { x?: number; y?: number; fx?: number; fy?: number };
					if (n && typeof n.x === 'number' && typeof n.y === 'number') {
						n.fx = n.x;
						n.fy = n.y;
					}
				}}
				cooldownTicks={100}
				onEngineTick={() => {
					// Configure forces on first tick (one-time setup)
					if (!hasConfiguredForces.current && graphRef.current) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const simulation = (graphRef.current as any)?.d3Force?.();
						if (simulation) {
							// Configure charge force (repulsion between nodes)
							const chargeForce = simulation.force('charge');
							if (chargeForce) {
								chargeForce.strength(-400); // Negative = repulsion (spread nodes apart)
							}
							// Configure link distance (distance between connected nodes)
							const linkForce = simulation.force('link');
							if (linkForce) {
								linkForce.distance(120); // Distance between connected nodes
								linkForce.strength(0.5); // Link strength (0-1, lower = more flexible)
							}
							// Configure center force (keeps graph centered)
							const centerForce = simulation.force('center');
							if (centerForce) {
								centerForce.strength(0.1); // Weak center attraction
							}
							hasConfiguredForces.current = true;
						}
					}
				}}
				onEngineStop={() => {
					// Graph layout stabilized
				}}
				width={graphWidth}
				height={height}
				backgroundColor={token.colorBgContainer}
			/>

			{/* Edge Tooltip (shows shared kanji root) */}
			{hoveredEdge && (
				<div
					style={{
						position: 'absolute',
						// Position near top-center of graph for visibility
						// Note: In future, this could be positioned at edge midpoint using coordinate transform
						left: '50%',
						top: 80,
						transform: 'translateX(-50%)',
						background: token.colorBgElevated,
						padding: '8px 12px',
						borderRadius: token.borderRadius,
						border: `1px solid ${token.colorBorder}`,
						boxShadow: token.boxShadow,
						zIndex: 15,
						pointerEvents: 'none',
						fontSize: 12,
						whiteSpace: 'nowrap',
					}}
				>
					<div style={{ color: token.colorTextSecondary, marginBottom: 4 }}>Connected by:</div>
					<div style={{ fontWeight: 600, color: token.colorTextHeading, fontSize: 16 }}>
						{hoveredEdge.sharedRoot}
					</div>
				</div>
			)}

			{/* Hover Tooltip */}
			{hoveredNode && (
				<div
					style={{
						position: 'absolute',
						top: 16,
						left: 16,
						background: token.colorBgElevated,
						padding: '12px 16px',
						borderRadius: token.borderRadius,
						border: `1px solid ${token.colorBorder}`,
						boxShadow: token.boxShadow,
						zIndex: 10,
						maxWidth: 300,
					}}
				>
					<div style={{ marginBottom: 8 }}>
						<strong style={{ fontSize: 18, color: token.colorTextHeading }}>
							{hoveredNode.wordSurface}
						</strong>
					</div>
					<div style={{ marginBottom: 4, color: token.colorTextSecondary }}>
						{hoveredNode.meaning}
					</div>
					<div style={{ fontSize: 12, color: token.colorTextTertiary }}>
						Stability: {hoveredNode.stability.toFixed(1)} days
						{hoveredNode.kanjiRoots.length > 0 && (
							<>
								<br />
								Roots: {hoveredNode.kanjiRoots.join(', ')}
							</>
						)}
					</div>
				</div>
			)}

			{/* Legend */}
			<div
				style={{
					position: 'absolute',
					bottom: 16,
					right: 16,
					background: token.colorBgElevated,
					padding: '12px 16px',
					borderRadius: token.borderRadius,
					border: `1px solid ${token.colorBorder}`,
					boxShadow: token.boxShadow,
					zIndex: 10,
					fontSize: 12,
				}}
			>
				<div style={{ marginBottom: 8, fontWeight: 600, color: token.colorTextHeading }}>
					Legend
				</div>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<div
							style={{
								width: 12,
								height: 12,
								borderRadius: '50%',
								background: COLORS.mastered,
							}}
						/>
						<span style={{ color: token.colorText }}>Mastered</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<div
							style={{
								width: 12,
								height: 12,
								borderRadius: '50%',
								background: COLORS.learning,
							}}
						/>
						<span style={{ color: token.colorText }}>Learning</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<div
							style={{
								width: 12,
								height: 12,
								borderRadius: '50%',
								background: COLORS.leech,
							}}
						/>
						<span style={{ color: token.colorText }}>Leech</span>
					</div>
				</div>
			</div>
		</div>
	);
}
