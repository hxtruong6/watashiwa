# Task: Fix Multilingual Metadata for SEO Compliance

**Status:** ready-for-dev  
**Priority:** High (SEO Impact)  
**Type:** Bug Fix / Technical Debt

---

## Problem Statement

The current implementation of `generateMetadata` functions across multiple static pages is **architecturally flawed** for a multilingual site. The metadata generation does not properly handle locale context, leading to:

1. **Static metadata**: All pages return the same metadata regardless of user's language preference
2. **SEO conflicts**: Hardcoded URLs without locale context cause duplicate content issues
3. **Missing hreflang support**: Search engines cannot properly understand language relationships
4. **Incorrect Open Graph locales**: Social media previews may show wrong language

---

## Expert Critique Summary

### Critical Failures Identified

1. **Missing `params` in `generateMetadata`**
   - Next.js `generateMetadata` is a reserved function that receives `params`
   - Without extracting `locale` from `params`, metadata is static based on server default
   - `getTranslations()` without locale context defaults to server environment language

2. **Hardcoded URLs (SEO Conflict)**
   - URLs like `https://watashiwa.app/about` are hardcoded
   - Should be dynamic based on locale: `https://watashiwa.app/{locale}/about` OR use proper canonical/hreflang
   - Google may de-index pages as "duplicate content" without proper language signals

3. **Missing `alternates.languages`**
   - Professional multilingual sites must declare language relationships
   - Missing `alternates.languages` prevents proper SEO hreflang implementation
   - Search engines cannot understand that English and Vietnamese versions are related

4. **Incorrect Open Graph Locale**
   - `openGraph.locale` property is missing or incorrect
   - Social media platforms (Facebook, LinkedIn) need explicit locale declaration
   - Without this, preview cards may show incorrect language metadata

---

## Affected Files

The following pages have the same architectural issue:

1. `src/app/about/page.tsx` - **Primary example** (currently open)
2. `src/app/help/page.tsx`
3. `src/app/contact/page.tsx`
4. `src/app/data-rights/page.tsx`
5. `src/app/cookie-policy/page.tsx`
6. `src/app/terms-of-service/page.tsx`
7. `src/app/privacy-policy/page.tsx`
8. `src/app/page.tsx` (homepage - uses `generatePageMetadata` but with static locale)

**Note:** `src/app/courses/[id]/page.tsx` also has similar issues but uses `generateCourseMetadata` utility.

---

## Current Implementation Analysis

### Current Pattern (INCORRECT)

