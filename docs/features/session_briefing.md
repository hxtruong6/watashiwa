# Feature Spec: Session Briefing (Pre-Study Priming)

> **Status**: Draft
> **Owner**: Product/UX
> **Last Updated**: Dec 2025

---

## 0. Pre-Flight: Requirement Clarity

- [ ] **Problem Statement**: Users face "Exam Anxiety" when starting SRS sessions, especially with new content. They lack context and initial exposure before testing, leading to frustration and "Forgot" ratings.
- [ ] **Success Metric**:
  - **Retention**: Decrease in "Forgot" rate on first-seen cards by >10%.
  - **Engagement**: Increase in session completion rate (users rarely quit during Briefing).
- [ ] **User Story**: `As a learner, I want to preview the words I'm about to study, so that I can prime my memory and feel confident before the quiz.`
- [ ] **Scope Boundaries**:
  - V1: Only shows **New Words** and **Leech Cards** (Review items with high difficultly).
  - V1: **Read-Only** (Audio allowed). No editing/rating in Briefing.
- [ ] **Dependencies**: `useStudySession` hook must support "queue peaking" or pre-fetching.

---

## 1. Product & UX Design

### A. Design Thinking: Make It Meaningful

- **User Goal**: "I want to know what I'm getting into." (Context setting).
- **Emotional Design**: **Calm & Prepared**. The briefing should feel like a strategic map before battle, or a menu before a meal.
- **"So What?" Test**: Why show the list? -> So I can listen to the audio _passively_ and connect the sound to meaning without pressure.

### B. User Flow Analysis

- **Entry Point**:
  - Dashboard -> Click "Start Review" or "Quick 5".
  - **Logic**: If Queue contains New Cards OR Leeches -> Show Briefing. Else -> Skip to Quiz.
- **Happy Path**:
  1. See Briefing Screen ("Mission Today").
  2. Scroll through 5 New Words.
  3. Play audio for difficult one.
  4. Click "Vô Chiến" (Start).
  5. Quiz begins.
- **Edge Cases**:
  - **Zero New/Leech**: Skip Briefing (Pure Review flow).
  - **Network Fail**: Audio might not play (graceful degradation).

---

## 2. UI Implementation (Frontend)

### A. Component Design

- **New Component**: `src/components/Study/SessionBriefing.tsx`
- **Props**:

  ```typescript
  interface SessionBriefingProps {
  	queue: StudyCardWithDetails[];
  	onStart: () => void;
  }
  ```

- **Structure**:
  - `Header`: Title + "Mission" Summary.
  - `ScrollArea`:
    - `SectionHeader`: "New Arrivals" / "Critical Review".
    - `BriefingItem`: The card row (Kanji, Meaning, Audio).
  - `Footer`: Fixed "Start" button.

### B. Visuals (Ant Design + Zen)

- **Typography**: Large Kanji (32px), readable Meaning (16px).
- **Zen Mode**: Clean background, no clutter.
- **Haptics**: Light tap on "Start".

### C. Responsive Strategy

- **Mobile**: Full screen, easy thumb scroll. Fixed bottom button in "Thumb Zone".
- **Desktop**: Centered modal-like container (max-width 500px).

---

## 3. Implementation Checklist

### A. Data & Logic

- [ ] **Hook Update (`useStudySession`)**:
  - Expose `upcomingQueue`.
  - Ensure `fetchNextCard` pre-fetches a batch (5-10) initially.
- [ ] **Phase State**:
  - Add `studyPhase: 'briefing' | 'quiz'` to `StudyContent`.

### B. Component Build (`SessionBriefing.tsx`)

- [ ] **Mobile Layout**: `Flex vertical` with `flex: 1` scroll area.
- [ ] **Audio Integration**: Re-use `useFlashCardAudio` or simple `Audio` element for preview? -> _Decision: Simple Audio button for list items._
- [ ] **Translations**: Add keys for "Mission Today", "New Arrivals", "Critical Review".

### C. Integration

- [ ] **Switch Logic**:

  ```tsx
  if (studyPhase === 'briefing' && hasRelevantCards) {
    return <SessionBriefing ... />
  }
  ```

---

## 4. Testing & Verification

### A. Manual Testing

- [ ] **Scenario 1 (New User)**: Account with fresh deck. Click "Start". -> See Briefing.
- [ ] **Scenario 2 (Veteran)**: Account with only Reviews (no new). -> Skip Briefing.
- [ ] **Audio Check**: Click audio in Briefing -> Hear word.
- [ ] **Transition**: Click Start -> Quiz starts immediately (no double load).

### B. Polish

- [ ] **Lint**: No errors.
- [ ] **Console**: No hydration mismatches.
