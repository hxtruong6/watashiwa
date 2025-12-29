/**
 * Learning Map Types
 *
 * Type definitions for the 2D Learning Map visualization.
 * Shows how users learn/remember words over time and how words connect to each other.
 */

/**
 * Represents a word in the learning map with temporal data
 */
export interface LearningMapNode {
	/** Vocabulary ID (unique identifier) */
	id: string;
	/** Kanji surface form (e.g., "学生") */
	wordSurface: string;
	/** Primary meaning */
	meaning: string;
	/** When the word was first learned */
	learnedAt: Date;
	/** Last review date */
	lastReviewAt: Date;
	/** Next review date */
	nextReviewAt: Date;
	/** FSRS stability in days */
	stability: number;
	/** SRS stage: 0=New, 1=Learning, 2=Review, 3=Relearning */
	srsStage: number;
	/** Number of times forgotten */
	lapses: number;
	/** Number of reviews */
	reviewCount: number;
	/** Whether this word is a leech */
	isLeech: boolean;
	/** Kanji roots for connection visualization */
	kanjiRoots: string[];
	/** Deck/Category grouping */
	deckId?: string;
	deckName?: string;
}

/**
 * Represents a connection between words
 */
export interface LearningMapEdge {
	/** Source node ID */
	source: string;
	/** Target node ID */
	target: string;
	/** Type of connection */
	connectionType: 'etymology' | 'temporal' | 'semantic' | 'deck';
	/** Connection strength (0-1) */
	strength: number;
	/** Additional metadata */
	metadata?: {
		sharedRoot?: string;
		learnedDaysApart?: number;
		reviewedTogether?: number;
	};
}

/**
 * Timeline data point for a word
 */
export interface LearningTimelinePoint {
	/** Word ID */
	wordId: string;
	/** Date of this point */
	date: Date;
	/** Stability at this point */
	stability: number;
	/** Review rating (1-4) */
	rating?: number;
	/** Review duration in ms */
	duration?: number;
}

/**
 * Complete learning map data structure
 */
export interface LearningMapData {
	/** Array of word nodes */
	nodes: LearningMapNode[];
	/** Array of connections between nodes */
	edges: LearningMapEdge[];
	/** Timeline data for showing progression */
	timeline: LearningTimelinePoint[];
	/** Total number of nodes */
	totalNodes: number;
	/** Total number of edges */
	totalEdges: number;
	/** Date range */
	dateRange: {
		start: Date;
		end: Date;
	};
}

/**
 * UI Variation Types
 */
export type LearningMapVariant = 'timeline' | 'network' | 'heatmap' | 'radial' | 'tree' | 'chord';

/**
 * Learning Map Component Props
 */
export interface LearningMapProps {
	/** Graph data */
	data: LearningMapData | null;
	/** UI variant to display */
	variant?: LearningMapVariant;
	/** Callback when a node is clicked */
	onNodeClick?: (node: LearningMapNode) => void;
	/** Height of the visualization */
	height?: number;
	/** Show controls */
	showControls?: boolean;
	/** Loading state */
	loading?: boolean;
	/** Time range filter */
	timeRange?: 'all' | 'week' | 'month' | '3months' | 'year';
}
