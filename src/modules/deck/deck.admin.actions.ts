import z from 'zod';

import { executeAdminAction } from '../core/action-client';
import { GetAdminDeckVocabulariesSchema, GetAdminDecksSchema } from './deck.admin.dto';
import * as deckData from './deck.data';

export async function getAdminDecksAction(
	input: z.infer<typeof GetAdminDecksSchema> = {
		page: 0,
		perPage: 0,
		sortField: '',
		sortOrder: 'desc',
	},
) {
	return executeAdminAction(GetAdminDecksSchema, input, async (data, {}) => {
		// Fetch Data
		return await deckData.getAllDecksForAdmin({
			page: data.page,
			perPage: data.perPage,
			search: data.search,
			sortField: data.sortField,
			sortOrder: data.sortOrder,
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

export async function getAdminDeckVocabularies(
	input: z.infer<typeof GetAdminDeckVocabulariesSchema>,
) {
	return executeAdminAction(GetAdminDeckVocabulariesSchema, input, async (data, {}) => {
		return await deckData.getDeckVocabularies(data);
	});
}
