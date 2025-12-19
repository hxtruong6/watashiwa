import { z } from 'zod';

/**
 * Standard API Response Wrapper
 */
export type ApiResponse<T = void> = {
	success: boolean;
	data?: T;
	error?: string;
	validationErrors?: Record<string, string[]>;
};

/**
 * Common Zod Schemas
 */
export const PaginationSchema = z.object({
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(20),
});

export const IdSchema = z.uuid();
