# State Management

**Generated:** 2025-12-29T19:51:25Z

WatashiWa uses **Zustand** for cross-route/cross-component state (especially study sessions), and local React state for UI-only concerns.

## Zustand Stores (by convention)

- **Files in `*/store/*`:** 4
- **Stores referencing `zustand`:** 4

### Store Files

- `src/modules/admin/store/useWorkbenchStore.ts`
- `src/modules/study/store/useSessionStore.ts`
- `src/modules/study/store/useStudyPreferences.ts` - Study UI preferences (furigana, romaji, audio, algorithm mode)
- `src/modules/ui/store/useUIStore.ts`

### Study Preferences Store

The `useStudyPreferences` store manages user study preferences with localStorage persistence:

- **UI Preferences**: `showFurigana`, `showRomaji`, `autoPlayAudio`, `showRatingText`
- **Card Back Settings**: `cardBackSettings` (etymology, confusions, examples visibility)
- **Algorithm Mode**: `algorithmMode` ('semantic' | 'srs') - Controls whether semantic sequencing or traditional SRS is used
  - Default: 'srs' (safe fallback)
  - Persisted to localStorage and synced to server
  - Validates stored data structure on load
  - Handles localStorage disabled/corrupted gracefully

## Other Global-ish State Patterns

- **URL state:** `nuqs` via `NuqsAdapter` in `src/app/layout.tsx`
- **i18n state:** `next-intl` request-based locale + message loading
- **Theme state:** `next-themes` + Ant Design theme tokens
