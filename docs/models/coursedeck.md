# CourseDeck

**Generated:** 2025-12-29
**Part of:** [Data Models Documentation](./index.md)
**Source:** `prisma/schema.prisma`

---

**Purpose:** Junction table for Course ↔ Deck relationship

**Key Fields:**

- `id` (UUID, Primary Key)
- `courseId` (UUID, Foreign Key → Course)
- `deckId` (UUID, Foreign Key → Deck)
- `sortOrder` (Int, Default: 0)

**Indexes:**

- `courseId, deckId` (Unique)
- `courseId`
- `deckId`

---

---

## Related Documentation

- [Data Models Index](./index.md) - All data models
- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions
