# Feature Spec: Smart Layer - Dynamic Variants (The CUBE)

## 1. Overview

**Goal:** Eliminate "Pattern Matching" (remembering the card, not the word).
**Concept:** One word has multiple "Faces". The "Smart Layer" decides which Face to show based on the User's SRS Stage.

## 2. Variant Matrix

| SRS Stage        | Variant Type        | Front Content  | Back Content       | Cognitive Load     |
| ---------------- | ------------------- | -------------- | ------------------ | ------------------ |
| **0 (New)**      | `BASIC`             | Kanji + Audio  | Meaning + Hán Việt | Low (Acquisition)  |
| **1 (Learning)** | `AUDIO_MATCH`       | Audio Only     | 4 Images/Meanings  | Medium (Listening) |
| **2 (Review)**   | `CONTEXT_SENTENCE`  | "Tôi ăn [___]" | "Ringo" (Kanji)    | High (Recall)      |
| **3 (Master)**   | `SPEAKING` (Future) | Kanji          | Voice Input        | Max (Production)   |
| **Leech**        | `INTERVENTION`      | Split View     | Comparison         | Remedial           |

## 3. Selection Logic

```typescript
function getNextVariant(userReview: UserReview): VariantType {
	if (userReview.srsStage === 0) return VariantType.BASIC;

	if (userReview.srsStage === 1) {
		return Math.random() > 0.5 ? VariantType.BASIC : VariantType.AUDIO_MATCH;
	}

	// Review Stage: Mix it up to test flexibility
	if (userReview.srsStage >= 2) {
		return VariantType.CONTEXT_SENTENCE;
	}
}
```

## 4. Payload Structure (`CardVariant`)

```json
// CONTEXT_SENTENCE Payload
{
	"question": {
		"vi": "Hôm nay tôi ăn [___] ngon quá.",
		"en": "I ate delicious [___] today."
	},
	"answer": {
		"word": "táo",
		"kanji": "林檎"
	},
	"distractors": ["lê", "cam"]
}
```
