# Study Page Architecture Review & Refactoring Plan

**Date:** 2025-01-XX  
**Reviewer:** Principal Software Architect  
**Component:** `/src/app/study/page.tsx` + Related Components  
**Severity:** Medium-High (Performance, UX, Security)

---

## 1. Clarifying Questions (max 5)

1. **Performance Target:** What is the acceptable Time to Interactive (TTI) for the study page? Current logs suggest excessive re-renders.
2. **Error Tolerance:** Should hydration mismatches from third-party scripts (Sentry) be suppressed or fixed at the source?
3. **Logging Strategy:** Are `xxx001` debug logs intended for production, or should they be gated behind `NODE_ENV === 'development'`?
4. **Sentry Configuration:** Is the 429 rate limiting from Sentry expected, or should we reduce event sampling?
5. **Browser Extension Impact:** Should we add detection/mitigation for browser extensions that modify DOM (causing hydration errors)?

---

## 2. Assumptions (only if needed)

**If questions above are not answered, proceeding with:**

- **Performance:** Target TTI < 2s on 3G connection
- **Error Tolerance:** Fix at source (suppress third-party script hydration warnings, but log for monitoring)
- **Logging:** Debug logs (`xxx001`) should be removed or gated behind dev mode
- **Sentry:** Reduce replay sample rate to prevent 429s (current: 10% session, 100% on error)
- **Browser Extensions:** Add `suppressHydrationWarning` to affected components, but don't block functionality

---

## 3. Constraints & Bottlenecks

### Data Growth Risks

1. **Query Complexity:** Multiple sequential DB queries in `StudyPageContent`:
   - `getDeckIdBySlug()` → `getCourseIdBySlug()` → `getLastStudySession()` → `getDailyProgress()` → `getUserDecksWithStats()`
   - **Risk:** N+1 queries if not properly batched
   - **Impact:** Latency increases linearly with user growth

2. **Session Store Persistence:** Zustand store persists across navigation, causing stale state
   - **Risk:** Memory leaks if sessions are not properly cleaned
   - **Impact:** Degraded performance over time, especially on mobile

### Hot Paths

1. **Study Page Load:** Every study session starts here
   - **Current:** 308 lines of server-side logic with multiple redirects
   - **Bottleneck:** Sequential parameter validation and DB lookups
   - **Impact:** ~200-500ms added latency per request

2. **SessionController Re-renders:** Logs show 10+ re-renders during phase transitions
   - **Bottleneck:** `console.log('xxx001 studyPhase', studyPhase)` on line 883 executes on every render
   - **Impact:** Performance degradation, especially on low-end devices

### Operational Risks

1. **Hydration Mismatch:** Sentry surveys.js script injection causes React hydration errors
   - **Risk:** Poor UX, potential SEO impact, console noise
   - **Impact:** User-facing errors, increased support tickets

2. **Sentry Rate Limiting:** 429 errors from `/monitoring` endpoint
   - **Risk:** Loss of error tracking during high-traffic periods
   - **Impact:** Reduced observability during incidents

3. **Deprecated API Usage:** Ant Design `Drawer` using `height` prop (v6 requires `size`)
   - **Risk:** Breaking change in future Ant Design updates
   - **Impact:** Potential runtime errors after library upgrade

---

## 4. Security Threat Model (OWASP + app-specific)

### Entry Points

1. **URL Parameters:** `deckId`, `deckSlug`, `courseId`, `courseSlug`, `mode`
   - **Current Protection:** UUID validation, slug regex validation
   - **Gap:** No rate limiting on parameter validation redirects

2. **Server Actions:** `fetchSessionAction`, `getDailyProgress`, `getUserDecksWithStats`
   - **Current Protection:** Auth check via `getUser()`
   - **Gap:** No CSRF token validation (Next.js Server Actions have built-in, but verify)

3. **Database Queries:** Direct Prisma queries in page component
   - **Current Protection:** User ID filtering in `OR` clauses
   - **Gap:** No query timeout, potential for slow query attacks

### Abuse Cases

1. **Parameter Enumeration:** Attacker tries UUIDs/slugs to enumerate decks/courses
   - **Mitigation:** ✅ Slug validation regex prevents injection
   - **Gap:** No rate limiting on failed lookups (could be used for reconnaissance)

