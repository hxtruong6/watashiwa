# Phase 1 UI/UX Specifications: "Smart CUBE" Learning Experience

> **Status**: DRAFT
> **Focus**: The "Learning Loop" & "FlashCard" Components
> **Philosophy**: [Zen Mastery](../design_system.md) (Invisible Design, High Cognition)

---

## 1. Design Philosophy: "The Invisible Sensei"

The UI should feel like a **physical object** in a Zen garden. It does not "scream" for attention. It waits.

* **No Clutter**: No "Streak flames", no "Leaderboards", no "Coin animations" during the session.
* **Hero Content**: The *Kanji* is the protagonist. Everything else is supporting cast.
* **Flow**: Transitions must be fluid. No jarring cut-scenes.

---

## 2. Core User Stories (The "Golden Path")

### Story A: The "Active Priming" (Session Start)
>
> "As a user, I want to smooth transition into learning mode, so I don't feel abruptly tested."

**Scenario**:

1. User opens app. Dashboard shows "Your Queue: 15 Cards".
2. User taps "Start".
3. **Transition**: The Dashboard elements *fade out*, and the first card *glides in* from the bottom-right (stack effect).
4. **First Card**: It is NOT a test. It is a **Priming Card** (e.g., "Reviewing: Travel Context").
    * *Visual*: A soft, translucent overlay or a "Cover Card".
    * *Action*: User taps "Ready". Card slides away to reveal the first challenge.

### Story B: The "Deep Encounter" (New Word)
>
> "As a user, I want to deeply understand a new word's origin, so I don't rely on rote memory."

**Scenario**:

1. **Front Face**: Large Kanji `先生`. Audio auto-plays.
2. **Interaction**: User pauses. Touches the Kanji.
3. **Feedback**: The Kanji scales up slightly (`scale(1.05)`).
4. **Reveal**: User taps card.
    * *Animation*: `rotateY(180deg)` (3D Flip).
    * *Back Face*: The **Etymology Breakdown** animates in sequence:
        * `先` (Before) + `生` (Life) = "One born before" -> Teacher.
        * Standard Meaning: "Teacher, Master".
5. **Rating**: User selects "Good".
    * *Feedback*: Card glows soft Green (`colorSuccess`). Slides off-screen to the *Right*.

### Story C: The "Intervention" (Mistake)
>
> "As a user, when I make a mistake on a tricky word, I want immediate clarification, not just 'Wrong'."

**Scenario**:

1. **Front Face**: "Bridge" (Meaning).
2. **User Action**: Says "Hashi" (High-Low pitch).
3. **Reveal**: Shows `橋` (Hashi - Low-High).
4. **User Rating**: User selects "Again" (Mistake).
5. **Smart Trigger**: System detects `confused_with: "Chopsticks"`.
6. **Intervention Card (Modal)**:
    * *Visual*: Split screen. Left: 🥢 (High-Low). Right: 🌉 (Low-High).
    * *Action*: "Listen & Tap".
    * *Goal*: User fixes the auditory mapping *immediately*.
7. **Recovery**: User completes intervention. Original card returns to the *end* of the short-term queue.

---

## 3. Component Specification: `FlashCard` Shell

The container that holds all variant types.

### 3.1 Physics & Dimensions (Mobile First)

| Property | Value | Notes |
| :--- | :--- | :--- |
| **Aspect Ratio** | `3:4` | Typical Tarot Card ratio. Fits iPhone SE well. |
| **Max Width** | `340px` | Keeps line lengths readable. |
| **Touch Zone** | Full Card | The entire card surface is the "Reveal" trigger. |
| **Flip Duration** | `0.4s` | `ease-out-cubic`. Snappy but smooth. |
| **Swipe Threshold**| `100px` | Distance to trigger "Easy" (Right) or "Again" (Left). |

### 3.2 Gestures inputs

1. **Tap**: Flip Card (Front <-> Back).
2. **Swipe Left**: "Again" (Rating 1). *Card tilts Red.*
3. **Swipe Right**: "Good" (Rating 3). *Card tilts Green.*
4. **Swipe Up**: "Easy" (Rating 4). *Card tilts Blue.*
5. **Long Press**: "Mark as Leech" / "Add Note" (Context Menu).

### 3.3 The "Stack" Metaphor

We do not show just one card. We show a "Stack" of 3 cards to give a sense of progress.

* **Active Card**: `z-index: 10`, `scale: 1`, `opacity: 1`.
* **Next Card**: `z-index: 9`, `scale: 0.95`, `opacity: 0.8`, `y: 10px`.
* **Future Card**: `z-index: 8`, `scale: 0.90`, `opacity: 0.6`, `y: 20px`.

*Effect*: As Active slides away, Next *springs up* to become Active.

---

## 4. "Smart CUBE" Variants (UI Specs)

### Variant A: `BasicCard` (The Anchor)

* **Front**:
  * Huge Kanji (Centered).
  * Audio Button (Bottom Right, weak opacity).
* **Back**:
  * Kanji (Top Left, Small).
  * **Hán Việt (Bold, Uppercase)**: `TIÊN SINH`.
  * Kana (Middle).
  * Meanings (List).
  * **Etymology Box (Highlight)**: Gray background (`#F5F5F5`). Icon: `Bulb`.

