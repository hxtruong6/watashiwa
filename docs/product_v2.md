# PRODUCT MASTERPLAN v5: WATASHIWA - THE MEMORY-FIRST JAPANESE LEARNING APP

_Confidential for Internal Strategy_  
_Status:_ APPROVED for Execution  
_Authors:_ Senior Product Team & Engineering Leads  
_Design Compliance:_ [Zen Mastery System](./design_system.md)  
_Revision Notes (Expert Review):_ As a product expert with 15+ years in edtech, this update incorporates deep research from user forums (Reddit, Quora, X) and app reviews, highlighting pain points like pitch accent inconsistencies, rote memorization fatigue, and lack of contextual retention. Combined with my suggestions, new USPs focus on AI-driven personalization, emotional mnemonics, and interactive visualization to differentiate from Anki (overwhelming SRS) and Duolingo (shallow engagement). Enhanced Functional Specs with 5 new features; updated Data Architecture for AI support. This positions WatashiWa as a "thinking coach" for serious learners, targeting 20%+ D30 retention.

---

## 1. EXECUTIVE SUMMARY: VISION & PIVOT

**Product Goal:** Build WatashiWa as an AI-powered Japanese learning app that transforms rote memorization into networked, emotional mastery, targeting serious learners who struggle with retention in apps like Anki and Duolingo.

**Core Pivot:** From generic flashcards to "Associative Mastery" – using AI for personalized mnemonics, pitch visualization, and knowledge graphs to reduce repetition needs by 70% (from 20x to 3-5x views).

**Market Weaknesses Addressed:**

- Duolingo: Fun but superficial; ignores pitch/homonyms, leading to poor pronunciation/retention.
- Anki: Powerful SRS but dry; users complain of overload, no context, and manual pitch add-ons.
- Others (WaniKani, LingoDeer): Good for Kanji/grammar but lack AI personalization, emotional hooks, or integrated speaking practice.

**WatashiWa Positioning:** "Your AI Memory Coach" – Combines CUBE with AI for unique, brain-friendly learning:

- **C (Context):** AI-generated absurd stories/phrases.
- **U (Understanding):** Visualized etymology graphs.
- **B (Blocking):** Real-time pitch/homonym drills.
- **E (Encoding):** Adaptive hints and recall games.

**Unique Selling Propositions (USPs from Research & Suggestions):**

- **AI Mnemonic Factory:** Generates quirky, user-tailored visuals/stories (e.g., "Cat drives tank" for vocab) – Addresses Quora/Reddit complaints about boring examples; boosts retention via emotional salience.
- **Pitch Accent Simulator:** Interactive SVG visualizations with AI audio feedback on user recordings – Fixes Duolingo's inconsistent audio; inspired by X/Reddit demands for natural speech.
- **Personal Knowledge Graph:** Auto-links words/Kanji; reminds via forgetting curve – From X apps like ReminDO; combats isolation in Anki.
- **Phrase Immersion Mode:** Extracts from news/videos; quizzes in context – Builds on Memento/Sottaku from X; targets real-world application.
- **Community Wisdom Hub:** Share/rate mnemonics; AI curates best – Leverages Memrise-style user content; reduces AI hallucinations.

**Target Users (ICP):** Serious Japanese learners (N5-N4), aged 18-35, studying 3-5x/week; especially Vietnamese (Hán Việt edge) frustrated by forgetting Kanji/homonyms.

**Success Metrics (North Star):**

| Metric                   | Definition                   | Target (V2 Launch)       |
| ------------------------ | ---------------------------- | ------------------------ |
| **D30 Retention**        | % users active on Day 30     | >20% (vs. industry 5-8%) |
| **Intervention Success** | % correct post-AI hint/drill | >90%                     |
| **Session Completion**   | % started sessions finished  | >95%                     |
| **Mnemonic Engagement**  | Avg. custom/shared per user  | >2 per session           |

---

## 2. MARKET & GROWTH STRATEGY