2. **Session Hijacking:** Stale Zustand store state could expose previous user's session
   - **Mitigation:** ✅ Server-side auth check on every request
   - **Gap:** Client-side store not cleared on logout (memory leak risk)

3. **DoS via Expensive Queries:** Multiple redirects with DB lookups could be chained
   - **Mitigation:** ✅ Query optimization (select only `slug`)
   - **Gap:** No query timeout, no circuit breaker

### Mitigations

1. **Input Validation:** ✅ UUID regex, slug regex (lines 38-54)
2. **Authorization:** ✅ User ID checks in Prisma queries (lines 142, 227)
3. **SQL Injection:** ✅ Prisma ORM prevents SQL injection
4. **XSS:** ✅ No user input rendered directly (all data from DB)
5. **Missing:** Rate limiting on redirect loops, query timeouts, Sentry event throttling

---

## 5. Recommended Architecture

### Pattern: **Modular Monolith (Vertical Slice) - Current Pattern Maintained**

**Rationale:** The current architecture follows Vertical Slice principles correctly. The issues are implementation details, not architectural flaws.

### Components (why each exists)

1. **`StudyPage` (Server Component):**
   - **Purpose:** Route handler, auth guard, parameter normalization
   - **Why:** Thin page rule - delegates to `StudyPageContent`

2. **`StudyPageContent` (Server Component):**
   - **Purpose:** Business logic for routing decisions (session resume, auto-start, dashboard)
   - **Why:** Colocated with route, but **TOO COMPLEX** (308 lines violates SRP)

3. **`SessionController` (Client Component):**
   - **Purpose:** Study session state machine, UI orchestration
   - **Why:** Requires client-side interactivity (keyboard shortcuts, animations)

4. **`StudyDashboard` (Client Component):**
   - **Purpose:** Landing page when no active session
   - **Why:** User needs context before starting study

### Request Flow (step-by-step)

**Current Flow (Problematic):**

```
1. User navigates to /study?deckSlug=minna-no-nihongo-unit-4
2. StudyPage (Suspense boundary) → StudyPageContent
3. StudyPageContent:
   a. await connection() [WAIT]
   b. await getUser() [WAIT]
   c. await hasCompletedSetup() [WAIT]
   d. await searchParams [WAIT]
   e. Normalize params (client-side logic in server component)
   f. await getDeckIdBySlug() [WAIT]
   g. await getDailyProgress() [WAIT]
   h. await hasUserStudiedBefore() [WAIT]
   i. Render SessionController
4. SessionController (client):
   a. useEffect fetches cards
   b. Multiple re-renders during phase transitions
   c. console.log on every render
```

**Recommended Flow (Optimized):**

```
1. User navigates to /study?deckSlug=minna-no-nihongo-unit-4
2. StudyPage (Suspense boundary) → StudyPageContent
3. StudyPageContent (REFACTORED):
   a. Parallel: [getUser(), searchParams] (Promise.all)
   b. Early return if no user (redirect)
   c. Parallel: [hasCompletedSetup(), normalizeParams()] (Promise.all)
   d. Early return if setup incomplete (redirect)
   e. Parallel: [resolveDeckId(), getDailyProgress(), hasUserStudiedBefore()] (Promise.all)
   f. Render SessionController with pre-fetched data
4. SessionController (client):
   a. Use pre-fetched data (no initial fetch)
   b. Memoize phase transitions (useMemo)
   c. Remove debug logs (or gate behind NODE_ENV)
```

---

## 6. Data Model (high-level)

### Entities + Relationships

```
User (1) ──< (N) StudySession
User (1) ──< (N) Deck (authorId)
User (N) >──< (N) Deck (learningDecks via UserDeck)
Deck (1) ──< (N) Card
Course (1) ──< (N) Deck
StudySession (1) ──< (1) Deck (deckId)
```

### Tenancy Strategy

- **Multi-tenant:** User-scoped queries via `authorId` or `UserDeck` join
- **Current Implementation:** ✅ Correct (lines 142, 227 use `OR: [{ isPublic: true }, { authorId: user.id }]`)
- **Gap:** No row-level security (RLS) at DB level (PostgreSQL RLS not configured)

