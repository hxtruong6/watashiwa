# Development Guide

**Generated:** 2025-12-30  
**Last Updated:** 2025-12-30

---

## Prerequisites

- **Node.js:** 22+ (LTS recommended)
- **Package Manager:** pnpm (recommended) or npm
- **Database:** PostgreSQL 17+ (local or remote)
- **Supabase Account:** For authentication (free tier works)

---

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd watashi-jp
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/watashiwa"

# Supabase (Authentication)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Optional: Analytics & Monitoring
NEXT_PUBLIC_POSTHOG_KEY="your-posthog-key"
NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
SENTRY_DSN="your-sentry-dsn"

# Optional: Cron Jobs
CRON_SECRET="your-secret-key"

# Optional: Google Cloud Storage (for file uploads)
GOOGLE_CLOUD_STORAGE_BUCKET="your-bucket-name"
GOOGLE_APPLICATION_CREDENTIALS="path-to-credentials.json"
```

### 4. Database Setup

**Generate Prisma Client:**

```bash
pnpm db:generate
```

**Push Schema to Database:**

```bash
pnpm db:push
```

**Or Run Migrations:**

```bash
pnpm db:migrate
```

**Optional: Seed Database**

```bash
pnpm db:seed
```

### 5. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

---

## Development Workflow

### Running Development Server

```bash
pnpm dev
```

Uses Next.js Turbopack for faster builds.

### Type Checking

```bash
pnpm type-check
```

Runs TypeScript compiler without emitting files.

### Linting

```bash
pnpm lint
```

Runs ESLint to check code quality.

### Formatting

```bash
# Format all files
pnpm format

# Check formatting
pnpm check-format
```

---

## Database Operations

### Generate Prisma Client

After schema changes:

```bash
pnpm db:generate
```

### Push Schema Changes

For development (non-production):

```bash
pnpm db:push
```

### Create Migration

For production:

```bash
npx prisma migrate dev --name migration_name
```

### View Database

Open Prisma Studio:

```bash
pnpm db:studio
```

### Seed Database

```bash
pnpm db:seed
```

---

## Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Run once (CI mode)
pnpm test:run
```

### Integration Tests

**Setup Test Database:**

```bash
pnpm test:db:setup
```

This command:

1. Starts PostgreSQL in Docker
2. Creates test database
3. Pushes schema

**Run Integration Tests:**

```bash
pnpm test:integration
```

**Teardown Test Database:**

```bash
pnpm test:db:teardown
```

### E2E Tests

```bash
# Run E2E tests
pnpm e2e

# Run with UI
pnpm e2e:ui
```

**Note:** Requires application to be running.

---

## Building for Production

### Build Application

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

### Deploy with PM2

```bash
pnpm pm2:deploy:prod
```

---

## Code Organization

### Adding a New Feature

1. **Create Module Directory:**

   ```
   src/modules/{feature-name}/
   ├── components/
   ├── actions.ts
   ├── data.ts
   ├── services.ts
   ├── types.ts
   └── utils/
   ```

2. **Follow Patterns:**
   - Server Actions in `actions.ts`
   - Business logic in `services.ts`
   - Data access in `data.ts`
   - Types in `types.ts`

3. **Create Route:**

   ```
   src/app/{route}/page.tsx
   ```

### Module Dependencies

**Remember:**

- High-level modules can import from low-level
- Never reverse dependencies
- Shared utilities go in `lib/`

**Example:**

- ✅ `study` module can import from `flashcard` module
- ❌ `flashcard` module should NOT import from `study` module

---

## Common Tasks

### Adding a New Server Action

1. Open `src/modules/{module}/actions.ts`
2. Add function:

   ```typescript
   'use server';
   
   import { executeSafeAction } from '@/modules/core/action-client';
   import { z } from 'zod';
   
   export async function myAction(input: unknown) {
     return executeSafeAction(
       MySchema,
       input,
       async (data, { userId }) => {
         // Implementation
         return result;
       }
     );
   }
   ```

### Adding a New Component

1. Create file in `src/modules/{module}/components/`
2. Decide: Server Component (default) or Client Component (`'use client'`)
3. Import from module, not from global `components/`

### Adding a New Database Model

1. Edit `prisma/schema.prisma`
2. Run `pnpm db:generate`
3. Run `pnpm db:push` (dev) or create migration (prod)

---

## Debugging

### Database Queries

Use Prisma Studio:

```bash
pnpm db:studio
```

### Server Actions

Add `console.log` statements (removed in production via Next.js config).

### Client Components

Use browser DevTools and React DevTools.

### Type Errors

Run type checking:

```bash
pnpm type-check
```

---

## Environment Variables

### Required

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

### Optional

- `SUPABASE_SERVICE_ROLE_KEY` - For admin operations
- `NEXT_PUBLIC_POSTHOG_KEY` - Analytics
- `SENTRY_DSN` - Error monitoring
- `CRON_SECRET` - Cron job authentication
- `GOOGLE_CLOUD_STORAGE_BUCKET` - File uploads

---

## Troubleshooting

### Database Connection Issues

1. Check `DATABASE_URL` format
2. Verify PostgreSQL is running
3. Check network/firewall settings

### Prisma Client Not Found

Run:

```bash
pnpm db:generate
```

### Type Errors After Schema Change

1. Run `pnpm db:generate`
2. Restart TypeScript server in IDE
3. Run `pnpm type-check`

### Build Failures

1. Clear `.next` directory: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && pnpm install`
3. Regenerate Prisma: `pnpm db:generate`

---

## Best Practices

### Server Actions

- Always use `executeSafeAction` wrapper
- Validate input with Zod schemas
- Return consistent `{ success, data, error }` format
- Handle errors gracefully

### Components

- Prefer Server Components (default)
- Use Client Components only for interactivity
- Keep pages thin (data fetching only)
- Extract logic to hooks or services

### Database

- Use Prisma for all database access
- Never write raw SQL (unless absolutely necessary)
- Use transactions for multi-step operations
- Index frequently queried fields

### Testing

- Write unit tests for business logic
- Write integration tests for data operations
- Write E2E tests for critical flows
- Keep tests fast and isolated

---

## Related Documentation

- [Architecture](./architecture.md) - System architecture
- [API Contracts](./api/index.md) - Server actions reference
- [Data Models](./models/index.md) - Database schema
- [Testing Strategy](./testing_strategy.md) - Testing guidelines

---

## Getting Help

- Check existing documentation in `docs/`
- Review code examples in `src/modules/`
- Check Prisma documentation for database questions
- Check Next.js documentation for framework questions
