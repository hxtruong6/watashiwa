import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/lib';
import z from 'zod';

export const GetAdminDecksSchema = z.object({
	page: z.number().optional().default(DEFAULT_PAGE),
	perPage: z.number().optional().default(DEFAULT_PER_PAGE),
	search: z.string().optional(),
	sortField: z.string().optional().default('createdAt'),
	sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const GetAdminDeckVocabulariesSchema = z.object({
	deckId: z.string(),
	page: z.number().optional().default(1),
	limit: z.number().optional().default(20),
	search: z.string().optional(),
	status: z.string().optional(),
});
