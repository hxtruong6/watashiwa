# Feature Specification: User Content Creation

## 1. Goal

Empower users to create their own study materials (Decks) and populate them with custom Vocabulary and Kanji. The experience should be seamless, encouraging, and produce high-quality study cards that integrate perfectly with the spaced repetition system.

## 2. User Flow & Journey

### 2.1. The "Creator" Journey

1. **Entry Point**:
    * From **Dashboard**: A prominent "Create Deck" card or floating action button.
    * From **Library/Decks**: A "New Deck" button.
2. **Deck Creation**:
    * User clicks "Create Deck".
    * **Minimal Modal/Drawer**: Asks for Title (required) and Description (optional).
    * **Action**: "Create & Add Cards" (Primary) or "Create Empty" (Secondary).
3. **Content Management (The Deck Editor)**:
    * User lands on the **Deck Detail View** (in "Edit Mode").
    * **Empty State**: "This deck is empty. Let's add your first word!" with a clear, inviting CTA.
    * **Adding Content**:
        * User chooses "Add Vocabulary" or "Add Kanji".
4. **The "Smart" Input Flow**:
    * **Vocab Input**: user types a word (e.g., "猫").
    * **Auto-Complete (Magic)**: The system (via lightweight API/AI) suggests:
        * Reading (Neko / ねこ)
        * Meaning (Cat)
        * Example sentences.
    * User confirms or edits the suggestions.
    * **Save**, and the card flips into the list.

### 2.2. The "Learner" Journey (Self-Created Content)

1. After creating cards, user clicks "Start Study".
2. The system generates `StudyCard` entries for these new items.
3. The study session proceeds exactly like official decks, ensuring a consistent experience.

## 3. UI/UX Design: Elegant, Creative, Friendly

To achieve an "Elegant" and "Friendly" vibe:

### 3.1. General Principles

* **Progressive Disclosure**: Don't overwhelm with all fields (Audio, Pitch Accent, Kanji Breakdown) at once. Show the basics, expand for advanced details.
* **Instant Feedback**: As user types a Japanese word, asynchronously fetch and fade in the reading/meaning. It feels like magic.
* **Visual Cards**: Instead of a spreadsheet view, show items as *Cards*.
  * *List View*: Compact, for overview.
  * *Grid View*: Visual cards showing the front/back.

### 3.2. Creative UI Elements

* **The "Creation Stream"**:
  * When adding words, use a "News Feed" style where the new card appears at the top, and the form resets instantly for the next entry. This allows rapid-fire entry.
* **Kanji Breakdown Visualizer**:
  * When a user types a compound (e.g., "学生"), automatically chip the breakdown: [学 (Study)] + [生 (Life)]. This visualizes *why* the word makes sense.

### 3.3. Friendly Touches

* **Success States**: Subtle toast or micro-animation when a card is saved (e.g., a small "leaf" icon growing, fitting the nature theme if applicable, or a checkmark morph).
* **Encouragement**: "Great start! 5 cards added."

## 4. Database Schema & Modifications

### 4.1. Current Assessment

The current `prisma/schema.prisma` is robust:

* `Deck` has `authorId` -> Supports user ownership.
* `isPublic` boolean -> Distinguishes "Community/Official" vs "Private".
* `Vocab/Kanji` link to `Deck`.

### 4.2. Recommended Changes

We need minimal changes, mostly ensuring defaults are friendly for creators.

**Minor Updates:**

* **Deck Model**: Add `coverImage` (string, optional) to let users personalize deck appearance.
* **Vocab Model**: Ensure `wordParts` and `kanjiBreakdown` are easy to populate. No schema change needed, just strict typing in the application layer.

**New Concept: `Draft` Mode?**

* Currently, we might not need a complex draft system. If `isPublic` is false, it's effectively a draft until they share it (if sharing is allowed).

## 5. Impact on Main Study Feature

### 5.1. Integration

* **Current Architecture**: The system uses a "Just-In-Time (JIT) Enrollment" strategy in `src/services/actions.ts` (`getNextReviewCard`).
* **Discovery**: The current logic *already* queries for new Vocab/Kanji where `deck.authorId === user.id`.
* **Conclusion**: **Zero changes are needed to the core study algorithm.**
  * When User A creates a Deck and adds "Cat", "Dog".
  * User A clicks "Study" on the Dashboard.
  * If they have no reviews due, the system automatically finds "Cat" (as a new card from their own deck) and creates the `StudyCard` record on the fly.
  * This confirms **Scenario B (Lazy Sync)** is effectively the native behavior, which is optimal.

### 5.2. Query Logic

* **Dashboard**: Ensure "My Decks" are listed in the deck selection if the user wants to study a specific deck.
* **Deck List**: The `getDecks` action already queries `OR: [{ isPublic: true }, { authorId: user.id }]`, so the new custom decks will automatically appear in the library.

## 6. Implementation Stages

1. **Backend Services**:
    * `createDeck`, `updateDeck`.
    * `createVocab` (with optional AI-assist for auto-filling).
2. **Frontend - Deck Management**:
    * `/dashboard/decks` (My Decks).
    * `/dashboard/decks/new` or Modal.
3. **Frontend - Card Editor**:
    * The "Smart Form" component.
4. **Study Integration**:
    * Ensure the session router picks up these private cards.
