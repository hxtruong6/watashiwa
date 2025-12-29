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
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
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
	const { meshRef, tileCount, tiles, gridSize, baseColors, topColors, getGradientBounds } =
		useMemoryGardenMesh({
			data,
			animationMode,
			repairedTileIds,
		});

	// Track clicked tile for label display
	const [clickedIndex, setClickedIndex] = useState<number | null>(null);

	// Hover detection
	const { hoveredIndex, hoveredTile, hoveredPosition } = useTileHover({
		meshRef,
		tiles,
		enabled: showTooltip,
	});

	// Tile animations (hover scale, breathing, growth)
	useTileAnimations({
		meshRef,
		tiles,
		hoveredIndex,
		enabled: true,
	});

	// Create rounded geometry (memoized for performance)
	const geometry = useMemo(
		() => createRoundedBoxGeometry(1, 1, 1, GARDEN_CONFIG.material.roundRadius, 2),
		[],
	);

	// Material ref for emissive color updates (standard material)
	const materialRef = useRef<THREE.MeshStandardMaterial>(null);

	// Gradient shader material (created after attributes are set up)
	// Use ref to avoid infinite loops, state only for re-renders
	const gradientMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
	const [gradientMaterial, setGradientMaterial] = useState<THREE.ShaderMaterial | null>(null);
	const prevDataRef = useRef<string>('');

	// Create gradient material after attributes are set up
	useLayoutEffect(() => {
		// Create a hash of the data to detect changes
		// Use tileCount and enableGradients flag - NOT the arrays themselves
		// Arrays are mutated, not replaced, so including them causes infinite loops
		const dataHash = `${tileCount}-${GARDEN_CONFIG.features.enableGradients}`;

		// Skip if data hasn't changed AND material already exists
		if (dataHash === prevDataRef.current && gradientMaterialRef.current) {
			return;
		}
		prevDataRef.current = dataHash;

		if (!GARDEN_CONFIG.features.enableGradients) {
			if (gradientMaterialRef.current) {
				gradientMaterialRef.current.dispose();
				gradientMaterialRef.current = null;
			}
			// Only update state if it's not already null (prevents unnecessary re-renders)
			setGradientMaterial((prev) => (prev !== null ? null : prev));
			return;
		}

		// Wait for mesh and attributes to be ready
		if (!meshRef.current?.geometry) {
			return;
		}

		const baseColorAttr = meshRef.current.geometry.getAttribute('baseColor');
		const topColorAttr = meshRef.current.geometry.getAttribute('topColor');

		// Attributes must exist before creating material
		if (!baseColorAttr || !topColorAttr) {
			if (gradientMaterialRef.current) {
				gradientMaterialRef.current.dispose();
				gradientMaterialRef.current = null;
			}
			setGradientMaterial((prev) => (prev !== null ? null : prev));
			return;
		}

		// Check if we have valid gradient data
		if (baseColors.length === 0 || topColors.length === 0 || tileCount === 0) {
			if (gradientMaterialRef.current) {
				gradientMaterialRef.current.dispose();
				gradientMaterialRef.current = null;
			}
			setGradientMaterial((prev) => (prev !== null ? null : prev));
			return;
		}

		// Validate color arrays
		for (let i = 0; i < Math.min(baseColors.length, 9); i += 3) {
			if (
				!Number.isFinite(baseColors[i]) ||
				!Number.isFinite(baseColors[i + 1]) ||
				!Number.isFinite(baseColors[i + 2]) ||
				!Number.isFinite(topColors[i]) ||
				!Number.isFinite(topColors[i + 1]) ||
				!Number.isFinite(topColors[i + 2])
			) {
				if (gradientMaterialRef.current) {
					gradientMaterialRef.current.dispose();
					gradientMaterialRef.current = null;
				}
				setGradientMaterial((prev) => (prev !== null ? null : prev));
				return;
			}
		}

		const gradientBounds = getGradientBounds();
		if (
			!gradientBounds ||
			!Number.isFinite(gradientBounds.minY) ||
			!Number.isFinite(gradientBounds.maxY)
		) {
			if (gradientMaterialRef.current) {
				gradientMaterialRef.current.dispose();
				gradientMaterialRef.current = null;
			}
			setGradientMaterial((prev) => (prev !== null ? null : prev));
			return;
		}

		try {
			// Verify attributes are actually on the geometry
			const baseAttr = meshRef.current.geometry.getAttribute('baseColor');
			const topAttr = meshRef.current.geometry.getAttribute('topColor');

			if (!baseAttr || !topAttr) {
				console.warn('[MemoryGarden] Attributes not found on geometry, skipping gradient material');
				if (gradientMaterialRef.current) {
					gradientMaterialRef.current.dispose();
					gradientMaterialRef.current = null;
				}
				setGradientMaterial((prev) => (prev !== null ? null : prev));
				return;
			}

			// Dispose old material if exists
			if (gradientMaterialRef.current) {
				gradientMaterialRef.current.dispose();
			}

			const newMaterial = createGradientShaderMaterial(
				baseColors,
				topColors,
				gradientBounds.minY,
				gradientBounds.maxY,
			);

			// Verify material was created successfully
			if (!newMaterial) {
				throw new Error('Failed to create shader material');
			}

			// Only update state if material actually changed (prevents infinite loop)
			gradientMaterialRef.current = newMaterial;
			setGradientMaterial((prev) => {
				// Only update if different (prevents unnecessary re-renders)
				return prev === newMaterial ? prev : newMaterial;
			});
		} catch (error) {
			console.error('[MemoryGarden] Error creating gradient material:', error);
			if (error instanceof Error) {
				console.error('[MemoryGarden] Error message:', error.message);
				console.error('[MemoryGarden] Error stack:', error.stack);
			}
			console.error('[MemoryGarden] Error details:', {
				baseColorsLength: baseColors.length,
				topColorsLength: topColors.length,
				tileCount,
				gradientBounds,
				hasBaseAttr: !!baseColorAttr,
				hasTopAttr: !!topColorAttr,
				geometry: meshRef.current?.geometry ? 'exists' : 'missing',
			});
			if (gradientMaterialRef.current) {
				gradientMaterialRef.current.dispose();
				gradientMaterialRef.current = null;
			}
			setGradientMaterial((prev) => (prev !== null ? null : prev));
		}

		// Cleanup on unmount
		return () => {
			if (gradientMaterialRef.current) {
				gradientMaterialRef.current.dispose();
				gradientMaterialRef.current = null;
			}
		};
		// CRITICAL: baseColors and topColors are NOT in deps because:
		// 1. They're Float32Arrays that get mutated, not replaced
		// 2. Including them causes infinite loops (new array refs on every render)
		// 3. We track changes via tileCount instead
		// getGradientBounds is a stable function, safe to include
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tileCount, getGradientBounds]);

	// Emissive glow system
	useEmissiveColors({
		meshRef,
		tiles,
		hoveredIndex,
		materialRef,
		enabled: true,
	});

	// Early return if no data (after all hooks)
	if (tileCount === 0) {
		return null;
	}

	const handleClick = (event: THREE.Event) => {
		if (!meshRef.current) return;

		// Get clicked instance from event
		const intersect = event as unknown as { instanceId?: number };
		if (intersect.instanceId !== undefined && tiles[intersect.instanceId]) {
			const clickedTile = tiles[intersect.instanceId];

			// Toggle clicked state for label display
			setClickedIndex(clickedIndex === intersect.instanceId ? null : intersect.instanceId);

			// Call parent click handler
			if (onTileClick) {
				onTileClick(clickedTile);
			}
		}
	};

	// Determine which material to use
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
						// Enhanced visual properties
						envMapIntensity={0.5}
					/>
				)}
			</instancedMesh>

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

			{/* Column Labels (when column grouping enabled) */}
			{GARDEN_CONFIG.features.enableColumnGrouping && <ColumnLabels tiles={tiles} enabled={true} />}
		</>
	);
}
