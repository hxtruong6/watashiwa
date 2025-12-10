# JLPT Mastery SRS

A vocabulary learning application for Japanese (JLPT focus) using a Spaced Repetition System (SRS).

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Ant Design (antd)
- **Database**: PostgreSQL (via Prisma)
- **State Management**: React Context + Hooks

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: React components.
  - `ui`: Reusable UI atoms.
  - `features`: Feature-specific components.
  - `layouts`: Layout components.
- `src/lib`: Shared utilities.
  - `db.ts`: Prisma client singleton.
  - `utils.ts`: Helper functions.
  - `antd-tweak.ts`: Ant Design configuration helpers.
- `src/services`: Business logic (SRS, OpenAI, etc.).
- `src/types`: Global TypeScript types.
- `theme`: Ant Design theme configuration.

## Project Documentation

Detailed documentation for this project is located in the `docs/` directory:

- [Product Requirements](docs/product_requirements.md): Goals, User Stories, and Value Proposition.
- [Technical Specification](docs/technical_spec.md): Tech Stack, Architecture, and Data Model.
- [Feature Specification](docs/feature_spec.md): SRS Algorithm, Exercise Types, and Logic.
- [AI Integration](docs/ai_integration.md): Prompts and Agents for Grammar and Content.
- [Design System](docs/design_system.md): UI/UX Rules, Color Palette, and Learner Heuristics.
- [Project Roadmap](docs/project_roadmap.md): Phased implementation status.
- [Conventions](docs/conventions.md): Code Style, Naming, and Best Practices.

Please refer to these documents before making changes.

## Getting Started

1. `pnpm install`
2. `pnpm prisma generate`
3. `pnpm run dev`
