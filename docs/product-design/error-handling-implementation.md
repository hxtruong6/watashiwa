# Error Handling Implementation Guide

## Practical Code Examples for Dashboard Error States

**Status**: Implementation Guide  
**Related**: [Error Handling Strategy](./error-handling-strategy.md)

---

## Current State Analysis

### Current Implementation Issues

1. **All-or-Nothing Failure**: If any query fails, entire dashboard fails
2. **Generic Error Message**: "Unable to load dashboard data" - not helpful
3. **No Recovery Options**: Only page reload, loses context
4. **No Partial Data**: Can't show what did load successfully
5. **No Retry Logic**: Simple reload, no backoff or smart retry

### Current Code Flow

```typescript
// src/app/dashboard/page.tsx
const [user, data, leaderboard, forecast] = await Promise.all([
  getUserWithRole(),
  getDashboardData(),  // Returns null on ANY error
  getLeaderboard(),
  getReviewForecast(),
]);

if (!data) {
  return <DashboardErrorState />;  // Complete failure
}
```

---

## Phase 1: Implement Partial Data Loading

### Step 1: Refactor `getDashboardData()` to Return Partial Results

```typescript
// src/modules/dashboard/dashboard.actions.ts

export interface DashboardData {
  reviewCount: number | null;
  stats: UserStats | null;
  weeklyStats: WeeklyStats | null;
  decksWithDue: DeckWithDue[] | null;
  userSettings: UserSettings | null;
  userName: string | null;
}

export interface DashboardDataResult {
  data: DashboardData;
  errors: Array<{
    field: keyof DashboardData;
    error: string;
    retryable: boolean;
  }>;
  hasCriticalFailure: boolean;
}

export async function getDashboardData(): Promise<DashboardDataResult> {
  const user = await getUser();
  if (!user) {
    return {
      data: {
        reviewCount: null,
        stats: null,
        weeklyStats: null,
        decksWithDue: null,
        userSettings: null,
        userName: null,
      },
      errors: [{ field: 'reviewCount', error: 'Authentication required', retryable: false }],
      hasCriticalFailure: true,
    };
  }

  // Use allSettled to get partial results
  const results = await Promise.allSettled([
    { key: 'reviewCount' as const, fn: () => getReviewCount() },
    { key: 'stats' as const, fn: () => getUserStats(user.id) },
    { key: 'weeklyStats' as const, fn: () => getWeeklyStats(user.id) },
    { key: 'decksWithDue' as const, fn: () => getDecksWithDue(user.id) },
    { key: 'userSettings' as const, fn: () => getUserSettings() },
  ]);

  // Fetch userName separately (non-critical)
  let userName: string | null = null;
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true },
    });
    userName = dbUser?.name ?? null;
  } catch (error) {
    console.error('Error fetching userName:', error);
    // Non-critical, continue
  }

  // Process results
  const data: DashboardData = {
    reviewCount: null,
    stats: null,
    weeklyStats: null,
    decksWithDue: null,
    userSettings: null,
    userName,
  };

  const errors: DashboardDataResult['errors'] = [];

  results.forEach((result, index) => {
    const { key } = results[index] as { key: keyof DashboardData; fn: () => Promise<any> };
    
    if (result.status === 'fulfilled') {
      data[key] = result.value;
    } else {
      const error = result.reason;
      errors.push({
        field: key,
        error: error?.message || 'Unknown error',
        retryable: isRetryableError(error),
      });
    }
  });

  // Critical failure if both reviewCount and stats fail (core dashboard data)
  const hasCriticalFailure = !data.reviewCount && !data.stats;

  return { data, errors, hasCriticalFailure };
}

function isRetryableError(error: any): boolean {
  // Network errors, timeouts, and 5xx errors are retryable
  if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') return true;
  if (error?.status >= 500) return true;
  if (error?.message?.includes('timeout')) return true;
  return false;
}
```

### Step 2: Create Section-Specific Error Components

```typescript
// src/modules/dashboard/components/errors/SectionErrorCard.tsx

'use client';

import { Alert, Button, Card, Space } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

interface SectionErrorCardProps {
  title: string;
  message: string;
  retryable: boolean;
  onRetry?: () => void;
  severity?: 'error' | 'warning';
  fallback?: React.ReactNode;
}

export function SectionErrorCard({
  title,
  message,
  retryable,
  onRetry,
  severity = 'warning',
  fallback,
}: SectionErrorCardProps) {
  const t = useTranslations('Common');

  return (
    <Card>
      <Alert
        type={severity}
        message={title}
        description={message}
        action={
          retryable && onRetry ? (
            <Button size="small" onClick={onRetry}>
              {t('retry')}
            </Button>
          ) : null
        }
        showIcon
      />
      {fallback && (
        <div style={{ marginTop: 16 }}>
          {fallback}
        </div>
      )}
    </Card>
  );
}
```

