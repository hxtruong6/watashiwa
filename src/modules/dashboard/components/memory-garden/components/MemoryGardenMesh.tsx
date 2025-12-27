/**
 * MemoryGardenMesh Component
 *
 * Core 3D mesh rendering component.
 * Separated from data processing for clarity and testability.
 *
 * Features:
 * - Hover detection via raycasting
 * - Click-to-zoom support
 * - Tooltip display
 */
import React, { useMemo } from 'react';
import * as THREE from 'three';

import { GARDEN_CONFIG } from '../config';
import { useMemoryGardenMesh, useTileHover } from '../hooks';
import type { MemoryTile } from '../types';
import { createRoundedBoxGeometry } from '../utils/createRoundedBoxGeometry';
import { TileTooltip } from './TileTooltip';

export interface MemoryGardenMeshProps {
	data: { tiles: MemoryTile[] } | null;
	onTileClick?: (tile: MemoryTile) => void;
	animationMode?: 'static' | 'repair' | 'pulse';
	repairedTileIds?: string[];
	showTooltip?: boolean;
}

/**
 * Core 3D Mesh Component
 *
 * Renders the instanced mesh with all tiles.
 * Uses the useMemoryGardenMesh hook for state management.
 */
export function MemoryGardenMesh({
	data,
	onTileClick,
	animationMode = 'static',
	repairedTileIds = [],
	showTooltip = true,
}: MemoryGardenMeshProps) {
	const { meshRef, tileCount, tiles } = useMemoryGardenMesh({
		data,
		animationMode,
		repairedTileIds,
	});

	// Hover detection
	const { hoveredTile, hoveredPosition } = useTileHover({
		meshRef,
		tiles,
		enabled: showTooltip,
	});

	// Early return if no data (after hooks)
	if (tileCount === 0) {
		return null;
	}

	// Create rounded geometry (memoized for performance)
	const geometry = useMemo(
		() => createRoundedBoxGeometry(1, 1, 1, GARDEN_CONFIG.material.roundRadius, 2),
		[],
	);

	const handleClick = (event: THREE.Event) => {
		if (!onTileClick || !meshRef.current) return;

		// Get clicked instance from event
		const intersect = event as unknown as { instanceId?: number };
		if (intersect.instanceId !== undefined && tiles[intersect.instanceId]) {
			onTileClick(tiles[intersect.instanceId]);
		}
	};

	return (
		<>
			<instancedMesh
				ref={meshRef}
				args={[geometry, undefined, tileCount]}
				onClick={handleClick}
				castShadow
				receiveShadow
			>
				<meshStandardMaterial
					vertexColors
					metalness={GARDEN_CONFIG.material.metalness}
					roughness={GARDEN_CONFIG.material.roughness}
					flatShading={GARDEN_CONFIG.material.flatShading}
					emissive={new THREE.Color(0x000000)}
					emissiveIntensity={GARDEN_CONFIG.material.emissiveIntensity}
					// Enhanced visual properties
					envMapIntensity={0.5}
				/>
			</instancedMesh>

			{/* Tooltip */}
			{showTooltip && hoveredTile && hoveredPosition && (
				<TileTooltip tile={hoveredTile} position={hoveredPosition} visible={true} />
			)}
		</>
	);
}
