# Source Tree Analysis

**Generated:** 2025-12-30  
**Project Root:** `/Users/xuantruong/Documents/WORK/SIDE_PROJECTS/watashi-jp`

---

## Overview

This document provides a complete annotated directory tree of the WatashiWa codebase, organized by the Vertical Slice Architecture pattern.

For repo-wide file counts (exhaustive scan), see:

- `docs/_bmad/exhaustive-scan-summary.md`
- `docs/_bmad/exhaustive-scan-inventory.json`

---

## Complete Directory Structure

```
watashi-jp/
├── src/
│   ├── app/                          # Next.js App Router (Routing Layer)
│   │   ├── (routes)/                 # Route pages
│   │   │   ├── about/
│   │   │   ├── admin/                # Admin panel routes
│   │   │   │   ├── content/          # Content verification
│   │   │   │   ├── decks/           # Deck management
│   │   │   │   ├── reports/         # Report resolution
│   │   │   │   └── users/           # User management
│   │   │   ├── auth/                # Authentication routes
│   │   │   │   ├── callback/        # OAuth callback
│   │   │   │   └── auth-code-error/
│   │   │   ├── community/           # Community feed
│   │   │   ├── courses/             # Course pages
│   │   │   │   └── [id]/           # Dynamic course route
│   │   │   ├── dashboard/           # User dashboard
│   │   │   │   ├── courses/        # Course management
│   │   │   │   └── decks/         # Deck management
│   │   │   ├── decks/              # Deck browsing
│   │   │   │   └── [id]/          # Dynamic deck route
│   │   │   ├── exercises/          # Exercise mode
│   │   │   ├── login/              # Login page
│   │   │   ├── study/              # Study session (Main feature)
│   │   │   └── ...                 # Other pages (contact, privacy, etc.)
│   │   ├── api/                     # API Routes (Special cases)
│   │   │   ├── cron/
│   │   │   │   └── reminders/      # Cron job for notifications
│   │   │   └── notifications/
│   │   │       └── subscribe/      # Push notification subscription
│   │   ├── layout.tsx              # Root layout (Entry point)
│   │   ├── page.tsx                # Home page (Landing)
│   │   ├── error.tsx               # Error boundary
│   │   ├── global-error.tsx        # Global error handler
│   │   ├── not-found.tsx           # 404 page
│   │   ├── sitemap.ts              # Sitemap generation
│   │   └── robots.txt/             # Robots.txt route
│   │
│   ├── modules/                     # Feature Modules (Vertical Slices)
│   │   ├── admin/                   # Admin Module
│   │   │   ├── components/
│   │   │   │   ├── Dashboard/      # Admin dashboard widgets
│   │   │   │   ├── Layout/         # Admin shell layout
│   │   │   │   └── QA/             # Content verification workbench
│   │   │   ├── admin.actions.ts    # Admin server actions
│   │   │   └── store/              # Admin state (workbench)
│   │   │
│   │   ├── analytics/              # Analytics Module
│   │   │   └── analytics.actions.ts # Analytics logging
│   │   │
│   │   ├── auth/                   # Authentication Module
│   │   │   ├── components/         # Auth UI components
│   │   │   ├── hooks/              # Auth hooks (useAuth, etc.)
│   │   │   ├── utils/              # Auth utilities
│   │   │   ├── auth.actions.ts     # Auth server actions
│   │   │   └── auth.dto.ts         # Auth DTOs
│   │   │
│   │   ├── community/              # Community Module
│   │   │   ├── components/
│   │   │   │   ├── comments/       # Comment components
│   │   │   │   └── feed/           # Community feed
│   │   │   └── community.actions.ts # Community server actions
│   │   │
│   │   ├── core/                   # Core Module (Shared)
│   │   │   ├── action-client.ts   # executeSafeAction wrapper
│   │   │   └── dto.ts              # Core DTOs
│   │   │
│   │   ├── course/                 # Course Module
│   │   │   ├── course.actions.ts   # Course server actions
│   │   │   └── course.data.ts      # Course data access
│   │   │
│   │   ├── dashboard/              # Dashboard Module
│   │   │   ├── components/
│   │   │   │   ├── home/           # Dashboard home widgets
│   │   │   │   ├── memory-garden/  # 3D Memory Garden visualization
│   │   │   │   ├── learning-map/   # Learning map visualization
│   │   │   │   └── etymology-graph/ # Etymology graph
│   │   │   └── dashboard.actions.ts # Dashboard server actions
│   │   │
│   │   ├── deck/                   # Deck Module
│   │   │   ├── components/
│   │   │   │   ├── admin/          # Admin deck components
│   │   │   │   └── ...             # Deck UI components
│   │   │   ├── deck.actions.ts     # Deck server actions
│   │   │   ├── deck.admin.actions.ts # Admin deck actions
│   │   │   ├── deck.data.ts        # Deck data access
│   │   │   └── deck.params.ts      # Deck route params
│   │   │
│   │   ├── flashcard/              # Flashcard Module (Low-level)
│   │   │   ├── components/
│   │   │   │   └── CardShell/      # Card UI components
│   │   │   ├── hooks/
│   │   │   │   └── useCardFlip.ts  # Card flip animation
│   │   │   ├── store/              # Flashcard state (if needed)
│   │   │   ├── flashcard.actions.ts # Card server actions
│   │   │   ├── types.ts            # Card types
│   │   │   └── utils/
│   │   │       ├── srs-algorithm.ts # FSRS algorithm
│   │   │       └── transformUtils.ts # Card transforms
│   │   │
│   │   ├── leaderboard/            # Leaderboard Module
│   │   │   └── leaderboard.actions.ts
│   │   │
│   │   ├── marketing/              # Marketing Module
│   │   │   ├── components/
│   │   │   │   ├── landing/        # Landing page components
│   │   │   │   └── animations/     # Marketing animations
│   │   │   └── index.ts
│   │   │
│   │   ├── priming/                # Priming Module
│   │   │   ├── components/         # Story reader, priming modal
│   │   │   ├── actions.ts          # Priming server actions
│   │   │   └── types.ts            # Priming types
│   │   │
│   │   ├── report/                 # Report Module
│   │   │   ├── components/         # Report UI
│   │   │   ├── report.actions.ts   # Report server actions
│   │   │   ├── report.data.ts      # Report data access
│   │   │   ├── report.params.ts    # Report route params
│   │   │   └── report.types.ts     # Report types
│   │   │
│   │   ├── study/                  # Study Module (High-level)
│   │   │   ├── actions/
│   │   │   │   └── getReviewQueue.ts
│   │   │   ├── components/
│   │   │   │   ├── Session/        # Session components
│   │   │   │   │   ├── SessionController.tsx # Main controller
│   │   │   │   │   ├── SessionContainer.tsx
│   │   │   │   │   ├── SessionSummary.tsx
│   │   │   │   │   ├── SessionBriefing.tsx
│   │   │   │   │   ├── RatingBar.tsx
│   │   │   │   │   └── StudySettings.tsx
│   │   │   │   └── Settings/       # Study settings
│   │   │   ├── store/
│   │   │   │   ├── useSessionStore.ts # Session state
│   │   │   │   └── useStudyPreferences.ts # Preferences
│   │   │   ├── study.actions.ts    # Study server actions
│   │   │   ├── study.data.ts       # Study data access
│   │   │   ├── study.service.ts    # Study business logic
│   │   │   ├── study.mapper.ts     # Data mapping
│   │   │   ├── intervention.service.ts # Intervention logic
│   │   │   └── utils/
│   │   │       └── timeToRating.ts # Reaction time mapping
│   │   │
│   │   ├── ui/                      # UI Module (Shared)
│   │   │   ├── components/
│   │   │   │   ├── layout/         # Layout components
│   │   │   │   ├── navbar/         # Navigation components
│   │   │   │   ├── NavBar.tsx      # Main navbar
│   │   │   │   └── ProtectedLink.tsx
│   │   │   └── store/
│   │   │       └── useUIStore.ts   # UI state (modals, drawers)
│   │   │
│   │   ├── user/                   # User Module
│   │   │   ├── components/         # User components
│   │   │   ├── hooks/              # User hooks
│   │   │   └── user.actions.ts     # User server actions
│   │   │
│   │   └── vocabulary/              # Vocabulary Module
│   │       ├── components/         # Vocabulary components
│   │       ├── vocabulary.actions.ts # Vocabulary server actions
│   │       └── vocabulary.data.ts  # Vocabulary data access
│   │
│   ├── components/                  # Global Components
│   │   ├── Analytics/              # Analytics tracking
│   │   ├── Audio/                  # Audio playback
│   │   ├── PWA/                    # PWA features
│   │   ├── SEO/                    # SEO components
│   │   ├── Shared/                 # Shared utilities
│   │   └── theme/                  # Theme configuration
│   │
│   ├── hooks/                       # Global Hooks
│   │   ├── animations/             # Animation hooks
│   │   ├── study/                  # Study-related hooks
│   │   └── ...                     # Other global hooks
│   │
│   ├── lib/                        # Shared Libraries
│   │   ├── auth/                   # Auth utilities
│   │   ├── notifications/          # Notification service
│   │   ├── schemas/                # Zod schemas (JSONB contracts)
│   │   ├── seo/                    # SEO utilities
│   │   ├── theme/                  # Theme configuration
│   │   ├── upload/                 # File upload
│   │   ├── utils/                  # Common utilities
│   │   ├── analytics.ts            # Analytics
│   │   ├── constants.ts            # Constants
│   │   ├── db.ts                   # Prisma client (Singleton)
│   │   └── utils.ts                # General utilities
│   │
│   ├── i18n/                       # Internationalization
│   │   ├── messages/               # Translation files
│   │   │   ├── en.json
│   │   │   └── vi.json
│   │   ├── request.ts              # i18n request handler
│   │   └── routing.ts              # i18n routing config
│   │
│   ├── types/                      # Global TypeScript Types
│   │   ├── admin-types.ts
│   │   ├── common.types.ts
│   │   ├── exercises.ts
│   │   ├── schema.d.ts             # Prisma types
│   │   ├── smart-cube.ts           # Smart CUBE types
│   │   └── user.ts
│   │
│   └── utils/                      # Global Utilities
│       └── supabase/               # Supabase utilities
│
├── prisma/                          # Database
│   └── schema.prisma               # Prisma schema (Source of truth)
│
├── public/                          # Static Assets
│   └── assets/                     # Images, animations, etc.
│
├── docs/                           # Documentation
│   ├── features/                   # Feature documentation
│   ├── guides/                     # Setup guides
│   ├── legacy_v1/                  # Legacy documentation
│   └── ...                         # Other docs
│
├── .cursor/                        # Cursor IDE rules
│   └── rules/                      # BMAD rules
│
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── next.config.ts                  # Next.js config
├── prisma/schema.prisma            # Database schema
└── README.md                       # Project README
```

---

## Critical Directories

### Entry Points

- **`src/app/layout.tsx`** - Root layout, initializes providers
- **`src/app/page.tsx`** - Home page (landing)
- **`src/app/study/page.tsx`** - Main study session page

### Core Modules

- **`src/modules/study/`** - Study session orchestration (HIGH-LEVEL)
- **`src/modules/flashcard/`** - Card entity & SRS mechanics (LOW-LEVEL)
- **`src/modules/auth/`** - Authentication
- **`src/modules/dashboard/`** - User dashboard

### Shared Infrastructure

- **`src/lib/db.ts`** - Prisma client singleton
- **`src/lib/theme/`** - Ant Design theme configuration
- **`src/modules/core/action-client.ts`** - Server action wrapper

### Database

- **`prisma/schema.prisma`** - Database schema (source of truth)

---

## Module Dependency Flow

```
app/ (Routes)
  ↓
modules/study/ (High-level orchestration)
  ↓
modules/flashcard/ (Low-level card mechanics)
  ↓
lib/db.ts (Database access)
```

**Rule:** High-level modules can import from low-level, never reverse.

---

## File Organization Patterns

### Server Actions

**Location:** `src/modules/{module}/actions.ts`

**Pattern:**

- All actions use `'use server'` directive
- Wrapped in `executeSafeAction` for auth/validation
- Return `{ success, data, error }` format

