# CardComment

**Generated:** 2025-12-29
**Part of:** [Data Models Documentation](./index.md)
**Source:** `prisma/schema.prisma`

---


**Purpose:** Community comments on vocabulary

**Key Fields:**

- `id` (UUID, Primary Key)
- `vocabId` (UUID, Foreign Key → Vocabulary)
- `authorId` (UUID, Foreign Key → User)
- `content` (String)
- `type` (CommentType, Default: GENERAL)
  - MNEMONIC
  - USAGE_TIP
  - CULTURAL_NOTE
  - EXAMPLE
  - GRAMMAR
  - GENERAL
- `upvotes` (Int, Default: 0)
- `downvotes` (Int, Default: 0)
- `score` (Int, Default: 0)
- `isPinned` (Boolean, Default: false)
- `isHidden` (Boolean, Default: false)

**Relations:**

- `votes` → CommentVote[]

**Indexes:**

- `vocabId`

---


---

## Related Documentation

- [Data Models Index](./index.md) - All data models
- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions
