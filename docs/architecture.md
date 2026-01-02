# WatashiWa Architecture Documentation

**Generated:** 2025-12-30  
**Architecture Pattern:** Vertical Slice Architecture (Feature-First)  
**Framework:** Next.js 16.1.1 (App Router)

---

## Executive Summary

WatashiWa implements a **3-Tier "Smart CUBE" Architecture** that separates concerns into Presentation, Smart Layer (orchestration), and Persistence layers. The codebase follows **Vertical Slice Architecture** principles, organizing code by domain features rather than technical layers.

### Exhaustive Scan Addendum

- Repo-wide scan artifacts: `docs/_bmad/exhaustive-scan-summary.md` and `docs/_bmad/exhaustive-scan-inventory.json`
- Component inventory: `docs/component-inventory.md`
- State management overview: `docs/state-management.md`

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│        Presentation Layer (The Stage)                  │
│  • Next.js App Router (Server Components + Client)     │
│  • React Components (Ant Design UI)                    │
│  • Client-side State (Zustand)                        │
│  • Animations (Framer Motion, Three.js)                │
└────────────────────────┬────────────────────────────────┘
                         │ Server Actions / API Routes
┌────────────────────────▼────────────────────────────────┐
│        Smart Layer (The Orchestrator)                  │
│  • Business Logic Services (StudyService, etc.)         │
│  • Decision Logic (Variant Selection, Intervention)    │
│  • Pacing Controls (Daily Limits, Smart Throttling)    │
│  • Data Transformation (Mappers, DTOs)                  │
└───────────┬──────────────────────────┬──────────────────┘
            │ Prisma ORM               │ External APIs
┌───────────▼──────────────────────────▼──────────────────┐
│        Persistence Layer (The Vault)                     │
│  • PostgreSQL Database (Relational + JSONB)              │
│  • Prisma Schema (Type-safe DB Access)                   │
│  • Supabase Auth (Authentication)                        │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Framework

- **Next.js 16.1.1** - React framework with App Router
- **TypeScript 5.x** - Type-safe development (strict mode)
- **React 19.2.3** - UI library

### UI & Styling

- **Ant Design 6.1.2** - Component library with theme support
- **Framer Motion 12.23.26** - Animation library
- **Three.js 0.182.0** - 3D graphics (Memory Garden visualization)

### Data & State

- **PostgreSQL** - Relational database
- **Prisma 7.2.0** - ORM with type-safe queries
- **Zustand 5.0.9** - Global state management
- **ts-fsrs 5.2.3** - FSRS algorithm implementation

### Authentication & Services

- **Supabase Auth** - OAuth and email/password authentication
- **PostHog 1.310.1** - Analytics
- **Sentry 10.32.1** - Error monitoring

### Internationalization

- **next-intl 4.6.1** - Multi-language support (en, vi, ja)

---

## Architecture Pattern: Vertical Slice

### Core Principle

**Organize by Domain Features, Not Technical Layers**

Instead of:

```
❌ src/
   ├── components/
   ├── services/
   ├── actions/
   └── types/
```

We use:

```
✅ src/
   ├── modules/
   │   ├── auth/
   │   │   ├── components/
   │   │   ├── actions.ts
   │   │   ├── hooks/
   │   │   └── types.ts
   │   ├── study/
   │   │   ├── components/
   │   │   ├── actions.ts
   │   │   ├── services.ts
   │   │   └── store/
```

### Module Dependency Rules

1. **High-level modules can import from low-level modules**
   - `study` module can import from `flashcard` module
   - `dashboard` module can import from `study` module

2. **Never reverse dependencies**
   - `flashcard` module should NOT import from `study` module
   - Low-level modules are reusable libraries

3. **Shared utilities go in `lib/`**
   - Database client (`lib/db.ts`)
   - Theme configuration (`lib/theme/`)
   - Common utilities (`lib/utils/`)

### Module Structure

Each module follows this pattern:

```
modules/{feature}/
├── components/          # React components (private to module)
├── actions.ts           # Server Actions (Next.js 'use server')
├── services.ts          # Business logic (pure TypeScript)
├── data.ts             # Data access layer (Prisma queries)
├── types.ts            # TypeScript types
├── hooks/              # React hooks (if needed)
├── store/              # Zustand stores (if needed)
└── utils/              # Module-specific utilities
```

---

## Data Architecture

### Hybrid SQL Approach

**Relational Tables + JSONB for Flexibility**

- **Relational:** User data, relationships, foreign keys
- **JSONB:** Dynamic content (stories, variants, mnemonics)

### Key Models

| Model           | Purpose              | Key Features                              |
| --------------- | -------------------- | ----------------------------------------- |
| `User`          | User accounts        | Preferences, streaks, auth providers      |
| `Vocabulary`    | Core content         | Kanji, readings, meanings, pitch patterns |
| `CardVariant`   | Dynamic card views   | Variant types, content payloads (JSONB)   |
| `UserReview`    | SRS state            | FSRS algorithm state, next review dates   |
| `ConfusionPair` | Interference shield  | Links confusing word pairs                |
| `Story`         | Active priming       | Context stories for vocabulary units      |
| `Deck`          | Content organization | Groups vocabulary by topic/level          |
| `Course`        | Learning paths       | Collections of decks                      |

### Database Schema Location

**Source of Truth:** `prisma/schema.prisma`

Key design decisions:

- **Soft deletes:** `deletedAt` fields instead of hard deletes
- **Content lifecycle:** `ContentStatus` enum (DRAFT → AI_GENERATED → VERIFIED → PUBLISHED)
- **JSONB contracts:** Zod schemas in `lib/schemas/jsonb.ts` for type safety

---

## API Design

### Server Actions (Preferred Pattern)

**Location:** `src/modules/{module}/actions.ts`

**Pattern:**

```typescript
'use server';

import { executeSafeAction } from '@/modules/core/action-client';
import { z } from 'zod';

export async function submitReview(input: { cardId: string; rating: number }) {
	return executeSafeAction(ReviewSchema, input, async (data, { userId }) => {
		// Business logic here
		return result;
	});
}
```

**Benefits:**

- Type-safe with Zod validation
- Automatic auth checking via `executeSafeAction`
- Consistent error handling
- No API route boilerplate

### API Routes (For Special Cases)

**Location:** `src/app/api/{route}/route.ts`

Used for:

- Webhooks (e.g., `/api/cron/reminders`)
- External integrations (e.g., `/api/notifications/subscribe`)
- Streaming responses

### Action Client Pattern

**Core utility:** `src/modules/core/action-client.ts`

Provides:

- Authentication checking
- Input validation (Zod)
- Consistent response format: `{ success: boolean, data?: T, error?: string }`
- Admin action variant (`executeAdminAction`)

---

## Component Architecture

### Component Organization

**By Feature Module:**

- `modules/study/components/` - Study session components
- `modules/flashcard/components/` - Card display components
- `modules/dashboard/components/` - Dashboard widgets

**Shared Components:**

- `components/` - Global reusable components (Analytics, PWA, SEO)
- `modules/ui/components/` - UI primitives (NavBar, Layout)

### Component Patterns

1. **Server Components (Default)**
   - Data fetching
   - No client-side JavaScript
   - Can import server-only code

2. **Client Components (`'use client'`)**
   - Interactive UI
   - State management
   - Event handlers

3. **Thin Pages Rule**
   - `page.tsx` files only fetch data
   - Pass data to client components
   - No complex logic in pages

---

## State Management

### Local State

- **React `useState`** - Component-level UI state (modals, toggles)

### Global State

- **Zustand** - Cross-route state (study session, user preferences)
  - `modules/study/store/useSessionStore.ts` - Active study session
  - `modules/study/store/useStudyPreferences.ts` - Study settings
  - `modules/ui/store/useUIStore.ts` - UI state (modals, drawers)

### Server State

- **Server Components** - Data fetching (no client-side state needed)
- **Server Actions** - Mutations (optimistic updates via revalidation)

---

## Business Logic Services

### Service Layer Pattern

**Location:** `src/modules/{module}/services.ts`

Pure TypeScript functions (no DB access):

- `StudyService` - FSRS calculations, card transformations
- `InterventionService` - Interference detection logic

**Data Layer:**

- `src/modules/{module}/data.ts` - Prisma queries
- Separated from business logic for testability

---

## Source Tree

See [Source Tree Analysis](./source-tree-analysis.md) for complete directory structure.

### Key Directories

```
src/
├── app/                    # Next.js App Router
│   ├── (routes)/           # Route pages
│   └── api/                # API routes
├── modules/                # Feature modules (Vertical Slices)
│   ├── auth/               # Authentication
│   ├── flashcard/          # Card entity & SRS mechanics
│   ├── study/              # Session orchestration
│   ├── dashboard/          # User dashboard
│   ├── deck/               # Deck management
│   └── ...
├── lib/                    # Shared utilities
│   ├── db.ts               # Prisma client
│   ├── theme/              # Ant Design theme config
│   └── utils/              # Common utilities
└── components/             # Global components
```

---

## Development Workflow

See [Development Guide](./development-guide.md) for detailed setup instructions.

### Key Commands

```bash
# Development
pnpm dev                    # Start dev server

# Database
pnpm db:generate            # Generate Prisma client
pnpm db:push                # Push schema changes
pnpm db:migrate             # Run migrations

# Testing
pnpm test                   # Run unit tests
pnpm test:integration       # Run integration tests (requires test DB)
pnpm e2e                    # Run Playwright E2E tests
```

---

## Testing Strategy

### Test Types

1. **Unit Tests (Vitest)**
   - Pure functions
   - Business logic services
   - Utility functions

2. **Integration Tests (Vitest + Real DB)**
   - Database operations
   - Server actions
   - Data layer

3. **E2E Tests (Playwright)**
   - Critical user flows
   - Study session flow
   - Authentication flow

### Test Database

- Separate PostgreSQL instance (Docker)
- Setup: `pnpm test:db:setup`
- Teardown: `pnpm test:db:teardown`

---

## Deployment Architecture

### Production Stack

- **Hosting:** VPS (PM2 process manager)
- **Database:** PostgreSQL (managed or self-hosted)
- **Authentication:** Supabase Auth
- **CDN:** Next.js static assets
- **Monitoring:** Sentry (errors), PostHog (analytics)

### Environment Variables

Required variables:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SENTRY_DSN` - Sentry error tracking
- `POSTHOG_KEY` - PostHog analytics

---

## Security Considerations

### Authentication

- Supabase Auth handles OAuth and email/password
- Session cookies (30-day expiration)
- Server Actions require authentication via `executeSafeAction`

### Authorization

- Role-based access control (User, Moderator, Admin)
- Admin actions use `executeAdminAction` wrapper
- Route protection via middleware

### Data Validation

- Zod schemas for all inputs
- Type-safe Prisma queries
- SQL injection prevention via Prisma

---

## Performance Optimizations

### Next.js Optimizations

- Server Components for data fetching
- Static generation where possible (`force-static`)
- Image optimization (Next.js Image component)
- Code splitting (automatic with App Router)

### Database Optimizations

- Indexed queries (see Prisma schema)
- JSONB indexes for content queries
- Connection pooling (Prisma)

### Client Optimizations

- React Server Components (less JS)
- Zustand for minimal global state
- Lazy loading for heavy components (Memory Garden)

---

## Future Considerations

### Scalability

- Current architecture supports 10,000+ concurrent users
- Database can scale with read replicas
- Consider Redis for session caching if needed

### Potential Enhancements

- GraphQL API layer (if needed for complex queries)
- Real-time features (WebSockets via Supabase Realtime)
- Microservices split (if team grows significantly)

---

## Related Documentation

- [Source Tree Analysis](./source-tree-analysis.md) - Complete directory structure
- [API Contracts](./api/index.md) - Server actions and API routes
- [Data Models](./models/index.md) - Database schema details
- [Component Inventory](./component-inventory.md) - UI components catalog
- [Development Guide](./development-guide.md) - Setup and development instructions
