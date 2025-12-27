# Slug Migration Plan: ID to Slug for Courses and Decks

> **Status**: Planning Phase  
> **Created**: 2025-01-XX  
> **Last Updated**: 2025-01-XX

## Executive Summary

This document outlines the migration strategy from UUID-based URLs (`/courses/[uuid]`, `/decks/[uuid]`) to slug-based URLs (`/courses/[slug]`, `/decks/[slug]`) for improved SEO, readability, and user experience.

**Approach**: Hybrid implementation (Phase 1) that maintains backward compatibility while gradually introducing slugs, followed by full migration (Phase 2) if proven valuable.

---

## Table of Contents

1. [Rationale](#rationale)
2. [Current State](#current-state)
3. [Migration Strategy](#migration-strategy)
4. [Phase 1: Hybrid Approach](#phase-1-hybrid-approach)
5. [Phase 2: Full Migration](#phase-2-full-migration)
6. [Technical Implementation](#technical-implementation)
7. [Risk Assessment](#risk-assessment)
8. [Rollback Plan](#rollback-plan)

---

## Rationale

### Benefits

1. **SEO Improvement**: Readable URLs improve search engine indexing and click-through rates
2. **User Experience**: Easier to share, remember, and communicate URLs verbally
3. **Trust & Professionalism**: Human-readable URLs appear more legitimate
4. **Marketing**: Better for social media sharing and external linking

### Trade-offs

1. **Complexity**: Adds slug generation, uniqueness validation, and collision handling
2. **Migration Effort**: Requires updates across 37+ files that reference IDs
3. **Performance**: String lookups (slugs) are slightly slower than UUID lookups
4. **Maintenance**: Slugs must remain stable or implement redirect logic

---

## Current State

### Database Schema

```prisma
model Course {
  id            String  @id @default(uuid())
  title         String
  titleEn       String? @map("title_en")
  // ... no slug field
}

model Deck {
  id            String  @id @default(uuid())
  title         String
  titleEn       String? @map("title_en")
  // ... no slug field
}
```

### Route Structure

- **Course Detail**: `/courses/[id]` → `src/app/courses/[id]/page.tsx`
- **Deck Detail**: `/decks/[id]` → `src/app/decks/[id]/page.tsx`
- **Study Page**: `/study?deckId=[uuid]` or `/study?courseId=[uuid]`

### Link Generation Points

- **37+ files** reference `deckId` or `courseId` in links
- Key locations:
  - `src/app/courses/[id]/CourseDetailClient.tsx` (deck links)
  - `src/app/decks/[id]/DeckView.tsx` (study links)
  - `src/components/dashboard/MyDecksList.tsx` (study links)
  - `src/app/study/page.tsx` (query params)
  - `src/modules/study/components/StudyDashboard.tsx` (navigation)

---

## Migration Strategy

### Two-Phase Approach

**Phase 1 (Hybrid)**: Add slugs as optional, support both ID and slug in routes, maintain backward compatibility.

**Phase 2 (Full Migration)**: Make slugs required, update all link generation, add redirects for old URLs.

### Decision Criteria for Phase 2

Proceed to Phase 2 if:

- Analytics show users are sharing course/deck URLs
- SEO improvements are measurable
- User feedback indicates preference for readable URLs
- Marketing team requests slug-based URLs

---

## Phase 1: Hybrid Approach

### Goals

1. Add slug support without breaking existing functionality
2. Generate slugs automatically on create/update
3. Support both ID and slug in routes (slug takes precedence)
4. Keep query params as UUIDs for now (internal consistency)

### Database Changes

```prisma
model Course {
  id            String  @id @default(uuid())
  slug          String? @unique // Nullable initially
  title         String
  // ... existing fields
  
  @@index([slug]) // For performance
}

model Deck {
  id            String  @id @default(uuid())
  slug          String? @unique // Nullable initially
  title         String
  // ... existing fields
  
  @@index([slug]) // For performance
}
```

### Route Handler Changes

**Before**:

```typescript
// src/app/courses/[id]/page.tsx
export default async function CourseDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const course = await getCourseWithUserProgress(id);
  // ...
}
```

**After**:

```typescript
// src/app/courses/[idOrSlug]/page.tsx
export default async function CourseDetailPage({ 
  params 
}: { 
  params: Promise<{ idOrSlug: string }> 
}) {
  const { idOrSlug } = await params;
  const course = isUUID(idOrSlug)
    ? await getCourseWithUserProgress(idOrSlug)
    : await getCourseWithUserProgressBySlug(idOrSlug);
  // ...
}
```

### Slug Generation Rules

1. **Source**: Use `titleEn` if available, fallback to `title`
2. **Transformation**:
   - Convert to lowercase
   - Replace spaces with hyphens
   - Remove special characters (keep alphanumeric and hyphens)
   - Handle Japanese characters (convert to romanized or use ID fallback)
   - Limit length (max 100 characters)
3. **Uniqueness**: Append `-{number}` if collision (e.g., `japanese-basics-2`)
4. **Scope**: Global uniqueness (not per-author)
5. **Immutability**: Once set, slug should not change (prevents broken links)

### Data Layer Changes

Add new functions:

- `getCourseBySlug(slug: string)`
- `getDeckBySlug(slug: string)`
- `generateSlug(title: string, existingSlugs: string[]): string`

Update existing functions:

- `createCourse()` - auto-generate slug
- `updateCourse()` - generate slug if missing, but don't update if exists
- `createDeck()` - auto-generate slug
- `updateDeck()` - generate slug if missing, but don't update if exists

### Link Generation Strategy

**Phase 1**: Prefer slug when available, fallback to ID

```typescript
// Utility function
function getCourseUrl(course: Course): string {
  return course.slug 
    ? `/courses/${course.slug}`
    : `/courses/${course.id}`;
}

function getDeckUrl(deck: Deck): string {
  return deck.slug 
    ? `/decks/${deck.slug}`
    : `/decks/${deck.id}`;
}
```

**Query Params**: Keep as UUIDs for now (internal consistency)

- `/study?deckId=[uuid]` (unchanged)
- `/study?courseId=[uuid]` (unchanged)

---

## Phase 2: Full Migration

### Goals

1. Make slugs required (non-nullable)
2. Update all link generation to use slugs
3. Add redirects for old UUID URLs
4. Update query params to support slugs (optional, backward compatible)

### Database Changes

```prisma
model Course {
  slug  String @unique // Required
  // ...
}

model Deck {
  slug  String @unique // Required
  // ...
}
```

### Redirect Strategy

Add middleware or route handler to catch old UUID patterns:

```typescript
// src/app/courses/[idOrSlug]/page.tsx
export default async function CourseDetailPage({ params }) {
  const { idOrSlug } = await params;
  
  if (isUUID(idOrSlug)) {
    // Old UUID URL - redirect to slug
    const course = await getCourseById(idOrSlug);
    if (course?.slug) {
      redirect(`/courses/${course.slug}`, RedirectType.permanent);
    }
  }
  
  // Normal slug lookup
  const course = await getCourseBySlug(idOrSlug);
  // ...
}
```

### Query Params Update

Add slug support while maintaining UUID compatibility:

```typescript
// src/app/study/page.tsx
const { deckId, deckSlug, courseId, courseSlug } = resolvedParams;

// Priority: slug > ID
const targetDeckId = deckSlug 
  ? await getDeckIdBySlug(deckSlug)
  : deckId;

const targetCourseId = courseSlug
  ? await getCourseIdBySlug(courseSlug)
  : courseId;
```

---

## Technical Implementation

### Slug Generation Utility

```typescript
// src/lib/utils/slug.ts
import { transliterate } from 'transliteration'; // For Japanese support

export function generateSlug(
  title: string,
  existingSlugs: string[],
  maxLength = 100
): string {
  // 1. Normalize: lowercase, trim
  let slug = title.toLowerCase().trim();
  
  // 2. Handle Japanese: transliterate to romanized
  slug = transliterate(slug);
  
  // 3. Replace spaces and special chars
  slug = slug
    .replace(/\s+/g, '-')           // Spaces to hyphens
    .replace(/[^\w\-]/g, '')         // Remove non-word chars
    .replace(/\-+/g, '-')            // Multiple hyphens to one
    .replace(/^\-+|\-+$/g, '');      // Trim hyphens
  
  // 4. Truncate
  slug = slug.substring(0, maxLength);
  
  // 5. Ensure uniqueness
  let finalSlug = slug;
  let counter = 1;
  while (existingSlugs.includes(finalSlug)) {
    const suffix = `-${counter}`;
    const truncated = slug.substring(0, maxLength - suffix.length);
    finalSlug = `${truncated}${suffix}`;
    counter++;
  }
  
  return finalSlug || 'untitled'; // Fallback
}
```

### UUID Detection Utility

```typescript
// src/lib/utils/uuid.ts
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}
```

### Data Layer Functions

```typescript
// src/modules/course/course.data.ts

export async function getCourseBySlug(slug: string) {
  return await prisma.course.findUnique({
    where: { slug },
    // ... same includes as getCourseById
  });
}

export async function getCourseByIdOrSlug(idOrSlug: string) {
  return isUUID(idOrSlug)
    ? await getCourseById(idOrSlug)
    : await getCourseBySlug(idOrSlug);
}
```

### Backfill Script

```typescript
// scripts/backfill-slugs.ts
async function backfillSlugs() {
  // Get all courses/decks without slugs
  const courses = await prisma.course.findMany({
    where: { slug: null },
  });
  
  const decks = await prisma.deck.findMany({
    where: { slug: null },
  });
  
  // Generate and update slugs
  for (const course of courses) {
    const existingSlugs = await prisma.course.findMany({
      select: { slug: true },
    }).then(c => c.map(c => c.slug).filter(Boolean));
    
    const slug = generateSlug(
      course.titleEn || course.title,
      existingSlugs
    );
    
    await prisma.course.update({
      where: { id: course.id },
      data: { slug },
    });
  }
  
  // Similar for decks...
}
```

---

## Risk Assessment

### High Risk

1. **Slug Collisions**: Multiple courses/decks with same title
   - **Mitigation**: Append counter suffix, test uniqueness validation

2. **Japanese Title Handling**: Non-ASCII characters in titles
   - **Mitigation**: Use transliteration library, fallback to ID if generation fails

3. **Breaking Existing Links**: Users/bookmarks with UUID URLs
   - **Mitigation**: Phase 1 maintains ID support, Phase 2 adds redirects

### Medium Risk

1. **Performance**: String lookups slower than UUID
   - **Mitigation**: Add database index on `slug`, monitor query performance

2. **Slug Changes**: User renames course/deck
   - **Mitigation**: Keep slug immutable after creation (or implement redirects)

### Low Risk

1. **Migration Complexity**: Many files to update
   - **Mitigation**: Incremental approach, comprehensive testing

---

## Rollback Plan

### Phase 1 Rollback

1. Remove `slug` field from schema (nullable, safe to drop)
2. Revert route handlers to ID-only
3. Remove slug generation logic
4. No data loss (slugs are additive)

### Phase 2 Rollback

1. Make `slug` nullable again
2. Revert routes to support both (fallback to ID)
3. Remove redirect logic
4. Keep slug data for future use

---

## Success Metrics

### Phase 1 Validation

- [ ] All existing functionality works (ID-based URLs)
- [ ] New courses/decks get slugs automatically
- [ ] Slug-based URLs work correctly
- [ ] No performance degradation
- [ ] Zero broken links

### Phase 2 Validation

- [ ] All links use slugs
- [ ] Old UUID URLs redirect correctly
- [ ] SEO improvements measurable (if applicable)
- [ ] User feedback positive (if collected)

---

## Timeline Estimate

- **Phase 1**: 1-2 days
  - Schema migration: 2 hours
  - Slug generation utility: 2 hours
  - Data layer updates: 3 hours
  - Route handler updates: 2 hours
  - Link generation updates: 4 hours
  - Testing: 3 hours

- **Phase 2** (if needed): 2-3 days
  - Make slugs required: 1 hour
  - Redirect logic: 3 hours
  - Update all link generation: 6 hours
  - Query param updates: 2 hours
  - Comprehensive testing: 4 hours

---

## References

- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [URL Slug Best Practices](https://www.searchenginejournal.com/seo-friendly-urls/299892/)

---

## Appendix: Files Requiring Updates

### Phase 1

- `prisma/schema.prisma` - Add slug fields
- `src/lib/utils/slug.ts` - New utility
- `src/lib/utils/uuid.ts` - UUID detection
- `src/modules/course/course.data.ts` - Add slug queries
- `src/modules/course/course.actions.ts` - Auto-generate slugs
- `src/modules/deck/deck.data.ts` - Add slug queries
- `src/modules/deck/deck.actions.ts` - Auto-generate slugs
- `src/app/courses/[id]/page.tsx` - Support slug
- `src/app/decks/[id]/page.tsx` - Support slug
- Link generation utilities (new file)

### Phase 2

- All files from Phase 1
- `src/app/courses/[id]/page.tsx` - Add redirects
- `src/app/decks/[id]/page.tsx` - Add redirects
- `src/app/study/page.tsx` - Support slug params
- All 37+ files with link generation
- `scripts/backfill-slugs.ts` - Backfill existing records
