# Story 2.1: Start Study Session with Semantic Sequencing

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want to start a study session where words are presented based on semantic relationships,
So that I learn vocabulary in meaningful contextual connections rather than random order.

## Acceptance Criteria

**Given** I am logged in and have vocabulary in my deck
**When** I start a new study session
**Then** words are presented based on contextual relationships rather than time-based intervals (FR1)
**And** the semantic sequencer service selects words with semantic connections (<500ms response time, NFR1)
**And** I see the first word card with its semantic context
**And** the session state is initialized and saved (FR35)

**Given** I am starting a study session
**When** the semantic algorithm processes word relationships
**Then** the algorithm response completes in <500ms (NFR1)
**And** words are sequenced to create meaningful learning connections
**And** previously learned words influence the selection of new words

**Given** I have no vocabulary in my deck
**When** I attempt to start a study session
**Then** I see a message indicating I need to add vocabulary first
**And** I am directed to the deck management page

**Given** the semantic algorithm service is temporarily unavailable
**When** I start a study session
**Then** the system automatically falls back to SRS mode (NFR54)
**And** I see a notification that semantic mode is unavailable
**And** the session continues normally with SRS sequencing

**Given** the semantic algorithm takes longer than 500ms to respond
**When** I start a study session
**Then** the system shows a loading indicator
**And** if timeout occurs (>2 seconds), it falls back to SRS mode
**And** I can retry semantic mode later

**Given** I have only one word in my deck
**When** I start a study session
**Then** the session starts with that word
**And** I see a message suggesting I add more vocabulary for better semantic sequencing
**And** the session completes normally

## Tasks / Subtasks

- [ ] Task 1: Create semantic sequencer service (AC: 1, 2)
  - [ ] Create `src/modules/study/services/semantic-sequencer.service.ts`
  - [ ] Implement relationship detection (etymology-based first)
  - [ ] Implement queue reordering algorithm
  - [ ] Add performance monitoring (<500ms requirement)
  - [ ] Add timeout handling (2 seconds max)
  - [ ] Return sequenced queue with relationship metadata

- [ ] Task 2: Integrate semantic sequencer with FSRS queue (AC: 1, 2)
  - [ ] Modify `src/modules/study/actions/getReviewQueue.ts` or `fetchSessionAction`
  - [ ] Call semantic sequencer after FSRS queue generation
  - [ ] Apply semantic reordering while maintaining FSRS priority (Due > New)
  - [ ] Handle empty queue case (no vocabulary)
  - [ ] Handle single word case
  - [ ] Test integration with existing session flow

- [ ] Task 3: Implement fallback mechanism (AC: 4, 5)
  - [ ] Add error handling in semantic sequencer
  - [ ] Return FSRS queue on error or timeout
  - [ ] Show user notification when fallback occurs
  - [ ] Log fallback events for monitoring
  - [ ] Test fallback scenarios (service unavailable, timeout)

- [ ] Task 4: Implement relationship detection (AC: 1, 2)
  - [ ] Query shared kanji roots from etymology graph
  - [ ] Query confusion pairs from ConfusionPair model
  - [ ] Group words by same deck/unit (contextual grouping)
  - [ ] Calculate relationship strength scores
  - [ ] Cache relationship queries (TTL: 1 hour)
  - [ ] Test relationship detection accuracy

- [ ] Task 5: Implement queue reordering algorithm (AC: 1, 2)
  - [ ] Cluster related words together
  - [ ] Maintain FSRS priority (Due Reviews > New Cards)
  - [ ] Within clusters, prioritize by relationship strength
  - [ ] Preserve original order for words without relationships
  - [ ] Test reordering with various queue sizes

- [ ] Task 6: Add performance monitoring and caching (AC: 2)
  - [ ] Create `src/lib/cache/memory-cache.ts` for relationship caching
  - [ ] Cache word relationships per user (TTL: 1 hour)
  - [ ] Cache sequenced queue for active sessions (TTL: 5 minutes)
  - [ ] Invalidate cache on new word learned or review completed
  - [ ] Add performance metrics tracking (<500ms target)
  - [ ] Test cache hit/miss scenarios

- [ ] Task 7: Handle edge cases (AC: 3, 6)
  - [ ] Check for empty vocabulary before starting session
  - [ ] Show message and redirect to deck management if empty
  - [ ] Handle single word case (show suggestion message)
  - [ ] Handle timeout scenarios (>2 seconds)
  - [ ] Test all edge cases

