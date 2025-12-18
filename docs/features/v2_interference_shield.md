# Feature Spec: Smart Layer - Interference Shield (v2)

## 1. Overview

**Goal:** Prevent "Anti-Learning" (confusing similar words) by proactive intervention.
**Concept:** When a user struggles with a "High Risk" word (Homonym/Lookalike), stop the review and force a "Compare & Contrast" session.

## 2. Trigger Logic ("The Watchdog")

The `InterventionService` checks every wrong answer:

1. **User fails** Card A (`vocabId: A`).
2. **Check DB:** Does A have a `ConfusionPair` relation?
   - If NO: Continue normal SRS.
   - If YES (paired with B):
3. **Check Context:** has User _seen_ Card B?
   - If NO: Do nothing (don't confuse them yet).
   - If YES: **TRIGGER INTERVENTION**.

## 3. Intervention UX ("The Shield")

**State:** Paused Review.
**UI:** Split View Modal.

| Left Pane (Card A) | Right Pane (Card B) |
| ------------------ | ------------------- |
| Image A            | Image B             |
| Kanji A            | Kanji B             |
| Pitch Visualizer A | Pitch Visualizer B  |

**Interaction:**

1. Audio plays (Randomly A or B).
2. User must tap the correct side.
3. Feedback: Correct -> Modal closes -> Resume Review. Incorrect -> Shake animation.

## 4. Data Support

**Model:** `ConfusionPair`
**Type:** `HOMONYM` (Hashi/Hashi), `LOOKALIKE` (Sore/Kore), `SYNONYM`.

```typescript
// ConfusionPair.explanation
{
  "vi": "Chú ý đường đi của âm thanh. Cầu (Hashi) đi lên, Đũa (Hashi) đi xuống.",
  "en": "Watch the pitch. Bridge (Hashi) goes UP, Chopsticks (Hashi) goes DOWN."
}
```
