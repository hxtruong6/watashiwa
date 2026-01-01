# Story 1.3: User Profile Management

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a logged-in user,
I want to manage my profile settings and Vietnamese preferences,
So that my learning experience is personalized to my language and cultural context.

## Acceptance Criteria

**Given** I am logged in and viewing my profile page
**When** I update my display name, language preference (Vietnamese/English), and cultural settings
**Then** my profile is updated successfully
**And** changes are saved to the database
**And** the interface language updates immediately if changed (FR27, FR31, FR49)

**Given** I am on the profile settings page
**When** I select Vietnamese as my interface language
**Then** all UI elements switch to Vietnamese
**And** my preference is saved for future sessions (FR27, FR49)
**And** Vietnamese text rendering is optimized (NFR37)

**Given** I am updating my profile
**When** I attempt to save invalid data (e.g., empty required fields)
**Then** I see validation errors
**And** my changes are not saved
**And** I can correct the errors and retry

**Given** I am updating my profile during a network interruption
**When** I attempt to save changes
**Then** I see a network error message
**And** my unsaved changes are preserved locally
**And** I can retry saving when connectivity is restored

**Given** I enter a display name with special characters or emoji
**When** I save my profile
**Then** the name is validated and sanitized if needed
**And** I see confirmation of what was saved
**And** the name displays correctly throughout the application

**Given** I am updating my profile while another device is also updating it
**When** both devices save changes
**Then** the most recent changes take precedence
**And** I receive a notification about the conflict
**And** I can review what was overwritten

## Tasks / Subtasks

- [ ] Task 1: Create profile settings page (AC: 1, 2)
  - [ ] Create `src/app/profile/page.tsx` or `src/app/settings/page.tsx` route
  - [ ] Design profile form with display name, language selector, and cultural settings
  - [ ] Use Ant Design Form components (Form, Input, Select, Button)
  - [ ] Integrate with `updateUserSettings` server action
  - [ ] Implement immediate language switching on change (FR27, FR31, FR49)
  - [ ] Test profile update flow

- [ ] Task 2: Implement display name validation and sanitization (AC: 5)
  - [ ] Review existing validation in `src/lib/schemas/user.ts`
  - [ ] Add display name validation schema (max length, allowed characters)
  - [ ] Implement sanitization for special characters and emoji
  - [ ] Add validation feedback in form
  - [ ] Test name display throughout application
  - [ ] Ensure name displays correctly in NavBar and other components

- [ ] Task 3: Implement language switching with immediate UI update (AC: 2)
  - [ ] Review existing `LanguageSelector` component (`src/modules/user/components/LanguageSelector.tsx`)
  - [ ] Enhance to work within profile page context
  - [ ] Ensure language change triggers immediate UI update (reload or state update)
  - [ ] Verify preference saved to database via `updateUserSettings`
  - [ ] Test Vietnamese text rendering optimization (NFR37)
  - [ ] Verify language persists across sessions (FR27, FR49)

- [ ] Task 4: Implement form validation (AC: 3)
  - [ ] Use Zod schema from `UpdateUserSettingsSchema` for validation
  - [ ] Add client-side validation in form
  - [ ] Show validation errors using Ant Design Form.Item
  - [ ] Prevent form submission with invalid data
  - [ ] Test all validation scenarios

- [ ] Task 5: Implement network error handling and offline support (AC: 4)
  - [ ] Add network error detection in form submission
  - [ ] Store unsaved changes in localStorage when network fails
  - [ ] Show network error message using Ant Design Alert
  - [ ] Implement retry mechanism when connectivity restored
  - [ ] Restore form data from localStorage on page load
  - [ ] Test network interruption scenarios

- [ ] Task 6: Implement multi-device conflict resolution (AC: 6)
  - [ ] Add `updatedAt` timestamp check before saving
  - [ ] Detect if profile was modified by another device
  - [ ] Show conflict notification when detected
  - [ ] Implement "last write wins" strategy (most recent changes take precedence)
  - [ ] Show user what was overwritten (optional: diff view)
  - [ ] Test concurrent updates from multiple devices

