# Feature: Audio Playback for Study Session

## 1. Overview

Enable users to listen to the pronunciation of vocabulary and example sentences during study sessions. This feature improves listening comprehension and reinforces memory through multi-sensory learning ("Golden Time" principle).

## 2. Goals

- **Listening Mastery**: Allow users to hear native or synthesized pronunciation.
- **Hands-free Learning**: Support auto-play so users can focus on the card without clicking.
- **Customization**: Allow users to adjust speed, voice, and auto-play triggers to suit their level.

## 3. User Scenarios

### Scenario A: The "Flow" State (Auto-play)

1. User studies a card in **Question Mode**.
2. User presses `Space` or clicks "Show Answer".
3. The card flips to **Answer Mode**.
4. **Action**: The Japanese vocabulary audio plays automatically.
5. User rates the card and moves to the next one seamlessly.

### Scenario B: Active Listening (Manual)

1. User wants to repeat the pronunciation.
2. User hovers over the vocabulary or sentence.
3. A subtle **Speaker Icon** appears (or is always visible but unobtrusive).
4. User clicks the icon.
5. Audio plays immediately.

### Scenario C: Listening Practice (Question Mode)

1. User configures settings to "Play Audio in Question Mode".
2. A new card appears.
3. Audio plays *before* the answer is revealed.
4. User guesses the meaning based on sound (creating a "listening" flashcard).

## 4. UI/UX Design ("Zen Mastery" & "Invisible")

### 4.1. Audio Controls

- **Icon**: Use Ant Design `SoundOutlined`.
- **Placement**:
  - **Vocab**: To the right of the main Kanji/Word. Size: `20px` (Small, non-distracting).
  - **Sentence**: Detailed view, next to the sentence.
- **State Feedback**:
  - **Idle**: Opacity 0.6 (Subtle).
  - **Hover**: Opacity 1.0, Scale 1.1.
  - **Playing**: Pulse animation (Color: `colorPrimary`).
  - **Unavailable**: Hidden or Disabled state.

### 4.2. Settings Configuration

Add a new section to the **Study Settings** modal:

| Setting | Description | Default |
| :--- | :--- | :--- |
| **Auto-play Audio** | Toggle: Off / Answer Side / Question Side | `Answer Side` |
| **Example Audio** | Auto-play example sentence audio too? | `Off` |
| **Playback Speed** | Slider: 0.5x to 1.5x | `1.0x` |
| **Voice** | Dropdown: Browser-provided JA voices | `Auto` |

## 5. Technical Specification

### 5.1. Tech Stack

- **Web Speech API**: `window.speechSynthesis` & `SpeechSynthesisUtterance`.
- **No External Assets**: No MP3 files needed; reduces bandwidth and storage.

### 5.2. `useAudioPlayer` Hook

Encapsulate logic in a React Hook:

```typescript
const { speak, stop, isPlaying, voices } = useAudioPlayer({
  text: string,
  lang: 'ja-JP',
  rate: number, // 0.8 for slower learning
});
```

### 5.3. Voice Selection Logic

1. Fetch `window.speechSynthesis.getVoices()`.
2. Filter for `lang === 'ja-JP'`.
3. Prioritize "Google 日本語" or "Microsoft Ichiro" if available.
4. Fallback: Any available JP voice.

### 5.4. Error Handling

- If `speechSynthesis` is not supported (rare), hide the audio features silently.
- If play fails (e.g., user didn't interact with document), show a gentle toast: "Click to enable audio".

## 6. User Flow Diagram

```mermaid
graph TD
    A[Study Session Start] --> B{Auto-play Setting?}
    B -- Question Side --> C[Play Audio Immediately]
    B -- Answer Side --> D[Wait for Reveal]
    B -- Off --> E[Silent]

    C --> F[User Interaction (Reveal)]
    D --> F
    E --> F

    F --> G{Auto-play Answer?}
    G -- Yes --> H[Play Audio]
    G -- No --> I[Silent]

    I --> J[User Clicks Speaker Settings]
    H --> K[Rate Card]
    J --> H
```
