# ReviewLog

**Generated:** 2025-12-29
**Part of:** [Data Models Documentation](./index.md)
**Source:** `prisma/schema.prisma`

---


**Purpose:** Review history and analytics

**Key Fields:**

- `id` (UUID, Primary Key)
- `reviewId` (UUID, Foreign Key → UserReview)
- `userId` (UUID, Foreign Key → User)
- `rating` (Int) - 1=Again, 2=Hard, 3=Good, 4=Easy
- `reviewDate` (DateTime)
- `duration` (Int) - Time taken in milliseconds
- `scheduledDays` (Int)
- `elapsedDays` (Int)
- `state` (Int) - State BEFORE review

**Indexes:**

- `reviewId`
- `reviewDate`
- `userId`

---


---

## Related Documentation

- [Data Models Index](./index.md) - All data models
- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions
