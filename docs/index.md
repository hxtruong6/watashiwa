# WatashiWa Project Documentation Index

**Generated:** 2025-12-30  
**Project Type:** Web Application (Next.js)  
**Architecture:** Vertical Slice (Feature-First)  
**Status:** Exhaustive Scan Complete

---

## Quick Reference

- **Framework:** Next.js 16.1.1 (App Router)
- **Language:** TypeScript 5.x (Strict Mode)
- **UI Library:** Ant Design 6.1.2
- **Database:** PostgreSQL + Prisma 7.2.0
- **State Management:** Zustand 5.0.9
- **Entry Point:** `src/app/layout.tsx`
- **Database Schema:** `prisma/schema.prisma`

---

## Generated Documentation

### Core Documentation

- **[Project Overview](./project-overview.md)** - Executive summary, tech stack, quick reference
- **[Architecture](./architecture.md)** - System architecture, patterns, data flow
- **[Source Tree Analysis](./source-tree-analysis.md)** - Complete directory structure with annotations
- **[Component Inventory](./component-inventory.md)** - Auto-generated inventory of React component files
- **[State Management](./state-management.md)** - Zustand stores and global state patterns
- **[API Contracts](./api/index.md)** - Server actions and API routes (sharded; see also `api-contracts.md`)
- **[API Contracts (Index)](./api-contracts.md)** - Single-file pointer to the sharded API docs and code locations
- **[Data Models](./models/index.md)** - Database schema and relationships (sharded; see also `data-models.md`)
- **[Data Models (Index)](./data-models.md)** - Single-file pointer to schema + sharded docs
- **[Development Guide](./development-guide.md)** - Setup, installation, and development workflow
- **[Deployment Guide](./deployment-guide.md)** - Deployment/config overview (PM2, Nginx, Sentry, etc.)
- **[Contribution Guide](./contribution-guide.md)** - Local commands + contribution conventions
- **[Sharding Summary](./SHARDING_SUMMARY.md)** - Documentation sharding details

### Supporting Documentation

- **[Project Scan Report](./project-scan-report.json)** - Workflow state and findings
- **[Project Parts Metadata](./project-parts.json)** - Machine-readable repository structure
- **[Exhaustive Scan Summary](./_bmad/exhaustive-scan-summary.md)** - File/LOC counts and largest files
- **[Exhaustive Scan Inventory (JSON)](./_bmad/exhaustive-scan-inventory.json)** - Minified inventory output
- **[Existing Docs Inventory](./_bmad/existing-documentation-inventory.md)** - What docs already exist in-repo

---

## Existing Documentation

### Product & Planning

- **[Product V2 Masterplan](./product_v2.md)** - Product vision, features, roadmap
- **[Product V3 Roadmap](./product_v3_roadmap.md)** - Future enhancements
- **Phase Plans** - Implementation phases
  - [Phase 1 Plan](./phase1_plan.md)
  - [Phase 2 Plan](./phase2_plan.md)
  - [Phase 3 Plan](./phase3_plan.md)
  - [Phase 4 Plan](./phase4_plan.md)

### Technical Specifications

- **[Technical Spec](./technical_spec.md)** - 3-Tier Smart CUBE architecture details
- **[Design System](./design_system.md)** - UI/UX guidelines, color tokens, component patterns
- **[Modules Architecture](./modules.md)** - Module dependency rules and organization
- **[SRS Architecture](./srs_architecture.md)** - Spaced Repetition System implementation
- **[Testing Strategy](./testing_strategy.md)** - Test approach and guidelines

### Features & Guides

- **[Feature Documentation](./features/)** - Individual feature specifications
  - [Authentication](./features/authentication.md)
  - [Study Session Design](./features/study_session_design.md)
  - [Memory Garden](./features/memory-garden/README.md)
  - **V2 Features**
    - [Active Priming](./features/v2_active_priming.md)
    - [Dynamic Variants](./features/v2_dynamic_variants.md)
    - [Interference Shield](./features/v2_interference_shield.md)
    - [Landing Page (V2)](./features/v2_landing_page.md)
- **[Guides](./guides/)** - Setup guides (Supabase OAuth, etc.)

### Legacy Documentation

- No dedicated `docs/legacy_v1/` folder currently exists in this repo. Use git history or tagged releases if you need V1 references.

---

## Getting Started

### For New Developers

1. **Start Here:** [Project Overview](./project-overview.md) - Understand the project
2. **Architecture:** [Architecture Documentation](./architecture.md) - Learn the system design
3. **Setup:** [Development Guide](./development-guide.md) - Get your environment ready
4. **Code Structure:** [Source Tree Analysis](./source-tree-analysis.md) - Navigate the codebase

### For AI-Assisted Development

When planning new features or making changes:

