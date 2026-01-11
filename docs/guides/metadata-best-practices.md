# Metadata Best Practices for Next.js 16+

## Problem: crypto.randomUUID() Error

### Root Cause

When using `generateMetadata()` functions in Next.js 16+ with Sentry instrumentation, you may encounter this error:

```
Error: Route "/about" used `crypto.randomUUID()` before accessing either uncached data 
(e.g. `fetch()`) or Request data (e.g. `cookies()`, `headers()`, `connection()`, and `searchParams`).
```

**Why this happens:**

1. Sentry instrumentation wraps `generateMetadata()` functions to generate trace IDs
2. Sentry calls `crypto.randomUUID()` internally to create unique trace identifiers
3. This happens **BEFORE** your function body executes
4. Next.js 16+ requires that request data (cookies/headers) must be accessed **BEFORE** any crypto operations
5. Since Sentry intercepts before your code runs, the requirement is violated

### Solution Overview

**For static pages:** Use `export const metadata` instead of `generateMetadata()` function

- No async function = no Sentry interception
- Evaluated at build time
- Still includes both locales via `alternates.languages` in `generatePageMetadata()`

**For dynamic pages:** Keep `generateMetadata()` but ensure `cookies()` is accessed FIRST

- Use `ensureRequestDataAccess()` at the very start
- Or access `cookies()` directly before any other operations

## When to Use Static Metadata

Use `export const metadata` when:

- ✅ Page content is static (doesn't change based on user/cookies)
- ✅ Metadata doesn't need to vary by locale (or you're okay with default locale)
- ✅ You want to avoid Sentry interception issues
- ✅ Page is public and doesn't require authentication

**Example:**

```typescript
import { generatePageMetadata } from '@/lib/seo/metadata';
import type { Metadata } from 'next';

// Static metadata - avoids Sentry crypto.randomUUID() issue
const locale = 'vi' as const;

export const metadata: Metadata = generatePageMetadata({
  title: 'Page Title | WatashiWa',
  description: 'Page description',
  url: '/page-path',
  locale,
  canonical: '/page-path',
});
```

**Note:** Even though we use default locale (vi) for title/description, `generatePageMetadata()` automatically includes both locales in `alternates.languages`, so search engines can discover both language versions.

## When to Use Dynamic Metadata

Use `generateMetadata()` function when:

- ✅ Page metadata needs to vary by user locale (from cookies)
- ✅ Page metadata depends on route parameters (`params`)
- ✅ Page metadata needs to fetch data from database
- ✅ Page requires authentication-specific metadata

**Example:**

```typescript
import { ensureRequestDataAccess, getLocaleForMetadata } from '@/lib/seo/locale';
import { generatePageMetadata } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  // CRITICAL: Access request data FIRST before any other operations
  // This satisfies Next.js requirement for crypto.randomUUID() usage
  await ensureRequestDataAccess();

  // Get locale from request context (cookies) with fallback to default
  const locale = await getLocaleForMetadata();
  const t = await getTranslations({ locale, namespace: 'PageNamespace' });

  return generatePageMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
    url: '/page-path',
    locale,
    canonical: '/page-path',
  });
}
```

## Checklist for New Pages

When creating a new page, ask yourself:

1. **Does this page need dynamic metadata?**
   - Does it depend on user locale from cookies? → Use `generateMetadata()`
   - Does it depend on route params? → Use `generateMetadata()`
   - Does it fetch data from DB? → Use `generateMetadata()`

2. **Is this a static page?**
   - Content doesn't change? → Use `export const metadata`
   - Public page? → Use `export const metadata`
   - No user-specific data? → Use `export const metadata`

3. **If using `generateMetadata()`:**
   - ✅ Call `ensureRequestDataAccess()` at the very start
   - ✅ Or access `cookies()` directly before any other operations
   - ✅ This ensures Next.js requirement is satisfied before Sentry intercepts

## Current Implementation Status

### Pages Using Static Metadata (✅ No Issues)

- `/layout.tsx` - Root layout
- `/about/page.tsx` - About page
- `/study/page.tsx` - Study page
- `/decks/page.tsx` - Decks page
- `/help/page.tsx` - Help center
- `/contact/page.tsx` - Contact page
- `/cookie-policy/page.tsx` - Cookie policy
- `/terms-of-service/page.tsx` - Terms of service
- `/privacy-policy/page.tsx` - Privacy policy
- `/data-rights/page.tsx` - Data rights
- `/info/cube/page.tsx` - CUBE method info

### Pages Using Dynamic Metadata (⚠️ Must Access Request Data First)

- `/page.tsx` - Homepage (uses `getLocaleForMetadata()`)
- `/courses/[id]/page.tsx` - Course detail (uses `params` and DB)

## Reference

- [Next.js 16 Metadata Documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js crypto.randomUUID() Error](https://nextjs.org/docs/messages/next-prerender-crypto)
- [Sentry Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

## Migration Guide

If you encounter the `crypto.randomUUID()` error on a page:

1. **Check if page needs dynamic metadata:**
   - If NO → Convert to static `export const metadata`
   - If YES → Add `ensureRequestDataAccess()` at start of `generateMetadata()`

2. **For static conversion:**
   - Remove `export async function generateMetadata()`
   - Add `export const metadata: Metadata = generatePageMetadata({...})`
   - Use default locale (vi) for title/description
   - Both locales still included via `alternates.languages`

3. **For dynamic pages:**
   - Add `await ensureRequestDataAccess();` at the very first line
   - Or access `cookies()` directly before any other operations
   - This must happen before Sentry intercepts the function
