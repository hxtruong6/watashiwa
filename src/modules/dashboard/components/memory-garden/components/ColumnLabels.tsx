/**
 * ColumnLabels Component
 *
 * Displays deck names as column headers above each column.
 * Only shown when column grouping is enabled.
 */

import { Billboard, Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';

import { GARDEN_CONFIG } from '../config';
import type { MemoryTile } from '../types';
import { getDeckName, groupTilesByDeck } from '../utils/tile-sampling';
import { calculateColumnPosition } from '../utils/visual-calculations';

export interface ColumnLabelsProps {
	tiles: MemoryTile[];
	enabled?: boolean;
}

/**
 * Column Labels Component
 *
 * Renders deck names as billboard text above each column.
 */
export function ColumnLabels({ tiles, enabled = true }: ColumnLabelsProps) {
	const { camera } = useThree();

	// Group tiles by deck
	const deckGroups = useMemo(() => {
		if (!enabled || !GARDEN_CONFIG.features.enableColumnGrouping) {
			return new Map<string, MemoryTile[]>();
		}
		return groupTilesByDeck(tiles);
	}, [tiles, enabled]);

	// Calculate camera distance for LOD
	const cameraDistance = useMemo(() => {
		return camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
	}, [camera.position]);

	// LOD: Hide labels when camera is too far
	const showLabels = cameraDistance < GARDEN_CONFIG.camera.maxDistance * 0.7;

	if (!showLabels || deckGroups.size === 0) {
		return null;
	}

	const columns = Array.from(deckGroups.entries());
	const totalColumns = columns.length;

	return (
		<>
			{columns.map(([deckId, columnTiles], columnIndex) => {
				const deckName = getDeckName(tiles, deckId);
				const maxHeight = Math.max(...columnTiles.map((t) => t.stability || 0));
				
				// Position label at top of column
				const position = calculateColumnPosition(
					columnIndex,
					columnTiles.length, // Position above all tiles
					totalColumns,
				);
				position.y += 0.5; // Add extra height for label

				return (
					<Billboard
						key={`column-label-${deckId}`}
						position={[position.x, position.y, position.z]}
						follow={true}
						lockX={false}
						lockY={false}
						lockZ={false}
					>
						<Text
							fontSize={0.25}
							color="#1F2937"
							anchorX="center"
							anchorY="middle"
							outlineWidth={0.03}
							outlineColor="#FFFFFF"
							maxWidth={2}
						>
							{deckName}
						</Text>
					</Billboard>
				);
			})}
		</>
	);
}

