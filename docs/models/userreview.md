# UserReview

**Generated:** 2025-12-29
**Part of:** [Data Models Documentation](./index.md)
**Source:** `prisma/schema.prisma`

---

**Purpose:** SRS algorithm state (The Memory)

**Key Fields:**

- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → User)
- `vocabId` (UUID, Foreign Key → Vocabulary)
- `srsStage` (Int, Default: 0)
  - 0 = New
  - 1 = Learning
  - 2 = Review
  - 3 = Relearning
- `nextReviewAt` (DateTime) - When card is due
- `stability` (Float, Default: 0) - Memory strength (days to forget)
- `difficulty` (Float, Default: 0) - Intrinsic difficulty
- `elapsedDays` (Int, Default: 0)
- `scheduledDays` (Int, Default: 0)
- `reps` (Int, Default: 0) - Total reviews
- `lapses` (Int, Default: 0) - Times forgotten
- `state` (Int, Default: 0) - Internal FSRS state
- `lastReview` (DateTime, Optional)

**Encoding (The 'E' in CUBE):**

- `personalAnchor` (String, Optional) - User's custom mnemonic
- `isFavorite` (Boolean, Default: false)

**Relations:**

- `reviewLogs` → ReviewLog[]

**Indexes:**

- `userId_vocabId` (Unique)
- `userId, nextReviewAt` (Composite) - For "Get my due cards"
- `userId, srsStage` (Composite) - For "Get my learning breakdown"

---

---

## Related Documentation

- [Data Models Index](./index.md) - All data models
- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions
