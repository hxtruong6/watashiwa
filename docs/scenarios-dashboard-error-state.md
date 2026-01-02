# Dashboard Error State Scenarios

This document lists all scenarios where the dashboard navigates to or displays the `DashboardErrorState` component.

## Component Location

- **Component**: `src/modules/dashboard/components/home/DashboardErrorState.tsx`
- **Triggered in**: `src/app/dashboard/page.tsx` (line 38-39)
- **Condition**: When `getDashboardData()` returns `null` or `undefined`

---

## Root Cause Analysis

The `DashboardErrorState` is displayed when `getDashboardData()` returns `null`, which occurs in two scenarios:

1. **Authentication Failure**: `getUser()` returns `null`
2. **Data Fetching Failure**: Any error occurs in the try-catch block

---

## Scenario Categories

### 1. Authentication & Authorization Failures

#### 1.1 Supabase Authentication Service Failure

- **Scenario**: Supabase Auth service is down or unreachable
- **Error Path**: `getUser()` → `supabase.auth.getUser()` fails
- **Result**: `getUser()` returns `null` → `getDashboardData()` returns `null`
- **User Impact**: User cannot authenticate, sees error state

#### 1.2 Invalid or Expired Session

- **Scenario**: User's session token is invalid, expired, or corrupted
- **Error Path**: `getUser()` → `supabase.auth.getUser()` returns error
- **Result**: `getUser()` returns `null` → `getDashboardData()` returns `null`
- **User Impact**: User appears logged out, sees error state

#### 1.3 No Authenticated User

- **Scenario**: User navigates to `/dashboard` without being authenticated
- **Error Path**: `getUser()` → `supabase.auth.getUser()` returns no user
- **Result**: `getUser()` returns `null` → `getDashboardData()` returns `null`
- **User Impact**: Unauthenticated access attempt, sees error state
- **Note**: This should ideally redirect to login, but if it reaches this point, error state is shown

#### 1.4 Network Issues During Auth Check

- **Scenario**: Network timeout or connection failure when calling Supabase Auth
- **Error Path**: `getUser()` → Network error → `getUser()` returns `null`
- **Result**: `getDashboardData()` returns `null`
- **User Impact**: Temporary network issue, sees error state

---

### 2. Database Connection & Infrastructure Failures

#### 2.1 PostgreSQL Database Connection Failure

- **Scenario**: Database server is down, unreachable, or connection pool exhausted
- **Error Path**: Any Prisma query fails → `getDashboardData()` catch block → returns `null`
- **Affected Queries**:
  - `getReviewCount()` → `prisma.userReview.findMany()`
  - `getUserStats()` → `prisma.reviewLog.count()` or `recalculateUserStreak()`
  - `getWeeklyStats()` → `prisma.reviewLog.findMany()`
  - `getDecksWithDue()` → `prisma.deck.findMany()` or `prisma.userReview.count()`
  - `getUserSettings()` → `prisma.user.findUnique()`
  - `prisma.user.findUnique()` for userName
- **User Impact**: Complete data fetch failure, sees error state

#### 2.2 Database Connection Timeout

- **Scenario**: Database queries exceed timeout threshold
- **Error Path**: Prisma query times out → `getDashboardData()` catch block → returns `null`
- **User Impact**: Slow or unresponsive database, sees error state

#### 2.3 Connection Pool Exhaustion

- **Scenario**: Too many concurrent database connections
- **Error Path**: Prisma cannot acquire connection → query fails → `getDashboardData()` returns `null`
- **User Impact**: High load scenario, sees error state

#### 2.4 Database Migration/Schema Mismatch

- **Scenario**: Database schema is out of sync with Prisma schema
- **Error Path**: Prisma query fails due to missing columns/tables → `getDashboardData()` returns `null`
- **User Impact**: Application deployment issue, sees error state

---

### 3. Data Fetching Function Failures

#### 3.1 `getReviewCount()` Failure

- **Scenario**: Error in `StudyData.getDailyStats()` or database query
- **Error Path**: Exception thrown → `getDashboardData()` catch block → returns `null`
- **User Impact**: Cannot fetch review count, entire dashboard fails

#### 3.2 `getUserStats()` Failure

- **Scenario**: Error in `prisma.reviewLog.count()` or `recalculateUserStreak()`
- **Error Path**: Exception thrown → `getDashboardData()` catch block → returns `null`
- **User Impact**: Cannot fetch user statistics, entire dashboard fails

#### 3.3 `getWeeklyStats()` Failure

- **Scenario**: Error in `prisma.reviewLog.findMany()` for weekly aggregation
- **Error Path**: Exception thrown → `getDashboardData()` catch block → returns `null`
- **User Impact**: Cannot fetch weekly stats, entire dashboard fails

#### 3.4 `getDecksWithDue()` Failure

- **Scenario**: Error in `prisma.deck.findMany()` or `prisma.userReview.count()`
- **Error Path**: Exception thrown → `getDashboardData()` catch block → returns `null`
- **User Impact**: Cannot fetch deck data, entire dashboard fails

#### 3.5 `getUserSettings()` Failure

- **Scenario**: Error in `prisma.user.findUnique()` for user settings
- **Error Path**: Exception thrown → `getDashboardData()` catch block → returns `null`
- **User Impact**: Cannot fetch user settings, entire dashboard fails

