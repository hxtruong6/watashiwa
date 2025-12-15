# Feature Design: Active Recall Exercises

## 1. Overview

While standard Flashcards (Passive Review/Self-Grading) are excellent for efficiency, **Active Recall Exercises** force the brain to retrieve information without a prompt, leading to stronger memory traces.

**Strategy for V1 (MVP)**:
To reduce complexity and launch faster, we will implement Exercises as a **Standalone Mode** (`/exercises`).

## Design Philosophy

> **Decision: Persistent Empty State over Toast Message**
>
> We chose to redirect users to a dedicated "Not Enough Cards" page instead of showing a transient Toast error.
>
> * **Robustness**: Works with deep linking/bookmarks (state is handled on the page, not just the button click).
> * **Education**: Allows us to explain *why* (min 4 cards) and suggest actions (Add Content) without time pressure.
> * **Simplicity**: Keeps the dashboard logic clean; the exercises page owns its validation.

## User Scenarios

Users choose to "Enter the Arena" rather than having it injected during standard study. This allows for a focused "Practice" session.

## 2. User Flow & UX

### A. The "Practice Session" Flow

1. **Entry Point**:
    * **Dashboard**: "Practice Mode" button (Secondary action near "Review").
    * **Deck Page**: "Practice Deck" button.
2. **Setup**:
    * User selects Deck (if from Dashboard) or Start immediately.
    * System selects 10-20 random cards from the deck.
3. **The Arena (Session)**:
    * **Question**: Large visualization of the challenge.
    * **Interaction**: Input method dependent on Exercise Type.
    * **Feedback**: Immediate (Green/Red flash).
    * **Progress**: Bar at top advances.
4. **Summary**:
    * Score (e.g., "8/10 Correct").
    * XP Awarded.
    * "Play Again" or "Back to Dashboard".

### B. UI Layout (The "Arena")

We will use a dedicated layout `ExerciseLayout` to strip away distractions.

* **Header**: Minimal. Progress bar. "Exit" button (X).
* **Body**:
  * **Question Area**: Top 40% of screen. Large Kanji or Audio visualizer.
  * **Answer Area**: Bottom 60% of screen.
* **Footer**: Hidden or minimal status.

## 3. Exercise Types

### A. Multiple Choice (MVP)

*The foundation. fast, familiar, and easy to build.*

* **Goal**: Identify the correct Meaning or Reading for a Kanji.
* **Question**: Large Kanji (e.g., 学生).
* **Options**: Grid of 4 buttons.
  * 1 Correct Answer.
  * 3 Distractors (Non-phonetic randoms from same deck for V1).
* **Feedback**:
  * Correct: Button turns Green + "Ping" sound -> Auto-advance (500ms).
  * Incorrect: Button turns Red + Shake + "Buzzer" sound -> Wait for user to click correct one -> No score.

### B. Audio Shadow (Next Steps)

*Pure listening practice.*

* **Goal**: Identify word from audio.
* **Question**: Waveform animation. Button to replay audio.
* **Options**: 4 Kanji options.

### C. Typewriter (Future)

*True mastery check.*

* **Goal**: Type the reading (Kana/Romaji).
* **Validation**: Requires `wanakana` and fuzzy logic. (Deferred to V2).

## 4. Technical Architecture

### A. Data & State

* **`useExerciseSession` Hook**:
  * Manages `queue`: Array of Questions.
  * Manages `currentIndex`: Int.
  * Manages `score`: Int.
  * Manages `status`: 'idle' | 'playing' | 'summary'.
  * Actions: `submitAnswer(answerId)`, `nextQuestion()`, `endSession()`.

* **Interfaces**:

```typescript
type ExerciseType = 'multiple_choice' | 'listening' | 'typing';

interface Question {
  id: string; // cardId
  type: ExerciseType;
  challenge: string; // The Kanji or Audio URL
  correctAnswer: string; // The value to match
  options?: string[]; // Distractors (for MCQ)
}
```

### B. Component Layer

* **`ExerciseSessionContainer`**: Logic wrapper. Fetches data, initializes hook.
* **`ExerciseLayout`**: Visual wrapper (Progress bar, Exit).
* **`ExerciseRenderer`**: Switch statement to render specific component.
  * Returns `<MultipleChoiceExercise />` or `<ListeningExercise />`.
* **`MultipleChoiceExercise`**: Pure UI component.
* **`ExerciseSessionContainer`**: Logic wrapper. Fetches data, initializes hook.
* **`ExerciseLayout`**: Visual wrapper (Progress bar, Exit).
* **`ExerciseRenderer`**: Switch statement to render specific component.
  * Returns `<MultipleChoiceExercise />` or `<ListeningExercise />`.
* **`MultipleChoiceExercise`**: Pure UI component.
  * Props: `question`, `onAnswer`, `isSubmitting`.

## 5. Implementation Roadmap (Task Checklist)

### Phase 1: Core Architecture

* [x] Define `Exercise` and `Question` interfaces.
* [x] Create `useExerciseSession` hook state machine.
* [x] Build `ExerciseLayout` (Shell).

### Phase 2: The MVP (MCQ)

* [x] Implement `MultipleChoiceExercise` component.
* [x] Build `ExercisesPage` (`/exercises`) to stitch it together.
* [x] Logic: "Get Random Questions" (Client-side shuffle for V1).

### Phase 3: Polish

* [x] Add Sound Effects (use `useSound` or Audio API).
* [x] Add Framer Motion transitions between questions.

### Phase 4: Refinements (Checklist Compliance)

* [x] Input Validation (Zod Schema for Server Actions).
* [x] Keyboard Shortcuts (1-4 for options).
* [x] Improved Distractor Logic (Matching word length).
