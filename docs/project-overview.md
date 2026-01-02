# WatashiWa Project Overview

**Generated:** 2025-12-30  
**Project Type:** Web Application (Next.js)  
**Architecture:** Monolith (Single-part application)  
**Primary Language:** TypeScript

---

## Executive Summary

WatashiWa is a Japanese vocabulary learning application that uses a Spaced Repetition System (SRS) to help users master Japanese vocabulary, Kanji, and language concepts. The application implements the "Smart CUBE" method, which combines Context, Understanding, Blocking (interference prevention), and Encoding strategies for effective learning.

### Core Value Proposition

- **AI-Powered Learning:** Personalized mnemonics, pitch accent visualization, and adaptive learning paths
- **Smart CUBE Method:** Contextual priming, dynamic card variants, interference shielding, and active encoding
- **Memory-First Design:** FSRS algorithm for optimal spaced repetition scheduling
- **Vietnamese-Friendly:** Hán Việt support for Vietnamese learners leveraging their existing knowledge

---

## Technology Stack Summary

| Category                 | Technology    | Version | Justification                                               |
| ------------------------ | ------------- | ------- | ----------------------------------------------------------- |
| **Framework**            | Next.js       | 16.1.1  | App Router for modern React patterns, SSR/SSG support       |
| **Language**             | TypeScript    | 5.x     | Type safety, strict mode enabled                            |
| **UI Library**           | Ant Design    | 6.1.2   | Comprehensive component library with theme support          |
| **Database**             | PostgreSQL    | -       | Relational database with JSONB support for flexible content |
| **ORM**                  | Prisma        | 7.2.0   | Type-safe database access, migrations                       |
| **State Management**     | Zustand       | 5.0.9   | Lightweight global state for session management             |
| **SRS Algorithm**        | ts-fsrs       | 5.2.3   | FSRS (Free Spaced Repetition Scheduler) implementation      |
| **Authentication**       | Supabase Auth | -       | OAuth and email/password authentication                     |
| **Analytics**            | PostHog       | 1.310.1 | User behavior tracking and analytics                        |
| **Error Monitoring**     | Sentry        | 10.32.1 | Error tracking and performance monitoring                   |
| **3D Graphics**          | Three.js      | 0.182.0 | Memory Garden 3D visualization                              |
| **Internationalization** | next-intl     | 4.6.1   | Multi-language support (en, vi, ja)                         |

---

## Architecture Type

**Vertical Slice Architecture (Feature-First Organization)**

The codebase is organized by domain modules rather than technical layers:

```
src/
├── app/              # Next.js routing layer (thin pages)
├── lib/              # Shared utilities (DB, auth, theme)
└── modules/          # Domain modules (feature-first)
    ├── auth/         # Authentication
    ├── flashcard/     # Card entity and SRS mechanics
    ├── study/         # Session orchestration
    ├── dashboard/    # User dashboard and analytics
    ├── deck/         # Deck management
    ├── course/       # Course structure
    └── ...
```

**Key Architectural Principles:**

- **Dependency Rule:** High-level modules (study) can import from low-level (flashcard), never reverse
- **Single Responsibility:** Each module has one clear purpose
- **Colocation:** Keep related code together (components, actions, types in same module)
- **Thin Pages:** `page.tsx` files only handle data fetching, pass to client components

---

## Repository Structure

**Type:** Monolith (single cohesive codebase)

The application is a single Next.js application with:

- Server-side rendering and API routes
- Client-side React components
- Database access via Prisma
- No separate frontend/backend split

---

## Quick Reference

- **Entry Point:** `src/app/layout.tsx` (Root layout)
- **Main Study Flow:** `src/app/study/page.tsx`
- **Database Schema:** `prisma/schema.prisma`
- **Theme Configuration:** `src/lib/theme/themeConfig.ts`
- **Core Action Pattern:** `src/modules/core/action-client.ts`

---

## Links to Detailed Documentation

- [Architecture Documentation](./architecture.md) - Detailed system architecture
- [Source Tree Analysis](./source-tree-analysis.md) - Complete directory structure
- [Component Inventory](./component-inventory.md) - UI components catalog
- [State Management](./state-management.md) - Zustand stores and global state patterns
- [API Contracts](./api/index.md) - Server actions and API routes
- [API Contracts (Index)](./api-contracts.md) - Single-file pointer to API locations
- [Data Models](./models/index.md) - Database schema documentation
- [Data Models (Index)](./data-models.md) - Single-file pointer to Prisma schema + model docs
- [Development Guide](./development-guide.md) - Setup and development instructions
- [Deployment Guide](./deployment-guide.md) - Deployment/config overview
- [Contribution Guide](./contribution-guide.md) - Contribution conventions and commands

---

## Getting Started

1. **Prerequisites:**
   - Node.js 22+
   - PostgreSQL database
   - Supabase project (for authentication)

2. **Installation:**

   ```bash
   pnpm install
   pnpm db:generate
   ```

3. **Environment Setup:**
   - Copy `.env.example` to `.env`
   - Configure database and Supabase credentials

4. **Run Development Server:**

   ```bash
   pnpm dev
   ```

For detailed setup instructions, see [Development Guide](./development-guide.md).
