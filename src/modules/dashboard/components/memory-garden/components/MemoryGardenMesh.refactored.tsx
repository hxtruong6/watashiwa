/**
 * MemoryGardenMesh Component (REFACTORED)
 *
 * Improvements:
 * 1. Removed setTimeout anti-pattern - use refs for state tracking
 * 2. Extracted cleanup logic to helper function (DRY)
 * 3. Added proper type guards for event handling
 * 4. Improved error handling with user-facing state
 * 5. Optimized attribute checks (no duplicates)
 * 6. Better validation (all colors, not just first 3 tiles)
 */
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { GARDEN_CONFIG } from '../config';
import { useEmissiveColors, useMemoryGardenMesh, useTileAnimations, useTileHover } from '../hooks';
import type { MemoryTile } from '../types';
import { createRoundedBoxGeometry } from '../utils/createRoundedBoxGeometry';
import { createGradientShaderMaterial } from '../utils/gradient-shader';
import { ColumnLabels } from './ColumnLabels';
import { TileTooltip } from './TileTooltip';
import { VocabularyLabels } from './VocabularyLabels';

export interface MemoryGardenMeshProps {
	data: { tiles: MemoryTile[] } | null;
	onTileClick?: (tile: MemoryTile) => void;
	animationMode?: 'static' | 'repair' | 'pulse';
	repairedTileIds?: string[];
	showTooltip?: boolean;
}

/**
 * Type guard for click events with instanceId
 */
function isInstancedClickEvent(event: THREE.Event): event is THREE.Event & { instanceId: number } {
	return (
		typeof event === 'object' &&
		event !== null &&
		'instanceId' in event &&
		typeof (event as { instanceId?: unknown }).instanceId === 'number'
	);
}

/**
 * Validate all color values in Float32Array
 * Performance: O(n) but necessary for correctness
 */
function validateColorArray(colors: Float32Array, name: string): boolean {
	if (colors.length === 0) return false;
	if (colors.length % 3 !== 0) {
		console.warn(
			`[MemoryGarden] Invalid ${name} array length: ${colors.length} (must be multiple of 3)`,
		);
		return false;
	}

	// Validate all colors, not just first few
	for (let i = 0; i < colors.length; i++) {
		if (!Number.isFinite(colors[i])) {
			console.warn(`[MemoryGarden] Invalid ${name} at index ${i}: ${colors[i]}`);
			return false;
		}
	}

	return true;
}

/**
 * Core 3D Mesh Component (Refactored)
 */
export function MemoryGardenMesh({
	data,
	onTileClick,
	animationMode = 'static',
	repairedTileIds = [],
	showTooltip = true,
}: MemoryGardenMeshProps) {
	const { meshRef, tileCount, tiles, gridSize, baseColors, topColors, getGradientBounds } =
		useMemoryGardenMesh({
			data,
			animationMode,
			repairedTileIds,
		});

	// Track clicked tile for label display
	const [clickedIndex, setClickedIndex] = useState<number | null>(null);

	// Error state for user-facing feedback
	const [gradientError, setGradientError] = useState<string | null>(null);

	// Hover detection
	const { hoveredIndex, hoveredTile, hoveredPosition } = useTileHover({
		meshRef,
		tiles,
		enabled: showTooltip,
	});

	// Tile animations
	useTileAnimations({
		meshRef,
		tiles,
		hoveredIndex,
		enabled: true,
	});

	// Create rounded geometry (memoized)
	const geometry = useMemo(
		() => createRoundedBoxGeometry(1, 1, 1, GARDEN_CONFIG.material.roundRadius, 2),
		[],
	);

	// Material refs
	const materialRef = useRef<THREE.MeshStandardMaterial>(null);
	const gradientMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
	const [gradientMaterial, setGradientMaterial] = useState<THREE.ShaderMaterial | null>(null);

	// Track previous state to avoid unnecessary updates
	const prevStateRef = useRef<{
		baseColorsLength: number;
		topColorsLength: number;
		tileCount: number;
		enableGradients: boolean;
	}>();

	/**
	 * Helper: Cleanup gradient material
	 * Extracted to avoid duplication (DRY principle)
	 */
	const cleanupGradientMaterial = useCallback(() => {
		if (gradientMaterialRef.current) {
			gradientMaterialRef.current.dispose();
			gradientMaterialRef.current = null;
		}
		// Use functional update to avoid dependency on gradientMaterial
		setGradientMaterial((prev) => {
			if (prev !== null) return null;
			return prev;
		});
		setGradientError(null);
	}, []);

	/**
	 * Create gradient material after attributes are set up
	 * Optimized: Only runs when dependencies actually change
	 */
	useLayoutEffect(() => {
		// Early exit if gradients disabled
		if (!GARDEN_CONFIG.features.enableGradients) {
			cleanupGradientMaterial();
			return;
		}

		// Check if state actually changed (avoid unnecessary work)
		const currentState = {
			baseColorsLength: baseColors.length,
			topColorsLength: topColors.length,
			tileCount,
			enableGradients: GARDEN_CONFIG.features.enableGradients,
		};

		if (
			prevStateRef.current &&
			prevStateRef.current.baseColorsLength === currentState.baseColorsLength &&
			prevStateRef.current.topColorsLength === currentState.topColorsLength &&
			prevStateRef.current.tileCount === currentState.tileCount &&
			prevStateRef.current.enableGradients === currentState.enableGradients &&
			gradientMaterialRef.current
		) {
			// State unchanged, skip update
			return;
		}
		prevStateRef.current = currentState;

		// Defensive: Check mesh and geometry
		if (!meshRef.current?.geometry) {
			return;
		}

		const geometry = meshRef.current.geometry;

		// Check attributes once (optimization: no duplicate checks)
		const baseColorAttr = geometry.getAttribute('baseColor');
		const topColorAttr = geometry.getAttribute('topColor');

		if (!baseColorAttr || !topColorAttr) {
			cleanupGradientMaterial();
			return;
		}

		// Validate data
		if (baseColors.length === 0 || topColors.length === 0 || tileCount === 0) {
			cleanupGradientMaterial();
			return;
		}

		// Validate all colors (not just first 3 tiles)
		if (
			!validateColorArray(baseColors, 'baseColors') ||
			!validateColorArray(topColors, 'topColors')
		) {
			cleanupGradientMaterial();
			setGradientError('Invalid color data detected');
			return;
		}

		// Validate gradient bounds
		const gradientBounds = getGradientBounds();
		if (
			!gradientBounds ||
			!Number.isFinite(gradientBounds.minY) ||
			!Number.isFinite(gradientBounds.maxY)
		) {
			cleanupGradientMaterial();
			return;
		}

		// Create material
		try {
			// Dispose old material
			cleanupGradientMaterial();

			const newMaterial = createGradientShaderMaterial(
				baseColors,
				topColors,
				gradientBounds.minY,
				gradientBounds.maxY,
			);

			if (!newMaterial) {
				throw new Error('createGradientShaderMaterial returned null');
			}

			gradientMaterialRef.current = newMaterial;
			setGradientMaterial(newMaterial);
			setGradientError(null);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Unknown error creating gradient material';
			console.error('[MemoryGarden] Gradient material creation failed:', error);
			console.error('[MemoryGarden] Details:', {
				baseColorsLength: baseColors.length,
				topColorsLength: topColors.length,
				tileCount,
				gradientBounds,
				hasBaseAttr: !!baseColorAttr,
				hasTopAttr: !!topColorAttr,
			});

			cleanupGradientMaterial();
			setGradientError(errorMessage);
		}

		// Cleanup on unmount
		return () => {
			cleanupGradientMaterial();
		};
	}, [baseColors, topColors, getGradientBounds, tileCount, cleanupGradientMaterial]);

	// Emissive glow system
	useEmissiveColors({
		meshRef,
		tiles,
		hoveredIndex,
		materialRef,
		enabled: true,
	});

	// Early return if no data
	if (tileCount === 0) {
		return null;
	}

	/**
	 * Handle click with proper type guards and bounds checking
	 */
	const handleClick = useCallback(
		(event: THREE.Event) => {
			if (!meshRef.current || !isInstancedClickEvent(event)) {
				return;
			}

			const { instanceId } = event;

			// Bounds check: prevent out-of-range access
			if (instanceId < 0 || instanceId >= tiles.length) {
				console.warn(
					`[MemoryGarden] Invalid instanceId: ${instanceId} (tileCount: ${tiles.length})`,
				);
				return;
			}

			const clickedTile = tiles[instanceId];
			if (!clickedTile) {
				return;
			}

			// Toggle clicked state
			setClickedIndex((prev) => (prev === instanceId ? null : instanceId));

			// Call parent handler
			onTileClick?.(clickedTile);
		},
		[tiles, onTileClick],
	);

	// Determine material to use
	const useGradientMaterial = GARDEN_CONFIG.features.enableGradients && gradientMaterial !== null;

	return (
		<>
			<instancedMesh
				ref={meshRef}
				args={[geometry, useGradientMaterial ? gradientMaterial : undefined, tileCount]}
				onClick={handleClick}
				castShadow
				receiveShadow
			>
				{!useGradientMaterial && (
					<meshStandardMaterial
						ref={materialRef}
						vertexColors
						metalness={GARDEN_CONFIG.material.metalness}
						roughness={GARDEN_CONFIG.material.roughness}
						flatShading={GARDEN_CONFIG.material.flatShading}
						emissive={new THREE.Color(0x000000)}
						emissiveIntensity={GARDEN_CONFIG.material.emissiveIntensity}
						envMapIntensity={0.5}
					/>
				)}
			</instancedMesh>

			{/* Error indicator (optional - can be styled as toast/notification) */}
			{gradientError && <mesh position={[0, 2, 0]}>{/* Could render error indicator here */}</mesh>}

			{/* Tooltip */}
			{showTooltip && hoveredTile && hoveredPosition && (
				<TileTooltip tile={hoveredTile} position={hoveredPosition} visible={true} />
			)}

			{/* Vocabulary Labels */}
			{GARDEN_CONFIG.features.enableLabels && (
				<VocabularyLabels
					tiles={tiles}
					hoveredIndex={hoveredIndex}
					clickedIndex={clickedIndex}
					gridSize={gridSize}
					enabled={GARDEN_CONFIG.features.labelDisplayMode !== 'always'}
				/>
			)}

			{/* Column Labels */}
			{GARDEN_CONFIG.features.enableColumnGrouping && <ColumnLabels tiles={tiles} enabled={true} />}
		</>
	);
}
