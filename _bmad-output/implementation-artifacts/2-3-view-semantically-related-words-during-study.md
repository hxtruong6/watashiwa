# Story 2.3: View Semantically Related Words During Study

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want to see semantically related words suggested during my study session,
So that I can understand vocabulary connections and build knowledge networks.

## Acceptance Criteria

**Given** I am studying a word (e.g., "university/大学")
**When** the system detects semantic relationships
**Then** I see related words suggested (e.g., "student/学生" and "teacher/先生") (FR3)
**And** the relationship type is indicated (e.g., "related concept", "contextual usage")
**And** suggestions appear within <500ms of word presentation (NFR1)

**Given** I am viewing a word with semantic suggestions
**When** I click on a suggested related word
**Then** I can see details about that word
**And** I can add it to my current study session if desired
**And** the relationship between words is visually highlighted

**Given** the system cannot find semantic relationships for a word
**When** I study that word
**Then** I see the word without related suggestions
**And** the study session continues normally
**And** no error is displayed

## Tasks / Subtasks

- [ ] Task 1: Create semantic relationship service (AC: 1, 3)
  - [ ] Create `src/modules/study/services/semantic-relationship.service.ts`
  - [ ] Implement `getRelatedWords(vocabId: string, userId: string)` function
  - [ ] Query relationships using:
    - Shared kanji roots from etymology data
    - Confusion pairs (ConfusionPair model)
    - Same deck/unit contextual grouping
    - Hán Việt connections (if available)
  - [ ] Calculate relationship strength scores
  - [ ] Return top 3-5 related words with relationship types
  - [ ] Ensure query completes in <200ms (NFR1)
  - [ ] Handle cases where no relationships found (return empty array)

- [ ] Task 2: Create server action for fetching related words (AC: 1)
  - [ ] Create `src/modules/study/actions/getRelatedWords.ts` (or add to existing study.actions.ts)
  - [ ] Implement `getRelatedWordsAction(vocabId: string)` server action
  - [ ] Call semantic relationship service
  - [ ] Return typed response: `{ success: boolean; data?: RelatedWord[]; error?: string }`
  - [ ] Include error handling for missing vocab or service failures
  - [ ] Add Zod schema validation for input

- [ ] Task 3: Create RelatedWords component (AC: 1, 2)
  - [ ] Create `src/modules/study/components/RelatedWords/RelatedWords.tsx`
  - [ ] Display related words in a visually appealing card/list format
  - [ ] Show relationship type badges (e.g., "Related Concept", "Contextual Usage", "Etymology")
  - [ ] Use Ant Design components (Card, Tag, Space, Typography)
  - [ ] Implement loading state (skeleton/spinner)
  - [ ] Handle empty state (no related words found - show nothing, not an error)
  - [ ] Ensure component is responsive (mobile-first design)

- [ ] Task 4: Integrate RelatedWords into SessionController (AC: 1, 2)
  - [ ] Update `src/modules/study/components/Session/SessionController.tsx`
  - [ ] Add state for related words: `const [relatedWords, setRelatedWords] = useState<RelatedWord[]>([])`
  - [ ] Fetch related words when card is displayed (useEffect on currentCard change)
  - [ ] Call `getRelatedWordsAction` with current card's vocabId
  - [ ] Display RelatedWords component below card or in a sidebar
  - [ ] Clear related words when card changes
  - [ ] Ensure fetching doesn't block card display (async, show loading state)

- [ ] Task 5: Implement click interaction for related words (AC: 2)
  - [ ] Add onClick handler to RelatedWords component
  - [ ] When related word is clicked:
    - Show word details in a modal or drawer (use Ant Design Modal/Drawer)
    - Display word surface, reading, meanings, examples
    - Show "Add to Session" button
  - [ ] Implement "Add to Session" functionality:
    - Add word to current session queue
    - Update session store (useSessionStore)
    - Show success message
    - Optionally navigate to that word immediately

- [ ] Task 6: Visual relationship highlighting (AC: 2)
  - [ ] Add visual connection indicators between current word and related words
  - [ ] Use Ant Design's Tag component with relationship type colors
  - [ ] Consider using icons or lines to show connections (if UX design specifies)
  - [ ] Ensure visual design aligns with "Zen" UI principles (minimal, clean)

- [ ] Task 7: Performance optimization (AC: 1)
  - [ ] Implement caching for relationship queries:
    - Cache per vocabId (TTL: 1 hour)
    - Use React Query or similar for client-side caching
    - Invalidate cache when user learns new words
  - [ ] Optimize database queries:
    - Use Prisma includes efficiently
    - Add database indexes if needed (check Prisma schema)
    - Consider batch loading relationships for multiple words
  - [ ] Ensure total time <500ms from card display to related words shown

- [ ] Task 8: Error handling and edge cases (AC: 3)
  - [ ] Handle case where vocabId is invalid (return empty array, no error shown)
  - [ ] Handle case where semantic service fails (graceful degradation, no error shown)
  - [ ] Handle network errors (show nothing, don't break session)
  - [ ] Ensure session continues normally even if related words fail to load
  - [ ] Add error logging for debugging (but don't show to user)

- [ ] Task 9: Testing
  - [ ] Unit tests for semantic relationship service
  - [ ] Unit tests for getRelatedWordsAction
  - [ ] Component tests for RelatedWords component
  - [ ] Integration tests for full flow (card display → fetch → show related words)
  - [ ] E2E test: Study word → see related words → click related word → see details
  - [ ] Performance test: Ensure <500ms response time

## Dev Notes

### Architecture Context

**Semantic Relationship Detection Strategy:**

Based on architecture document ([Source: _bmad-output/planning-artifacts/architecture.md#1056-1173]), the semantic relationship system uses:

1. **Etymology-Based Relationships:**
   - Shared kanji roots from `etymology` JSONB field
   - Extract kanji components using existing etymology graph logic
   - Reference: `src/modules/dashboard/components/etymology-graph/etymology-graph.actions.ts`

2. **Confusion Pairs:**
   - Use existing `ConfusionPair` model
   - Reference: `src/modules/vocabulary/vocabulary.actions.ts#getConfusionsForVocab`
   - Already has relationship types: HOMONYM, LOOKALIKE

3. **Contextual Grouping:**
   - Words from same deck/unit
   - Tags matching (e.g., same JLPT level, same topic)

4. **Hán Việt Connections:**
   - Words with shared Hán Việt roots
   - Useful for Vietnamese learners

**Performance Requirements:**

- Semantic query: <200ms (from architecture)
- Total display time: <500ms (NFR1 from acceptance criteria)
- Caching: TTL 1 hour for relationships, invalidate on new word learned

**Integration Points:**

1. **SessionController** (`src/modules/study/components/Session/SessionController.tsx`):
   - Currently displays cards using `CardShell` component
   - Uses `useSessionStore` for session state
   - Card data structure: `SmartCard` type (includes vocabId)

2. **Study Actions** (`src/modules/study/study.actions.ts`):
   - Already has `getReviewQueue` and `getNextReviewCard`
   - Add new action: `getRelatedWordsAction`

3. **Vocabulary Model** (`prisma/schema.prisma`):
   - Vocabulary has `etymology` (JSONB), `tags` (String[]), `hanViet` (String?)
   - ConfusionPair model exists with `vocabId1`, `vocabId2`, `type`

### Project Structure Notes

**Vertical Slice Architecture Compliance:**

- ✅ Service: `src/modules/study/services/semantic-relationship.service.ts` (domain logic)
- ✅ Actions: `src/modules/study/study.actions.ts` (server actions)
- ✅ Components: `src/modules/study/components/RelatedWords/` (feature-specific UI)
- ✅ Types: Add to `src/modules/study/types.ts` or create `src/modules/study/types/related-words.ts`

**File Organization:**

```
src/modules/study/
├── services/
│   └── semantic-relationship.service.ts (NEW)
├── actions/
│   └── study.actions.ts (MODIFY - add getRelatedWordsAction)
├── components/
│   ├── RelatedWords/ (NEW)
│   │   ├── RelatedWords.tsx
│   │   └── RelatedWordCard.tsx (optional sub-component)
│   └── Session/
│       └── SessionController.tsx (MODIFY - integrate RelatedWords)
├── types/
│   └── related-words.ts (NEW - or add to existing types.ts)
└── hooks/
    └── useRelatedWords.ts (NEW - optional, for data fetching logic)
```

### Technical Requirements

**Stack & Libraries:**

- **Framework**: Next.js 16+ (App Router) - Server Actions for data fetching
- **UI Library**: Ant Design v6 (use Tokens, NO Tailwind)
- **State Management**: Zustand (useSessionStore already exists)
- **Type Safety**: TypeScript 5.x (Strict Mode)
- **Database**: PostgreSQL + Prisma ORM
- **Caching**: React Query (TanStack Query) recommended for client-side caching

**Code Patterns:**

1. **Server Action Pattern:**

```typescript
// src/modules/study/study.actions.ts
export async function getRelatedWordsAction(input: { vocabId: string }) {
  const Schema = z.object({ vocabId: z.uuid() });
  
  return executeSafeAction(Schema, input, async ({ vocabId }, { userId }) => {
    if (!userId) throw new Error('Unauthorized');
    
    const relatedWords = await SemanticRelationshipService.getRelatedWords(
      vocabId,
      userId
    );
    
    return { success: true, data: relatedWords };
  });
}
```

1. **Service Pattern:**

```typescript
// src/modules/study/services/semantic-relationship.service.ts
export const SemanticRelationshipService = {
  async getRelatedWords(vocabId: string, userId: string): Promise<RelatedWord[]> {
    // 1. Get vocabulary with etymology, tags, etc.
    // 2. Query relationships (etymology, confusion pairs, etc.)
    // 3. Calculate relationship strength
    // 4. Return top 3-5 related words
  }
};
```

1. **Component Pattern:**

```typescript
// src/modules/study/components/RelatedWords/RelatedWords.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { getRelatedWordsAction } from '@/modules/study/study.actions';

export function RelatedWords({ vocabId }: { vocabId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['relatedWords', vocabId],
    queryFn: () => getRelatedWordsAction({ vocabId }),
    staleTime: 3600000, // 1 hour
  });
  
  // Render related words...
}
```

**Ant Design Components to Use:**

- `Card` - For related word display
- `Tag` - For relationship type badges
- `Space` - For layout spacing
- `Typography` - For text display
- `Spin` or `Skeleton` - For loading states
- `Modal` or `Drawer` - For word details on click
- `Button` - For "Add to Session" action

**Performance Considerations:**

- Use React Query for automatic caching and deduplication
- Debounce or throttle if needed (unlikely for this use case)
- Lazy load RelatedWords component if it's heavy
- Consider virtual scrolling if many related words (unlikely, max 5)

### Testing Requirements

**Unit Tests (Vitest):**

- Test semantic relationship service logic
- Test relationship strength calculation
- Test edge cases (no relationships, invalid vocabId)

**Component Tests:**

- Test RelatedWords component rendering
- Test click interactions
- Test loading and error states

**Integration Tests:**

- Test full flow: card display → fetch related words → display
- Test "Add to Session" functionality
- Test error handling (service failure, network error)

**E2E Tests (Playwright):**

- User studies word → sees related words
- User clicks related word → sees details
- User adds related word to session → word appears in queue

### Previous Story Intelligence

**Story 2.1 & 2.2 Context:**

- Stories 2.1 and 2.2 are not yet implemented (both in backlog)
- This story (2.3) can be implemented independently
- However, if semantic sequencing (2.1) is implemented first, we can leverage that service
- For now, implement standalone semantic relationship detection

**Related Existing Code:**

- `InterventionService` (`src/modules/study/intervention.service.ts`) already queries confusion pairs - can reference this pattern
- `getConfusionsForVocab` (`src/modules/vocabulary/vocabulary.actions.ts`) shows how to query confusion pairs
- Etymology graph logic (`src/modules/dashboard/components/etymology-graph/etymology-graph.actions.ts`) shows how to extract kanji roots

### References

- **Epic 2 Story 2.3**: [_bmad-output/planning-artifacts/epics.md#800-825]
- **Architecture - Semantic Sequencing**: [_bmad-output/planning-artifacts/architecture.md#1056-1173]
- **Vocabulary Model**: [prisma/schema.prisma#190-238]
- **ConfusionPair Model**: [prisma/schema.prisma - ConfusionPair model]
- **SessionController**: [src/modules/study/components/Session/SessionController.tsx]
- **Study Actions**: [src/modules/study/study.actions.ts]
- **Intervention Service**: [src/modules/study/intervention.service.ts#5-162]
- **Get Confusions Action**: [src/modules/vocabulary/vocabulary.actions.ts#410-455]
- **Etymology Graph**: [src/modules/dashboard/components/etymology-graph/etymology-graph.actions.ts]

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
