# Testing Strategy: Startup Quality Stack

This document outlines the "Expert" testing strategy for WatashiWa. Our goal is **High Confidence** with **Low Maintenance**.

## 1. The Testing Hierarchy

We avoid the traditional "Testing Pyramid" and focus on the **Testing Trophy** model, prioritizing Integration and E2E tests over Unit tests.

| Layer | Tool | Purpose | What to Test |
| :--- | :--- | :--- | :--- |
| **Static** | TypeScript + Zod | Data Integrity | Type mismatches, API input validation. |
| **Integration** | Vitest + Real DB | Business Logic | Server Actions, Prisma queries, DB constraints. |
| **E2E** | Playwright | Money Makers | Critical user flows (Login -> Study -> Summary). |
| **Unit** | Vitest | Pure Logic | Mathematical algorithms (SRS), complex string parsing. |

---

## 2. Integration Testing (The Gold Standard)

Integration tests must use a **real database**. Do not mock Prisma or the Database.

### How to write an Integration Test

1. Create a file ending in `.integration.test.ts`.
2. Use `cleanDatabase()` in `beforeEach` to ensure a fresh state.
3. Call your **Server Action** directly.
4. Query the DB using `prisma` to verify the state changed as expected.

**Example:**

```typescript
import { prisma } from '@/lib/db';
import { cleanDatabase } from '@/lib/test-utils';
import { submitReview } from './study.actions';

describe('Submit Review (Integration)', () => {
  beforeEach(async () => await cleanDatabase());

  it('updates the card stability in the real DB', async () => {
    // 1. Arrange: Setup real data
    const card = await prisma.userReview.create({ ... });

    // 2. Act: Call the real action
    await submitReview({ cardId: card.id, rating: 3 });

    // 3. Assert: Check the real DB
    const updated = await prisma.userReview.findUnique({ where: { id: card.id } });
    expect(updated.stability).toBeGreaterThan(0);
  });
});
```

---

## 3. Playwright E2E (The Safety Net)

Focus on **Critical User Journeys (CUJs)**. Do not test every button.

- **Focus**: "Can the user finish a study session and see their progress?"
- **Avoid**: Testing if a modal opens/closes or if a button is red. That's a waste of time.

---

## 4. What NOT to Test (The Trash Pile)

To keep maintenance low, we **never** write:

1. **Component Unit Tests**: Testing if a component renders correctly is better handled by simply looking at it or a quick E2E test.
2. **Mock-heavy Hook Tests**: If a hook requires mocking 5 Server Actions to work, it’s a "Trap Test." Test it via E2E instead.
3. **Database Mocks**: Never use `jest-mock-prisma` or similar tools. They don't catch real DB errors like foreign key violations.

---

## 5. Summary Verdict

- **Write an Integration Test** if you are changing how data is saved.
- **Write an E2E Test** if you are adding a new core feature.
- **Write a Unit Test** if you are changing a complex mathematical formula.
- **Write NOTHING** if you are just changing the UI layout.

---

## 6. Strategic Test Scenarios (V2 "Smart CUBE")

To satisfy our [Retention-First Pivot](file:///Users/xuantruong/Documents/WORK/SIDE_PROJECTS/watashi-jp/docs/product_v2.md), we must prepare the following integration and E2E scenarios.

### 6.1 Core Logic & Smart Layer (Integration)

| Case ID | Input / Precondition | Perspective (Equivalence / Boundary) | Expected Result | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **INT-SP-01** | High Review Count (> Threshold) | Equivalence - Overload | `newCardsAvailable` returns 0. | Throttling protects against burnout. |
| **INT-SP-02** | Reviews = Threshold | Boundary - Exact | `newCardsAvailable` returns 0. | Exact limit check. |
| **INT-DV-01** | SRS Stage = 0 (New) | Equivalence - Stage 0 | Serves `Standard` variant. | Initial acquisition. |
| **INT-DV-02** | SRS Stage = 2 (Review) | Equivalence - Review | Serves `Context_Gap` variant. | Recall in context logic. |
| **INT-DV-03** | SRS State = Leech (Fail > 5) | Equivalence - Failure | Serves `Intervention` variant. | Pattern repair logic. |
| **INT-IS-01** | Learn Homonym B (A already learned) | Equivalence - Collision | `ComparisonMode` triggered in payload. | Interference shield logic. |
| **INT-IS-02** | Learn Homonym B (A NOT learned) | Equivalence - No Collision | `Standard` variant (No Comparison). | Avoid cognitive overload. |
| **INT-AN-01** | duration < 500ms | Boundary - Fast | Logged as "Automatic" fluency. | Fluency tracking. |
| **INT-AN-02** | duration > 3000ms (Correct) | Equivalence - Hesitation | Logged as "Struggle" (Hesitation). | Detects hidden weakness. |
| **INT-PE-01** | pitch_pattern = NULL | Boundary - NULL | Defaults to Heiban (0) render. | Robustness against missing data. |
| **INT-PE-02** | pitch_pattern = 99 (Invalid) | Boundary - Out of range | Validation error logic triggered. | Constraint check. |
| **INT-SD-01** | deletedAt != NULL | Equivalence - Soft Delete | Card excluded from `getReviewQueue`. | Data safety check. |
| **INT-ERR-01** | DB Timeout during sync | Abnormal - Dependency Failure | Safe rollback + user friendly error. | Reliability check. |
| **INT-ERR-02** | Invalid UUID for deckId | Abnormal - Invalid Format | Zod returns "Validation Failed". | Type safety check. |
| **INT-SEC-01** | Non-Admin calls `approveContent` | Abnormal - Security | returns `Unauthorized` or `403`. | Authorization boundary. |
| **INT-CON-01** | Double Review Submit (Race Condition) | Abnormal - Concurrency | Only one log recorded; state remains consistent. | Prevents duplicate XP/Stats. |
| **INT-SYN-01** | `syncUser` fails mid-transaction | Abnormal - Atomic Failure | No partial user record created in Prisma. | Data integrity (Auth). |
| **INT-QA-01** | Content set to `FLAGGED` | Equivalence - Quarantine | Item removed from ALL active queues instantly. | Content safety/QA. |

### 6.3 Scale & Performance (The 10k Challenge)

| Case ID | Metric / Scenario | Target | Perspective | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **PERF-RT-01** | `getReviewQueue` Latency | < 200ms | 95th Percentile | Ensures "Zen" speed. |
| **PERF-LD-01** | 1000 Concurrent Writes | No Deadlocks | Stress Test | Verifies DB connection pool. |
| **PERF-AI-01** | AI Batch Worker | Async / Non-blocking | Background Process | Ensures AI factory doesn't slow UI. |
| **PERF-CD-01** | Image/Audio CDN Cache | < 100ms | Edge Delivery | Global performance check. |

### 6.4 Critical User Journeys (E2E)

| Case ID | Scenario | Precondition | Expected Success |
| :--- | :--- | :--- | :--- |
| **E2E-AP-01** | Active Priming Block | Start New Unit | Modal blocks flashcards until 3 words clicked. |
| **E2E-PP-01** | Pitch Perfect Challenge | Swipe Left (Atamadaka) | Haptic success + score increment. |
| **E2E-DB-01** | Dashboard Heatmap Sync | Finished 10 reviews | Heatmap cell for today turns green instantly. |

---

## 7. Execution & Coverage

- **Commands**: `pnpm test:integration` (Local) / `pnpm e2e` (Playwright).
- **Goal**: 100% Branch Coverage for `Smart Layer` decisions (Throttling, Variant Selection).
