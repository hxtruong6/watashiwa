# PHASE 4 MASTER PLAN: The "Optimizer" (Scale, Analytics & Performance)

> **Status:** FORECAST (Post-Phase 3)
> **Goal:** Transition from "Feature Complete" to "Production Scale".
> **Key Deliverable:** Sub-100ms Latency, Deep User Intelligence, and Automated Content Ops.

---

## 1. EXECUTIVE SUMMARY

Having established the **Core Mechanics** (Phase 1), **Intervention Logic** (Phase 2), and **Content Engine** (Phase 3), Phase 4 is dedicated to **System Hardening**.

We are no longer building features; we are building **Confidence**.

- **Performance:** The "Smart Layer" (Intervention + Story) adds overhead. We must optimize it back to < 100ms.
- **Intelligence:** We need to prove our "Retention First" hypothesis with hard data (Cohorts).
- **Operations:** We need tools to manage thousands of AI-generated stories.

---

## 2. TECHNICAL SPECIFICATIONS (The "Engine Room")

### 2.1 Caching Strategy (Redis)

**Problem:** `fetchSession` currently hits Postgres for every card, performing complex `UserReview` joins and `StoryLog` checks.
**Solution:** Implement a **Write-Through Cache** for active sessions.

- **Session Queue:** Store the next 20 Card IDs in Redis `List` (`session:{userId}`).
- **User Profile:** Cache `srs_stage` summary to render Dashboard instantly.
- **Invalidation:** `submitReview` updates Postgres AND invalidates the Redis cache key.

### 2.2 Database Optimization

**Audit:**

- [ ] **Index Review:** Ensure `@@index([userId, nextReviewAt, srsStage])` covers 90% of queries.
- [ ] **JSONB Indexing:** Create GIN indexes on `Vocabulary.han_viet.chars` to support "Search by Radical".
- [ ] **Partitioning:** If `UserReview` grows > 1M rows, physically partition by `userId` (hash).

### 2.3 Analytics & Observability (PostHog / OpenTelemetry)

We move beyond "Debug Console".

**Key Metrics to Track:**

1. **Retention Loop:** `App Open` -> `Story Read` -> `Session Complete`. (Funnel Analysis)
2. **Intervention Efficacy:** Does showing an Intervention Card reduce the failure rate of that word in the _next_ session?
3. **Content Health:** "Skip Rate" on Stories. If > 50%, the content is boring.

---

## 3. UX Features: The "Intelligence" Dashboard

Phase 4 exposes the "Brain" to the user.

### 3.1 The "Mastery Heatmap"

- **Visual:** A contribution-graph style grid (GitHub style), but for **Kanji Mastery**.
- **Colors:**
  - Gray: Not started.
  - Indigo: Learning.
  - Green: Mastered (Mature).
  - Red: Critical (Leech).
- **Function:** Tapping a Red square instantly launches a "Leech Repair" session.

### 3.2 The "Admin God Mode"

For our internal team (and trusted community mods).

- **Content Review:** Interface to approve/reject AI-generated stories.
- **Hallucination Flagging:** One-click rollback for reported content.
- **Global Stats:** "Avg Reviews per User Today".

---

## 4. EXECUTION PLAN (Sprint 4)

### Milestone 4.1: The Performance Tuner

- [ ] **Install Redis:** Setup Upstash or local Redis container.
- [ ] **Cache Layer:** Implement `SessionCacheService`.
- [ ] **Load Test:** Simulate 100 concurrent users using `k6`. Aim for p99 < 200ms.

### Milestone 4.2: The Analyst

- [ ] **Integrate PostHog:** Add providers to Client/Server components.
- [ ] **Define Events:** Standardize naming (`user_review_submitted`, `story_completed`).
- [ ] **Dashboard:** Build the "Mastery Heatmap" component (`src/modules/stats/components/Heatmap.tsx`).

### Milestone 4.3: The Operator

- [ ] **Admin Route:** `/admin/stories`. (Protected `role=ADMIN`).
- [ ] **Editor UI:** A simple WYSIWYG to edit Story JSON content directly.

---

## 5. SUCCESS METRICS (The "Exit" Criteria)

1. **Latency:** Dashboard loads in < 100ms (P95).
2. **Scale:** System creates 0 DB errors under 500 concurrent Reviewers.
3. **Insight:** We can answer: _"Which specific story caused the highest retention spike?"_
4. **Stability:** 99.9% Uptime during deployment of new AI content batches.
