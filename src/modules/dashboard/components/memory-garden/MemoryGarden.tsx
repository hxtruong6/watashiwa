'use client';

/**
 * Memory Garden Component (Refactored)
 *
 * A 3D topographic visualization of memory strength using React Three Fiber.
 *
 * Features:
 * - Hover tooltips with rich information
 * - Click-to-zoom camera animation
 * - Filter toggles (All, Leeches, Mastered, New)
 * - Vibrant color palette
 * - Smooth animations
 */
import { Canvas } from '@react-three/fiber';
import { theme } from 'antd';
import React, { useMemo, useState } from 'react';

import { GardenControls, MemoryGardenScene } from './components';
import { GARDEN_CONFIG } from './config';
import type { GardenFilter, MemoryGardenProps } from './types';
import { filterTiles, sampleTiles } from './utils/tile-sampling';

const { useToken } = theme;

/**
 * Main Memory Garden Component
 *
 * Thin wrapper that:
 * 1. Handles data validation
 * 2. Manages filter state
 * 3. Sets up Canvas
 * 4. Delegates to MemoryGardenScene
 */
export default function MemoryGarden({
	data,
	onTileClick,
	height = 400,
	showControls = true,
	autoRotate = true,
	animationMode = 'static',
	repairedTileIds = [],
	filter: initialFilter = 'all',
	showFilterControls = true,
}: MemoryGardenProps) {
	const { token } = useToken();
	const [filter, setFilter] = useState<GardenFilter>(initialFilter);

	// Filter and sample tiles based on current filter
	const filteredData = useMemo(() => {
		if (!data || !data.tiles || data.tiles.length === 0) {
			return null;
		}

		// Apply filter
		const filtered = filterTiles(data.tiles, filter);

		// Sample tiles (smart sampling)
		const sampled = sampleTiles(filtered);

		return {
			...data,
			tiles: sampled,
		};
	}, [data, filter]);

	// Defensive: Handle null data gracefully
	if (!filteredData || !filteredData.tiles || filteredData.tiles.length === 0) {
		return (
			<div
				style={{
					height,
					width: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: token.colorBgContainer,
					borderRadius: 12,
					position: 'relative',
				}}
			>
				{showFilterControls && (
					<GardenControls filter={filter} onFilterChange={setFilter} showZoomControls={false} />
				)}
				<span style={{ color: token.colorTextSecondary }}>
					No memory data available yet. Start studying to build your garden!
				</span>
			</div>
		);
	}

	return (
		<div
			style={{
				height,
				width: '100%',
				position: 'relative',
				background: token.colorBgContainer,
				borderRadius: 12,
				overflow: 'hidden',
			}}
		>
			{/* Filter Controls */}
			{showFilterControls && (
				<GardenControls filter={filter} onFilterChange={setFilter} showZoomControls={false} />
			)}

			<Canvas
				camera={{
					position: GARDEN_CONFIG.camera.position,
					fov: GARDEN_CONFIG.camera.fov,
				}}
				gl={{ antialias: true, alpha: false }}
				onError={(error) => {
					// Defensive: Handle WebGL errors gracefully
					console.error('[MemoryGarden] WebGL Error:', error);
				}}
			>
				<MemoryGardenScene
					data={filteredData}
					onTileClick={onTileClick}
					animationMode={animationMode}
					repairedTileIds={repairedTileIds}
					showControls={showControls}
					autoRotate={autoRotate}
					tiles={filteredData.tiles}
					gridSize={Math.ceil(Math.sqrt(filteredData.tiles.length))}
				/>
			</Canvas>
		</div>
	);
}
