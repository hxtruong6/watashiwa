import z from 'zod';

import { executeAdminAction } from '../core/action-client';
import { GetAdminDecksSchema } from './deck.admin.dto';
import * as deckData from './deck.data';

export async function getAdminDecksAction(
	input: z.infer<typeof GetAdminDecksSchema> = {
		page: 0,
		perPage: 0,
	},
) {
	return executeAdminAction(GetAdminDecksSchema, input, async (data, {}) => {
		// Fetch Data
		return await deckData.getAllDecksForAdmin({
			page: data.page,
			perPage: data.perPage,
			search: data.search,
		});
	});
}

const GetAdminDeckDetailSchema = z.object({
	id: z.string(),
});

export async function getAdminDeckDetail(input: z.infer<typeof GetAdminDeckDetailSchema>) {
	return executeAdminAction(GetAdminDeckDetailSchema, input, async (data, {}) => {
		// Fetch Data
		return await deckData.getDeckDetailForAdmin(data.id);
	});
}
const GetAdminDeckVocabulariesSchema = z.object({
	deckId: z.string(),
	page: z.number().optional().default(1),
	limit: z.number().optional().default(20),
	search: z.string().optional(),
	status: z.string().optional(),
});

export async function getAdminDeckVocabularies(
	input: z.infer<typeof GetAdminDeckVocabulariesSchema>,
) {
	return executeAdminAction(GetAdminDeckVocabulariesSchema, input, async (data, {}) => {
		return await deckData.getDeckVocabularies(data);
	});
}
