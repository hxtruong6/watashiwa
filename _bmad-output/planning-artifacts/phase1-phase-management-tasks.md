# Phase 1: Extract Phase Management - Detailed Task Plan

## Objective

Extract phase management logic from `SessionController.tsx` into `useSessionPhase.ts` hook without breaking existing functionality.

## Scope

- Phase state management (6 phases: loading, priming-modal, priming, briefing, quiz, summary)
- Phase transition logic
- User preferences (hasSkippedBriefing, hasSkippedPriming)
- Phase-related side effects (navbar visibility, session completion detection)

---

## Task Breakdown

### Task 1.1: Create Hook Structure (Non-Breaking)

**Time:** 30 minutes  
**Risk:** Low

#### Steps

1. Create `src/modules/study/hooks/useSessionPhase.ts`
2. Define types:

   ```typescript
   export type StudyPhase =
   	| 'loading'
   	| 'priming-modal'
   	| 'priming'
   	| 'briefing'
   	| 'quiz'
   	| 'summary';

   interface UseSessionPhaseOptions {
   	queue: SmartCard[];
   	currentCard: SmartCard | null;
   	currentIndex: number;
   	isSessionActive: boolean;
   	isLoading: boolean;
   	redirectToDashboard: () => void;
   }

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

3. Create empty hook that returns current state structure
4. Export hook

#### Acceptance Criteria

- ✅ File created with proper types
- ✅ Hook exports without errors
- ✅ TypeScript compilation passes

---

### Task 1.2: Extract Phase State (Non-Breaking)

**Time:** 45 minutes  
**Risk:** Low

#### Steps

1. Move phase state to hook:

   ```typescript
   const [studyPhase, setStudyPhase] = useState<StudyPhase>('loading');
   const [hasSkippedBriefing, setHasSkippedBriefing] = useState(false);
   const [hasSkippedPriming, setHasSkippedPriming] = useState(false);
   ```

2. Return state from hook
3. Keep original state in component (for now - parallel implementation)

#### Acceptance Criteria

- ✅ Hook manages phase state internally
- ✅ Component still works with original state
- ✅ No runtime errors

---

### Task 1.3: Extract Phase Transition Logic (Critical)

**Time:** 2 hours  
**Risk:** Medium

#### Steps

1. **Extract "loading → briefing/quiz" transition** (lines 376-438)
   - Move logic to hook
   - Accept `queue`, `isLoading`, `redirectToDashboard` as parameters
   - Return transition function or use effect internally

2. **Extract "quiz → summary" transition** (lines 449-476)
   - Move session completion detection to hook
   - Accept `isSessionActive`, `currentIndex`, `queue.length` as parameters
   - Return transition function

3. **Extract "briefing → quiz" transition** (lines 1060-1091)
   - Move `onStart` and `onSkip` logic to hook
   - Return transition functions

#### Implementation Pattern

```typescript
// In hook
useEffect(() => {
	// Phase transition logic from loading
	if (!isLoading && studyPhase === 'loading') {
		if (queue.length === 0) {
			redirectToDashboard();
			return;
		}

		const hasNew = queue.some((c) => c.srsStage === 0);
		if (hasNew && !hasSkippedBriefing) {
			setStudyPhase('briefing');
		} else {
			setStudyPhase('quiz');
		}
	}
}, [isLoading, studyPhase, queue, hasSkippedBriefing, redirectToDashboard]);

useEffect(() => {
	// Session completion detection
	if (studyPhase === 'quiz') {
		const isComplete = !isSessionActive || (currentIndex >= queue.length && queue.length > 0);
		if (isComplete) {
			useSessionStore.getState().endSession();
			setStudyPhase('summary');
		}
	}
}, [studyPhase, isSessionActive, currentIndex, queue.length]);
```

#### Acceptance Criteria

- ✅ All phase transitions work identically
- ✅ No console errors
- ✅ Manual testing: All phase flows work

---

### Task 1.4: Extract Phase Helper Functions

**Time:** 1 hour  
**Risk:** Low

#### Steps

1. **Create `transitionToQuiz()` helper:**

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

2. **Create `transitionToSummary()` helper:**

   ```typescript
   const transitionToSummary = useCallback(() => {
   	useSessionStore.getState().endSession();
   	setStudyPhase('summary');
   }, []);
   ```

3. **Create `ensureCurrentCard()` helper:**

   ```typescript
   const ensureCurrentCard = useCallback(() => {
   	if (queue.length > 0 && !currentCard) {
   		useSessionStore.setState({ currentCard: queue[0], currentIndex: 0 });
   	}
   }, [queue, currentCard]);
   ```

#### Acceptance Criteria

- ✅ Helper functions work correctly
- ✅ No duplicate logic
- ✅ Functions are memoized with useCallback

---

### Task 1.5: Extract Phase-Related Side Effects

**Time:** 45 minutes  
**Risk:** Low

#### Steps

1. **Extract navbar visibility effect** (lines 151-163)
   - Move to hook or return phase for component to handle
   - Decision: Keep in component (it's UI-specific, not phase logic)

2. **Extract "ensure currentCard" effect** (lines 441-446)
   - Move to hook as internal effect

3. **Keep analytics effects in component** (lines 479-548)
   - These are side effects, not phase management
   - Will be extracted in Phase 5 (Analytics)

#### Acceptance Criteria

- ✅ Phase transitions trigger correctly
- ✅ currentCard is set when entering quiz
- ✅ No missing side effects

---

### Task 1.6: Integrate Hook into Component (Gradual)

**Time:** 1.5 hours  
**Risk:** Medium

#### Steps

1. **Import hook in component:**

   ```typescript
   import { useSessionPhase } from '@/modules/study/hooks/useSessionPhase';
   ```

2. **Use hook alongside existing state (parallel):**

   ```typescript
   // OLD (keep for now)
   const [studyPhase, setStudyPhase] = useState<StudyPhase>('loading');
   const [hasSkippedBriefing, setHasSkippedBriefing] = useState(false);

   // NEW (add)
   const phaseHook = useSessionPhase({
   	queue,
   	currentCard,
   	currentIndex,
   	isSessionActive,
   	isLoading,
   	redirectToDashboard,
   });
   ```

3. **Compare values (debugging):**

   ```typescript
   useEffect(() => {
   	if (studyPhase !== phaseHook.studyPhase) {
   		console.warn('[Migration] Phase mismatch:', {
   			old: studyPhase,
   			new: phaseHook.studyPhase,
   		});
   	}
   }, [studyPhase, phaseHook.studyPhase]);
   ```

4. **Switch to hook gradually:**
   - Start with read-only: Use `phaseHook.studyPhase` for display
   - Keep `setStudyPhase` for writes (temporary)
   - Test each phase transition

#### Acceptance Criteria

- ✅ Component works with parallel implementation
- ✅ No phase mismatches in console
- ✅ All transitions work correctly

---

### Task 1.7: Replace State with Hook (Final Step)

**Time:** 1 hour  
**Risk:** Medium

#### Steps

1. **Remove old state declarations:**

   ```typescript
   // REMOVE:
   const [studyPhase, setStudyPhase] = useState<StudyPhase>('loading');
   const [hasSkippedBriefing, setHasSkippedBriefing] = useState(false);
   const [hasSkippedPriming, setHasSkippedPriming] = useState(false);
   ```

2. **Use hook values:**

   ```typescript
   // REPLACE ALL:
   // studyPhase → phaseHook.studyPhase
   // setStudyPhase → phaseHook.setStudyPhase
   // hasSkippedBriefing → phaseHook.hasSkippedBriefing
   // setHasSkippedBriefing → phaseHook.setHasSkippedBriefing
   // hasSkippedPriming → phaseHook.hasSkippedPriming
   // setHasSkippedPriming → phaseHook.setHasSkippedPriming
   ```

3. **Update phase transition calls:**

   ```typescript
   // OLD:
   setStudyPhase('quiz');

   // NEW:
   phaseHook.transitionToQuiz();
   // OR if direct set is needed:
   phaseHook.setStudyPhase('quiz');
   ```

4. **Update briefing handlers:**

   ```typescript
   // OLD (lines 1060-1091):
   onStart={() => {
     if (queue.length > 0 && queue[0]) {
       useSessionStore.setState({
         currentCard: queue[0],
         currentIndex: 0,
         isSessionActive: true,
       });
       setStudyPhase('quiz');
       setShowAnswer(false);
       resetTimer();
     }
   }}

   // NEW:
   onStart={() => {
     phaseHook.transitionToQuiz();
     setShowAnswer(false);
     resetTimer();
   }}
   ```

#### Acceptance Criteria

- ✅ All old state removed
- ✅ All references updated
- ✅ Component compiles without errors
- ✅ All phase transitions work

---

### Task 1.8: Testing & Validation

**Time:** 1.5 hours  
**Risk:** Low

#### Manual Testing Checklist

1. **Loading Phase:**
   - [ ] Component shows loading spinner
   - [ ] Phase transitions to briefing (if new cards)
   - [ ] Phase transitions to quiz (if no new cards)

2. **Priming Phase:**
   - [ ] Priming modal shows (first time)
   - [ ] Story reader shows after modal
   - [ ] Skip priming works
   - [ ] Complete priming transitions correctly

3. **Briefing Phase:**
   - [ ] Briefing shows when new cards exist
   - [ ] Start button transitions to quiz
   - [ ] Skip button transitions to quiz
   - [ ] currentCard is set before quiz

4. **Quiz Phase:**
   - [ ] Cards display correctly
   - [ ] Rating works
   - [ ] Phase transitions to summary when complete

5. **Summary Phase:**
   - [ ] Summary shows after session complete
   - [ ] Navbar is visible

#### Edge Cases

- [ ] Empty queue → redirects to dashboard
- [ ] Session resume (queue already populated)
- [ ] Rapid phase transitions (no race conditions)
- [ ] Component unmount during transition (no errors)

#### Acceptance Criteria

- ✅ All manual tests pass
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ No performance regression

---

### Task 1.9: Cleanup & Documentation

**Time:** 30 minutes  
**Risk:** Low

#### Steps

1. **Remove debug logging:**
   - Remove phase comparison logs
   - Keep essential console.logs for debugging

2. **Add JSDoc comments:**

   ```typescript
   /**
    * Hook to manage study session phase state and transitions.
    *
    * Handles:
    * - Phase transitions (loading → briefing/quiz → summary)
    * - User preferences (skipped briefing/priming)
    * - Session completion detection
    *
    * @param options - Configuration for phase management
    * @returns Phase state and transition functions
    */
   export function useSessionPhase(options: UseSessionPhaseOptions): UseSessionPhaseReturn;
   ```

3. **Update component comments:**
   - Add comment explaining hook usage
   - Document any remaining phase logic in component

#### Acceptance Criteria

- ✅ Code is clean and documented
- ✅ No debug code left
- ✅ Hook is ready for reuse

---

## Migration Strategy: Parallel Implementation

### Phase A: Create Hook (Tasks 1.1-1.5)

- Create hook with all logic
- Keep component unchanged
- Test hook in isolation

### Phase B: Parallel Run (Task 1.6)

- Use hook alongside existing state
- Compare values for safety
- Test all transitions

### Phase C: Switch Over (Task 1.7)

- Remove old state
- Use hook exclusively
- Test thoroughly

### Phase D: Validate (Tasks 1.8-1.9)

- Manual testing
- Cleanup
- Documentation

---

## Rollback Plan

If issues occur:

1. **Immediate Rollback:**
   - Revert to commit before Task 1.7
   - Component still has original state
   - No data loss

2. **Partial Rollback:**
   - Keep hook but use original state
   - Comment out hook usage
   - Debug hook separately

3. **Debug Mode:**
   - Re-enable phase comparison logging
   - Identify mismatches
   - Fix hook logic

---

## Success Criteria

✅ **Functional:**

- All phase transitions work identically
- No breaking changes to user experience
- All edge cases handled

✅ **Code Quality:**

- Hook is reusable and testable
- Component complexity reduced
- Clear separation of concerns

✅ **Testing:**

- Manual testing passes
- No console errors
- No TypeScript errors

---

## Estimated Timeline

| Task                           | Time   | Cumulative |
| ------------------------------ | ------ | ---------- |
| 1.1: Create Hook Structure     | 30 min | 30 min     |
| 1.2: Extract Phase State       | 45 min | 1h 15min   |
| 1.3: Extract Transition Logic  | 2h     | 3h 15min   |
| 1.4: Extract Helper Functions  | 1h     | 4h 15min   |
| 1.5: Extract Side Effects      | 45 min | 5h         |
| 1.6: Integrate Hook (Parallel) | 1.5h   | 6h 30min   |
| 1.7: Replace State             | 1h     | 7h 30min   |
| 1.8: Testing & Validation      | 1.5h   | 9h         |
| 1.9: Cleanup                   | 30 min | 9h 30min   |

**Total: ~9.5 hours (1.5 days)**

---

## Next Steps After Phase 1

Once Phase 1 is complete and validated:

- Proceed to Phase 2: Extract Initialization Logic
- Or pause for team review
- Or continue with other phases

---

## Notes

- **Feature-Focused:** Line count is not a constraint. Focus on clean, maintainable code.
- **Safety First:** Parallel implementation ensures we can rollback if needed.
- **Test Early:** Test after each task, not just at the end.
- **Document Decisions:** Comment why certain logic stays in component vs hook.