- [ ] Task 7: Integrate cultural settings (AC: 1)
  - [ ] Define cultural settings structure in `UserPreferences` type
  - [ ] Add cultural settings fields to profile form
  - [ ] Store in `preferences` JSONB field
  - [ ] Ensure settings are loaded and displayed correctly
  - [ ] Test cultural settings persistence

- [ ] Task 8: Testing and validation
  - [ ] Unit tests for `UpdateUserSettingsSchema` validation
  - [ ] Unit tests for name sanitization
  - [ ] E2E test for complete profile update flow
  - [ ] E2E test for language switching
  - [ ] E2E test for network error handling
  - [ ] E2E test for multi-device conflict resolution
  - [ ] Test Vietnamese text rendering

## Dev Notes

### Existing Implementation

**Current Profile Management:**

1. **User Settings Action** (`src/modules/user/user.actions.ts`):
   - `updateUserSettings()` function exists and handles language, name, preferences updates
   - Uses `executeSafeAction` pattern with `UpdateUserSettingsSchema` validation
   - Merges preferences JSONB field (doesn't overwrite)
   - Revalidates `/dashboard` and `/settings` paths after update

2. **User Settings Schema** (`src/lib/schemas/user.ts`):
   - `UpdateUserSettingsSchema` with validation for:
     - `limitNewCards`, `limitReviews`, `dailyGoal`, `enableSmartPacing`
     - `timezone`, `language` (enum: 'en', 'vi', 'ja')
     - `autoPlayAudio`, `showPitchAccent`, `showEtymology`, `enablePriming`
     - `enableNotifications`, `reminderTime`
     - `preferences` (JSONB with `UserPreferencesSchema`)

3. **Language Selector** (`src/modules/user/components/LanguageSelector.tsx`):
   - Already implements language switching
   - Updates cookie immediately: `document.cookie = 'NEXT_LOCALE=${newLocale}'`
   - Calls `updateUserSettings({ language: newLocale })` to persist to DB
   - Reloads page: `window.location.reload()` to apply changes
   - Handles public users (cookie-only, no DB update)

4. **User Model** (`prisma/schema.prisma`):
   - `name` (String, Optional) - Display name
   - `language` (String, Default: "en") - "en", "vi", "ja"
   - `preferences` (JSONB) - Flexible preferences including cultural settings
   - `timezone` (String, Default: "UTC")
   - `updatedAt` (DateTime) - For conflict detection

5. **Internationalization Setup** (`src/i18n/`):
   - `routing.ts` - Defines locales: ['en', 'vi'], default: 'vi'
   - `request.ts` - Reads locale from `NEXT_LOCALE` cookie
   - Messages in `src/i18n/messages/en.json` and `vi.json`

**What Needs to Be Created:**

1. **Profile Page**: Need to create `/profile` or `/settings` page with form
2. **Display Name Field**: Add to form (currently not in UpdateUserSettingsSchema)
3. **Name Validation**: Add validation schema for display name
4. **Cultural Settings UI**: Add form fields for cultural preferences
5. **Conflict Detection**: Implement `updatedAt` check for multi-device conflicts
6. **Offline Support**: Add localStorage persistence for unsaved changes

### Previous Story Intelligence (Story 1.2)

**Key Learnings from Login & Session Management Story:**

1. **Server Actions Pattern**: Use `executeSafeAction` with Zod validation
2. **Error Handling**: User-friendly error messages using translation keys
3. **Network Error Handling**: Detect network failures and show retry options
4. **Form Validation**: Use Zod schemas for client and server validation
5. **Ant Design Components**: Use Form, Input, Button, Alert, Select components
6. **Translation Support**: Use `useTranslations('Namespace')` for all user-facing strings

**Files Created/Modified in Story 1.2:**

- `src/modules/auth/hooks/useAuth.ts` - Login/logout logic
- `src/app/login/page.tsx` - Login form
- `src/utils/supabase/middleware.ts` - Session management

**Patterns to Follow:**

- Use `executeSafeAction` pattern for server actions
- Use Ant Design Form components
- Use `useTranslations()` for all user-facing strings
- Implement network error handling with retry
- Use Zod schemas for validation

### Architecture Compliance

**Server Actions Pattern:**

```typescript
'use server'
import { executeSafeAction } from '@/modules/core/action-client';
import { UpdateUserSettingsSchema } from '@/lib/schemas/user';
import { z } from 'zod';

export async function updateUserProfile(input: unknown) {
  return executeSafeAction(
    UpdateUserSettingsSchema,
    input,
    async (validatedInput, { userId }) => {
      if (!userId) throw new Error('Unauthorized');
      
      // Business logic - update user profile
      await prisma.user.update({
        where: { id: userId },
        data: { ...validatedInput }
      });
      
      revalidatePath('/profile');
      return { success: true };
    },
    { userId: true } // Require authentication
  );
}
```

**Component Pattern:**

```typescript
'use client';
import { useTranslations } from 'next-intl';
import { Form, Input, Select, Button, Alert } from 'antd';
import { updateUserSettings } from '@/modules/user/user.actions';

export default function ProfilePage() {
  const t = useTranslations('Profile');
  const [form] = Form.useForm();
  
  const handleSubmit = async (values: unknown) => {
    const result = await updateUserSettings(values);
    if (result.success) {
      // Handle success
    }
  };
  
  return (
    <Form form={form} onFinish={handleSubmit}>
      {/* Form fields */}
    </Form>
  );
}
```

**Database Access:**

- Use Prisma client from `@/lib/db`
- Always filter by `userId` obtained from `getUser()` (multi-tenancy)
- Use transactions for multi-step operations
- Merge JSONB preferences (don't overwrite entire object)

**Internationalization Pattern:**

- Use `useTranslations('Profile')` for all user-facing strings
- Language stored in `User.language` field and `NEXT_LOCALE` cookie
- Update both cookie and DB when language changes
- Reload page after language change: `window.location.reload()`

### Library & Framework Requirements

**Next.js App Router:**

- Use Server Components for data fetching (get user profile)
- Use Client Components for interactive forms
- Use `revalidatePath()` after updates to refresh cached data
- Use `cache()` wrapper for data fetching functions

**next-intl 4.6.1:**

- **Language Switching**: Update `NEXT_LOCALE` cookie and call `updateUserSettings({ language })`
- **Immediate Update**: Use `window.location.reload()` to apply language change immediately
- **Translation Hook**: `useTranslations('Namespace')` for translated strings
- **Locale Detection**: Reads from `NEXT_LOCALE` cookie in `src/i18n/request.ts`
- **Supported Locales**: 'en', 'vi' (default: 'vi')

**Ant Design 6.1.2:**

- Use `Form`, `Input`, `Select`, `Button`, `Alert`, `Card` components
- Use `Form.Item` for form fields with validation
- Use `App.useApp()` for global message notifications
- Use theme tokens from `src/lib/theme/themeConfig.ts`
- NO Tailwind CSS classes

**Zod:**

- Use `UpdateUserSettingsSchema` for validation
- Extend schema for display name validation if needed
- Client and server validation using same schema

### File Structure Requirements

**Files to Review:**

- `src/modules/user/user.actions.ts` - `updateUserSettings` action
- `src/lib/schemas/user.ts` - Validation schemas
- `src/modules/user/components/LanguageSelector.tsx` - Language switching component
- `src/types/user.ts` - `UserPreferences` and `UserSettings` types
- `prisma/schema.prisma` - User model definition
- `src/i18n/routing.ts` - Internationalization routing config
- `src/i18n/request.ts` - Locale detection
- `src/i18n/messages/en.json` - English translations
- `src/i18n/messages/vi.json` - Vietnamese translations

**Files to Create/Modify:**

- `src/app/profile/page.tsx` - Profile settings page (NEW)
- `src/lib/schemas/user.ts` - Add display name validation (MODIFY)
- `src/modules/user/user.actions.ts` - Add `updateUserProfile` or enhance `updateUserSettings` for name (MODIFY)
- `src/modules/user/components/ProfileForm.tsx` - Profile form component (NEW, optional)
- `src/i18n/messages/en.json` - Add Profile namespace translations (MODIFY)
- `src/i18n/messages/vi.json` - Add Profile namespace translations (MODIFY)
- `e2e/profile-management.spec.ts` - E2E tests (NEW)
- `src/modules/user/user.actions.test.ts` - Unit tests (NEW or MODIFY)

**Module Organization (Vertical Slice):**

```
src/modules/user/
├── components/
│   ├── LanguageSelector.tsx      # Existing language selector
│   └── ProfileForm.tsx            # NEW: Profile form component
├── user.actions.ts                # Existing updateUserSettings
└── types.ts                       # UserPreferences, UserSettings types
```

### Testing Requirements

**Unit Tests:**

- Test `UpdateUserSettingsSchema` validation:
  - Valid inputs
  - Invalid language values
  - Invalid timezone format
  - Invalid reminderTime format
  - Name validation (if added)
- Test `updateUserSettings` function:
  - Successful update
  - Unauthorized access
  - Preferences merging
  - Conflict detection (if implemented)

**E2E Tests (Playwright):**

- Complete profile update flow: load page → edit fields → save → verify changes
- Language switching: select Vietnamese → verify UI updates → verify persistence
- Form validation: submit invalid data → verify error messages
- Network error handling: disconnect → save → verify error → reconnect → retry
- Multi-device conflict: update from two devices → verify conflict resolution
- Display name with special characters: enter emoji → save → verify sanitization

**Test Files:**

- Unit tests: `src/lib/schemas/user.test.ts`, `src/modules/user/user.actions.test.ts`
- E2E tests: `e2e/profile-management.spec.ts`

### Project Structure Notes

**Alignment with Unified Project Structure:**

- ✅ Vertical Slice Architecture maintained (`src/modules/user/`)
- ✅ Server Actions pattern (`user.actions.ts`)
- ✅ Validation schemas co-located (`src/lib/schemas/user.ts`)
- ✅ Route organization follows Next.js App Router conventions
- ✅ Component organization within module

**No Conflicts Detected:**

- All file locations align with existing architecture
- No deviations from Vertical Slice pattern
- Follows established naming conventions

### References

- [Source: docs/models/user.md] - User model documentation
- [Source: src/modules/user/user.actions.ts] - User settings update logic
- [Source: src/lib/schemas/user.ts] - Validation schemas
- [Source: src/modules/user/components/LanguageSelector.tsx] - Language switching implementation
- [Source: src/types/user.ts] - UserPreferences and UserSettings types
- [Source: prisma/schema.prisma] - User model definition
- [Source: src/i18n/routing.ts] - Internationalization routing
- [Source: docs/architecture.md] - Vertical Slice Architecture patterns
- [Source: _bmad-output/planning-artifacts/epics.md#epic-1-story-1.3] - Story requirements
- [Source: _bmad-output/planning-artifacts/architecture.md] - Architecture decisions

### Security Considerations

- **Input Validation**: Zod schemas prevent injection attacks
- **Name Sanitization**: Validate and sanitize display name (prevent XSS)
- **Authorization**: Always check `userId` in server actions
- **Multi-Tenancy**: All updates filtered by `userId` (no cross-user access)
- **Data Encryption**: User data encrypted at rest (AES-256) per NFR13
- **TLS**: Data in transit protected with TLS 1.3 per NFR14
- **Conflict Resolution**: Use `updatedAt` timestamp to detect concurrent modifications

### Performance Requirements

- **Profile Load**: <200ms (NFR10 - database query)
- **Profile Update**: <200ms (NFR10 - database update)
- **Language Switch**: <200ms (cookie update + DB update)
- **UI Update After Language Change**: <100ms (page reload)
- **Vietnamese Text Rendering**: Optimized per NFR37

### Latest Technical Information

**next-intl Best Practices:**

1. **Language Switching**:
   - Update cookie: `document.cookie = 'NEXT_LOCALE=${locale}'`
   - Update database: `updateUserSettings({ language: locale })`
   - Reload page: `window.location.reload()` to apply changes immediately

2. **Locale Detection**:
   - Server reads from `NEXT_LOCALE` cookie in `getRequestConfig`
   - Falls back to `defaultLocale` ('vi') if cookie not set
   - Cookie persists across sessions (max-age: 31536000)

3. **Translation Keys**:
   - Use namespace pattern: `useTranslations('Profile')`
   - Keys in `src/i18n/messages/{locale}.json`
   - Supports nested keys: `t('section.field')`

**Ant Design Form Best Practices:**

1. **Form Validation**:
   - Use `Form.Item` with `rules` prop for validation
   - Can use Zod schema with `zodResolver` (if using react-hook-form) or manual validation
   - Show errors with `Form.Item` error display

2. **Form State**:
   - Use `Form.useForm()` hook for form instance
   - Access form values: `form.getFieldsValue()`
   - Set form values: `form.setFieldsValue(values)`

3. **Form Submission**:
   - Use `onFinish` handler for form submission
   - Show loading state during submission
   - Handle success/error with Ant Design message notifications

**Multi-Device Conflict Resolution:**

1. **Optimistic Locking**:
   - Check `updatedAt` timestamp before saving
   - If `updatedAt` changed since form load, show conflict warning
   - Implement "last write wins" strategy (most recent `updatedAt` wins)

2. **Conflict Detection**:
   - Fetch current `updatedAt` before update
   - Compare with form's initial `updatedAt`
   - If different, another device modified the profile

3. **User Notification**:
   - Show Alert or Modal when conflict detected
   - Optionally show what was overwritten
   - Allow user to refresh and see latest data

## Dev Agent Record

### Agent Model Used

Auto (Cursor AI)

### Debug Log References

N/A (Initial story creation)

### Completion Notes List

- Story file created with comprehensive developer context
- Includes existing implementation analysis
- Documents required enhancements for profile page, name validation, conflict resolution
- Includes all technical requirements and architecture patterns
- References next-intl and Ant Design best practices

### File List

**Existing Files to Review:**

- `src/modules/user/user.actions.ts` - User settings update
- `src/lib/schemas/user.ts` - Validation schemas
- `src/modules/user/components/LanguageSelector.tsx` - Language switching
- `src/types/user.ts` - User types
- `prisma/schema.prisma` - User model
- `src/i18n/routing.ts` - i18n config
- `src/i18n/messages/en.json` - English translations
- `src/i18n/messages/vi.json` - Vietnamese translations

**Files to Create/Modify:**

- `src/app/profile/page.tsx` - Profile settings page (NEW)
- `src/lib/schemas/user.ts` - Add display name validation (MODIFY)
- `src/modules/user/user.actions.ts` - Enhance for name update (MODIFY)
- `src/modules/user/components/ProfileForm.tsx` - Profile form component (NEW, optional)
- `src/i18n/messages/en.json` - Add Profile translations (MODIFY)
- `src/i18n/messages/vi.json` - Add Profile translations (MODIFY)
- `e2e/profile-management.spec.ts` - E2E tests (NEW)
- `src/modules/user/user.actions.test.ts` - Unit tests (NEW or MODIFY)
