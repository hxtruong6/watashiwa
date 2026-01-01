# Story 2.4: Receive Contextual Examples Linking Vocabulary

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want to see authentic contextual examples that link new vocabulary to words I've already learned,
So that I can understand how words are used together in meaningful contexts.

## Acceptance Criteria

**Given** I am studying a new word
**When** the system generates contextual examples
**Then** examples link the new word to previously learned vocabulary (FR4)
**And** examples are authentic and culturally appropriate
**And** examples are displayed with highlighted connections to known words

**Given** I am studying "eat/食べる"
**When** contextual examples are generated
**Then** I see examples like "ご飯を食べる (eat rice)" if I've learned "rice/ご飯" (FR4)
**And** the connection to previously learned words is clearly indicated
**And** examples help reinforce both the new word and existing vocabulary

**Given** I am viewing contextual examples
**When** I interact with highlighted words in examples
**Then** I can see details about those previously learned words
**And** I can review their meanings and usage
**And** the connection strengthens my understanding

## Tasks / Subtasks

- [ ] Task 1: Create contextual example generation service (AC: 1, 2)
  - [ ] Create `src/modules/study/services/contextual-example.service.ts`
  - [ ] Implement function to get user's learned vocabulary (from UserReview with srsStage > 0)
  - [ ] Implement function to find vocabulary connections (shared kanji, same deck, semantic tags)
  - [ ] Generate contextual examples that link new word to learned words
  - [ ] Filter examples to only include words user has learned (srsStage > 0)
  - [ ] Return examples with metadata about which words are linked

- [ ] Task 2: Extend example data structure to include linked words metadata (AC: 1, 2)
  - [ ] Extend `ExampleSentenceSchema` in `src/lib/schemas/jsonb.ts` to include optional `linkedWords` field
  - [ ] Define type: `linkedWords?: Array<{ vocabId: string; wordSurface: string; startIndex: number; length: number }>`
  - [ ] Update `ExamplesData` type to support linked words metadata
  - [ ] Ensure backward compatibility with existing examples (optional field)

- [ ] Task 3: Create contextual example generator server action (AC: 1, 2)
  - [ ] Create `generateContextualExamples` action in `src/modules/study/study.actions.ts`
  - [ ] Accept parameters: `vocabId` (new word), `userId` (from session)
  - [ ] Use Zod validation: `z.object({ vocabId: z.string().uuid() })`
  - [ ] Call contextual example service to generate examples
  - [ ] Return examples with linked words metadata
  - [ ] Cache generated examples (TTL: 1 hour) to avoid regeneration

- [ ] Task 4: Create example word highlighter component (AC: 1, 2, 3)
  - [ ] Create `ContextualExampleHighlighter` component in `src/modules/study/components/Session/ContextualExampleHighlighter.tsx`
  - [ ] Parse example sentence and highlight linked words
  - [ ] Use Ant Design `Typography.Text` with `mark` prop or custom styling
  - [ ] Display highlighted words with visual distinction (background color, underline, or border)
  - [ ] Show tooltip on hover with linked word details
  - [ ] Make highlighted words clickable for interaction

- [ ] Task 5: Create linked word detail modal/drawer (AC: 3)
  - [ ] Create `LinkedWordDetail` component or extend existing word detail modal
  - [ ] Display word surface, reading, meanings, and usage
  - [ ] Show connection type (e.g., "Previously learned", "Same kanji", "Related concept")
  - [ ] Allow user to review the word (add to current session if desired)
  - [ ] Use Ant Design `Drawer` or `Modal` component
  - [ ] Integrate with existing word detail display patterns

- [ ] Task 6: Integrate contextual examples into flashcard display (AC: 1, 2, 3)
  - [ ] Modify `MoreExamplesSection` or create new `ContextualExamplesSection` component
  - [ ] Fetch contextual examples when card is displayed (use `generateContextualExamples` action)
  - [ ] Display examples with highlighted linked words using `ContextualExampleHighlighter`
  - [ ] Show loading state while generating examples
  - [ ] Fallback to regular examples if contextual generation fails
  - [ ] Cache examples per card to avoid repeated API calls

