# Project Roadmap

To build this application effectively, we follow a **Phased Implementation Strategy**. Each phase is a "Sprint" with a clear Definition of Done.

## Phase 0: Foundation (Completed)

**Goal:** Database, API Shell, and Basic Routing are live.

- [x] **Database:** Prisma Schema migrated.
- [x] **Seeding:** `seed.ts` loads test cards.
- [x] **API:** `actions.ts` skeleton exists.
- [x] **Routing:** `/study` page exists (raw HTML).

## Phase 1: The Engine (FSRS & Core Loop)

**Goal:** The application *works* as a study tool. Users can review cards, and the scheduler updates correctly.

- [x] **Library:** Integrate `ts-fsrs` with `actions.ts`.
- [x] **Action:** Implement `submitReview(cardId, rating)` to update DB.
- [x] **UI:** Build the `VocabCard` component (Question/Answer states).
- [x] **Interaction:** Bind `Space` (Reveal) and `1/2/3/4` (Rate) keys.
- [x] **Verify:** Reviewing a card moves it from `New` -> `Learning` -> `Review` in DB.

## Phase 2: The "Zen" Shell (Dashboard & Theme)

**Goal:** The application *feels* professional.

- [ ] **Theme:** Implement `themeConfig.ts` with Indigo/Matcha/Washi palette.
- [ ] **Layout:** Create the Dashboard with "Start Review" CTA.
- [ ] **Deck List:** Building the `/decks` page to view/search content.
- [ ] **Polish:** Add transitions and loading states.

## Phase 3: Content & AI

**Goal:** Infinite content generation.

- [ ] **AI:** Script to generate cards from words via OpenAI/Gemini.
- [ ] **Validation:** "Sentence Check" feature for output practice.
- [ ] **Audio:** Text-to-Speech integration.

## Phase 4: Production

**Goal:** Launch.

- [ ] **Auth:** Secure all routes (Supabase Middleware).
- [ ] **Deploy:** Vercel Production Deployment.
