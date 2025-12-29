# ConfusionPair

**Generated:** 2025-12-29
**Part of:** [Data Models Documentation](./index.md)
**Source:** `prisma/schema.prisma`

---


**Purpose:** Interference shield (The Block)

**Key Fields:**

- `id` (UUID, Primary Key)
- `vocabId1` (UUID, Foreign Key → Vocabulary)
- `vocabId2` (UUID, Foreign Key → Vocabulary)
- `type` (ConfusionType, Default: HOMONYM)
  - HOMONYM - Same reading, different meaning (e.g., Hashi/Hashi)
  - LOOKALIKE - Visually or phonetically similar
  - SYNONYM - Similar meaning, different nuance
  - ANTONYM - Opposites often confused
  - GRAMMAR - Grammatical usage or politeness
- `explanation` (JSONB) - ConfusionExplanationSchema

  ```typescript
  {
    mnemonic: { vi: "..." },
    item1_nuance: "...",
    item2_nuance: "..."
  }
  ```

**Indexes:**

- `vocabId1`
- `vocabId2`

---


---

## Related Documentation

- [Data Models Index](./index.md) - All data models
- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions
