# Feature Spec: Smart Layer - Active Priming (v2)

## 1. Overview

**Goal:** Replace passive "Vocabulary Lists" with "Context First" learning.
**Concept:** Users encounter new words in a meaningful "Mini-Story" (Priming) before drilling them as flashcards.

## 2. User Flow

1. **Entry:** User taps "Start Unit 5".
2. **Priming View:**
   - Full-screen text appears (Chat style or Article style).
   - ~150 words long. Use 80% known words + 20% target words.
   - Target words are **Highlighted** (Indigo color).
3. **Interaction:**
   - User taps a Highlight -> Brief Tooltip (Meaning + Reading) appears.
   - **Gatekeeper:** "Start Flashcards" button is DISABLED until user interacts with at least 3 highlights OR scrolls to bottom.
4. **Transition:** Tapping "Start" moves to standard Flashcard session.

## 3. Data Structure (Hybrid SQL)

**Model:** `Story` (Prisma)
**Payload:** `content` (JSONB)

```json
{
	"title": { "vi": "Đi chợ", "en": "Going to Market" },
	"body": [
		{ "text": "Hôm nay tôi đi ", "type": "text" },
		{ "text": "siêu thị", "type": "vocab", "vocabId": "uuid-1", "tooltip": "Supermarket" },
		{ "text": " để mua ", "type": "text" },
		{ "text": "táo", "type": "vocab", "vocabId": "uuid-2", "tooltip": "Apple" }
	]
}
```

## 4. UI Components

- `PrimingContainer`: The main wrapper.
- `InteractiveText`: Renders the JSON body. Handles tap events.
- `VocabTooltip`: Small popover with minimal info (Kanji + Meaning).

## 5. Success Metrics

- **Click-through Rate:** % of highlights tapped.
- **Time on Screen:** Should be > 30s for a 150-word story.
