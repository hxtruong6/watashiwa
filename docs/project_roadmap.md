# Project Roadmap

To build this application effectively, we follow a **Phased Implementation Strategy**. Each phase is a "Sprint" with a clear Definition of Done.

## Phase 0: Foundation (Completed)

**Goal:** Database, API Shell, and Basic Routing are live.

- [x] **Database:** Prisma Schema migrated.
- [x] **Seeding:** `seed.ts` loads test cards.
- [x] **API:** `actions.ts` skeleton exists.
- [x] **Routing:** `/study` page exists (raw HTML).

## Phase 1: The Engine (FSRS & Core Loop)

**Goal:** The application _works_ as a study tool. Users can review cards, and the scheduler updates correctly.

- [x] **Library:** Integrate `ts-fsrs` with `actions.ts`.
- [x] **Action:** Implement `submitReview(cardId, rating)` to update DB.
- [x] **UI:** Build the `VocabCard` component (Question/Answer states).
- [x] **Interaction:** Bind `Space` (Reveal) and `1/2/3/4` (Rate) keys.
- [x] **Verify:** Reviewing a card moves it from `New` -> `Learning` -> `Review` in DB.

## Phase 2: The "Zen" Shell (Dashboard & Theme)

**Goal:** The application _feels_ professional.

- [x] **Theme:** Implement `themeConfig.ts` with Indigo/Matcha/Washi palette.
- [x] **Layout:** Create the Dashboard with "Start Review" CTA.
- [x] **Deck List:** Building the `/decks` page to view/search content.
- [x] **Courses/Series:** Group decks into ordered learning paths (Deck Grouping).
- [x] **Polish:** transitions and loading states (Basic implementation done).

## Phase 3: Content Ingestion (Current Priority)

**Goal:** Allow users to easily import their own study materials.

- [ ] **CSV Import Design:** Define template and validation logic.
- [ ] **Import Wizard UI:** Upload -> Preview/Validate -> Confirm.
- [ ] **Data Mapping:** Map CSV columns to `Vocab` model (Surface, Reading, Meaning, etc.).
- [ ] **Deck Management:** Create/Select Deck during import.

## Phase 4: User Acquisition & Auth

**Goal:** Secure multi-user environment and Public Landing Page.

- [x] **Public Landing Page:** Hero section, Value prop, simple "Start" flow.
- [x] **i18n:** Multi-language support (English/Vietnamese) without routing.
- [x] **Supabase Auth:** Login/Register with Email/Password.
- [x] **User Sync:** Ensure Auth users have corresponding DB `User` records.
- [x] **Middleware:** Protect `/dashboard` routes.
- [ ] **Deploy:** Production Deployment.

## Phase 5: Community & Engagement

**Goal:** Build social features and enhance user retention.

- [x] **User Roles:** Admin, Moderator, User permission system. ([Spec](features/user-roles.md))
- [x] **Community Comments:** Card comments, voting, moderation. ([Spec](features/community-comments.md))
- [ ] **Wishlist:** Bookmark cards for later review. ([Spec](features/wishlist.md))
- [ ] **Vocab Browser:** Filter/sort cards by memorization status. ([Spec](features/vocab-browser.md))
- [ ] **Enhanced Dashboard:** Redesigned UX with gamification. ([Spec](features/enhanced-dashboard.md))
- [ ] **User Ranking:** Leaderboards by deck collection (N5/N4) and time. ([Spec](features/user-ranking.md))
- [ ] **Card Reporting:** Report incorrect content, moderator corrections. ([Spec](features/card-reporting.md))
