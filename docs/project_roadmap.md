# Project Roadmap

To build this application effectively with AI, we will follow a **Phased Implementation Strategy**.
Each phase is a self-contained "Sprint" with a clear Definition of Done.

## Phase 1: The "Walking Skeleton" (Foundation)

**Goal:** A working end-to-end flow with zero style but perfect logic.

- [ ] **Database:** Apply Prisma Schema migration.
- [ ] **Seeding:** Create a `seed.ts` script to populate the DB with 5 "Golden Data" test cards.
- [ ] **API:** Implement `src/services/actions.ts` (skeleton functions).
- [ ] **UI:** Create a raw HTML-like page `/study` that fetches one card and displays JSON.

## Phase 2: The Logic Core (FSRS)

**Goal:** The SRS algorithm works and updates the database correctly.

- [ ] **Library:** Install `ts-fsrs`.
- [ ] **Implementation:** Implement `submitReview` in `actions.ts`.
- [ ] **Testing:** Verify that reviewing a "New" card moves it to "Learning" and updates `stability`/`due` date in the DB.
- [ ] **UI Connection:** Add generic "Again/Good" buttons to the `/study` page to trigger the action.

## Phase 3: The "Zen" UI (Design System)

**Goal:** Make it look like the Design System.

- [ ] **Setup:** Configure Ant Design theme (colors, typography) in `themeConfig.ts`.
- [ ] **Component:** Build `VocabCard` component (Card, Typography, Reveal Animation).
- [ ] **Layout:** Build the Dashboard layout (Sidebar, Stats).
- [ ] **Polish:** Add micro-interactions and sounds.

## Phase 4: Content & AI

**Goal:** Fill the app with real data and AI magic.

- [ ] **Generation:** Create an admin script to generate 50 cards from a CSV list using OpenAI.
- [ ] **Grammar:** Implement the "Sentence Check" feature in the Study UI.

## Phase 5: Launch Prep

- [ ] **Auth:** Finalize Supabase Auth protection.
- [ ] **Deploy:** Deployed to Vercel.
