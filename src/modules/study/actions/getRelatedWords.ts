'use server';

import { executeSafeAction } from '@/modules/core/action-client';
import { z } from 'zod';

import { SemanticRelationshipService } from '../services/semantic-relationship.service';
import type { RelatedWord } from '../types/related-words';

const GetRelatedWordsSchema = z.object({
	vocabId: z.string().uuid(),
});

/**
 * Get semantically related words for a vocabulary item
 * Returns empty array on error or when no relationships found (graceful degradation)
 */
export async function getRelatedWordsAction(input: { vocabId: string }) {
	return executeSafeAction(
		GetRelatedWordsSchema,
		input,
		async ({ vocabId }, { userId }) => {
			if (!userId) {
				// Return empty array instead of error for graceful degradation
				return [];
			}

			try {
				const relatedWords = await SemanticRelationshipService.getRelatedWords(vocabId, userId);
				return relatedWords;
			} catch (error) {
				// Log error but return empty array (graceful degradation)
				console.error('[getRelatedWordsAction] Service error:', error);
				return [];
			}
		},
		{ requireAuth: true },
	);
}
