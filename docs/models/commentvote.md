# CommentVote

**Generated:** 2025-12-29
**Part of:** [Data Models Documentation](./index.md)
**Source:** `prisma/schema.prisma`

---

**Purpose:** Comment voting

**Key Fields:**

- `id` (UUID, Primary Key)
- `commentId` (UUID, Foreign Key → CardComment)
- `userId` (UUID, Foreign Key → User)
- `value` (Int) - 1 (upvote) or -1 (downvote)

**Indexes:**

- `commentId, userId` (Unique)

---

---

## Related Documentation

- [Data Models Index](./index.md) - All data models
- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions
