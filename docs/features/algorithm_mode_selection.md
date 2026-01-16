# Feature: Algorithm Mode Selection

**Status**: Implemented  
**Last Updated**: 2025-01-XX

## Overview

Users can switch between two algorithm modes for study sessions:

1. **Semantic Mode**: Groups related words together based on etymology, confusion pairs, and deck context for better learning connections
2. **SRS Mode**: Traditional spaced repetition system that prioritizes due reviews and new cards based on timing

## User Experience

### Accessing Algorithm Mode Settings

- **Location**: Study Settings drawer (accessible during active session)
- **Component**: `AlgorithmModeSelector` in `src/modules/study/components/Session/AlgorithmModeSelector.tsx`
- **UI**: Ant Design `Segmented` component with tooltip explaining each mode

### Mode Switching Behavior

- **Immediate Effect**: Mode change applies to the next word in the queue
- **Offline Support**: Changes are saved locally immediately, synced to server when online
- **Retry Logic**: Failed syncs are retried up to 3 times with exponential backoff
- **Loading State**: Visual indicator (spinner) shows during server sync

## Technical Implementation

### State Management

- **Store**: `useStudyPreferences` in `src/modules/study/store/useStudyPreferences.ts`
- **Persistence**: localStorage with validation and error handling
- **Default**: 'srs' (safe fallback)

### Server Integration

- **Action**: `updateAlgorithmModePreference` in `src/modules/study/study.actions.ts`
- **Storage**: User.preferences JSONB field in database
- **Queue Generation**: `fetchSessionAction` in `src/modules/flashcard/flashcard.actions.ts` respects algorithm mode

### Queue Generation Logic

```typescript
// Simplified flow
if (algorithmMode === 'semantic') {
	// Apply semantic sequencing
	queue = await getSemanticallySequencedQueue(fsrsQueue, options);
} else {
	// Use FSRS queue as-is
	queue = fsrsQueue;
}
```

## Edge Cases Handled

1. **localStorage Disabled**: Falls back to in-memory state only
2. **Corrupted localStorage Data**: Validates structure, resets to defaults if invalid
3. **Network Failure**: Retries with exponential backoff, preference saved locally
4. **Mid-Session Switch**: Next queue fetch uses new mode (current card preserved)
5. **Concurrent Switches**: Zustand handles atomically

## Accessibility

- **ARIA Labels**: Icon button has descriptive label
- **Keyboard Navigation**: Segmented component supports keyboard navigation
- **Screen Readers**: Tooltip content is accessible

## Internationalization

All user-facing strings are translated:

- English: `messages/en.json` under "Study" namespace
- Vietnamese: `messages/vi.json` under "Study" namespace

## Analytics

Mode switches are tracked via `trackEvent('algorithm_mode_switched', {...})` with:

- `from_mode`: Previous mode
- `to_mode`: New mode
- `switch_reason`: Context (e.g., 'user_preference')
