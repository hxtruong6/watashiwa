# Profile Setup: Algorithm Mode Selection & CUBE Introduction

**Status:** ✅ Complete  
**Date:** 2025-01-02  
**Related Story:** Enhancement to Story 2.2 (Switch Between Semantic and SRS Algorithm Modes)

---

## Overview

This implementation adds algorithm mode selection (CUBE vs SRS) to the profile setup flow, allowing new users to choose their preferred learning method during initial onboarding. Additionally, a dedicated CUBE introduction page was created to help users understand the innovative CUBE method before making their selection.

## User Story

**As a** new user completing profile setup  
**I want to** select my preferred learning method (CUBE or SRS)  
**So that** I can start learning with the approach that works best for me

**As a** new user considering CUBE method  
**I want to** learn more about how CUBE works  
**So that** I can make an informed decision about my learning approach

## Acceptance Criteria

✅ **AC1:** Profile setup form includes algorithm mode selection with CUBE and SRS options  
✅ **AC2:** Default selection is SRS (safe fallback)  
✅ **AC3:** Tooltip provides quick description of both methods  
✅ **AC4:** "Learn more" link navigates to CUBE introduction page  
✅ **AC5:** CUBE introduction page explains the method comprehensively  
✅ **AC6:** Users can navigate back from CUBE page to profile setup  
✅ **AC7:** Users can select CUBE method directly from introduction page  
✅ **AC8:** Algorithm mode preference is saved to user settings  
✅ **AC9:** All UI text is internationalized (English and Vietnamese)

## Implementation Details

### 1. Profile Setup Form Enhancement

**File:** `src/app/profile/setup/ProfileSetupForm.tsx`

**Changes:**

- Added `algorithmMode` field to form with `Segmented` component
- Integrated tooltip with `InfoCircleOutlined` icon explaining both methods
- Added "Learn more about CUBE method" link below segmented control
- Updated form submission to save `algorithmMode` preference
- Default value set to `'srs'` (safe fallback)

**Key Features:**

- Uses Ant Design `Segmented` component for mode selection
- Tooltip shows brief descriptions of both CUBE and SRS methods
- Navigation link to CUBE introduction page
- Preference saved to `User.preferences.algorithmMode` JSONB field

### 2. CUBE Introduction Page

**Files:**

- `src/app/profile/setup/cube/page.tsx` - Server component with auth check
- `src/app/profile/setup/cube/CubeIntroduction.tsx` - Client component with content

**Features:**

- **Introduction Section:** Overview of CUBE method and its philosophy
- **Core Principles:** Four pillars explained:
  - **Context:** Related vocabulary and contextual examples
  - **Understanding:** Etymology and Hán Việt connections
  - **Blocking:** Confusion Shield for similar words
  - **Encoding:** Dynamic practice variants
- **Benefits Section:** Why choose CUBE over traditional SRS
- **Navigation:**
  - "Back to Setup" button returns to profile setup
  - "Select CUBE Method" button saves preference and returns to setup
- **Server-side Authentication:** Ensures only authenticated users can access

### 3. Internationalization

**Files:**

- `src/i18n/messages/en.json`
- `src/i18n/messages/vi.json`

**Added Translations:**

- `Profile.learningMethod` - Learning method label
- `Profile.cubeMethodTooltip` - CUBE method description
- `Profile.srsMethodTooltip` - SRS method description
- `Profile.learnMoreAboutCube` - Link text
- `Profile.backToSetup` - Back button text
- `Profile.cubeMethodTitle` - CUBE page title
- `Profile.cubeMethodSubtitle` - CUBE page subtitle
- `Profile.cubeMethodIntroduction` - CUBE introduction paragraph
- `Profile.cubeMethodPrinciples` - Principles section title
- `Profile.cubeContext`, `Profile.cubeUnderstanding`, `Profile.cubeBlocking`, `Profile.cubeEncoding` - Principle titles
- `Profile.cubeContextDesc`, `Profile.cubeUnderstandingDesc`, `Profile.cubeBlockingDesc`, `Profile.cubeEncodingDesc` - Principle descriptions
- `Profile.cubeMethodBenefits` - Benefits section title
- `Profile.cubeBenefit1-4` - Individual benefit descriptions
- `Profile.selectCubeMethod` - CTA button text
- `Profile.cubeMethodSelected` - Success message

## Technical Architecture

### Component Structure

```
src/app/profile/setup/
├── page.tsx                          # Server component (auth check)
├── ProfileSetupForm.tsx              # Client form component (MODIFIED)
└── cube/
    ├── page.tsx                      # Server component (auth check) [NEW]
    └── CubeIntroduction.tsx          # Client content component [NEW]
```

### Data Flow

