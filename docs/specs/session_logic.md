# Specification: Session Queue Logic (The "Smart Brain")

> **Goal**: Determine exactly *what* the user studies when they hit "Start".
> **Principle**: "Retention First" (Review > New).

## 1. The Core Algorithm: `getReviewQueue(userId)`

When the user requests a session, the system follows this waterfall priority:

### Priority 1: Due Reviews (The "Debt")

* **Query**: Fetch all `UserReview` items where `next_review <= NOW()` and `state != 'RELEARNING'`.
* **Limit**: Up to User's Daily Review Limit (e.g., 100).
* **Sort**: Randomize (Interleaving practice is better than blocked).
* **Logic**:
  * IF `count > 0`: Return this batch.
  * *User Experience*: "Clearing the backlog."

### Priority 2: Relearning (The "Leaks")

* **Query**: Fetch all `UserReview` items where `state == 'RELEARNING'`.
* **Logic**:
  * These are high-priority/urgent. They are usually mixed into Priority 1, but if the user has ONLY failures, we serve them immediately.

### Priority 3: New Lessons (The "Growth")

* **Condition**: ONLY if Priority 1 & 2 are empty (or below a "New Card Buffer").
* **Source**:
  * **Option A (Explicit Deck)**: If user clicked "Study" on a specific Deck Page.
  * **Option B (Last Active)**: If user clicked "Start" on Dashboard, continue the *Last Touched Deck*.
  * **Option C (Default)**: If no history, prompt user to pick a deck (or default to N5 Unit 1).
* **Limit**: User's Daily New Card Limit (e.g., 10).

---

## 2. Corner Cases & User Stories

### Story A: The "Morning Commute" (Mixed Session)
>
> User has 5 Reviews due and wants to learn 5 New words.

* **System**: Mixes them?
* **Decision**: **No.** We prioritize Reviews first. "Finish your vegetables before dessert."
* *Why?* If we mix New words into a heavy Review pile, the user gets overwhelmed.
* *Exception*: If Review count is low (< 10), we can append New cards to the end of the session queue.

### Story B: The "Bing" (Empty Queue)
>
> User has 0 Reviews, 0 New Cards (in current deck).

* **UI**: "All caught up!"
* **Action**: Suggest "Review Ahead" (Study cards due in future) OR "Pick new Deck".

---

## 3. Data Loading Strategy

To keep the UI snappy (`< 200ms`), we use a **Cursor Cursor** strategy.

1. **Initial Load**: Server Action fetches first 10-20 cards.
2. **Client Store**: `useSessionStore` initializes with these 20 cards.
3. **Background**: `useSessionStore` silently asks for next batch when `queue_remaining < 5`.

### API/Action Signature

```typescript
// src/modules/study/actions/getReviewQueue.ts

interface QueueRequest {
  deckId?: string; // Optional. If missing, implies "Global/Last Active"
  mode?: 'REVIEW' | 'LEARN' | 'HYBRID'; // Default HYBRID (Review then Learn)
}

interface QueueResponse {
  items: SmartCard[];
  stats: {
    reviews_count: number;
    new_count: number;
  };
}
```

## 4. Dashboard Integration

The "Start Review" button on Dashboard does not know about Decks. It is a **Global Start**.

* **Logic**:
    1. Call `getReviewQueue({ mode: 'HYBRID' })`.
    2. Server finds due reviews across *ALL* decks.
    3. If no reviews, Server looks up `User.last_studied_deck_id`.
    4. Fetches new cards from that deck.

## 5. Technical Implementation Steps

1. **DB Query**: `prisma.userReview.findMany(...)`.
2. **Mapper**: Convert to `SmartCard` using `study.mapper.ts`.
3. **Variant Selection**: For Reviews, decide `GAP_FILL` vs `BASIC` (Smart Layer).
    * *Phase 1*: Always `BASIC`.

---

## 6. Implementation Verification (Handled Scenarios)

### 6.1 Core Scenarios

| Scenario | Logic Applied |
| :--- | :--- |
| **New User (No history)** | System defaults to the **First Deck** (sortOrder: 0). |
| **Recurring User (Dashboard)** | System infers "Active Deck" from the **most prominent UserReview**. |
| **Deck Page Context** | If started from `/decks/[id]`, that specific Deck ID is enforced. |
| **Mixed Session** | If Reviews < 50, system auto-fills with New Cards to maximize efficiency. |

### 6.2 Edge Cases & Safety

| Edge Case | Handling Strategy |
| :--- | :--- |
| **"All Caught Up"** | Returns `source: 'EMPTY'`. UI should show "Zen Circle" or "Review Ahead" option. |
| **No Decks in DB** | Returns `source: 'EMPTY'` safely (no crash). |
| **Unverified Content** | `New Card` query *strictly* filters for `VERIFIED` or `PUBLISHED` status. Drafts are never shown. |
| **Daily Limit Reached** | (Planned Phase 2) Logic will hard-stop if `DailyStudyStat` exceeds limit. |
