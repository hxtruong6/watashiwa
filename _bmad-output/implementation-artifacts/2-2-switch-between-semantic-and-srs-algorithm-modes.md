# Story 2.2: Switch Between Semantic and SRS Algorithm Modes

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want to switch between semantic algorithm mode and traditional SRS mode,
So that I can choose the learning approach that works best for me.

## Acceptance Criteria

**Given** I am in an active study session
**When** I access the algorithm mode settings
**Then** I can see the current mode (Semantic or SRS)
**And** I can switch between modes
**And** the switch takes effect immediately for the next word (FR2)

**Given** I switch from semantic mode to SRS mode
**When** the switch is confirmed
**Then** subsequent words are presented using traditional SRS timing
**And** my preference is saved for future sessions
**And** I receive confirmation of the mode change

**Given** I am using semantic mode and experiencing poor performance
**When** I view algorithm performance feedback
**Then** I can see metrics about semantic algorithm effectiveness (FR5)
**And** I receive recommendations to switch to SRS mode if needed
**And** I can switch modes based on the feedback

**Given** I switch algorithm modes mid-session
**When** the switch occurs
**Then** my current progress is preserved
**And** the next word uses the new algorithm mode
**And** I don't lose any words I've already studied

**Given** I attempt to switch modes during a network interruption
**When** I make the switch
**Then** the switch is saved locally
**And** it syncs to the server when connectivity is restored
**And** the mode change takes effect immediately locally

## Tasks / Subtasks

- [ ] Task 1: Add algorithm mode preference to study preferences store (AC: 1, 2, 4, 5)
  - [ ] Extend `useStudyPreferences` store in `src/modules/study/store/useStudyPreferences.ts`
  - [ ] Add `algorithmMode: 'semantic' | 'srs'` state with default 'srs' (fallback-safe)
  - [ ] Add `setAlgorithmMode` action
  - [ ] Persist to localStorage using existing persist middleware
  - [ ] Ensure preference syncs across tabs/devices

- [ ] Task 2: Create algorithm mode selector UI component (AC: 1, 2)
  - [ ] Create `AlgorithmModeSelector` component in `src/modules/study/components/Session/AlgorithmModeSelector.tsx`
  - [ ] Use Ant Design `Radio.Group` or `Segmented` component for mode selection
  - [ ] Display current mode with clear labels ("Semantic" / "SRS")
  - [ ] Add tooltip/help text explaining each mode
  - [ ] Integrate with `useStudyPreferences` store
  - [ ] Show confirmation message on mode change using Ant Design `message` component

- [ ] Task 3: Integrate mode selector into SessionController settings (AC: 1, 2)
  - [ ] Add algorithm mode selector to `StudySettings` component or create settings section
  - [ ] Ensure selector is accessible during active session
  - [ ] Position in settings drawer/modal alongside other study preferences
  - [ ] Test mode switching during active session

- [ ] Task 4: Implement server-side preference persistence (AC: 2, 5)
  - [ ] Create server action `updateAlgorithmModePreference` in `src/modules/study/study.actions.ts`
  - [ ] Use Zod schema validation: `z.object({ algorithmMode: z.enum(['semantic', 'srs']) })`
  - [ ] Update User model preferences JSONB field or create separate `UserStudyPreference` table
  - [ ] Implement optimistic updates with server sync
  - [ ] Handle offline mode: queue preference updates for sync when online

- [ ] Task 5: Modify queue generation to respect algorithm mode (AC: 2, 4)
  - [ ] Update `getReviewQueue` action in `src/modules/study/study.actions.ts` or `src/modules/study/actions/getReviewQueue.ts`
  - [ ] Accept `algorithmMode` parameter from client preferences
  - [ ] If mode is 'semantic': call semantic sequencer service (to be implemented in Story 2.1)
  - [ ] If mode is 'srs': use existing FSRS queue logic (current implementation)
  - [ ] Ensure mode switch mid-session: regenerate queue for remaining cards using new mode
  - [ ] Preserve current card and progress when switching modes

- [ ] Task 6: Implement algorithm performance feedback UI (AC: 3)
  - [ ] Create `AlgorithmPerformanceFeedback` component
  - [ ] Display metrics: response time, relationship quality, retention improvement
  - [ ] Show recommendation to switch to SRS if performance is poor
  - [ ] Integrate with analytics tracking for algorithm effectiveness
  - [ ] Position in settings or as inline feedback during session

- [ ] Task 7: Handle offline mode switching (AC: 5)
  - [ ] Store mode preference in localStorage immediately (already handled by persist middleware)
  - [ ] Queue server sync using existing offline queue pattern
  - [ ] Apply mode change locally even when offline
  - [ ] Sync preference to server when connectivity restored
  - [ ] Test offline mode switching scenarios

