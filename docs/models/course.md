# Course

**Generated:** 2025-12-29
**Part of:** [Data Models Documentation](./index.md)
**Source:** `prisma/schema.prisma`

---


**Purpose:** Learning paths (collections of decks)

**Key Fields:**

- `id` (UUID, Primary Key)
- `slug` (String, Unique)
- `title` (String)
- `titleEn` (String, Optional)
- `description` (String, Optional)
- `descriptionEn` (String, Optional)
- `isPublic` (Boolean, Default: false)
- `headerImage` (String, Optional)
- `level` (String, Optional)
- `tags` (String[])
- `authorId` (UUID, Foreign Key → User)
- `deletedAt` (DateTime, Optional) - Soft delete

**Relations:**

- `decks` → CourseDeck[] (via junction table)

**Indexes:**

- `authorId`
- `slug`

---


---

## Related Documentation

- [Data Models Index](./index.md) - All data models
- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions
