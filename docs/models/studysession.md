# StudySession

**Generated:** 2025-12-29
**Part of:** [Data Models Documentation](./index.md)
**Source:** `prisma/schema.prisma`

---


**Purpose:** Session persistence (Smart Queue Resume)

**Key Fields:**

- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → User)
- `queue` (JSONB) - Array of card IDs: ["uuid-1", "uuid-2"]
- `status` (SessionStatus, Default: ACTIVE)
  - ACTIVE
  - COMPLETED
  - ABANDONED
- `currentIndex` (Int, Default: 0)
- `startedAt` (DateTime)
- `expiresAt` (DateTime)

**Indexes:**

- `userId`

---


---

## Related Documentation

- [Data Models Index](./index.md) - All data models
- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions
