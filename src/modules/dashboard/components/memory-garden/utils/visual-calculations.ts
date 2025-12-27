/**
 * Visual Calculation Utilities
 *
 * Pure functions for calculating visual properties (height, color, position).
 * These are stateless and testable.
 *
 * Performance: All calculations are O(1) - no loops or heavy operations.
 */
import * as THREE from 'three';

import { GARDEN_CONFIG } from '../config';
import type { MemoryTile } from '../types';

export interface TileVisualState {
	height: number;
	color: THREE.Color;
	position: { x: number; y: number; z: number };
	scale: { x: number; y: number; z: number };
}

/**
 * Calculate tile height based on memory state
 *
 * Logic:
 * - Leech: Deep negative (hole) = -0.5
 * - New: Flat = 0.15
 * - Mastered: Scaled by stability = 0.3 to 1.2
 *
 * Edge Cases:
 * - Invalid stability → clamped to valid range
 * - Negative stability → treated as 0
 * - NaN stability → treated as 0
 */
export function calculateTileHeight(tile: MemoryTile): number {
	// Defensive: Validate input
	if (!tile || typeof tile.stability !== 'number' || Number.isNaN(tile.stability)) {
		return GARDEN_CONFIG.heights.new;
	}

	const stability = Math.max(0, tile.stability);

	if (tile.isLeech) {
		// Vary leech height based on severity (lapses count)
		// More lapses = deeper hole (more negative)
		const lapses = Math.max(3, Math.min(tile.lapses || 3, GARDEN_CONFIG.heights.leechLapseCap));
		const lapseNormalized = (lapses - 3) / (GARDEN_CONFIG.heights.leechLapseCap - 3); // 0 to 1
		// Interpolate from leechMax (shallow) to leechMin (deep)
		return (
			GARDEN_CONFIG.heights.leechMax -
			lapseNormalized * (GARDEN_CONFIG.heights.leechMax - GARDEN_CONFIG.heights.leechMin)
		);
	}

	if (stability > 21) {
		// Mastered: Scale stability to height
		const stabilityNormalized = Math.min(stability / GARDEN_CONFIG.heights.stabilityCap, 1.0);
		return (
			GARDEN_CONFIG.heights.masteredMin +
			stabilityNormalized * (GARDEN_CONFIG.heights.masteredMax - GARDEN_CONFIG.heights.masteredMin)
		);
	}

	// New/Learning: Flat ground
	return GARDEN_CONFIG.heights.new;
}

/**
 * Calculate tile color based on memory state
 *
 * Color Strategy:
 * - Leech: Red (high contrast)
 * - Mastered (>21 days): Dark Green
 * - Learning (7-21 days): Light Green
 * - New (0-7 days): Almost White
 *
 * Edge Cases:
 * - Invalid stability → defaults to new color
 * - Animation modes handled via pulseIntensity parameter
 */
export function calculateTileColor(
	tile: MemoryTile,
	options: {
		animationMode?: 'static' | 'repair' | 'pulse';
		pulseIntensity?: number;
		isRepaired?: boolean;
	} = {},
): THREE.Color {
	const { animationMode = 'static', pulseIntensity = 1.0, isRepaired = false } = options;
	const color = new THREE.Color();

	// Defensive: Validate input
	if (!tile || typeof tile.stability !== 'number' || Number.isNaN(tile.stability)) {
		color.set(GARDEN_CONFIG.colors.new);
		return color;
	}

	const stability = Math.max(0, tile.stability);

	if (tile.isLeech) {
		// Leech: Red with optional pulse
		const intensity =
			animationMode === 'pulse' ? GARDEN_CONFIG.animation.pulseIntensity : pulseIntensity;
		color.set(GARDEN_CONFIG.colors.leech).multiplyScalar(Math.min(intensity, 1.0));
	} else if (isRepaired || (animationMode === 'repair' && tile.isLeech)) {
		// Repair animation: Interpolate red → green
		color.lerpColors(
			new THREE.Color(GARDEN_CONFIG.colors.leech),
			new THREE.Color(GARDEN_CONFIG.colors.mastered),
			GARDEN_CONFIG.animation.repairTransition,
		);
	} else if (stability > 21) {
		// Mastered: Vibrant Emerald Green
		color.set(GARDEN_CONFIG.colors.mastered);
	} else if (stability > 7) {
		// Learning: Bright Blue
		color.set(GARDEN_CONFIG.colors.learning);
	} else {
		// New: Light Gray
		color.set(GARDEN_CONFIG.colors.new);
	}

	return color;
}

/**
 * Calculate tile position in grid
 *
 * Grid Layout: Square grid with centered origin
 *
 * Edge Cases:
 * - Negative gridSize → treated as 1
 * - Invalid indices → clamped to valid range
 */
export function calculateTilePosition(
	gridIndex: number,
	gridSize: number,
	spacing: number = GARDEN_CONFIG.tileSpacing,
): { x: number; y: number; z: number } {
	// Defensive: Validate inputs
	const safeGridSize = Math.max(1, gridSize);
	const safeSpacing = Math.max(0.1, spacing);
	const safeIndex = Math.max(0, Math.floor(gridIndex));

	const x = Math.floor(safeIndex / safeGridSize);
	const y = safeIndex % safeGridSize;

	// Center the grid at origin
	const posX = (x - safeGridSize / 2) * safeSpacing;
	const posZ = (y - safeGridSize / 2) * safeSpacing;

	return { x: posX, y: 0, z: posZ }; // y will be set by height
}

/**
 * Calculate complete visual state for a tile
 *
 * This is the main entry point for visual calculations.
 * Combines height, color, and position into a single state object.
 */
export function calculateTileVisualState(
	tile: MemoryTile,
	gridIndex: number,
	gridSize: number,
	options: {
		animationMode?: 'static' | 'repair' | 'pulse';
		repairedTileIds?: string[];
	} = {},
): TileVisualState {
	const height = calculateTileHeight(tile);
	const color = calculateTileColor(tile, {
		animationMode: options.animationMode,
		isRepaired: options.repairedTileIds?.includes(tile.vocabId),
	});
	const position = calculateTilePosition(gridIndex, gridSize);

	// Set Y position based on height (center height at base)
	position.y = height / 2;

	// Calculate scale (prevent zero-height tiles)
	const scaleY = Math.max(0.1, Math.abs(height));

	return {
		height,
		color,
		position,
		scale: { x: 1, y: scaleY, z: 1 },
	};
}
