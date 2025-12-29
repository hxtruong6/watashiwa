# Story

**Generated:** 2025-12-29
**Part of:** [Data Models Documentation](./index.md)
**Source:** `prisma/schema.prisma`

---


**Purpose:** Active priming (The Context)

**Key Fields:**

- `id` (UUID, Primary Key)
- `unitId` (UUID, Foreign Key → Deck)
- `content` (JSONB) - StoryContentSchema

  ```typescript
  {
    title: { vi: "..." },
    body_text: "...",
    highlights: [...]
  }
  ```

- `audioUrl` (String, Optional)
- `contentStatus` (ContentStatus, Default: AI_GENERATED)

**Relations:**

- `storyLogs` → StoryLog[]

**Indexes:**

- `unitId`
- `contentStatus`

---


---

## Related Documentation

- [Data Models Index](./index.md) - All data models
- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions
