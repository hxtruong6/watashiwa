# Story 1.4: Cross-Device Synchronization

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user with multiple devices,
I want my learning progress to synchronize across all my devices,
So that I can seamlessly continue studying on any device.

## Acceptance Criteria

**Given** I am logged in on Device A and complete a study session
**When** I log in on Device B
**Then** my learning progress from Device A is visible on Device B
**And** my session history is synchronized (FR44)
**And** my knowledge graph state is consistent across devices

**Given** I am studying on Device A
**When** I switch to Device B mid-session
**Then** I can resume my session from where I left off (FR36)
**And** all progress is preserved
**And** no data is lost during synchronization

**Given** I have conflicting changes on two devices
**When** synchronization occurs
**Then** the most recent changes take precedence
**And** I receive a notification about the conflict resolution
**And** my data remains consistent

**Given** I am on a device with no internet connection
**When** I make changes to my learning progress
**Then** changes are stored locally
**And** I see an indicator that sync is pending
**And** changes are synchronized automatically when connectivity is restored

**Given** I have a very large amount of learning data (10,000+ words)
**When** synchronization occurs
**Then** synchronization completes within reasonable time (<2 minutes)
**And** progress indicators show sync status
**And** data integrity is maintained throughout the process

**Given** synchronization fails due to server error
**When** the error occurs
**Then** I see an error message
**And** my local data is preserved
**And** the system automatically retries synchronization
**And** I can manually trigger a retry if needed

## Tasks / Subtasks

- [ ] Task 1: Design synchronization data model and schema (AC: 1, 2, 3)
  - [ ] Identify all data that needs synchronization (study sessions, reviews, progress, knowledge graph)
  - [ ] Design sync metadata schema (lastSync timestamp, deviceId, syncVersion)
  - [ ] Design conflict resolution strategy (last-write-wins with timestamp comparison)
  - [ ] Add sync fields to Prisma schema (User, StudySession, Review, etc.)
  - [ ] Create migration for sync fields

- [ ] Task 2: Implement server-side sync API endpoints (AC: 1, 2, 3, 5, 6)
  - [ ] Create `syncLearningProgress` server action in `src/modules/sync/sync.actions.ts`
  - [ ] Implement incremental sync (only send changed data since lastSync)
  - [ ] Implement conflict detection and resolution logic
  - [ ] Add sync status tracking (pending, in-progress, completed, failed)
  - [ ] Implement retry mechanism for failed syncs
  - [ ] Add validation for sync payloads using Zod schemas
  - [ ] Test with large datasets (10,000+ words)

- [ ] Task 3: Implement client-side sync service (AC: 1, 2, 4, 6)
  - [ ] Create `src/modules/sync/services/SyncService.ts` client service
  - [ ] Implement automatic sync on app load (if user is authenticated)
  - [ ] Implement automatic sync after study session completion
  - [ ] Implement background sync when connectivity restored
  - [ ] Add sync status indicator UI component
  - [ ] Implement manual sync trigger
  - [ ] Add sync progress indicators

- [ ] Task 4: Implement offline-first data storage (AC: 4)
  - [ ] Review existing IndexedDB setup (if any)
  - [ ] Create IndexedDB schema for offline data storage
  - [ ] Implement local storage for pending changes
  - [ ] Implement sync queue for offline changes
  - [ ] Add "sync pending" indicator when offline
  - [ ] Implement automatic sync when connectivity restored

- [ ] Task 5: Implement session continuity across devices (AC: 2)
  - [ ] Design session state serialization format
  - [ ] Implement session state save on device switch
  - [ ] Implement session state restore on device switch
  - [ ] Add session resume UI flow
  - [ ] Test session continuity with mid-session device switch

- [ ] Task 6: Implement conflict resolution UI (AC: 3)
  - [ ] Create conflict detection component
  - [ ] Show conflict notification when detected
  - [ ] Display what data was overwritten
  - [ ] Allow user to review conflict resolution
  - [ ] Test conflict scenarios with two devices

- [ ] Task 7: Implement knowledge graph synchronization (AC: 1)
  - [ ] Design knowledge graph sync strategy (incremental updates)
  - [ ] Implement graph state serialization
  - [ ] Implement graph state merge logic
  - [ ] Test graph consistency across devices

- [ ] Task 8: Performance optimization for large datasets (AC: 5)
  - [ ] Implement incremental sync (only changed data)
  - [ ] Implement data compression for sync payloads
  - [ ] Add pagination for large sync operations
  - [ ] Optimize database queries for sync operations
  - [ ] Test with 10,000+ words dataset

- [ ] Task 9: Error handling and retry logic (AC: 6)
  - [ ] Implement exponential backoff for retries
  - [ ] Add error logging and monitoring (Sentry)
  - [ ] Show user-friendly error messages
  - [ ] Implement manual retry trigger
  - [ ] Test various error scenarios (network, server, timeout)

- [ ] Task 10: Testing and validation
  - [ ] Unit tests for sync service logic
  - [ ] Unit tests for conflict resolution
  - [ ] E2E test for cross-device sync flow
  - [ ] E2E test for offline sync
  - [ ] E2E test for conflict resolution
  - [ ] Performance test with large datasets
  - [ ] Test session continuity across devices

## Dev Notes

### Existing Implementation

**Current State:**

1. **User Authentication** (`src/modules/auth/auth.actions.ts`):
   - `syncUser()` function exists for syncing Supabase user to Prisma DB
   - Handles user creation/update on login
   - No cross-device sync for learning data yet

2. **Database Schema** (`prisma/schema.prisma`):
   - User model has `updatedAt` field (can be used for conflict detection)
   - StudySession, Review, VocabularyProgress models exist
   - No sync metadata fields yet (lastSync, deviceId, syncVersion)

3. **Offline/PWA Support** (Architecture docs):
   - Architecture mentions IndexedDB for offline storage
   - Service Worker background sync mentioned
   - No implementation found in codebase yet

4. **Session Management**:
   - Study sessions are managed in Zustand store
   - No session persistence across devices yet

**What Needs to Be Created:**

1. **Sync Module** (`src/modules/sync/`):
   - `sync.actions.ts` - Server actions for sync operations
   - `services/SyncService.ts` - Client-side sync service
   - `hooks/useSync.ts` - React hook for sync state
   - `components/SyncStatus.tsx` - UI component for sync status
   - `types.ts` - Sync-related types and interfaces

2. **Database Schema Updates**:
   - Add `lastSync` timestamp to User model
   - Add `deviceId` to track devices
   - Add `syncVersion` for conflict detection
   - Add sync metadata to StudySession, Review models

3. **IndexedDB Implementation**:
   - Create IndexedDB schema for offline storage
   - Implement offline queue for pending changes
   - Implement background sync service

4. **Session Continuity**:
   - Session state serialization
   - Session state restore logic
   - Session resume UI

### Previous Story Intelligence (Story 1.3)

**Key Learnings from User Profile Management Story:**

1. **Conflict Resolution Pattern**: Use `updatedAt` timestamp to detect concurrent modifications
   - Implement "last write wins" strategy
   - Show conflict notification to user
   - Allow user to review what was overwritten

2. **Server Actions Pattern**: Use `executeSafeAction` with Zod validation
   - Always return `{ success: boolean, data?: T, error?: string }`
   - Never throw errors in server actions
   - Use user-friendly error messages

3. **Network Error Handling**: Detect network failures and show retry options
   - Store unsaved changes locally when network fails
   - Implement retry mechanism when connectivity restored
   - Show network error messages using Ant Design Alert

4. **Form Validation**: Use Zod schemas for client and server validation
   - Same schema for both client and server
   - Show validation errors using Ant Design Form.Item

5. **Ant Design Components**: Use Form, Input, Button, Alert, Select components
   - Use theme tokens from `src/lib/theme/themeConfig.ts`
   - NO Tailwind CSS classes

6. **Translation Support**: Use `useTranslations('Namespace')` for all user-facing strings
   - Add translations to `src/i18n/messages/en.json` and `vi.json`

**Files Created/Modified in Story 1.3:**

- `src/app/profile/page.tsx` - Profile settings page
- `src/lib/schemas/user.ts` - Display name validation
- `src/modules/user/user.actions.ts` - Profile update logic
- `src/modules/user/components/ProfileForm.tsx` - Profile form component

**Patterns to Follow:**

- Use `executeSafeAction` pattern for server actions
- Use Ant Design components (NO Tailwind)
- Use `useTranslations()` for all user-facing strings
- Implement conflict detection using `updatedAt` timestamps
- Store pending changes locally when offline
- Show user-friendly error messages

### Architecture Compliance

**Server Actions Pattern:**

```typescript
'use server';
import { SyncProgressSchema } from '@/lib/schemas/sync';
import { executeSafeAction } from '@/modules/core/action-client';
import { z } from 'zod';

export async function syncLearningProgress(input: unknown) {
	return executeSafeAction(
		SyncProgressSchema,
		input,
		async (validatedInput, { userId }) => {
			if (!userId) throw new Error('Unauthorized');

			// Business logic - sync learning progress
			const syncResult = await performSync(validatedInput, userId);

			revalidatePath('/dashboard');
			return { success: true, data: syncResult };
		},
		{ userId: true }, // Require authentication
	);
}
```

**Component Pattern:**

```typescript
'use client';
import { useTranslations } from 'next-intl';
import { Button, Alert, Progress } from 'antd';
import { useSync } from '@/modules/sync/hooks/useSync';

export default function SyncStatus() {
  const t = useTranslations('Sync');
  const { syncStatus, syncProgress, triggerSync } = useSync();

  return (
    <div>
      <Button onClick={triggerSync} loading={syncStatus === 'syncing'}>
        {t('syncNow')}
      </Button>
      {syncStatus === 'syncing' && (
        <Progress percent={syncProgress} />
      )}
    </div>
  );
}
```

**Database Access:**

- Use Prisma client from `@/lib/db`
- Always filter by `userId` obtained from `getUser()` (multi-tenancy)
- Use transactions for multi-step sync operations
- Use `updatedAt` timestamps for conflict detection

**Offline Storage Pattern:**

- Use IndexedDB for offline data storage
- Store pending changes in IndexedDB queue
- Use Service Worker for background sync
- Implement exponential backoff for retries

### Library & Framework Requirements

**Next.js App Router:**

- Use Server Components for data fetching (sync status)
- Use Client Components for interactive sync UI
- Use `revalidatePath()` after sync to refresh cached data
- Use `cache()` wrapper for data fetching functions

**Zustand 5.0.9:**

- Use for sync state management (syncStatus, syncProgress)
- Store in `src/modules/sync/store/useSyncStore.ts`
- Persist sync state to localStorage

**IndexedDB:**

- Use `idb` library (if needed) or native IndexedDB API
- Store offline queue for pending changes
- Store cached learning data for offline access

**Service Worker:**

- Use for background sync when connectivity restored
- Implement sync queue processing
- Handle sync retries

**Ant Design 6.1.2:**

- Use `Button`, `Alert`, `Progress`, `Badge` components for sync UI
- Use `App.useApp()` for global message notifications
- Use theme tokens from `src/lib/theme/themeConfig.ts`
- NO Tailwind CSS classes

**Zod:**

- Use `SyncProgressSchema` for validation
- Validate sync payloads on client and server
- Use same schema for both client and server validation

### File Structure Requirements

**Files to Review:**

- `src/modules/auth/auth.actions.ts` - User sync logic (reference)
- `prisma/schema.prisma` - Database models
- `src/modules/flashcard/store/useFlashcardStore.ts` - Session state management
- `src/modules/study/services/study.service.ts` - Study session logic
- `docs/architecture.md` - Offline/PWA architecture

**Files to Create/Modify:**