1. **Reference Architecture:** [Architecture](./architecture.md) - Understand patterns and constraints
2. **Check API Contracts:** [API Contracts](./api/index.md) - See existing server actions
3. **Review Data Models:** [Data Models](./models/index.md) - Understand database schema
4. **Component Patterns:** [Source Tree Analysis](./source-tree-analysis.md) - Find reusable components

### For Feature Planning

1. **Product Vision:** [Product V2](./product_v2.md) - Understand product goals
2. **Phase Plans:** Start from [Phase 1 Plan](./phase1_plan.md) (then Phase 2–4)
3. **Feature Specs:** [Features Directory](./features/) - Review existing feature documentation

---

## Module Quick Reference

### Core Modules

| Module | Purpose | Key Files |
|--------|---------|-----------|
| **auth** | Authentication | `auth.actions.ts`, `useAuth.ts` |
| **flashcard** | Card entity & SRS | `flashcard.actions.ts`, `srs-algorithm.ts` |
| **study** | Session orchestration | `study.actions.ts`, `study.service.ts` |
| **dashboard** | User dashboard | `dashboard.actions.ts`, components |
| **deck** | Deck management | `deck.actions.ts`, `deck.data.ts` |
| **course** | Course structure | `course.actions.ts` |
| **vocabulary** | Content management | `vocabulary.actions.ts` |

### Supporting Modules

- **admin** - Admin panel and content verification
- **analytics** - User behavior tracking
- **community** - Comments and social features
- **priming** - Active priming stories
- **report** - Content reporting system
- **ui** - Shared UI components

---

## Architecture Patterns

### Vertical Slice Architecture

- **Organize by feature, not technical layer**
- **High-level modules can import from low-level**
- **Never reverse dependencies**

### Server Actions Pattern

- **Preferred over API routes**
- **Type-safe with Zod validation**
- **Automatic auth via `executeSafeAction`**

### Component Patterns

- **Thin pages** - Only data fetching
- **Server Components** - Default (data fetching)
- **Client Components** - For interactivity (`'use client'`)

---

## Development Workflow

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Supabase project (for auth)

### Quick Start

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Run development server
pnpm dev
```

See [Development Guide](./development-guide.md) for detailed instructions.

---

## Testing

### Test Types

- **Unit Tests:** `pnpm test` (Vitest)
- **Integration Tests:** `pnpm test:integration` (requires test DB)
- **E2E Tests:** `pnpm e2e` (Playwright)

### Test Database Setup

```bash
pnpm test:db:setup    # Start test DB (Docker)
pnpm test:integration # Run integration tests
pnpm test:db:teardown # Stop test DB
```

See [Testing Strategy](./testing_strategy.md) for details.

---

## Key Concepts

### Smart CUBE Method

- **C (Context):** Active priming with stories
- **U (Understanding):** Etymology and visualizations
- **B (Blocking):** Interference shield for confusing pairs
- **E (Encoding):** Dynamic card variants and active recall

### FSRS Algorithm

- Free Spaced Repetition Scheduler
- Implemented via `ts-fsrs` library
- State stored in `UserReview` model
- Calculates optimal review intervals

### Vertical Slice Organization

- Features are self-contained modules
- Each module has components, actions, services, types
- Clear dependency rules prevent circular imports

---

## Next Steps

### For Development

1. Review [Architecture](./architecture.md) to understand system design
2. Check [Development Guide](./development-guide.md) for setup
3. Explore [Source Tree](./source-tree-analysis.md) to navigate codebase
4. Reference [API Contracts](./api/index.md) when adding features

### For Planning

1. Review [Product V2](./product_v2.md) for product vision
2. Check [Phase 1 Plan](./phase1_plan.md) (then Phase 2–4) for roadmap
3. Reference [Feature Specs](./features/) for existing features

---

## Documentation Status

**Last Updated:** 2025-12-30  
**Scan Level:** Exhaustive  
**Mode:** Full Rescan

### Generated Files

✅ Project Overview  
✅ Architecture  
✅ Source Tree Analysis  
✅ API Contracts (sharded into 17 module files)  
✅ Data Models (sharded into 18 model files)  
✅ Component Inventory  
✅ State Management  
✅ Development Guide  
✅ Deployment Guide  
✅ Contribution Guide  
✅ Master Index (this file)

**Note:** Large documentation files have been sharded for better AI consumption:

- API Contracts: Split into `docs/api/` by module (all files <500 lines)
- Data Models: Split into `docs/models/` by model (all files <500 lines)

### Existing Files Linked

✅ Product Documentation  
✅ Technical Specifications  
✅ Feature Documentation  
✅ Guides and References

---

## AI-Assisted Development

This documentation is optimized for AI-assisted development. When working with AI:

1. **Reference this index** for navigation
2. **Point to specific docs** for context (e.g., "see architecture.md")
3. **Use module structure** to understand code organization
4. **Follow patterns** documented in architecture.md

---

**Note:** This documentation was generated via deep scan of the codebase. For the most up-to-date information, refer to the source code and inline documentation.
