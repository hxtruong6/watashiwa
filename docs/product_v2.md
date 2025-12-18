# PRODUCT MASTERPLAN v2: THE "SMART CUBE" ARCHITECTURE

> **Confidential for Internal Strategy**  
> **Status:** APPROVED for Execution  
> **Authors:** Senior Product Team & Engineering Leads  
> **Design Compliance:** [Zen Mastery System](./design_system.md)

---

## 1. EXECUTIVE SUMMARY: The "Retention-First" Pivot

We are shifting focus from **"Content Quantity"** (How many words?) to **"Memory Quality"** (How well do they stick?).

Current market weakness:

- **Duolingo:** Too easy, low retention (Breadth > Depth).
- **Anki:** Too boring, high friction (Depth > Engagement).

**WatashiWa V2** occupies the "Sweet Spot": **Standard Flashcard UX + Smart Intervention Layer**.

### The Core Concept: "Active Priming" & "Intervention"

We do not just "show cards". We **intervene** in the forgetting process through:

1. **Context (C):** Never learn in isolation. (Active Priming)
2. **Understanding (U):** Etymology as the "hook".
3. **Blocking (B):** Proactive interference shielding.
4. **Encoding (E):** Dynamic card variants & Pitch Accent visualization.

---

## 2. MARKET STRATEGY: "The Cure for Burnout"

### 2.1 Positioning Statement

> **For** serious Japanese learners who feel overwhelmed by rote memorization,  
> **WatashiWa** is the intelligent learning companion  
> **That** guarantees "Sticky Memory" through the CUBE method,  
> **Unlike** Anki (too dry) or Duolingo (too shallow).

### 2.2 The "Anti-Churn" Growth Loop

Most apps lose users when they hit the "Wall of Shame" (too many reviews due).
**WatashiWa Strategy:**

1. **The Promise:** "You are not dumb; your method was flat (2D). Try 3D Learning."
2. **The Hook:** "Insight-based" Moments (Etymology connections) create Dopamine.
3. **The Safety Net:** The Smart Layer _throttles_ new cards if reviews pile up. "Less is More."

---

## 3. UX/UI STRATEGY: "Zen Mastery"

**Voice Tone:** Calm, Authoritative, Concise. No "Good job buddy!" (Duolingo style). Instead: "Mastery achieved."

### 3.1 The Design Language (See `design_system.md`)

- **Colors:**
  - `colorPrimary` (#1E3A5F): Indigo for Focus/Easy ratings.
  - `colorSuccess` (#708238): Matcha Green for Mastery/Good ratings.
  - `colorError` (#E64A19): Vermilion for Mistakes/High Pitch accents.
  - `colorBgBase` (#F9F7F2): Washi Paper texture for background.
- **Whitespace:** Radical use of `paddingLG` (32px) to let the Kanji breathe.
- **Typography:** Hero Kanji (64px, weight 500) allows seeing stroke details.

### 3.2 Micro-Copy Strategy (The "Smart" Voice)

| Scenario     | Standard App Copy             | WatashiWa "Smart" Copy                   | Rationale                      |
| ------------ | ----------------------------- | ---------------------------------------- | ------------------------------ |
| **Error**    | "Incorrect. The answer is X." | "Wait. You confused X with Y."           | Intervene logic, not shame.    |
| **New Unit** | "Unit 5: Travel"              | "Priming Brain: 15 New Concepts"         | Sets expectation of effort.    |
| **Success**  | "You got 10/10!"              | "Validation Complete. 0 Leech Detected." | Emphasize long-term stability. |
| **Pacing**   | "Review 100 more cards!"      | "Brain Saturation Reached. Rest now."    | Protects against burnout.      |

---

## 4. SYSTEM ARCHITECTURE: The 3-Tier "Brain"

To answer the engineering question: _"Is a Smart Layer necessary?"_
**YES.** Without it, the Frontend becomes bloated with business logic, or the Database becomes a mess of stored procedures.

### The 3 Layers

| Layer                               | Role                 | Responsibility                                                          | **Zen UX Integration**                                                                                                      |
| ----------------------------------- | -------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **1. Persistence Layer** (Postgres) | **The Vault**        | Source of Truth. Stores `Vocabularies`, `UserLogs`, `homonym_group_id`. | N/A                                                                                                                         |
| **2. Smart Layer** (The Brain)      | **The Orchestrator** | Decisions: _What_ to show? _When_ to intervene?                         | **Pacing Control:** Ensures the "rhythm" of learning is calm, not frantic. Prevents "Doom Review" piles.                    |
| **3. Presentation Layer** (App/Web) | **The Stage**        | Dumb rendering.                                                         | **Visual Feedback:** Uses _Color Psychology_ (Matcha Green = mastery, Indigo = calm focus) to reduce anxiety during errors. |

---

## 5. INTELLIGENT DATA ARCHITECTURE (Hybrid SQL)

To answer the engineering question: _"SQL or NoSQL?"_
**Verdict:** **Hybrid SQL (Postgres + JSONB).** We need the relational integrity of SQL for user data, but the flexibility of NoSQL for content variants.

### 5.1 The "Anchor & Variant" Model

We separate "Words" from "Learning Experiences".

| Model                       | Role         | Schema Highlights                                                       |
| --------------------------- | ------------ | ----------------------------------------------------------------------- |
| **Vocabulary** (The Anchor) | Static Truth | `tags` (Array), `han_viet_info` (JSONB), `homonym_group_id`             |
| **CardVariant** (The Face)  | Dynamic View | `content_payload` (JSONB). Stores Question/Answer/Distractors flexibly. |
| **UserReview** (The Memory) | FSRS State   | `srs_stage`, `stability`, `personal_anchor` (User Mnemonic).            |

### 5.2 Analytics & User Intelligence Strategy

We do not just track "Correct/Incorrect". We track **Hesitation & Habit**.

- **Micro-Engagement:** `ReviewLog.duration` (ms) detects "struggle" even on correct answers.
- **Daily Aggregation:** `DailyStudyStat` table pre-calculates heatmaps to avoid expensive runtime queries.
- **Composite Indexes:** `@@index([userId, nextReviewAt])` ensures Dashboard loads < 100ms at 100k users.

### 5.3 Data Safety & Standards

- **Soft Deletes:** `deletedAt` column on all core tables.
- **Localization:** `meanings` and `examples` are JSONB to support `{"vi": "...", "en": "..."}` extensibility.

---

## 6. FUNCTIONAL SPECIFICATION

### 6.1 Feature: Active Priming (Replacing "Overview")

_Old Way:_ List of words -> User reads -> Enters Flashcards. (Passive)  
_New Way:_ **Context First.**

**Scenario:**

1. User starts "Unit 5 (Travel)".
2. **Smart Layer** generates a "Mini-Story" payload using Unit 5 words + familiar words from Unit 1-4.
3. **UI** displays the text. Key words are highlighted.
4. **Requirement:** User cannot start Flashcards until they interact with at least 3 highlighted words or answer a comprehension check.

### 6.2 Feature: Dynamic Card Variants (The "CUBE")

The **Smart Layer** queries `Vocabularies`, checks user's `srs_stage`, and decides the **Variant** to serve.

**Variant Matrix:**

| SRS Stage        | Variant Type   | Front Face                | Back Face                      | Goal              |
| ---------------- | -------------- | ------------------------- | ------------------------------ | ----------------- |
| **New (0)**      | `Standard`     | Kanji + Audio             | Meaning + Hán Việt + Etymology | Acquisition       |
| **Learning (1)** | `Audio_Match`  | Audio Only                | 4 Images/Meanings Choice       | Listening         |
| **Review (2-3)** | `Context_Gap`  | "Tôi đi [___] mua táo"    | "Supa" (Kanji)                 | Recall in Context |
| **Leech (Fail)** | `Intervention` | "Kashimasu" vs "Karimasu" | Correction Explanation         | Pattern Repair    |

### 6.3 Feature: Interference Shield (Homonyms & Pitch Engine)

**The Challenge:** Japanese has many **Homonyms** (same reading, different Kanji/Pitch).
_Example:_ `Hashi` (Chopsticks 🥢 - Atamadaka/High-Low) vs `Hashi` (Bridge 🌉 - Odaka/Low-High).

**Solution Design:**

#### A. Data Structure (The Hidden Layer)

We add explicit pitch and grouping data to `vocabularies`:

```sql
ALTER TABLE vocabularies
ADD COLUMN pitch_pattern INT, -- 1: Atamadaka, 0: Heiban, 2: Nakadaka
ADD COLUMN pitch_svg_path TEXT, -- (Visual Render Path)
ADD COLUMN homonym_group_id UUID; -- Shared ID for "Hashi" group
```

#### B. UI/UX: The "Pitch Visualizer" (Design System Aligned)

Instead of flat Hiragana, we render **Pitch-aware Text**:

- **High Pitch:** Rendered with an overline or accent color `colorError` (Vermilion) to signify "Peak".
- **Low Pitch:** Rendered in `secondary` text color (Gray).
- **Visualization:** An SVG line weaves through the characters.
  - _Chopsticks (箸):_ Line starts High on 'Ha', drops Low on 'shi'.
  - _Bridge (橋):_ Line starts Low on 'Ha', rises High on 'shi'.

#### C. Smart Logic: "Comparison Mode"

1. **Trigger:** User learns "Bridge" (`Hashi`).
2. **Check:** System sees `homonym_group_id` links to "Chopsticks".
3. **Condition:** Has user learned "Chopsticks"?
   - _No:_ Do nothing (avoid cognitive overload).
   - _Yes:_ **Activate Comparison Mode.**
4. **Intervention UI (Split View):**
   - **Left Card:** 🥢 Image + `Hashi` (High-Low Audio).
   - **Right Card:** 🌉 Image + `Hashi` (Low-High Audio).
   - **Task:** User must listen to a randomized audio clip and tap the correct image.

#### D. Gamification: "Pitch Perfect Challenge"

- **Game:** Words fall from top of screen.
- **Action:** Swipe Left for "High Start" (Atamadaka), Swipe Right for "Low Start" (Heiban/Odaka).
- **Feedback:** Haptic "Thud" on wrong sort.

### 6.4 Feature: User Intelligence Dashboard (New)

**Goal:** Provide "Zen" insight, not just raw numbers.

1. **Kanji Heatmap:**
   - _Visual:_ A grid of learned Kanji colored by `srs_stage`.
   - _Green:_ Mastered. _Orange:_ Learning. _Red:_ Leech.
2. **The "Focus" Meter:**
   - _Metric:_ Average `ReviewLog.duration` trend.
   - _Insight:_ "You answered 20% faster today. Your fluency is improving."
3. **Weekly Report (Email):**
   - Generated from `DailyStudyStat`.
   - "You learned 50 new words and shielded 12 confusions this week."

---

## 7. NON-FUNCTIONAL REQUIREMENTS

### 7.1 Performance & Latency Budgets

The "Smart Layer" sits between User and DB. It cannot be slow.

- **Queue Generation Budget:** < 200ms (Pre-fetch next batch while user reviews).
- **Intervention Trigger:** < 50ms (Must feel instant).
- **Indexing Strategy:**
  - Postgres GIN Index on `vocabularies.han_viet_info` (JSONB) for fast radical lookups.
  - Redis Cache for `session_queue` to avoid hammering Postgres every swipe.

### 7.2 Content Operations: "The AI Factory"

We cannot generate content Real-Time (Cost + Latency risks).
**Pipeline:**

1. **Raw Data:** Manually curated Minna vocab lists.
2. **Batch Job (Nightly):**
   - GPT-4 generates 3 Context Sentences per word.
   - GPT-4 identifies "Confusion Candidates" based on Levenshtein distance & radical similarity.
3. **Human QA:** Admin dashboard to check "Hallucinations".
4. **Production DB:** Only approved content goes live.

---

## 8. SUCCESS METRICS (North Star)

| Metric                      | Definition                                               | Goal (V2)                          |
| --------------------------- | -------------------------------------------------------- | ---------------------------------- |
| **Retention Rate (D30)**    | % of users returning on Day 30                           | > 15% (Industry avg: 5-8%)         |
| **Intervention Resolution** | % of users who answer Correctly _after_ a Shield Trigger | > 85%                              |
| **Session Completion**      | % of started sessions finished                           | > 90% (Zen Design reduces burnout) |
| **"Aha!" Signal**           | User creates a "My Anchor" note on a card                | > 1 note per 50 cards              |

---

## 9. EXECUTION ROADMAP

### Milestone 0: The Walking Skeleton (Dates: TBD)

**Goal:** Fundamental DB & "Smart Layer" Routing (No UI polish).

- [ ] **DB Schema:** Migration for `vocabularies` (JSONB hooks, `pitch_pattern`) and `session_queue`.
- [ ] **Smart Service:** Basic weighted randomization logic (Smart Layer V0.1).
- [ ] **Manual Data:** Populate Unit 1-5 with Hán Việt & 1 Context Sentence.
- **Definition of Done:** Can call API `GET /session/next` and receive cards with different `variant_type`.

### Milestone 1: The "Thinking" Brain (Dates: TBD)

**Goal:** Active Priming & Interference Shield V1.

- [ ] **Priming UI:** "Mini-Story" Layout component.
- [ ] **Shield Logic:** `homonym_group_id` check implemented.
- [ ] **Shield UI:** Side-by-Side Review component with Pitch Visualizer.
- **Definition of Done:** User answering wrong triggers the Shield Popup correctly.

### Milestone 2: The "Zen" Polish (Dates: TBD)

**Goal:** Marketing & UX Readiness.

- [ ] **Design System:** Implement "Zen" Voice in all Error/Success states using `themeConfig` tokens.
- [ ] **Onboarding:** "Why CUBE?" walkthrough (3D rotation animation).
- [ ] **Analytics:** Event tracking for "Intervention Triggered" and "Recovery Success".
- **Definition of Done:** App feels premium. No "Dev" error messages.

### Milestone 3: The Content Scale (Dates: TBD)

**Goal:** Full N5-N4 coverage.

- [ ] **AI Pipeline:** Python script to batch-generate Context/Variants for Unit 6-50.
- [ ] **Pitch Data:** Import Pitch Accent database (e.g., from NHK or accdb).
- [ ] **Performance:** Redis caching implementation.

---

**Verdict:** The 3-Tier Architecture combined with a defined Process Pipeline ensures we build a product that is **Smart** (Adaptive), **Fast** (Performance Budgets), and **Scalable** (AI Factory).
