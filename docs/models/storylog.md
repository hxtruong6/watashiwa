# StoryLog

**Generated:** 2025-12-29
**Part of:** [Data Models Documentation](./index.md)
**Source:** `prisma/schema.prisma`

---

**Purpose:** Track story reading progress

**Key Fields:**

- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → User)
- `storyId` (UUID, Foreign Key → Story)
- `completedAt` (DateTime)

**Indexes:**

- `userId, storyId` (Unique)
- `userId, completedAt` (Composite)
- `storyId`

---

---

## Related Documentation

- [Data Models Index](./index.md) - All data models
- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions
