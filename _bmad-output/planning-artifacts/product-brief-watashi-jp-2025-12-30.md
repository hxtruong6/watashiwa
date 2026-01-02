---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - docs/index.md
  - docs/project-overview.md
  - docs/architecture.md
  - docs/development-guide.md
  - docs/source-tree-analysis.md
  - docs/product_v2.md
  - docs/technical_spec.md
date: 2025-12-30
author: iDev
---

# Product Brief: watashi-jp

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

WatashiWa is a memory-first Japanese learning app for serious N5–N4 learners who are tired of “learning today, forgetting tomorrow.” Instead of treating vocabulary as isolated flashcards, WatashiWa builds a **personal Knowledge Graph** that turns words into durable memory networks—so learners can recall faster in context, avoid confusion (homonyms/pitch), and feel steady progress without burnout.

WatashiWa positions as **“Your AI Memory Coach”**: it combines a proven spaced repetition foundation with Smart CUBE (Context, Understanding, Blocking, Encoding), using AI to create richer connections and interventions when memory fails—without overwhelming users.

---

## Core Vision

### Problem Statement

Serious Japanese learners can make progress with existing apps, but they struggle to **retain vocabulary long-term** and **recall it naturally** (especially when words are similar, share readings, or require pitch/homonym discrimination). The result is frustration, churn, and a sense that effort doesn’t compound.

### Problem Impact

- Learners re-learn the same items repeatedly (“leaks” in memory), wasting time and motivation.
- Atomic practice without connections makes vocabulary feel endless and brittle.
- Confusions (homonyms/pitch/near-synonyms) create repeated errors and erode confidence.
- Without emotional/contextual hooks, studying becomes grindy—leading to inconsistent habits.

### Why Existing Solutions Fall Short

- **Anki-like SRS**: powerful scheduling, but weak at meaning-making—little built-in context, no guided “why,” and high manual effort leads to overload.
- **Duolingo-like paths**: engaging, but often too shallow for serious learners; limited depth on pitch/homonyms and weak “memory architecture.”
- **Single-focus tools** (Kanji-first, grammar-first, or list-first): strong in their lane but don’t unify _retention + context + interference handling + personalization_ into one coherent “memory system.”

### Proposed Solution

WatashiWa solves retention by making learning **networked and personalized**:

- Use SRS to schedule reviews, but treat each new item as a **node** that gets connected to what the learner already knows.
- Build a **Personal Knowledge Graph** (words, kanji/radicals, Hán Việt anchors, families, confusable pairs, and usage contexts).
- When the learner forgets or confuses items, the system intervenes using Smart CUBE:
  - **Context**: short priming stories and contextual exposure
  - **Understanding**: etymology/radical breakdowns and meaningful hooks
  - **Blocking**: interference shield for confusable sets (incl. pitch/homonyms)
  - **Encoding**: dynamic practice variants that force active recall

### Key Differentiators

1. **Knowledge Graph as the Must-Win Wedge**
   - Personal, evolving map of “what you know” and how new words connect
   - Turns isolated memorization into compounding understanding and recall

2. **Smart CUBE Interventions (not just “show answer”)**
   - When memory fails, provide layered help that drives “Aha” moments and corrects confusion

3. **AI as a Coach (not a gimmick)**
   - Generates personalized mnemonics/context and adapts interventions to learner patterns

4. **Beats the category by unifying the stack**
   - Retention (SRS) + connection (graph) + correctness (interference/pitch) + motivation (meaningful context)

## Target Users

### Primary Users

#### Persona 1 — Linh (Vietnamese university student, N5→N4 track)

- **Context:** 19–22, university student in Vietnam. Studies Japanese for JLPT + future opportunities. Has 30–60 minutes/day but competes with classes and exams.
- **Motivation / Goals:**
  - Pass JLPT N5 soon, then N4.
  - Build confidence that effort “sticks” (not endless re-learning).
  - Pronounce words correctly enough to feel “real” progress.
- **Current workflow / Workarounds:**
  - Uses Duolingo or random apps for momentum.
  - Tries Anki or lists but drops off when it becomes too dry/overwhelming.
  - Relies on guessing + repetition; rarely builds a mental “map” of vocabulary.
- **Problem experience (acute pain):**
  - Forgets new words quickly; feels like starting over.
  - Gets confused by words that look/sound similar:
    - same reading → different meanings (homonyms),
    - same kanji → different reading,
    - pitch patterns feel invisible and inconsistent.
- **Success vision (“this is exactly what I needed”):**
  - Within 3 days: “I remembered words I learned yesterday without struggling.”
  - Sees connections that create new knowledge: “Oh—these words are related because of kanji/radicals/Hán Việt.”
  - Feels calmer: fewer “I’m stupid” moments; more “Aha” moments.

#### Persona 2 — Tuấn (Vietnamese beginner who keeps confusing homonyms/pitch and wants clarity)

- **Context:** 18–30, beginner learner (late N5 / early N4). Cares about correctness and hates “false confidence” (knowing a word but using/pronouncing it wrong).
- **Motivation / Goals:**
  - Stop mixing up similar words and readings.
  - Build a reliable internal sense of meaning + pronunciation.
  - Learn in a way that compounds (connections), not just repetition.
- **Current workflow / Workarounds:**
  - Watches short videos / uses apps; learns fragments.
  - Replays audio but still can’t “see” pitch; confusion returns later.
- **Problem experience (acute pain):**
  - Confusion clusters repeat over time:
    - homonyms (same reading, different meaning),
    - kanji reading variants,
    - pitch accent uncertainty (“I can’t tell if I’m saying it right”).
- **Success vision (“this is exactly what I needed”):**
  - The app proactively detects confusion sets and trains them until stable.
  - Pitch/meaning clarity becomes automatic because the app makes the patterns visible and connected in memory.

### Secondary Users

- **All Japanese learner levels (N3+)** who still struggle with retention, nuance, or confusion sets and want a system that compounds knowledge.
- **Future expansion (out of scope for initial focus):** learners of other languages where “networked memory” and confusion handling can apply.

### User Journey

#### Discovery

- Finds WatashiWa via Vietnamese study communities, YouTube/TikTok learning content, JLPT prep groups, or “Anki burnout” discussions.

#### Onboarding

- Chooses: “Vietnamese-first mode”
- Sets a goal: N5 or N4
- Quick baseline: retention pain + confusion type (homonym / reading / pitch)

#### Core Usage (daily habit loop)

- **Study session → Knowledge Graph insight → Done**
  - Review queue (SRS-driven)
  - When confusion is detected: intervention drill (homonym/reading/pitch clarity)
  - After session: graph reveals new connections + “new knowledge” (Hán Việt / kanji/radical links)

#### Success Moment (first 3 days)

- Notices: “I remember new words easier”
- Experiences: “discover new knowledge” through connections (not just memorizing)
- Feels: fewer confusion mistakes; increased confidence

#### Long-term Routine

- Learner trusts the system: effort compounds because the graph grows with them
- Churn risk drops because progress feels meaningful, not grindy

## Success Metrics

We will measure success by whether Vietnamese-first N5/N4 beginners (1) retain vocabulary with less frustration and confusion, and (2) actively use the Knowledge Graph to discover connections that compound learning.

### User Success Metrics (Outcomes + Behaviors)

**30-day user outcome (definition):**
A successful learner can reliably recall and use beginner vocabulary (N5/N4 track) with fewer confusion mistakes, and can explain or recognize “why” a word is remembered (via connections like Hán Việt / kanji/radicals / related words).

**Retention & habit formation**

- **D1 retention** (return the next day)
  - Target: **55–65%** (baseline), **65%+** (stretch)
- **D7 retention**
  - Target: **25–35%** (baseline), **35%+** (stretch)
- **D30 retention**
  - Target: **12–18%** (baseline), **20%+** (stretch)
- **Active days per week (WAU/DAU habit signals)**
  - Target: **3+ days/week** (baseline), **4–5 days/week** (stretch)
- **Avg study sessions per week per active user**
  - Target: **3.0** (baseline), **4.0** (stretch)

**Learning quality (proxy outcomes)**

