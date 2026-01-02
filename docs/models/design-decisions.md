# Database Design Decisions

**Generated:** 2025-12-29
**Part of:** [Data Models Documentation](./index.md)
**Source:** `prisma/schema.prisma`

---

### Soft Deletes

Most models use `deletedAt` (DateTime, Optional) instead of hard deletes:

- Vocabulary
- Deck
- Course
- User

### Content Lifecycle

Vocabulary and CardVariant use `ContentStatus` enum:

- DRAFT → Created manually, incomplete
- AI_GENERATED → Created by script, needs human review
- FLAGGED → User reported error, needs review
- VERIFIED → Human approved (safe for beta users)
- PUBLISHED → Live in production (safe for everyone)

### Hybrid SQL Approach

- **Relational:** User data, relationships, foreign keys
- **JSONB:** Dynamic content (stories, variants, mnemonics, examples)

### Indexing Strategy

- Foreign keys indexed
- Composite indexes for common queries:
  - `userId, nextReviewAt` - Get due cards
  - `userId, srsStage` - Get learning breakdown
  - `userId, date` - Daily stats lookup
- Unique constraints where needed (email, slug, etc.)

---

---

## Related Documentation

- [Data Models Index](./index.md) - All data models
- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions
