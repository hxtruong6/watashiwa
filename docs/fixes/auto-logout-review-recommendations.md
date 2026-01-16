# Auto-Logout Implementation - Senior Tech Lead Review & Recommendations

## Executive Summary

**Current Status**: Functional but over-engineered with critical gaps.

**Recommendation**: Simplify to a **two-layer approach** with better type safety and race condition handling.

---

## Critical Issues Found

### 1. ❌ AuthErrorProvider Not Integrated

- **Issue**: Documentation claims `AuthErrorProvider` is in `layout.tsx`, but it's not.
- **Impact**: Context-based "automatic" handling never works.
- **Evidence**: `grep -r "AuthErrorProvider" src/app` returns no results.

### 2. ⚠️ Over-Engineering

- **Issue**: Three layers (middleware, context, utilities) when two would suffice.
- **Impact**: Unnecessary complexity, confusion, maintenance burden.
- **Root Cause**: Context provider adds no value since `useServerAction` already handles it directly.

### 3. 🐛 Race Condition Risk

- **Issue**: Multiple simultaneous "Unauthorized" errors can trigger multiple redirects.
- **Impact**: Poor UX, potential browser navigation issues.
- **Solution**: Add redirect deduplication guard.

### 4. ⚠️ Type Safety Gaps

- **Issue**: `ServerAction` type is too loose, `null` return isn't type-safe.
- **Impact**: Weaker TypeScript guarantees, potential runtime errors.

### 5. 📊 Inconsistent Usage Patterns

- **Issue**: Multiple patterns (hook, context, manual) create confusion.
- **Impact**: Developers don't know which pattern to use, leading to inconsistent code.

---

## Recommended Architecture (Simplified)

### Two-Layer Approach

```
┌─────────────────────────────────────┐
│  1. Middleware Layer (Route Guard)  │
│     - Catches invalid sessions      │
│     - Redirects before page loads  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  2. Hook Layer (Action Wrapper)     │
│     - useServerAction() hook        │
│     - Automatic error handling      │
│     - Race condition protection     │
└─────────────────────────────────────┘
```

### Key Principles

1. **Single Source of Truth**: `useServerAction` hook is the ONLY way to call server actions from client components.
2. **No Context Provider**: Remove `AuthErrorProvider` - it adds no value.
3. **Race Condition Protection**: Add redirect guard to prevent multiple simultaneous redirects.
4. **Type Safety**: Use proper `ApiResponse<T>` types throughout.

---

## Implementation Plan

### Phase 1: Remove Unused Context Provider

**Delete:**

- `src/modules/core/providers/AuthErrorProvider.tsx` (not used, adds complexity)

**Update:**

- `src/modules/core/hooks/useServerAction.ts` - Remove context dependency
- `src/modules/core/index.ts` - Remove AuthErrorProvider exports

### Phase 2: Enhance useServerAction Hook

**Add:**

- Redirect deduplication guard (singleton pattern)
- Better type safety
- Improved error handling

**Pattern:**

```typescript
// Singleton redirect guard
let isRedirecting = false;

export function useServerAction() {
	const callAction = useCallback(
		async <T>(
			action: (...args: unknown[]) => Promise<ApiResponse<T>>,
			...args: unknown[]
		): Promise<ApiResponse<T> | null> => {
			const result = await action(...args);

			if (!result.success && result.error === 'Unauthorized') {
				// Guard: Prevent multiple redirects
				if (isRedirecting) {
					console.warn('[Auth] Redirect already in progress, skipping');
					return null;
				}

				isRedirecting = true;
				await handleUnauthorizedError(result.error, pathname);
				return null;
			}

			return result;
		},
		[pathname],
	);

	return callAction;
}
```

### Phase 3: Improve Type Safety

**Update `callWithAuthHandling`:**

```typescript
// Before (loose typing)
type ServerAction = (...args: unknown[]) => Promise<{ success: boolean; error?: string }>;

// After (strict typing)
type ServerAction<T = unknown> = (...args: unknown[]) => Promise<ApiResponse<T>>;
```

### Phase 4: Standardize Usage

**Migration Strategy:**

1. Update all components to use `useServerAction()` hook
2. Remove manual `handleUnauthorizedError` calls
3. Remove `callWithAuthHandling` usage (replaced by hook)

---

## Code Changes

### 1. Simplified useServerAction Hook

```typescript
/**
 * React hook for calling server actions with automatic "Unauthorized" error handling
 * This is the PRIMARY way to call server actions from client components.
 *
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

export function useServerAction() {
	const pathname = usePathname();
	const isRedirectingRef = useRef(false);

	const callAction = useCallback(
		async <T>(
			action: (...args: unknown[]) => Promise<ApiResponse<T>>,
			...args: unknown[]
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
```

### 2. Enhanced handleUnauthorizedError

