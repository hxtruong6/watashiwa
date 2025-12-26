/**
 * Maps reaction time to FSRS rating for "Remember" action
 * This enables full 4-state SRS capacity (Again, Hard, Good, Easy) with only 2 buttons
 *
 * @param duration - Time in milliseconds from card reveal to rating selection
 * @returns FSRS rating: 2 (Hard), 3 (Good), or 4 (Easy)
 */
export function mapRememberToRating(duration: number): 2 | 3 | 4 {
	// Validate input - handle invalid/negative/too large values
	if (duration < 0 || duration > 3600000) {
		// Invalid duration (negative, too large, or system clock issue)
		// Default to Hard as safe fallback
		return 2;
	}

	// Focus Cap: If > 15s, assume user was distracted, default to GOOD
	// This prevents misclassification of slow readers or distracted users as "Hard"
	if (duration > 15000) {
		return 3; // GOOD (default for distracted users)
	}

	// Time-based mapping (based on cognitive load indicators):
	// <5s: Standard recall = GOOD (normal cognitive effort)
	// > 5s: Hesitation = HARD (high cognitive load, struggled)
	if (duration < 5000) {
		return 3; // GOOD - Standard recall speed
	}

	return 2; // HARD - User hesitated, struggled
}

/**
 * Helper to determine if duration suggests distraction
 * Used for analytics and potential future UI hints
 */
export function isLikelyDistracted(duration: number): boolean {
	return duration > 15000;
}