**Positioning Statement:**
For serious Japanese learners tired of forgetting Kanji and sounding unnatural, WatashiWa is the AI coach that builds unbreakable memory networks via personalized mnemonics and pitch drills, unlike Anki (tedious) or Duolingo (inaccurate).

**Growth Loop (Anti-Churn Focus):**

- **Promise:** "Remember 3x Faster" – AI adapts to your brain, turning pain into "Aha!" wins.
- **Hook:** Daily absurd stories and graph unlocks for dopamine.
- **Safety Net:** Forgetting curve reminders; throttle overload.
- **Monetization Model (Dojo Tiers):**

  | Tier               | Price    | Features                                      | Rationale                                        |
  | ------------------ | -------- | --------------------------------------------- | ------------------------------------------------ |
  | **Ronin (Free)**   | $0       | Basic SRS, core vocab                         | Entry funnel; hooks with teasers.                |
  | **Samurai (Paid)** | $7.99/mo | AI mnemonics, pitch sim, graphs; 14-day trial | Value in personalization; target 20% conversion. |

**Acquisition Tactics:** Content marketing (YouTube retention hacks, Reddit AMAs); partnerships (iTalki for speaking integration); viral shares of user mnemonics.

**Business Risks:** AI inaccuracies – Mitigate with human QA/curation. Low TAM – Focus Vietnamese market first.

---

## 3. UX/UI STRATEGY: ZEN MASTERY

**Voice Tone:** Calm, empowering (e.g., "Unlock your network" vs. "Try again").

**Design Language:**

- **Colors:** Indigo (focus), Matcha Green (mastery), Vermilion (alerts/pitch highs).
- **Layout:** Minimalist; interactive graphs (e.g., tap to explode Kanji).
- **Micro-Copy Guidelines:**

  | Scenario       | Copy Example                          | Rationale           |
  | -------------- | ------------------------------------- | ------------------- |
  | Hint Reveal    | "Build the link: Person + Tree = ?"   | Encourages recall.  |
  | Story Unlock   | "Today's absurdity: Cat's adventure." | Fun retention hook. |
  | Pitch Feedback | "Nail the rise – Try again?"          | Gentle correction.  |

**Onboarding Flow:**

1. Baseline quiz (pitch/Kanji).
2. AI mnemonic demo.
3. First graph build.

**Just-in-Time UX:** Faded "Hint" buttons; post-session story rewards; hover for links.

---

## 4. SYSTEM ARCHITECTURE: 3-TIER BRAIN

**Rationale:** Smart Layer for AI decisions; scalable for personalization.

**Layers:**

| Layer            | Role            | Tech                      | Responsibilities                           | UX Integration        |
| ---------------- | --------------- | ------------------------- | ------------------------------------------ | --------------------- |
| **Persistence**  | Vault           | Postgres + JSONB/pgvector | Store graphs, mnemonics, user data.        | N/A                   |
| **Smart Layer**  | AI Orchestrator | Node.js + GPT API         | Generate mnemonics/stories, analyze pitch. | Real-time feedback.   |
| **Presentation** | Stage           | Next.js                   | Render visuals, interactions.              | Smooth graphs/audios. |

**Data Flow:** User input → AI process → Render/update graph.

---

## 5. DATA ARCHITECTURE: HYBRID SQL + VECTOR

**Choice:** Postgres for relations; pgvector for semantic graphs/mnemonics.

**Key Models:**

| Model              | Purpose    | Key Fields                                                                                                                |
| ------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Vocabulary**     | Word data  | id, tags, han_viet_info (JSONB: radicals, etymology), pitch_pattern, homonym_group_id, mnemonic_payload (JSONB: AI gens). |
| **CardVariant**    | Views      | variant_type, content_payload (JSONB: hints, stories).                                                                    |
| **UserReview**     | State      | srs_stage, stability, personal_mnemonic, forgetting_curve (JSONB: remind times).                                          |
| **KnowledgeGraph** | Links      | user_id, nodes (JSONB: words/relations), embeddings (Vector: for similarity).                                             |
| **ReviewLog**      | Analytics  | duration, correct, ai_interaction (Bool).                                                                                 |
| **DailyStudyStat** | Aggregates | daily_story (JSONB), graph_updates (Int).                                                                                 |