- [ ] Task 8: Add loading states and user feedback (AC: 5)
  - [ ] Show loading indicator during semantic processing
  - [ ] Show notification when fallback to SRS occurs
  - [ ] Add semantic context indicators on cards (optional)
  - [ ] Test loading states and user feedback

- [ ] Task 9: Testing and validation
  - [ ] Unit tests for semantic sequencer service
  - [ ] Unit tests for relationship detection
  - [ ] Unit tests for queue reordering algorithm
  - [ ] Performance tests (<500ms requirement)
  - [ ] E2E test for complete semantic sequencing flow
  - [ ] E2E test for fallback scenarios
  - [ ] Test with various vocabulary sizes (1, 10, 50+ words)

## Dev Notes

### Existing Implementation

**Current Study Session Flow:**

1. **Session Initialization** (`src/modules/study/components/Session/SessionController.tsx`):
   - Calls `fetchSessionAction({ deckId, courseId })` to get cards
   - Uses `useSessionStore` to manage session state
   - Handles priming check (if deckId present)
   - Initializes session with fetched cards

2. **Card Fetching** (`src/modules/flashcard/flashcard.actions.ts`):
   - `fetchSessionAction()` fetches due reviews and new cards
   - Uses FSRS priority: Due Reviews → New Cards
   - Returns SmartCard array
   - Handles deck/course resolution

3. **FSRS Queue Generation** (`src/modules/study/actions/getReviewQueue.ts`):
   - Fetches due reviews (priority A)
   - Fetches new cards (priority B, if capacity available)
   - Returns queue with source indicator
   - Currently no semantic sequencing

4. **Session Store** (`src/modules/study/store/useSessionStore.ts`):
   - Manages session state (queue, currentIndex, currentCard)
   - Handles card rating submission
   - Tracks session progress

**What Needs to Be Created:**

1. **Semantic Sequencer Service**: New service to reorder FSRS queue based on relationships
2. **Relationship Detection**: Query etymology, confusion pairs, deck context
3. **Caching Layer**: Cache relationships and sequenced queues
4. **Fallback Logic**: Graceful degradation to FSRS on error/timeout
5. **Performance Monitoring**: Track sequencing time and enforce <500ms limit

### Previous Story Intelligence

**Key Learnings from Epic 1 Stories:**

1. **Server Actions Pattern**: Use `executeSafeAction` with Zod validation
2. **Error Handling**: Graceful degradation, never block core functionality
3. **Performance**: Critical paths must meet NFR targets (<500ms)
4. **Caching**: Use caching for expensive operations
5. **User Feedback**: Show loading states and notifications

**Patterns to Follow:**

- Use `executeSafeAction` pattern for server actions
- Implement graceful fallback mechanisms
- Add performance monitoring and logging
- Use caching for expensive queries
- Show user-friendly error messages

### Architecture Compliance

**Server Actions Pattern:**

```typescript
'use server';
import { executeSafeAction } from '@/modules/core/action-client';
import { z } from 'zod';

export async function getSemanticallySequencedQueue(input: unknown) {
	return executeSafeAction(
		InputSchema,
		input,
		async (validatedInput, { userId }) => {
			if (!userId) throw new Error('Unauthorized');

			// Get FSRS queue first
			const fsrsQueue = await getFSRSQueue(validatedInput);

			// Apply semantic sequencing with fallback
			const sequencedQueue = await getSemanticallySequencedQueue(fsrsQueue);

			return { success: true, data: sequencedQueue };
		},
		{ userId: true },
	);
}
```

**Service Pattern:**

```typescript
// src/modules/study/services/semantic-sequencer.service.ts
export async function getSemanticallySequencedQueue(
	fsrsQueue: SmartCard[],
	userId: string,
): Promise<SmartCard[]> {
	const startTime = Date.now();

	try {
		// Check cache first
		const cached = await getCachedSequence(userId, fsrsQueue);
		if (cached) return cached;

		// Get relationships
		const relationships = await getWordRelationships(fsrsQueue, userId);

		// Reorder queue
		const sequenced = reorderByRelationships(fsrsQueue, relationships);

		// Performance check
		const elapsed = Date.now() - startTime;
		if (elapsed > 500) {
			console.warn('Semantic sequencing too slow, using FSRS queue');
			return fsrsQueue; // Fallback
		}

		// Cache result
		await cacheSequence(userId, sequenced);

		return sequenced;
	} catch (error) {
		console.error('Semantic sequencing failed:', error);
		return fsrsQueue; // Fallback to FSRS
	}
}
```

**Database Access:**

- Use Prisma client from `@/lib/db`
- Query Vocabulary.etymology JSONB field for kanji roots
- Query ConfusionPair model for confusion relationships
- Use deckId for contextual grouping
- Always filter by userId (multi-tenancy)

**Caching Pattern:**

- Use in-memory cache for relationship queries
- Cache key: `semantic-relationships:${userId}:${vocabIds.join(',')}`
- TTL: 1 hour for relationships
- TTL: 5 minutes for sequenced queues
- Invalidate on: new word learned, review completed

### Library & Framework Requirements

**TypeScript:**

- Strict mode enabled
- Strong typing for SmartCard, relationships, cache

**Prisma 7.2.0:**

- Query Vocabulary model with etymology JSONB
- Query ConfusionPair model
- Use include/select for efficient queries

**Performance Requirements:**

- **Semantic Query**: <200ms for relationship lookups (NFR1)
- **Queue Reordering**: <100ms for 50-card queue
- **Total Overhead**: <300ms added to session initialization
- **Fallback Threshold**: >500ms triggers fallback to FSRS
- **Timeout**: >2 seconds triggers fallback

### File Structure Requirements

**Files to Review:**

- `src/modules/study/actions/getReviewQueue.ts` - FSRS queue generation
- `src/modules/flashcard/flashcard.actions.ts` - `fetchSessionAction` implementation
- `src/modules/study/components/Session/SessionController.tsx` - Session initialization
- `src/modules/study/store/useSessionStore.ts` - Session state management
- `prisma/schema.prisma` - Vocabulary, ConfusionPair models
- `src/types/smart-cube.ts` - SmartCard type definition
- `_bmad-output/planning-artifacts/architecture.md` - Semantic algorithm architecture

**Files to Create/Modify:**

- `src/modules/study/services/semantic-sequencer.service.ts` - Semantic sequencing service (NEW)
- `src/lib/cache/memory-cache.ts` - In-memory cache implementation (NEW)
- `src/lib/cache/index.ts` - Cache exports (NEW)
- `src/modules/study/actions/getReviewQueue.ts` - Integrate semantic sequencer (MODIFY)
- `src/modules/flashcard/flashcard.actions.ts` - Add semantic sequencing option (MODIFY)
- `src/modules/study/types.ts` - Add relationship types (NEW or MODIFY)
- `src/modules/study/services/semantic-sequencer.test.ts` - Unit tests (NEW)
- `e2e/semantic-sequencing.spec.ts` - E2E tests (NEW)

**Module Organization (Vertical Slice):**

```
src/modules/study/
├── services/
│   └── semantic-sequencer.service.ts    # NEW: Semantic sequencing logic
├── actions/
│   ├── getReviewQueue.ts                # MODIFY: Add semantic sequencing
│   └── study.actions.ts                  # Existing study actions
├── components/
│   └── Session/
│       └── SessionController.tsx        # No changes (uses queue as-is)
├── store/
│   └── useSessionStore.ts                # No changes
└── types.ts                              # NEW or MODIFY: Add relationship types
```

### Testing Requirements

**Unit Tests:**

- Test `getSemanticallySequencedQueue()` function:
  - Successful sequencing
  - Fallback on error
  - Fallback on timeout (>500ms)
  - Empty queue handling
  - Single word handling
- Test relationship detection:
  - Etymology-based relationships
  - Confusion pair relationships
  - Deck context relationships
- Test queue reordering:
  - Maintains FSRS priority
  - Clusters related words
  - Handles words without relationships
- Test caching:
  - Cache hit/miss scenarios
  - Cache invalidation
  - TTL expiration

**Performance Tests:**

- Semantic query performance (<200ms)
- Queue reordering performance (<100ms)
- Total overhead (<300ms)
- Cache performance (hit rate >80%)

**E2E Tests (Playwright):**

- Complete semantic sequencing flow: start session → semantic processing → cards presented
- Fallback scenario: semantic service unavailable → fallback to SRS
- Timeout scenario: semantic processing >2s → fallback to SRS
- Empty vocabulary: no cards → show message → redirect
- Single word: one card → show suggestion message

**Test Files:**

- Unit tests: `src/modules/study/services/semantic-sequencer.test.ts`
- Performance tests: `src/modules/study/services/semantic-sequencer.perf.test.ts`
- E2E tests: `e2e/semantic-sequencing.spec.ts`

### Project Structure Notes

**Alignment with Unified Project Structure:**

- ✅ Vertical Slice Architecture maintained (`src/modules/study/`)
- ✅ Service layer for business logic (`services/`)
- ✅ Server Actions pattern (`actions/`)
- ✅ Shared utilities in `src/lib/cache/`
- ✅ Type definitions co-located (`types.ts`)

**No Conflicts Detected:**

- All file locations align with existing architecture
- No deviations from Vertical Slice pattern
- Follows established naming conventions

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#semantic-algorithm] - Semantic algorithm architecture
- [Source: _bmad-output/planning-artifacts/epics.md#epic-2-story-2.1] - Story requirements
- [Source: src/modules/study/actions/getReviewQueue.ts] - FSRS queue generation
- [Source: src/modules/flashcard/flashcard.actions.ts] - Session action implementation
- [Source: src/modules/study/components/Session/SessionController.tsx] - Session controller
- [Source: prisma/schema.prisma] - Vocabulary, ConfusionPair models
- [Source: docs/architecture/session_logic.md] - Session logic documentation

### Security Considerations

- **Input Validation**: Validate deckId, courseId, userId
- **Authorization**: Always check userId in server actions
- **Multi-Tenancy**: All queries filtered by userId
- **Rate Limiting**: Consider rate limiting for semantic queries (future)
- **Data Privacy**: Relationship queries only access user's own vocabulary

### Performance Requirements

- **Semantic Query**: <200ms for relationship lookups (NFR1)
- **Queue Reordering**: <100ms for 50-card queue
- **Total Overhead**: <300ms added to session initialization
- **Fallback Threshold**: >500ms triggers fallback to FSRS (NFR1)
- **Timeout**: >2 seconds triggers fallback
- **Cache Hit Rate**: Target >80% for relationship queries

### Latest Technical Information

**Semantic Sequencing Architecture (from Architecture Doc):**

1. **Hybrid Approach**: FSRS determines timing, semantic algorithm determines ordering
2. **Relationship Detection**:
   - Etymology-based: Shared kanji roots from Vocabulary.etymology JSONB
   - Confusion pairs: From ConfusionPair model
   - Contextual: Same deck/unit grouping
3. **Algorithm Flow**:

   ```
   FSRS Queue → Relationship Detection → Queue Reordering → Sequenced Queue
   ```

4. **Fallback Strategy**:
   - Error: Return FSRS queue
   - Timeout (>500ms): Return FSRS queue
   - Service unavailable: Return FSRS queue
5. **Caching Strategy**:
   - Relationship cache: TTL 1 hour, per user
   - Queue cache: TTL 5 minutes, per session
   - Invalidation: On new word learned, review completed

**Performance Optimization:**

1. **Batch Queries**: Query relationships for all words in queue at once
2. **Caching**: Cache relationship queries to avoid repeated DB calls
3. **Early Exit**: If queue is small (<5 words), skip semantic sequencing
4. **Parallel Processing**: Query etymology and confusion pairs in parallel

**Integration Points:**

1. **getReviewQueue Action**: Call semantic sequencer after FSRS queue generation
2. **fetchSessionAction**: Optionally apply semantic sequencing
3. **SessionController**: No changes needed (uses queue as-is, transparent)

## Dev Agent Record

### Agent Model Used

Auto (Cursor AI)

### Debug Log References

N/A (Initial story creation)

### Completion Notes List

- Story file created with comprehensive developer context
- Includes existing implementation analysis
- Documents semantic sequencer service architecture
- Includes all technical requirements and performance targets
- References architecture document for semantic algorithm design

### File List

**Existing Files to Review:**

- `src/modules/study/actions/getReviewQueue.ts` - FSRS queue generation
- `src/modules/flashcard/flashcard.actions.ts` - Session action
- `src/modules/study/components/Session/SessionController.tsx` - Session controller
- `src/modules/study/store/useSessionStore.ts` - Session store
- `prisma/schema.prisma` - Database models
- `src/types/smart-cube.ts` - SmartCard type

**Files to Create/Modify:**

- `src/modules/study/services/semantic-sequencer.service.ts` - Semantic sequencing service (NEW)
- `src/lib/cache/memory-cache.ts` - Cache implementation (NEW)
- `src/lib/cache/index.ts` - Cache exports (NEW)
- `src/modules/study/actions/getReviewQueue.ts` - Integrate semantic sequencer (MODIFY)
- `src/modules/flashcard/flashcard.actions.ts` - Add semantic option (MODIFY)
- `src/modules/study/types.ts` - Relationship types (NEW or MODIFY)
- `src/modules/study/services/semantic-sequencer.test.ts` - Unit tests (NEW)
- `e2e/semantic-sequencing.spec.ts` - E2E tests (NEW)
