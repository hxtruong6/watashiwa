# UI/UX Design System: "Zen Mastery"

## 1. Core Philosophy: Focus & Flow

The application is a tool for deep learning. The interface must be "invisible" until needed.

- **Principle 1: Cognitive Load Reduction.** Since users are memorizing complex Kanji, the UI should be minimalist. No unnecessary decorations.
- **Principle 2: Motivating Feedback.** Learning a language is hard. Interactions should feel rewarding (e.g., satisfying "click" sounds, smooth progress bars).
- **Principle 3: Kanji First.** Text is the hero. Typography must prioritize legibility of intricate strokes.

## 2. Color Palette (Japanese Traditional Colors)

We use a palette inspired by traditional Japanese colors (_Nippon no Iro_) to evoke a sense of calm and culture.

### Primary

- **Indigo (Ai-iro 藍色):** `#1E3A5F` - Primary action buttons, headers. Deep and authoritative.
- **Matcha (Uguisu-iro 鶯色):** `#708238` - Success states, positive progress. Calming green.

### Secondary

- **Sakura (Sakura-iro 桜色):** `#FFE4E1` - Subtle backgrounds, "Easy" rating hover.
- **Vermilion (Shuiro 朱色):** `#E64A19` - "Again/Fail" actions, Error states. High alert.
- **Paper (Washi 和紙):** `#F9F7F2` - Main background. Slightly off-white to reduce eye strain compared to `#FFFFFF`.

### Neutral

- **Sumi (Sumi-iro 墨色):** `#2D2D2D` - Main text. Soft black.
- **Stone (Ishi-iro 石色):** `#8C8C8C` - Secondary text, borders.

## 3. Typography

- **Font Family:** `Inter` (UI) + `Noto Sans JP` (Japanese Text).
- **Base Size:** 16px.
- **Kanji Scaling:** Japanese text should always be **1.2x - 1.5x** larger than surrounding English text.
  - Reason: Kanji strokes ($20+$ strokes) blur at small sizes.
  - _Rule:_ If English body is `16px`, Japanese examples are `20px`.
  - _Rule:_ Flashcard Kanji characters are huge (`64px`+).

## 4. Layout Rules (Ant Design Customization)

We leverage Ant Design's grid but customize the spacing for a wider, breathier feel.

- **Card-Metric:** The central element is always the `VocabCard`.
  - Max-width: `600px`.
  - Padding: `32px` (Generous whitespace).
  - Shadow: `elevation-2` (Subtle lift).

- **Dashboard:**
  - Three-column layout:
    1. **Navigation** (Left, collapsible).
    2. **Stats/Progress** (Top-right).
    3. **Action Queue** (Center, dominant).

## 5. Interaction Patterns

- **The "Review" Loop:**
  - **State A (Question):** Clean card. Only "Show Answer" button visible interaction (or Spacebar).
  - **State B (Answer):** Answer reveals WITH animation (fade-in `0.3s`). Rating buttons appear at bottom.
  - **Feedback:** When a rating is selected, play a subtle interaction sound (optional toggle) and swipe the card away.

- **Micro-interactions:**
  - Buttons should have a `scale(0.98)` active state (tactile feel).
  - Progress bars should animate smoothly (`transition: width 0.5s ease-out`).

## 6. Learner-Specific Heuristics

- **Input Methods:** Always support _Keyboard Shortcuts_ (Space to flip, 1/2/3/4 to rate). Power users hate clicking.
- **Error Prevention:** If a user types "gakusei" instead of "がくせい", auto-convert (WanaKana) or warn them instead of marking wrong immediately.
