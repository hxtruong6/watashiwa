# API Contracts Documentation

**Generated:** 2025-12-29  
**Pattern:** Server Actions (Preferred) + API Routes (Special Cases)

---

## Overview

WatashiWa uses **Server Actions** as the primary API pattern, with API Routes reserved for special cases like webhooks and external integrations. All Server Actions use the `executeSafeAction` wrapper for authentication and validation.

---

## Server Actions Pattern

### Core Pattern

**Location:** `src/modules/{module}/actions.ts`

**Wrapper:** `src/modules/core/action-client.ts`

```typescript
'use server';

import { executeSafeAction } from '@/modules/core/action-client';
import { z } from 'zod';

export async function actionName(input: unknown) {
	return executeSafeAction(InputSchema, input, async (data, { userId }) => {
		// Business logic
		return result;
	});
}
```

**Response Format:**

```typescript
{
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: Record<string, string[]>;
}
```

---

## Module Actions

- **[Study Module](./study.md)** - Study session and review actions
- **[Flashcard Module](./flashcard.md)** - Card fetching and session management
- **[Auth Module](./auth.md)** - Authentication and user sync
- **[Deck Module](./deck.md)** - Deck management
- **[Course Module](./course.md)** - Course management
- **[Vocabulary Module](./vocabulary.md)** - Content management
- **[Priming Module](./priming.md)** - Active priming stories
- **[Dashboard Module](./dashboard.md)** - Dashboard data
- **[Memory Garden](./memory-garden.md)** - 3D visualization data
- **[Community Module](./community.md)** - Comments and social features
- **[User Module](./user.md)** - User settings and preferences
- **[Admin Module](./admin.md)** - Admin operations
- **[Report Module](./report.md)** - Content reporting
- **[Analytics Module](./analytics.md)** - Analytics logging

---

## API Routes

- **[API Routes](./routes.md)** - Special API endpoints (webhooks, notifications)

---

## Common Patterns

- **[Authentication](./authentication.md)** - Auth patterns for Server Actions and API Routes
- **[Error Handling](./error-handling.md)** - Error handling patterns

---

## Related Documentation

- [Architecture](../architecture.md) - System architecture and patterns
- [Data Models](../models/index.md) - Database schema
- [Development Guide](../development-guide.md) - Setup and development
