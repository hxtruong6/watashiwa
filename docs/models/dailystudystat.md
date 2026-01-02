# DailyStudyStat

**Generated:** 2025-12-29
**Part of:** [Data Models Documentation](./index.md)
**Source:** `prisma/schema.prisma`

---

**Purpose:** Daily aggregation for heatmaps & reports

**Key Fields:**

- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → User)
- `date` (Date) - Stored as YYYY-MM-DD
- `cardsReviewed` (Int, Default: 0)
- `newCardsLearned` (Int, Default: 0)
- `reviewDurationMs` (Int, Default: 0)
- `correctCount` (Int, Default: 0)

**Indexes:**

- `userId, date` (Unique)
- `userId`

---

---

## Related Documentation

- [Data Models Index](./index.md) - All data models
- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions
