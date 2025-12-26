# PHASE 3 MASTER PLAN: The "Storyteller" (Active Priming & Scale)

> **Status:** APPROVED (Consensus Plan)
> **Goal:** Transform from a "Card Flipper" to a "Language Context Engine".
> **Key Deliverable:** The "Active Priming" Story Engine & The AI Content Factory.

---

## 1. THE ROUNDTABLE DEBATE (Synthesis)

We convened the expert panel to critique the original Phase 3 requirements.

### The Arguments

- **The Strategist:** "Users are bored. Flashcards are 'taking medicine'. We need the 'Sugar'—the Stories. If we don't ship **Active Priming** now, we are just a harder Anki.
  > **The 3 Strategic Pillars:**
  > 1. **Retention is Revenue:** Flashcards cause burnout; Stories create 'Aha!' moments that keep users actively paying.
  > 2. **Differentiation (The Moat):** Anyone can clone a flashcard app. No one has *contextual narratives* generated for specific vocab units.
  > 3. **The 'Cold Open':** The first 5 minutes determine the session length. Stories are the hook that prevents early drop-off."
- **The Engineer:** "I agree on Stories, but we have 0 content. Manually writing stories for 50 units is impossible. We need an **Automated Pipeline** (The Factory). Also, Redis is Premature Optimization. Postgres can handle 10k users if we index correctly. **Kill Redis for now.**"
- **The UX Researcher:** "Don't just dump text on the screen. The Story must be interactive. Highlighting key words is mandatory. If it's just a wall of text, users will skip it."

### The Consensus Verdict

1. **STRATEGY MONITOR:** We adopt a **"Hybrid" Approach**.
    - **Phase 2:** We ship ONE manual story (Unit 1) to test the "Hook".
    - **Phase 3:** We turn on the **AI Factory** to scale to 50 Units.
2. **PRIORITY 1:** **The AI Content Factory**. We will write scripts to generate stories using LLMs + JSON validation.
3. **UX CORRECTION:** **Soft Gates**. We will NOT block users from studying. We will use "Soft Nudges" (Toasts/Warnings) to encourage reading, preserving the "Zen" feel.

---

## 2. TECHNICAL SPECIFICATIONS

### 2.1 Data Layer: The Schema

We align with existing `prisma/schema.prisma` and add tracking.

#### A. The Story Model (Existing in Schema)

```prisma
// Defined in prisma/schema.prisma
model Story {
  id     String @id @default(uuid())
  unitId String @map("unit_id")
  unit   Deck   @relation(fields: [unitId], references: [id], onDelete: Cascade)

  // Contract: StoryContent (zod: StoryContentSchema)
  // { 
  //   "title": { "en": "The Lost Umbrella", "vi": "Cái Ô Bị Mất" }, 
  //   "body_text": "I went to the {1}...", 
  //   "highlights": [{ "id": "1", "vocab_id": "...", "word": "Suupa", "index": 14 }] 
  // }
  content  Json
  audioUrl String? @map("audio_url")

  createdAt DateTime @default(now()) @map("created_at")

  @@index([unitId])
}
```

#### B. The Progress Tracker (NEW Migration)

We need to track *who* has read *what*.

```prisma
// [NEW] To be added to schema.prisma
model StoryLog {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  storyId   String   @map("story_id")
  story     Story    @relation(fields: [storyId], references: [id], onDelete: Cascade)

  completedAt DateTime @default(now()) @map("completed_at")

  @@unique([userId, storyId]) // One read per story per user
}
```

### 2.2 The "Priming" Logic (System Flow)

**Objective:** Encourage users to "unlock" the context without frustration.

1. **Check:** User clicks "Unit 5".
2. **Logic:** `StudyService.hasReadStory(userId, unitId)`?
3. **UI:**
    - If `false`: Show **Optional Modal** / **Toast**: "Recommended: Read the Story first to boost retention +50%."
        - Options: "Read Story" (Primary) vs "Skip to Cards" (Secondary/Ghost).
    - If `true`: Proceed directly to `/study/session/{unitId}`.

---

## 3. USER EXPERIENCE SPECIFICATION (The "Happy Path")

As a Product Owner, I demand a "Frictionless but Meaningful" flow.

### 3.1 The Priming Journey (Step-by-Step)

| Step | User Action | System Response | "Zen" Design Note |
| :--- | :--- | :--- | :--- |
| **1. Entry** | User taps "Start Unit 5" on Dashboard. | Checks `UserLog`. If Story not read, route to `StoryReader`. | No loading spinners. Instant transition. |
| **2. Immersion** | User sees "The Lost Umbrella" title + Beautiful Cover Image. | Plays subtle ambient background noise (Rain hints). | Set the mood before text appears. |
| **3. Interaction** | User reads text: "I went to the **Suupa**..." | Highlights **Suupa** in Gold. | Visual cue: "This is important." |
| **4. Discovery** | User taps **Suupa**. | System plays pronunciation audio + shows mini-tooltip "Grocery Store". | Instant gratification. |
| **5. Completion** | User reaches bottom of story. | "Begin Training" button pulses gently. | Soft guidance, not aggressive flashing. |
| **6. Handoff** | User taps "Begin Training". | Transitions to Flashcard Session. | **Seamless:** The first card is "Suupa" (Recency Effect). |

### 3.2 Scenarios & Edge Cases (The "Dark Corners")

**Scenario A: The "Speed Runner" (User tries to skip)**

- **User:** Scrolls immediately to bottom to click "Next".
- **System:**
  - *Phase 3 (Soft Gate):* Button is active, but a Toast appears: "Pro Tip: Tap highlighted words to prime your brain."
  - *Rationale:* Never block power users, but nudge them towards value.

**Scenario B: The "Broken Audio" (Network Fail)**

- **User:** Taps a word, but audio assumes timeout.
- **System:** Visual "Ripple" effect works, but no sound. No error modal.
- **Rationale:** "Graceful Degradation". Don't break immersion for a missing mp3.

**Scenario C: The "Double Start" (Resuming)**

- **User:** Reads half the story, quits app, returns.
- **System:** Remembers scroll position (nice to have) OR treats as "Not Read".
- **Rule:** Story is marked "Complete" ONLY when "Begin Training" is clicked.

**Scenario D: The "Bad Generation" (AI Hallucination)**

- **Condition:** AI generated "Apple" but linked it to "Car".
- **System:** "Report Content" flag available in kebab menu (Top Right).
- **Admin:** Flagged stories get reviewed in Admin Dashboard.

### 2.3 The AI Factory (The "Teacher" Agent)

We don't write content. We write *prompts*.

**The Pipeline Script (`scripts/generate_stories.ts`):**

1. **Input:** `prisma.vocabulary.findMany({ where: { unit: 5 } })`.
2. **Agent (GPT-4o):**
    - Role: "Japanese Novelist".
    - Task: "Write a 100-word story using THESE 15 words. Use 'Mixed Language' format (English grammar, Japanese nouns/verbs)."
3. **Validation:** Zod schema checks if ALL 15 words are present in the output.
4. **Output:** `data/stories/unit_5.json`.

---

## 4. EXECUTION PLAN (Sprint 3)

### Milestone 3.1: The Story Engine (Schema & API)

- [ ] **DB Migration:** Create `Story` model in Prisma.
- [ ] **Seed Script:** Create `scripts/seed_stories.ts` to load manual JSON data.
- [ ] **API:** `getStoryByUnit(unitId)` action.

### Milestone 3.2: The "Priming" UI

- [ ] **Layout:** `src/modules/study/components/Priming/StoryReader.tsx`.
- [ ] **Interaction:**
  - Render text.
  - Highlight `keyword_map` items (Clickable -> Plays Audio).
  - "Mark as Read" button (at bottom).

