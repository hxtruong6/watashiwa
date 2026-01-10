# Furigana Mapping Design

## Overview

Precise kanji-only furigana rendering requires mapping each kanji character to its specific reading segment. This document describes the database schema and implementation.

## Problem

For words like "休みます" (yasumimasu):

- **Current approach**: Shows "やすみます" above entire word → duplicates "みます"
- **Desired approach**: Shows "やす" only above "休", nothing above "みます"

## Database Schema

### Prisma Schema Addition

```prisma
model Vocabulary {
  // ... existing fields ...
  
  // Furigana Mapping (Precise kanji-reading alignment)
  furiganaMapping Json? @map("furigana_mapping")
}
```

### JSONB Structure

```typescript
{
  mappings: [
    {
      kanji: "休",           // The kanji character(s)
      reading: "やす",        // Reading segment for this kanji
      surfaceIndex: 0,      // Position in wordSurface
      readingStart: 0,       // Start position in wordReading
      readingEnd: 2          // End position in wordReading (exclusive)
    }
  ]
}
```

### Example Data

**Word**: "休みます"  
**Reading**: "やすみます"  
**Mapping**:

```json
{
  "mappings": [
    {
      "kanji": "休",
      "reading": "やす",
      "surfaceIndex": 0,
      "readingStart": 0,
      "readingEnd": 2
    }
  ]
}
```

**Result**: Only "やす" appears above "休", "みます" has no furigana.

## Implementation

### 1. Schema Definition (`src/lib/schemas/jsonb.ts`)

```typescript
export const FuriganaMappingItemSchema = z.object({
  kanji: z.string().min(1),
  reading: z.string().min(1),
  surfaceIndex: z.number().int().nonnegative(),
  readingStart: z.number().int().nonnegative(),
  readingEnd: z.number().int().positive(),
});

export const FuriganaMappingSchema = z.object({
  mappings: z.array(FuriganaMappingItemSchema),
});
```

### 2. Generation Utility (`src/lib/utils/furigana.ts`)

- `generateFuriganaMapping()`: Auto-generates mapping from wordSurface + wordReading
- `renderFurigana()`: Converts mapping to renderable structure

### 3. Frontend Usage

```tsx
import { renderFurigana } from '@/lib/utils/furigana';

const segments = renderFurigana(wordSurface, furiganaMapping);

segments.map((segment, i) => (
  segment.isKanji && segment.reading ? (
    <ruby key={i}>
      {segment.text}
      <rt>{segment.reading}</rt>
    </ruby>
  ) : (
    <span key={i}>{segment.text}</span>
  )
))
```

## Migration Strategy

### Option 1: Auto-Generate on Read (Recommended for MVP)

- Generate mapping on-the-fly when `furiganaMapping` is null
- Cache in component state
- No database migration needed initially

### Option 2: Backfill Script

```typescript
// Migration script to populate existing data
async function backfillFuriganaMappings() {
  const vocabularies = await prisma.vocabulary.findMany({
    where: { furiganaMapping: null },
    select: { id: true, wordSurface: true, wordReading: true },
  });

  for (const vocab of vocabularies) {
    const mapping = generateFuriganaMapping(vocab.wordSurface, vocab.wordReading);
    if (mapping) {
      await prisma.vocabulary.update({
        where: { id: vocab.id },
        data: { furiganaMapping: mapping },
      });
    }
  }
}
```

### Option 3: Generate on Create/Update

- Auto-generate mapping when vocabulary is created/updated
- Store in database for performance
- Manual override available for complex cases

## Complex Cases

### Multiple Kanji

**Word**: "大学生" (daigakusei)  
**Reading**: "だいがくせい"  
**Mapping**:

```json
{
  "mappings": [
    { "kanji": "大", "reading": "だい", "surfaceIndex": 0, "readingStart": 0, "readingEnd": 2 },
    { "kanji": "学", "reading": "がく", "surfaceIndex": 1, "readingStart": 2, "readingEnd": 4 },
    { "kanji": "生", "reading": "せい", "surfaceIndex": 2, "readingStart": 4, "readingEnd": 6 }
  ]
}
```

### Compound Kanji

**Word**: "休憩" (kyuukei)  
**Reading**: "きゅうけい"  
**Mapping**:

```json
{
  "mappings": [
    { "kanji": "休", "reading": "きゅう", "surfaceIndex": 0, "readingStart": 0, "readingEnd": 3 },
    { "kanji": "憩", "reading": "けい", "surfaceIndex": 1, "readingStart": 3, "readingEnd": 5 }
  ]
}
```

## Validation

The auto-generation algorithm works for:

- ✅ Simple kanji + kana words (休みます)
- ✅ Multiple kanji words (大学生)
- ✅ Kanji-only words (箸)

May need manual correction for:

- ⚠️ Irregular readings
- ⚠️ Words with okurigana variations
- ⚠️ Compound words with non-linear mappings

## Performance

- **Storage**: ~50-200 bytes per vocabulary (JSONB is efficient)
- **Generation**: O(n) where n = word length
- **Rendering**: O(n) where n = segments
- **Caching**: Can cache generated mappings in component state

## Future Enhancements

1. **Manual Override UI**: Allow admins to correct auto-generated mappings
2. **ML-Based Alignment**: Use NLP to improve accuracy for complex cases
3. **Reading Database**: Reference common kanji readings for validation
4. **Batch Processing**: Generate mappings for all existing vocabularies
