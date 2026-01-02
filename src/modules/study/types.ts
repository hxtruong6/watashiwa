/**
 * Relationship types for semantic sequencing
 */
export interface WordRelationship {
	vocabId1: string;
	vocabId2: string;
	type: 'ETYMOLOGY' | 'CONFUSION' | 'DECK_CONTEXT';
	strength: number; // 0-1, higher = stronger relationship
	metadata?: {
		sharedKanji?: string[];
		confusionType?: string;
		deckId?: string;
	};
}

/**
 * Relationship map: vocabId -> related vocabIds with relationship info
 */
export type RelationshipMap = Map<string, WordRelationship[]>;

/**
 * Performance metrics for semantic sequencing
 */
export interface SemanticSequencingMetrics {
	startTime: number;
	endTime: number;
	elapsedMs: number;
	relationshipQueryTime: number;
	reorderingTime: number;
	cacheHit: boolean;
	queueSize: number;
	relationshipsFound: number;
	cacheType?: 'redis' | 'memory'; // Cache type used (if cache hit)
}

/**
 * Options for semantic sequencing
 */
export interface SemanticSequencingOptions {
	userId: string;
	enableCaching?: boolean;
	timeoutMs?: number; // Default: 2000ms
	performanceThresholdMs?: number; // Default: 500ms
}
