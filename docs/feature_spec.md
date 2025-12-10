# Feature Specification

## 1. Golden Time SRS Logic (Modified SM-2)

The scheduler is the core of the application. It determines when a card should be reviewed next based on user performance.

### Inputs

- `current_interval` (days)
- `current_ease` (float, default 2.5)
- `rating` (0-3 scale):
  - 0: **Again/Fail** (Complete blackout)
  - 1: **Hard** (Correct but difficult, hesitated)
  - 2: **Good** (Correct with little effort)
  - 3: **Easy** (Perfect instant recall)

### Algorithm Pseudocode

```javascript
function calculateNextReview(card, rating) {
  let newInterval, newEase;

  if (rating === 0) {
    newInterval = 1; // Reset to 1 day (or 10 mins in session)
    newEase = Math.max(1.3, card.ease_factor - 0.2);
  } else {
    // Standard SM-2 calculation
    if (card.repetition_count === 0) {
      newInterval = 1;
    } else if (card.repetition_count === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(card.interval * card.ease_factor);
    }
    
    // Update Ease Factor
    // Formula: EF' = EF + (0.1 - (5-q)*(0.08+(5-q)*0.02))
    // Our rating q is 0-3, typical SM-2 is 0-5. mapping needed or simplified logic:
    // Simply: Ease changes slightly based on Hard/Good/Easy.
    if (rating === 1) newEase = card.ease_factor - 0.15;
    if (rating === 2) newEase = card.ease_factor;
    if (rating === 3) newEase = card.ease_factor + 0.15;
  }

  return {
    next_review: addDays(Date.now(), newInterval),
    interval: newInterval,
    ease_factor: Math.max(1.3, newEase)
  };
}
```

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
