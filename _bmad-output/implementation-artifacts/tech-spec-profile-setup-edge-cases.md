# Tech-Spec: Profile Setup Edge Cases & Protection

**Created:** 2025-01-01
**Status:** Ready for Development

## Overview

### Problem Statement

The current profile setup page (`src/app/profile/setup/page.tsx`) has several critical edge cases and security gaps:

1. **No Route Protection**: Users who haven't completed setup can still access protected routes (dashboard, study pages) by navigating directly or using the navbar
2. **No Middleware Enforcement**: The middleware doesn't check `setupCompleted` status before allowing access to protected routes
3. **Race Condition**: If a user closes the browser/tab during the save operation, `setupCompleted` might not be persisted
4. **Cache Invalidation**: After saving settings, the cache isn't revalidated, potentially causing stale data
5. **Error Handling**: If `getUserSettings()` fails, the page redirects to login instead of showing a user-friendly error
6. **Browser Navigation**: Users can use browser back button to return to setup page after completing it
7. **No Skip Option**: Users cannot skip the setup (though this may be intentional)

### Solution

Implement comprehensive protection at multiple layers:

1. **Middleware Layer**: Add `setupCompleted` check in middleware to redirect uncompleted users to `/profile/setup`
2. **Page-Level Protection**: Add setup status checks in protected pages (dashboard, study) as a fallback
3. **Navbar Protection**: Prevent navigation to protected routes if setup isn't completed
4. **Cache Revalidation**: Revalidate user settings cache after successful save
5. **Error Handling**: Improve error handling with user-friendly messages and retry options
6. **Optimistic Updates**: Use optimistic updates to prevent race conditions
7. **Browser History**: Use `router.replace()` consistently to prevent back button issues

### Scope (In/Out)

**In Scope:**
- Middleware protection for setup status
- Page-level setup checks in dashboard and study pages
- Navbar navigation protection
- Cache revalidation after setup completion
- Improved error handling in setup page
- Browser history management

**Out of Scope:**
- Skip setup option (intentional requirement)
- Multi-step setup wizard (single step only)
- Setup progress tracking
- Email verification during setup

## Context for Development

### Codebase Patterns

**Architecture:**
- Next.js 16+ App Router
- Vertical Slice Architecture (feature-first organization)
- Server Actions for mutations (`src/modules/*/actions.ts`)
- Server Components for data fetching
- Client Components for interactive UI

**Existing Patterns:**
- Authentication check: `getUser()` from `@/modules/auth/auth.actions`
- Settings fetch: `getUserSettings()` from `@/modules/user/user.actions`
- Settings update: `updateUserSettings()` from `@/modules/user/user.actions`
- Protected route check: `isProtectedRoute()` from `@/modules/ui/components/navbar/NavConfig.tsx`
- Middleware: `src/utils/supabase/middleware.ts` - `updateSession()`
- Cache revalidation: `revalidatePath()` from `next/cache`

**File Structure:**
```
src/
├── app/
│   ├── profile/setup/page.tsx          # Setup page (CLIENT)
│   ├── dashboard/page.tsx              # Dashboard (SERVER)
│   ├── study/page.tsx                  # Study page (SERVER)
│   └── middleware.ts                   # Next.js middleware
├── modules/
│   ├── auth/auth.actions.ts            # getUser()
│   ├── user/user.actions.ts             # getUserSettings(), updateUserSettings()
│   └── ui/components/navbar/
│       ├── NavBar.tsx                  # Main navbar component
│       └── NavConfig.tsx                # isProtectedRoute()
└── utils/supabase/middleware.ts        # updateSession()
```

### Files to Reference

**Primary Files to Modify:**
1. `src/middleware.ts` - Add setup status check
2. `src/app/profile/setup/page.tsx` - Improve error handling, cache revalidation
3. `src/app/dashboard/page.tsx` - Add setup check
4. `src/app/study/page.tsx` - Add setup check
5. `src/modules/ui/components/NavBar.tsx` - Add setup check before navigation

**Files to Reference (Read Only):**
- `src/modules/user/user.actions.ts` - Understand settings structure
- `src/utils/supabase/middleware.ts` - Understand current middleware pattern
- `src/lib/schemas/user.ts` - Understand UserPreferences type
- `src/types/user.ts` - Understand UserPreferences interface

### Technical Decisions

1. **Middleware First**: Primary protection at middleware level for performance and security
2. **Server-Side Checks**: Use server-side checks in pages as fallback (defense in depth)
3. **Client-Side UX**: Client-side checks in navbar for immediate feedback
4. **Cache Strategy**: Revalidate paths after setup completion to ensure fresh data
5. **Error Recovery**: Show retry option instead of redirecting to login on transient errors

## Implementation Plan

### Tasks

#### Task 1: Add Setup Status Check to Middleware
- [ ] Create helper function `hasCompletedSetup(userId: string): Promise<boolean>` in `src/utils/setup-check.ts`
- [ ] Modify `src/middleware.ts` to check setup status for authenticated users
- [ ] Redirect authenticated users without setup to `/profile/setup`
- [ ] Allow access to `/profile/setup` and `/login` routes
- [ ] Preserve `returnUrl` when redirecting to setup

