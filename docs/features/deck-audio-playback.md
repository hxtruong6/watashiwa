# Deck Audio Playback Feature Design

## Overview

Add audio playback controls to the Deck View that allow users to:

1. Play all vocabulary words in the current list sequentially
2. Toggle repeat mode to loop the entire list
3. Control playback settings via icon toggles

## User Stories

### US-1: Play All Words

**As a** language learner  
**I want to** click a play icon next to the deck title  
**So that** I can hear all vocabulary words in the current list read aloud automatically

**Acceptance Criteria:**

- Play icon appears next to "Deck Contents" title
- Clicking play reads all words in the current active tab (vocab/story)
- Only vocabulary words are read (stories are skipped)
- Uses `wordReading` if available, falls back to `wordSurface`
- Play icon changes to pause/stop icon while playing
- User can stop playback at any time

### US-2: Repeat Mode Toggle

**As a** language learner  
**I want to** toggle a "repeat" setting  
**So that** the audio playback loops through the entire list continuously

**Acceptance Criteria:**

- Repeat toggle appears in settings bar (next to "Show Meaning")
- Toggle state persists during session (local state)
- When enabled, playback loops through entire list indefinitely
- User can stop playback at any time
- Visual indicator shows when repeat is active

### US-3: Settings Icons

**As a** language learner  
**I want to** see icon-only buttons for settings  
**So that** the UI is cleaner and more space-efficient

**Acceptance Criteria:**

- "Show Meaning" becomes icon-only button (eye icon)
- "Repeat" becomes icon-only button (repeat/loop icon)
- Tooltips explain what each button does
- Icons change state to show active/inactive
- Settings bar remains responsive on mobile

## Technical Design

### Component Architecture

```
DeckContentTabs
├── Title with Play Button
│   └── PlayAllButton (new component)
└── Settings Bar
    ├── ShowMeaningButton (refactored to icon-only)
    ├── RepeatToggleButton (new)
    └── ViewModeSegmented (unchanged)
```

### State Management

**Local State (useDeckViewState):**

- `showMeaning: boolean` (existing)
- `repeatPlayback: boolean` (new)
- `isPlayingAll: boolean` (new - tracks if play-all is active)
- `currentPlayIndex: number` (new - tracks current word being played)

**Audio Playback Logic:**

- Use existing `useAudioPlayer` hook
- Queue words sequentially
- Handle repeat mode with loop logic
- Clean up on unmount or tab change

### Data Flow

1. User clicks play icon → `handlePlayAll()` triggered
2. Extract current vocabulary list from active tab
3. Filter to only vocabulary items (skip stories)
4. Start playback queue
5. For each word:
   - Use `wordReading` if available, else `wordSurface`
   - Call `speak()` from `useAudioPlayer`
   - Wait for `onend` event before next word
6. If `repeatPlayback` is true, loop back to start
7. User can stop at any time via stop button

### UI/UX Considerations

**Play Button States:**

- **Idle**: `<PlayCircleOutlined />` (outlined, default color)
- **Playing**: `<PauseCircleOutlined />` (filled, primary color, animated pulse)
- **Stopped**: `<StopOutlined />` (when user stops mid-playback)

**Settings Icons:**

- **Show Meaning**: `<EyeOutlined />` (active) / `<EyeInvisibleOutlined />` (inactive)
- **Repeat**: `<ReloadOutlined />` (inactive) / `<ReloadOutlined spin />` (active, spinning)

**Accessibility:**

- All buttons have `aria-label` attributes
- Tooltips on hover for icon-only buttons
- Keyboard navigation support
- Screen reader announcements for playback state

**Mobile:**

- Icons remain visible but may stack on very small screens
- Play button in title remains accessible
- Touch targets meet minimum 44x44px requirement

### Edge Cases

1. **Empty List**: Disable play button if no vocabulary items
2. **Tab Switch**: Stop playback when switching tabs
3. **Component Unmount**: Clean up audio on unmount
4. **No Reading Available**: Fallback to `wordSurface` gracefully
5. **Browser Audio Policy**: Handle autoplay restrictions gracefully
6. **Multiple Clicks**: Prevent queueing multiple playbacks

### Performance

- Use `useCallback` for event handlers
- Debounce rapid clicks on play button
- Clean up audio on unmount
- Use `useMemo` for filtered vocabulary list

## Implementation Plan

### Phase 1: Refactor Settings Bar

1. Extract `ShowMeaningButton` to icon-only component
2. Create `RepeatToggleButton` component
3. Update `DeckContentTabs` to use new button components

### Phase 2: Play All Functionality

1. Create `PlayAllButton` component
2. Add to title section in `DeckContentTabs`
3. Implement playback queue logic
4. Add state management for playback

### Phase 3: Integration & Polish

1. Connect all components
2. Add tooltips and accessibility
3. Test edge cases
4. Add loading/error states

## Success Metrics

- Users can successfully play all words in a list
- Repeat mode works as expected
- Settings are intuitive and discoverable
- No performance degradation with large lists (100+ words)
- Accessibility score remains high