```typescript
// src/app/about/page.tsx (current - WRONG)
export async function generateMetadata(): Promise<Metadata> {
 await connection();
 const t = await getTranslations('About'); // ❌ No locale context
 
 return {
  title: t('metaTitle'),
  description: t('metaDescription'),
  openGraph: {
   title: t('metaTitle'),
   description: t('metaDescription'),
   url: `https://watashiwa.app/about`, // ❌ Hardcoded, no locale
   type: 'website',
  },
  alternates: {
   canonical: 'https://watashiwa.app/about', // ❌ No hreflang
  },
 };
}
```

### Issues with Current Approach

1. `getTranslations('About')` without locale parameter defaults to server's default locale
2. URL is hardcoded without locale consideration
3. No `alternates.languages` for hreflang support
4. Missing `openGraph.locale` property
5. `generateMetadata` doesn't accept `params` parameter

---

## Technical Context

### Routing Configuration

From `src/i18n/routing.ts`:

- `localePrefix: 'never'` - URLs don't include locale prefix (e.g., `/en/about`)
- Locale is determined via `NEXT_LOCALE` cookie (see `src/i18n/request.ts`)
- Supported locales: `['en', 'vi']`
- Default locale: `'vi'`

### Translation System

- Uses `next-intl` 4.6.1
- `getTranslations()` from `next-intl/server` can accept locale parameter
- Translation files: `src/i18n/messages/{locale}.json`
- Each namespace (e.g., `About`, `Help`) has `metaTitle` and `metaDescription`

### Existing Utilities

- `src/lib/seo/metadata.ts` has `generatePageMetadata()` utility
- Utility already supports `locale` parameter and generates proper `alternates.languages`
- However, current usage doesn't pass dynamic locale from request context

---

## Solution Requirements

### Option A: Use Request Context (Recommended for `localePrefix: 'never'`)

Since the routing doesn't use URL-based locale (`localePrefix: 'never'`), we need to:

1. Get locale from request context (cookies) during `generateMetadata`
2. Pass locale to `getTranslations({ locale, namespace })`
3. Use `generatePageMetadata()` utility with proper locale
4. Ensure proper `alternates.languages` for both locales

### Option B: Change Routing to Include Locale in URL

If we want to use `params.locale` in `generateMetadata`:

1. Change `localePrefix: 'never'` to `localePrefix: 'always'` or `'as-needed'`
2. Update all routes to include locale: `/en/about`, `/vi/about`
3. Extract locale from `params` in `generateMetadata`
4. This is a larger refactor but more SEO-friendly

**Recommendation:** Start with Option A (request context) as it's less disruptive. Option B can be a future enhancement.

---

## Acceptance Criteria

### AC1: Dynamic Locale Detection

**Given** a user visits `/about` with Vietnamese locale preference  
**When** the page metadata is generated  
**Then** the metadata uses Vietnamese translations (`vi` locale)  
**And** the `openGraph.locale` is set to `'vi_VN'`

**Given** a user visits `/about` with English locale preference  
**When** the page metadata is generated  
**Then** the metadata uses English translations (`en` locale)  
**And** the `openGraph.locale` is set to `'en_US'`

### AC2: Proper Hreflang Implementation

**Given** any static page with `generateMetadata`  
**When** metadata is generated  
**Then** `alternates.languages` includes both:

- `'en-US': 'https://watashiwa.app/about'`
- `'vi-VN': 'https://watashiwa.app/about'`  
**And** `alternates.canonical` points to the current locale's URL

### AC3: Correct Open Graph Locale

**Given** metadata is generated for any page  
**When** `openGraph` object is created  
**Then** `openGraph.locale` is set to:

- `'vi_VN'` for Vietnamese locale
- `'en_US'` for English locale

### AC4: URL Consistency

**Given** metadata is generated  
**When** URLs are constructed  
**Then** URLs are consistent across:

- `openGraph.url`
- `alternates.canonical`
- `alternates.languages` entries

### AC5: All Affected Pages Updated

**Given** the fix is implemented  
**When** all affected pages are reviewed  
**Then** all 8 pages listed in "Affected Files" have been updated  
**And** they follow the same pattern

---

## Implementation Tasks

### Task 1: Research Locale Detection in `generateMetadata`

- [ ] Investigate how to get locale from request context in `generateMetadata`
- [ ] Check if `next-intl` provides utilities for this (e.g., `getLocale()` from `next-intl/server`)
- [ ] Verify if `connection()` call is necessary or can be optimized
- [ ] Document the pattern for locale detection

**Files to Review:**

- `src/i18n/request.ts` - How locale is determined from cookies
- `next-intl` documentation for `getLocale()` in server context
- `src/app/layout.tsx` - How locale is handled in root layout

### Task 2: Create/Update Metadata Utility Helper

- [ ] Review `src/lib/seo/metadata.ts` - `generatePageMetadata()` utility
- [ ] Ensure utility properly handles locale parameter
- [ ] Verify `alternates.languages` generation includes both locales
- [ ] Check if utility needs enhancement for request-based locale

**Files to Review:**

- `src/lib/seo/metadata.ts`
- `src/lib/seo/constants.ts`
- `src/lib/seo/hreflang.ts` (if exists)

### Task 3: Fix `src/app/about/page.tsx`

- [ ] Update `generateMetadata` to accept `params` (if using Option B) OR get locale from request
- [ ] Pass locale to `getTranslations({ locale, namespace: 'About' })`
- [ ] Use `generatePageMetadata()` utility OR manually construct with proper locale
- [ ] Ensure `openGraph.locale` is set correctly
- [ ] Ensure `alternates.languages` includes both `en-US` and `vi-VN`
- [ ] Test with both Vietnamese and English locale preferences

### Task 4: Fix `src/app/help/page.tsx`

- [ ] Apply same pattern as Task 3
- [ ] Use `getTranslations({ locale, namespace: 'Help' })`
- [ ] Verify translations exist in both `en.json` and `vi.json`

### Task 5: Fix `src/app/contact/page.tsx`

- [ ] Apply same pattern as Task 3
- [ ] Use `getTranslations({ locale, namespace: 'Contact' })`
- [ ] Verify translations exist in both `en.json` and `vi.json`

### Task 6: Fix `src/app/data-rights/page.tsx`

- [ ] Apply same pattern as Task 3
- [ ] Use appropriate namespace for translations
- [ ] Verify translations exist in both `en.json` and `vi.json`

### Task 7: Fix `src/app/cookie-policy/page.tsx`

- [ ] Apply same pattern as Task 3
- [ ] Use appropriate namespace for translations
- [ ] Verify translations exist in both `en.json` and `vi.json`

### Task 8: Fix `src/app/terms-of-service/page.tsx`

- [ ] Apply same pattern as Task 3
- [ ] Use appropriate namespace for translations
- [ ] Verify translations exist in both `en.json` and `vi.json`

### Task 9: Fix `src/app/privacy-policy/page.tsx`

- [ ] Apply same pattern as Task 3
- [ ] Use appropriate namespace for translations
- [ ] Verify translations exist in both `en.json` and `vi.json`

### Task 10: Fix `src/app/page.tsx` (Homepage)

- [ ] Review current implementation using `generatePageMetadata()`
- [ ] Ensure locale is passed dynamically (not static `routing.defaultLocale`)
- [ ] Verify proper hreflang support

### Task 11: Verify Translation Files

- [ ] Ensure all affected namespaces have `metaTitle` and `metaDescription` in:
  - `src/i18n/messages/en.json`
  - `src/i18n/messages/vi.json`
- [ ] Add missing translations if needed

### Task 12: Testing & Validation

- [ ] Test metadata generation with Vietnamese locale cookie
- [ ] Test metadata generation with English locale cookie
- [ ] Verify Open Graph previews show correct language (use Facebook Debugger)
- [ ] Verify hreflang tags in HTML output
- [ ] Check canonical URLs are correct
- [ ] Validate with Google Search Console (if available)

---

## Technical Implementation Notes

### Pattern for Request-Based Locale (Option A)

```typescript
// Example pattern (to be confirmed in Task 1)
import { getLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
 // Get locale from request context (cookies)
 const locale = await getLocale(); // or equivalent from next-intl
 
 // Pass locale to getTranslations
 const t = await getTranslations({ locale, namespace: 'About' });
 
 const baseUrl = 'https://watashiwa.app';
 const path = '/about'; // No locale prefix since localePrefix: 'never'
 
 return {
  title: t('metaTitle'),
  description: t('metaDescription'),
  openGraph: {
   title: t('metaTitle'),
   description: t('metaDescription'),
   url: `${baseUrl}${path}`,
   siteName: 'Watashiwa',
   locale: locale === 'vi' ? 'vi_VN' : 'en_US', // ✅ Critical
   type: 'website',
  },
  alternates: {
   canonical: `${baseUrl}${path}`,
   languages: {
    'en-US': `${baseUrl}${path}`, // ✅ Both locales
    'vi-VN': `${baseUrl}${path}`, // ✅ Both locales
   },
  },
 };
}
```

### Pattern for URL-Based Locale (Option B - Future)

```typescript
// If routing changes to include locale in URL
type Props = {
 params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const locale = (await params).locale as 'vi' | 'en';
 const t = await getTranslations({ locale, namespace: 'About' });
 
 const baseUrl = 'https://watashiwa.app';
 const path = `/${locale}/about`; // Locale in URL
 
 return {
  // ... same as above but with locale in path
 };
}
```

---

## Dependencies & Constraints

### Framework Requirements

- **Next.js 16+ (App Router)**: `generateMetadata` is App Router feature
- **next-intl 4.6.1**: Must support `getLocale()` or equivalent in server context
- **TypeScript 5.x**: Strict typing required

### Architecture Constraints

- **Vertical Slice Architecture**: Keep metadata logic in page files (thin layer)
- **No Tailwind**: Use Ant Design components only (not applicable here)
- **Server Actions**: Metadata generation is server-side only

### Performance Considerations

- `connection()` call in `generateMetadata` - verify if needed or can be optimized
- Ensure metadata generation doesn't add significant latency
- Consider caching metadata if possible (Next.js handles this automatically)

---

## Related Documentation

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [next-intl Server Components](https://next-intl-docs.vercel.app/docs/next-13/server-components)
- [Open Graph Protocol](https://ogp.me/)
- [Google Hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)

---

## Success Metrics

1. **SEO Compliance**: All pages have proper hreflang tags
2. **Social Media**: Open Graph previews show correct language
3. **Search Engine**: Google Search Console shows no duplicate content warnings
4. **User Experience**: Browser tab titles and meta descriptions match user's language preference

---

## Notes

- **Expert Recommendation**: The expert critique emphasizes that this is a "classic mistake" and "architecturally flawed"
- **Priority**: High - SEO impact can affect search rankings and social media sharing
- **Scope**: 8 pages need updates, but pattern is consistent (good for refactoring)
- **Future Enhancement**: Consider Option B (URL-based locale) for better SEO, but requires routing changes

---

## Questions to Resolve During Implementation

1. Does `next-intl` provide `getLocale()` in `generateMetadata` context?
2. Is `connection()` call necessary in `generateMetadata`? (Performance concern)
3. Should we use `generatePageMetadata()` utility or inline metadata construction?
4. Do all translation namespaces have `metaTitle` and `metaDescription`?
5. Should we implement Option B (URL-based locale) now or defer?

---

**Documented by:** PM Agent (BMAD Method)  
**Date:** 2025-01-XX  
**Status:** Ready for Development
