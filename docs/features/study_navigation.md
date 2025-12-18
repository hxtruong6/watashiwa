# Study Page Navigation Scenarios

> **File**: `src/app/study/page.tsx`
> **Component**: `src/components/StudyContent.tsx`

This document outlines the various ways a user can navigate to the Study page and how the application handles each scenario.

## Overview

The `/study` route is the central hub for all learning activities. It handles:

1. **Parameter Resolution**: Converting `courseId` or `deckId` into a list of target decks.
2. **Session Resuming**: Automatically redirecting users to their last context if no parameters are provided.
3. **Global Mode**: Falling back to a "study everything" mode if no context is found.

---

## Navigation Scenarios

### 1. Resume Last Session (Default)

**URL**: `/study` (No parameters)

**Behavior**:

1. **Server-Side Check**: The page checks the user's `ReviewLog` to find the most recently studied card.
2. **Redirect**:
   - **If found**: Redirects to `/study?deckId=[last_deck_id]`.
   - **If not found** (New User): Renders the page without parameters (See **Scenario 2**).

**Use Case**: Clicking "Study" in the main navigation or `DueCTA` widget.

### 2. Global Study Mode (New User / Explicit)

**URL**: `/study` (After failing to resume) OR `/study?mode=quick` (Global Quick Review)

**Behavior**:

- **Target**: **All Decks**.
- **Logic**:
  - Fetches reviews from _any_ deck the user explicitly owns or is enrolled in.
  - Enrolls new cards from _any_ public or owned deck.
- **Note**: This is the default fallback for new users who haven't studied anything yet.

### 3. Deck-Specific Study

**URL**: `/study?deckId=[uuid]`

**Behavior**:

- **Target**: **Single Deck**.
- **Logic**: Limits the review queue and new card gathering to strictly the specified `deckId`.

**Entry Points**:

- Deck Details View (`Start Study` button).
- Community Feed (Clicking a card's deck link).
- Trending Tips (Clicking "Try this word").

### 4. Course-Specific Study

**URL**: `/study?courseId=[uuid]`

**Behavior**:

- **Target**: **Multiple Decks** (All decks in the course).
- **Logic**:
  - `useEffect` in `useStudySession` fetches the course details.
  - Extracts all `deckIds` belonging to the course.
  - Limits the review queue/new cards to this list of IDs.

**Entry Points**:

- Course Details Page.

### 5. Quick Review Mode

**URL**: `/study?mode=quick` (Can be combined with other params)

**Behavior**:

- **Limit**: Caps the session at **5 cards**.
- **Logic**:
  - Overrides locally configured review/new limits.
  - After 5 reviews, triggers the "Session Complete" summary immediately.

**Entry Points**:

- Dashboard "Review Forecast" widget (e.g., "Quick Review" button).

---

## URL Parameters Reference

| Parameter  | Type   | Required | Description                                                                     |
| :--------- | :----- | :------- | :------------------------------------------------------------------------------ |
| `deckId`   | UUID   | No       | Target a specific deck. If plain `/study` is hit, server attempts to fill this. |
| `courseId` | UUID   | No       | Target a course. Resolves to proper `targetDeckIds` on client mount.            |
| `mode`     | String | No       | Value: `'quick'`. Limits session to 5 cards for a "snack-sized" session.        |

## Edge Cases

| Case                   | Effect                                                                                                                 |
| :--------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **Invalid `deckId`**   | Returns empty queue -> "Session Complete" / "No cards found".                                                          |
| **Invalid `courseId`** | Shows error toast (`t('errorCourseNotFound')`).                                                                        |
| **Both IDs**           | `courseId` logic takes precedence in `useStudySession` hook if both are present, but routing usually ensures only one. |
