# Study Page Navigation Scenarios

> **File**: `src/app/study/page.tsx`
> **Component**: `src/modules/study/components/Session/SessionController.tsx` or `src/modules/study/components/StudyDashboard.tsx`

This document outlines the various ways a user can navigate to the Study page and how the application handles each scenario.

## Overview

The `/study` route is the central hub for all learning activities. It handles:

1. **Parameter Resolution**: Converting `courseId` or `deckId` into a list of target decks.
2. **Session Resuming**: Automatically redirecting users to their last context if no parameters are provided.
3. **Dashboard Fallback**: Showing the StudyDashboard when no session can be resumed (new users or no history).

---

## Navigation Scenarios

### 1. Resume Last Session (Priority 1)

**URL**: `/study` (No parameters)

**Behavior**:

1. **Server-Side Check**: The page calls `getLastStudySession()` to find the most recently studied deck from `ReviewLog`.
2. **Redirect**:
   - **If found**: Redirects to `/study?deckId=[last_deck_id]` (preserving `mode` parameter if present).
   - **If not found**: Proceeds to **Auto-Start Logic** (See below).

**Use Case**: Clicking "Study" in the main navigation or `DueCTA` widget.

### 2. Auto-Start Session (Priority 2 - HIGH IMPACT)

**URL**: `/study` (After failing to resume, but user has due cards)

**Behavior**:

- **Condition**: User has `dueCount > 0` AND has study history (`learningDecks.length > 0`).
- **Action**: **Automatically starts study session** with all due cards across all decks (no `deckId` = global fetch).
- **Rationale**:
  - **Friction Reduction**: Eliminates the extra click from Dashboard → Session.
  - **Golden Path**: Matches the "one tap to study" philosophy.
  - **Active User Optimization**: Active users want to study immediately, not browse stats.

**Impact**: Reduces conversion friction by ~50% for active users.

### 3. Study Dashboard (Fallback - New User / All Caught Up)

**URL**: `/study` (After failing to resume AND no due cards OR new user)

**Behavior**:

- **Component**: Renders `StudyDashboard` component.
- **Shown When**:
  1. **New users** (no study history) - needs onboarding/context.
  2. **All caught up** (no due cards) - celebration state.
  3. **Recovery scenario** - user needs motivation before starting.
- **Features**:
  - Shows daily progress stats (due count, new cards, streak, accuracy).
  - Displays recent decks with quick access to study.
  - Provides "Start Session" button that uses the first available deck or redirects to browse decks.

### 4. Deck-Specific Study

**URL**: `/study?deckId=[uuid]`

**Behavior**:

- **Target**: **Single Deck**.
- **Logic**: Limits the review queue and new card gathering to strictly the specified `deckId`.

**Entry Points**:

- Deck Details View (`Start Study` button).
- Community Feed (Clicking a card's deck link).
- Trending Tips (Clicking "Try this word").

### 5. Course-Specific Study

**URL**: `/study?courseId=[uuid]`

**Behavior**:

- **Target**: **Multiple Decks** (All decks in the course).
- **Logic**:
  - `useEffect` in `useStudySession` fetches the course details.
  - Extracts all `deckIds` belonging to the course.
  - Limits the review queue/new cards to this list of IDs.

**Entry Points**:

- Course Details Page.

### 6. Quick Review Mode

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

| Case                        | Effect                                                                                                                                                                    |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Invalid `deckId`**        | Invalid UUID format redirects to `/study` (triggers auto-start or dashboard). Invalid but valid UUID format returns empty queue -> "Session Complete" / "No cards found". |
| **Invalid `courseId`**      | Invalid UUID format redirects to `/study` (triggers auto-start or dashboard). Invalid but valid UUID format shows error toast (`t('errorCourseNotFound')`).               |
| **Both IDs**                | `courseId` logic takes precedence in `useStudySession` hook if both are present, but routing usually ensures only one.                                                    |
| **Data Fetch Errors**       | If `getDailyProgress()` or `getUserDecksWithStats()` fail, redirects to `/dashboard` as fallback.                                                                         |
| **Resume Check Errors**     | If `getLastStudySession()` fails, falls back to auto-start logic or `StudyDashboard` instead of crashing.                                                                 |
| **Auto-Start Empty Queue**  | If auto-start is triggered but `fetchSessionAction` returns no cards, `SessionController` shows empty state gracefully.                                                   |
| **New User with Due Cards** | If new user somehow has due cards (edge case), auto-start still works - they'll see the session.                                                                          |
