# Story 2.5: Provide Feedback on Algorithm Suggestions

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want to provide feedback on semantic algorithm suggestions,
So that the system can improve future recommendations based on my learning preferences.

## Acceptance Criteria

**Given** I receive a semantic relationship suggestion during study
**When** I provide feedback (helpful, not helpful, incorrect)
**Then** my feedback is recorded
**And** the system uses this feedback to improve future suggestions (FR7)
**And** I receive confirmation that my feedback was received

**Given** I have provided feedback on multiple suggestions
**When** I continue studying
**Then** future suggestions better align with my preferences
**And** the algorithm adapts based on my feedback history
**And** I notice improved relevance of suggestions over time

**Given** I mark a suggestion as incorrect
**When** I submit the feedback
**Then** the system flags the relationship for review
**And** the incorrect suggestion is not shown to me again
**And** other users are not affected until the relationship is validated

## Tasks / Subtasks

- [ ] Task 1: Create database model for algorithm feedback (AC: 1, 2, 3)
  - [ ] Create Prisma migration for `AlgorithmFeedback` model
  - [ ] Model fields:
    - `id` (UUID, Primary Key)
    - `userId` (String, Foreign Key → User)
    - `vocabId` (String, Foreign Key → Vocabulary) - The word being studied
    - `relatedVocabId` (String, Foreign Key → Vocabulary) - The suggested related word
    - `relationshipType` (String) - Type of relationship (e.g., "etymology", "confusion_pair", "contextual")
    - `feedbackType` (Enum: HELPFUL, NOT_HELPFUL, INCORRECT)
    - `feedbackReason` (String, Optional) - Optional user comment explaining feedback
    - `isFlaggedForReview` (Boolean, Default: false) - True if marked as incorrect
    - `reviewedBy` (String, Optional) - Admin/moderator who reviewed flagged feedback
    - `reviewedAt` (DateTime, Optional)
    - `createdAt` (DateTime, Default: now())
    - `updatedAt` (DateTime, Auto-update)
  - [ ] Add indexes: `userId`, `vocabId`, `relatedVocabId`, `isFlaggedForReview`
  - [ ] Add unique constraint: `userId + vocabId + relatedVocabId` (prevent duplicate feedback)
  - [ ] Run migration: `npx prisma migrate dev --name add_algorithm_feedback`

- [ ] Task 2: Create feedback service (AC: 1, 2, 3)
  - [ ] Create `src/modules/study/services/algorithm-feedback.service.ts`
  - [ ] Implement `submitFeedback(input: FeedbackInput)` function:
    - Validate input (vocabId, relatedVocabId, feedbackType)
    - Check for existing feedback (update if exists, create if new)
    - Store feedback in database
    - If feedbackType is INCORRECT, set `isFlaggedForReview = true`
    - Return success response
  - [ ] Implement `getUserFeedbackHistory(userId: string)` function:
    - Query all feedback for user
    - Return aggregated feedback data (helpful count, not helpful count, etc.)
  - [ ] Implement `getFeedbackForRelationship(vocabId: string, relatedVocabId: string, userId: string)`:
    - Check if user has already provided feedback for this relationship
    - Return existing feedback if found

- [ ] Task 3: Create server action for submitting feedback (AC: 1)
  - [ ] Add to `src/modules/study/study.actions.ts`:
    - `submitAlgorithmFeedbackAction(input: { vocabId: string; relatedVocabId: string; feedbackType: 'HELPFUL' | 'NOT_HELPFUL' | 'INCORRECT'; feedbackReason?: string })`
  - [ ] Use `executeSafeAction` pattern with Zod validation
  - [ ] Call feedback service
  - [ ] Return typed response: `{ success: boolean; data?: { id: string }; error?: string }`
  - [ ] Handle errors gracefully (invalid vocabId, unauthorized, etc.)

- [ ] Task 4: Create feedback UI component (AC: 1)
  - [ ] Create `src/modules/study/components/RelatedWords/FeedbackButtons.tsx`
  - [ ] Display feedback buttons for each related word:
    - "Helpful" button (thumbs up icon)
    - "Not Helpful" button (thumbs down icon)
    - "Incorrect" button (flag icon)
  - [ ] Use Ant Design components:
    - `Button` with icons (`LikeOutlined`, `DislikeOutlined`, `FlagOutlined`)
    - `Space` for layout
    - `Tooltip` for button labels
  - [ ] Show active state if user has already provided feedback
  - [ ] Handle loading state during submission
  - [ ] Show success message after submission (use Ant Design `message.success()`)

- [ ] Task 5: Integrate feedback UI into RelatedWords component (AC: 1)
  - [ ] Update `src/modules/study/components/RelatedWords/RelatedWords.tsx`
  - [ ] Add FeedbackButtons component to each related word card
  - [ ] Pass required props: `vocabId`, `relatedVocabId`, `userId`
  - [ ] Handle feedback submission via server action
  - [ ] Update UI state after successful feedback submission
  - [ ] Show confirmation message to user

- [ ] Task 6: Implement feedback-based algorithm adaptation (AC: 2)
  - [ ] Update `src/modules/study/services/semantic-relationship.service.ts`
  - [ ] Modify `getRelatedWords()` function to:
    - Query user's feedback history
    - Filter out words marked as "NOT_HELPFUL" or "INCORRECT"
    - Boost words marked as "HELPFUL" in ranking
    - Apply feedback weights to relationship strength scores
  - [ ] Create `calculateFeedbackAdjustedScore()` helper:
    - Base score from relationship detection
    - Apply positive multiplier for HELPFUL feedback
    - Apply negative multiplier (or filter) for NOT_HELPFUL/INCORRECT
  - [ ] Ensure algorithm adapts in real-time (no need to wait for next session)

- [ ] Task 7: Implement flagging system for incorrect suggestions (AC: 3)
  - [ ] Create admin/moderator review interface (optional, can be separate story)
  - [ ] When feedbackType is INCORRECT:
    - Set `isFlaggedForReview = true` in database
    - Store feedback in flagged queue (queryable by `isFlaggedForReview = true`)
    - Do NOT hide from other users yet (wait for review)
  - [ ] Create query function: `getFlaggedFeedback()` for admin review
  - [ ] When admin reviews and confirms incorrect:
    - Update relationship data (e.g., remove from ConfusionPair if applicable)
    - Mark feedback as reviewed
    - Optionally notify user who flagged it

- [ ] Task 8: Prevent showing incorrect suggestions to user (AC: 3)
  - [ ] Update `getRelatedWords()` in semantic relationship service
  - [ ] Filter out relationships where:
    - User has marked as INCORRECT (regardless of review status)
    - User has marked as NOT_HELPFUL multiple times (threshold: 2+)
  - [ ] Ensure filtering happens before ranking/ordering
  - [ ] Log filtered relationships for analytics (but don't show to user)

- [ ] Task 9: Add feedback analytics and tracking (AC: 2)
  - [ ] Track feedback events in analytics:
    - `ALGORITHM_FEEDBACK_SUBMITTED` event with feedbackType
    - Track feedback impact on future suggestions
  - [ ] Create analytics query to measure:
    - Feedback submission rate
    - Feedback type distribution
    - Impact of feedback on suggestion relevance (future improvement)
  - [ ] Add to `src/lib/analytics.ts` if needed

- [ ] Task 10: Testing
  - [ ] Unit tests for feedback service:
    - Test feedback submission
    - Test feedback retrieval
    - Test filtering logic
  - [ ] Unit tests for algorithm adaptation:
    - Test feedback-based scoring
    - Test filtering of incorrect suggestions
  - [ ] Component tests for FeedbackButtons:
    - Test button clicks
    - Test feedback submission
    - Test UI state updates
  - [ ] Integration tests:
    - Test full flow: see suggestion → provide feedback → see improved suggestions
    - Test incorrect flagging flow
  - [ ] E2E tests (Playwright):
    - User provides helpful feedback → sees confirmation
    - User marks suggestion as incorrect → doesn't see it again
    - User provides multiple feedback → sees improved suggestions

## Dev Notes

### Architecture Context

**Feedback System Design:**

Based on acceptance criteria and FR7 (algorithm adaptation), the feedback system needs to:

1. **Store User Feedback:**
   - Track feedback per user, per relationship
   - Support three feedback types: HELPFUL, NOT_HELPFUL, INCORRECT
   - Allow optional feedback reason/comment

2. **Algorithm Adaptation:**
   - Use feedback to filter/rank future suggestions
   - Real-time adaptation (no batch processing needed initially)
   - Weight relationships based on user feedback history

3. **Incorrect Suggestion Handling:**
   - Flag for admin review when marked as INCORRECT
   - Hide from user immediately (don't wait for review)
   - Don't affect other users until reviewed and confirmed

**Database Schema:**

New `AlgorithmFeedback` model needed. Reference existing models:

- Similar to `CardComment` for user-generated content
- Similar to `CardReport` for flagging/review workflow
- Uses JSONB for flexible data if needed (but prefer typed fields)

**Integration Points:**

1. **RelatedWords Component** (from Story 2.3):
   - Add feedback buttons to each related word
   - Call `submitAlgorithmFeedbackAction` on button click
   - Update UI to show feedback state

2. **Semantic Relationship Service** (from Story 2.3):
   - Modify `getRelatedWords()` to consider user feedback
   - Filter out incorrect/not helpful suggestions
   - Boost helpful suggestions in ranking

3. **Study Actions** (`src/modules/study/study.actions.ts`):
   - Add `submitAlgorithmFeedbackAction` server action
   - Follow existing `executeSafeAction` pattern

### Project Structure Notes

**Vertical Slice Architecture Compliance:**

- ✅ Model: `prisma/schema.prisma` (MODIFY - add AlgorithmFeedback model)
- ✅ Service: `src/modules/study/services/algorithm-feedback.service.ts` (NEW)
- ✅ Actions: `src/modules/study/study.actions.ts` (MODIFY - add feedback action)
- ✅ Components: `src/modules/study/components/RelatedWords/FeedbackButtons.tsx` (NEW)
- ✅ Types: Add to `src/modules/study/types.ts` or create `src/modules/study/types/feedback.ts`

**File Organization:**

```
src/modules/study/
├── services/
│   ├── algorithm-feedback.service.ts (NEW)
│   └── semantic-relationship.service.ts (MODIFY - add feedback filtering)
├── actions/
│   └── study.actions.ts (MODIFY - add submitAlgorithmFeedbackAction)
├── components/
│   └── RelatedWords/
│       ├── RelatedWords.tsx (MODIFY - add feedback buttons)
│       └── FeedbackButtons.tsx (NEW)
├── types/
│   └── feedback.ts (NEW - or add to existing types.ts)
└── hooks/
    └── useAlgorithmFeedback.ts (NEW - optional, for feedback state management)

prisma/
└── schema.prisma (MODIFY - add AlgorithmFeedback model)
```

### Technical Requirements

**Stack & Libraries:**

- **Framework**: Next.js 16+ (App Router) - Server Actions for data submission
- **UI Library**: Ant Design v6 (use Tokens, NO Tailwind)
- **State Management**: Zustand (optional, for feedback state) or React Query
- **Type Safety**: TypeScript 5.x (Strict Mode)
- **Database**: PostgreSQL + Prisma ORM
- **Validation**: Zod schemas for input validation

**Code Patterns:**

1. **Server Action Pattern:**

```typescript
// src/modules/study/study.actions.ts
export async function submitAlgorithmFeedbackAction(input: {
	vocabId: string;
	relatedVocabId: string;
	feedbackType: 'HELPFUL' | 'NOT_HELPFUL' | 'INCORRECT';
	feedbackReason?: string;
}) {
	const Schema = z.object({
		vocabId: z.uuid(),
		relatedVocabId: z.uuid(),
		feedbackType: z.enum(['HELPFUL', 'NOT_HELPFUL', 'INCORRECT']),
		feedbackReason: z.string().max(500).optional(),
	});

	return executeSafeAction(Schema, input, async (data, { userId }) => {
		if (!userId) throw new Error('Unauthorized');

		const feedback = await AlgorithmFeedbackService.submitFeedback({
			...data,
			userId,
		});

		return { success: true, data: { id: feedback.id } };
	});
}
```

1. **Service Pattern:**

```typescript
// src/modules/study/services/algorithm-feedback.service.ts
export const AlgorithmFeedbackService = {
	async submitFeedback(input: FeedbackInput): Promise<AlgorithmFeedback> {
		// Upsert feedback (update if exists, create if new)
		const feedback = await prisma.algorithmFeedback.upsert({
			where: {
				userId_vocabId_relatedVocabId: {
					userId: input.userId,
					vocabId: input.vocabId,
					relatedVocabId: input.relatedVocabId,
				},
			},
			update: {
				feedbackType: input.feedbackType,
				feedbackReason: input.feedbackReason,
				isFlaggedForReview: input.feedbackType === 'INCORRECT',
			},
			create: {
				userId: input.userId,
				vocabId: input.vocabId,
				relatedVocabId: input.relatedVocabId,
				relationshipType: input.relationshipType,
				feedbackType: input.feedbackType,
				feedbackReason: input.feedbackReason,
				isFlaggedForReview: input.feedbackType === 'INCORRECT',
			},
		});

		return feedback;
	},

	async getUserFeedbackHistory(userId: string) {
		// Query and aggregate feedback
	},
};
```

1. **Component Pattern:**

```typescript
// src/modules/study/components/RelatedWords/FeedbackButtons.tsx
'use client';

import { Button, Space, Tooltip, message } from 'antd';
import { LikeOutlined, DislikeOutlined, FlagOutlined } from '@ant-design/icons';
import { submitAlgorithmFeedbackAction } from '@/modules/study/study.actions';

export function FeedbackButtons({
  vocabId,
  relatedVocabId,
  currentFeedback,
}: {
  vocabId: string;
  relatedVocabId: string;
  currentFeedback?: 'HELPFUL' | 'NOT_HELPFUL' | 'INCORRECT';
}) {
  const handleFeedback = async (feedbackType: 'HELPFUL' | 'NOT_HELPFUL' | 'INCORRECT') => {
    const result = await submitAlgorithmFeedbackAction({
      vocabId,
      relatedVocabId,
      feedbackType,
    });

    if (result.success) {
      message.success('Feedback submitted!');
      // Update UI state
    }
  };

  return (
    <Space>
      <Tooltip title="Helpful">
        <Button
          icon={<LikeOutlined />}
          type={currentFeedback === 'HELPFUL' ? 'primary' : 'default'}
          onClick={() => handleFeedback('HELPFUL')}
        />
      </Tooltip>
      <Tooltip title="Not Helpful">
        <Button
          icon={<DislikeOutlined />}
          type={currentFeedback === 'NOT_HELPFUL' ? 'primary' : 'default'}
          onClick={() => handleFeedback('NOT_HELPFUL')}
        />
      </Tooltip>
      <Tooltip title="Incorrect">
        <Button
          icon={<FlagOutlined />}
          type={currentFeedback === 'INCORRECT' ? 'primary' : 'default'}
          danger={currentFeedback === 'INCORRECT'}
          onClick={() => handleFeedback('INCORRECT')}
        />
      </Tooltip>
    </Space>
  );
}
```

**Ant Design Components to Use:**

- `Button` - For feedback buttons with icons
- `Space` - For layout spacing
- `Tooltip` - For button labels
- `message` - For success/error notifications
- `Badge` - Optional, to show feedback count

**Performance Considerations:**

- Feedback submission should be non-blocking (async, optimistic UI)
- Cache user feedback history to avoid repeated queries
- Use React Query for client-side caching of feedback state
- Batch feedback queries if loading multiple related words

### Database Migration

**Prisma Schema Addition:**

```prisma
model AlgorithmFeedback {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  vocabId         String   @map("vocab_id")
  vocab           Vocabulary @relation("FeedbackVocab", fields: [vocabId], references: [id], onDelete: Cascade)

  relatedVocabId  String   @map("related_vocab_id")
  relatedVocab    Vocabulary @relation("FeedbackRelatedVocab", fields: [relatedVocabId], references: [id], onDelete: Cascade)

  relationshipType String  @map("relationship_type") // "etymology", "confusion_pair", "contextual"
  feedbackType     FeedbackType @map("feedback_type")
  feedbackReason   String? @map("feedback_reason") @db.Text

  isFlaggedForReview Boolean @default(false) @map("is_flagged_for_review")
  reviewedBy         String?  @map("reviewed_by")
  reviewedAt         DateTime? @map("reviewed_at")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([userId, vocabId, relatedVocabId])
  @@index([userId])
  @@index([vocabId])
  @@index([relatedVocabId])
  @@index([isFlaggedForReview])
}

enum FeedbackType {
  HELPFUL
  NOT_HELPFUL
  INCORRECT
}
```

**Update Vocabulary Model:**

Add relations to Vocabulary model:

```prisma
model Vocabulary {
  // ... existing fields ...

  feedbackAsVocab      AlgorithmFeedback[] @relation("FeedbackVocab")
  feedbackAsRelated   AlgorithmFeedback[] @relation("FeedbackRelatedVocab")
}
```

**Update User Model:**

Add relation to User model:

```prisma
model User {
  // ... existing fields ...

  algorithmFeedback    AlgorithmFeedback[]
}
```

### Testing Requirements

**Unit Tests (Vitest):**

- Test feedback service submission logic
- Test feedback retrieval and aggregation
- Test algorithm adaptation logic (filtering, boosting)
- Test edge cases (duplicate feedback, invalid IDs)

**Component Tests:**

- Test FeedbackButtons component rendering
- Test button click interactions
- Test feedback submission flow
- Test UI state updates after feedback

**Integration Tests:**

- Test full flow: see suggestion → provide feedback → see improved suggestions
- Test incorrect flagging and filtering
- Test feedback persistence across sessions

**E2E Tests (Playwright):**

- User provides helpful feedback → sees confirmation
- User marks suggestion as incorrect → doesn't see it in future
- User provides multiple feedback → sees improved suggestions over time

### Previous Story Intelligence

**Story 2.3 Context (View Semantically Related Words):**

- Story 2.3 creates the RelatedWords component and semantic relationship service
- This story (2.5) extends 2.3 by adding feedback functionality
- Must integrate seamlessly with RelatedWords component
- Feedback should be collected at the same time related words are displayed

**Related Existing Code:**

- `CardComment` model shows pattern for user-generated content with voting
- `CardReport` model shows pattern for flagging/review workflow
- `submitReview` action (`src/modules/study/study.actions.ts`) shows pattern for user input submission
- `CommentVote` model shows pattern for user feedback on content

**Dependencies:**

- Requires Story 2.3 to be implemented first (or implement both together)
- Can be implemented independently if RelatedWords component structure is known

### References

- **Epic 2 Story 2.5**: [_bmad-output/planning-artifacts/epics.md#852-877]
- **Story 2.3**: [_bmad-output/implementation-artifacts/2-3-view-semantically-related-words-during-study.md]
- **CardComment Model**: [prisma/schema.prisma - CardComment model]
- **CardReport Model**: [prisma/schema.prisma - CardReport model]
- **Study Actions**: [src/modules/study/study.actions.ts]
- **User Preferences**: [src/types/user.ts#10-32]
- **Architecture - Semantic Sequencing**: [_bmad-output/planning-artifacts/architecture.md#1056-1173]

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
