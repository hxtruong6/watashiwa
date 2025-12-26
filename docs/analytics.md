# Analytics Implementation Documentation

## Overview

This document describes the analytics tracking implementation for WatashiWa MVP. We use **PostHog** for event tracking, with client-side tracking via `src/lib/analytics.ts` and server-side logging via `src/modules/analytics/analytics.actions.ts`.

## Architecture

### Client-Side Tracking

- **Location**: `src/lib/analytics.ts`
- **Method**: PostHog client-side SDK
- **Events**: User interactions, session events, feature discovery

### Server-Side Logging

- **Location**: `src/modules/analytics/analytics.actions.ts`
- **Method**: Server actions (can be extended to PostHog API)
- **Events**: Server-side events, data validation

### Key Principles

1. **Fail Silently**: Analytics errors don't break the app
2. **Privacy First**: No PII, uses user IDs only
3. **Performance**: Async, non-blocking tracking
4. **Development Mode**: Logs to console in dev, tracks in production

## Implemented Events

### Tier 1: Acquisition & Activation

#### ✅ `user_signed_up`

**Status**: Implemented  
**Location**: `src/app/login/page.tsx`  
**When**: User completes email signup  
**Properties**:

- `method`: 'email'
- `source`: 'landing_page'
- `timestamp`: Date

**Note**: Missing OAuth/email confirmation signup tracking (see TODO list)

#### ✅ `user_first_study_session_started`

**Status**: Implemented  
**Location**: `src/modules/study/components/Session/SessionController.tsx`  
**When**: User starts their very first study session  
**Properties**:

- `entry_method`: 'dashboard' | 'deck_page' | 'direct_link'
- `deck_id`: string | null
- `queue_size`: number
- `due_count`: number

**Note**: Missing `days_since_signup` property (see TODO list)

#### ✅ `user_first_study_session_completed`

**Status**: Implemented  
**Location**: `src/modules/study/components/Session/SessionController.tsx`  
**When**: User completes their first study session  
**Properties**:

- `cards_reviewed`: number
- `session_duration_ms`: number
- `completion_rate`: number

### Tier 2: Core Engagement

#### ✅ `study_session_started`

**Status**: Implemented  
**Location**: `src/modules/study/components/Session/SessionController.tsx`  
**When**: Any study session starts  
**Properties**:

- `entry_type`: 'auto_start' | 'explicit_deck' | 'explicit_course'
- `deck_id`: string | null
- `course_id`: string | null
- `mode`: 'quick' | 'normal' | null
- `queue_size`: number
- `due_count`: number

**Note**: Missing `session_number` and `is_resumed` properties (see TODO list)

#### ✅ `study_session_completed`

**Status**: Implemented  
**Location**: `src/modules/study/components/Session/SessionController.tsx`  
**When**: User finishes a study session  
**Properties**:

- `cards_reviewed`: number
- `cards_new`: number
- `cards_review`: number
- `session_duration_ms`: number
- `average_rating`: number (1-4)
- `entry_type`: string
- `abandoned`: boolean

#### ✅ `card_reviewed`

**Status**: Implemented  
**Location**: `src/modules/study/store/useSessionStore.ts`  
**When**: User rates a card (1-4)  
**Properties**:

- `rating`: 1 | 2 | 3 | 4
- `card_type`: 'new' | 'review'
- `srs_stage_before`: number
- `srs_stage_after`: number
- `deck_id`: string | null

### Tier 3: Feature Discovery & Usage

#### ✅ `deck_created`

**Status**: Implemented  
**Location**: `src/modules/deck/components/DeckFormModal.tsx`  
**When**: User creates a new deck  
**Properties**:

- `method`: 'manual'
- `is_first_deck`: boolean (TODO: implement check)

#### ✅ `feature_discovered`

**Status**: Implemented  
**Location**: `src/hooks/useFeatureDiscovery.ts`  
**When**: User first uses a key feature  
**Properties**:

- `feature_name`: 'exercises' | 'community' | 'courses'
- `days_since_signup`: number
- `discovery_method`: 'navigation' | 'tutorial' | 'suggestion'

**Tracked Features**:

- Exercises (`src/app/exercises/page.tsx`)
- Community (`src/app/community/page.tsx`)
- Courses (`src/app/dashboard/courses/CourseList.tsx`)

### Tier 4: Retention & Health

#### ✅ `user_returned`

**Status**: Implemented  
**Location**: `src/components/Analytics/UserReturnTracker.tsx`  
**When**: User visits after 24+ hours since last visit  
**Properties**:

- `days_since_last_visit`: number
- `total_visits`: number
- `streak_days`: number (TODO: get from user data)
- `last_study_date`: Date | null (TODO: get from user data)

## TODO: Missing Scenarios & Enhancements

### Critical Priority

- [ ] **OAuth/Email Confirmation Signup Tracking**
  - **Issue**: `user_signed_up` not tracked when users sign up via OAuth or email confirmation
  - **Location**: `src/app/auth/callback/route.ts`
  - **Fix**: Track signup when `syncUser()` returns `isNewUser: true` in callback route
  - **Impact**: Missing signup data for OAuth users

- [ ] **Session Abandonment Tracking**
  - **Issue**: Users can exit session via close button, but we don't track abandonment
  - **Location**: `src/modules/study/components/Session/SessionContainer.tsx`
  - **Fix**: Track `study_session_abandoned` when user clicks exit before completion
  - **Impact**: Can't measure session completion rate accurately

- [ ] **Days Since Signup (First Session)**
  - **Issue**: `user_first_study_session_started` missing `days_since_signup` property
  - **Location**: `src/app/study/page.tsx`, `SessionController.tsx`
  - **Fix**: Calculate days between user creation and first session start
  - **Impact**: Can't measure time-to-activation

- [ ] **Session Number Tracking**
  - **Issue**: `study_session_started` missing `session_number` property (1st, 2nd, 3rd, etc.)
  - **Location**: `src/modules/study/components/Session/SessionController.tsx`
  - **Fix**: Track session count per user (localStorage or DB query)
  - **Impact**: Can't analyze user progression over sessions

- [ ] **Resume vs New Session**
  - **Issue**: Don't differentiate between "new session" and "resumed session"
  - **Location**: `src/app/study/page.tsx`
  - **Fix**: Add `is_resumed: boolean` property to `study_session_started` event
  - **Impact**: Can't measure resume feature usage

- [ ] **User Identification on Login**
  - **Issue**: We identify users on signup, but not on login
  - **Location**: `src/app/login/page.tsx`
  - **Fix**: Call `identifyUser()` after successful login
  - **Impact**: PostHog may not properly identify returning users

### Medium Priority

- [ ] **Browser Close/Page Unload (Session Abandonment)**
  - **Issue**: If user closes browser/tab during session, we don't track abandonment
  - **Location**: `src/modules/study/components/Session/SessionController.tsx`
  - **Fix**: Add `beforeunload` event listener to track abandonment
  - **Impact**: Missing abandonment data for browser closes

- [ ] **Source Detection for Signup**
  - **Issue**: Currently hardcoded as `'landing_page'` but should detect actual source
  - **Location**: `src/app/login/page.tsx`
  - **Fix**: Detect source from URL params (UTM) or referrer
  - **Impact**: Can't measure marketing channel effectiveness

- [ ] **First Deck Check**
  - **Issue**: `deck_created` has `is_first_deck` but always false
  - **Location**: `src/modules/deck/components/DeckFormModal.tsx`
  - **Fix**: Check if user has any existing decks before tracking
  - **Impact**: Can't identify power users vs casual users

### Low Priority / Future Enhancements

- [ ] **Session Interruption Tracking**
  - Track when sessions are interrupted (network errors, app crashes, etc.)

- [ ] **Card Review Timing**
  - Track time spent on each card (time to reveal, time to rate)

- [ ] **Feature Usage Frequency**
  - Track how often features are used, not just first discovery

- [ ] **Deck Import Tracking**
  - Track `deck_imported` event when import feature is implemented (Phase 3)

## Key Metrics Dashboard

### North Star Metric

**Weekly Active Learners (WAL)**: Users who complete at least one study session per week.

### Funnel Metrics

1. **Signup → Activation**: `user_signed_up` → `user_first_study_session_started`
   - Target: >60% activation rate
2. **Activation → Retention**: `user_first_study_session_completed` → `user_returned` (within 7 days)
   - Target: >40% Day-7 retention

### Health Metrics

- **Average Session Length**: From `study_session_completed`
- **Cards per Session**: From `study_session_completed`
- **Session Completion Rate**: `study_session_completed` / `study_session_started`
- **Daily Active Users (DAU)**: Unique users with `study_session_started` per day

## Implementation Notes

### Environment Variables

- `NEXT_PUBLIC_ENABLE_ANALYTICS`: Set to `'true'` to enable analytics (default: enabled in production)
- `NEXT_PUBLIC_POSTHOG_KEY`: PostHog project API key

### Development Mode

- In development, events are logged to console instead of sent to PostHog
- Set `NEXT_PUBLIC_ENABLE_ANALYTICS=true` to test PostHog integration locally

### Privacy

- No PII (Personally Identifiable Information) is tracked
- User IDs are used for identification
- Email addresses are only used for PostHog identification (not in event properties)

## Success Criteria

After 100 users:

- ✅ Can calculate activation rate
- ✅ Can identify top drop-off points
- ✅ Can see which features are used
- ✅ Can measure basic retention
- ✅ Can identify critical bugs/friction points

## Related Files

- `src/lib/analytics.ts` - Client-side tracking utility
- `src/modules/analytics/analytics.actions.ts` - Server-side logging
- `src/components/Analytics/UserReturnTracker.tsx` - Return visit tracking
- `src/hooks/useFeatureDiscovery.ts` - Feature discovery hook
- `src/instrumentation-client.ts` - PostHog initialization
