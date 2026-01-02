# Auth Module Actions

**Generated:** 2025-12-29
**Part of:** [API Contracts Documentation](./index.md)

---

**File:** `src/modules/auth/auth.actions.ts`

### `getUser`

Get current authenticated user (cached).

**Returns:** `User | null`

**Note:** Wrapped in React `cache()` to ensure single request per render

### `syncUser`

Sync Supabase user with Prisma database.

**Returns:** `{ success: boolean, data?: User, error?: string }`

**Behavior:**

- Upserts user record
- Merges auth providers
- Sets primary auth provider

### `hasUserStudiedBefore`

Check if user has any study history.

**Input:**

```typescript
userId: string;
```

**Returns:** `boolean`

---

---

## Related Documentation

- [API Contracts Index](./index.md) - All API documentation
- [Architecture](../architecture.md) - System architecture
- [Data Models](../models/index.md) - Database schema