### Variant B: `GapFillCard` (The Context)

* **Front**:
  * Sentence: "あした、[___]へ 行きます。"
  * Hint (Subtext): "Primary School (Small + Learn)".
* **Back**:
  * Restored Sentence: "あした、**小学校**へ 行きます。"
  * Focus Word Detail below.

### Variant C: `InterventionCard` (The Shield)

* **Layout**: **Landscape Split** (even on Portrait mobile, internal flex).
* **Interaction**: **Quiz Mode**.
  * "Which one is [Audio Playing]?"
  * Options: [Image A] vs [Image B].
* **Feedback**:
  * Correct: "Correct! Note the Pitch drop." (Text highlight).
  * Incorrect: Shake animation.

---

## 5. Feedback & Micro-Interactions

| State | Visual Cue | Haptic Feedback |
| :--- | :--- | :--- |
| **Flip** | 3D Rotation, Shadow deepens | `impactLight` |
| **Right Swipe (Win)** | Green Glow border fade-out | `notificationSuccess` |
| **Left Swipe (Fail)** | Red Shake | `notificationError` |
| **Queue Empty** | "Zen Circle" drawing animation | `success` (Long vibration) |

## 6. Technical State (Zustand)

```typescript
interface SessionState {
  queue: Card[];
  currentIndex: number;
  stats: {
    correct: number;
    incorrect: number;
    duration: number;
  };
  isFlipped: boolean;
  swipeDirection: 'left' | 'right' | 'up' | null;
}
```

---

## 7. Implementation Priorities (Phase 1)

## 7. Implementation Priorities (Phase 1)

1. **Session Store**: Implement `useSessionStore` with Zustand.
2. **The Shell**: Build the `CardShell` with `Framer Motion` physics.
3. **Basic Card**: Implement `BasicFace` with Hán Việt/Etymology support.
4. **Session Layout**: Create the "Zen" container component.

---

## 8. Technical Architecture (Scalability & Performance)

> **Requirement**: The "Smart Layer" must run at 60fps on mobile. Logic is decoupled from UI.

### 8.1 "Brain" State Management (Zustand)

We use a **Split-Store Pattern** to separate "Session Logic" from "UI State".

```typescript
// store/useSessionStore.ts
interface SessionStore {
  // 1. Validated Data (Read-Only during session)
  queue: SmartCard[]; // Full payload (content + variants)
  
  // 2. Headless State (The "Cursor")
  currentIndex: number;
  currentCardId: string;
  isSessionActive: boolean;

  // 3. Actions (The "Brain")
  nextCard: () => void;
  submitRating: (rating: 1 | 2 | 3 | 4) => Promise<void>;
  markAsLeech: (vocabId: string) => void;
  
  // 4. Computed (Derived State)
  progress: number; // 0-100%
  remaining: number;
}
```

**Optimization Strategy**:

* **Selectors**: Components must subscribe only to specific slices (e.g., `useSessionStore(s => s.progress)`) to prevent re-renders.
* **Immer Middleware**: Use `immer` for immutable state updates on deep nested objects (like JSONB payloads).

### 8.2 Component Composition (The "Shell" Pattern)

Avoid a monolithic `FlashCard.tsx`. Use Composition for scalability.

```tsx
// ❌ Monolithic (Bad)
<FlashCard type="gap-fill" data={...} />

// ✅ Composable (Scalable)
<CardShell>
  <CardFront>
      <KanjiHero text={data.kanji} />
      <AudioTrigger src={data.audio} />
  </CardFront>
  
  <CardBack>
      {/* Dynamic Injection based on Variant Type */}
      <VariantRenderer type={data.type} payload={data.variant_payload} />
  </CardBack>
  
  <CardActions>
      <RatingBar onRate={handleRate} />
  </CardActions>
</CardShell>
```

### 8.3 Data Pre-fetching & Latency

* **The "Buffer"**: We fetch the next batch of 10 cards when the user reaches `queue.length - 3`.
* **Audio Preload**: The `UseAudio` hook automatically preloads the audio for the `currentIndex + 1` card.

### 8.4 Error Boundaries & Fallbacks

* **Missing Variant**: If `gap_fill` data is malformed, fallback to `BasicCard` (Safe Mode).
* **Network Failure**: Queue actions are **Optimistic**. We update UI immediately, sync to DB in background. If DB fails 3 times, show "Offline Mode" toast (sync later).

---

## 9. Scalable Spec: The `Card` Interface

The Frontend needs a unified interface that abstracts whether the data came from "Raw DB" or "Smart Layer".

```typescript
export type CardVariantType = 'BASIC' | 'GAP_FILL' | 'INTERVENTION';

export interface SmartCard {
  // Metadata
  id: string; // Unique Session Item ID
  vocabId: string;
  
  // The "Director" (Smart Layer Decision)
  variant: CardVariantType;
  
  // The "Payload" (Flexible JSONB)
  front: {
    hero: string; // The big text/image
    sub?: string;
    audio?: string;
  };
  back: {
    answer: string;
    details: Vocabulary; // Full details available if needed
    intervention?: {
      type: 'homonym_clash';
      confusing_vocab_id: string;
    };
  };
}
```
