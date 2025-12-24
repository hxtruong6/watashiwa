import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/lib';
import z from 'zod';

export const GetAdminDecksSchema = z.object({
	page: z.number().optional().default(DEFAULT_PAGE),
	perPage: z.number().optional().default(DEFAULT_PER_PAGE),
	search: z.string().optional(),
});
