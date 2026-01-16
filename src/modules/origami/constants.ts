// Maximum number of nodes to render simultaneously
export const MAX_NODES = 50;

// Default number of related words to show when expanding a kanji node
export const DEFAULT_EXPANSION_LIMIT = 6;

// Maximum expansion depth (to prevent performance issues)
export const MAX_EXPANSION_DEPTH = 3;

// Default JLPT level (N5 = beginner)
export const DEFAULT_JLPT_LEVEL = 5;

// JLPT level mapping (for tag extraction)
export const JLPT_LEVEL_MAP: Record<string, number> = {
	n5: 5,
	n4: 4,
	n3: 3,
	n2: 2,
	n1: 1,
};
