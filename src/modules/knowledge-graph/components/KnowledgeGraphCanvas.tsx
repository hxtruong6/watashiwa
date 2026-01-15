'use client';
import { theme } from 'antd';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ForceGraphMethods } from 'react-force-graph-2d';

import { useElementSize } from '../hooks/useElementSize';
import type { KnowledgeGraphEdge, KnowledgeGraphNode } from '../types';
import styles from './KnowledgeGraphPanel.module.css';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

type GraphNode = KnowledgeGraphNode & {
	id: string;
	x?: number;
	y?: number;
	fx?: number;
	fy?: number;
};
type GraphLink = KnowledgeGraphEdge & { source: string; target: string };

type GraphLayout = 'force' | 'radial' | 'tree' | 'cards';

type GraphControls = {
	zoomIn: () => void;
	zoomOut: () => void;
	reset: () => void;
};

export type KanjiInfo = {
	kanji: string;
	color: string;
	nodeCount: number;
	nodeIds: Set<string>;
};

type KnowledgeGraphCanvasProps = {
	nodes: KnowledgeGraphNode[];
	edges: KnowledgeGraphEdge[];
	selectedNodeId: string | null;
	onNodeSelect: (nodeId: string) => void;
	layout: GraphLayout;
	centerNodeId: string;
	onGraphReady?: (controls: GraphControls) => void;
	onKanjiInfoChange?: (kanjiInfo: KanjiInfo[]) => void;
	isHoverLocked?: boolean;
	lockedNodeId?: string | null;
};

