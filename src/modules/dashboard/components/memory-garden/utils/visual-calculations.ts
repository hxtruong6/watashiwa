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
		// Mastered: Smooth transition from learning blue to mastered green
		// Interpolate based on how far above 21 days (0-50 days range)
		const progress = Math.min((stability - 21) / 50, 1.0);
		color.lerpColors(
			new THREE.Color(GARDEN_CONFIG.colors.learning),
			new THREE.Color(GARDEN_CONFIG.colors.mastered),
			progress,
		);
		// Add stability-based intensity for mastered tiles (more stable = brighter green)
		const intensityFactor = 0.7 + progress * 0.3; // 0.7 to 1.0
		color.multiplyScalar(intensityFactor);
	} else if (stability > 7) {
		// Learning: Smooth transition from new gray to learning blue
		const progress = (stability - 7) / 14; // 7 to 21 days = 0 to 1
		color.lerpColors(
			new THREE.Color(GARDEN_CONFIG.colors.new),
			new THREE.Color(GARDEN_CONFIG.colors.learning),
			progress,
		);
	} else {
		// New (0-7 days): Smooth transition from gray to light blue
		const progress = stability / 7; // 0 to 7 days = 0 to 1
		const lightBlue = new THREE.Color('#E0F2FE'); // Very light blue
		color.lerpColors(new THREE.Color(GARDEN_CONFIG.colors.new), lightBlue, progress);
	}

	return color;
}

/**
 * Calculate gradient colors (base and top) for a tile
 *
 * Gradient Strategy:
 * - Base color: Darker version of tile color
 * - Top color: Brighter version of tile color
 * - Creates depth and visual interest
 *
 * Returns: { baseColor, topColor } as THREE.Color objects
 */
export function calculateGradientColors(
	tile: MemoryTile,
	options: {
		animationMode?: 'static' | 'repair' | 'pulse';
		pulseIntensity?: number;
		isRepaired?: boolean;
	} = {},
): { baseColor: THREE.Color; topColor: THREE.Color } {
	const baseColor = calculateTileColor(tile, options);
	const topColor = baseColor.clone();

	// Make top color brighter (multiply by factor > 1)
	// For leeches: Keep red but make top brighter
	// For others: Increase brightness by 20-30%
	if (tile.isLeech) {
		topColor.multiplyScalar(1.2); // 20% brighter red
	} else {
		// Increase brightness and saturation for mastered/learning
		const stability = Math.max(0, tile.stability);
		if (stability > 21) {
			// Mastered: More vibrant green at top
			topColor.multiplyScalar(1.3);
		} else if (stability > 7) {
			// Learning: Brighter blue at top
			topColor.multiplyScalar(1.25);
		} else {
			// New: Subtle brightness increase
			topColor.multiplyScalar(1.1);
		}
	}

	// Clamp to prevent oversaturation and invalid values
	topColor.r = Math.max(0, Math.min(1.0, topColor.r));
	topColor.g = Math.max(0, Math.min(1.0, topColor.g));
	topColor.b = Math.max(0, Math.min(1.0, topColor.b));

	// Ensure base color is also valid
	baseColor.r = Math.max(0, Math.min(1.0, baseColor.r));
	baseColor.g = Math.max(0, Math.min(1.0, baseColor.g));
	baseColor.b = Math.max(0, Math.min(1.0, baseColor.b));

	// Defensive: Check for NaN or Infinity
	if (
		!Number.isFinite(baseColor.r) ||
		!Number.isFinite(baseColor.g) ||
		!Number.isFinite(baseColor.b) ||
		!Number.isFinite(topColor.r) ||
		!Number.isFinite(topColor.g) ||
		!Number.isFinite(topColor.b)
	) {
		// Fallback to safe colors
		baseColor.set(GARDEN_CONFIG.colors.new);
		topColor.set(GARDEN_CONFIG.colors.new);
	}

	return { baseColor, topColor };
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
 * Calculate tile position in column layout
 *
 * Column Layout: Tiles stacked vertically in columns, one deck per column
 *
 * @param columnIndex - Which column (0-based)
 * @param rowIndex - Position within column (0-based)
 * @param totalColumns - Total number of columns
 * @param spacing - Spacing between columns
 * @param verticalSpacing - Spacing between tiles in column
 */
export function calculateColumnPosition(
	columnIndex: number,
	rowIndex: number,
	totalColumns: number,
	spacing: number = GARDEN_CONFIG.tileSpacing * 1.5,
	verticalSpacing: number = GARDEN_CONFIG.tileSpacing * 0.8,
): { x: number; y: number; z: number } {
	// Center columns at origin
	const posX = (columnIndex - totalColumns / 2) * spacing;
	const posZ = 0; // All tiles in same column have same Z
	const posY = rowIndex * verticalSpacing; // Stack vertically

	return { x: posX, y: posY, z: posZ };
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
