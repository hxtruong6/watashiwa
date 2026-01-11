/**
 * Core module exports
 * Centralized exports for core utilities and hooks
 *
 * Note: This file exports CLIENT-SAFE utilities only.
 * For server-only utilities (executeSafeAction, executeAdminAction),
 * import directly from './action-client' in server components/actions.
 */

// Client-safe exports (can be imported in client components)
export { handleUnauthorizedError } from './handle-unauthorized';
export { useServerAction } from './hooks/useServerAction';
export type { ApiResponse } from './dto';

// Server-only exports (import directly from action-client in server code)
// These are NOT exported here to prevent client components from importing server-only code
// export { executeSafeAction, executeAdminAction } from './action-client';
// export type { ActionContext } from './action-client';
