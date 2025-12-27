/**
 * useMemoryGardenMesh Hook
 *
 * Manages the InstancedMesh state and updates.
 * Separates rendering logic from data processing.
 *
 * Performance:
 * - Uses useLayoutEffect for synchronous GPU updates
 * - Batches all updates in single effect
 * - Defensive checks prevent crashes
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import type { MemoryTile } from '../types';
import { calculateGridSize, sampleTiles } from '../utils/tile-sampling';
import { calculateTileVisualState } from '../utils/visual-calculations';

export interface UseMemoryGardenMeshOptions {
	data: { tiles: MemoryTile[] } | null;
	animationMode?: 'static' | 'repair' | 'pulse';
	repairedTileIds?: string[];
}

export interface UseMemoryGardenMeshReturn {
	meshRef: React.RefObject<THREE.InstancedMesh | null>;
	tileCount: number;
	gridSize: number;
	tiles: MemoryTile[];
}

/**
 * Hook for managing Memory Garden mesh state
 *
 * Responsibilities:
 * 1. Sample tiles intelligently
 * 2. Calculate grid layout
 * 3. Update InstancedMesh matrices and colors
 * 4. Handle GPU buffer updates
 *
 * Edge Cases Handled:
 * - Null/empty data → returns empty state
 * - Malformed tiles → filtered out
 * - Mesh not ready → skips update
 * - Geometry not ready → skips update
 */
export function useMemoryGardenMesh({
	data,
	animationMode = 'static',
	repairedTileIds = [],
}: UseMemoryGardenMeshOptions): UseMemoryGardenMeshReturn {
	const meshRef = useRef<THREE.InstancedMesh>(null);
	const dummy = useMemo(() => new THREE.Object3D(), []);

	// Sample tiles (smart filtering)
	const tiles = useMemo(() => {
		if (!data?.tiles) return [];
		return sampleTiles(data.tiles);
	}, [data]);

	const tileCount = tiles.length;
	const gridSize = useMemo(() => calculateGridSize(tileCount), [tileCount]);

	// Pre-allocate color array (performance optimization)
	const colors = useMemo(() => new Float32Array(tileCount * 3), [tileCount]);

	// Update mesh (runs when data/state changes)
	useLayoutEffect(() => {
		// Defensive: Early returns for invalid states
		if (tileCount === 0 || !meshRef.current || !meshRef.current.geometry) {
			return;
		}

		const mesh = meshRef.current;

		// Setup instanceColor attribute (required for vertexColors)
		let instanceColor = mesh.geometry.getAttribute('color') as THREE.InstancedBufferAttribute;
		if (!instanceColor) {
			instanceColor = new THREE.InstancedBufferAttribute(colors, 3, false);
			mesh.geometry.setAttribute('color', instanceColor);
		} else {
			// Update existing attribute
			const colorArray = instanceColor.array as Float32Array;
			if (colorArray.length === colors.length) {
				colorArray.set(colors);
			}
		}

		// Process each tile
		for (let i = 0; i < tileCount; i++) {
			const tile = tiles[i];

			// Defensive: Skip invalid tiles
			if (!tile || typeof tile.stability !== 'number' || typeof tile.lapses !== 'number') {
				continue;
			}

			// Calculate visual state
			const visualState = calculateTileVisualState(tile, i, gridSize, {
				animationMode,
				repairedTileIds,
			});

			// Update matrix (position + scale)
			dummy.position.set(visualState.position.x, visualState.position.y, visualState.position.z);
			dummy.scale.set(visualState.scale.x, visualState.scale.y, visualState.scale.z);
			dummy.updateMatrix();
			mesh.setMatrixAt(i, dummy.matrix);

			// Update color
			visualState.color.toArray(colors, i * 3);
		}

		// Update GPU buffers (defensive checks)
		if (mesh.instanceMatrix) {
			mesh.instanceMatrix.needsUpdate = true;
		}
		if (mesh.geometry) {
			const colorAttr = mesh.geometry.getAttribute('color') as THREE.InstancedBufferAttribute;
			if (colorAttr) {
				colorAttr.needsUpdate = true;
			}
		}
	}, [tiles, gridSize, tileCount, dummy, colors, animationMode, repairedTileIds]);

	return {
		meshRef,
		tileCount,
		gridSize,
		tiles,
	};
}
