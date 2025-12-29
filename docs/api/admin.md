# Admin Module Actions

**Generated:** 2025-12-29
**Part of:** [API Contracts Documentation](./index.md)

---


**File:** `src/modules/admin/admin.actions.ts`

### `getAdminStats`

Get admin statistics.

**Returns:** `AdminStats`

### `getAllUsers`

Get all users (admin).

**Returns:** `User[]`

### `updateUserRole`

Update user role (admin).

**Input:**

```typescript
targetUserId: string
newRole: UserRole
```

**Returns:** `{ success: boolean, error?: string }`

---


---

## Related Documentation

- [API Contracts Index](./index.md) - All API documentation
- [Architecture](../architecture.md) - System architecture
- [Data Models](../models/index.md) - Database schema
