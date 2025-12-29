/**
 * useTileAnimations Hook
 *
 * Manages all per-tile animations:
 * - Hover scale effect
 * - Breathing animation (gentle pulse)
 * - Growth animation (on mastery)
 *
 * All animations run in useFrame for smooth 60fps updates.
 */

import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { InstancedMesh } from 'three';

import { GARDEN_CONFIG } from '../config';
import type { MemoryTile } from '../types';
import { calculateTileHeight } from '../utils/visual-calculations';

export interface UseTileAnimationsOptions {
	meshRef: React.RefObject<InstancedMesh | null>;
	tiles: MemoryTile[];
	hoveredIndex: number | null;
	enabled?: boolean;
}

/**
 * Easing function for smooth animations
 */
function easeOutCubic(t: number): number {
	return 1 - Math.pow(1 - t, 3);
}

/**
 * Hook for managing tile animations
 */
export function useTileAnimations({
	meshRef,
	tiles,
	hoveredIndex,
	enabled = true,
}: UseTileAnimationsOptions) {
	const dummy = useRef(new THREE.Object3D());
	const baseScales = useRef<Map<number, THREE.Vector3>>(new Map());
	const animationStates = useRef<Map<number, { type: 'growth' | 'breathing'; startTime: number }>>(
		new Map(),
	);
	const previousMasteryState = useRef<Map<string, boolean>>(new Map());

	// Track newly mastered tiles for growth animation
	useEffect(() => {
		if (!enabled || !meshRef.current) return;

		tiles.forEach((tile, index) => {
			const wasMastered = previousMasteryState.current.get(tile.vocabId) || false;
			const isMastered = !tile.isLeech && tile.stability > 21;

			if (isMastered && !wasMastered) {
				// Newly mastered - trigger growth animation
				// Start time will be set in useFrame using clock
				animationStates.current.set(index, {
					type: 'growth',
					startTime: 0, // Will be set in useFrame
				});
			}

			previousMasteryState.current.set(tile.vocabId, isMastered);
		});
	}, [tiles, enabled, meshRef]);

	// Store base scales on initial render
	useEffect(() => {
		if (!meshRef.current || tiles.length === 0) return;

		tiles.forEach((tile, index) => {
			const height = calculateTileHeight(tile);
			const scaleY = Math.max(0.1, Math.abs(height));
			baseScales.current.set(index, new THREE.Vector3(1, scaleY, 1));
		});
	}, [tiles, meshRef]);

	// Animation loop
	useFrame(({ clock }) => {
		if (!enabled || !meshRef.current || tiles.length === 0) {
			return;
		}

		const mesh = meshRef.current;
		const time = clock.getElapsedTime();

		// Breathing animation: Gentle pulse for all tiles
		const breathingScale = 1 + Math.sin(time * 0.5) * 0.02; // 2% pulse

		// Pulse animation for leeches (if enabled)
		const leechPulseScale = GARDEN_CONFIG.features.enablePulse
			? 1 + Math.sin(time * 1.0) * 0.03 // 3% pulse, faster than breathing
			: 1.0;

		// Process each tile
		for (let i = 0; i < tiles.length; i++) {
			const tile = tiles[i];
			const baseScale = baseScales.current.get(i) || new THREE.Vector3(1, 1, 1);
			const animationState = animationStates.current.get(i);

			let finalScale = baseScale.clone();

			// Apply breathing animation (subtle pulse for all tiles)
			finalScale.multiplyScalar(breathingScale);

			// Apply leech pulse (more pronounced for leeches)
			if (GARDEN_CONFIG.features.enablePulse && tile.isLeech) {
				finalScale.multiplyScalar(leechPulseScale);
			}

			// Apply hover scale (if hovered)
			if (hoveredIndex === i) {
				finalScale.multiplyScalar(1.1); // 10% larger on hover
			}

			// Apply growth animation (if newly mastered)
			if (animationState?.type === 'growth') {
				// Initialize start time if not set
				if (animationState.startTime === 0) {
					animationState.startTime = time;
				}

				const elapsed = time - animationState.startTime;
				const duration = 1.0; // 1 second animation
				const progress = Math.min(elapsed / duration, 1.0);

				if (progress < 1.0) {
					// Animate from ground (scale 0) to final scale
					const growthScale = easeOutCubic(progress);
					finalScale.y = baseScale.y * growthScale;
				} else {
					// Animation complete, remove state
					animationStates.current.delete(i);
				}
			}

			// Get current position from matrix
			const matrix = new THREE.Matrix4();
			mesh.getMatrixAt(i, matrix);
			const position = new THREE.Vector3();
			const quaternion = new THREE.Quaternion();
			const scale = new THREE.Vector3();
			matrix.decompose(position, quaternion, scale);

			// Update matrix with new scale
			dummy.current.position.copy(position);
			dummy.current.quaternion.copy(quaternion);
			dummy.current.scale.copy(finalScale);
			dummy.current.updateMatrix();

			mesh.setMatrixAt(i, dummy.current.matrix);
		}

		// Update GPU buffer
		if (mesh.instanceMatrix) {
			mesh.instanceMatrix.needsUpdate = true;
		}
	});
}