1. **Profile Setup:**
   - User selects algorithm mode (default: SRS)
   - Form submission calls `updateUserSettings` with `preferences.algorithmMode`
   - Preference saved to `User.preferences` JSONB field
   - User redirected to dashboard

2. **CUBE Introduction:**
   - User clicks "Learn more" link → navigates to `/profile/setup/cube`
   - User reads CUBE explanation
   - User clicks "Select CUBE Method" → calls `updateUserSettings` with `algorithmMode: 'semantic'`
   - Preference saved → user redirected back to profile setup

### Integration Points

- **User Settings:** Uses existing `updateUserSettings` server action
- **User Preferences Schema:** Extends existing `UserPreferencesSchema` with `algorithmMode` enum
- **Study Preferences Store:** Algorithm mode already supported in `useStudyPreferences` (from Story 2.2)
- **Authentication:** Uses existing `getUser()` pattern from auth module

## Files Created

1. **`src/app/profile/setup/cube/page.tsx`**
   - Server component with authentication check
   - Renders `CubeIntroduction` client component

2. **`src/app/profile/setup/cube/CubeIntroduction.tsx`**
   - Client component with CUBE method explanation
   - Includes navigation and preference selection functionality
   - Uses Ant Design components for consistent UI

## Files Modified

1. **`src/app/profile/setup/ProfileSetupForm.tsx`**
   - Added algorithm mode selection field
   - Added tooltip with method descriptions
   - Added navigation link to CUBE page
   - Updated form submission to save algorithm mode preference

2. **`src/i18n/messages/en.json`**
   - Added all Profile section translations for CUBE method

3. **`src/i18n/messages/vi.json`**
   - Added all Profile section translations for CUBE method (Vietnamese)

## Design Decisions

### 1. Default to SRS

**Decision:** Default algorithm mode is set to `'srs'`  
**Rationale:** SRS is the proven, traditional method. CUBE is innovative but may not suit all users. Defaulting to SRS provides a safe fallback.

### 2. Separate CUBE Introduction Page

**Decision:** Created dedicated page instead of inline modal or expandable section  
**Rationale:** CUBE method requires comprehensive explanation. A full page provides better reading experience and allows users to focus on understanding the method.

### 3. Navigation Pattern

**Decision:** Users can navigate back and forth between setup and CUBE page  
**Rationale:** Allows users to review CUBE information multiple times before making decision. Also allows users to change their mind after reading.

### 4. Direct Selection from CUBE Page

**Decision:** "Select CUBE Method" button saves preference immediately  
**Rationale:** Reduces friction - if user is convinced after reading, they can select immediately without returning to setup form.

## Testing Considerations

### Manual Testing Checklist

- [ ] Profile setup form displays algorithm mode selector
- [ ] Default selection is SRS
- [ ] Tooltip shows descriptions for both methods
- [ ] "Learn more" link navigates to CUBE page
- [ ] CUBE page displays all content correctly
- [ ] "Back to Setup" button returns to profile setup
- [ ] "Select CUBE Method" button saves preference and redirects
- [ ] Algorithm mode preference persists after form submission
- [ ] Translations work correctly in both English and Vietnamese
- [ ] Authentication check prevents unauthorized access to CUBE page

### Integration Testing

- [ ] Algorithm mode saved to database correctly
- [ ] Preference syncs with `useStudyPreferences` store
- [ ] Study session respects algorithm mode preference (from Story 2.2)

## Related Stories

- **Story 2.2:** Switch Between Semantic and SRS Algorithm Modes
  - This implementation extends Story 2.2 by adding algorithm mode selection to profile setup
  - Uses the same `algorithmMode` preference field and server actions

## Future Enhancements

1. **A/B Testing:** Track which method users select and their success rates
2. **Onboarding Flow:** Add guided tour explaining both methods
3. **Method Comparison:** Add side-by-side comparison view
4. **User Feedback:** Collect feedback on method selection experience
5. **Analytics:** Track CUBE page views and conversion rate

## Completion Notes

✅ **Profile Setup Form:** Algorithm mode selection added with tooltip and navigation link  
✅ **CUBE Introduction Page:** Comprehensive explanation page created with navigation  
✅ **Internationalization:** All UI text translated to English and Vietnamese  
✅ **Integration:** Preference saving integrated with existing user settings system  
✅ **Navigation:** Seamless navigation between setup and CUBE page  
✅ **User Experience:** Clear, informative interface following Ant Design patterns

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Implementation Date

2025-01-02

### Completion Status

✅ **COMPLETE** - All acceptance criteria met, code implemented, translations added, ready for testing

---

**Next Steps:**

1. Manual testing of complete flow
2. Integration testing with study session (Story 2.2)
3. User acceptance testing with new users
4. Monitor analytics for method selection patterns
