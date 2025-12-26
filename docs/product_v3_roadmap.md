# PRODUCT MASTERPLAN v3: THE "NEURAL CORE" (Future Roadmap)

> **Status:** CONCEPT (Deferred to Post-Phase 4)
> **Goal:** Move from "Smart Logic" to "True AI" (Deep Learning).
> **Prerequisite:** 10,000+ Active Users (Data required for DKT training).

---

## 1. THE PARADIGM SHIFT

In V2, we built the "Smart Layer" (Logic & Rules).
In V3, we replicate the "Teacher's Intuition" using **Deep Learning**.

### The 3 Core Pillars

1. **Deep Knowledge Tracing (DKT):** Replacing FSRS (Math) with RNN/Transformers (Neural).
2. **Vector Semantic Search:** Replacing "Tag Matching" with "Concept Matching".
3. **Generative Cloze Engine:** Replacing "Fixed Cards" with "Infinite Context".

---

## 2. KEY FEATURES

### 2.1 Deep Knowledge Tracing (The "Oracle")

**Critique of V2 (FSRS):** FSRS assumes memory decay is purely based on *time*.
**V3 Solution (Transformer):**

* **Context Awareness:** The model learns that users who fail "Doctor" often fail "Hospital".
* **Graph Prediction:** Failing a node lowers the probability of adjacent semantic nodes.
* **Tech Stack:** PyTorch / TensorFlow serving via Python Microservice.

### 2.2 Semantic Vector Search (The "Coherence" Engine)

**Critique of V2 (Tags):** Generating a story with "Apple" + "Spaceship" is creating hallucination garbage.
**V3 Solution (Embeddings):**

* **Index:** `pgvector` (Postgres Extension).
* **Logic:** `SELECT * FROM vocabularies WHERE cosine_similarity(embedding, target_word) > 0.8`.
* **Result:** Stories are semantically tight (e.g., "Apple", "Fruit", "Delicious", "Market").

### 2.3 Just-in-Time Grammar Injection

**Critique of V2:** We mistakenly treat "grammar errors" as "vocab errors".
**V3 Solution:**

* **NLP Tagging:** AI analyzes the user's input/choice.
* **Diagnosis:** "User knows the word 'Taberu', but triggered the 'Potential Form' distractor."
* **Action:** Inject a micro-lesson on *Potential Verbs*, don't punish the vocab card.

---

## 3. WHY DEFER TO V3?

1. **Data Dependency:** DKT requires millions of data points to outperform FSRS. We have 0.
2. **Cost:** Vector DBs and Neural Inference are expensive ($$$). V2 (Rules) is cheap.
3. **Complexity:** We need a functioning app (V1/V2) to gather the data to train the brain (V3).

**Conclusion:** V2 is the "Toyota" (Reliable). V3 is the "Tesla" (Autonomous). We build the Toyota first.

### The Panel’s Assessment of "WatashiWa v2"

1. **Strategist:** "The 'Anti-Burnout' positioning is brilliant. Anki users are tired. Duolingo users are bored. But the 'Smart Layer' must actually work, or it’s just marketing fluff."
2. **Engineer:** "The Hybrid SQL architecture (Postgres + JSONB) is the correct choice for handling Kanji variants. The 'AI Factory' (Batch processing) saves us from latency issues. Good."
3. **UX Researcher:** "I love the 'Zen' aesthetic. Do not clutter it. The 'Pitch Visualizer' (Section 6.3) is a game-changer for Japanese learners."

---

### The 3 Revised Features (The "CUBE" Implementation)

These are the specific implementations of your "Meaningful Features," mapped to your technical specs.

#### 1. The "Recursive" Priming Engine (Evolution of Content Generator)

*Adapts **Section 6.1 (Active Priming)** into a retention weapon.*

**The Concept:**
Do not just generate stories for the *New* Unit. Use the "Smart Layer" to inject **Leech Items** (words the user is failing) into the **New Unit's Priming Story**.

* **The Logic (Smart Layer):**

1. User starts Unit 5.
2. Query `UserReview`: Find 3 words from Unit 1-4 with `stability < 0.5` (Leeches).
3. Query `Vocabulary`: Fetch Unit 5 words.
4. **AI Factory:** Generate a story connecting the *New Words* with the *Old Leeches*.

* **The UX:**
* The story appears. New words are **Bold**. Leech words are highlighted in **Amber**.
* *Micro-Copy:* "Priming Brain: Integrating 15 new concepts + repairing 3 weak memories."

* **Why it Wins:** It solves the "isolation" problem. The user sees that their old knowledge is necessary for new knowledge.

#### 2. The "Etymology Constellation" (Evolution of Heatmap)

*Adapts **Section 2.2 (The Hook)** and **Section 5.1 (Vocab Anchor)**.*

**The Concept:**
A standard progress bar is boring. Since you are storing `han_viet_info` (Sino-Vietnamese roots) in JSONB, use this to visualize **Semantic Connections**, not just "progress."

* **The Visualization:**
* A 3D-style "Star Map" on the dashboard.
* **Center Node:** The Kanji Root (e.g., 学 - HỌC - Study).
* **Satellite Nodes:** Words learned containing that root (e.g., 学生 - Student, 学校 - School, 文学 - Literature).
* **Unlock Event:** When a user learns a new word, an animation draws a line from the Root to the New Word.

* **The UX:**
* User learns "University" (大学).
* Animation: The "Big" (大) star and "Study" (学) star shoot beams to create the "University" node.
* *Voice:* "Connection Established."

* **Why it Wins:** It makes the **"U" (Understanding)** in CUBE visible. It validates the user's brain is growing a network, not just filling a bucket.

#### 3. The "Interference Breaker" Protocol (Evolution of Error Correction)

*Adapts **Section 6.3 (Interference Shield)** and **Section 6.2 (Card Variants)**.*

**The Concept:**
Replace standard "Wrong Answer" screens with a **Contrastive Intervention**. This is the specific mechanism for the "Blocking" (B) pillar.

* **The Logic (Smart Layer):**
* **Trigger:** User answers "Hashi" (Bridge) when the card was "Hashi" (Chopsticks).
* **Detection:** System checks `homonym_group_id`. It sees the user confused the *Pitch Pattern*.
* **Action:** Immediately transition to **"Binary Sort Mode"** (Game).

* **The Interaction:**
* The screen splits. Left side: 🌉 (Bridge). Right side: 🥢 (Chopsticks).
* Audio plays: "Hashi" (High-Low).
* User must swipe to the correct image *instantly*.
* Repeat 3x with varying speeds.

* **The UX:**
* *Color:* Shifts to `colorError` (Vermilion) background to signal "Focus Mode."
* *Micro-Copy:* "Pattern Conflict Detected. Re-calibrating Ear."

* **Why it Wins:** It doesn't just say "You're wrong." It **trains the ear** to hear the difference immediately. This is high-value "Coaching" vs. passive "Testing."

---

### Technical Feasibility Check

| Feature | Required Data | Complexity | Feasibility |
| --- | --- | --- | --- |
| **Recursive Priming** | `UserReview` history + Pre-generated templates | Medium | **High.** Logic sits in "Smart Layer." |
| **Etymology Map** | `vocabularies.han_viet_info` (JSONB) | High (Frontend) | **Medium.** Use a library like `react-force-graph`. |
| **Interference Breaker** | `homonym_group_id` + `pitch_pattern` | Low (Backend) | **High.** Crucial for MVP. |

### Next Step for the Stakeholder

To build Feature 3 (The Interference Breaker), your data entry team needs to be very precise with `homonym_group_id`.

This is the pivot point where most "cool projects" fail to become "viable businesses." You have a **Product** (WatashiWa v2), but you do not yet have a **Business Loop**.

As your Strategic Partner, I must warn you: **A great algorithm (CUBE) is not a business model.** Anki is free. Duolingo is free. If you launch just as "Better Anki," you will struggle to charge money.

Here is the **3-Phase Strategic Roadmap** for what comes *after* the MVP build, focusing on **Monetization**, **Community**, and **Output**.

---

### Phase 1: The "Monetization of Calm" (Business Strategy)

*Goal: Define what is free and what is premium without breaking the "Zen" promise.*