- [ ] Task 7: Add example generation to card mapper (AC: 1, 2)
  - [ ] Modify `mapVocabularyToSmartCard` in `src/modules/study/study.mapper.ts`
  - [ ] Check if examples should be contextual (based on user's learned words)
  - [ ] Enhance examples with linked words metadata if available
  - [ ] Ensure examples are passed to card display components

- [ ] Task 8: Implement learned vocabulary lookup optimization (AC: 1, 2)
  - [ ] Create efficient query to get user's learned vocabulary IDs
  - [ ] Cache learned vocabulary list per user (TTL: 5 minutes)
  - [ ] Use Prisma query: `UserReview.findMany({ where: { userId, srsStage: { gt: 0 } }, select: { vocabId: true } })`
  - [ ] Optimize for performance: <200ms lookup time

- [ ] Task 9: Add analytics tracking for contextual example interactions (AC: 3)
  - [ ] Track `contextual_example_viewed` event when examples are displayed
  - [ ] Track `linked_word_clicked` event when user clicks highlighted word
  - [ ] Track `linked_word_reviewed` event when user reviews linked word
  - [ ] Include metadata: vocabId, linkedWordCount, interactionType
  - [ ] Use `trackEvent` from `@/lib/analytics`

- [ ] Task 10: Testing and validation
  - [ ] Unit tests for contextual example service
  - [ ] Unit tests for example generation server action
  - [ ] Unit tests for example highlighter component
  - [ ] Integration tests for example generation with learned words
  - [ ] E2E test for complete contextual example flow
  - [ ] Test performance: example generation <500ms
  - [ ] Test fallback to regular examples when no learned words

## Dev Notes

### Existing Implementation

**Current Example Structure:**

Examples are stored in the Vocabulary model as JSONB with the following schema:

```typescript
// src/lib/schemas/jsonb.ts
export const ExampleSentenceSchema = z.object({
  sentence: z.string(),
  translation: LocalizedStringSchema, // { vi: string, en: string }
  audio: z.string().optional(),
});
export const ExamplesSchema = z.array(ExampleSentenceSchema);
```

**Current Example Display:**

- Examples are displayed in `MoreExamplesSection` component
- Located in: `src/modules/flashcard/components/CardShell/Sections/MoreExamplesSection.tsx`
- Examples are shown in a collapsible section with sentence and translation
- Supports multiple design variants: 'safe', 'aggressive', 'minimalist'

**Current Vocabulary Model:**

```typescript
// prisma/schema.prisma
model Vocabulary {
  examples Json // Array of example objects
  // ... other fields
}
```

**Current User Review Tracking:**

- User's learned vocabulary is tracked in `UserReview` model
- `srsStage > 0` indicates word has been learned (not just new)
- Query pattern: `UserReview.findMany({ where: { userId, srsStage: { gt: 0 } } })`

### Project Structure Notes

**Vertical Slice Architecture Compliance:**

- **Module Location**: `src/modules/study/` - All study-related contextual features
- **Service Location**: `src/modules/study/services/` - Business logic services
- **Components Location**: `src/modules/study/components/Session/` - Session UI components
- **Actions Location**: `src/modules/study/study.actions.ts` - Server actions
- **Types Location**: `src/modules/study/types.ts` or co-located with components

**File Organization:**

```
src/modules/study/
├── services/
│   └── contextual-example.service.ts  # NEW: Example generation logic
├── components/
│   └── Session/
│       ├── ContextualExampleHighlighter.tsx  # NEW: Highlighting component
│       └── LinkedWordDetail.tsx  # NEW: Word detail modal/drawer
├── study.actions.ts                # EXTEND: Add generateContextualExamples
└── study.mapper.ts                 # MODIFY: Enhance examples with linked words

src/lib/schemas/
└── jsonb.ts                        # EXTEND: Add linkedWords to ExampleSentenceSchema

src/modules/flashcard/components/CardShell/Sections/
└── MoreExamplesSection.tsx        # MODIFY: Support contextual examples
```

### Architecture Compliance

**Technical Stack Requirements:**

- **Framework**: Next.js 16+ (App Router) - Server Actions for example generation
- **State Management**: React state for example display, Zustand for session state
- **UI Library**: Ant Design v6 - Use `Typography.Text`, `Tooltip`, `Drawer`, `Modal`
- **Language**: TypeScript 5.x with strict mode
- **Database**: PostgreSQL + Prisma - Query UserReview for learned words

**Architecture Patterns:**

1. **Contextual Example Generation**:
   - Server-side generation (Server Action) for security and performance
   - Client-side caching to avoid repeated API calls
   - Fallback to regular examples if generation fails

2. **Performance Requirements**:
   - Example generation: <500ms (server action)
   - Learned vocabulary lookup: <200ms
   - Example display: <100ms (client-side rendering)
   - Cache TTL: 1 hour for generated examples, 5 minutes for learned vocabulary

3. **Data Flow**:

   ```
   Card Display → Check if contextual examples needed
   → Fetch learned vocabulary (cached)
   → Generate contextual examples (cached)
   → Enhance examples with linked words metadata
   → Display with highlighting
   ```

**Security Requirements:**

- **Input Validation**: Use Zod schema for `vocabId` validation
- **User Authorization**: Ensure user can only generate examples for their own learning
- **Data Privacy**: Only use user's own learned vocabulary for generation

### Library/Framework Requirements

**Ant Design v6:**

- **Components**:
  - `Typography.Text` with `mark` prop for highlighting
  - `Tooltip` for hover details on linked words
  - `Drawer` or `Modal` for linked word details
  - `Spin` for loading states
- **Tokens**: Use theme tokens for consistent styling
- **Reference**: Existing Ant Design usage in `MoreExamplesSection.tsx`

**Zod (Validation):**

- **Schema**: `z.object({ vocabId: z.string().uuid() })`
- **Usage**: Validate server action inputs
- **Reference**: Existing patterns in `study.actions.ts`

**Prisma (Database):**

- **Query Pattern**:

  ```typescript
  await prisma.userReview.findMany({
    where: { userId, srsStage: { gt: 0 } },
    select: { vocabId: true }
  })
  ```

- **Reference**: Existing UserReview queries in `study.data.ts`

**React (Client Components):**

- **Hooks**: `useState` for example state, `useEffect` for fetching
- **Memoization**: `useMemo` for expensive computations
- **Reference**: Existing patterns in `SessionController.tsx`

### File Structure Requirements

**New Files to Create:**

1. `src/modules/study/services/contextual-example.service.ts`
   - Service for generating contextual examples
   - Functions: `getLearnedVocabulary()`, `findVocabularyConnections()`, `generateContextualExamples()`

2. `src/modules/study/components/Session/ContextualExampleHighlighter.tsx`
   - Client component for highlighting linked words in examples
   - Parses sentence and highlights words based on metadata

3. `src/modules/study/components/Session/LinkedWordDetail.tsx`
   - Client component for displaying linked word details
   - Modal or drawer for word information

**Files to Modify:**

1. `src/lib/schemas/jsonb.ts`
   - Extend `ExampleSentenceSchema` to include optional `linkedWords` field
   - Maintain backward compatibility

2. `src/modules/study/study.actions.ts`
   - Add `generateContextualExamples` server action
   - Include caching logic

3. `src/modules/study/study.mapper.ts`
   - Enhance `mapVocabularyToSmartCard` to support contextual examples
   - Add linked words metadata to examples

4. `src/modules/flashcard/components/CardShell/Sections/MoreExamplesSection.tsx`
   - Integrate contextual example display
   - Use `ContextualExampleHighlighter` component
   - Add loading state for example generation

5. `src/modules/study/study.data.ts` (if exists) or create new
   - Add function to get user's learned vocabulary efficiently
   - Add caching for learned vocabulary list

**Testing Files:**

- `src/modules/study/services/contextual-example.service.test.ts` (new)
- `src/modules/study/actions/generateContextualExamples.test.ts` (new)
- `src/modules/study/components/Session/ContextualExampleHighlighter.test.tsx` (new)
- `e2e/contextual-examples.spec.ts` (new E2E test)

### Testing Requirements

**Unit Tests (Vitest):**

- Test contextual example service:
  - `getLearnedVocabulary()` returns correct vocabulary IDs
  - `findVocabularyConnections()` finds appropriate connections
  - `generateContextualExamples()` generates examples with linked words
  - Handles edge cases: no learned words, no connections found

- Test example generation server action:
  - Validates input with Zod schema
  - Returns examples with linked words metadata
  - Handles unauthorized access
  - Caches generated examples correctly

- Test example highlighter component:
  - Highlights linked words correctly
  - Handles missing linked words metadata
  - Displays tooltips on hover
  - Handles click interactions

**Integration Tests:**

- Test example generation with learned words:
  - Generates examples that link to learned words
  - Filters out unlearned words from examples
  - Caches examples correctly
  - Falls back to regular examples when needed

**E2E Tests (Playwright):**

- Complete contextual example flow:
  1. User studies new word
  2. Examples are generated with linked words
  3. Linked words are highlighted
  4. User clicks highlighted word
  5. Word details are displayed
  6. User can review linked word

**Performance Tests:**

- Example generation: <500ms
- Learned vocabulary lookup: <200ms
- Example display: <100ms
- Cache hit rate: >80% after initial generation

### Previous Story Intelligence

**Story 2.1 Context (If Completed):**

- Semantic sequencer service will be implemented
- This story can leverage semantic relationships for finding vocabulary connections
- **Reference**: `_bmad-output/implementation-artifacts/2-1-start-study-session-with-semantic-sequencing.md`

**Story 2.2 Context (If Completed):**

- Algorithm mode switching will be implemented
- Contextual examples should work in both semantic and SRS modes
- **Reference**: `_bmad-output/implementation-artifacts/2-2-switch-between-semantic-and-srs-algorithm-modes.md`

**Story 2.3 Context (If Completed):**

- Semantic relationship detection will be implemented
- Can reuse relationship detection logic for finding vocabulary connections
- **Reference**: Story 2.3 requirements in epics.md

**Story 1.x Patterns (Authentication/User Management):**

- Server actions use `executeSafeAction` pattern from `@/modules/core/action-client`
- User authorization checked via `getUser()` from `@/modules/auth/auth.actions`
- Zod validation used for all server action inputs
- **Reference**: `_bmad-output/implementation-artifacts/1-1-user-registration-with-email-password.md`

### References

**Architecture Documentation:**

- Semantic Algorithm Architecture: `_bmad-output/planning-artifacts/architecture.md#Semantic-Algorithm-Architecture`
- Performance Requirements: <500ms algorithm response times
- Caching Strategy: Multi-layer caching with query optimization

**Epic Context:**

- Epic 2: Core Semantic Learning Sessions
- Story 2.4 Requirements: `_bmad-output/planning-artifacts/epics.md#Story-2.4` (lines 826-851)
- FR4: System can generate authentic contextual examples linking new vocabulary to previously learned words

**PRD Context:**

- Semantic Learning Engine: `_bmad-output/planning-artifacts/prd.md#Semantic-Learning-Engine`
- Contextual example generation as core feature
- Authentic and culturally appropriate examples

**Code References:**

- Example Schema: `src/lib/schemas/jsonb.ts#ExampleSentenceSchema`
- Example Display: `src/modules/flashcard/components/CardShell/Sections/MoreExamplesSection.tsx`
- Vocabulary Model: `prisma/schema.prisma#Vocabulary`
- User Review Model: `prisma/schema.prisma#UserReview`
- Study Mapper: `src/modules/study/study.mapper.ts`
- Study Actions: `src/modules/study/study.actions.ts`

**Data Model References:**

- Vocabulary Examples Structure: `docs/models/vocabulary.md#examples`
- Example JSONB Schema: Array of `{ sentence, translation: { vi, en }, audio? }`

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
