# Vocabulary Learning Mode - Feature Requirements & Technical Specs

## 1. Overview

This document outlines the requirements and technical specifications for the "Vocabulary Learning Mode" feature. The goal is to enhance the vocabulary learning experience by adding audio playback capabilities and user-customizable display settings (Furigana, Romaji, Auto-play).

## 2. Functional Requirements

### 2.1 Audio Playback

- **Per-Card Audio**: Each vocabulary card must have an associated audio track.
- **Playback Controls**: Users can play/pause the audio manually via a visible button on the card.
- **Auto-Play**: Users can enable an "Auto-play" setting. When enabled, the audio for a card should play automatically when the card is presented or flipped (depending on the learning flow).
- **Concurrency**: Only one audio track should play at a time. If a new audio starts, any currently playing audio should stop.

### 2.2 Display Settings

Users should be able to toggle the visibility of specific vocabulary details to aid in learning/reviewing:

- **Show Furigana (Reading)**: Toggle the display of Furigana (Kana reading) above or next to the Kanji.
- **Show Romaji**: Toggle the display of Romaji (script) for the vocabulary.

### 2.3 User Interface

- **Settings Controls**: A dedicated settings area (e.g., a dropdown or a separate panel) to toggle:
  - [x] Auto-play Audio
  - [x] Show Furigana
  - [x] Show Romaji
- **Responsive Design**: The UI must be mobile-friendly and responsive.
- **Visual Feedback**: The play button should verify playback state (loading, playing, paused).

## 3. Technical Specifications

### 3.1 Data Model

The `Vocab` data structure needs to support the new fields.
_Existing fields_: `kanji`, `reading` (Furigana), `meaning`.
_New fields required_:

- `audioUrl`: String (URL to the audio file).
- `romaji`: String (Romaji text).

### 3.2 Component Architecture

#### `VocabCard` Component

Location: `src/components/VocabCard.tsx`

- **Props Update**:

  ```typescript
  interface VocabCardProps {
  	card: {
  		vocab: {
  			kanji: string;
  			reading: string; // Furigana
  			meaning: string;
  			romaji?: string; // New
  			audioUrl?: string; // New
  			// ... other existing fields
  		};
  	};
  	showAnswer: boolean;
  	// Settings Props
  	showFurigana: boolean;
  	showRomaji: boolean;
  	autoPlayAudio: boolean;
  }
  ```

- **Audio Logic**:
  - Use HTML5 `<audio>` element or `new Audio()` API.
  - `useEffect` to trigger playback if `autoPlayAudio` is true and the card becomes active.

#### `VocabSettings` Component (New or Integrated)

- A simple control panel to manage the boolean states for `showFurigana`, `showRomaji`, and `autoPlayAudio`.
- Ideally lifted state up to the parent page (e.g., `StudyPage`) to persist across cards.

### 3.3 Implementation Details

- **Audio Handling**:
  - Ensure `preload="none"` or `metadata` to save bandwidth.
  - Handle play errors (e.g., browser autoplay policies) gracefully.
- **Styling**:
  - Use `antd` components (`Button`, `Switch`, `Typography`) to maintain consistency with the existing design.
  - Ensure clean alignment of Kanji, Furigana, and Romaji.

## 4. User Flow

1. User enters "Study" or "Review" mode.
2. User sees the front of the card (Kanji).
   - _If Auto-play is ON_: Audio plays immediately.
   - _If Show Furigana is ON_: Furigana is visible.
   - _If Show Romaji is ON_: Romaji is visible.
3. User can click "Play Audio" manually at any time.
4. User flips the card to see the meaning and examples.