### Milestone 3.3: Content Scale (Units 1-10)

- [ ] **AI Script:** Implement the generator script provided above.
- [ ] **Generation:** Generate stories for Units 1-10.
- [ ] **QA:** Manual read-through of 10 stories to ensure they aren't nonsense.

---

## 5. SUCCESS METRICS & ACCEPTANCE CRITERIA

### 5.1 Acceptance Criteria (Definition of Done)

#### Functional

- [ ] **Lock Mechanism:** User CANNOT access `Session/UnitX` directly via URL without having a `StoryLog` entry (Redirect to Priming).
- [ ] **Interaction:** Tapping a keyword in `StoryReader` MUST play audio within 200ms.
- [ ] **Styling:** Keywords MUST be visually distinct (color + bold) from normal text.
- [ ] **Responsiveness:** Story text MUST be readable on mobile (16px base) without horizontal scrolling.

#### Data Integrity

- [ ] **Schema:** `Story` table exists with `keyword_map` correctly typed as JSONB.
- [ ] **Seed:** Units 1-5 have valid stories generated via script.

#### User Experience

- [ ] **The "Recency" Handoff:** The first Flashcard shown after the story MUST be one of the keywords from the story.

- **Adoption:** 90% of sessions for New Units start with Story View.
- **Engagement:** Users click on at least 3 highlighted words per story.
- **Retention Hook:** 80% of users who finish a Story complete the subsequent Flashcard session (The "Cold Open" effect).
- **Speed:** Time-to-Generate 1 Unit of content < 30 seconds (Automated).

---

## 6. RISK MANAGEMENT (The "Consultant's Safety Net")

### 6.1 Content Risks (The "Hallucination" Problem)

- **Risk:** GPT-4 generates culturally insensitive or grammatically incorrect Japanese.
- **Mitigation:**
  - **The "Human-in-the-Loop" Admin:** No story goes `PUBLISHED` without manual flipping of the `contentStatus` flag.
  - **The "Report" Button:** Empower users to flag weird content immediately.

### 6.2 Technical Risks (The "Soft Lock")

- **Risk:** User reads story, but network fails on "Complete". User is stuck in "Priming" loop.
- **Mitigation:**
  - **Optimistic UI:** Client assumes success immediately.
  - **Retry Policy:** Background sync retries `createStoryLog` 3 times.
  - **Fallback:** If API is dead, allow "Skip to Flashcards" after 5 seconds of failure.

---

## 7. OPERATIONAL COST ANALYSIS (The "Bill")

We are moving from Static Data to Generative AI. We must track the burn rate.

| Resource | Unit Cost | Scale (50 Units) | Est. Total |
| :--- | :--- | :--- | :--- |
| **GPT-4o (Generation)** | ~$0.05 / Story | 50 Units * 3 Stories = 150 | ~$7.50 (One-time) |
| **TTS (Audio)** | ~$0.015 / 1k chars | 150 Stories * 500 chars | ~$1.25 (One-time) |
| **Storage (Postgres)** | Negligible | Text data | $0.00 |

**Verdict:** The cost is negligible (< $10) for the initial batch. We do NOT need to downgrade to GPT-3.5 yet. Quality > Cost right now.

---

## 8. OBSERVABILITY SPECS (The "Dashboard")

We don't guess; we measure. Implement these PostHog/Analytics events:

- `STORY_OPENED`: { unit_id, source: 'dashboard' }
- `KEYWORD_TAPPED`: { word_id, word_text }
- `STORY_COMPLETED`: { duration_ms, scroll_depth_% }
- `PRIMING_CONVERSION`: { unit_id, did_start_flashcards: boolean }

---

## 9. NEXT STEPS (Phase 4 Forecast)

Once we have content (Phase 3) and Logic (Phase 2), Phase 4 will be **"The Performance & Analytics"** phase.