---

## 7. API Surface (high-level)

### Routes/Actions

| Route | Method | AuthZ | Purpose |
|-------|--------|-------|---------|
| `/study` | GET | ✅ User required | Main study page (routing logic) |
| `/study?deckSlug={slug}` | GET | ✅ User + deck access | Start session with specific deck |
| `/study?courseSlug={slug}` | GET | ✅ User + course access | Start session with course |
| `/study?deckId={uuid}` | GET | ✅ User + deck access | Start session (redirects to slug) |
| `/study?courseId={uuid}` | GET | ✅ User + course access | Start session (redirects to slug) |

### AuthZ Rules per Route

1. **`/study` (no params):**
   - ✅ User must be authenticated (`getUser()`)
   - ✅ User must complete setup (`hasCompletedSetup()`)
   - ✅ If last session exists → redirect to last session
   - ✅ If due cards exist → auto-start global session
   - ✅ Otherwise → show dashboard

2. **`/study?deckSlug={slug}`:**
   - ✅ User must be authenticated
   - ✅ Slug format validation (regex)
   - ✅ Deck must exist AND (isPublic OR authorId === user.id)
   - ✅ If not found → redirect to `/study`

3. **`/study?courseSlug={slug}`:**
   - ✅ User must be authenticated
   - ✅ Slug format validation (regex)
   - ✅ Course must exist
   - ✅ If not found → redirect to `/study`

**Gap:** No rate limiting on redirect loops (user could cause infinite redirects)

---

## 8. Performance Plan

### Index Strategy

**Current DB Indexes (Assumed):**

- `Deck.slug` (unique) ✅
- `Deck.authorId` ✅
- `Course.slug` (unique) ✅
- `StudySession.userId` + `StudySession.deckId` ✅

**Missing Indexes (Recommended):**

- `StudySession.userId` + `StudySession.endTime` (for `getLastStudySession()`)
- `UserDeck.userId` + `UserDeck.deckId` (for `getUserDecksWithStats()`)

### Caching (if needed)

**Current:** No caching layer

**Recommended:**

1. **Server-Side:** Cache `getDailyProgress()` for 30s (user-scoped)
2. **Server-Side:** Cache `getUserDecksWithStats()` for 60s (user-scoped)
3. **Client-Side:** Cache resolved deck/course IDs in sessionStorage (5min TTL)

**Rationale:** These queries are expensive and change infrequently during active study sessions.

### Rate Limiting

**Current:** None

**Recommended:**

1. **Per-User:** Max 10 redirects/minute (prevents redirect loops)
2. **Per-IP:** Max 100 requests/minute (prevents enumeration attacks)
3. **Sentry Events:** Reduce `replaysSessionSampleRate` from 0.1 to 0.01 (1% instead of 10%)

---

## 9. Observability Plan

### Logs

**Current Issues:**

- `console.log('xxx001 studyPhase', studyPhase)` on every render (line 883)
- `console.log('[SessionController] Phase transition effect:')` on every phase change (line 370)

**Recommended:**

1. **Remove debug logs** or gate behind `process.env.NODE_ENV === 'development'`
2. **Structured logging:** Use a logging library (e.g., `pino`) with log levels
3. **Log sampling:** Only log phase transitions on errors or first transition

### Metrics

**Recommended Metrics:**

1. **Study Page Load Time:** P50, P95, P99
2. **Redirect Count:** Track redirect loops (alert if > 3 redirects in 10s)
3. **Session Start Success Rate:** % of sessions that start successfully
4. **Hydration Error Rate:** Count of hydration mismatches (alert if > 1% of page loads)

### Alerts

**Critical:**

- Hydration error rate > 5% (indicates Sentry script injection issue)
- Study page P95 latency > 2s (user experience degradation)
- Redirect loop detected (> 3 redirects in 10s)

**Warning:**

- Sentry 429 rate > 10/minute (reduce sampling)
- Session start failure rate > 10%

---

## 10. Trade-offs

### Pros/Cons vs Alternatives

**Current Approach (Server-Side Routing Logic):**

- ✅ **Pros:** SEO-friendly, fast initial render, auth at edge
- ❌ **Cons:** Complex server component (308 lines), sequential DB queries, hard to test