### Step 3: Create Enhanced Error State Component

```typescript
// src/modules/dashboard/components/home/DashboardErrorState.tsx

'use client';

import { Button, Flex, Result, Space, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React from 'react';

const { useToken } = theme;
const { Text, Link } = Typography;

interface DashboardErrorStateProps {
  errorType?: 'auth' | 'network' | 'database' | 'unknown';
  retryable?: boolean;
  onRetry?: () => void;
}

export default function DashboardErrorState({
  errorType = 'unknown',
  retryable = true,
  onRetry,
}: DashboardErrorStateProps) {
  const { token } = useToken();
  const t = useTranslations('Dashboard');
  const tCommon = useTranslations('Common');
  const router = useRouter();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleSignIn = () => {
    router.push(`/login?returnUrl=${encodeURIComponent('/dashboard')}`);
  };

  // Error-specific messaging
  const getErrorContent = () => {
    switch (errorType) {
      case 'auth':
        return {
          title: t('errorAuthTitle', { default: 'Session Expired' }),
          message: t('errorAuthMessage', {
            default: 'Your session has expired. Please sign in again to continue.',
          }),
          primaryAction: {
            label: tCommon('signIn'),
            onClick: handleSignIn,
          },
          secondaryAction: retryable
            ? {
                label: tCommon('retry'),
                onClick: handleRetry,
              }
            : undefined,
        };

      case 'network':
        return {
          title: t('errorNetworkTitle', { default: 'Connection Issue' }),
          message: t('errorNetworkMessage', {
            default:
              "We're having trouble connecting to our servers. This is usually temporary. Please check your internet connection and try again.",
          }),
          primaryAction: {
            label: tCommon('retry'),
            onClick: handleRetry,
          },
          helpLink: {
            label: t('checkStatus', { default: 'Check Service Status' }),
            href: '/status',
          },
        };

      case 'database':
        return {
          title: t('errorDatabaseTitle', { default: 'Service Temporarily Unavailable' }),
          message: t('errorDatabaseMessage', {
            default:
              "We're experiencing technical difficulties. Our team has been notified and is working on it. Please try again in a few moments.",
          }),
          primaryAction: retryable
            ? {
                label: tCommon('retry'),
                onClick: handleRetry,
              }
            : undefined,
          helpLink: {
            label: t('contactSupport', { default: 'Contact Support' }),
            href: '/support',
          },
        };

      default:
        return {
          title: t('loadError'),
          message: t('errorGenericMessage', {
            default: 'Something went wrong while loading your dashboard. Please try again.',
          }),
          primaryAction: retryable
            ? {
                label: tCommon('retry'),
                onClick: handleRetry,
              }
            : undefined,
        };
    }
  };

  const content = getErrorContent();

  return (
    <Flex
      justify="center"
      align="center"
      style={{
        minHeight: '60vh',
        padding: 40,
      }}
    >
      <Result
        status="warning"
        title={content.title}
        subTitle={
          <Space direction="vertical" size="small" style={{ textAlign: 'center' }}>
            <Text type="secondary">{content.message}</Text>
            {content.helpLink && (
              <Link href={content.helpLink.href} target="_blank">
                {content.helpLink.label}
              </Link>
            )}
          </Space>
        }
        extra={
          <Space>
            {content.primaryAction && (
              <Button
                type="primary"
                size="large"
                shape="round"
                onClick={content.primaryAction.onClick}
                style={{ background: token.colorPrimary }}
              >
                {content.primaryAction.label}
              </Button>
            )}
            {content.secondaryAction && (
              <Button size="large" shape="round" onClick={content.secondaryAction.onClick}>
                {content.secondaryAction.label}
              </Button>
            )}
          </Space>
        }
      />
    </Flex>
  );
}
```

### Step 4: Update Dashboard Page to Handle Partial Data

