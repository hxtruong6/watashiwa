import { DEFAULT_JLPT_LEVEL, JLPT_LEVEL_MAP } from './constants';
import { GraphData, GraphEdge, GraphNode, VocabularyWithCompositions } from './types';

/**
 * Extract JLPT level from tags array
 * Returns numeric level (5 = N5, 4 = N4, etc.) or null if not found
 */
export function extractJlptLevel(tags: string[]): number | null {
	for (const tag of tags) {
		const normalizedTag = tag.toLowerCase();
		if (normalizedTag in JLPT_LEVEL_MAP) {
			return JLPT_LEVEL_MAP[normalizedTag];
		}
	}
	return null;
}

/**
 * Check if vocabulary item should be shown based on user level
 * User sees words at their level and below (e.g., N4 user sees N4 and N5)
 */
export function shouldShowWord(tags: string[], userLevel: number): boolean {
	const wordLevel = extractJlptLevel(tags);
	if (wordLevel === null) {
		// If no JLPT level, show it (for now - can be refined later)
		return true;
	}
	// User level is numeric (5 = N5, 4 = N4, etc.)
	// Show words at user level or easier (higher number = easier)
	return wordLevel >= userLevel;
}

/**
 * Build initial graph from word data
 * Creates center node (word) and child nodes (kanji)
 */
export function buildInitialGraph(
	wordData: VocabularyWithCompositions,
	userLevel: number,
): GraphData {
	const nodes: GraphNode[] = [];
	const edges: GraphEdge[] = [];

	// Create center node (word)
	const wordNode: GraphNode = {
		id: wordData.id,
		type: 'word',
		data: {
			wordSurface: wordData.wordSurface,
			wordReading: wordData.wordReading,
			meanings: wordData.meanings as Record<string, string[]>,
		},
		position: { x: 0, y: 0 }, // Center position
	};
	nodes.push(wordNode);

	// Create kanji nodes and edges
	for (const comp of wordData.kanjiCompositions) {
		// Filter kanji by user level if it has JLPT info
		// For now, we'll include all kanji - filtering can be added later if needed

		const kanjiNode: GraphNode = {
			id: comp.kanji.id,
			type: 'kanji',
			data: {
				character: comp.kanji.character,
				meaningVi: comp.kanji.meaningVi,
				meaningEn: comp.kanji.meaningEn,
				hanViet: comp.kanji.hanViet,
				onyomiReadings: comp.kanji.onyomiReadings,
				kunyomiReadings: comp.kanji.kunyomiReadings,
				jlptLevel: comp.kanji.jlptLevel,
				strokeCount: comp.kanji.strokeCount,
			},
		};
		nodes.push(kanjiNode);

		const edge: GraphEdge = {
			id: `${wordData.id}-${comp.kanji.id}`,
			source: wordData.id,
			target: comp.kanji.id,
			label: comp.activeReading,
			type: comp.readingType,
		};
		edges.push(edge);
	}

	return { nodes, edges };
}