**Alternative 1: Client-Side Routing (SPA-style)**

- ✅ **Pros:** Simpler server component, easier to test
- ❌ **Cons:** Slower initial load, requires client-side auth check, worse SEO

**Alternative 2: API Route + Client Component**

- ✅ **Pros:** Clear separation, easier to test, reusable API
- ❌ **Cons:** Extra network hop, more complex error handling

**Decision: Keep server-side logic, but REFACTOR into smaller functions**

**Rationale:** Maintains SEO and performance benefits while improving maintainability.

---

## 11. Rollout & Migration Plan

### Backward Compatibility

**Breaking Changes:** None (internal refactoring only)

**API Compatibility:**

- ✅ URL parameters unchanged
- ✅ Redirect behavior unchanged
- ✅ Component props unchanged

### Migration Steps

**Phase 1: Fix Critical Issues (Week 1)**

1. Remove `console.log('xxx001')` from `SessionController.tsx:883`
2. Fix Ant Design deprecation: `RelatedWordsSheet.tsx:30` (`height` → `size`)
3. Add `suppressHydrationWarning` to `AntdConfig.tsx` App component
4. Reduce Sentry replay sampling (0.1 → 0.01)

**Phase 2: Performance Optimization (Week 2)**

1. Extract parameter normalization into `normalizeStudyParams()` utility
2. Parallelize DB queries in `StudyPageContent` (Promise.all)
3. Add query timeouts (5s default)
4. Add DB indexes (if missing)

**Phase 3: Refactoring (Week 3)**

1. Extract routing logic into `modules/study/utils/routing.ts`
2. Extract session resolution into `modules/study/utils/session-resolution.ts`
3. Reduce `StudyPageContent` from 308 lines to < 150 lines

**Phase 4: Observability (Week 4)**

1. Add structured logging
2. Add performance metrics
3. Set up alerts

### Rollback Plan

**If issues occur:**

1. **Immediate:** Revert Phase 1 changes (git revert)
2. **If performance degrades:** Revert Phase 2 (remove Promise.all, restore sequential queries)
3. **If bugs introduced:** Revert Phase 3 (restore original `StudyPageContent`)

**Rollback Triggers:**

- Hydration error rate > 10%
- Study page P95 latency > 3s
- Session start failure rate > 20%

---

## 12. Definition of Done

### Security Checklist

- [x] Input validation (UUID, slug regex) ✅
- [x] Authorization checks (user ID, deck access) ✅
- [ ] Rate limiting on redirects (NEW)
- [ ] Query timeouts (NEW)
- [ ] CSRF token validation (verify Next.js Server Actions)
- [ ] Remove debug logs from production (NEW)

### Load/Perf Checklist

- [ ] Study page P95 load time < 2s
- [ ] No hydration errors in production
- [ ] SessionController re-renders < 5 during phase transitions
- [ ] DB queries parallelized (no sequential waits)
- [ ] Sentry 429 errors < 1/minute
- [ ] Memory leaks fixed (Zustand store cleanup)

### Code Quality Checklist

- [ ] `StudyPageContent` < 150 lines (currently 308)
- [ ] No `console.log` in production code
- [ ] All Ant Design deprecation warnings resolved
- [ ] Unit tests for parameter normalization
- [ ] Integration tests for routing logic
- [ ] E2E tests for study session flow

---

## Summary of Critical Issues

1. **🔴 CRITICAL:** Hydration mismatch from Sentry surveys.js (user-facing error)
2. **🟡 HIGH:** Excessive re-renders in SessionController (performance degradation)
3. **🟡 HIGH:** Debug logs in production (`xxx001` spam)
4. **🟡 HIGH:** Sentry rate limiting (429 errors)
5. **🟢 MEDIUM:** Ant Design deprecation warning (`height` → `size`)
6. **🟢 MEDIUM:** Complex server component (308 lines, violates SRP)

**Recommended Priority:**

1. Fix hydration issue (suppress warning + investigate Sentry config)
2. Remove debug logs
3. Fix Ant Design deprecation
4. Reduce Sentry sampling
5. Refactor server component (performance optimization)

---

**End of Review**
