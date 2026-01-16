# Contextual Story Reader Module

**Module Path:** `src/modules/priming/`  
**Feature:** Interactive Japanese language learning through native-language stories with embedded vocabulary  
**Status:** ✅ Phase 1 Complete (Ready for Testing)

---

## 📖 Overview

The Contextual Story Reader is a **Vietnamese-first** feature that helps learners acquire Japanese vocabulary naturally by reading stories in their native language (Vietnamese/English) with highlighted Japanese words. Users **guess the meaning from context** before clicking to confirm, creating a powerful **priming effect** for memory retention.

### Key Innovation: Collection Mechanics

Unlike traditional flashcards, this feature gamifies vocabulary learning:

- 🎯 **Click to collect** Japanese words embedded in stories
- 🏆 **Track progress** (e.g., 8/12 words collected)
- 🎉 **Complete the story** to add all words to your flashcard deck
- 📊 **Auto-save progress** every 30 seconds

---

## 🏗️ Architecture

### Vertical Slice Organization

```
src/modules/priming/
├── actions.ts                 # Server Actions (Next.js 16 App Router)
├── data.ts                    # Prisma queries (data access layer)
├── services.ts                # Business logic (pure functions, testable)
├── types.ts                   # TypeScript types + Zod schemas
├── components/
│   ├── WordPill.tsx           # Interactive vocabulary chip
│   ├── SmartTooltip.tsx       # Vocabulary details popup
│   ├── CollectionDrawer.tsx   # Progress tracking UI
│   ├── StoryReader.tsx        # Main container
│   └── index.ts               # Barrel exports
├── hooks/
│   ├── useStoryProgress.ts    # Zustand store for collection state
│   ├── useWordCollection.ts   # Click handling + audio
│   ├── useTextSegmentation.ts # Text parsing wrapper
│   └── index.ts               # Barrel exports
└── utils/
    ├── parseStoryText.ts      # Position-based text parser (CRITICAL)
    └── animationHelpers.ts    # Ghost animations + tooltips
```

### Layer Responsibilities

1. **Data Layer** (`data.ts`): Prisma queries, no business logic
2. **Services Layer** (`services.ts`): Pure functions, orchestrates data + business rules
3. **Actions Layer** (`actions.ts`): Next.js Server Actions with auth + validation
4. **Components Layer**: React components (hooks for logic extraction)

---

## 🔑 Core Features

### 1. Position-Based Text Parsing

**Problem:** String replacement fails when the same word appears multiple times.

**Solution:** Use `start_index` + `length` to precisely identify word occurrences.

```typescript
// Example: "先生 is called sensei. The 先生 teaches..."
// Without positions: BOTH instances highlighted the same way ❌
// With positions: First click highlights only the first 先生 ✅

export function parseStoryText(
	bodyText: string,
	vocabularies: VocabularyWithPositions[],
	locale: 'en' | 'vi' | 'ja',
): TextSegment[] {
	// Returns array of { type: 'text' | 'vocab', content, meta }
}
```

### 2. Smart Tooltip Positioning

Tooltip automatically adjusts position to avoid screen edges:

- Tries: top → bottom → right → left
- Calculates arrow position dynamically
- Respects `prefers-reduced-motion`

### 3. Auto-Save Progress

```typescript
useAutoSaveProgress(storyId, async (analytics, readTime, collectedWords) => {
	await updateStoryProgressAction({
		storyId,
		wordsCollected: collectedWords,
		readTimeSeconds: readTime,
		analytics,
	});
});
```

Runs every 30 seconds to prevent data loss.

### 4. Gamified Collection

- **Visual feedback**: Haptic vibration + sound effect on collection
- **Progress tracking**: "8/12 words collected"
- **Confetti celebration**: When all words collected
- **Drawer animation**: Words fly into collection drawer

---

## 📊 Data Model

### Database Schema (Prisma)

