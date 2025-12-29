# CardReport

**Generated:** 2025-12-29
**Part of:** [Data Models Documentation](./index.md)
**Source:** `prisma/schema.prisma`

---


**Purpose:** Content reporting system

**Key Fields:**

- `id` (UUID, Primary Key)
- `vocabId` (UUID, Foreign Key → Vocabulary)
- `reporterId` (UUID, Foreign Key → User)
- `type` (ReportType)
  - INCORRECT_READING
  - INCORRECT_MEANING
  - INCORRECT_HAN_VIET
  - TYPO
  - MISSING_AUDIO
  - WRONG_EXAMPLE
  - DUPLICATE
  - OTHER
- `field` (String, Optional)
- `currentValue` (String, Optional)
- `suggestedValue` (String, Optional)
- `notes` (String, Optional)
- `status` (ReportStatus, Default: PENDING)
  - PENDING
  - ACCEPTED
  - REJECTED
  - DUPLICATE
- `resolvedById` (UUID, Optional, Foreign Key → User)
- `resolution` (String, Optional)
- `resolvedAt` (DateTime, Optional)

**Indexes:**

- `status`

---


---

## Related Documentation

- [Data Models Index](./index.md) - All data models
- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions
