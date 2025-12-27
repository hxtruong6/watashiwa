/**
 * Memory Garden Types
 *
 * Represents the memory topology data structure for the 3D visualization.
 */

export interface MemoryTile {
	vocabId: string;
	wordSurface: string;
	meaning: string;

	// Memory Metrics
	stability: number; // 0-100+ days (FSRS stability)
	lapses: number; // Number of times forgotten
	srsStage: number; // 0=New, 1=Learning, 2=Review, 3=Relearning

	// Computed Properties
	isLeech: boolean; // lapses >= 3 OR srsStage === 3
	stabilityNormalized: number; // 0.0 to 1.0 (for visualization)
}

export interface MemoryGardenData {
	tiles: MemoryTile[];
	totalCount: number;
	leechCount: number;
	masteredCount: number; // stability > 21 days
	healthScore: number; // 0-100 (computed from leech ratio and stability distribution)
}

export type GardenFilter = 'all' | 'leeches' | 'mastered' | 'new';

export interface MemoryGardenProps {
	data: MemoryGardenData | null;
	onTileClick?: (tile: MemoryTile) => void;
	height?: number;
	showControls?: boolean;
	autoRotate?: boolean;
	/**
	 * Animation mode: 'static' | 'repair' | 'pulse'
	 * - static: Normal view
	 * - repair: Animate holes filling (post-session)
	 * - pulse: Pulse red tiles (intervention blocker)
	 */
	animationMode?: 'static' | 'repair' | 'pulse';
	/**
	 * Optional: IDs of tiles that were just "repaired" (for repair animation)
	 */
	repairedTileIds?: string[];
	/**
	 * Filter to show specific tile types
	 */
	filter?: GardenFilter;
	/**
	 * Show filter controls UI
	 */
	showFilterControls?: boolean;
}
