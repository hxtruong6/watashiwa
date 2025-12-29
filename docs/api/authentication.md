# Authentication

**Generated:** 2025-12-29
**Part of:** [API Contracts Documentation](./index.md)

---


### Server Actions

All Server Actions use `executeSafeAction` which:

1. Checks authentication (unless `requireAuth: false`)
2. Validates input with Zod schema
3. Executes handler with typed input and `{ userId }` context
4. Returns consistent response format

### API Routes

API routes manually check authentication using `getUser()` from `@/modules/auth/auth.actions`.

---


---

## Related Documentation

- [API Contracts Index](./index.md) - All API documentation
- [Architecture](../architecture.md) - System architecture
- [Data Models](../models/index.md) - Database schema