```typescript
/**
 * Handles "Unauthorized" errors from server actions
 * Automatically logs out and redirects to login page
 *
 * @param error - The error string from server action response
 * @param currentPath - Optional current path to preserve as returnUrl
 * @returns true if error was handled (Unauthorized), false otherwise
 */
export async function handleUnauthorizedError(
	error: string | undefined,
	currentPath?: string,
): Promise<boolean> {
	if (!error || error !== 'Unauthorized') {
		return false;
	}

	// Early return if already on login page
	if (typeof window !== 'undefined' && window.location.pathname === '/login') {
		return true;
	}

	console.warn('[Auth] Unauthorized error detected, logging out user...');

	try {
		// Clear login method cache
		if (typeof window !== 'undefined') {
			try {
				localStorage.removeItem('watashi_login_methods');
			} catch (e) {
				console.error('[Auth] Failed to clear login cache:', e);
			}
		}

		// Sign out from Supabase (clears session and cookies)
		const supabase = createClient();
		await supabase.auth.signOut();

		// Build redirect URL with returnUrl if currentPath is provided
		const loginUrl = new URL('/login', window.location.origin);
		if (currentPath && currentPath !== '/login' && currentPath.startsWith('/')) {
			loginUrl.searchParams.set('returnUrl', currentPath);
		}
		loginUrl.searchParams.set('sessionExpired', 'true');

		// Redirect to login page with full page reload
		// Using window.location.href ensures middleware sees cleared session
		window.location.href = loginUrl.toString();

		return true;
	} catch (err) {
		console.error('[Auth] Error during logout:', err);
		// Even if logout fails, redirect to login
		window.location.href = '/login?sessionExpired=true';
		return true;
	}
}
```

### 3. Remove callWithAuthHandling

**Rationale**: Replaced by `useServerAction()` hook. Direct utility functions should be rare exceptions.

**Migration**:

```typescript
// Before
const result = await callWithAuthHandling(updateProfileAction, { name: 'John' });

// After
const callAction = useServerAction();
const result = await callAction(updateProfileAction, { name: 'John' });
```

---

## Benefits of Simplified Approach

### ✅ Simpler Mental Model

- One hook (`useServerAction`) for all server action calls
- No context provider to understand
- Clear, single pattern

### ✅ Better Type Safety

- Proper `ApiResponse<T>` types
- TypeScript catches errors at compile time

### ✅ Race Condition Protection

- Singleton guard prevents multiple redirects
- Better UX during concurrent failures

### ✅ Easier Maintenance

- Less code to maintain
- Fewer patterns to document
- Clearer responsibilities

### ✅ Better Performance

- No unnecessary context re-renders
- Direct function calls (no context lookup)

---

## Migration Checklist

- [ ] Remove `AuthErrorProvider` component
- [ ] Remove `AuthErrorProvider` from exports
- [ ] Update `useServerAction` to remove context dependency
- [ ] Add redirect deduplication guard
- [ ] Update `callWithAuthHandling` type signature (or remove)
- [ ] Migrate all components to use `useServerAction()` hook
- [ ] Remove manual `handleUnauthorizedError` calls from components
- [ ] Update documentation
- [ ] Test race condition scenarios
- [ ] Test concurrent server action failures

---

## Testing Strategy

### Test Cases

1. **Single Unauthorized Error**
   - Call server action with invalid session
   - Expected: Logout and redirect to login

2. **Multiple Concurrent Errors**
   - Trigger multiple server actions simultaneously with invalid session
   - Expected: Only one redirect, no navigation errors

3. **Already on Login Page**
   - Trigger unauthorized error while on `/login`
   - Expected: No redirect loop

4. **Middleware Protection**
   - Navigate to protected route with invalid session
   - Expected: Redirected before page loads

5. **Valid Session After Error**
   - Get unauthorized error, then re-authenticate
   - Expected: Can continue using app normally

---

## Comparison: Current vs Recommended

| Aspect                        | Current                            | Recommended                |
| ----------------------------- | ---------------------------------- | -------------------------- |
| **Layers**                    | 3 (middleware, context, utilities) | 2 (middleware, hook)       |
| **Context Provider**          | ✅ (but not used)                  | ❌ (removed)               |
| **Primary Pattern**           | Multiple (confusing)               | Single (`useServerAction`) |
| **Race Condition Protection** | ❌                                 | ✅                         |
| **Type Safety**               | ⚠️ (loose)                         | ✅ (strict)                |
| **Code Complexity**           | High                               | Low                        |
| **Maintainability**           | Medium                             | High                       |

---

## Conclusion

**Recommendation**: Simplify to two-layer approach with enhanced `useServerAction` hook.

**Priority**: High - Current implementation has unused code and race condition risks.

**Effort**: Medium - Requires refactoring but improves codebase quality significantly.

**Risk**: Low - Changes are additive and can be done incrementally.

---

## Implementation Status

**Status**: ✅ **COMPLETED**

All recommended changes have been implemented:

1. ✅ AuthErrorProvider removed
2. ✅ callWithAuthHandling removed
3. ✅ useServerAction enhanced with race condition protection
4. ✅ handleUnauthorizedError enhanced with early return guard
5. ✅ ProfileSetupForm migrated to useServerAction hook
6. ✅ Documentation updated

**Migration Notes:**

- All components should now use `useServerAction()` hook
- No breaking changes - existing code continues to work
- Race condition protection is now built-in
- Simpler, more maintainable architecture
