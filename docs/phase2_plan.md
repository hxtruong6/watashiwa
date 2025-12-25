# PHASE 2 MASTER PLAN: The "Awakening" (Smart Layer Activation)

> **Status:** PROPOSED (Refined for Production Data)
> **Goal:** Prove the "Smart" in "Smart CUBE" by enabling the **Interference Shield**.
> **Data Source:** **Postgres Production DB** (50 Units Imported). NO MOCKS.

---

## 1. THE STRATEGIC PIVOT (Consensus)

We convened the panel to discuss the Phase 2 roadmap.

### The Decision: "Intervention First"

We will **DELAY** "Active Priming" (Stories) -> Phase 3.
We will **ACCELERATE** "Interference Shield" (Intervention) -> Phase 2.

**Why?**

- We have the **Data** (Minna Vocab in DB).
- We have the **Schema** (`ConfusionPair` & `Vocabulary.homonym_group_id`).
- We need the **UX Safety Net** (Split Screen) before users get confused by similar words in the 50-unit corpus.

---

## 2. PHASE 2 OBJECTIVE: "The Guardian"

**The Theory:** The system must *know* when you are confused and *intervene* proactively.
**The Deliverable:** A functional "Intervention Mode" that triggers using **Real DB Data**.

---

## 3. TECHNICAL SPECIFICATIONS (Real Implementation)

### 3.1 Data Layer: The "Collision Map" (Postgres)

We utilize the existing `ConfusionPair` table in `prisma/schema.prisma`.

**Logic:**

- **Source:** We query `prisma.vocabulary` and `prisma.confusionPair`.
- **Existing Data:** 50 Units are imported. We assume `han_viet` and `meanings` are populated.
- **Requirement:** We may need to run a migration script to populate `ConfusionPair` rows if the import only filled `Vocabulary`.

### 3.2 Logic Layer: The "Intervention Service"

We update `study.service.ts` (currently pure FSRS) and `study.actions.ts` (the Data Fetcher).

**The Logic Flow (`study.actions.ts`):**

1. **Fetch:** `await prisma.userReview.findMany(...)`.
2. **Review Check:** Logic detects if a result is `Outcome.INCORRECT`.
3. **Smart Lookahead:**
    - Query `prisma.confusionPair.findFirst({ where: { vocabId1: currentVocabId } })`.
    - OR check `vocabulary.homonymGroupId`.
4. **Intervention Trigger:**
    - If a partner exists (e.g., Vocab B) AND Vocab B is in `UserReview` (User has seen it),
    - Then **Inject** `InterventionCard` (Type: `INTERVENTION`) into the session queue.
    - **CRITICAL DATA CHECK:** Ensure Partner Vocab is `PUBLISHED` and `deletedAt` is NULL. Use `findFirst` with strict status filters. If invalid, abort intervention.

### 3.3 UI Layer: The "Comparison Face"

We implement the `InterventionCard` variant in the `CardShell`.

**Component:** `src/modules/flashcard/components/CardShell/InterventionFace.tsx`

- **Layout:** Split View (50% Left / 50% Right).
- **Data:** Hydrated from `Vocabulary` (Real Audio/Images from DB fields).
- **Interaction:**
  - Play clear audio for Item A.
  - User must tap the correct Image (A or B).

---

## 4. EXECUTION PLAN (Sprint 2)

### Milestone 2.1: Data Verification & Access

- [ ] **Verify Data:** Check if `ConfusionPair` or `homonymGroupId` is populated for "Hashi/Hashi" or "Iku/Kuru" in the 50-unit DB.
  - *Fallback:* If empty, write a script `scripts/seed_confusions.ts` to link them based on `data_sample.json`.
- [ ] **Study Action:** Update `fetchSession` to return **Real Data** from `prisma`.
  - usage of `study.mapper.ts` to convert Prisma -> `SmartCard`.

### Milestone 2.2: The "Guardian" Logic

- [ ] **Service:** Implement `detectInterference(vocabId, userId)` in `study.service.ts` or `study.actions.ts`.
- [ ] **State (Queue Schema):** Refactor `StudySession.queue` types.
  - From: `string[]` (IDs)
  - To: `Array<{ id: string; type: 'REVIEW' | 'INTERVENTION'; payload?: any }>`
- [ ] **State (Logic):** Update `useSessionStore` to handle dynamic insertion (Array.unshift).

### Milestone 2.3: The Interface

- [ ] **Component:** Build `InterventionFace.tsx`.
- [ ] **Integration:** Wire it into `CardShell`.

---

## 5. USER EXPERIENCE SPECIFICATION (The "Flow")

You are right. A "Smart" features needs a "Smart" definition of success.

### 5.1 User Journey (Entry Points)

"User Journey" is the correct term. Critically, **The Intervention is NOT a destination.** It is a *trap* that activates during normal study.

**Entry Point A: Global Review (Dashboard)**
> User clicks "Review Due (20)" on Dashboard.
> *Context:* User expects mixed topics. Intervention triggers naturally.

**Entry Point B: Deck Study (Deck Page)**
> User clicks "Study Unit 5".
> *Context:* User is focused on specific topics. Intervention triggers ONLY if the confusing pair is relevant to Unit 5 words (or past knowledge).

**Entry Point C: Profile (Stats)**
> *Passive Access:* User views "Confusion Matrix" (Future V3) to see what words they mixed up. *Not active in Phase 2.*

**The Journey Map:**

1. **Normalcy:** User is in the "Flow State" (Reviewing standard cards).
2. **Disruption:** User makes a specific error (Confuses Hashi A for Hashi B).
3. **Intervention:** The System *pauses* the flow and inserts the Split Screen.
4. **Resolution:** User resolves the conflict ("Aha!").
5. **Return:** User returns to "Flow State".

### 5.2 The "Intervention" User Flow (Internal Logic)

```mermaid
graph TD
    A[User sees Card A: "Iku" (Go)] -->|User swipes LEFT (Wrong)| B{System Logic}
    B -->|Check 1: Is Iku in a HomonymGroup?| C{Yes?}
    C -- No --> D[Standard SRS Penalty]
    C -- Yes --> E{Check 2: Has User seen Partner 'Kuru'?}
    E -- No --> D
    E -- Yes --> F[TRIGGER INTERVENTION]
    
    F --> G[Next Card is INTERVENTION_FACE]
    G --> H[Display Split Screen: Iku vs Kuru]
    H --> I[User taps correct image for 'Iku']
    I -->|Correct| J[Show 'Aha!' Explanation]
    I -->|Incorrect| K[FAIL OPEN: Show Feedback Modal immediately (No Retry Loop)]
    
    J --> L[Resume Standard Session]
```

### 5.3 Scenarios (Gherkin Style)

**Scenario 1: The "Hashi" Trap (Triggering the Shield)**
> **Given** I have learned both "Hashi" (Bridge) and "Hashi" (Chopsticks),
> **And** I am currently reviewing "Hashi" (Bridge),
> **When** I answer INCORRECTLY,
> **Then** the very next card should be a "Split Comparison" of Bridge vs Chopsticks,
> **And** I should hear the audio for "Bridge" clearly played.

**Scenario 2: The "Safety" Check (No Ambush)**
> **Given** I have learned "Hashi" (Bridge) but NOT "Hashi" (Chopsticks),
> **When** I answer INCORRECTLY on Bridge,
> **Then** I should see the standard "Back Face" (Correction),
> **And** I should NOT see the Comparison Mode.
> *(Reasoning: Comparing against an unknown word causes confusion, not clarity.)*

### 5.4 Acceptance Criteria (The "Definition of Done")

1. **UX - Transition:** The transition to the Intervention Card must happen *instantaneously* (< 200ms). It should feel like the app is saying "Wait a second..."
2. **UX - Audio:** The Intervention Face must have a "Replay Audio" button that is easy to tap.
3. **Data - Accuracy:** The Pitch Accent SVG line must correctly visualize the difference (e.g., High-Low vs Low-High) for at least the seeded homonyms.
4. **System - Rate Limit:** If I fail the same word twice in a session, show Intervention ONLY the first time.
5. **System - Fail Open:** If I fail the Intervention comparison, do NOT force retry. Show correct answer specific to correct card and move on.

---

## 6. ENHANCEMENTS (For 50-Unit Scale)

Since we are running with a large dataset (50 Units ~3000+ words), we must add these enhancements:

### 5.1 Smart Pacing (Anti-Overload)

- **Problem:** `fetchSession` might return 20 "New" cards in a row if Unit 1 is untouched.
- **Fix:** Enforce `User.limitNewCards` (e.g., Max 10 New/day).
- **Query:** `prisma.userReview.count({ where: { srsStage: 0, date: today } })`.

### 5.2 Performance Optimization

- **Problem:** `han_viet` parsing can be slow if done in JS for 1000 words.
- **Fix:** Ensure `han_viet` is stored as a pre-processed string or simple JSON in DB (It is: `hanViet` String).
- **Latency:** Ensure `fetchSession` takes < 200ms. Index `@@index([userId, nextReviewAt])` in schema helps this.

### 5.3 Audio Strategy

- **Problem:** 50 units = Lots of audio files.
- **Default**: Using TTS for audio.
- **Fix:** The frontend `StandardFace` must lazy-load audio, or use a pre-fetch link for the *next* 5 cards in the queue.

---

## 7. SAFETY, ANALYTICS & EDGE CASES (The "Invisible" Layer)

### 7.1 Analytics Strategy (The "Truth")

We must measure if this feature actually helps.

| Event Name | Trigger | Properties |
| :--- | :--- | :--- |
| `INTERVENTION_TRIGGERED` | Smart Layer inserts card | `vocab_id`, `homonym_group_id` |
| `INTERVENTION_RESOLVED` | User completes the pair split | `outcome` (Correct/Wrong), `duration_ms` |
| `INTERVENTION_IGNORED` | Rate limit prevented trigger | `vocab_id` |

**KPI:** If `INTERVENTION_RESOLVED.outcome == Wrong` > 50%, our UI is confusing and needs redesign.

### 7.2 Safety & Kill Switches

We are modifying the live session queue. This is high risk.

1. **Feature Flag:** `NEXT_PUBLIC_ENABLE_INTERVENTION=true`.
    - If `false`, `detectInterference()` returns `null`.
2. **Circuit Breaker:**
    - If the API fails to fetch comparison data (e.g., timeout), **fail open** (just show the normal card). Do not crash the session.
3. **Queue Integrity:**
    - The "Progress Bar" (e.g., 10/20) must dynamically update to 10/21 when an intervention is injected.

### 7.3 Visual Fallbacks (Edge Cases)

The 50-Unit DB is imperfect.

- **Scenario:** Item A has an image, Item B does not.
- **Handling:**
  - *Ideal:* Show images for both.
  - *Fallback:* If one is missing, show **LARGE TEXT** (Kanji/Kana) for both.
  - *Rule:* Never show a "Broken Image" icon. Symmetric UX is critical for fair comparison.

---

## 8. DEFINITION OF DONE

1. **Real Data Success:** I start a session and see words from Minna Unit 1 (e.g., "Watashi", "Sensei").
2. **Intervention:** I answer "Kuru" (Come) incorrectly on a "Iku" (Go) card -> The system immediately shows the "Iku vs Kuru" split screen.
3. **No Mocks:** `grep "stub-srs" src` returns 0 results.
