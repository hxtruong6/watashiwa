Correct Architecture Principles

1. Dependency Rule
   ┌──────────────────────┐
   │ App Layer │
   │ (Routes, Pages) │
   └──────────┬───────────┘
   │
   ↓
   ┌──────────────────────┐
   │ Study Module │ ← HIGH LEVEL (Business Logic)
   │ - Session mgmt │
   │ - Progress tracking │
   │ - Analytics │
   └──────────┬───────────┘
   │ uses
   ↓
   ┌──────────────────────┐
   │ Flashcard Module │ ← LOW LEVEL (Domain Entities)
   │ - Card data │
   │ - Card UI │
   │ - SRS algorithm │
   └──────────────────────┘
   Rule: High-level modules can import from low-level. Never reverse.

2. Single Responsibility
   Flashcard: WHAT a card is & HOW it's reviewed (entity + mechanics)
   Study: HOW cards are organized into sessions (orchestration)
3. Modularity
   Each module should work independently:

Flashcard can exist without Study (reusable library)
Study depends on Flashcard but contains all session logic
🔧 Detailed Migration Plan
Phase 1: Move Session Components to Study
Step 1.1: Move Session Folder

# Create Session directory in study

mkdir -p src/modules/study/components/Session

# Move files

mv src/modules/flashcard/components/Session/SessionSummary.tsx \
 src/modules/study/components/Session/SessionSummary.tsx
mv src/modules/flashcard/components/Session/SessionContainer.tsx \
 src/modules/study/components/Session/SessionContainer.tsx
Step 1.2: Update SessionSummary.tsx Imports
File: src/modules/study/components/Session/SessionSummary.tsx

- import { useSessionStore } from '../../store/useSessionStore';

* import { useSessionStore } from '../../store/useSessionStore';
  (Path stays same after move to study)

Step 1.3: Delete Empty Flashcard Session Folder
rmdir src/modules/flashcard/components/Session
Phase 2: Move Session Store to Study
Step 2.1: Move Store File
mv src/modules/flashcard/store/useSessionStore.ts \
 src/modules/study/store/useSessionStore.ts
Step 2.2: Update Store Imports in Study Module
File: src/modules/study/components/Session/SessionSummary.tsx

Already correct after move ✅

Phase 3: Consolidate Session Actions
Step 3.1: Move fetchSessionAction to study.actions.ts
File:

src/modules/study/study.actions.ts

Add at the top:

// Re-export or create fetchSessionAction
export async function fetchSessionAction(input: { deckId?: string }) {
// Can be an alias to existing getReviewQueue
// OR implement new logic here
return executeSafeAction(
FetchSessionSchema,
input,
async ({ deckId }, { userId }) => {
// Implementation here
}
);
}
Step 3.2: Remove from flashcard.actions.ts
File:

src/modules/flashcard/flashcard.actions.ts

Delete

fetchSessionAction
(if it exists)

Phase 4: Update All Import Statements
File 4.1:

/app/study/session/page.tsx

- import SessionSummary from '@/modules/flashcard/components/Session/SessionSummary';
- import { SessionContainer } from '@/modules/flashcard/components/Session/SessionContainer';
- import { fetchSessionAction } from '@/modules/flashcard/flashcard.actions';
- import { useSessionStore } from '@/modules/flashcard/store/useSessionStore';

* import SessionSummary from '@/modules/study/components/Session/SessionSummary';

- import { SessionContainer } from '@/modules/study/components/Session/SessionContainer';
- import { fetchSessionAction } from '@/modules/study/study.actions';
- import { useSessionStore } from '@/modules/study/store/useSessionStore';
  File 4.2: Check for other imports

# Search for any remaining flashcard/Session imports

grep -r "from '@/modules/flashcard/components/Session" src/

# Search for useSessionStore imports

grep -r "from '@/modules/flashcard/store/useSessionStore" src/
Phase 5: Define Clear Module Boundaries
Flashcard Module (Final State)
Purpose: Pure card entity and mechanics

Should contain:

flashcard/
├── components/
│ ├── CardShell/ ✅ Card UI components
│ │ ├── CardShell.tsx
│ │ └── StandardFace.tsx
│ └── FlashCard.tsx ✅ Card display logic
├── types.ts ✅ Card data structures
│ └── SmartCard, StandardCard interfaces
├── utils/
│ └── srs-algorithm.ts ✅ FSRS calculation (pure logic)
└── flashcard.actions.ts ✅ Card CRUD operations ONLY
Should NOT contain:

❌ Session management
❌ Progress tracking
❌ Statistics
❌ Store (except pure card state if needed)
Study Module (Final State)
Purpose: Session orchestration and analytics

Should contain:

study/
├── actions/
│ └── getReviewQueue.ts ✅ Session data fetching
├── components/
│ ├── Session/ ✅ Session UI (MOVED HERE)
│ │ ├── SessionSummary.tsx
│ │ └── SessionContainer.tsx
│ ├── StudySession.tsx ✅ Main session flow
│ ├── StudySettings.tsx ✅ Session config
│ ├── SessionBriefing.tsx ✅ Pre-session
│ └── RatingBar.tsx ✅ Review controls
├── store/
│ └── useSessionStore.ts ✅ Session state (MOVED HERE)
├── study.actions.ts ✅ All session actions
├── study.data.ts ✅ Session data queries
└── study.service.ts ✅ Session business logic
Can import from flashcard:

✅ import { SmartCard } from '@/modules/flashcard/types';
✅ import { CardShell } from '@/modules/flashcard/components/CardShell';
✅ import { fsrs } from '@/modules/flashcard/utils/srs-algorithm';
