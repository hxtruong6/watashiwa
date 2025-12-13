# Technical Specification

## 1. Tech Stack

- **Frontend:** Next.js (App Router), React, Ant Design (antd), pnpm
- **Backend:** Next.js API Routes (Serverless functions). Python (Optional for complex NLP tasks if Node.js SDK is insufficient, otherwise Node.js preferred for simplicity).
- **Database:** PostgreSQL (via Supabase).
- **ORM:** Prisma.
- **AI/LLM:** OpenAI API (GPT-4o or GPT-3.5-turbo).
- **SRS Algorithm:** `ts-fsrs` (Free Spaced Repetition Scheduler).
- **Audio:** Web Speech API (`SpeechSynthesisUtterance`) for MVP.

## 2. Architecture Overview

The application follows a standard Next.js Serverless architecture.

- **Client:** React components handle UI and state. Fetches data via SWR or React Query.
- **API Layer:** `/app/api/...` endpoints handle secure database operations and AI calls.
- **Database:** Hosted PostgreSQL.

## 3. Data Model

### Prisma Schema (`schema.prisma`)

```prisma
// Content Hierarchy
model Course {
  id          String       @id @default(uuid())
  title       String
  description String?
  isPublic    Boolean      @default(false)
  authorId    String
  decks       CourseDeck[] // Relation to decks with ordering
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model CourseDeck {
  id        String   @id @default(uuid())
  courseId  String
  deckId    String
  sortOrder Int      @default(0)
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  deck      Deck     @relation(fields: [deckId], references: [id], onDelete: Cascade)

  @@unique([courseId, deckId])
}

model Deck {
  id          String   @id @default(uuid())
  title       String
  description String?
  isPublic    Boolean  @default(false)
  authorId    String
  vocab       Vocab[]
  kanji       Kanji[]
  courses     CourseDeck[]
}

// FSRS-compatible VocabCard
model VocabCard {
  id               String   @id @default(uuid())
  deckId           String?
  word_surface     String   // e.g., 学生
  reading_kana     String   // e.g., がくせい
  kanji_breakdown  Json     // e.g., [{"kanji": "学", "han_viet": "HỌC", "meaning": "study"}]
  han_viet         String   // e.g., HỌC SINH
  meaning          String   // Native definition
  example_sentence Json     // { "sentence": "...", "translation": "..." }

  // FSRS Fields (state tracked in separate StudyCard model for per-user progress, or here if single user MVP)
  // ... (Standard FSRS fields)
}

// User Progress
model StudyCard {
  id        String   @id @default(uuid())
  userId    String
  vocabId   String?
  deckId    String
  state     Int      @default(0) // 0=New, 1=Learning, 2=Review, 3=Relearning
  due       DateTime @default(now())
  stability Float    @default(0)
  difficulty Float   @default(0)
  // ...
}
```

## 4. API Design & Server Actions

We favor **Server Actions** for mutations to ensuring type safety and code co-location.

### Core Actions (`src/services/actions.ts`)

```typescript
// Review a card
type Rating = 1 | 2 | 3 | 4; // Again | Hard | Good | Easy
async function submitReview(
 cardId: string,
 rating: Rating,
): Promise<{ success: boolean; nextReview: Date }>;

// Create a new card (Admin/User)
async function createCard(data: {
 word_surface: string;
 reading_kana?: string; // Optional, can be auto-generated later
}): Promise<{ id: string; error?: string }>;

// Get Due Cards (for Dashboard)
// Get Due Cards (for Dashboard)
async function getDueCards(limit: number = 20): Promise<VocabCard[]>;

### Course & Deck Actions (`src/services/course-actions.ts`)

```typescript
// Course Management
async function createCourse(data: CreateCourseInput);
async function addDeckToCourse(courseId: string, deckId: string);
async function reorderDecks(courseId: string, deckIds: string[]);

// Fetching
async function getCourseWithUserProgress(courseId: string);
async function searchDecks(query: string);
```

```

### API Routes (Legacy/External handling)

- `POST /api/chat/grammar-check`: Streaming response for AI grammar checking.
