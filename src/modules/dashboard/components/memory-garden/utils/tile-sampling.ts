/**
 * Tile Sampling Utilities
 *
 * Smart sampling strategies for displaying representative tiles.
 * Handles edge cases: empty data, malformed tiles, extreme distributions.
 */
import { GARDEN_CONFIG } from '../config';
import type { GardenFilter, MemoryTile } from '../types';

export interface SamplingStrategy {
	maxLeeches: number;
	maxMastered: number;
	maxLearning: number;
	totalMax: number;
}

/**
 * Default sampling strategy (balanced representation)
 */
export const DEFAULT_STRATEGY: SamplingStrategy = {
	maxLeeches: GARDEN_CONFIG.maxLeechesDisplay,
	maxMastered: GARDEN_CONFIG.maxMasteredDisplay,
	maxLearning: GARDEN_CONFIG.maxLearningDisplay,
	totalMax: GARDEN_CONFIG.maxTilesDisplay,
};

/**
 * Sample tiles intelligently
 *
 * Strategy:
 * 1. Show ALL leeches (critical info - never hide problems)
 * 2. Balanced sample of mastered/learning (visual balance)
 * 3. Shuffle for natural distribution
 *
 * Edge Cases Handled:
 * - Empty/null data → returns empty array
 * - All leeches → shows up to maxLeeches
 * - All mastered → shows up to maxMastered
 * - Malformed tiles → filtered out
 */
export function sampleTiles(
	tiles: MemoryTile[] | null | undefined,
	strategy: SamplingStrategy = DEFAULT_STRATEGY,
): MemoryTile[] {
	// Defensive: Handle null/undefined/empty
	if (!tiles || !Array.isArray(tiles) || tiles.length === 0) {
		return [];
	}

	// Defensive: Filter out malformed tiles
	const validTiles = tiles.filter(
		(tile) =>
			tile &&
			typeof tile === 'object' &&
			typeof tile.vocabId === 'string' &&
			typeof tile.stability === 'number' &&
			typeof tile.lapses === 'number' &&
			!Number.isNaN(tile.stability) &&
			!Number.isNaN(tile.lapses) &&
			tile.stability >= 0 &&
			tile.lapses >= 0,
	);

	if (validTiles.length === 0) {
		return [];
	}

	// Categorize tiles
	const leeches = validTiles.filter((t) => t.isLeech === true);
	const mastered = validTiles.filter((t) => !t.isLeech && t.stability > 21);
	const learning = validTiles.filter((t) => !t.isLeech && t.stability <= 21);

	// Sample strategy: Prioritize leeches, then balanced sample
	const leechSample = leeches.slice(0, Math.min(leeches.length, strategy.maxLeeches));
	const masteredSample = mastered.slice(0, Math.min(mastered.length, strategy.maxMastered));
	const learningSample = learning.slice(0, Math.min(learning.length, strategy.maxLearning));

	// Combine (leeches first for visual priority)
	const sampled = [...leechSample, ...masteredSample, ...learningSample];

	// Shuffle for natural distribution (Fisher-Yates)
	const shuffled = [...sampled];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}

	// Final limit
	return shuffled.slice(0, strategy.totalMax);
}

/**
 * Filter tiles by type
 *
 * Filters tiles based on the selected filter type.
 */
export function filterTiles(tiles: MemoryTile[], filter: GardenFilter): MemoryTile[] {
	if (!tiles || tiles.length === 0) {
		return [];
	}

	switch (filter) {
		case 'leeches':
			return tiles.filter((t) => t.isLeech);
		case 'mastered':
			return tiles.filter((t) => !t.isLeech && t.stability > 21);
		case 'new':
			return tiles.filter((t) => !t.isLeech && t.stability <= 7);
		case 'all':
		default:
			return tiles;
	}
}

/**
 * Calculate grid dimensions for layout
 *
 * Edge Cases:
 * - tileCount = 0 → returns 1 (prevents division by zero)
 * - Negative → returns 1
 */
export function calculateGridSize(tileCount: number): number {
	if (tileCount <= 0) return 1;
	return Math.ceil(Math.sqrt(tileCount));
}
