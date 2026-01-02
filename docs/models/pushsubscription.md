# PushSubscription

**Generated:** 2025-12-29
**Part of:** [Data Models Documentation](./index.md)
**Source:** `prisma/schema.prisma`

---

**Purpose:** Web push notification subscriptions

**Key Fields:**

- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → User)
- `endpoint` (String, Unique)
- `p256dh` (String)
- `auth` (String)
- `userAgent` (String, Optional)
- `failedCount` (Int, Default: 0)

**Indexes:**

- `userId`

---

---

## Related Documentation

- [Data Models Index](./index.md) - All data models
- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions
