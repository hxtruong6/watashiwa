/**
 * useCameraZoom Hook
 *
 * Handles smooth camera animation to zoom into specific tiles.
 * Provides click-to-zoom functionality.
 */
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';

import { GARDEN_CONFIG } from '../config';
import type { MemoryTile } from '../types';
import { calculateTileHeight, calculateTilePosition } from '../utils/visual-calculations';

export interface UseCameraZoomOptions {
	gridSize: number;
	enabled?: boolean;
}

export interface UseCameraZoomReturn {
	zoomToTile: (tile: MemoryTile, tileIndex: number) => void;
	resetCamera: () => void;
	isZooming: boolean;
}

/**
 * Hook for smooth camera zoom animations
 */
export function useCameraZoom({
	gridSize,
	enabled = true,
}: UseCameraZoomOptions): UseCameraZoomReturn {
	const { camera } = useThree();
	const [isZooming, setIsZooming] = useState(false);
	const targetPosition = useRef<THREE.Vector3 | null>(null);
	const initialPosition = useRef<THREE.Vector3>(
		new THREE.Vector3(...GARDEN_CONFIG.camera.position),
	);

	// Smooth camera interpolation
	useFrame(() => {
		if (!enabled || !targetPosition.current) {
			return;
		}

		const distance = camera.position.distanceTo(targetPosition.current);

		if (distance > 0.1) {
			camera.position.lerp(targetPosition.current, 0.05);
			camera.lookAt(targetPosition.current);
			camera.updateProjectionMatrix();
			setIsZooming(true);
		} else {
			setIsZooming(false);
		}
	});

	const zoomToTile = (tile: MemoryTile, tileIndex: number) => {
		if (!enabled) return;

		// Calculate tile world position
		const gridPos = calculateTilePosition(tileIndex, gridSize, GARDEN_CONFIG.tileSpacing);
		const height = calculateTileHeight(tile);
		const worldPos = new THREE.Vector3(
			gridPos.x,
			height / 2 + 0.5, // Slightly above tile
			gridPos.z,
		);

		// Calculate camera position (offset from tile)
		const offset = new THREE.Vector3(3, 3, 3);
		targetPosition.current = worldPos.clone().add(offset);
		setIsZooming(true);
	};

	const resetCamera = () => {
		if (!enabled) return;
		targetPosition.current = initialPosition.current.clone();
		setIsZooming(true);
	};

	return {
		zoomToTile,
		resetCamera,
		isZooming,
	};
}
