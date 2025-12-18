# UX Enhancement Scenarios: Mobile Interaction & Accessibility

This document outlines key considerations for optimizing the mobile experience, specifically addressed to improve reachability, prevent conflicts, and enhance "native feel" on the web.

## 1. Reachability & Handedness (The "Thumb Zone")

**Problem**: Mobile screens are getting larger. Controls at the top corners or far edges are difficult to reach with one hand.
**Scenarios**:

- **Right-Handed Use**: Top-Left is the "Hard Zone". Bottom-Right is the "Natural Zone".
- **Left-Handed Use**: Top-Right is the "Hard Zone". Bottom-Left is the "Natural Zone".
- **One-Handed vs Two-Handed**: One-handed usage is common in transit (standing in train).

**Enhancements**:

- **Vertical Stacks**: Stacking buttons vertically (full width) puts them all in the central thumb zone, requiring only vertical movement (easy) rather than horizontal/diagonal reach (hard).
- **Bottom Navigation**: Critical actions should be in the bottom 30% of the screen.
- **Floating Action Buttons (FAB)**: Placed within easy reach of the thumb.

## 2. Touch Targets & Conflict Resolution

**Problem**: "Double Tap" requirements and accidental text selection.
**Scenarios**:

- **Text Selection**: Long-pressing or double-tapping buttons often triggers browser text selection instead of the action.
  - _Fix_: `user-select: none` on interactive elements.
- **Event Bubbling**: Tapping a button inside a clickable container (or overlay) might trigger the parent's action (e.g., closing a menu) before the button's action.
  - _Fix_: `e.stopPropagation()` on touch/click events.
- **The "300ms Delay"**: Mobile browsers traditionally wait 300ms to see if a tap is a double-tap (zoom).
  - _Fix_: `touch-action: manipulation` or modern frameworks usually handle this, but explicit handling helps.

## 3. Visual Feedback & "Native Feel"

**Problem**: Web apps often feel "flat" compared to native apps.
**Enhancements**:

- **Active States**: Immediate visual feedback on touch start (active state in CSS).
- **Haptic Feedback**: Use `navigator.vibrate()` (if supported) for tactile confirmation of actions (e.g., submitting an answer).
- **Transitions**: Smooth, hardware-accelerated transitions (transform/opacity) instead of layout shifts (width/height).

## 4. Current Implementation Status (WatashiWa)

| Feature                     | Status | Notes                                       |
| :-------------------------- | :----- | :------------------------------------------ |
| **No Text Selection**       | ✅     | Applied to Rating Buttons & Answers         |
| **No Event Bubbling**       | ✅     | Applied to Rating Bar (fixes "Double Tap")  |
| **Vertical Stack (Mobile)** | ✅     | Applied to Rating Bar & Exercise Options    |
| **Reachability**            | ⚠️     | Back Button is Top-Left (Hard for Righties) |

## 5. Future Recommendations

1. **Haptic Feedback**: Add `navigator.vibrate(10)` on button clicks for subtle feedback.
2. **Swipe Gestures**: Implement "Swipe Left/Right" for Next/Back navigation in decks.
3. **Bottom Back Button**: Consider moving the "Exit/Back" button to the bottom bar or using a swipe-down gesture to close modals.