**Optimizations:** GIN on JSONB; vector indexes for graph queries. Forgetting curve algo in Smart Layer.

## 6. FUNCTIONAL SPECIFICATIONS

**Core Features (CUBE Implementation):**

### 6.1 Active Priming (C: Context)

- **Goal:** Provide comprehensible input (90% known words).
- **Levels:**
  - Unit: Narrative story (5-10% new words; inject from prior units + leeches).
  - Word: Mnemonic hook (e.g., EN: "SENSEI-tional wisdom"; VI: "TIÊN sinh").
- **Flow:** Start unit → Generate story (Smart Layer) → Highlight keys → Optional skip.
- **Constraints:** No overload; split long stories.

### 6.2 Dynamic Card Variants (U/E: Understanding/Encoding)

- **Matrix:**

  | SRS Stage    | Variant      | Front               | Back                      | Goal        |
  | ------------ | ------------ | ------------------- | ------------------------- | ----------- |
  | New (0)      | Standard     | Kanji + Audio       | Meaning + Etymology       | Acquisition |
  | Learning (1) | Audio_Match  | Audio               | Choices (Images/Meanings) | Listening   |
  | Review (2-3) | Context_Gap  | Sentence with blank | Word (Kanji)              | Recall      |
  | Leech (Fail) | Intervention | Confusion pair      | Explanation               | Repair      |

### 6.3 Interference Shield (B: Blocking)

- **Triggers:** Homonyms/pitch confusion (via homonym_group_id, pitch_pattern).
- **UI:** Pitch Visualizer (SVG line: high=overline/vermilion, low=gray).
- **Mode:** Comparison (side-by-side images/audio); Gamified sort (swipe left/right).
- **Feedback:** Haptic on errors; "Pattern conflict detected."

### 6.4 User Dashboard

- **Components:**
  - Kanji Heatmap: Grid colored by srs_stage (green=mastered, orange=learning, red=leech).
  - Focus Meter: Duration trends ("20% faster today").
  - Weekly Email: Summary from DailyStudyStat.

**Enhanced Features (Integrated for Mastery & Retention):**

### 6.5 Intelligent Scaffolding (Layered Hints for Active Recall)

- **Goal:** Rescue forgotten words without immediate reveal; promote "Aha!" moments.
- **Triggers:** User selects "Forgot" or "Rescue Me" (subtle button on card).
- **Mechanism (Smart Layer):**
  - Layer 1 (Visual): Show radicals (e.g., 休 = "Person" 亻 + "Tree" 木 → "Person leaning on tree").
  - Layer 2 (Context): Example sentence with word blanked.
  - Layer 3 (Audio): Muffled/initial sound only.
- **UX:** Progressive reveal; user inputs guess after each layer.
- **Rationale:** Forces effortful recall; triples retention vs. passive flip.

### 6.6 The Neural Link (Related Words Graph)

- **Goal:** Build associative networks; link new words to known ones.
- **Triggers:** Post-new-word review.
- **Mechanism:** Mini-graph from JSONB (han_viet_info): e.g., Gakkou links to Gakusei (shared "Gaku"), Koucho (shared "Kou").
- **UX:** Hover highlights connections; sidebar "Family Tree" on desktop.
- **Rationale:** Turns "new" into "recombined old"; builds system confidence.

### 6.7 Contextual Regeneration (Daily Absurd Stories)

- **Goal:** Reinforce leeches in quirky, emotional contexts; reduce repetition.
- **Mechanism (AI Factory - Nightly Batch):**
  - Gather 5 leeches + 15 mastered words.
  - GPT generates fun/absurd story (e.g., "Sensei used Hashi to grab apple for Samurai").
- **UX:** Unlocked post-review; "Today's Story" screen.
- **Rationale:** Emotional salience (quirkiness) + elaboration; creates daily hook.

### 6.8 Hán Việt & Etymology Deep Dive (Cognitive Hooks)

