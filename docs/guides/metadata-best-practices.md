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

**For redirect pages:** Access `cookies()` at component start to satisfy Next.js requirements

- Redirect pages don't need metadata, but must access `cookies()` to prevent Sentry interception issues
- Example: `await cookies()` at the start of the component function

**For dynamic pages with params:** Consider removing metadata if Sentry interception can't be avoided

- Dynamic routes with `[id]` params can't be fully prerendered anyway
- Use structured data (JSON-LD) in page content instead - it's more reliable for SEO

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

## When to Skip Metadata

Skip metadata entirely when:

- ✅ Page uses dynamic route params (`[id]`) and Sentry interception can't be avoided
- ✅ Page is a redirect (redirect pages don't need metadata)
- ✅ Page has structured data (JSON-LD) which is more reliable for SEO

**Example - Redirect Page:**

```typescript
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function RedirectPage() {
  // Access cookies() to satisfy Next.js requirement before Sentry intercepts
  try {
    await cookies();
  } catch {
    // During prerendering, cookies() rejects - this is expected
  }
  redirect('/target-path');
}
```

**Example - Dynamic Route with Structured Data:**

```typescript
// No metadata - use structured data instead
import { generateCourseSchema, schemaToJsonLd } from '@/lib/seo/structured-data';

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const course = await getCourse(id);
  const schema = generateCourseSchema(course);
  const jsonLd = schemaToJsonLd(schema);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      {/* Page content */}
    </>
  );
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

3. **If page is a redirect:**
   - ✅ Access `cookies()` at component start (even though no metadata is needed)
   - ✅ This prevents Sentry interception issues during prerendering

4. **If page uses dynamic params and Sentry intercepts:**
   - ✅ Consider removing metadata entirely
   - ✅ Use structured data (JSON-LD) in page content instead
   - ✅ Structured data is more reliable for SEO than metadata tags

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

### Pages Without Metadata

- `/courses/[id]/page.tsx` - Course detail (metadata removed, uses structured data JSON-LD instead)
- `/privacy/page.tsx` - Redirect page (no metadata needed)
- `/profile/setup/cube/page.tsx` - Redirect page (no metadata needed)

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

3. **For redirect pages:**
   - Add `await cookies()` at the start of the component function
   - This satisfies Next.js requirements even though no metadata is needed

4. **For dynamic routes with params:**
   - If Sentry interception can't be avoided, remove metadata entirely
   - Use structured data (JSON-LD) in page content for SEO instead