```prisma
model Story {
  id            String        @id @default(uuid())
  slug          String        @unique // URL-friendly: "mystery-room-pt1"
  unitId        String        @map("unit_id")
  unit          Deck          @relation(fields: [unitId], references: [id])

  // Multi-language content (JSONB)
  content       Json          // StoryContentSchema

  difficulty    String        // "N5", "N4", etc.
  category      String        // "Mystery", "Romance", etc.
  order         Int           // Part sequence (0, 1, 2...)
  readTimeMin   Int           // Estimated read time

  vocabularies  StoryVocabulary[]
  storyLogs     StoryLog[]

  contentStatus ContentStatus @default(AI_GENERATED)
  deletedAt     DateTime?
  createdAt     DateTime      @default(now())
}

model StoryVocabulary {
  id           String      @id @default(uuid())
  storyId      String      @map("story_id")
  story        Story       @relation(fields: [storyId], references: [id])
  vocabularyId String      @map("vocabulary_id")
  vocabulary   Vocabulary  @relation(fields: [vocabularyId], references: [id])

  // Position data (JSONB)
  positions    Json        // { en: [120], vi: [135], ja: [145] }

  // Denormalized for performance
  wordSurface  String      // "先生"
  wordReading  String      // "せんせい"
  wordLength   Int         // Character count

  createdAt    DateTime    @default(now())

  @@unique([storyId, vocabularyId])
}

model StoryLog {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  user            User      @relation(fields: [userId], references: [id])
  storyId         String    @map("story_id")
  story           Story     @relation(fields: [storyId], references: [id])

  wordsCollected  Int       // Number of words clicked
  totalWords      Int       // Total words in story
  readTimeSeconds Int       // Time spent reading

  // Analytics data (JSONB)
  analytics       Json      // StoryAnalyticsSchema

  completedAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @default(now()) @updatedAt

  @@unique([userId, storyId])
}
```

### JSONB Schemas (Zod)

```typescript
export const StoryContentSchema = z.object({
	title: z.object({
		en: z.string(),
		vi: z.string(),
		ja: z.string().optional(),
	}),
	body_text: z.object({
		en: z.string(),
		vi: z.string(),
		ja: z.string(),
	}),
	translation: z.object({
		en: z.string(),
		vi: z.string(),
	}),
});

export const StoryAnalyticsSchema = z.object({
	clicked_words: z.array(z.string().uuid()), // Vocabulary IDs
	translation_used: z.boolean(),
	paused_at: z.array(z.number()), // Timestamps when user paused
	audio_plays: z.number(),
	reading_language: z.enum(['en', 'vi']),
});
```

---

## 🎨 Component API

### StoryReader (Main Container)

```tsx
import { StoryReader } from '@/modules/priming/components';

<StoryReader
	story={storyWithVocabularies}
	locale="en" // or "vi", "ja"
	onComplete={() => router.push('/stories')}
/>;
```

**Features:**

- Parses story text into segments
- Manages collection state (Zustand)
- Handles word clicks + tooltip display
- Auto-saves progress every 30s
- Displays CollectionDrawer

### WordPill (Interactive Chip)

```tsx
<WordPill
	vocab={vocabMeta}
	isCollected={false}
	onClick={(e, vocabId) => handleClick(vocabId)}
	onOpenTooltip={(vocab, anchor) => setTooltip({ vocab, anchor })}
/>
```

**States:**

- **Uncollected**: Green highlight + dotted underline
- **Collected**: Purple highlight + checkmark badge
- **Hover**: Lift effect + box shadow
- **Pressed**: Scale down animation

### SmartTooltip (Vocabulary Details)

```tsx
<SmartTooltip
	vocab={vocabMeta}
	anchorElement={pillElement}
	isCollected={isCollected}
	onClose={() => setTooltip(null)}
	onAudioPlay={(vocabId) => trackAudioPlay(vocabId)}
/>
```

**Displays:**

- Kanji/Kana word surface (大きな font)
- Reading (Romaji/Furigana)
- English meaning
- Vietnamese meaning
- **Hán Việt** (highlighted for Vietnamese learners)
- Audio playback button

### CollectionDrawer (Progress Panel)

```tsx
<CollectionDrawer
	collectedWords={[vocabMeta1, vocabMeta2]}
	totalWords={12}
	isExpanded={true}
	onToggle={() => setExpanded(!expanded)}
	onCompleteStory={() => submitStory()}
/>
```

**Features:**

- Sticky bottom panel
- Grid of collected words (with empty slots)
- Progress circle (8/12 = 66%)
- Confetti animation on completion
- Complete button (only when 100%)

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)

```bash
pnpm test src/modules/priming/utils/parseStoryText.test.ts
```

**Test Cases:**

- Position-based parsing with repeated words
- Overlapping position detection
- Multi-language text segmentation
- Edge cases (empty story, no vocabularies)

### Integration Tests (Playwright)

```bash
pnpm test:e2e e2e/story-reading-flow.spec.ts
```

**User Flows:**

1. Open story → Click word → See tooltip → Collect word
2. Collect all words → Click complete → Verify flashcards added
3. Auto-save progress → Refresh page → Resume reading
4. Toggle translation → Track analytics event

---

## 🚀 Quick Start Guide

### 1. Run Database Migration

```bash
npx prisma migrate dev --name add_contextual_story_reader
npx prisma generate
```

### 2. Create Test Story (Manual)

```typescript
import { bulkCreateStoryVocabularies, createStory } from '@/modules/priming/data';

const story = await createStory({
	slug: 'test-story-pt1',
	unitId: 'your-deck-id',
	order: 0,
	difficulty: 'N5',
	category: 'Test',
	readTimeMin: 5,
	content: {
		title: { en: 'Test Story', vi: 'Câu chuyện thử nghiệm' },
		body_text: {
			en: 'The 先生 (teacher) is kind. The 先生 teaches Japanese.',
			vi: 'Thầy giáo rất tốt bụng. Thầy giáo dạy tiếng Nhật.',
			ja: '先生は優しいです。先生は日本語を教えます。',
		},
		translation: {
			en: 'The teacher is kind. The teacher teaches Japanese.',
			vi: 'Thầy giáo rất tốt bụng. Thầy giáo dạy tiếng Nhật.',
		},
	},
});

// Add vocabulary (assuming "先生" vocabulary exists)
await bulkCreateStoryVocabularies([
	{
		storyId: story.id,
		vocabularyId: 'sensei-vocab-id',
		wordSurface: '先生',
		wordReading: 'せんせい',
		wordLength: 2,
		positions: {
			en: [4], // Position in English text
			vi: [0], // Position in Vietnamese text
			ja: [0, 12], // Two occurrences in Japanese text
		},
	},
]);
```

### 3. Navigate to Story

```
http://localhost:3000/stories/test-story-pt1
```

---

## 📚 API Reference

### Server Actions

#### `getStoryAction(input: { slug: string, language: 'en' | 'vi' })`

Returns story with vocabularies + user progress.

```typescript
const result = await getStoryAction({ slug: 'mystery-room-pt1', language: 'en' });
// result.data = { story, hasRead, progress }
```

#### `updateStoryProgressAction(input: UpdateStoryProgressInput)`

Auto-save reading progress (called every 30s).

```typescript
await updateStoryProgressAction({
	storyId: 'uuid',
	wordsCollected: 8,
	readTimeSeconds: 120,
	analytics: {
		clicked_words: ['vocab-id-1', 'vocab-id-2'],
		translation_used: false,
		paused_at: [60],
		audio_plays: 3,
		reading_language: 'en',
	},
});
```

#### `completeStoryAction(input: CompleteStoryInput)`

Mark story complete + add words to flashcard deck.

```typescript
const result = await completeStoryAction({
	storyId: 'uuid',
	totalWords: 12,
	readTimeSeconds: 300,
	analytics: {
		/* ... */
	},
});
// result.data = { newCardsAdded: 5, existingCards: 7 }
```

---

## 🎯 Smart CUBE Integration

This feature aligns with WatashiWa's **Smart CUBE** learning methodology:

1. **Context (C)**: Stories provide rich context for vocabulary
2. **Understanding (U)**: Users guess meaning before clicking
3. **Blocking (B)**: Hán Việt helps Vietnamese learners connect to prior knowledge
4. **Encoding (E)**: Collection mechanics create memorable learning moments

---

## 🌍 Vietnamese-First Design

- **Hán Việt displayed prominently** in tooltip (purple highlight)
- **Vietnamese translation** always available
- **Native language first** (stories in Vietnamese, Japanese embedded)

---

## 🐛 Known Issues & Limitations

1. **No Audio Files Yet**: Falls back to Web Speech API (TTS)
2. **No Mobile Optimization**: Works but not polished for mobile
3. **No Offline Support**: Requires network for story loading
4. **No Story Recommendation**: Phase 2 feature

---

## 📞 Support & Questions

**Module Owner:** Senior Full-Stack Engineer  
**Last Updated:** January 16, 2026

For questions or issues, check:

1. `IMPLEMENTATION_STATUS.md` for detailed progress tracking
2. `PRD.md` for product requirements
3. `DESIGN_CONTEXT.md` for UX specifications
