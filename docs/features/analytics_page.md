# Feature Specification: WatashiWa Intelligence Engine (Analytics)

| Metatdata    | Details                        |
| :----------- | :----------------------------- |
| **Status**   | 🏗️ Architecture Phase          |
| **Owner**    | Senior Product Engineering     |
| **Priority** | P1 (Post-MVP)                  |
| **Scope**    | `/analytics` Route + API Layer |

---

## 1. Executive Summary

The Analytics Dashboard is not merely a collection of charts; it is the **feedback loop** that drives user retention. In Spaced Repetition Systems (SRS), two failure modes exist:

1. **Burnout**: User adds too many cards, review load becomes unmanageable.
2. **Drift**: User studies inconsistently, forgetting curve accelerates.

**The "Intelligence Engine" solves this by:**

- **Visualizing the "Review Wave"**: Preventing burnout by showing future workload.
- **Gamifying Consistency**: transforming abstract "study time" into tangible "heatmaps" (The "GitHub Effect").
- **Proving Mastery**: Validating user effort with concrete growth metrics (e.g., "You know 80% of N5").

---

## 2. Core Visualizations & Learning Science

### 2.1 The "Pulse" Heatmap (Consistency)

- **Concept**: A calendar view (GitHub style) showing study density over the last 365 days.
- **Psychology**: Leverages the _Seinfeld Strategy_ ("Don't break the chain").
- **Technical Spec**:
  - **Data Source**: `StudyLog` table (aggregated by `date(created_at)`).
  - **Metric**: `reviews_count` (intensity color) and `date`.
  - **Edge Case**: Timezone handling is critical. Aggregation must happen in **User Local Time**, not UTC, to prevent "midnight drift" (studying at 1 AM counting for yesterday).

### 2.2 The "Future Wave" (Workload Forecasting)

- **Concept**: A histogram showing the number of cards due Tomorrow, Next 7 Days, and Next 30 Days.
- **Value**: **Crucial for SRS health.** If the "Tomorrow" bar is 500 cards, the user is in "Review Hell".
- **Actionability**: If the wave is too high, the UI should suggest: _"Pause new cards for a few days."_
- **Query Logic**: `SELECT due_date, COUNT(*) FROM cards WHERE state = 'review' GROUP BY due_date`.

### 2.3 True Retention Rate (Quality of Learning)

- **Concept**: A line chart showing `% Correct` answers over time.
- **Insight**:
  - Target: **85-90%**.
  - `< 80%`: Material is too hard (or user is rushing).
  - `> 95%`: Material is too easy (User needs to increase difficulty/interval).
- **Filter**: Breakdown by `Deck` (Is "Kanji" harder than "Vocab"?).

### 2.4 The JLPT Radar (Proficiency Mapping)

- **Concept**: A radar or multi-bar chart mapping user's explicit vocabulary against JLPT datasets (N5-N1).
- **Data Engineering**: Requires a background job or expensive query joining `UserCards` against a `JLPT_Master_List`.
- **Optimization**: Compute mostly asynchronously or cache heavily (Redis/Vercel KV).

---

## 3. Technical Architecture

### 3.1 Data Aggregation Layer vs. Live Queries

Raw queries on `StudyLog` (which grows linearly with every review) will kill performance.

- **Anti-Pattern**: `SELECT * FROM study_logs` on page load.
- **Solution**: **Materialized Views** or **Incremental Aggregation**.
  - Create a `DailyStats` table: `{ user_id, date, reviews_count, retention_rate, time_spent }`.
  - Update this table via a Cron Job (midnight) or Server Action trigger (end of session).

### 3.2 Frontend Performance

- **Libraries**:
  - **Recharts**: SVG-based, easy to use, responsive. Good for simple bar/line charts.
  - **Visx (Airbnb)**: Low-level, D3-based. Best for custom interactions (Heatmaps).
- **Rendering**: Client-side only (`useClient`). Skeleton loaders are mandatory as analytics queries take 500ms+.

### 3.3 Database Schema Additions (Draft)

```sql
-- Optimized table for fast analytics lookup without scanning millions of logs
CREATE TABLE daily_user_stats (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  total_reviews INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  new_cards_learned INT DEFAULT 0,
  study_time_seconds INT DEFAULT 0,
  UNIQUE(user_id, date)
);
```

---

## 4. Implementation phases

### Phase 1: MVP (The "Happy Path")

- **Focus**: Motivation.
- **Deliverables**:
  1. Retention Heatmap (Last 90 days).
  2. Simple Pie Chart (New/Learning/Review).
  3. Total Study Time counter.

### Phase 2: The "SRS Health" Update

- **Focus**: Optimization.
- **Deliverables**:
  1. Review Forecast (The Wave).
  2. Retention Rate Line Graph.
  3. "Stop Adding Cards" Warning Banner.

### Phase 3: Proficiency (The "Flex")

- **Focus**: Mastery.
- **Deliverables**:
  1. JLPT Progress Bars.
  2. Global Leaderboards (Percentile ranking).

---

## 5. UI/UX "Zen" Guidelines

- **No Data Overload**: Do not show all 10 charts at once. Use a "Summary" tab and detailed sub-tabs.
- **Plain English Insights**: Don't just show a graph. Add textual analysis: _"You are crushing it! Your retention is 92%, which is top 10% of users."_
