/**
 * useTileHover Hook
 *
 * Handles raycasting to detect which tile is being hovered.
 * Returns the hovered tile index and position for tooltip display.
 */
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import type { InstancedMesh } from 'three';

import type { MemoryTile } from '../types';

export interface UseTileHoverOptions {
	meshRef: React.RefObject<InstancedMesh | null>;
	tiles: MemoryTile[];
	enabled?: boolean;
}

export interface UseTileHoverReturn {
	hoveredIndex: number | null;
	hoveredTile: MemoryTile | null;
	hoveredPosition: THREE.Vector3 | null;
}

/**
 * Hook for detecting hovered tiles via raycasting
 */
export function useTileHover({
	meshRef,
	tiles,
	enabled = true,
}: UseTileHoverOptions): UseTileHoverReturn {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [hoveredPosition, setHoveredPosition] = useState<THREE.Vector3 | null>(null);
	const mouse = useRef(new THREE.Vector2());

	useFrame(({ camera, pointer, raycaster: frameRaycaster }) => {
		if (!enabled || !meshRef.current || tiles.length === 0) {
			if (hoveredIndex !== null) {
				setHoveredIndex(null);
				setHoveredPosition(null);
			}
			return;
		}

		// Update mouse position
		mouse.current.set(pointer.x, pointer.y);

		// Use frame raycaster (more efficient)
		frameRaycaster.setFromCamera(mouse.current, camera);

		// Raycast against instanced mesh
		const intersects = frameRaycaster.intersectObject(meshRef.current);

		if (intersects.length > 0) {
			const intersect = intersects[0];
			// Get instance index from intersection
			const instanceId = intersect.instanceId ?? null;

			if (instanceId !== null && instanceId !== hoveredIndex) {
				setHoveredIndex(instanceId);
				setHoveredPosition(intersect.point);
			}
		} else {
			if (hoveredIndex !== null) {
				setHoveredIndex(null);
				setHoveredPosition(null);
			}
		}
	});

	return {
		hoveredIndex,
		hoveredTile: hoveredIndex !== null && tiles[hoveredIndex] ? tiles[hoveredIndex] : null,
		hoveredPosition,
	};
}