- **Goal:** Anchor new words to existing knowledge via logic.
- **Mechanism:** On tap, explode Kanji into radicals/etymology (e.g., Kouen = "Kou (Public)" + "En (Garden)" → "Public garden").
- **UX:** Integrated in card back; auto-suggest for Vietnamese users.
- **Rationale:** Reduces arbitrary links; enables inference (e.g., Doubutsuen from En).

### 6.9 The Absurd Example Engine (Emotional Salience)

- **Goal:** Make examples memorable via absurdity.
- **Mechanism:** GPT generates quirky sentences (e.g., "Cat drives tank to buy fish" vs. "Cat sleeps").
- **UX:** Replace textbook examples; optional "More Absurd" button.
- **Rationale:** Dopamine from humor; stamps memory emotionally.

### 6.10 Input First, Reveal Later (Forced Active Generation)

- **Goal:** Enforce recall before reveal.
- **Mechanism:** Hardcore mode: Require romaji/input or image select; then hints if wrong.
- **UX:** No immediate flip; "Try First" prompt.
- **Rationale:** Hyper-correction effect; deepens neural links.

**Revised Features for Depth:**

- **Recursive Priming:** Inject user leeches into new stories.
- **Etymology Constellation:** 3D star map visualizing root connections (e.g., 学 → 学生, 学校).
- **Interference Breaker:** Binary sort game on errors (split-screen, swipe).

---

**New/Enhanced USPs:**

### 6.11 AI Mnemonic Factory (Emotional Encoding)

- **Goal:** Create absurd, personalized mnemonics for vocab/Kanji.
- **Mechanism:** GPT generates based on user prefs (e.g., cultural refs); visualize as images/stories.
- **UX:** "Generate Mnemonic" button; rate/share for community.
- **Rationale:** From Quora/X; emotional hooks reduce forgetting.

### 6.12 Pitch Accent Simulator (Blocking Drills)

- **Goal:** Train natural pronunciation via AI.
- **Mechanism:** Record user; AI compares to native (waveform overlay); drills homonyms.
- **UX:** Interactive SVG (high/low pitches colored); gamified feedback.
- **Rationale:** Reddit/Duolingo pain; visualization fixes audio inconsistencies.

### 6.13 Personal Knowledge Graph (Understanding Networks)

- **Goal:** Visualize word links for inference.
- **Mechanism:** pgvector for semantic similarity; auto-add edges (e.g., shared radicals).
- **UX:** 3D interactive map; tap to quiz links.
- **Rationale:** X/ReminDO inspiration; combats isolation.

### 6.14 Phrase Immersion Extractor (Context Builder)

- **Goal:** Learn from real media.
- **Mechanism:** Upload video/news; AI extracts phrases, adds quizzes/mnemonics.
- **UX:** Integrated player with highlights; daily feeds.
- **Rationale:** Memento/Sottaku from X; real-world application.

### 6.15 Forgetting Curve Reminders (Retention Optimizer)

- **Goal:** Proactive recalls.
- **Mechanism:** AI calculates remind times; pushes stories/hints.
- **UX:** Notifications with mini-quizzes.
- **Rationale:** Research on spaced repetition; prevents churn.

**Revised Features:**

- Recursive Priming: Now includes graph links.
- Etymology Constellation: Merged into Knowledge Graph.
- Absurd Example Engine: Part of Mnemonic Factory.

---

## 7. NON-FUNCTIONAL REQUIREMENTS

**Performance:** AI gens <500ms; vector queries <100ms.
**Content Pipeline:** Nightly GPT batches; user-voted curation.
**Security:** Anon sharing; AI bias checks.

---

## 8. EXECUTION ROADMAP

**Milestone 0:** Core schema/AI setup.
**Milestone 1:** Mnemonics/Pitch features.
**Milestone 2:** Graphs/Immersion.
**Milestone 3:** Reminders/scale.

**Post-MVP:** Social hub; V3 neural (DKT).

---

## 9. FUTURE CONCEPT: V3 NEURAL CORE

**Shift:** Add predictive mnemonics via user data.

**Verdict:** V2 nails USPs; ready for niche win.
