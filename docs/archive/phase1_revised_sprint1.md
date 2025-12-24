# SPRINT 1 DESIGN: The "Zen" Vertical Slice

> **Goal**: A deployable, "playable" learning session for Unit 1.
> **Theme**: "Feel the Quality."
> **Shift**: Moving Frontend/UX (formerly Sprint 3) to Sprint 1. Delaying AI Factory.

---

## 1. The Expert Consensus (Rationale)

| Persona | Viewpoint & Compromise |
| :--- | :--- |
| **Strategist** | **Critique**: "The original plan (Data Factory first) risked building a massive backend for a product nobody wants to touch."<br>**Consensus**: "We validate the 'Retention Hook' (The Zen Feel) immediately. Users must fall in love on Day 1." |
| **Engineer** | **Critique**: "I won't build specific mockups that I have to throw away."<br>**Consensus**: "We build the REAL architecture (Zustand + Types + Server Actions), but we feed it *static seed data* to save time on the AI pipeline." |
| **UX Researcher** | **Critique**: "A text-only 'Walking Skeleton' is useless for testing 'Zen'."<br>**Consensus**: "The 'Flip Animation' and 'Swipe Physics' are not 'polish'—they are **Core Features**. We build them now." |

---

## 2. Epic: The "First Impression" (Unit 1 Experience)

**User Story**:
> "As a new user, I want to complete my first study session (Unit 1) with fluid animations and zero friction, so I feel motivated to return."

### Acceptance Criteria (The "Definition of Done")

1. **The "Flow"**: User can start a session, review 10 cards, and see a Summary Screen.
2. **The "Feel"**: Card flips take exactly `0.4s`. Swiping right triggers "Green Glow".
3. **The "Data"**: Cards display real Hán Việt, Pitch Accent (Static SVG), and Play Audio.
4. **The "State"**: Refreshing the page persists the current card index (Zustand + LocalStorage).

---

## 3. Sprint Breakdown

### Task 1: The "Vertical Slice" Skeleton (Backend)

* **Goal**: Get data from DB to Frontend without the "Smart Layer" complexity.
* **Sub-tasks**:
  * [ ] **DB Schema**: Apply `Vocabulary` and `Session` schema (Postgres).
  * [x] **Seed Data**: Manually create `seed/unit1.json` (20 words) with full JSONB payloads (Etymology, Pitch).
  * [ ] **Server Action**: `getSession()` returns the static Unit 1 list.

### Task 2: The "Card Physics" Engine (Frontend)

* **Goal**: The "Tarot Card" feel.
* **Sub-tasks**:
  * [ ] **Component**: `CardShell` using `framer-motion`.
  * [ ] **Interaction**: Implement Draggable (Swipe Left/Right) with threshold-based color triggers.
  * [ ] **Animation**: 3D Flip (preserve `backface-visibility: hidden`).

### Task 3: The "Zen" UI (Presentation)

* **Goal**: Visuals that match the `design_system.md`.
* **Sub-tasks**:
  * [ ] **Typography**: Implement `Hero Kanji` (64px) and `Secondary Text` (Hán Việt).
  * [ ] **Colors**: Apply `Identify (Focus)`, `Matcha (Success)`, `Vermilion (Error)` tokens.
  * [ ] **Layout**: `SessionContainer` (Clean whitespace, no clutter).

### Task 4: The "Loop" Logic (State)

* **Goal**: Managing the queue.
* **Sub-tasks**:
  * [ ] **Zustand Store**: `useSessionStore` (queue, currentIndex, answers).
  * [ ] **Logic**: `submitAnswer(id, rating)` -> Updates store, moves to next card.
  * [ ] **Summary**: Simple "Session Complete" modal.

---

## 4. User Flow (Sprint 1)

1. **Landing**: User sees "Start Unit 1" button.
2. **Transition**: Screen fades to `colorBgBase` (#F9F7F2).
3. **Card Entry**: Card 1 slides in from Bottom-Right (`spring` physics).
4. **Interaction**:
    * User Taps -> Flip (Reveal Meaning/Etymology).
    * User Swipes Right -> "Good" (Green Flash).
5. **Progression**: Card 1 exists Left. Card 2 Scales Up from background.
6. **Completion**: fast-forward to Card 10... Confetti (Subtle) -> "Mastery Achieved".

---

## 5. What We Are SKIPPING (Explicitly)

* **AI Generation**: No GPT-4 scripts. Hand-write the JSON for Unit 1.
* **Smart Scheduling**: No FSRS math. Just Linear Queue (1 -> 10).
* **Auth**: No Login screen. Hardcode `userId = 'demo'`.
* **Dashboard**: No headers/footers/stats charts. Just the Session.