#### Task 2: Improve Setup Page Error Handling
- [ ] Replace redirect-to-login on error with user-friendly error message
- [ ] Add retry button for transient errors
- [ ] Add loading state during save operation
- [ ] Use `revalidatePath('/dashboard')` and `revalidatePath('/profile/setup')` after successful save
- [ ] Add `router.refresh()` after save to ensure fresh data

#### Task 3: Add Setup Check to Dashboard Page
- [ ] Add server-side check for `setupCompleted` in `src/app/dashboard/page.tsx`
- [ ] Redirect to `/profile/setup` if not completed
- [ ] Use `redirect()` from `next/navigation` for server-side redirect

#### Task 4: Add Setup Check to Study Page
- [ ] Add server-side check for `setupCompleted` in `src/app/study/page.tsx`
- [ ] Redirect to `/profile/setup` if not completed
- [ ] Preserve query parameters in redirect URL for return after setup

#### Task 5: Add Setup Check to Navbar
- [ ] Create client-side hook `useSetupStatus()` to check setup completion
- [ ] Modify `handleNavClick` in `NavBar.tsx` to check setup status
- [ ] Show warning message or redirect to setup if user tries to access protected route
- [ ] Disable protected route links if setup not completed (optional UX enhancement)

#### Task 6: Create Setup Check Utility
- [ ] Create `src/utils/setup-check.ts` with reusable functions:
  - `hasCompletedSetup(userId?: string): Promise<boolean>`
  - `requireSetupCompleted(userId?: string): Promise<void>` (throws if not completed)
- [ ] Use `getUserSettings()` internally
- [ ] Handle errors gracefully

### Acceptance Criteria

#### AC 1: Middleware Protection
- **Given** an authenticated user who hasn't completed setup
- **When** they try to access `/dashboard` or `/study`
- **Then** they are redirected to `/profile/setup` with `returnUrl` preserved

#### AC 2: Setup Page Error Handling
- **Given** a user on the setup page
- **When** `getUserSettings()` fails with a network error
- **Then** an error message is shown with a retry button (not redirect to login)

#### AC 3: Setup Page Cache Revalidation
- **Given** a user completes setup
- **When** settings are saved successfully
- **Then** `/dashboard` and `/profile/setup` paths are revalidated
- **And** `router.refresh()` is called to ensure fresh data

#### AC 4: Dashboard Protection
- **Given** an authenticated user who hasn't completed setup
- **When** they access `/dashboard` directly
- **Then** they are redirected to `/profile/setup`

#### AC 5: Study Page Protection
- **Given** an authenticated user who hasn't completed setup
- **When** they access `/study` directly
- **Then** they are redirected to `/profile/setup` with query params preserved

#### AC 6: Navbar Protection
- **Given** an authenticated user who hasn't completed setup
- **When** they click a protected route link in the navbar
- **Then** they are redirected to `/profile/setup` or shown a warning message

#### AC 7: Browser Back Button
- **Given** a user who has completed setup
- **When** they use the browser back button
- **Then** they are redirected to dashboard (setup page checks status on mount)

#### AC 8: Race Condition Prevention
- **Given** a user is saving setup
- **When** they close the browser tab during save
- **Then** the save operation completes in the background (server action)
- **And** on next visit, they are redirected to dashboard

## Additional Context

### Dependencies

**Existing Dependencies (No New Packages):**
- `next/cache` - `revalidatePath()`
- `next/navigation` - `redirect()`, `useRouter()`
- `@/modules/user/user.actions` - `getUserSettings()`
- `@/modules/auth/auth.actions` - `getUser()`

**Database Schema:**
- `User.preferences` (JSONB) contains `{ setupCompleted: boolean }`
- Already exists in schema, no migration needed

### Testing Strategy

**Unit Tests:**
- Test `hasCompletedSetup()` with various user states
- Test middleware redirect logic
- Test setup page error handling

**Integration Tests:**
- Test full flow: new user → setup → dashboard access
- Test middleware redirects
- Test navbar navigation protection

**E2E Tests (Playwright):**
- Test user can't access dashboard without setup
- Test user can complete setup and access dashboard
- Test browser back button behavior
- Test error recovery flow

### Notes

**Performance Considerations:**
- Middleware check adds one DB query per protected route request
- Consider caching setup status in session/JWT if performance becomes an issue
- Current implementation is acceptable for MVP

**Security Considerations:**
- Setup check must be server-side to prevent client-side bypass
- Middleware is the primary protection layer
- Page-level checks are defense in depth

**UX Considerations:**
- Show loading state during setup check
- Provide clear error messages with retry options
- Preserve user's intended destination (`returnUrl`)

**Migration Notes:**
- Existing users without `setupCompleted` flag will be redirected to setup
- This is intentional - ensures all users complete setup
- Can add migration script to backfill `setupCompleted: true` for existing users if needed

---

**Next Steps:**
1. Review this spec with team
2. Implement tasks in order (Task 1 → Task 6)
3. Test each task before moving to next
4. Run E2E tests before merging

