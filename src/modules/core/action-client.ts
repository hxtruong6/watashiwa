/**
 * Executer for Admin-only actions
 */
import { getUserWithRole } from '@/modules/auth/auth.actions';
import { createClient } from '@/utils/supabase/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

import { ApiResponse } from './dto';

/**
 * Base context provided to every localized action
 */
export type ActionContext = {
	userId: string | null;
	// Add other context items here (e.g., role, permissions, traceId)
	role?: string;
};

/**
 * The actual executor to be used INSIDE a Server Action.
 *
 * Usage:
 * export async function updateProfile(rawData: unknown) {
 *   return executeSafeAction(ProfileSchema, rawData, async (data, ctx) => {
 *      // data is strongly typed
 *      // ctx.userId is present if requireAuth is true
 *      return db.update(...)
 *   });
 * }
 */
export async function executeSafeAction<TInput, TOutput>(
	schema: z.Schema<TInput>,
	rawData: unknown,
	handler: (input: TInput, context: ActionContext) => Promise<TOutput>,
	options: { requireAuth?: boolean } = { requireAuth: true },
): Promise<ApiResponse<TOutput>> {
	// Note: The cookies() call in createClient() will handle dynamic rendering.
	try {
		// 1. Auth Check
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (options.requireAuth && !user) {
			return { success: false, error: 'Unauthorized' };
		}

		// 2. Validation
		const validationResult = schema.safeParse(rawData);
		if (!validationResult.success) {
			return {
				success: false,
				error: 'Validation Failed',
				validationErrors: z.treeifyError(validationResult.error).errors,
			};
		}

		// 3. Execution
		const data = await handler(validationResult.data, { userId: user?.id ?? null });

		return {
			success: true,
			data,
		};
	} catch (error) {
		// Enhanced error logging with context
		console.error('SafeAction Error:', {
			error,
			message: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
			schema: schema.description || 'unknown',
			rawDataType: typeof rawData,
		});

		// Distinguish expected errors vs system crashes if needed
		const message = error instanceof Error ? error.message : 'Internal Server Error';

		// Provide more specific error messages for common issues
		let userFriendlyMessage = message;
		if (message.includes('connection') || message.includes('timeout')) {
			userFriendlyMessage =
				'Connection error. Please check your internet connection and try again.';
		} else if (message.includes('cookie') || message.includes('session')) {
			userFriendlyMessage = 'Session expired. Please refresh the page and try again.';
		}

		return {
			success: false,
			error: userFriendlyMessage,
		};
	}
}

export async function executeAdminAction<TInput, TOutput>(
	schema: z.Schema<TInput>,
	rawData: unknown,
	handler: (input: TInput, context: ActionContext) => Promise<TOutput>,
): Promise<ApiResponse<TOutput>> {
	return executeSafeAction(schema, rawData, async (data, ctx) => {
		if (!ctx.userId) throw new Error('Unauthorized');

		const user = await getUserWithRole();

		if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR)) {
			throw new Error('Unauthorized: Admin or Moderator access required');
		}

		return handler(data, { ...ctx, role: user.role });
	});
}