export function KnowledgeGraphCanvas({
	nodes,
	edges,
	selectedNodeId,
	onNodeSelect,
	layout,
	centerNodeId,
	onGraphReady,
	onKanjiInfoChange,
	isHoverLocked: externalIsHoverLocked = false,
	lockedNodeId: externalLockedNodeId = null,
}: KnowledgeGraphCanvasProps) {
	const { token } = theme.useToken();
	const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
	const { elementRef, size } = useElementSize<HTMLDivElement>();
	const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
	const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
	const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const zoomRef = useRef(1);
	const isHoverLockedRef = useRef(false);
	const lockedNodeIdRef = useRef<string | null>(null);

	const graphData = useMemo(() => {
		const centerId = centerNodeId || nodes[0]?.id;
		const graphNodes: GraphNode[] = nodes.map((node) => ({ ...node }));
		const centerNode = graphNodes.find((node) => node.id === centerId);
		const otherNodes = graphNodes.filter((node) => node.id !== centerId);

		if (layout === 'radial' && centerNode) {
			centerNode.fx = 0;
			centerNode.fy = 0;
			const radius = 180;
			otherNodes.forEach((node, index) => {
				const angle = (index / Math.max(1, otherNodes.length)) * Math.PI * 2;
				node.fx = Math.cos(angle) * radius;
				node.fy = Math.sin(angle) * radius;
			});
		}

		if ((layout === 'tree' || layout === 'cards') && centerNode) {
			// Center node at origin for better centering
			centerNode.fx = 0;
			centerNode.fy = layout === 'cards' ? -100 : -60;
			const perRow = layout === 'cards' ? 3 : 4;
			otherNodes.forEach((node, index) => {
				const row = Math.floor(index / perRow) + 1;
				const col = index % perRow;
				// Increased spacing for cards to prevent overlap
				const spacingX = layout === 'cards' ? 220 : 120;
				const spacingY = layout === 'cards' ? 180 : 100;
				node.fx = (col - (perRow - 1) / 2) * spacingX;
				node.fy = (layout === 'cards' ? -100 : -60) + row * spacingY;
			});
		}

		if (layout === 'force') {
			graphNodes.forEach((node) => {
				node.fx = undefined;
				node.fy = undefined;
			});
		}

		const graphLinks: GraphLink[] = edges.map((edge) => ({
			...edge,
			source: edge.sourceId,
			target: edge.targetId,
		}));
		return { nodes: graphNodes, links: graphLinks };
	}, [nodes, edges, layout, centerNodeId]);

	const neighborIds = useMemo(() => {
		if (!selectedNodeId) return new Set<string>();
		const ids = new Set<string>();
		edges.forEach((edge) => {
			if (edge.sourceId === selectedNodeId) ids.add(edge.targetId);
			if (edge.targetId === selectedNodeId) ids.add(edge.sourceId);
		});
		return ids;
	}, [edges, selectedNodeId]);

	// Sync external lock state to refs
	useEffect(() => {
		isHoverLockedRef.current = externalIsHoverLocked;
		lockedNodeIdRef.current = externalLockedNodeId;
	}, [externalIsHoverLocked, externalLockedNodeId]);

	// Get all kanji from selected/hovered node and find nodes sharing those kanji
	const kanjiHighlightMap = useMemo(() => {
		const activeNodeId = isHoverLockedRef.current
			? lockedNodeIdRef.current
			: hoveredNodeId || selectedNodeId;
		if (!activeNodeId) return new Map<string, Set<string>>();

		const activeNode = nodes.find((n) => n.id === activeNodeId);
		if (!activeNode) return new Map<string, Set<string>>();

		const kanjiToNodes = new Map<string, Set<string>>();
		activeNode.sharedKanji.forEach((kanji) => {
			const nodeIds = new Set<string>();
			nodes.forEach((node) => {
				if (node.id !== activeNodeId && node.sharedKanji.includes(kanji)) {
					nodeIds.add(node.id);
				}
			});
			if (nodeIds.size > 0) {
				kanjiToNodes.set(kanji, nodeIds);
			}
		});
		return kanjiToNodes;
	}, [nodes, selectedNodeId, hoveredNodeId]);
	// Color palette for kanji highlighting
	const kanjiColors = useMemo(() => {
		const colors = [
			token.colorPrimary,
			token.colorSuccess,
			token.colorWarning,
			token.colorError,
			token.colorInfo,
			'#9c27b0', // purple
			'#ff5722', // deep orange
			'#00bcd4', // cyan
			'#4caf50', // green
			'#ff9800', // orange
		];
		const kanjiToColor = new Map<string, string>();
		let colorIndex = 0;
		kanjiHighlightMap.forEach((_, kanji) => {
			kanjiToColor.set(kanji, colors[colorIndex % colors.length]);
			colorIndex++;
		});
		return kanjiToColor;
	}, [kanjiHighlightMap, token]);

	// Get highlight color for a node based on shared kanji
	const getNodeHighlightColor = (nodeId: string): string | null => {
		const activeNodeId = isHoverLockedRef.current
			? lockedNodeIdRef.current
			: hoveredNodeId || selectedNodeId;
		if (!activeNodeId || nodeId === activeNodeId) return null;

		for (const [kanji, nodeIds] of kanjiHighlightMap.entries()) {
			if (nodeIds.has(nodeId)) {
				return kanjiColors.get(kanji) ?? null;
			}
		}
		return null;
	};

	// Expose kanji info for legend
	const kanjiInfo = useMemo<KanjiInfo[]>(() => {
		return Array.from(kanjiHighlightMap.entries()).map(([kanji, nodeIds]) => ({
			kanji,
			color: kanjiColors.get(kanji) ?? token.colorPrimary,
			nodeCount: nodeIds.size,
			nodeIds,
		}));
	}, [kanjiHighlightMap, kanjiColors, token]);

	useEffect(() => {
		onKanjiInfoChange?.(kanjiInfo);
	}, [kanjiInfo, onKanjiInfoChange]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (hoverTimeoutRef.current) {
				clearTimeout(hoverTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (!graphRef.current || graphData.nodes.length === 0) return;
		// Small delay to ensure graph has rendered
		const timer = setTimeout(() => {
			if (!graphRef.current) return;
			// Center and fit the graph, with better padding for card layout
			const padding = layout === 'cards' ? 100 : 80;
			graphRef.current.zoomToFit(400, padding);
			// For card layout, ensure we're centered at origin
			if (layout === 'cards') {
				graphRef.current.centerAt(0, 0, 200);
			} else {
				graphRef.current.centerAt(0, 0, 200);
			}
		}, 50);
		return () => clearTimeout(timer);
	}, [graphData, layout]);

	useEffect(() => {
		if (!onGraphReady) return;
		onGraphReady({
			zoomIn: () => {
				const nextZoom = Math.min(4, zoomRef.current * 1.2);
				graphRef.current?.zoom(nextZoom, 200);
			},
			zoomOut: () => {
				const nextZoom = Math.max(0.3, zoomRef.current / 1.2);
				graphRef.current?.zoom(nextZoom, 200);
			},
			reset: () => {
				if (!graphRef.current) return;
				// Center at origin and reset zoom
				graphRef.current.centerAt(0, 0, 200);
				graphRef.current.zoom(1, 200);
				// For card layout, also fit to view after a brief delay
				if (layout === 'cards') {
					setTimeout(() => {
						graphRef.current?.zoomToFit(400, 100);
					}, 250);
				}
			},
		});
	}, [onGraphReady, layout]);

	const getNodeSize = (weight: number) => 4 + weight * 8;
	const getEdgeWidth = (weight: number) => 1 + weight * 3;
	const isLinkSelected = (link: GraphLink) =>
		Boolean(
			selectedNodeId && (link.sourceId === selectedNodeId || link.targetId === selectedNodeId),
		);
	const isLinkHovered = (link: GraphLink) =>
		Boolean(hoveredNodeId && (link.sourceId === hoveredNodeId || link.targetId === hoveredNodeId));

	return (
		<div ref={elementRef} className={styles.graphContainer}>
			{size.width > 0 && size.height > 0 ? (
				<ForceGraph2D
					ref={graphRef}
					width={size.width}
					height={size.height}
					graphData={graphData}
					cooldownTicks={60}
					cooldownTime={2000}
					enableNodeDrag
					enableZoomInteraction
					enablePanInteraction
					showPointerCursor
					linkHoverPrecision={6}
					linkDirectionalParticles={0}
					nodeRelSize={layout === 'cards' ? 30 : 6}
					nodeVal={(node) => {
						// For cards, return a large value to make the entire card hoverable
						if (layout === 'cards') {
							return 100; // Large value = larger hover detection radius
						}
						const data = node as GraphNode;
						return getNodeSize(data.weight);
					}}
					linkWidth={(link) => {
						const edge = link as GraphLink;
						if (isLinkSelected(edge) || isLinkHovered(edge)) {
							return getEdgeWidth(edge.weight) + 1.5;
						}
						return getEdgeWidth(edge.weight);
					}}
					linkColor={(link) => {
						const edge = link as GraphLink;
						if (isLinkSelected(edge) || isLinkHovered(edge)) return token.colorPrimary;
						return edge.weight > 0.75 ? token.colorTextSecondary : token.colorBorderSecondary;
					}}
					linkLabel={(link) => (link as GraphLink).sharedKanji.join(' • ')}
					linkCanvasObjectMode={() => 'after'}
					linkCanvasObject={(link, ctx) => {
						const edge = link as GraphLink;
						const activeNodeId = isHoverLockedRef.current
							? lockedNodeIdRef.current
							: hoveredNodeId || selectedNodeId;
						const isConnectedToActive = activeNodeId
							? edge.sourceId === activeNodeId || edge.targetId === activeNodeId
							: false;

						// Progressive disclosure: show labels when connected to hovered/selected node
						const shouldShow =
							hoveredEdgeId === edge.id ||
							Boolean(selectedNodeId && isLinkSelected(edge)) ||
							Boolean(activeNodeId && isConnectedToActive);

						if (!shouldShow) return;

						// Fade non-hovered edges when showing all connections
						const isDirectlyHovered = hoveredEdgeId === edge.id;
						const opacity = isDirectlyHovered ? 1 : activeNodeId && isConnectedToActive ? 0.7 : 1;
						ctx.globalAlpha = opacity;

						const resolveNode = (value: GraphNode | string | undefined) =>
							typeof value === 'object' ? value : undefined;
						const source = resolveNode(edge.source as GraphNode | string | undefined);
						const target = resolveNode(edge.target as GraphNode | string | undefined);
						if (!source || !target) return;

						const labelPrefix = 'Shares ';
						const labelKanji = edge.sharedKanji.join(' • ');
						const midX = ((source.x ?? 0) + (target.x ?? 0)) / 2;
						const midY = ((source.y ?? 0) + (target.y ?? 0)) / 2;

						ctx.font = '12px sans-serif';
						ctx.fillStyle = token.colorTextSecondary;
						ctx.textAlign = 'center';
						ctx.textBaseline = 'bottom';
						const prefixWidth = ctx.measureText(labelPrefix).width;
						const kanjiWidth = ctx.measureText(labelKanji).width;
						const totalWidth = prefixWidth + kanjiWidth;
						const startX = midX - totalWidth / 2;
						ctx.fillText(labelPrefix, startX + prefixWidth / 2, midY - 4);
						ctx.fillStyle = token.colorPrimary;
						ctx.fillText(labelKanji, startX + prefixWidth + kanjiWidth / 2, midY - 4);
						ctx.globalAlpha = 1;
					}}
					onLinkHover={(link) => {
						const edge = link as GraphLink | null;
						setHoveredEdgeId(edge?.id ?? null);
					}}
					onNodeHover={(node) => {
						if (isHoverLockedRef.current) return; // Don't update if locked
						const data = node as GraphNode | null;

						// Clear any existing timeout
						if (hoverTimeoutRef.current) {
							clearTimeout(hoverTimeoutRef.current);
							hoverTimeoutRef.current = null;
						}

						if (data?.id) {
							setHoveredNodeId(data.id);
						} else {
							// Node is null (hover ended) - add delay before clearing
							hoverTimeoutRef.current = setTimeout(() => {
								if (!isHoverLockedRef.current) {
									setHoveredNodeId(null);
								}
								hoverTimeoutRef.current = null;
							}, 200);
						}
					}}
					onZoom={({ k }) => {
						zoomRef.current = k;
					}}
					nodeLabel={(node) => {
						const data = node as GraphNode;
						return `${data.word} (${data.reading}) - ${data.meaning}`;
					}}
					nodeCanvasObject={(node, ctx, globalScale) => {
						const data = node as GraphNode;
						const isSelected = data.id === selectedNodeId;
						const isCenter = data.id === centerNodeId;
						const isHovered = data.id === hoveredNodeId;
						const isConnected = !selectedNodeId || isSelected || neighborIds.has(data.id);
						const highlightColor = getNodeHighlightColor(data.id);
						const label = data.word;
						const fontSize = Math.max(10, 12 / globalScale);
						const baseRadius = getNodeSize(data.weight);
						const radius = baseRadius + (isSelected ? 3 : isCenter ? 2 : isHovered ? 1 : 0);

						ctx.globalAlpha = isConnected ? 1 : 0.25;

						if (layout === 'cards') {
							const cardWidth = 160;
							const cardHeight = 90;
							const x = (data.x ?? 0) - cardWidth / 2;
							const y = (data.y ?? 0) - cardHeight / 2;

							// Check if this is the hovered/selected node to show active kanji
							const activeNodeId = hoveredNodeId || selectedNodeId;
							const activeNode = activeNodeId ? nodes.find((n) => n.id === activeNodeId) : null;
							const isActiveNode = data.id === activeNodeId;
							const activeKanji =
								isActiveNode && activeNode
									? activeNode.sharedKanji.filter((k) => kanjiHighlightMap.has(k))
									: [];

							// Draw card background with highlight
							ctx.beginPath();
							ctx.fillStyle = highlightColor ? `${highlightColor}15` : token.colorBgContainer;
							ctx.strokeStyle = highlightColor
								? highlightColor
								: isSelected || isCenter || isHovered
									? token.colorPrimary
									: token.colorBorderSecondary;
							ctx.lineWidth = highlightColor ? 3 : isSelected || isCenter ? 2 : isHovered ? 1.5 : 1;
							const radiusCorner = 8;
							ctx.moveTo(x + radiusCorner, y);
							ctx.lineTo(x + cardWidth - radiusCorner, y);
							ctx.quadraticCurveTo(x + cardWidth, y, x + cardWidth, y + radiusCorner);
							ctx.lineTo(x + cardWidth, y + cardHeight - radiusCorner);
							ctx.quadraticCurveTo(
								x + cardWidth,
								y + cardHeight,
								x + cardWidth - radiusCorner,
								y + cardHeight,
							);
							ctx.lineTo(x + radiusCorner, y + cardHeight);
							ctx.quadraticCurveTo(x, y + cardHeight, x, y + cardHeight - radiusCorner);
							ctx.lineTo(x, y + radiusCorner);
							ctx.quadraticCurveTo(x, y, x + radiusCorner, y);
							ctx.closePath();
							ctx.fill();
							ctx.stroke();

							// Draw word with highlight color if applicable
							ctx.font = `600 ${Math.max(12, 14 / globalScale)}px sans-serif`;
							ctx.textAlign = 'center';
							ctx.textBaseline = 'top';
							ctx.fillStyle = highlightColor || token.colorText;
							ctx.fillText(label, data.x ?? 0, y + 12);

							// Draw active kanji badges on hovered/selected node
							if (isActiveNode && activeKanji.length > 0) {
								const badgeSize = Math.max(20, 18 / globalScale);
								const badgeSpacing = 4;
								const totalWidth =
									activeKanji.length * badgeSize + (activeKanji.length - 1) * badgeSpacing;
								const startX = (data.x ?? 0) - totalWidth / 2;

								activeKanji.forEach((kanji, index) => {
									const kanjiColor = kanjiColors.get(kanji) ?? token.colorPrimary;
									const badgeX = startX + index * (badgeSize + badgeSpacing);

									// Draw kanji badge (rounded rectangle)
									const badgeRadius = 4;
									ctx.beginPath();
									ctx.fillStyle = `${kanjiColor}25`;
									ctx.strokeStyle = kanjiColor;
									ctx.lineWidth = 2;
									ctx.moveTo(badgeX + badgeRadius, y + 28);
									ctx.lineTo(badgeX + badgeSize - badgeRadius, y + 28);
									ctx.quadraticCurveTo(
										badgeX + badgeSize,
										y + 28,
										badgeX + badgeSize,
										y + 28 + badgeRadius,
									);
									ctx.lineTo(badgeX + badgeSize, y + 28 + badgeSize - badgeRadius);
									ctx.quadraticCurveTo(
										badgeX + badgeSize,
										y + 28 + badgeSize,
										badgeX + badgeSize - badgeRadius,
										y + 28 + badgeSize,
									);
									ctx.lineTo(badgeX + badgeRadius, y + 28 + badgeSize);
									ctx.quadraticCurveTo(
										badgeX,
										y + 28 + badgeSize,
										badgeX,
										y + 28 + badgeSize - badgeRadius,
									);
									ctx.lineTo(badgeX, y + 28 + badgeRadius);
									ctx.quadraticCurveTo(badgeX, y + 28, badgeX + badgeRadius, y + 28);
									ctx.closePath();
									ctx.fill();
									ctx.stroke();

									// Draw kanji text
									ctx.font = `bold ${Math.max(11, 12 / globalScale)}px sans-serif`;
									ctx.fillStyle = kanjiColor;
									ctx.textAlign = 'center';
									ctx.textBaseline = 'middle';
									ctx.fillText(kanji, badgeX + badgeSize / 2, y + 28 + badgeSize / 2);
								});
							}

							// Draw reading
							ctx.font = `${Math.max(9, 10 / globalScale)}px sans-serif`;
							ctx.fillStyle = token.colorTextSecondary;
							ctx.fillText(data.reading, data.x ?? 0, y + 32);

							// Draw meaning
							ctx.font = `${Math.max(10, 11 / globalScale)}px sans-serif`;
							ctx.fillStyle = token.colorTextSecondary;
							// Adjust meaning position if kanji badges will be shown
							const meaningY = highlightColor ? y + 48 : y + 50;
							ctx.fillText(data.meaning, data.x ?? 0, meaningY);

							// Draw shared kanji badges if highlighted - enhanced display
							if (highlightColor) {
								const activeNodeId = hoveredNodeId || selectedNodeId;
								const activeNode = nodes.find((n) => n.id === activeNodeId);
								if (activeNode) {
									const sharedKanji = data.sharedKanji.filter((k) =>
										activeNode.sharedKanji.includes(k),
									);
									if (sharedKanji.length > 0) {
										// Draw background pill for kanji badges
										const kanjiText = sharedKanji.join(' ');
										ctx.font = `bold ${Math.max(11, 12 / globalScale)}px sans-serif`;
										const textMetrics = ctx.measureText(kanjiText);
										const pillWidth = textMetrics.width + 16;
										const pillHeight = Math.max(18, 14 / globalScale + 8);
										const pillX = (data.x ?? 0) - pillWidth / 2;
										const pillY = y + cardHeight - pillHeight - 4;
										const pillRadius = 6;

										// Draw pill background with highlight color (rounded rectangle)
										ctx.beginPath();
										ctx.fillStyle = `${highlightColor}20`;
										ctx.strokeStyle = highlightColor;
										ctx.lineWidth = 1.5;
										ctx.moveTo(pillX + pillRadius, pillY);
										ctx.lineTo(pillX + pillWidth - pillRadius, pillY);
										ctx.quadraticCurveTo(
											pillX + pillWidth,
											pillY,
											pillX + pillWidth,
											pillY + pillRadius,
										);
										ctx.lineTo(pillX + pillWidth, pillY + pillHeight - pillRadius);
										ctx.quadraticCurveTo(
											pillX + pillWidth,
											pillY + pillHeight,
											pillX + pillWidth - pillRadius,
											pillY + pillHeight,
										);
										ctx.lineTo(pillX + pillRadius, pillY + pillHeight);
										ctx.quadraticCurveTo(
											pillX,
											pillY + pillHeight,
											pillX,
											pillY + pillHeight - pillRadius,
										);
										ctx.lineTo(pillX, pillY + pillRadius);
										ctx.quadraticCurveTo(pillX, pillY, pillX + pillRadius, pillY);
										ctx.closePath();
										ctx.fill();
										ctx.stroke();

										// Draw kanji text
										ctx.fillStyle = highlightColor;
										ctx.textAlign = 'center';
										ctx.textBaseline = 'middle';
										ctx.fillText(kanjiText, data.x ?? 0, pillY + pillHeight / 2);
									}
								}
							}
						} else {
							ctx.beginPath();
							let nodeFillColor = highlightColor || token.colorTextSecondary;
							if (isSelected || isCenter || isHovered) {
								nodeFillColor = token.colorPrimary;
							}
							ctx.fillStyle = nodeFillColor;
							ctx.arc(data.x ?? 0, data.y ?? 0, radius, 0, 2 * Math.PI, false);
							ctx.fill();

							// Add highlight ring for kanji sharing
							if (highlightColor && !isSelected && !isCenter && !isHovered) {
								ctx.beginPath();
								ctx.strokeStyle = highlightColor;
								ctx.lineWidth = 2;
								ctx.arc(data.x ?? 0, data.y ?? 0, radius + 2, 0, 2 * Math.PI, false);
								ctx.stroke();
							}

							ctx.font = `${fontSize}px sans-serif`;
							ctx.textAlign = 'center';
							ctx.textBaseline = 'top';
							ctx.fillStyle = highlightColor || token.colorText;
							ctx.fillText(label, data.x ?? 0, (data.y ?? 0) + radius + 2);
						}

						ctx.globalAlpha = 1;
					}}
					onNodeClick={(node) => {
						const data = node as GraphNode;
						onNodeSelect(data.id);
						if (data.x !== undefined && data.y !== undefined) {
							graphRef.current?.centerAt(data.x, data.y, 300);
						}
					}}
					onNodeDragEnd={(node) => {
						if (layout !== 'cards') return;
						// Allow free movement - don't lock position
						// Cards can be moved freely in card layout
						const data = node as GraphNode;
						if (data.x !== undefined && data.y !== undefined) {
							// Update position but allow further movement
							data.fx = data.x;
							data.fy = data.y;
						}
					}}
					onNodeDrag={(node) => {
						if (layout !== 'cards') return;
						// Update position during drag for smooth movement
						const data = node as GraphNode;
						if (data.x !== undefined && data.y !== undefined) {
							data.fx = data.x;
							data.fy = data.y;
						}
					}}
				/>
			) : null}
		</div>
	);
}
