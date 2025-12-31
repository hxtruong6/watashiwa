---
project_name: 'watashi-jp'
user_name: 'iDev'
date: '2025-12-31'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality', 'workflow', 'critical_rules']
status: 'complete'
rule_count: 50+
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

**Core Framework:**

- Next.js 16.1.1 (App Router) - Use Turbopack for dev (`next dev --turbopack`)
- React 19.2.3 + React DOM 19.2.3
- TypeScript 5.x (strict mode enabled)

**Database & ORM:**

- PostgreSQL with Prisma 7.2.0
- Use JSONB for flexible content (Story, Vocabulary etymology)
- All JSONB content MUST be validated with Zod schemas

**UI Library:**

- Ant Design 6.1.2 - **NO Tailwind CSS** (explicit constraint)
- Use Ant Design components and theme tokens from `src/lib/theme/themeConfig.ts`
- Never use raw hex colors or separate CSS/SCSS files

**State Management:**

- Zustand 5.0.9 - Lightweight global state
- Store naming: `use{Feature}Store.ts` in `src/modules/{feature}/store/`

**Internationalization:**

- next-intl 4.6.1 - All user-facing strings use `useTranslations()`
- Messages in `src/i18n/messages/en.json` and `vi.json`
- Namespace per feature: `dashboard.title`, `study.complete`

**Validation:**

- Zod 4.2.1 - All Server Action inputs and JSONB content

**SRS Algorithm:**

- ts-fsrs 5.2.3 - Spaced repetition scheduling

**3D Graphics:**

- Three.js 0.182.0 + @react-three/fiber 9.4.2 + @react-three/drei 10.7.7

**Graph Visualization:**

- react-force-graph-2d 1.29.0 - Knowledge graph rendering

**Testing:**

- Vitest 4.0.16 - Unit tests (co-located `.test.ts` files)
- Playwright 1.57.0 - E2E tests in `e2e/` directory

**External Services:**

- Supabase Auth - OAuth and email/password
- PostHog 1.310.1 - Analytics tracking
- Sentry 10.32.1 - Error monitoring
- Google GenAI 1.34.0 - Story generation (Phase 3)

**Critical Version Constraints:**

- Next.js 16.1.1 requires React 19.x
- Prisma 7.2.0 requires specific engine versions
- Ant Design 6.1.2 uses new token system (no v5 patterns)

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

- **Strict Mode**: TypeScript strict mode is enabled - no `any` without explicit reason
- **Path Aliases**: Use `@/` for imports from `src/` (configured in tsconfig.json)
- **Module Resolution**: `bundler` mode (Next.js specific)
- **Target**: ES2023 with DOM libraries
- **Import/Export**: Use ES modules (`import`/`export`), not CommonJS
- **Type Definitions**: Co-locate types in `types.ts` or use `types/` folder for complex modules
- **Error Handling**: Use `unknown` for catch clauses, then narrow with type guards

### Framework-Specific Rules (Next.js + React)

**Server Actions (MANDATORY Pattern):**

- ALL Server Actions MUST use `executeSafeAction` wrapper from `@/modules/core/action-client`
- NEVER throw errors in Server Actions - always return `{ success: false, error: string }`
- NEVER return data directly - always use `ApiResponse<T>` format
- Pattern: `'use server'` → `executeSafeAction(InputSchema, input, handler, options)`

**Component Organization:**

- **Vertical Slice Architecture**: Organize by feature in `src/modules/{feature}/`
- **Module Components**: Private to module in `src/modules/{feature}/components/`
- **Global Components**: Shared across modules in `src/components/`
- **Component Files**: PascalCase matching component name (SessionController.tsx)

**React Patterns:**

- Use React 19 features (Server Components, Server Actions)
- Client Components: Mark with `'use client'` directive
- Hooks: Named `use{Feature}` in `src/modules/{feature}/hooks/` or `src/hooks/`
- State: Local `useState` for UI toggles, Zustand for global state
- Never use class components

**Next.js App Router:**

- Pages: `src/app/{route}/page.tsx`
- Layouts: `src/app/{route}/layout.tsx`
- Loading: `src/app/{route}/loading.tsx`
- Error: `src/app/{route}/error.tsx`
- API Routes: Only for special cases (webhooks, notifications) in `src/app/api/`

### Testing Rules

**Test Organization:**

- Unit tests: Co-located with `.test.ts` suffix (study.service.test.ts)
- E2E tests: In `e2e/` directory with `.spec.ts` suffix
- Test setup: `tests/setup.ts` for Vitest configuration

**Test Patterns:**

- Use Vitest for unit tests (not Jest)
- Use Playwright for E2E tests
- Mock external services (Supabase, PostHog, Sentry)
- Test environment: `jsdom` for React component tests
- Database tests: Use test database with `docker-compose.test.yml`

**Test Requirements:**

- All Server Actions should have tests
- Business logic services must have unit tests
- Critical user flows must have E2E tests
- Test coverage: Aim for 80%+ on business logic

### Code Quality & Style Rules

**Linting & Formatting:**

- ESLint: Next.js config + Prettier integration
- Prettier: Uses tabs (not spaces) - `useTabs: true`
- Import sorting: @trivago/prettier-plugin-sort-imports
- TypeScript: `@typescript-eslint/no-explicit-any` is a warning (not error)

**Naming Conventions:**

- **Database**: Models PascalCase, columns snake_case with @map()
- **Components**: PascalCase (SessionController.tsx)
- **Functions**: camelCase (getUser, submitReview)
- **Hooks**: camelCase with "use" prefix (useStudySession)
- **Constants**: UPPER_SNAKE_CASE (DAILY_REVIEW_LIMIT)
- **Types/Interfaces**: PascalCase (SmartCard, ActionContext)
- **Server Actions**: camelCase verbs (getReviewQueue, fetchSessionAction)

**Code Organization:**

- **Vertical Slice**: `src/modules/{feature}/` (feature-first, not technical layers)
- **Module Structure**: components/, actions.ts, services.ts, types.ts, hooks/, store/, utils/
- **Shared Code**: `src/lib/` for utilities, `src/components/` for shared UI
- **Never create circular dependencies** between modules

**Documentation:**

- JSDoc comments for complex functions
- Type definitions should be self-documenting
- README files in feature modules for complex logic

### Development Workflow Rules

**Git Patterns:**

- Branch naming: Feature branches (no strict convention enforced)
- Commit messages: Descriptive, no strict format required
- PR requirements: Code review, tests passing, linting passing

**Environment Variables:**

- `.env.local` for local development (gitignored)
- `.env.example` for required variables documentation
- Use `process.env` with proper typing

**Database Migrations:**

- Use Prisma migrations: `prisma migrate dev`
- Never edit migration files after creation
- Test migrations on test database before production

### Critical Don't-Miss Rules

**MANDATORY Patterns (Will Break if Violated):**

1. **Server Actions**: MUST use `executeSafeAction` - direct returns or throws will break authentication
2. **Ant Design**: NO Tailwind classes - will conflict with Ant Design styles
3. **JSONB Validation**: MUST validate all JSONB content with Zod schemas - runtime errors if skipped
4. **Vertical Slice**: MUST organize by feature - technical layer organization breaks module boundaries
5. **TypeScript Strict**: No `any` without explicit reason - will fail type checking

**Anti-Patterns to Avoid:**

- ❌ **Direct Server Action Returns**: `return data` instead of `executeSafeAction` wrapper
- ❌ **Throwing in Server Actions**: `throw new Error()` instead of returning error response
- ❌ **Tailwind Classes**: `className="flex items-center"` instead of Ant Design `<Flex>`
- ❌ **Raw Colors**: `style={{ color: '#1E3A5F' }}` instead of theme tokens
- ❌ **Technical Layer Organization**: `src/components/`, `src/services/` instead of `src/modules/{feature}/`
- ❌ **Circular Dependencies**: Module A imports Module B, Module B imports Module A
- ❌ **Unvalidated JSONB**: Direct Prisma JSONB access without Zod schema validation
- ❌ **Missing Hán Việt**: Kanji data without `han_viet` field (required for Vietnamese learners)

**Edge Cases to Handle:**

- **Offline Mode**: All Server Actions must degrade gracefully when offline
- **Authentication**: Always check `userId` in Server Actions (executeSafeAction handles this)
- **Error Messages**: Never expose internal errors to users - use user-friendly messages
- **Loading States**: Always show loading indicators for async operations
- **Validation Errors**: Return `validationErrors` in ApiResponse for form validation

**Security Rules:**

- **Input Validation**: All Server Action inputs MUST be validated with Zod schemas
- **SQL Injection**: Use Prisma queries (never raw SQL strings)
- **XSS Prevention**: Use React's automatic escaping, never `dangerouslySetInnerHTML`
- **Authentication**: Never trust client-side auth state - always verify server-side

**Performance Rules:**

- **Algorithm Queries**: Must complete in <500ms (use caching if needed)
- **Graph Operations**: Must complete in <200ms (limit to 50 nodes)
- **Image Optimization**: Use Next.js Image component for all images
- **Code Splitting**: Use dynamic imports for heavy components (Three.js, force-graph)
- **Database Queries**: Avoid N+1 queries - use Prisma `include` for relations

**Vietnamese-First Requirements:**

- **Hán Việt Data**: All kanji-related content MUST include `han_viet` field
- **Localization**: All user-facing strings MUST use `useTranslations()` hook
- **Cultural Context**: Examples and mnemonics should consider Vietnamese cultural context
- **Language Toggle**: Support Vietnamese and English interface languages

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge during implementation

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time
- Add new rules when common mistakes are discovered

**Maintenance:**

- Last Updated: 2025-12-31
- Review Schedule: Quarterly
- Update Trigger: Technology stack changes, new patterns discovered, common mistakes identified
