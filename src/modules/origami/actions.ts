'use server';

import { prisma } from '@/lib/db';
import { executeSafeAction } from '@/modules/core/action-client';
import { z } from 'zod';

import { DEFAULT_JLPT_LEVEL } from './constants';
import { getRelatedWordsByKanji, getWordGraphData } from './data';
import { buildInitialGraph } from './services';
import { GraphData } from './types';

// Input validation schemas
const GetInitialGraphSchema = z.object({
	word: z.string().min(1, 'Word is required'),
});

const ExpandKanjiNodeSchema = z.object({
	kanjiId: z.string().uuid('kanjiId must be a valid UUID'),
});

/**
 * Get initial graph data for a word
 * Server Action that fetches word and its kanji components
 */
export async function getInitialGraph(input: { word: string }) {
	return executeSafeAction(
		GetInitialGraphSchema,
		input,
		async ({ word }, { userId }) => {
			// Get user's JLPT level from preferences or default to N5
			let userLevel = DEFAULT_JLPT_LEVEL;

			if (userId) {
				const user = await prisma.user.findUnique({
					where: { id: userId },
					select: { preferences: true },
				});

				// Extract JLPT level from preferences if available
				// For now, default to N5 - can be enhanced later
				if (user?.preferences && typeof user.preferences === 'object') {
					const prefs = user.preferences as Record<string, unknown>;
					if (typeof prefs.currentJlptLevel === 'number') {
						userLevel = prefs.currentJlptLevel;
					}
				}
			}

			// Fetch word data
			const wordData = await getWordGraphData(word, userLevel);

			if (!wordData) {
				return { success: false, error: 'Word not found' };
			}

			// Build graph structure
			const graphData = buildInitialGraph(wordData, userLevel);

			return graphData;
		},
		{ requireAuth: false }, // Allow unauthenticated access for now
	);
}

/**
 * Expand a kanji node to show related words
 * Server Action that fetches words containing the specified kanji
 */
export async function expandKanjiNode(input: { kanjiId: string }) {
	return executeSafeAction(
		ExpandKanjiNodeSchema,
		input,
		async ({ kanjiId }, { userId }) => {
			// Get user's JLPT level
			let userLevel = DEFAULT_JLPT_LEVEL;

			if (userId) {
				const user = await prisma.user.findUnique({
					where: { id: userId },
					select: { preferences: true },
				});

				if (user?.preferences && typeof user.preferences === 'object') {
					const prefs = user.preferences as Record<string, unknown>;
					if (typeof prefs.currentJlptLevel === 'number') {
						userLevel = prefs.currentJlptLevel;
					}
				}
			}

			// Fetch related words
			const relatedWords = await getRelatedWordsByKanji(kanjiId, userLevel);

			return {
				nodes: relatedWords.map((r) => r.node),
				edges: relatedWords.map((r) => r.edge),
			} as GraphData;
		},
		{ requireAuth: false }, // Allow unauthenticated access for now
	);
}
