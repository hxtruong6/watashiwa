/**
 * VocabularyLabels Component
 *
 * Displays vocabulary words as 3D billboard sprites.
 * Uses progressive disclosure: shows labels on hover/click only.
 * Includes LOD (Level of Detail) to hide labels when zoomed out.
 */

import { Billboard, Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';

import { GARDEN_CONFIG } from '../config';
import type { MemoryTile } from '../types';
import { calculateTileHeight } from '../utils/visual-calculations';

export interface VocabularyLabelsProps {
	tiles: MemoryTile[];
	hoveredIndex: number | null;
	clickedIndex: number | null;
	gridSize: number;
	enabled?: boolean;
}

const MAX_VISIBLE_LABELS = 20;

/**
 * Vocabulary Labels Component
 *
 * Renders vocabulary words as billboard sprites above tiles.
 * Only shows labels for hovered/clicked tiles (progressive disclosure).
 * Includes LOD to limit visible labels and hide when zoomed out.
 */
export function VocabularyLabels({
	tiles,
	hoveredIndex,
	clickedIndex,
	gridSize,
	enabled = true,
}: VocabularyLabelsProps) {
	const { camera } = useThree();

	// Determine which tiles should show labels
	const visibleIndices = useMemo(() => {
		if (!enabled || !GARDEN_CONFIG.features.enableLabels) {
			return [];
		}

		const indices = new Set<number>();

		// Add hovered tile
		if (hoveredIndex !== null) {
			indices.add(hoveredIndex);
		}

		// Add clicked tile
		if (clickedIndex !== null) {
			indices.add(clickedIndex);
		}

		// Limit to max visible labels
		const result = Array.from(indices).slice(0, MAX_VISIBLE_LABELS);
		return result;
	}, [hoveredIndex, clickedIndex, enabled]);

	// Calculate camera distance for LOD
	const cameraDistance = useMemo(() => {
		return camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
	}, [camera.position]);

	// LOD: Hide labels when camera is too far
	const showLabels = cameraDistance < GARDEN_CONFIG.camera.maxDistance * 0.7;

	if (!showLabels || visibleIndices.length === 0) {
		return null;
	}

	return (
		<>
			{visibleIndices.map((index) => {
				const tile = tiles[index];
				if (!tile) return null;

				// Calculate tile position (matching grid layout from visual-calculations)
				const x = Math.floor(index / gridSize);
				const y = index % gridSize;
				const posX = (x - gridSize / 2) * GARDEN_CONFIG.tileSpacing;
				const posZ = (y - gridSize / 2) * GARDEN_CONFIG.tileSpacing;

				// Calculate tile height
				const height = calculateTileHeight(tile);
				const posY = Math.max(0.1, height / 2) + 0.5; // Position label above tile

				return (
					<Billboard
						key={`label-${tile.vocabId}`}
						position={[posX, posY, posZ]}
						follow={true}
						lockX={false}
						lockY={false}
						lockZ={false}
					>
						<Text
							fontSize={0.3}
							color={tile.isLeech ? '#EF4444' : '#1F2937'}
							anchorX="center"
							anchorY="middle"
							outlineWidth={0.05}
							outlineColor="#FFFFFF"
							maxWidth={2}
						>
							{tile.wordSurface}
						</Text>
					</Billboard>
				);
			})}
		</>
	);
}

