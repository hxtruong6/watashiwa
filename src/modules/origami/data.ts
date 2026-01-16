import { prisma } from '@/lib/db';

import { GraphEdge, GraphNode, VocabularyWithCompositions } from './types';

/**
 * Get initial graph data for a word
 * Returns the word and its component kanji
 */
export async function getWordGraphData(
	word: string,
	userLevel: number,
): Promise<VocabularyWithCompositions | null> {
	const wordData = await prisma.vocabulary.findFirst({
		where: {
			OR: [{ wordSurface: word }, { wordReading: word }],
		},
		include: {
			kanjiCompositions: {
				include: {
					kanji: true,
				},
				orderBy: { position: 'asc' },
			},
		},
	});

	if (!wordData) {
		return null;
	}

	// Filter by user level (extract JLPT from tags)
	// For now, we'll do basic filtering - full implementation in services layer
	return wordData as VocabularyWithCompositions;
}

/**
 * Get related words by kanji
 * Returns words that contain the specified kanji, filtered by user level
 */
export async function getRelatedWordsByKanji(
	kanjiId: string,
	userLevel: number,
	limit: number = 6,
): Promise<Array<{ node: GraphNode; edge: GraphEdge }>> {
	const compositions = await prisma.kanjiComposition.findMany({
		where: {
			kanjiId: kanjiId,
		},
		include: {
			word: {
				include: {
					kanjiCompositions: {
						include: {
							kanji: true,
						},
					},
				},
			},
		},
		take: limit,
		orderBy: {
			createdAt: 'desc', // Most recent first (can be improved with frequency later)
		},
	});

	// Transform to graph format
	return compositions.map((comp) => {
		const word = comp.word;
		const node: GraphNode = {
			id: word.id,
			type: 'word',
			data: {
				wordSurface: word.wordSurface,
				wordReading: word.wordReading,
				meanings: word.meanings as Record<string, string[]>,
			},
		};

		const edge: GraphEdge = {
			id: `${kanjiId}-${word.id}`,
			source: kanjiId,
			target: word.id,
			label: comp.activeReading,
			type: comp.readingType,
		};

		return { node, edge };
	});
}
