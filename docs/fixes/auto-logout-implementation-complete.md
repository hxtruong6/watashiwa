# Auto-Logout Implementation - Complete Guide

## Overview

This document describes the complete implementation of automatic logout and redirect when user sessions become invalid. The solution uses a **simplified two-layer approach** for maximum clarity and maintainability.

## Architecture

### Two-Layer Protection

1. **Middleware Layer** (Route Navigation)
   - Catches invalid sessions on route navigation
   - Redirects to login before page loads
   - Enhanced to check for auth errors, not just missing users

2. **Hook Layer** (Client-Side Automatic)
   - `useServerAction()` hook automatically handles "Unauthorized" errors
   - Race condition protection prevents multiple simultaneous redirects
   - Type-safe with `ApiResponse<T>`

## Implementation Details

### 1. Enhanced Middleware (`src/utils/supabase/middleware.ts`)

**Changes:**

- Now checks for `authError` in addition to missing user
- Handles invalid sessions more comprehensively

```typescript
const {
	data: { user },
	error: authError,
} = await supabase.auth.getUser();

const hasInvalidSession = !user || authError;
```

**Protection:**

- Catches invalid sessions on route navigation
- Redirects before page loads
- Preserves returnUrl for better UX

### 2. Enhanced useServerAction Hook

**Purpose:**

- Primary way to call server actions from client components
- Automatically handles "Unauthorized" errors
- Race condition protection prevents multiple simultaneous redirects
- Type-safe with `ApiResponse<T>`

**Features:**

- Automatic logout/redirect on "Unauthorized" errors
- Singleton redirect guard (prevents race conditions)
- Early return guard (prevents redirect loops)
- Proper TypeScript types throughout

**Usage:**

```tsx
const callAction = useServerAction();
const result = await callAction(updateProfileAction, { name: 'John' });
if (result && result.success) {
	// Handle success
}
// Unauthorized is automatically handled - result will be null if redirect happens
```

**Race Condition Protection:**

The hook uses a singleton guard to prevent multiple simultaneous redirects:

```typescript
// Singleton guard (shared across all hook instances)
let isRedirecting = false;

// In hook:
if (isRedirecting || isRedirectingRef.current) {
	console.warn('[Auth] Redirect already in progress, skipping duplicate');
	return null;
}
```

### 3. Core Utilities (Internal)

**For internal use:**

- `handleUnauthorizedError()` - Internal utility used by `useServerAction` hook
  - Note: Exported for edge cases, but primarily for internal use
  - Includes early return guard to prevent redirect loops

## Usage Pattern

### Standard Pattern (Recommended)

**Using the hook - this is the ONLY pattern you need:**

```tsx
import { useServerAction } from '@/modules/core';

function MyComponent() {
	const callAction = useServerAction();

	const handleSubmit = async () => {
		const result = await callAction(updateProfileAction, { name: 'John' });

		// If result is null, redirect is happening (Unauthorized was handled)
		if (!result) {
			return;
		}

		if (result.success) {
			// Handle success
		} else {
			// Handle other errors (Unauthorized is already handled)
			message.error(result.error);
		}
	};
}
```

**Key Points:**

- Always use `useServerAction()` hook for calling server actions
- Check if `result` is `null` (indicates redirect is happening)
- Unauthorized errors are automatically handled - no manual checks needed
- Race condition protection is built-in

## File Structure

```
src/
├── modules/
│   └── core/
│       ├── hooks/
│       │   └── useServerAction.ts        # Primary hook with race condition protection
│       ├── handle-unauthorized.ts        # Internal utility (used by hook)
│       ├── action-client.ts               # Server-side auth check
│       └── index.ts                      # Exports
└── utils/
    └── supabase/
        └── middleware.ts                 # Enhanced middleware
```

## Benefits

### ✅ Simple & Clear

- Single pattern to learn (`useServerAction` hook)
- No context provider needed
- Easier to understand and maintain

### ✅ Automatic Handling

- No manual integration needed
- Consistent behavior across entire app
- Less error-prone

### ✅ Race Condition Protection

- Prevents multiple simultaneous redirects
- Singleton guard ensures only one redirect happens
- Better UX during concurrent failures

### ✅ Comprehensive

- Catches invalid sessions at multiple layers
- Handles route navigation and server actions
- Preserves user context (returnUrl)

### ✅ Type-Safe

- Full TypeScript support with `ApiResponse<T>`
- Proper error handling
- Clear API

## Testing

### Test Scenarios

1. **Invalid Session on Route Navigation**
   - Clear session cookie
   - Navigate to protected route
   - Expected: Redirected to login before page loads

2. **Invalid Session on Server Action**
   - Clear session cookie
   - Call any server action
   - Expected: Automatically logged out and redirected

3. **Invalid Account**
   - Delete user account in Supabase
   - Try to perform action
   - Expected: Automatically logged out and redirected

4. **Session Expired**
   - Wait for session to expire
   - Try to perform action
   - Expected: Automatically logged out and redirected with `sessionExpired=true`

5. **Multiple Concurrent Errors**
   - Trigger multiple server actions simultaneously with invalid session
   - Expected: Only one redirect happens (race condition protection)

## Migration Guide

### For Existing Components

**Before:**

```tsx
const result = await updateProfileAction({ name: 'John' });
if (result.error === 'Unauthorized') {
	message.error('Session expired');
	// User stays on page
}
```

**After:**

```tsx
const callAction = useServerAction();
const result = await callAction(updateProfileAction, { name: 'John' });

// If result is null, redirect is happening
if (!result) {
	return;
}

if (result.success) {
	// Handle success
}
// Unauthorized is automatically handled
```

## Best Practices

1. **Always use `useServerAction()` hook** - This is the standard pattern for all server action calls
2. **Check for null result** - If `result` is `null`, a redirect is happening (Unauthorized was handled)
3. **Trust the middleware** - Route-level protection handles navigation automatically
4. **Let the system handle it** - Don't manually check for "Unauthorized" - the hook handles it automatically
5. **Race condition protection is built-in** - Multiple concurrent errors won't cause multiple redirects

## Troubleshooting

### Issue: Not redirecting on invalid session

**Check:**

1. Are you using `useServerAction()` hook?
2. Is middleware properly configured?
3. Check browser console for errors
4. Verify the error is exactly "Unauthorized" (case-sensitive)

### Issue: Redirect loop

**Check:**

1. Middleware excludes login/auth routes
2. Login page doesn't call protected actions
3. Early return guard in `handleUnauthorizedError` should prevent loops
4. Check if already on `/login` page before redirecting

## Related Documentation

- [Best Practices Analysis](./auto-logout-best-practices-analysis.md)
- [API Contracts](../api/authentication.md)
- [Error Handling Strategy](../product-design/error-handling-strategy.md)
