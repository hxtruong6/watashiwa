'use server';
import { executeSafeAction } from '@/modules/core/action-client';
import { z } from 'zod';

import { buildMockKnowledgeGraph } from './services';

const KnowledgeGraphQuerySchema = z.object({
	centerVocabId: z.string().optional(),
	limit: z.number().int().min(1).max(50).optional(),
});

export async function getKnowledgeGraphAction(input: unknown) {
	return executeSafeAction(
		KnowledgeGraphQuerySchema,
		input,
		async ({ limit }) => buildMockKnowledgeGraph({ limit }),
		{ requireAuth: true },
	);
}
