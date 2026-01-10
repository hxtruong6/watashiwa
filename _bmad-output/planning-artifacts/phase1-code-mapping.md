# Phase 1: Code Mapping Reference

Quick reference for which code sections move to `useSessionPhase.ts` hook.

## State to Extract

### From SessionController.tsx (lines 74-81)

```typescript
// EXTRACT TO HOOK:
const [studyPhase, setStudyPhase] = useState<
  'loading' | 'priming-modal' | 'priming' | 'briefing' | 'quiz' | 'summary'
>('loading');
const [hasSkippedBriefing, setHasSkippedBriefing] = useState(false);
const [hasSkippedPriming, setHasSkippedPriming] = useState(false);
```

### Keep in Component (for now)

- `showPrimingModal` - UI state, not phase logic
- `primingStory` - Data, not phase state
- Other UI states (settings, drawers, etc.)

---

## Effects to Extract

### Effect 1: Phase Transition from Loading (lines 376-438)

**Current Code:**

```typescript
useEffect(() => {
  console.log('[SessionController] Phase transition effect:', {
    isLoading,
    studyPhase,
    queueLength: queue.length,
    hasSkippedBriefing,
  });

  // Don't transition if user has explicitly skipped briefing or already in quiz
  if (hasSkippedBriefing || studyPhase === 'quiz') {
    return;
  }

  if (!isLoading && studyPhase === 'loading') {
    console.log('[SessionController] Phase transition check:', {
      queueLength: queue.length,
      currentCard: !!useSessionStore.getState().currentCard,
    });

    if (queue.length === 0) {
      console.warn('[SessionController] Queue is empty, redirecting to dashboard');
      redirectToDashboard();
      return;
    }

    // Ensure currentCard is set before transitioning
    const { currentCard: storeCurrentCard } = useSessionStore.getState();
    if (!storeCurrentCard && queue.length > 0) {
      console.log('[SessionController] Setting currentCard from queue[0]');
      useSessionStore.setState({ currentCard: queue[0], currentIndex: 0 });
    }

    // Check for Briefing Candidates
    const hasNew = queue.some((c) => c.srsStage === 0);
    const hasLeech = false; // TODO: Add lapses to SmartCard type

    // Debug: Log briefing decision
    const newCount = queue.filter((c) => c.srsStage === 0).length;
    const reviewCount = queue.filter((c) => c.srsStage > 0).length;
    console.log('[SessionController] Briefing decision:', {
      hasNew,
      hasLeech,
      newCount,
      reviewCount,
      total: queue.length,
    });

    if (hasNew || hasLeech) {
      console.log(
        '[SessionController] Transitioning to briefing (hasNew:',
        hasNew,
        ', hasLeech:',
        hasLeech,
        ')',
      );
      setStudyPhase('briefing');
    } else {
      console.log('[SessionController] Transitioning to quiz (no new cards or leeches)');
      setStudyPhase('quiz');
    }
  }
}, [isLoading, queue, studyPhase, hasSkippedBriefing, redirectToDashboard]);
```

**Move to Hook:**

- Logic stays the same
- Accept `isLoading`, `queue`, `hasSkippedBriefing`, `redirectToDashboard` as parameters
- Use internal `studyPhase` state

---

### Effect 2: Ensure currentCard on Quiz Entry (lines 441-446)

**Current Code:**

```typescript
// Ensure currentCard is set when entering quiz phase from briefing
useEffect(() => {
  if (studyPhase === 'quiz' && queue.length > 0 && !currentCard) {
    // Force set currentCard from queue
    useSessionStore.setState({ currentCard: queue[0], currentIndex: 0 });
  }
}, [studyPhase, queue, currentCard]);
```

**Move to Hook:**

- Keep as internal effect
- Accept `queue`, `currentCard` as parameters

---

### Effect 3: Session Completion Detection (lines 449-476)

**Current Code:**

```typescript
// Detect session completion and transition to summary
useEffect(() => {
  // Only check during quiz phase (active study session)
  if (studyPhase !== 'quiz') {
    return;
  }

  // Session is complete when:
  // 1. isSessionActive is false (set by nextCard() when queue exhausted)
  //    OR
  // 2. currentIndex >= queue.length (all cards reviewed, including re-queued "Again" cards)
  //    Note: queue.length can grow if "Again" cards are re-queued, so we check index vs length
  const isComplete = !isSessionActive || (currentIndex >= queue.length && queue.length > 0);

  if (isComplete) {
    console.log('[SessionController] Session complete detected, transitioning to summary', {
      isSessionActive,
      currentCard: !!currentCard,
      queueLength: queue.length,
      currentIndex,
    });

    // End session in store (ensures stats are finalized)
    useSessionStore.getState().endSession();

    // Transition to summary phase
    setStudyPhase('summary');
  }
}, [studyPhase, isSessionActive, currentCard, queue.length, currentIndex]);
```

**Move to Hook:**

- Keep logic identical
- Accept `isSessionActive`, `currentIndex`, `queue.length` as parameters
- Call `useSessionStore.getState().endSession()` internally

---

## Functions to Extract

### Function 1: transitionToQuiz (from lines 1060-1091)

**Current Code (in onStart handler):**

```typescript
onStart={() => {
  // Transition to quiz phase
  if (queue.length > 0 && queue[0]) {
    // CRITICAL: Always set currentCard BEFORE transitioning
    useSessionStore.setState({
      currentCard: queue[0],
      currentIndex: 0,
      isSessionActive: true,
    });
    // Transition immediately - state update is synchronous
    setStudyPhase('quiz');
    setShowAnswer(false);
    resetTimer();
  }
}}
```

**Extract to Hook:**

```typescript
const transitionToQuiz = useCallback(() => {
  if (queue.length > 0 && queue[0]) {
    useSessionStore.setState({
      currentCard: queue[0],
      currentIndex: 0,
      isSessionActive: true,
    });
    setStudyPhase('quiz');
  }
}, [queue]);
```

**In Component:**

```typescript
onStart={() => {
  phaseHook.transitionToQuiz();
  setShowAnswer(false);
  resetTimer();
}}
```

---

### Function 2: transitionToSummary

**Current Code (in effect, line 474):**

```typescript
setStudyPhase('summary');
```

**Extract to Hook:**

```typescript
const transitionToSummary = useCallback(() => {
  useSessionStore.getState().endSession();
  setStudyPhase('summary');
}, []);
```

---

## Effects to KEEP in Component

### Navbar Visibility (lines 151-163)

**Reason:** UI-specific side effect, not phase logic

```typescript
// KEEP IN COMPONENT
useEffect(() => {
  if (studyPhase === 'summary') {
    setNavBarVisible(true);
  } else {
    setNavBarVisible(false);
  }
  return () => {
    setNavBarVisible(true);
  };
}, [studyPhase, setNavBarVisible]);
```

### Analytics Tracking (lines 479-548)

**Reason:** Side effects, will be extracted in Phase 5

- Keep in component for now

---

## Hook Interface

### Input (Options)

```typescript
interface UseSessionPhaseOptions {
  queue: SmartCard[];
  currentCard: SmartCard | null;
  currentIndex: number;
  isSessionActive: boolean;
  isLoading: boolean;
  redirectToDashboard: () => void;
}
```

### Output (Return)

```typescript
interface UseSessionPhaseReturn {
  studyPhase: StudyPhase;
  setStudyPhase: (phase: StudyPhase) => void;
  hasSkippedBriefing: boolean;
  setHasSkippedBriefing: (value: boolean) => void;
  hasSkippedPriming: boolean;
  setHasSkippedPriming: (value: boolean) => void;
  transitionToQuiz: () => void;
  transitionToSummary: () => void;
}
```

---

## Usage in Component

### Before (Current)

```typescript
const [studyPhase, setStudyPhase] = useState<StudyPhase>('loading');
const [hasSkippedBriefing, setHasSkippedBriefing] = useState(false);
const [hasSkippedPriming, setHasSkippedPriming] = useState(false);

// ... many effects managing phase transitions
```

### After (With Hook)

```typescript
const phaseHook = useSessionPhase({
  queue,
  currentCard,
  currentIndex,
  isSessionActive,
  isLoading,
  redirectToDashboard,
});

// Use phaseHook.studyPhase instead of studyPhase
// Use phaseHook.transitionToQuiz() instead of setStudyPhase('quiz')
```

---

## Testing Checklist

After extraction, verify these still work:

1. **Loading → Briefing:**
   - [ ] New cards in queue → shows briefing
   - [ ] No new cards → skips to quiz

2. **Briefing → Quiz:**
   - [ ] Start button works
   - [ ] Skip button works
   - [ ] currentCard is set

3. **Quiz → Summary:**
   - [ ] Completes when queue exhausted
   - [ ] Completes when isSessionActive = false
   - [ ] Session stats are finalized

4. **Edge Cases:**
   - [ ] Empty queue → redirects
   - [ ] Rapid transitions → no race conditions
   - [ ] Component unmount → no errors
