/**
 * useEmissiveColors Hook
 *
 * Manages emissive glow colors for tiles.
 * Since InstancedMesh doesn't support per-instance emissive easily,
 * we use a custom approach: update material emissive based on hovered/important tiles.
 *
 * For full per-instance emissive, we'd need a custom shader, but this provides
 * good visual hierarchy with minimal complexity.
 */

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { InstancedMesh } from 'three';

import { GARDEN_CONFIG } from '../config';
import type { MemoryTile } from '../types';
import { calculateEmissiveColor } from '../utils/calculateEmissiveColor';

export interface UseEmissiveColorsOptions {
	meshRef: React.RefObject<InstancedMesh | null>;
	tiles: MemoryTile[];
	hoveredIndex: number | null;
	materialRef: React.RefObject<THREE.MeshStandardMaterial | null>;
	enabled?: boolean;
}

/**
 * Hook for managing emissive glow effects
 *
 * Strategy:
 * - Calculate average emissive color from important tiles (leeches, mastered)
 * - Apply to material for subtle glow
 * - Enhance hovered tile emissive
 */
export function useEmissiveColors({
	meshRef,
	tiles,
	hoveredIndex,
	materialRef,
	enabled = true,
}: UseEmissiveColorsOptions) {
	const emissiveColor = useRef(new THREE.Color(0x000000));
	const targetEmissive = useRef(new THREE.Color(0x000000));

	useFrame(({ clock }) => {
		if (!enabled || !materialRef.current || tiles.length === 0) {
			return;
		}

		const time = clock.getElapsedTime();
		// Pulse intensity for leeches (if enabled)
		const leechPulseIntensity = GARDEN_CONFIG.features.enablePulse
			? 1.0 + Math.sin(time * 1.0) * 0.2 // 20% pulse variation
			: 1.0;

		// Calculate average emissive from important tiles
		let totalEmissive = new THREE.Color(0x000000);
		let count = 0;

		tiles.forEach((tile, index) => {
			let emissive = calculateEmissiveColor(tile);
			
			// Apply pulse to leeches
			if (GARDEN_CONFIG.features.enablePulse && tile.isLeech) {
				emissive = emissive.clone().multiplyScalar(leechPulseIntensity);
			}
			
			if (emissive.r > 0 || emissive.g > 0 || emissive.b > 0) {
				totalEmissive.add(emissive);
				count++;
			}

			// Enhance hovered tile
			if (hoveredIndex === index) {
				const hoverEmissive = calculateEmissiveColor(tile);
				hoverEmissive.multiplyScalar(1.5); // 50% brighter on hover
				totalEmissive.add(hoverEmissive);
				count++;
			}
		});

		// Average emissive (subtle overall glow)
		if (count > 0) {
			targetEmissive.current.copy(totalEmissive).multiplyScalar(1 / count).multiplyScalar(0.3);
		} else {
			targetEmissive.current.set(0x000000);
		}

		// Smooth interpolation
		emissiveColor.current.lerp(targetEmissive.current, 0.1);

		// Apply to material
		materialRef.current.emissive.copy(emissiveColor.current);
		materialRef.current.emissiveIntensity = GARDEN_CONFIG.material.emissiveIntensity;
	});
}

