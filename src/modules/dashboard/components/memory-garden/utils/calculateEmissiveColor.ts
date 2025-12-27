/**
 * Calculate Emissive Color
 *
 * Adds subtle glow effects to tiles based on their state.
 * Makes leeches and mastered tiles "glow" for better visual hierarchy.
 */
import * as THREE from 'three';

import { GARDEN_CONFIG } from '../config';
import type { MemoryTile } from '../types';

/**
 * Calculate emissive color for a tile (glow effect)
 *
 * Strategy:
 * - Leeches: Red glow (warning/attention)
 * - Mastered: Green glow (achievement)
 * - Learning: Blue glow (progress)
 * - New: No glow (neutral)
 */
export function calculateEmissiveColor(tile: MemoryTile): THREE.Color {
	const emissive = new THREE.Color(0x000000); // Default: no glow

	if (!tile || typeof tile.stability !== 'number' || Number.isNaN(tile.stability)) {
		return emissive;
	}

	const stability = Math.max(0, tile.stability);
	const baseIntensity = GARDEN_CONFIG.material.emissiveIntensity;
	const multiplier = GARDEN_CONFIG.material.emissiveMultiplier;

	if (tile.isLeech) {
		// Leech: Red glow (more intense = more urgent)
		const lapseIntensity = Math.min((tile.lapses || 3) / 8, 1.0);
		emissive.set(GARDEN_CONFIG.colors.leech);
		emissive.multiplyScalar(baseIntensity * multiplier * (0.5 + lapseIntensity * 0.5));
	} else if (stability > 21) {
		// Mastered: Green glow (achievement)
		const stabilityNormalized = Math.min(stability / 100, 1.0);
		emissive.set(GARDEN_CONFIG.colors.mastered);
		emissive.multiplyScalar(baseIntensity * multiplier * (0.3 + stabilityNormalized * 0.4));
	} else if (stability > 7) {
		// Learning: Subtle blue glow (progress)
		emissive.set(GARDEN_CONFIG.colors.learning);
		emissive.multiplyScalar(baseIntensity * 0.5);
	}
	// New: No glow (stays black)

	return emissive;
}