#### 3.6 User Name Fetch Failure

- **Scenario**: Error in `prisma.user.findUnique()` for userName
- **Error Path**: Exception thrown → `getDashboardData()` catch block → returns `null`
- **User Impact**: Cannot fetch user name, entire dashboard fails

---

### 4. Parallel Promise Failures

#### 4.1 Multiple Concurrent Failures

- **Scenario**: Multiple data fetching functions fail simultaneously
- **Error Path**: `Promise.all()` in `getDashboardData()` → Any promise rejects → catch block → returns `null`
- **User Impact**: Multiple data sources fail, sees error state

#### 4.2 Race Condition in Parallel Execution

- **Scenario**: Race condition or timing issue in `Promise.all()`
- **Error Path**: Unexpected error during parallel execution → `getDashboardData()` returns `null`
- **User Impact**: Unpredictable failure, sees error state

---

### 5. Environment & Configuration Issues

#### 5.1 Missing Environment Variables

- **Scenario**: `DATABASE_URL` or Supabase credentials not configured
- **Error Path**: Prisma/Supabase initialization fails → queries fail → `getDashboardData()` returns `null`
- **User Impact**: Configuration error, sees error state

#### 5.2 Invalid Database Connection String

- **Scenario**: `DATABASE_URL` is malformed or points to wrong database
- **Error Path**: Prisma connection fails → queries fail → `getDashboardData()` returns `null`
- **User Impact**: Configuration error, sees error state

#### 5.3 Supabase Configuration Error

- **Scenario**: Supabase URL or anon key is incorrect
- **Error Path**: `createClient()` fails or returns invalid client → `getUser()` fails → `getDashboardData()` returns `null`
- **User Impact**: Authentication service misconfiguration, sees error state

---

### 6. Data Integrity & Validation Issues

#### 6.1 Corrupted User Data

- **Scenario**: User record in database is corrupted or has invalid data
- **Error Path**: Prisma query succeeds but data is invalid → downstream processing fails → `getDashboardData()` returns `null`
- **User Impact**: Data corruption issue, sees error state

#### 6.2 Missing Required User Record

- **Scenario**: User exists in Supabase Auth but not in Prisma database
- **Error Path**: `getUser()` succeeds but `prisma.user.findUnique()` returns null → potential null reference → `getDashboardData()` may fail
- **User Impact**: User sync issue, sees error state
- **Note**: `syncUser()` is called before `getDashboardData()`, but race conditions could occur

---

### 7. Application-Level Errors

#### 7.1 Unhandled Exception in Business Logic

- **Scenario**: Unexpected error in data transformation or business logic
- **Error Path**: Any unhandled exception in `getDashboardData()` → catch block → returns `null`
- **User Impact**: Application bug, sees error state

#### 7.2 Memory or Resource Exhaustion

- **Scenario**: Server runs out of memory or resources during data fetching
- **Error Path**: Process crashes or throws error → `getDashboardData()` returns `null`
- **User Impact**: Server resource issue, sees error state

---

## Error State Behavior

When `DashboardErrorState` is displayed:

1. **UI Display**: Shows Ant Design `Result` component with:
   - Status: `"warning"`
   - Title: Translated `Dashboard.loadError` message
   - Action: "Retry" button that reloads the page

2. **User Action**: User can click "Retry" button which calls `window.location.reload()`

3. **Recovery**: Page reload will:
   - Re-run `syncUser()`
   - Re-fetch all data via `Promise.all()`
   - Either succeed (show dashboard) or fail again (show error state)

---

## Recommendations for Improvement

**📋 See comprehensive design strategy**: [Error Handling Strategy](../product-design/error-handling-strategy.md)  
**💻 See implementation guide**: [Error Handling Implementation](../product-design/error-handling-implementation.md)

### Quick Summary

1. **Granular Error Handling**: Instead of failing the entire dashboard, consider:
   - Showing partial data when some queries succeed
   - Displaying error messages for specific failed sections
   - Using error boundaries for individual dashboard sections

2. **Better Error Messages**: Provide more specific error messages based on the failure type:
   - "Unable to connect to database" vs "Authentication failed" vs "Data temporarily unavailable"

3. **Retry Logic**: Implement exponential backoff retry logic instead of simple page reload

4. **Fallback Data**: Show cached or default data when possible instead of complete failure

5. **Monitoring**: Add error tracking (Sentry, PostHog) to identify which scenarios occur most frequently

6. **User Redirect**: For authentication failures, redirect to login page instead of showing error state

---

## Related Files

- **Component**: `src/modules/dashboard/components/home/DashboardErrorState.tsx`
- **Page**: `src/app/dashboard/page.tsx`
- **Action**: `src/modules/dashboard/dashboard.actions.ts` → `getDashboardData()`
- **Auth**: `src/modules/auth/auth.actions.ts` → `getUser()`
- **Database**: `src/lib/db.ts` → Prisma client

## Design Documentation

- **Strategy**: `docs/product-design/error-handling-strategy.md` - Comprehensive error handling design principles
- **Implementation**: `docs/product-design/error-handling-implementation.md` - Practical code examples and migration guide
