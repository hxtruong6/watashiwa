import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

import { ApiResponse } from './dto';

/**
 * Base context provided to every localized action
 */
export type ActionContext = {
	userId: string | null;
	// Add other context items here (e.g., role, permissions, traceId)
};

/**
 * Higher-Order Function to create a "Safe Action"
 * Wraps a handler with:
 * 1. Auth Check (Optional)
 * 2. Zod Validation
 * 3. Error Handling
 */
export async function createSafeAction<TInput, TOutput>(
	schema: z.Schema<TInput>,
	handler: (input: TInput, context: ActionContext) => Promise<TOutput>,
	options: { requireAuth?: boolean } = { requireAuth: true },
): Promise<ApiResponse<TOutput>> {
	// 1. Authentication (Lazy load Supabase)
	const supabase = await createClient(); // Avoids 'await' at top level if module imported
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (options.requireAuth) {
		if (authError || !user) {
			return {
				success: false,
				error: 'Unauthorized',
			};
		}
	}

	// 2. Input Validation (Manual)
	// Note: We expect the caller to pass the RAW input, so we validate it here.
	// However, in Next.js Server Actions, usually the arguments are passed directly.
	// Ideally, this function accepts a factory that returns the actual Server Action.
	// But for simplicity in this V2 refactor, we will use this as a util inside the Action.
	// Wait... standard pattern is: export const myAction = createSafeAction(schema, async (data, ctx) => { ... })
	// See implementation below.

	// We can't easily wrap the 'export' directly in a way that Next.js recognizes as a Server Action entry point
	// unless we use a library like `next-safe-action`.
	// For manual implementation without libs, we usually do:
	// export async function myAction(input: InputType): Promise<ApiResponse<OutputType>> {
	//   return executeSafeAction(schema, input, async (parsed, ctx) => { ... })
	// }

	return { success: false, error: 'Abstract implementation - use executeSafeAction instead' };
}

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
		console.error('SafeAction Error:', error);
		// Distinguish expected errors vs system crashes if needed
		const message = error instanceof Error ? error.message : 'Internal Server Error';
		return {
			success: false,
			error: message,
		};
	}
}