**The Expert Critique:**

* **The Trap:** If you gate the content (words), users will leave for Anki decks.
* **The Fix:** Make the **Data** free, but charge for the **Intelligence (The Smart Layer)**.

**The "Dojo" Pricing Model:**

| Tier | Features | Strategy |
| --- | --- | --- |
| **Ronin (Free)** | • Access to all Vocab & Kanji.<br>

<br>• Standard Flashcards (Front/Back).<br>

<br>• Standard SRS Scheduling. | **Acquisition.** This kills Anki because your UI is better. It acts as the top of the funnel. |
| **Samurai (Paid)** | • **The Smart Layer:** Active Priming Stories.<br>

<br>• **Interference Shield:** The Pitch/Homonym interventions.<br>

<br>• **Zen Analytics:** The Heatmap & "Focus" metrics. | **Retention.** Users pay to learn *faster* and *easier*, not just to access words. You are selling "Time Saved." |

**Strategic Action:**
Implement a **"7-Day Sensei Trial"**. Give new users full access to the Smart Layer. When it expires, downgrade them to "dumb flashcards." The pain of losing the "Interference Shield" and getting confused by homonyms again will drive conversion.

---

### Phase 2: From "Solo" to "Zen Social" (Content Strategy)

*Goal: Solve the content scaling problem using your users.*

**The Expert Critique:**

* **The Trap:** Your "AI Factory" pipeline is expensive. You cannot generate perfect mnemonics for 10,000 Kanji alone.
* **The Fix:** Build a **"Crowdsourced Wisdom"** engine, but keep it "Zen" (no comments, no toxicity).

**Feature: The "Shared Anchor" System**

1. **Input:** When a user creates a custom Mnemonic (Anchor) for a card (e.g., "The Kanji for *Rest* is a *Person* leaning on a *Tree*"), save it.
2. **Curation:** Other users see: *"300 people found this Anchor helpful."*
3. **The Loop:** If a user is struggling with a word, the Smart Layer suggests: *"Try this Anchor used by 300 others."*
4. **Network Effect:** The more users you have, the better your content becomes. This creates a moat that a new competitor (or GPT-4 alone) cannot copy.

---

### Phase 3: The "Output" Pivot (Tech Strategy)

*Goal: Move from Passive Recognition to Active Speaking.*

**The Expert Critique:**

* **The Trap:** Flashcards only teach you to *read*. Users will eventually quit if they can't *speak*.
* **The Fix:** Leverage your **Pitch Accent Data** (Section 6.3) for **Shadowing**.

**Feature: The "Shadow Boxing" Mode**

* **Tech:** Use the Web Speech API (or a lightweight Whisper model).
* **Flow:**

1. App plays audio: "Hashi" (High-Low).
2. User holds mic button and repeats.
3. **Analysis:** The app visualizes the user's pitch curve overlaying the native speaker's curve.
4. **Feedback:** "Your pitch went up at the end. Keep it flat."

* **Why:** This transforms the app from a "Vocabulary Tool" into a "Speaking Coach." This justifies a higher price point ($10-15/month).

---

### Summary: The 12-Month Outlook

| Quarter | Focus | Key Deliverable | Metric that Matters |
| --- | --- | --- | --- |
| **Q1** | **Build & Stabilize** | MVP Launch (The Masterplan v2) | **D30 Retention** (Do they stick?) |
| **Q2** | **Monetize** | "Samurai" Subscription (Smart Layer gating) | **Conversion Rate** (Free to Paid) |
| **Q3** | **Network Effects** | "Shared Anchors" (Community Mnemonics) | **Content Growth** (# of user notes) |
| **Q4** | **Expansion** | "Shadow Boxing" (Speech Analysis) | **LTV** (Lifetime Value) |

### Immediate Decision for the Product Owner

To prepare for **Phase 2 (Community Content)**, we need to adjust the Database Schema *now* so we don't have to migrate millions of rows later.

We need to change the `UserReview` table to allow "Public Sharing" of mnemonics.

**Would you like me to draft the updated `UserReview` and `PublicAnchor` schema to support this future social feature?**