- **Session completion rate** (started session → completed)
  - Target: **90%** (baseline), **95%** (stretch)
- **Confusion reduction (homonyms / readings / pitch)**
  - Metric: % of users who reduce repeated mistakes on the same confusion set within 7 days
  - Target: **60%** (baseline), **75%** (stretch)
- **Intervention effectiveness**
  - Metric: % correct on the next attempt after an intervention drill
  - Target: **80%** (baseline), **90%** (stretch)

### Business Objectives

- **Establish Vietnam-first PMF signal**
  - Achieve baseline **D30 retention ≥ 12%** while maintaining healthy study frequency (≥3 sessions/week among active users).
- **Build a defensible wedge**
  - Knowledge Graph adoption and engagement meet baseline targets and correlate with lower confusion repeats.
- **Operational sustainability**
  - Keep support/report burden manageable (e.g., low rate of “incorrect content” reports per active users).

### Key Performance Indicators

**North-star KPI (early stage):**

- **D30 retention** (Vietnam-first N5/N4 beginners)

**Supporting KPIs (leading indicators):**

- **D7 retention**
- **Sessions/week per active user**
- **Session completion rate**
- **Confusion reduction rate**
- **Graph activation rate (first 7 days)**
- **Graph interactions per active week**
- **Intervention effectiveness**

**Measurement note (instrumentation):**
Track events like: `session_started`, `session_completed`, `graph_opened`, `graph_node_clicked`, `confusion_detected`, `intervention_started`, `intervention_completed`, and link them by user + session.

## MVP Scope

> Note: For this project, “MVP” refers to the **V1 production release scope** (not a minimal prototype). The goal is to ship the core product experience that fully delivers the Smart CUBE method (C/U/B/E) for Vietnamese-first N5/N4 beginners, anchored by the Knowledge Graph wedge.

### Core Features

**Core user loop (must work end-to-end):**

- **Study session (Smart CUBE) → Knowledge Graph insight → Done**

**CUBE method coverage inside the study session:**

- **C — Context (Active Priming):** short priming stories / contextual exposure aligned to the learner’s current level and review needs
- **U — Understanding:** etymology + kanji/radical breakdowns, with Vietnamese-first Hán Việt anchors when available
- **B — Blocking (Interference Shield):** detect and train confusion sets (homonyms / similar readings / pitch-related confusion) with targeted drills
- **E — Encoding:** dynamic practice variants that force active recall and reinforce the graph connections

**Product foundations required for production V1:**

- Authentication + onboarding with **Vietnamese-first mode** and N5/N4 goal setting
- Vocabulary/deck discovery and the ability to add content into a study plan
- SRS-driven review queue with a consistent rating flow (Again/Hard/Good/Easy) and session completion UX
- **Knowledge Graph UI** (nodes + relationships) with clear “why this is connected” explanations
- Graph-driven exploration: related words, confusable clusters, and next-best connections to study
- Analytics/instrumentation for the success metrics defined above (retention, sessions, graph activation, completion)
- Content quality workflow sufficient for production (admin/QA as needed to prevent incorrect/confusing content)

### Out of Scope for MVP

These features can ship later without blocking the core wedge:

- **Recording-based pitch simulator** (speech recording + AI feedback)
- **3D Memory Garden**
- **Paid tiers / monetization**

### MVP Success Criteria

MVP (V1 production) is considered successful if we meet the following as a coherent set:

- **D7 retention** meets the targets defined in Success Metrics
- **D30 retention** meets the targets defined in Success Metrics
- **Knowledge Graph activation rate** meets the targets defined in Success Metrics
- **Session completion rate** meets the targets defined in Success Metrics

### Future Vision

After V1 proves retention + graph wedge outcomes for Vietnamese-first beginners, expand by:

- Adding the recording-based pitch simulator to deepen pronunciation mastery
- Launching the 3D Memory Garden as an advanced visualization/motivation surface
- Introducing paid tiers once the product value is validated by retention + engagement outcomes
- Expanding beyond Vietnamese-first and beyond N5/N4 to broader learner levels and (later) other languages
