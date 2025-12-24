import { Card, FSRS, Grade, Rating } from 'ts-fsrs';

/**
 * Configured FSRS Instance
 * Retention configured for 90% (Standard for language learning)
 */
export const fsrs = new FSRS({
	request_retention: 0.9,
	maximum_interval: 365,
	w: [
		0.40255, 1.18385, 3.173, 15.69105, 7.19605, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925,
		1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621,
	],
	enable_fuzz: true,
});

/**
 * Maps our UI Rating (1-4) to FSRS Grade
 * 1: Again (Forgot)
 * 2: Hard (Struggled)
 * 3: Good (Recalled)
 * 4: Easy (Instant)
 */
export function mapRatingToFSRS(rating: number): Grade {
	switch (rating) {
		case 1:
			return Rating.Again;
		case 2:
			return Rating.Hard;
		case 3:
			return Rating.Good;
		case 4:
			return Rating.Easy;
		default:
			return Rating.Good;
	}
}

/**
 * Determines the simplified "SRS Stage" (0-3) from the FSRS Card State
 * Used for simple UI feedback (New, Learning, Review, Mastered)
 */
export function getSRSStage(card: Card): number {
	if (card.state === 0) return 0; // New
	if (card.state === 1) return 1; // Learning
	if (card.state === 2) return 2; // Review
	if (card.state === 3) return 3; // Relearning (treat as Review/Learning)
	return 2;
}
