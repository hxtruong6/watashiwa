// ReadingType enum - will be available from @prisma/client after running prisma generate
// For now, define it locally until migration is run and client is generated
export type ReadingType = 'ONYOMI' | 'KUNYOMI' | 'IRREGULAR';

// Node types in the graph
export type NodeType = 'word' | 'kanji';

// Graph node structure
export interface GraphNode {
	id: string;
	type: NodeType;
	data: {
		// Word node data
		wordSurface?: string;
		wordReading?: string;
		meanings?: Record<string, string[]>;
		// Kanji node data
		character?: string;
		meaningVi?: string | null;
		meaningEn?: string | null;
		hanViet?: string | null;
		onyomiReadings?: string[];
		kunyomiReadings?: string[];
		jlptLevel?: number | null;
		strokeCount?: number;
	};
	position?: { x: number; y: number };
}

// Graph edge structure
export interface GraphEdge {
	id: string;
	source: string;
	target: string;
	label: string; // Active reading (e.g., "SEI", "iki")
	type: ReadingType;
}

// Graph data structure
export interface GraphData {
	nodes: GraphNode[];
	edges: GraphEdge[];
}

// Vocabulary with kanji compositions (for data layer)
export type VocabularyWithCompositions = {
	id: string;
	wordSurface: string;
	wordReading: string;
	meanings: unknown;
	tags: string[];
	kanjiCompositions: Array<{
		id: string;
		position: number;
		activeReading: string;
		readingType: ReadingType;
		kanji: {
			id: string;
			character: string;
			meaningVi: string | null;
			meaningEn: string | null;
			hanViet: string | null;
			onyomiReadings: string[];
			kunyomiReadings: string[];
			jlptLevel: number | null;
			strokeCount: number;
		};
	}>;
};
