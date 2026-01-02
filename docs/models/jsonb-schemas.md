# JSONB Schema Contracts

**Generated:** 2025-12-29
**Part of:** [Data Models Documentation](./index.md)
**Source:** `prisma/schema.prisma`

---

**Location:** `src/lib/schemas/jsonb.ts`

All JSONB fields have Zod schemas for type safety:

- `EtymologyData` - For Vocabulary.etymology
- `MeaningsData` - For Vocabulary.meanings
- `StoryContentSchema` - For Story.content
- `VariantPayloadSchema` - For CardVariant.contentPayload (varies by type)
- `ConfusionExplanationSchema` - For ConfusionPair.explanation

---

---

## Related Documentation

- [Data Models Index](./index.md) - All data models
- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions
