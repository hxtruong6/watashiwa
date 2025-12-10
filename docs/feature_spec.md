# Feature Specification

## 1. Golden Time SRS Logic (FSRS v4+)

We use **FSRS (Free Spaced Repetition Scheduler)** via the `ts-fsrs` library. FSRS is a modern algorithm that adapts better to individual memory patterns than traditional SM-2.

### Library: `ts-fsrs`

- **Repo:** [https://github.com/open-spaced-repetition/ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)
- **Goal:** Minimize review load while maintaining high retention (target 90%).

### Usage Logic

```typescript
import { fsrs, generatorParameters, Rating } from 'ts-fsrs';

// Initialize Scheduler (Singleton)
const params = generatorParameters({ enable_fuzz: true });
const f = fsrs(params);

// 1. Calculate Next Review (on User Action)
// Input: Current Card, Rating (Again/Hard/Good/Easy)
const schedulingCards = f.repeat(card, new Date());

// Output: schedulingCards[Rating.Good].card -> New Card State
// Save updated 'card' to Database
```

### Rating Scale

- **1 (Again):** Forgot completely. Resets stability.
- **2 (Hard):** Correct but hesitated.
- **3 (Good):** Correct with little effort.
- **4 (Easy):** Perfect instant recall.

### Logic Test Data (Golden Data)

Use these scenarios to verify the scheduler is working correctly (approximate values as fuzzing adds randomness).

| Scenario     | Input (State)           | Rating      | Expected Outcome                                      |
| :----------- | :---------------------- | :---------- | :---------------------------------------------------- |
| **New Card** | New (State: 0)          | `Good` (3)  | Status: Learning, Due: ~10min/1day (depends on steps) |
| **Learning** | Learning (State: 1)     | `Good` (3)  | Status: Review, interval increases                    |
| **Review**   | Review, Stability: 5.0  | `Good` (3)  | Stability Increases (~7-10), Due: +Days               |
| **Lapse**    | Review, Stability: 20.0 | `Again` (1) | Stability Decreases sharply, Due: <1 day (Relearning) |

## 2. Exercise Modes

Interactions must be active.

### Type A: Listen & Write

- **Stimulus:** Audio auto-play.
- **Hidden:** All text fields.
- **Action:** User types reading (Kana) or uses Speech-to-Text.
- **Validation:** Exact match on `reading_kana`.

### Type B: Meaning Recall (Hán Việt Focus)

- **Stimulus:** Word Surface (Kanji) + Hán Việt.
- **Hidden:** Meaning, Reading by default.
- **Action:** Multiple Choice (1 Correct, 3 Distractors from similar SRS stage cards) OR Self-Grade (User reveals answer and selects "I knew it" or "I didn't").
- **Constraint:** For MVP, Self-Grade is safer and easier to implement than generating high-quality distractors.

### Type C: Cloze / Context

- **Stimulus:** `example_sentence` with target word masked (e.g. `_____`).
- **Hint:** Meaning of the sentence.
- **Action:** Type the conjugated form of the word.
- **Validation:** String match or simple AI check if rigorous.