```typescript
// src/app/dashboard/page.tsx

import { syncUser } from '@/modules/auth/auth.actions';
import { getUserWithRole } from '@/modules/auth/auth.actions';
import DashboardOverview from '@/modules/dashboard/components/DashboardOverview';
import DashboardErrorState from '@/modules/dashboard/components/home/DashboardErrorState';
import { getDashboardData } from '@/modules/dashboard/dashboard.actions';
import { getLeaderboard } from '@/modules/leaderboard/leaderboard.actions';
import { getReviewForecast } from '@/modules/study/study.actions';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Dashboard(props: Props) {
  const searchParams = await props.searchParams;

  // Sync user on load
  await syncUser();

  // Fetch data with error handling
  const [user, dashboardResult, leaderboardResult, forecastResult] = await Promise.allSettled([
    getUserWithRole(),
    getDashboardData(),
    getLeaderboard(),
    getReviewForecast(),
  ]);

  // Extract results
  const user = user.status === 'fulfilled' ? user.value : null;
  const dashboardData = dashboardResult.status === 'fulfilled' ? dashboardResult.value : null;
  const leaderboard = leaderboardResult.status === 'fulfilled' ? leaderboardResult.value : null;
  const forecast = forecastResult.status === 'fulfilled' ? forecastResult.value : null;

  // Check for role-based redirect
  if (
    user &&
    (user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR) &&
    !searchParams?.app
  ) {
    redirect('/admin');
  }

  // Determine error type for better messaging
  let errorType: 'auth' | 'network' | 'database' | 'unknown' = 'unknown';
  if (!user) {
    errorType = 'auth';
  } else if (dashboardResult.status === 'rejected') {
    const error = dashboardResult.reason;
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') {
      errorType = 'network';
    } else if (error?.message?.includes('database') || error?.message?.includes('prisma')) {
      errorType = 'database';
    }
  }

  // Show full error state only if critical failure
  if (!dashboardData || dashboardData.hasCriticalFailure) {
    return <DashboardErrorState errorType={errorType} retryable={true} />;
  }

  // Show dashboard with partial data
  return (
    <DashboardOverview
      reviewCount={dashboardData.data.reviewCount}
      stats={dashboardData.data.stats}
      weeklyStats={dashboardData.data.weeklyStats}
      decks={dashboardData.data.decksWithDue}
      userName={dashboardData.data.userName}
      dailyGoal={dashboardData.data.userSettings?.limitReviews ?? 50}
      userRole={user?.role}
      leaderboard={leaderboard}
      userId={user?.id}
      userSettings={dashboardData.data.userSettings}
      forecast={forecast}
      errors={dashboardData.errors}
    />
  );
}
```

### Step 5: Update DashboardOverview to Handle Errors

```typescript
// src/modules/dashboard/components/DashboardOverview.tsx

// Add to props interface
interface DashboardOverviewProps {
  // ... existing props
  errors?: Array<{
    field: string;
    error: string;
    retryable: boolean;
  }>;
}

export default function DashboardOverview({
  // ... existing props
  errors = [],
}: DashboardOverviewProps) {
  // ... existing code

  return (
    <div>
      {/* Show errors for specific sections */}
      {errors.map((error) => {
        if (error.field === 'weeklyStats' && !weeklyStats) {
          return (
            <SectionErrorCard
              key={error.field}
              title="Weekly Stats Unavailable"
              message="We couldn't load your weekly statistics. This doesn't affect your ability to study."
              retryable={error.retryable}
              severity="warning"
            />
          );
        }
        // ... handle other error fields
        return null;
      })}

      {/* Render normal dashboard sections */}
      {/* ... */}
    </div>
  );
}
```

---

## Phase 2: Add Retry with Backoff

### Create Retry Utility

```typescript
// src/lib/utils/retry.ts

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        const delay = Math.min(
          initialDelay * Math.pow(backoffMultiplier, attempt),
          maxDelay
        );

        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
```

### Create Retry Hook

```typescript
// src/hooks/useRetry.ts

'use client';

import { useState, useCallback } from 'react';
import { retryWithBackoff } from '@/lib/utils/retry';

export function useRetry<T>(
  fn: () => Promise<T>,
  options?: Parameters<typeof retryWithBackoff>[1]
) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setIsRetrying(true);
    setError(null);
    setAttempt(0);

    try {
      const result = await retryWithBackoff(fn, {
        ...options,
        onRetry: (attempt, error) => {
          setAttempt(attempt);
          setError(error);
          options?.onRetry?.(attempt, error);
        },
      });
      setIsRetrying(false);
      return result;
    } catch (err) {
      setIsRetrying(false);
      setError(err as Error);
      throw err;
    }
  }, [fn, options]);

  return {
    execute,
    isRetrying,
    attempt,
    error,
  };
}
```