- [ ] Task 8: Add analytics tracking for mode switches (AC: 2, 3)
  - [ ] Track `algorithm_mode_switched` event with `trackEvent` from `@/lib/analytics`
  - [ ] Include: from_mode, to_mode, session_id, switch_reason (if available)
  - [ ] Track algorithm performance metrics for A/B testing
  - [ ] Monitor mode usage patterns

- [ ] Task 9: Testing and validation
  - [ ] Unit tests for `useStudyPreferences` store extension
  - [ ] Unit tests for `updateAlgorithmModePreference` server action
  - [ ] Integration tests for queue generation with different modes
  - [ ] E2E test for complete mode switching flow
  - [ ] Test offline mode switching and sync
  - [ ] Test mid-session mode switching preserves progress

## Dev Notes

### Existing Implementation

**Current Study Session Architecture:**

The study session system uses a hybrid architecture with:

- **Zustand Store**: `useSessionStore` in `src/modules/study/store/useSessionStore.ts` manages session state (queue, currentIndex, cards)
- **Study Preferences Store**: `useStudyPreferences` in `src/modules/study/store/useStudyPreferences.ts` manages UI preferences (furigana, romaji, audio) with localStorage persistence
- **Session Controller**: `SessionController.tsx` orchestrates the study session UI
- **Queue Generation**: `getReviewQueue` action in `src/modules/study/actions/getReviewQueue.ts` currently uses FSRS-only logic

**Current Queue Generation Logic:**

```typescript
// src/modules/study/actions/getReviewQueue.ts
// Currently: Pure FSRS queue generation
// Priority: Due Reviews → New Cards
// No semantic sequencing yet (Story 2.1 will implement)
```

**Study Preferences Pattern:**

```typescript
// src/modules/study/store/useStudyPreferences.ts
// Pattern: Zustand store with persist middleware
// localStorage key: 'watashi-study-prefs'
// Extend this pattern for algorithm mode
```

### Project Structure Notes

**Vertical Slice Architecture Compliance:**

- **Module Location**: `src/modules/study/` - All study-related code lives here
- **Store Location**: `src/modules/study/store/` - Zustand stores for study module
- **Components Location**: `src/modules/study/components/Session/` - Session UI components
- **Actions Location**: `src/modules/study/study.actions.ts` or `src/modules/study/actions/` - Server actions
- **Types Location**: `src/modules/study/types.ts` or co-located with components

**File Organization:**

```
src/modules/study/
├── store/
│   ├── useSessionStore.ts          # Session state (queue, currentIndex)
│   └── useStudyPreferences.ts       # UI preferences (EXTEND THIS)
├── components/
│   └── Session/
│       ├── SessionController.tsx    # Main session orchestrator
│       ├── StudySettings.tsx       # Settings drawer/modal
│       └── AlgorithmModeSelector.tsx  # NEW: Mode selector component
├── actions/
│   └── getReviewQueue.ts           # Queue generation (MODIFY THIS)
├── study.actions.ts                # Server actions (EXTEND THIS)
└── types.ts                        # Type definitions
```

### Architecture Compliance

**Technical Stack Requirements:**

- **Framework**: Next.js 16+ (App Router) - Server Actions for preference updates
- **State Management**: Zustand with persist middleware (existing pattern)
- **UI Library**: Ant Design v6 - Use `Radio.Group`, `Segmented`, or `Switch` for mode selection
- **Language**: TypeScript 5.x with strict mode
- **Database**: PostgreSQL + Prisma - Store preference in User model or separate table

**Architecture Patterns:**

1. **Hybrid FSRS + Semantic Sequencing** (from architecture.md):
   - FSRS determines timing (when to review)
   - Semantic algorithm determines ordering (which words to show together)
   - Fallback to pure FSRS if semantic processing fails
   - **Reference**: `_bmad-output/planning-artifacts/architecture.md#Semantic-Algorithm-Architecture`

2. **Performance Requirements**:
   - Algorithm mode switch: <100ms (local state update)
   - Queue regeneration: <500ms (server action)
   - Preference sync: Non-blocking (optimistic update)

3. **Offline Support**:
   - Use existing persist middleware for localStorage
   - Queue server sync for when online
   - Apply changes immediately locally

**Security Requirements:**

- **Input Validation**: Use Zod schema for `algorithmMode` enum validation
- **User Authorization**: Ensure user can only update their own preferences
- **Rate Limiting**: Apply rate limiting to preference update endpoints (NFR14)

### Library/Framework Requirements

**Zustand (State Management):**

- **Version**: Current (check `package.json`)
- **Pattern**: Use existing `persist` middleware from `zustand/middleware/persist`
- **Storage Key**: Extend existing `'watashi-study-prefs'` or create separate key
- **Reference**: Existing implementation in `useStudyPreferences.ts`

**Ant Design v6:**

- **Components**:
  - `Radio.Group` or `Segmented` for mode selection
  - `message` for confirmation feedback
  - `Tooltip` for help text
