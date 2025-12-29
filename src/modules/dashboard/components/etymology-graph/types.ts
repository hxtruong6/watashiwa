/**
 * Etymology Graph Types
 *
 * Type definitions for the Etymology Constellation knowledge graph visualization.
 * Shows semantic connections between learned words via shared kanji roots (Hán Việt).
 */

/**
 * Represents a word node in the graph
 */
export interface EtymologyGraphNode {
	/** Vocabulary ID (unique identifier) */
	id: string;
	/** Kanji surface form (e.g., "学生") */
	wordSurface: string;
	/** Primary meaning (first meaning from meanings array) */
	meaning: string;
	/** FSRS stability in days */
	stability: number;
	/** SRS stage: 0=New, 1=Learning, 2=Review, 3=Relearning */
	srsStage: number;
	/** Number of times forgotten */
	lapses: number;
	/** Kanji roots extracted from etymology.parts */
	kanjiRoots: string[];
	/** Whether this word is a leech (lapses >= 3) */
	isLeech: boolean;
}

/**
 * Represents a connection between two words
 */
export interface EtymologyGraphEdge {
	/** Source node ID (vocabId) */
	source: string;
	/** Target node ID (vocabId) */
	target: string;
	/** The shared kanji root that connects them (e.g., "学") */
	sharedRoot: string;
}

/**
 * Complete graph data structure
 */
export interface EtymologyGraphData {
	/** Array of word nodes */
	nodes: EtymologyGraphNode[];
	/** Array of connections between nodes */
	edges: EtymologyGraphEdge[];
	/** Total number of nodes */
	totalNodes: number;
	/** Total number of edges */
	totalEdges: number;
}

