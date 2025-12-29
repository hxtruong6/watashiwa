# State Management

**Generated:** 2025-12-29T19:51:25Z

WatashiWa uses **Zustand** for cross-route/cross-component state (especially study sessions), and local React state for UI-only concerns.

## Zustand Stores (by convention)

- **Files in `*/store/*`:** 4
- **Stores referencing `zustand`:** 4

### Store Files

- `src/modules/admin/store/useWorkbenchStore.ts`
- `src/modules/study/store/useSessionStore.ts`
- `src/modules/study/store/useStudyPreferences.ts`
- `src/modules/ui/store/useUIStore.ts`

## Other Global-ish State Patterns

- **URL state:** `nuqs` via `NuqsAdapter` in `src/app/layout.tsx`
- **i18n state:** `next-intl` request-based locale + message loading
- **Theme state:** `next-themes` + Ant Design theme tokens

