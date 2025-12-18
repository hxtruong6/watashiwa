# Product Obsession Strategy: The "WatashiWa" Observability Stack

> **Philosophy**: "You cannot improve what you cannot measure."
>
> In a high-performance engineering culture, observability is not just about logging errors—it is about **shortening the feedback loop** between a user's intent and our engineering execution.

This document outlines our strategy for achieving **Product Obsession** using our telemetry stack (PostHog + Sentry). This is not a tutorial; it is a framework for decision-making.

---

## I. The Three Pillars of Reality

We categorize observability into three distinct pillars. A healthy product requires coverage in all three.

### 1. The Quantitative Pillar (Telemetry)

**Tool**: PostHog
**Question**: _What is happening at scale?_

Data tells us **what** users are doing, but it is often devoid of context. We use it to identify patterns, bottlenecks, and conversion rates.

**Key Performance Indicators (KPIs):**

- **North Star Metric**: Weekly Active Learners (WAL) - Users who complete at least one review session per week.
- **Retention**: Day-1, Day-7, and Day-30 retention cohorts.
- **Feature Adoption**: % of active users engaging with new features (e.g., Audio Playback) within 7 days of release.

### 2. The Stability Pillar (Health)

**Tool**: Sentry
**Question**: _Is the system behaving as expected?_

Stability is the foundation of trust. If the app crashes, 100% of your UX work is wasted. We treat errors as **unplanned work** that must be prioritized based on impact.

**Zero-Tolerance Policy:**

- **P0 (Critical)**: Login blocked, Data loss, Core Review loop broken. -> **Immediate Drop-Everything Fix.**
- **P1 (High)**: Core features degraded but functional (e.g., Audio lag). -> **Fix in next sprint.**
- **P2 (Minor)**: Visual glitches, edge cases. -> **Backlog.**

### 3. The Qualitative Pillar (Empathy)

**Tool**: PostHog Session Replay
**Question**: _Why are they behaving this way?_

This is our empathy engine. It bridges the gap between massive data sets and individual user frustration.

**The "WTF" Protocol:**
When a metric looks wrong (e.g., "Why did 40% of users drop off at the Kanji Detail screen?"):

1. Filter Session Replays for that specific URL.
2. Watch 10-20 sessions at 2x speed.
3. Look for: Rage clicks, confusing UI patterns, or silent validation errors.

---

## II. Incident Response Framework

When Sentry fires an alert, we follow the **OODA Loop** (Observe, Orient, Decide, Act):

### 1. Observe (The Alert)

- **Trigger**: Sentry notifies `#engineering-alerts` via Slack/Discord.

* **Signal**: "Uncaught Exception in `FlashCard.tsx`: undefined is not an object".
* **Impact Assessment**: Check "Users Affected" count in Sentry. Is this one user on IE11, or 500 users on iPhone?

### 2. Orient (Context Gathering)

- **Link Trace**: Click the "Replay" button in Sentry to jump to the exact moment in PostHog where the error happened.

* **Context**: What happened _before_ the crash?
  - _Did they click the audio button rapidly?_
  - _Was their network flaky? (Check PostHog "Network" tab)_

### 3. Decide (Triage)

- Is this a P0/P1? (See defined policy above).

* If **YES**: Rollback deployment or hotfix immediately.
* If **NO**: Create a linear ticket, tag with `sentry-issue`, and schedule.

### 4. Act (Remediation)

- Write a failing test case that reproduces the bug.

* Fix the code.
* Verify the fix ensures the error count drops to zero.

---

## III. The "Weekly Pulse" Ritual

Senior engineers don't just write code; they own the outcome. We recommend a 30-minute "Product Pulse" review every Monday:

1. **Metric Check**: Are WALs up or down? Why? (PostHog Trends)
2. **Top Issues**: What are the top 3 errors by volume this week? (Sentry Issues)
3. **Empathy Session**: Watch 3 random sessions of a _new user_ signing up. Is the onboarding still smooth? (PostHog Replay)

---

> **Final Note**: Tools are useless without a culture of curiosity. When you see a weird dip in the graph, do not assume it's a "fluke". **Investigate it.** That is where the insights hide.