---

## Phase 3: Add Cached Fallback

### Create Cache Utility

```typescript
// src/lib/utils/cache.ts

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export class DataCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export const dataCache = new DataCache();
```

### Update getDashboardData with Cache

```typescript
// Add to dashboard.actions.ts

import { dataCache } from '@/lib/utils/cache';

export async function getDashboardData(useCache = true): Promise<DashboardDataResult> {
  const cacheKey = 'dashboard_data';
  
  // Try cache first
  if (useCache) {
    const cached = dataCache.get<DashboardDataResult>(cacheKey);
    if (cached) {
      return { ...cached, _fromCache: true };
    }
  }

  // ... existing fetch logic ...

  const result = { data, errors, hasCriticalFailure };
  
  // Cache successful results
  if (!result.hasCriticalFailure) {
    dataCache.set(cacheKey, result, 5 * 60 * 1000); // 5 minutes
  }

  return result;
}
```

---

## Phase 4: Add Error Tracking

### Create Error Tracking Utility

```typescript
// src/lib/utils/errorTracking.ts

interface ErrorContext {
  component: string;
  userId?: string;
  userAction?: string;
  errorType: 'auth' | 'network' | 'database' | 'validation' | 'unknown';
  severity: 'critical' | 'major' | 'minor';
  retryable: boolean;
  metadata?: Record<string, any>;
}

export function trackError(error: Error, context: ErrorContext) {
  // Send to error tracking service
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, {
      tags: {
        component: context.component,
        errorType: context.errorType,
        severity: context.severity,
      },
      user: context.userId ? { id: context.userId } : undefined,
      extra: {
        userAction: context.userAction,
        retryable: context.retryable,
        ...context.metadata,
      },
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context.component}] Error:`, error, context);
  }
}
```

### Use in Dashboard

```typescript
// In dashboard.actions.ts

import { trackError } from '@/lib/utils/errorTracking';

export async function getDashboardData(): Promise<DashboardDataResult> {
  try {
    // ... existing code ...
  } catch (error) {
    trackError(error as Error, {
      component: 'getDashboardData',
      errorType: 'database',
      severity: 'critical',
      retryable: true,
    });
    throw error;
  }
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// tests/dashboard/error-handling.test.ts

import { describe, it, expect, vi } from 'vitest';
import { getDashboardData } from '@/modules/dashboard/dashboard.actions';

describe('Dashboard Error Handling', () => {
  it('should return partial data when some queries fail', async () => {
    // Mock: reviewCount succeeds, stats fails
    const result = await getDashboardData();
    
    expect(result.data.reviewCount).toBeDefined();
    expect(result.data.stats).toBeNull();
    expect(result.errors).toHaveLength(1);
    expect(result.hasCriticalFailure).toBe(false);
  });

  it('should mark as critical failure when both reviewCount and stats fail', async () => {
    // Mock: both critical queries fail
    const result = await getDashboardData();
    
    expect(result.hasCriticalFailure).toBe(true);
  });
});
```

### E2E Tests

```typescript
// e2e/dashboard-error-handling.spec.ts

import { test, expect } from '@playwright/test';

test('should show partial data when some sections fail', async ({ page }) => {
  // Mock network: fail only weeklyStats
  await page.route('**/api/dashboard/weekly-stats', (route) => {
    route.fulfill({ status: 500 });
  });

  await page.goto('/dashboard');
  
  // Should show dashboard with error card for weekly stats
  await expect(page.locator('text=Weekly Stats Unavailable')).toBeVisible();
  await expect(page.locator('text=Review Count')).toBeVisible(); // Other sections work
});
```

---

## Migration Checklist

- [ ] Update `getDashboardData()` to use `Promise.allSettled()`
- [ ] Create `DashboardDataResult` interface
- [ ] Build `SectionErrorCard` component
- [ ] Enhance `DashboardErrorState` with error types
- [ ] Update dashboard page to handle partial data
- [ ] Add retry with backoff utility
- [ ] Implement cached fallback
- [ ] Add error tracking
- [ ] Update i18n messages
- [ ] Write unit tests
- [ ] Write E2E tests
- [ ] Update documentation

---

**Next**: Start with Phase 1 and iterate based on user feedback.
