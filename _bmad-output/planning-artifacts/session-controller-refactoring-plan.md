# SessionController Refactoring Plan

## Executive Summary

**Current State:** 1,250 lines, multiple responsibilities, complex state management  
**Target State:** Modular, testable, maintainable components following Vertical Slice Architecture  
**Estimated Effort:** 2-3 days  
**Risk Level:** Medium (requires careful testing of phase transitions)

---

## 1. Architecture Analysis

### Current Violations

1. **Single Responsibility Principle (SRP)**
   - Phase management (6 phases)
   - Data fetching & initialization
   - Rating submission with animations
   - UI state (drawers, modals)
   - Analytics tracking
   - Audio management
   - Keyboard shortcuts

2. **Component Size Rule**
   - **Current:** 1,250 lines
   - **Rule:** Max 150 lines before extracting logic
   - **Violation:** 8.3x over limit

3. **Vertical Slice Architecture**
   - Logic should be in hooks, not components
   - Components should be thin orchestrators
   - Business logic should be testable in isolation

---

## 2. Proposed Structure

```
src/modules/study/
├── components/
│   └── Session/
│       ├── SessionController.tsx          # Thin orchestrator (~150 lines)
│       ├── SessionBriefing.tsx            # ✅ Already exists
│       ├── SessionSummary.tsx              # ✅ Already exists
│       ├── QuizPhase.tsx                   # NEW: Quiz phase UI
│       ├── PrimingPhase.tsx                 # NEW: Priming phase UI
│       ├── LoadingPhase.tsx                # NEW: Loading state UI
│       └── SessionDrawers.tsx              # NEW: All drawer components
│
└── hooks/
    ├── useSessionPhase.ts                  # NEW: Phase state machine
    ├── useSessionInitialization.ts         # NEW: Data fetching logic
    ├── useRatingSubmission.ts              # NEW: Rating + animation logic
    ├── useSessionUI.ts                     # NEW: Drawer/modal state
    ├── useSessionAnalytics.ts              # NEW: Analytics tracking
    └── useRelatedWords.ts                  # ✅ Already exists
```

---

## 3. Refactoring Steps

### Phase 1: Extract Phase Management (Priority: HIGH)

**Create:** `hooks/useSessionPhase.ts`

**Responsibilities:**

- Manage phase state machine (loading → priming → briefing → quiz → summary)
- Handle phase transitions
- Track user preferences (hasSkippedBriefing, hasSkippedPriming)

**Interface:**

```typescript
interface UseSessionPhaseReturn {
  studyPhase: StudyPhase;
  setStudyPhase: (phase: StudyPhase) => void;
  transitionToQuiz: () => void;
  transitionToSummary: () => void;
  hasSkippedBriefing: boolean;
  setHasSkippedBriefing: (value: boolean) => void;
  // ... other phase helpers
}
```

**Benefits:**

- Centralized phase logic
- Easier to test transitions
- Reduces component complexity

---

### Phase 2: Extract Initialization Logic (Priority: HIGH)

**Create:** `hooks/useSessionInitialization.ts`

**Responsibilities:**

- Fetch cards from server
- Check priming requirements
- Load user settings & daily stats
- Handle empty queue scenarios (redirect)

**Interface:**

```typescript
interface UseSessionInitializationReturn {
  isLoading: boolean;
  primingStory: StoryWithContent | null;
  dailyStats: DailyStats;
  userSettings: Partial<User> | null;
  initializeSession: () => Promise<void>;
  error: Error | null;
}
```

**Benefits:**

- Isolated data fetching logic
- Easier to test error scenarios
- Can be reused in other contexts

---

### Phase 3: Extract Rating Submission (Priority: MEDIUM)

**Create:** `hooks/useRatingSubmission.ts`

**Responsibilities:**

- Handle rating submission with animation
- Manage exit animations
- Toast notifications
- Prevent double-submission (race conditions)

**Interface:**

```typescript
interface UseRatingSubmissionReturn {
  submitRating: (rating: 1 | 2 | 3 | 4, isExplicitEasy?: boolean) => Promise<void>;
  isSubmitting: boolean;
  isCardExiting: boolean;
  exitColor: string | undefined;
  handleRate: (action: 'forgot' | 'remember' | 'easy') => Promise<void>;
  handleNumericRate: (rating: number) => Promise<void>;
}
```

**Benefits:**

- Separates animation logic from business logic
- Easier to test submission flow
- Reduces component complexity

---

### Phase 4: Extract UI State Management (Priority: MEDIUM)

**Create:** `hooks/useSessionUI.ts`

**Responsibilities:**

- Manage drawer states (settings, comments, related words)
- Manage modal states (report)
- Handle responsive behavior

**Interface:**

```typescript
interface UseSessionUIReturn {
  // Drawers
  settingsVisible: boolean;
  setSettingsVisible: (visible: boolean) => void;
  isCommentDrawerOpen: boolean;
  setIsCommentDrawerOpen: (open: boolean) => void;
  isRelatedWordDrawerOpen: boolean;
  setIsRelatedWordDrawerOpen: (open: boolean) => void;
  selectedRelatedWord: RelatedWord | null;
  setSelectedRelatedWord: (word: RelatedWord | null) => void;
  
  // Modals
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  
  // Helpers
  closeAllDrawers: () => void;
}
```

**Benefits:**

- Centralized UI state
- Easier to manage drawer lifecycle
- Can be tested independently

---

### Phase 5: Extract Analytics (Priority: LOW)

**Create:** `hooks/useSessionAnalytics.ts`

**Responsibilities:**

- Track session start/end
- Track first card shown
- Track phase transitions
- Track rating submissions

**Interface:**

```typescript
interface UseSessionAnalyticsReturn {
  trackSessionStart: (params: SessionStartParams) => void;
  trackSessionEnd: (params: SessionEndParams) => void;
  trackFirstCardShown: (params: FirstCardParams) => void;
  trackPhaseTransition: (from: StudyPhase, to: StudyPhase) => void;
}
```

**Benefits:**

- Centralized analytics logic
- Easier to audit tracking
- Can be disabled for testing

---

### Phase 6: Split Phase Components (Priority: MEDIUM)

**Create Phase Components:**

1. **`QuizPhase.tsx`** (~200 lines)
   - Card display
   - Rating bar
   - Sidebar (desktop)
   - Action bar (mobile)
   - Related words integration

2. **`PrimingPhase.tsx`** (~100 lines)
   - Priming modal
   - Story reader
   - Skip/continue actions

3. **`LoadingPhase.tsx`** (~50 lines)
   - Loading spinner
   - Progress messages

4. **`SessionDrawers.tsx`** (~150 lines)
   - Comment drawer
   - Settings drawer
   - Related word drawer
   - Report modal

**Benefits:**

- Each component has single responsibility
- Easier to test individual phases
- Better code organization

---

### Phase 7: Refactor Main Component (Priority: HIGH)

**Refactor:** `SessionController.tsx`

**Target Structure:**

```typescript
export default function SessionController(props: SessionControllerProps) {
  // 1. Hooks (extracted logic)
  const phase = useSessionPhase();
  const initialization = useSessionInitialization(props);
  const rating = useRatingSubmission();
  const ui = useSessionUI();
  const analytics = useSessionAnalytics(props);
  
  // 2. Derived state
  const cardToShow = useMemo(() => {
    // Simple derivation
  }, []);
  
  // 3. Render phase-specific components
  if (phase.studyPhase === 'summary') {
    return <SessionSummary />;
  }
  
  if (phase.studyPhase === 'priming-modal') {
    return <PrimingPhase {...primingProps} />;
  }
  
  // ... other phases
  
  return (
    <SessionContainer>
      {phase.studyPhase === 'loading' && <LoadingPhase />}
      {phase.studyPhase === 'briefing' && <SessionBriefing {...briefingProps} />}
      {phase.studyPhase === 'quiz' && <QuizPhase {...quizProps} />}
      <SessionDrawers {...drawerProps} />
    </SessionContainer>
  );
}
```

**Target Size:** ~150-200 lines (orchestrator only)

---

## 4. Migration Strategy

### Step 1: Create Hooks (Non-Breaking)

- Create all hooks in parallel
- Keep existing component working
- Test hooks in isolation

### Step 2: Integrate Hooks (Gradual)

- Replace one concern at a time
- Test after each integration
- Keep old code commented for reference

### Step 3: Extract Phase Components (Breaking)

- Create phase components
- Move UI logic to components
- Update main component to use new components

### Step 4: Cleanup

- Remove commented code
- Update tests
- Update documentation

---

## 5. Testing Strategy

### Unit Tests

- **Hooks:** Test each hook in isolation
- **Phase Components:** Test rendering and interactions
- **State Machine:** Test phase transitions

### Integration Tests

- **Full Flow:** Test complete session flow
- **Error Scenarios:** Test error handling
- **Edge Cases:** Test empty queue, network errors

### E2E Tests

- **Playwright:** Test user interactions
- **Phase Transitions:** Test all phase changes
- **Rating Submission:** Test rating flow

---

## 6. Risk Mitigation

### Risk: Breaking Phase Transitions

**Mitigation:**

- Keep old code commented during migration
- Add comprehensive tests before refactoring
- Test each phase transition manually

### Risk: Race Conditions

**Mitigation:**

- Use refs for guards (already implemented)
- Add tests for concurrent submissions
- Document state synchronization

### Risk: Performance Regression

**Mitigation:**

- Profile before/after refactoring
- Use React DevTools Profiler
- Monitor bundle size

---

## 7. Success Metrics

### Code Quality

- ✅ Component size < 200 lines
- ✅ Each hook < 150 lines
- ✅ Test coverage > 80%

### Maintainability

- ✅ Each concern isolated
- ✅ Easy to add new phases
- ✅ Easy to modify existing logic

### Performance

- ✅ No performance regression
- ✅ Bundle size unchanged or reduced
- ✅ No unnecessary re-renders

---

## 8. Timeline Estimate

| Phase | Effort | Risk |
|-------|--------|------|
| Phase 1: Phase Management | 4 hours | Medium |
| Phase 2: Initialization | 4 hours | Medium |
| Phase 3: Rating Submission | 3 hours | Low |
| Phase 4: UI State | 2 hours | Low |
| Phase 5: Analytics | 2 hours | Low |
| Phase 6: Phase Components | 6 hours | Medium |
| Phase 7: Main Refactor | 4 hours | High |
| Testing & Cleanup | 4 hours | Medium |
| **Total** | **29 hours** | **~3-4 days** |

---

## 9. Next Steps

1. **Review & Approve Plan**
   - Get team feedback
   - Adjust timeline if needed
   - Prioritize phases

2. **Create Feature Branch**
   - `refactor/session-controller`
   - Create PR for tracking

3. **Start with Phase 1**
   - Create `useSessionPhase` hook
   - Test in isolation
   - Integrate gradually

4. **Iterate**
   - Complete one phase at a time
   - Test after each phase
   - Get feedback early

---

## 10. Alternative: Incremental Refactoring

If full refactoring is too risky, consider **incremental approach**:

1. **Week 1:** Extract phase management only
2. **Week 2:** Extract initialization logic
3. **Week 3:** Extract rating submission
4. **Week 4:** Split phase components

This reduces risk but takes longer.

---

## Conclusion

This refactoring will:

- ✅ Reduce component complexity by 85%
- ✅ Improve testability
- ✅ Follow Vertical Slice Architecture
- ✅ Make codebase more maintainable
- ✅ Reduce bug risk

**Recommendation:** Proceed with refactoring, starting with Phase 1 (Phase Management).
