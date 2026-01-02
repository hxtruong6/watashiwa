# Vocabulary

**Generated:** 2025-12-29
**Part of:** [Data Models Documentation](./index.md)
**Source:** `prisma/schema.prisma`

---

**Purpose:** Core vocabulary content (The Anchor)

**Key Fields:**

- `id` (UUID, Primary Key)
- `deckId` (UUID, Foreign Key → Deck)
- `tags` (String[]) - Smart tagging (e.g., ["kanji", "n5", "noun"])
- `wordSurface` (String) - Kanji: 箸
- `wordReading` (String) - Hiragana: はし (Mandatory for sorting)
- `wordRomaji` (String, Optional) - hashi
- `hanViet` (String, Optional) - Hán Việt: TRỨ (Critical for Vietnamese)

**Pitch & Homonyms:**

- `pitchPattern` (Int, Optional) - 0=Heiban, 1=Atamadaka, 2=Nakadaka, etc.
- `pitchSvgPath` (String, Optional) - Visual line path for UI
- `homonymGroupId` (UUID, Optional) - Groups same-reading words

**Rich Data (JSONB):**

- `etymology` (JSONB) - EtymologyData schema

  ```typescript
  {
    parts: [{ kanji: "大", han_viet: "ĐẠI" }],
    note_vi: "..."
  }
  ```

- `meanings` (JSONB) - Object with language keys

  ```typescript
  {
    "vi": ["Đũa"],
    "en": ["Chopsticks", "Cutlery"]
  }
  ```

- `mnemonic` (JSONB, Optional) - Language-specific memory aids

  ```typescript
  {
    "vi": "...",
    "en": "..."
  }
  ```

- `examples` (JSONB) - Array of example objects

  ```typescript
  [
  	{
  		sentence: '...',
  		translation: { vi: '...', en: '...' },
  		audio: '...',
  	},
  ];
  ```

**Media:**

- `audioUrl` (String, Optional) - Custom audio (priority over TTS)
- `imageUrl` (String, Optional)

**Lifecycle:**

- `contentStatus` (ContentStatus, Default: DRAFT)
  - DRAFT → AI_GENERATED → FLAGGED → VERIFIED → PUBLISHED
- `verifiedAt` (DateTime, Optional)
- `verifiedBy` (String, Optional) - Admin/Intern ID

**Relations:**

- `variants` → CardVariant[]
- `confusionsAs1` → ConfusionPair[] (as vocab1)
- `confusionsAs2` → ConfusionPair[] (as vocab2)
- `userReviews` → UserReview[]
- `cardComments` → CardComment[]
- `cardReports` → CardReport[]

**Indexes:**

- `deckId`
- `contentStatus`
- `homonymGroupId`

---

---

## Related Documentation

- [Data Models Index](./index.md) - All data models
- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions
