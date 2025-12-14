# Design Spec: Flashcard Image Experience

## 1. Overview

This document defines the UI/UX for displaying user-uploaded images within the Study (Flashcard) experience. The design adheres to the **"Zen Mastery"** design system, prioritizing minimalism and cognitive focus.

## 2. Design Philosophy

- **"Invisible until needed"**: Images should not clutter the prompting phase (Front of card) unless they are the prompt (future feature). For now, they serve as **Context** and **Enrichment** for the Meaning (Back of card).
- **Mobile First**: Optimized for vertical scrolling and "Thumb Zone" interactions.
- **Performance**: Lazy loading and optimized sizing.

## 3. Layout Specification

### A. Question Mode (Front)

- **Status**: Hidden.
- **Rationale**: The user focuses on the Kanji/Word recognition.
- **Future Consideration**: A small "image available" indicator (e.g., small icon) could be added if users request it, but we start with hidden to maintain Zen minimalism.

### B. Answer Mode (Back)

- **Placement**:
  - **Vocab Cards**: Between the **Word Surface** (Kanji/Kana) and the **Meaning**.
  - **Kanji Cards**: Below the **Kanji**, above the **Meaning** or **Onyomi/Kunyomi**.
- **Dimensions**:
  - **Mobile**: `max-height: 200px`, `width: 100%`, `object-fit: contain`.
  - **Desktop**: `max-height: 260px`, `max-width: 100%`.
- **Styling**:
  - `borderRadius`: `12px` (slightly softer than the standard 8px for media).
  - `boxShadow`: `0 4px 12px rgba(0,0,0,0.05)` (Subtle lift).
  - `background`: `rgba(0,0,0,0.02)` (Placeholder background while loading).
- **Interaction**:
  - **Tap/Click**: Opens a full-screen distinct modal (Zoom view) for detail inspection.

## 4. Technical Implementation

### Component: `FlashCard.tsx`

- **Props**: Destructure `imageUrl` from `card.vocab` and `card.kanji`.
- **Render Logic**:

  ```tsx
  {showAnswer && imageUrl && (
    <div className="flashcard-image-container">
      <img src={imageUrl} ... />
    </div>
  )}
  ```

- **Animations**: Use `framer-motion` (if already installed) or CSS transitions to fade in the image smoothly when `showAnswer` becomes true.

### Responsive Adjustments

- Use standard Ant Design `Flex` or CSS Flexbox.
- Ensure the image does not push the "Rating Bar" (if fixed) or "Examples" too far down on small screens (iPhone SE).

## 5. Accessibility

- **Alt Text**: Use the Word/Kanji as the alt text (e.g., "Image for [Word]").
- **Keyboard**: Ensure the Zoom modal can be closed with `Esc`.
