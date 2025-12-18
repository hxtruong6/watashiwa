# Feature Design: "Zen Mastery" Study Session

## 1. Overview

The **Study Session** is the heart of WatashiWa. It is where users interface with the "Golden Time" SRS algorithm to achieve mastery. The design must be distraction-free ("Zen"), highly responsive ("Thumb Zone"), and information-rich only when needed (Invisible Design).

## 2. Design Philosophy

- **Zen Mode**: The interface should feel like a piece of paper. No clutter. UI chrome (headers/menus) should disappear when the user is focused.
- **Kanji as Hero**: The Kanji/Word is the most important element. large, clear typography.
- **Hán Việt (Sino-Vietnamese) First**: As a differentiator, Hán Việt etymology is a first-class citizen in the answer reveal, bridging the user's existing language knowledge.
- **Thumb Zone UX**: All critical actions (Show Answer, Rating) must be comfortably reachable with one hand on a mobile device.

## 3. User Scenarios

### A. Daily Review (The Ritual)

- **Goal**: Clear the review queue efficiently.
- **Context**: Short bursts (commute, break) or focused session.
- **Critical Path**: Open App -> Click "Review" -> Review Cards -> Session Summary.

### B. Learning New Words

- **Goal**: Encode new vocabulary.
- **Interaction**: Slower pace, reading examples, playing audio multiple times, checking Hán Việt.

## 4. UI Layout & Information Architecture

### 4.1. The Stage (Layout)

- **Header (Auto-hiding)**:
  - **Left**: Settings (Gear), Community (Icon + Badge if comments exist), Cards Left Counter.
  - **Right**: Close (X) - Returns to Dashboard/Deck.
  - **Top Edge**: Minimal Progress Bar (Wait -> 100% of Daily Limit).
- **Main Content (Card Area)**:
  - Centered vertically (optical center).
  - **Front**:
    - **Question**: Large Kanji/Word (64px+).
    - **Hint (Optional)**: Audio auto-play (if enabled). Visual hint if struggling.
  - **Back (Answer)**:
    - **Reading**: Furigana (can be toggleable).
    - **Hán Việt**: Distinct typography (e.g., uppercase serif or distinct color). _Crucial for Vietnamese learners._
    - **Meaning**: Primary definition.
    - **Context/Image**: Subtle, between meaning and examples.
    - **Examples**: 1-2 key sentences with audio.
- **Footer (Thumb Zone)**:
  - **State 1 (Question)**: "Show Answer" - Large, full-width or pill-shaped button.
  - **State 2 (Answer)**: SRS Rating Bar (Again, Hard, Good, Easy).

### 4.2. Visual Style ("Zen/Washi")

- **Background**: `#F9F7F2` (Warm White) - reduces eye strain compared to pure white.
- **Typography**:
  - Kanji: `Noto Sans JP`, weight 500.
  - UI Text: `Inter`.
  - Hán Việt: `Playfair Display` or `Roboto Slab` (Generic Serif) for etymological feel.
- **Colors**:
  - Primary Action: `#1E3A5F` (Indigo).
  - SRS Colors:
    - Again: `#E64A19` (Vermilion).
    - Hard: `#FAAD14` (Goldenrod).
    - Good: `#708238` (Matcha).
    - Easy: `#388E3C` (Forest).

## 5. Interaction Design

### A. Gestures & Navigation

- **Tap Center**: Nothing (avoids accidental reveals).
- **Tap "Show Answer"**: Reveals back of card.
- **Scroll Down**: Hides Header (Focus Mode).
- **Scroll Up/Tap Top**: Shows Header.

### B. Feedback

- **Audio**: Plays on specific triggers.
- **Haptic**: Subtle variation for ratings (Heavy for "Again", Light for "Good").
- **Confetti**: On session completion (Dopamine hit).

## 6. Data & Progress Saving

### A. Data Model (SRS)

Every review updates the `Card` record:

- `due`: Next review date (calculated by `ts-fsrs`).
- `stability`: Memory strength.
- `difficulty`: Card complexity.
- `reps`: Total repetitions.
- `lapses`: Times forgotten.

### B. Optimistic UI

1. User clicks Rating.
2. **IMMEDIATELY**:
   - Update Local State (Stats increment).
   - Show Next Card.
3. **BACKGROUND**:
   - Server Action: `submitReview(cardId, rating)`.
   - On Error: Toast notification, maybe rollback (rare).

## 7. Technical Implementation Notes

- **Component**: `StudyContent` (Client Component).
- **State**: Local `dailyStats` state for immediate feedback, synced with Server via `getDailyProgress`.
- **Audio**: Web Audio API or simple HTML5 Audio. Preload next card's audio if possible.
- **Hán Việt**: Ensure `han_viet` field is populated in Prisma schema and fetched.

## 8. Accessibility

- **Keyboard Shortcuts**:
  - `Space`: Show Answer / Rate "Good".
  - `1, 2, 3, 4`: Rate Again, Hard, Good, Easy.
  - `R`: Replay Audio.
- **Screen Reader**: Proper `aria-label` on buttons. Hidden text for Kanji accessibility.
