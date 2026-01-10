# Story 7.3: Mobile Related Words Bottom Sheet

Status: completed

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a mobile user,
I want to view related words in a pull-up sheet,
so that I can access extra context only when I need it, keeping the screen clean.

## Acceptance Criteria

### Interaction & Visibility

1. **Given** I am on a Mobile device (<768px)
   **And** I have revealed the answer (Back Face)
   **When** I tap the "Related Words" icon (🔗) in the specific `SubtleActionBar`
   **Then** the `RelatedWordsSheet` slides up from the bottom (FR60)
   **And** the background content is dimmed (default Ant Design Drawer mask)
   **And** the animation is smooth (<300ms)

2. **Given** the Bottom Sheet is open
   **Then** it occupies `50vh` of the screen height by default
   **And** it has a visible "drag handle" indicator at the top center
   **And** I can drag it up further to `90vh` (if content is long) or down to close

3. **Given** the Bottom Sheet is open
   **When** I tap the backdrop (dimmed area) OR swipe down on the handle
   **Then** the sheet closes completely
   **And** I return to the focused card view

### Content & Styling

1. **Given** I am viewing the sheet content
   **Then** I see the "Related Words" list (if available)
   **And** the content area is scrollable if it exceeds the sheet height
   **And** the sheet has rounded top corners (16px) matching the "Zen" aesthetic
   **And** the header is minimal (Icon + Title, no heavy borders)

### State Management

1. **Given** I navigate to the next card
   **Then** the sheet automatically closes (if open)
   **And** the state resets for the new word

## Tasks / Subtasks

- [x] Component Implementation
  - [x] Create `RelatedWordsSheet.tsx` using Ant Design `Drawer`
  - [x] Implement "Drag Handle" visual element
  - [x] Configure Drawer props (`placement="bottom"`, `height="50vh"`, `maskClosable={true}`)
- [x] Integration
  - [x] Trigger sheet opening from `SubtleActionBar` (Story 7.1 dependency)
  - [x] Pass `relatedWords` data to the sheet
- [x] Optimization
  - [x] Ensure `RelatedWordsList` is responsive (reused from Desktop sidebar but styled for mobile)
  - [x] Verify touch gesture smoothness (using native Drawer behavior)

## Dev Notes

- **File**: `src/modules/study/components/RelatedWords/RelatedWordsSheet.tsx`
- **Technical Implementation**:
  - Use `Drawer` from `antd`.
  - **Do NOT** use complex custom drag logic if `Drawer` supports basic gestures, but standard Ant Design Drawer might strictly need a close button or mask click.
  - **Refinement**: If standard Drawer lacks "snap points" (50vh -> 90vh), strictly sticking to `50vh` is acceptable for MVP, or use a simple conditional style change. The Design Spec suggests a fixed `height="50vh"` for MVP.
- **Styling**:
  - Remove default drawer header.
  - Add custom handle: `width: 40px, height: 4px, background: token.colorBorder, borderRadius: 2px`.
  - Use `token.colorBgElevated` for the sheet background to ensure it stands out from the card.
- **Responsiveness**: This component should **only** render on mobile breakpoints (controlled by `SessionController`).

### Project Structure Notes

- **New Component**: `src/modules/study/components/RelatedWords/RelatedWordsSheet.tsx`
- **Dependencies**:
  - `src/modules/study/components/RelatedWords/RelatedWordsList.tsx`

### References

- [Epic 7: Study Session UX Redesign](_bmad-output/planning-artifacts/epics.md)
- [Design Spec: RelatedWordsSheet](_bmad-output/planning-artifacts/study-session-ux-redesign.md#64-relatedwordssheet-component-mobile)

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Antigravity)

### Completion Notes List

- Defined Ant Design Drawer as the core technical solution.
- Clarified MVP scope for snap points (50vh fixed is safer for MVP than complex custom gestures).
- Aligned interactions with Story 7.1's Subtle Action Bar trigger.

### Implementation Summary

**Completed:**

- ✅ `RelatedWordsSheet.tsx` component created with Ant Design `Drawer`
- ✅ Drag handle visual element implemented (40px width, 4px height)
- ✅ Drawer configured with `placement="bottom"`, `height="50vh"`, `maskClosable={true}`
- ✅ Rounded top corners (16px) added via `styles.wrapper` for "Zen" aesthetic (AC4)
- ✅ Elevated background color (`token.colorBgElevated`) applied (Dev Notes)
- ✅ Integration with `SubtleActionBar` - triggers via `onRelatedWords` callback
- ✅ `relatedWords` data passed to sheet component
- ✅ `RelatedWordsList` reused with `variant="sheet"` for mobile styling
- ✅ Sheet automatically closes on card navigation (AC5) - implemented via `useEffect` tracking `currentCard.vocabId` changes
- ✅ State resets when sheet closes (clears `selectedRelatedWord`)

**Files Modified:**

- `src/modules/study/components/RelatedWords/RelatedWordsSheet.tsx` - Enhanced styling (rounded corners, elevated background)
- `src/modules/study/components/Session/SessionController.tsx` - Added useEffect to close sheet on card navigation

**Legacy Code:**

- `src/modules/study/components/RelatedWords/RelatedWords.tsx` - Already marked as deprecated with comprehensive comments explaining replacement components
