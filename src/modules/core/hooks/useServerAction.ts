/**
 * React hook for calling server actions with automatic "Unauthorized" error handling
 * Automatically logs out and redirects when session is invalid
 *
 * This is the PRIMARY way to call server actions from client components.
 * Features:
 * - Automatic logout/redirect on "Unauthorized" errors
 * - Race condition protection (prevents multiple redirects)
 * - Type-safe with ApiResponse<T>
 */
import { usePathname } from 'next/navigation';
import { useCallback, useRef } from 'react';

import type { ApiResponse } from '../dto';
import { handleUnauthorizedError } from '../handle-unauthorized';

// Singleton redirect guard (shared across all hook instances)
let isRedirecting = false;

/**
 * Hook that wraps server actions with automatic "Unauthorized" error handling
 * Automatically logs out and redirects when session is invalid
 *
 * @returns A function that calls server actions and handles "Unauthorized" errors
 *
 * @example
 * ```tsx
 * const callAction = useServerAction();
 *
 * const handleSubmit = async () => {
 *   const result = await callAction(updateProfileAction, { name: 'John' });
 *   if (result && result.success) {
 *     // Handle success
 *   }
 *   // Unauthorized is automatically handled
 * };
 * ```
 */
export function useServerAction() {
	const pathname = usePathname();
	const isRedirectingRef = useRef(false);

	const callAction = useCallback(
		async <T, TArgs extends unknown[]>(
			action: (...args: TArgs) => Promise<ApiResponse<T>>,
			...args: TArgs
		): Promise<ApiResponse<T> | null> => {
			const result = await action(...args);

			if (!result.success && result.error === 'Unauthorized') {
				// Guard: Prevent multiple simultaneous redirects
				if (isRedirecting || isRedirectingRef.current) {
					console.warn('[Auth] Redirect already in progress, skipping duplicate');
					return null;
				}

				isRedirecting = true;
				isRedirectingRef.current = true;

				try {
					await handleUnauthorizedError(result.error, pathname || undefined);
				} finally {
					// Reset after a delay to allow redirect to complete
					setTimeout(() => {
						isRedirecting = false;
						isRedirectingRef.current = false;
					}, 1000);
				}

				return null; // Indicates redirect is happening
			}

			return result;
		},
		[pathname],
	);

	return callAction;
}
