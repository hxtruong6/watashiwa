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
// FSRS-compatible VocabCard
model VocabCard {
  id               String   @id @default(uuid())
  word_surface     String   // e.g., 学生
  reading_kana     String   // e.g., がくせい
  kanji_breakdown  Json     // e.g., [{"kanji": "学", "han_viet": "HỌC", "meaning": "study"}]
  han_viet         String   // e.g., HỌC SINH
  meaning          String   // Native definition
  example_sentence Json     // { "sentence": "...", "translation": "..." }

  // FSRS Fields
  due           DateTime  @default(now()) // Next review date
  stability     Float     @default(0)     // Memory strength (days to 90% forget risk)
  difficulty    Float     @default(0)     // 1-10 scale
  elapsed_days  Int       @default(0)     // Days since last review
  scheduled_days Int      @default(0)     // Days scheduled for last interval
  reps          Int       @default(0)     // Total repetitions
  lapses        Int       @default(0)     // Total failures
  state         Int       @default(0)     // 0=New, 1=Learning, 2=Review, 3=Relearning
  last_review   DateTime?                 // Last review timestamp (optional but good for history)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model ReviewLog {
  id           String   @id @default(uuid())
  cardId       String
  rating       Int      // 1=Again, 2=Hard, 3=Good, 4=Easy
  review       DateTime @default(now())
  scheduled_days Int
  elapsed_days   Int
  state          Int

  // Relations if needed, strictly keeping it minimal for now
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
async function getDueCards(limit: number = 20): Promise<VocabCard[]>;
```

### API Routes (Legacy/External handling)

- `POST /api/chat/grammar-check`: Streaming response for AI grammar checking.