### Components

**Location:** `src/modules/{module}/components/`

**Pattern:**

- Server Components by default (data fetching)
- Client Components marked with `'use client'`
- Colocated with module (not in global `components/`)

### Business Logic

**Location:** `src/modules/{module}/services.ts`

**Pattern:**

- Pure TypeScript functions
- No database access (use `data.ts` for that)
- Testable in isolation

### Data Access

**Location:** `src/modules/{module}/data.ts`

**Pattern:**

- Prisma queries only
- No business logic
- Returns raw data

---

## Integration Points

### Authentication

- **Supabase Auth** → `src/modules/auth/auth.actions.ts`
- **Middleware** → `src/middleware.ts` (route protection)

### Database

- **Prisma Client** → `src/lib/db.ts` (singleton)
- **Schema** → `prisma/schema.prisma`

### External Services

- **PostHog** → `src/lib/analytics.ts`
- **Sentry** → `next.config.ts` (wrapped)
- **Push Notifications** → `src/lib/notifications/NotificationService.ts`

---

## Asset Locations

- **Images:** `public/assets/`
- **Animations:** `public/assets/animations/`
- **Icons:** Ant Design icons (imported)

---

## Configuration Files

- **`package.json`** - Dependencies and scripts
- **`tsconfig.json`** - TypeScript configuration
- **`next.config.ts`** - Next.js configuration
- **`prisma/schema.prisma`** - Database schema
- **`.env`** - Environment variables (not in repo)

---

## Testing Structure

- **Unit Tests:** `*.test.ts` files alongside source
- **Integration Tests:** `*.integration.test.ts` files
- **E2E Tests:** `tests/e2e/` (Playwright)

---

## Related Documentation

- [Architecture](./architecture.md) - System architecture
- [Component Inventory](./component-inventory.md) - UI components
- [Development Guide](./development-guide.md) - Setup instructions