- `src/modules/sync/sync.actions.ts` - Server actions for sync (NEW)
- `src/modules/sync/services/SyncService.ts` - Client sync service (NEW)
- `src/modules/sync/hooks/useSync.ts` - React hook for sync (NEW)
- `src/modules/sync/store/useSyncStore.ts` - Zustand store for sync state (NEW)
- `src/modules/sync/components/SyncStatus.tsx` - Sync status UI (NEW)
- `src/modules/sync/types.ts` - Sync types (NEW)
- `src/lib/schemas/sync.ts` - Sync validation schemas (NEW)
- `prisma/schema.prisma` - Add sync fields to models (MODIFY)
- `src/i18n/messages/en.json` - Add Sync namespace translations (MODIFY)
- `src/i18n/messages/vi.json` - Add Sync namespace translations (MODIFY)
- `e2e/cross-device-sync.spec.ts` - E2E tests (NEW)
- `src/modules/sync/sync.actions.test.ts` - Unit tests (NEW)

**Module Organization (Vertical Slice):**

```
src/modules/sync/
├── components/
│   └── SyncStatus.tsx          # Sync status UI component
├── hooks/
│   └── useSync.ts              # React hook for sync
├── services/
│   └── SyncService.ts          # Client-side sync service
├── store/
│   └── useSyncStore.ts         # Zustand store for sync state
├── sync.actions.ts             # Server actions for sync
├── types.ts                     # Sync types and interfaces
└── utils.ts                    # Sync utility functions
```

### Testing Requirements

**Unit Tests:**

- Test `SyncProgressSchema` validation:
  - Valid sync payloads
  - Invalid device IDs
  - Invalid timestamps
  - Missing required fields
- Test `syncLearningProgress` function:
  - Successful sync
  - Conflict detection and resolution
  - Unauthorized access
  - Large dataset sync (10,000+ words)
  - Incremental sync (only changed data)
- Test conflict resolution logic:
  - Last-write-wins strategy
  - Timestamp comparison
  - Conflict notification

**E2E Tests (Playwright):**

- Complete cross-device sync flow: Device A completes session → Device B logs in → verify sync
- Session continuity: Device A mid-session → Device B resumes → verify session state
- Conflict resolution: Two devices make changes → verify conflict resolution
- Offline sync: Make changes offline → verify local storage → restore connectivity → verify sync
- Large dataset sync: Sync 10,000+ words → verify performance and data integrity
- Error handling: Simulate server error → verify retry mechanism

**Test Files:**

- Unit tests: `src/lib/schemas/sync.test.ts`, `src/modules/sync/sync.actions.test.ts`
- E2E tests: `e2e/cross-device-sync.spec.ts`

### Project Structure Notes

**Alignment with Unified Project Structure:**

- ✅ Vertical Slice Architecture maintained (`src/modules/sync/`)
- ✅ Server Actions pattern (`sync.actions.ts`)
- ✅ Validation schemas co-located (`src/lib/schemas/sync.ts`)
- ✅ Component organization within module
- ✅ Zustand store in module store folder

**No Conflicts Detected:**

- All file locations align with existing architecture
- No deviations from Vertical Slice pattern
- Follows established naming conventions

### References

- [Source: _bmad-output/planning-artifacts/epics.md#epic-1-story-1.4] - Story requirements and acceptance criteria
- [Source: _bmad-output/planning-artifacts/architecture.md#offline-pwa-capability] - Offline/PWA architecture
- [Source: _bmad-output/planning-artifacts/architecture.md#conflict-resolution] - Conflict resolution strategy
- [Source: _bmad-output/implementation-artifacts/1-3-user-profile-management.md] - Previous story with conflict resolution pattern
- [Source: src/modules/auth/auth.actions.ts] - User sync logic (reference)
- [Source: prisma/schema.prisma] - Database models
- [Source: docs/architecture.md] - Vertical Slice Architecture patterns
- [Source: _bmad-output/project-context.md] - Project context and rules

### Security Considerations

- **Input Validation**: Zod schemas prevent injection attacks
- **Authorization**: Always check `userId` in server actions
- **Multi-Tenancy**: All sync operations filtered by `userId` (no cross-user access)
- **Data Encryption**: Sync data encrypted at rest (AES-256) per NFR13
- **TLS**: Data in transit protected with TLS 1.3 per NFR14
- **Device Tracking**: Track device IDs for security and conflict resolution
- **Conflict Resolution**: Use `updatedAt` timestamp to detect concurrent modifications

### Performance Requirements

- **Sync Operation**: <2 minutes for 10,000+ words (AC: 5)
- **Incremental Sync**: Only sync changed data since lastSync
- **Database Queries**: <200ms for sync queries (NFR10)
- **Network Payload**: Compress sync payloads to reduce bandwidth
- **Offline Storage**: Efficient IndexedDB storage for offline queue

### Latest Technical Information

**IndexedDB Best Practices:**

1. **Database Schema**:
   - Use versioned database schema
   - Store sync queue in separate object store
   - Index by userId and timestamp for efficient queries

2. **Offline Queue**:
   - Store pending changes in IndexedDB
   - Mark items with retry count
   - Process queue when connectivity restored

3. **Background Sync**:
   - Use Service Worker `sync` event for background sync
   - Implement exponential backoff for retries
   - Show sync status to user

**Conflict Resolution Best Practices:**

1. **Last-Write-Wins Strategy**:
   - Compare `updatedAt` timestamps
   - Most recent timestamp wins
   - Show conflict notification to user

2. **Conflict Detection**:
   - Check `updatedAt` before saving
   - If `updatedAt` changed since load, conflict detected
   - Show user what was overwritten

3. **Data Consistency**:
   - Use transactions for multi-step operations
   - Ensure atomic updates
   - Rollback on error

**Sync Performance Optimization:**

1. **Incremental Sync**:
   - Only sync data changed since `lastSync` timestamp
   - Use `updatedAt` field to identify changed records
   - Reduce payload size significantly

2. **Data Compression**:
   - Compress large sync payloads
   - Use gzip compression for network transfer
   - Decompress on client side

3. **Pagination**:
   - Paginate large sync operations
   - Process in batches to avoid timeout
   - Show progress indicators

## Dev Agent Record

### Agent Model Used

Auto (Cursor AI)

### Debug Log References

N/A (Initial story creation)

### Completion Notes List

- Story file created with comprehensive developer context
- Includes existing implementation analysis
- Documents required sync infrastructure (server actions, client service, IndexedDB)
- Includes conflict resolution patterns from previous story
- References architecture patterns and best practices
- Documents performance requirements and optimization strategies

### File List

**Existing Files to Review:**

- `src/modules/auth/auth.actions.ts` - User sync logic (reference)
- `prisma/schema.prisma` - Database models
- `src/modules/flashcard/store/useFlashcardStore.ts` - Session state management
- `src/modules/study/services/study.service.ts` - Study session logic
- `docs/architecture.md` - Offline/PWA architecture

**Files to Create/Modify:**

- `src/modules/sync/sync.actions.ts` - Server actions for sync (NEW)
- `src/modules/sync/services/SyncService.ts` - Client sync service (NEW)
- `src/modules/sync/hooks/useSync.ts` - React hook for sync (NEW)
- `src/modules/sync/store/useSyncStore.ts` - Zustand store for sync state (NEW)
- `src/modules/sync/components/SyncStatus.tsx` - Sync status UI (NEW)
- `src/modules/sync/types.ts` - Sync types (NEW)
- `src/lib/schemas/sync.ts` - Sync validation schemas (NEW)
- `prisma/schema.prisma` - Add sync fields to models (MODIFY)
- `src/i18n/messages/en.json` - Add Sync namespace translations (MODIFY)
- `src/i18n/messages/vi.json` - Add Sync namespace translations (MODIFY)
- `e2e/cross-device-sync.spec.ts` - E2E tests (NEW)
- `src/modules/sync/sync.actions.test.ts` - Unit tests (NEW)
