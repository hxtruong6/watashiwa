/**
 * useMemoryGardenMesh Hook (REFACTORED)
 *
 * Improvements:
 * 1. Removed unnecessary dependencies (dummy, colors arrays)
 * 2. Extracted attribute setup to helper function (DRY)
 * 3. Added validation for array length consistency
 * 4. Better performance with optimized dependency array
 */

import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { GARDEN_CONFIG } from '../config';
import type { MemoryTile } from '../types';
import { calculateGridSize, sampleTiles } from '../utils/tile-sampling';
import { calculateGradientColors, calculateTileVisualState } from '../utils/visual-calculations';

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
	baseColors: Float32Array;
	topColors: Float32Array;
	getGradientBounds: () => { minY: number; maxY: number } | undefined;
}

/**
 * Helper: Setup or update instanced buffer attribute
 * DRY: Avoids duplication between baseColor and topColor setup
 */
function setupInstancedAttribute(
	geometry: THREE.BufferGeometry,
	attributeName: string,
	data: Float32Array,
	itemSize: number = 3,
): void {
	let attr = geometry.getAttribute(attributeName) as THREE.InstancedBufferAttribute;

	if (!attr) {
		// Create new attribute
		attr = new THREE.InstancedBufferAttribute(data, itemSize, false);
		geometry.setAttribute(attributeName, attr);
	} else {
		// Update existing attribute
		const attrArray = attr.array as Float32Array;
		if (attrArray.length === data.length) {
			// Same size: update in place (performance optimization)
			attrArray.set(data);
			attr.needsUpdate = true;
		} else {
			// Size changed: recreate attribute
			geometry.deleteAttribute(attributeName);
			attr = new THREE.InstancedBufferAttribute(data, itemSize, false);
			geometry.setAttribute(attributeName, attr);
		}
	}
}

export function useMemoryGardenMesh({
	data,
	animationMode = 'static',
	repairedTileIds = [],
}: UseMemoryGardenMeshOptions): UseMemoryGardenMeshReturn {
	const meshRef = useRef<THREE.InstancedMesh>(null);
	// Dummy object is stable - no need to recreate or include in deps
	const dummy = useRef(new THREE.Object3D()).current;

	// Sample tiles
	const tiles = useMemo(() => {
		if (!data?.tiles) return [];
		return sampleTiles(data.tiles);
	}, [data]);

	const tileCount = tiles.length;
	const gridSize = useMemo(() => calculateGridSize(tileCount), [tileCount]);

	// Pre-allocate color arrays (stable references, mutated in effect)
	// These are NOT in dependency array because they're just containers
	const colors = useMemo(() => new Float32Array(tileCount * 3), [tileCount]);
	const baseColors = useMemo(() => new Float32Array(tileCount * 3), [tileCount]);
	const topColors = useMemo(() => new Float32Array(tileCount * 3), [tileCount]);

	// Track gradient bounds
	const gradientBoundsRef = useRef<{ minY: number; maxY: number } | undefined>(undefined);

	// Update mesh
	useLayoutEffect(() => {
		// Defensive: Early returns
		if (tileCount === 0 || !meshRef.current?.geometry) {
			return;
		}

		const mesh = meshRef.current;
		const geometry = mesh.geometry;

		// Validate array lengths match tile count
		const expectedLength = tileCount * 3;
		if (
			colors.length !== expectedLength ||
			baseColors.length !== expectedLength ||
			topColors.length !== expectedLength
		) {
			console.error(
				`[MemoryGarden] Array length mismatch: tiles=${tileCount}, colors=${colors.length / 3}, baseColors=${baseColors.length / 3}, topColors=${topColors.length / 3}`,
			);
			return;
		}

		// Setup instanceColor attribute
		setupInstancedAttribute(geometry, 'color', colors, 3);

		// Track Y bounds for gradient normalization
		let minY = Infinity;
		let maxY = -Infinity;

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

			// Update matrix
			dummy.position.set(visualState.position.x, visualState.position.y, visualState.position.z);
			dummy.scale.set(visualState.scale.x, visualState.scale.y, visualState.scale.z);
			dummy.updateMatrix();
			mesh.setMatrixAt(i, dummy.matrix);

			// Update color
			visualState.color.toArray(colors, i * 3);

			// Calculate gradient colors if enabled
			if (GARDEN_CONFIG.features.enableGradients) {
				const { baseColor, topColor } = calculateGradientColors(tile, {
					animationMode,
					isRepaired: repairedTileIds?.includes(tile.vocabId),
				});
				baseColor.toArray(baseColors, i * 3);
				topColor.toArray(topColors, i * 3);
			}

			// Track Y bounds
			const tileMinY = visualState.position.y - visualState.scale.y / 2;
			const tileMaxY = visualState.position.y + visualState.scale.y / 2;
			minY = Math.min(minY, tileMinY);
			maxY = Math.max(maxY, tileMaxY);
		}

		// Setup gradient attributes if enabled
		if (GARDEN_CONFIG.features.enableGradients && tileCount > 0) {
			setupInstancedAttribute(geometry, 'baseColor', baseColors, 3);
			setupInstancedAttribute(geometry, 'topColor', topColors, 3);

			// Store Y bounds (only if valid)
			if (
				Number.isFinite(minY) &&
				Number.isFinite(maxY) &&
				minY !== Infinity &&
				maxY !== -Infinity
			) {
				gradientBoundsRef.current = { minY, maxY };
			} else {
				gradientBoundsRef.current = undefined;
			}
		}

		// Update GPU buffers
		if (mesh.instanceMatrix) {
			mesh.instanceMatrix.needsUpdate = true;
		}
		const colorAttr = geometry.getAttribute('color') as THREE.InstancedBufferAttribute;
		if (colorAttr) {
			colorAttr.needsUpdate = true;
		}
	}, [
		// Optimized dependencies: only include what actually triggers recalculation
		tiles,
		gridSize,
		tileCount,
		animationMode,
		repairedTileIds,
		// Note: colors, baseColors, topColors are NOT in deps - they're just containers
		// Note: dummy is NOT in deps - it's stable
	]);

	return {
		meshRef,
		tileCount,
		gridSize,
		tiles,
		baseColors,
		topColors,
		getGradientBounds: () => gradientBoundsRef.current,
	};
}

