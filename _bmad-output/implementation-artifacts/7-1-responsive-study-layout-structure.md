# Story 7.1: Responsive Study Layout Structure

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner studying on different devices,
I want a study interface that optimally uses my screen size (sidebar on desktop, focused view on mobile),
so that I can access related information without losing focus on the current flashcard or breaking my flow.

## Acceptance Criteria

### Desktop Layout (≥768px)

1. **Given** I am on a desktop or tablet device (width ≥ 768px)
   **When** I view a study session
   **Then** the interface displays a two-column grid layout
   **And** the main flashcard area takes the left/center space (max-width 800px)
   **And** the `StudySidebar` (320px fixed width) appears as a sticky element on the right
   **And** the sidebar slides in from the right (300ms, ease-out) after I reveal an answer (if content exists)

2. **Given** I am viewing the Flashcard on desktop
   **Then** the card height is `auto` with a `max-height` of 80vh
   **And** the content expands vertically without internal scrolling (unless exceeding 80vh)
   **And** the Example section is expanded by default (FR62)

3. **Given** I am viewing the sidebar
   **Then** it contains sections for "Related Words" and "Easily Confused" (if enabled)
   **And** I can scroll the sidebar independently if its content is long

### Mobile Layout (<768px)

1. **Given** I am on a mobile device (width < 768px)
   **When** I view a study session
   **Then** the interface displays a single-column layout
   **And** the Flashcard has a fixed height of `65vh` (FR64)
   **And** the Flashcard width is max 600px
   **And** vertical overflow within the card is scrollable

2. **Given** I reveal the answer on mobile
   **Then** a `SubtleActionBar` appears below the card (FR61)
   **And** tapping the "Related Words" (🔗) icon opens a `RelatedWordsSheet` (FR60)
   **And** this bottom sheet covers 50vh by default and is draggable to 90vh
   **And** the Example section is collapsed by default (FR62)

### Component Constraints

1. **Given** the new layout components
   **Then** `StudySidebar`, `RelatedWordsSheet`, and `SubtleActionBar` must be implemented in their respective paths (`src/modules/study/components/...`)
   **And** all new components use Ant Design tokens (NO Tailwind)
   **And** accessibility labels (ARIA) use localized strings (en/vi)

## Tasks / Subtasks

- [x] Core Component Implementation
  - [x] Create `CollapsibleSection` (`src/modules/shared/components/CollapsibleSection.tsx`)
  - [x] Create `StudySidebar` container (`src/modules/study/components/Session/StudySidebar.tsx`)
  - [x] Create `RelatedWordsSheet` (`src/modules/study/components/RelatedWords/RelatedWordsSheet.tsx`)
  - [x] Create `SubtleActionBar` (`src/modules/study/components/Session/SubtleActionBar.tsx`)
- [x] FlashCard Refactor
  - [x] Update `FlashCard.tsx` resizing logic using Ant Design `Grid.useBreakpoint` (lines ~206)
  - [ ] Update `StandardFace.tsx` to use `CollapsibleSection` for examples
- [x] Session Layout Integration
  - [x] Refactor `SessionController.tsx` to support the responsive grid (1-col mobile, 2-col desktop)
  - [x] Implement conditional rendering for Sidebar vs Action Bar based on breakpoint
  - [x] Implement slide-in animation for Desktop Sidebar
- [x] Store Updates
  - [x] Update `useStudyPreferences.ts` to persist `exampleDefaultExpanded`, `showConfusions` settings

## Dev Notes

- **Vertical Slice Architecture**: Keep study-specific components in `src/modules/study`. `FlashCard` remains in `src/modules/flashcard` but is consumed by `SessionController`.
- **Responsive Logic**: Use Ant Design's `Grid.useBreakpoint` hook for JS-level conditional rendering (Sidebar vs Sheet). Use CSS Modules/Grid for the main layout structure.
- **Animation**: Use `framer-motion` for the sidebar slide-in and miscellaneous micro-interactions (already present in the stack).
- **Styling**: strictly use `theme.useToken()` for colors (e.g., `token.colorBgContainer`, `token.colorBorderSecondary`). match the "Zen Mastery" palette.
- **Zustand**: Logic for `showConfusions` etc. should read from `useStudyPreferences` store.

### Project Structure Notes

- **New Files**:
  - `src/modules/shared/components/CollapsibleSection.tsx`
  - `src/modules/study/components/Session/StudySidebar.tsx`
  - `src/modules/study/components/Session/SubtleActionBar.tsx`
  - `src/modules/study/components/RelatedWords/RelatedWordsSheet.tsx`
- **Modified**:
  - `src/modules/flashcard/components/FlashCard.tsx`
  - `src/modules/study/components/Session/SessionController.tsx`

### References

- [PRD Study Session UX Redesign](../planning-artifacts/prd-study-session-ux-redesign.md)
- [UX Design Specification](../planning-artifacts/study-session-ux-redesign.md)
- [Architecture Ref](../planning-artifacts/architecture.md)

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Antigravity)

### Completion Notes List

- Analyzed PRD and UX specs to consolidate responsive requirements.
- Mapped component refactors to specific files.
- Ensured Vertical Slice alignment.

### Implementation Status (2026-01-XX)

**Completed:**

- ✅ All core components created (CollapsibleSection, StudySidebar, RelatedWordsSheet, SubtleActionBar)
- ✅ FlashCard responsive sizing implemented using Grid.useBreakpoint
- ✅ SessionController responsive layout (1-col mobile, 2-col desktop) implemented
- ✅ Conditional rendering for Sidebar vs Action Bar based on breakpoint
- ✅ Slide-in animation for Desktop Sidebar (framer-motion, 300ms ease-out)
- ✅ Store updated with `exampleDefaultExpanded` and `showConfusions` settings

**Remaining:**

- ⚠️ StandardFace.tsx: Example section still uses static div (lines 349-393), not CollapsibleSection
  - Current: First example is always visible (non-collapsible)
  - Required: First example should be collapsible with responsive default state (expanded on desktop, collapsed on mobile)
  - Note: "More Examples" section already uses CollapsibleSection correctly
