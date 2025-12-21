# Phase 1 Execution Plan: The Walking Skeleton

**Goal**: Build a functional app with the "Golden Dataset" (500 Verification-Ready Words).
**Strategy**: "Data Factory" First -> "Smart Layer" Second -> "Frontend" Third.

## SPRINT 1: The Foundation & Data Factory (Weeks 1-2)

**Theme**: *Build the machine that builds the content.*

### 1. Type Hardening & Infrastructure

- [ ] **Unified Types**: Create `src/types/schema.d.ts` that extends Prisma types with Zod validation types (e.g., `Vocabulary` + `EtymologyData`).
- [ ] **Validation Utils**: Ensure `src/lib/schemas/jsonb.ts` is accessible and strictly typed.

### 2. The "AI Factory" Pipeline

- [x] **Raw Data**: Create `seed/n5_raw.json` (50 basic words to start).
- [x] **Generator Script**: Build `scripts/generate_content.ts`.
  - Input: Raw word.
  - Process: Call OpenAI (GPT-4o) to generate Etymology, Context, Story, Confusions.
  - Output: JSON object matching strict Zod schemas.
- [x] **Validator**: Script validates AI output against `EtymologySchema`, `StoryContentSchema`, etc.
- [ ] **Seeding**: Robust `prisma seed` script to insert validated data.

### 3. Admin Verification (QA) - [NEXT STEP]

### 3. Admin Verification (QA) - [IN PROGRESS]

#### A. Frontend (UI/UX) - [COMPLETED]

- [x] **Verification Deck Component**: `VerificationDeck.tsx` & `VerificationCard.tsx`.
  - [x] "Tinder for Words" interface (Swipe/Stack).
  - [x] Keyboard Shortcuts (`→` Approve, `←` Reject, `Space` Audio, `E` Edit).
  - [x] Undo Action (Toast notification).
- [x] **Rich Data Visualization**:
  - [x] Pitch Accent (SVG + Fallback Tag).
  - [x] Interference Shield (Confusion Pair Highlighting).
  - [x] Etymology (Hán Việt breakdown).
  - [x] Color-coded Tags (N5, Verb, etc.).
- [x] **Deep Editing**: `EditVocabularyForm.tsx`.
  - [x] Edit complex JSON fields (`etymology`, `confusions`).
  - [x] Mobile-friendly sticky action bar.

#### B. Backend Integration (Server Actions) - [NEXT STEP]

- [x] **Data Fetching**:
  - [x] `getPendingContent`: Fetch `AI_GENERATED` items.
  - [x] `getVocabularyStats`: Stats for Dashboard.
- [x] **Actions**:
  - [x] `approveVocabulary`: Update status to `VERIFIED`.
  - [x] `rejectVocabulary`: Update status to `FLAGGED`.
  - [x] `saveAndApprove`: Save edits + Approve.

---

## SPRINT 2: The Logic (Smart Layer) (Week 3)

**Theme**: *The Brain.*

### 1. FSRS & Scheduling

- [x] **Algorithm**: Implement pure FSRS logic (Next Review Date calc) -> `study.service.ts`.
- [x] **Session Engine**: `getNextBatch(userId)` service -> `getReviewQueue`.
  - Priorities: Leeches -> Overdue -> New.

### 2. CUBE Variant Logic

- [x] **Study Architecture**: Modular "Vertical Slice" (`src/modules/study`).
- [ ] **Variant Selector**: Logic to determine *which* card face to show.
  - New Card -> Basic.
  - Review -> Gap Fill.
  - Leech -> Intervention.
- [x] **DTOs**: Ensure API returns frontend-ready payloads (`study.dto.ts`).

### 3. API Endpoints

- [x] `GET /api/session` (via Server Action `getReviewQueue`).
- [x] `POST /api/review` (via Server Action `submitReview`).

---

## SPRINT 3: The Frontend (Week 4)

**Theme**: *The Experience.*

### 1. Core Components

- [ ] `FlashCard` Shell (Framer Motion).
- [ ] `BasicCard` (Kanji/Etymology).
- [ ] `GapFillCard` (Sentence context).
- [ ] `InterventionCard` (Confusion shield).

### 2. The Learning Loop

- [ ] Session State (Zustand).
- [ ] Queue Management (Next/Prev).
- [ ] Optimistic UI updates.