- **Tokens**: Use theme tokens for consistent styling
- **Reference**: Existing Ant Design usage in `SessionController.tsx`

**Zod (Validation):**

- **Schema**: `z.object({ algorithmMode: z.enum(['semantic', 'srs']) })`
- **Usage**: Validate server action inputs
- **Reference**: Existing patterns in `study.actions.ts`

**Prisma (Database):**

- **Model**: Extend User model `preferences` JSONB field OR create `UserStudyPreference` table
- **Migration**: Create migration for schema changes
- **Reference**: Existing User model in `prisma/schema.prisma`

### File Structure Requirements

**New Files to Create:**

1. `src/modules/study/components/Session/AlgorithmModeSelector.tsx`
   - Client component for mode selection UI
   - Uses Ant Design components
   - Integrates with `useStudyPreferences` store

**Files to Modify:**

1. `src/modules/study/store/useStudyPreferences.ts`
   - Add `algorithmMode` state and `setAlgorithmMode` action
   - Extend persist configuration

2. `src/modules/study/study.actions.ts` or create `src/modules/study/actions/updateAlgorithmModePreference.ts`
   - Add server action for preference persistence
   - Include Zod validation

3. `src/modules/study/actions/getReviewQueue.ts`
   - Accept `algorithmMode` parameter
   - Conditionally call semantic sequencer (when Story 2.1 is complete)
   - Fallback to FSRS if mode is 'srs' or semantic service unavailable

4. `src/modules/study/components/Session/StudySettings.tsx` (if exists) or `SessionController.tsx`
   - Integrate `AlgorithmModeSelector` component
   - Ensure accessible during active session

5. `prisma/schema.prisma` (if needed)
   - Add algorithm mode preference to User model or create separate table

**Testing Files:**

- `src/modules/study/store/useStudyPreferences.test.ts` (if exists, extend)
- `src/modules/study/actions/updateAlgorithmModePreference.test.ts` (new)
- `e2e/algorithm-mode-switching.spec.ts` (new E2E test)

### Testing Requirements

**Unit Tests (Vitest):**

- Test `useStudyPreferences` store extension:
  - Default algorithm mode is 'srs' (safe fallback)
  - Mode switching updates state correctly
  - Persistence to localStorage works
  - State syncs across store instances

- Test `updateAlgorithmModePreference` server action:
  - Validates input with Zod schema
  - Updates database correctly
  - Handles unauthorized access
  - Handles invalid input

**Integration Tests:**

- Test queue generation with different modes:
  - SRS mode uses existing FSRS logic
  - Semantic mode calls semantic sequencer (when available)
  - Mode switch mid-session regenerates queue correctly
  - Progress preserved during mode switch

**E2E Tests (Playwright):**

- Complete mode switching flow:
  1. Start study session
  2. Access settings
  3. Switch algorithm mode
  4. Verify mode change takes effect
  5. Verify preference persists across sessions
  6. Test offline mode switching

**Performance Tests:**

- Mode switch latency: <100ms
- Queue regeneration: <500ms
- Preference sync: Non-blocking

### Previous Story Intelligence

**Story 2.1 Context (If Completed):**

- Semantic sequencer service will be implemented in `src/modules/study/services/semantic-sequencer.service.ts`
- Queue generation will support semantic sequencing
- This story builds on Story 2.1 by adding user control over algorithm mode

**Story 1.x Patterns (Authentication/User Management):**

- Server actions use `executeSafeAction` pattern from `@/modules/core/action-client`
- User authorization checked via `getUser()` from `@/modules/auth/auth.actions`
- Zod validation used for all server action inputs
- **Reference**: `_bmad-output/implementation-artifacts/1-1-user-registration-with-email-password.md`

### References

**Architecture Documentation:**

- Semantic Algorithm Architecture: `_bmad-output/planning-artifacts/architecture.md#Semantic-Algorithm-Architecture`
- Hybrid FSRS + Semantic Sequencing: Lines 1012-1173 in architecture.md
- Performance Requirements: <500ms algorithm response times

**Epic Context:**

- Epic 2: Core Semantic Learning Sessions
- Story 2.2 Requirements: `_bmad-output/planning-artifacts/epics.md#Story-2.2` (lines 762-799)
- FR2: Switch between semantic algorithm mode and traditional SRS mode
- FR5: Algorithm performance feedback

**PRD Context:**

- Semantic Learning Engine: `_bmad-output/planning-artifacts/prd.md#Semantic-Learning-Engine`
- User preference for learning approach
- Algorithm transparency and user control

**Code References:**

- Study Preferences Store: `src/modules/study/store/useStudyPreferences.ts`
- Session Store: `src/modules/study/store/useSessionStore.ts`
- Queue Generation: `src/modules/study/actions/getReviewQueue.ts`
- Session Controller: `src/modules/study/components/Session/SessionController.tsx`
- Study Actions: `src/modules/study/study.actions.ts`

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
