# CardVariant

**Generated:** 2025-12-29
**Part of:** [Data Models Documentation](./index.md)
**Source:** `prisma/schema.prisma`

---

**Purpose:** Dynamic card views (The Face)

**Key Fields:**

- `id` (UUID, Primary Key)
- `vocabId` (UUID, Foreign Key → Vocabulary)
- `variantType` (VariantType)
  - BASIC
  - CONTEXT_GAP_FILL
  - AUDIO_MATCH
  - INTERVENTION
- `contentPayload` (JSONB) - VariantPayloadSchema (varies by type)
- `contentStatus` (ContentStatus, Default: DRAFT)
- `verifiedAt` (DateTime, Optional)
- `verifiedBy` (String, Optional)

**Indexes:**

- `vocabId`
- `contentStatus`

---

---

## Related Documentation

- [Data Models Index](./index.md) - All data models
- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions
