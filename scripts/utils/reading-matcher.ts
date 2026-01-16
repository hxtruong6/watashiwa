/**
 * Reading Matcher Utility
 *
 * Matches word readings to kanji readings to determine active reading type
 *
 * This is a heuristic-based approach. Perfect matching is difficult due to:
 * - Irregular readings
 * - Rendaku (voiced sounds)
 * - Historical sound changes
 */
// ReadingType type - matches Prisma enum
type ReadingType = 'ONYOMI' | 'KUNYOMI' | 'IRREGULAR';

export interface ReadingMatchResult {
	success: boolean;
	reading: string;
	type: ReadingType;
}

/**
 * Convert romaji to hiragana (simplified - may need more robust implementation)
 */
function toHiragana(romaji: string): string {
	// This is a simplified conversion - a full implementation would need
	// a comprehensive romaji-to-hiragana mapping
	// For MVP, we'll work with the readings as-is and match directly
	return romaji.toLowerCase();
}

/**
 * Match kanji reading to word reading
 *
 * @param fullReading - The full word reading in hiragana (e.g., 'せんせい')
 * @param onyomi - Array of On'yomi readings in romaji (e.g., ['SEN'])
 * @param kunyomi - Array of Kun'yomi readings in hiragana/romaji (e.g., ['saki'])
 * @param position - Position of kanji in word (0-indexed)
 * @returns Match result with reading and type
 */
export function matchKanjiReadings(
	fullReading: string,
	onyomi: string[],
	kunyomi: string[],
	position: number,
): ReadingMatchResult {
	// Normalize the full reading
	const normalizedReading = fullReading.toLowerCase();

	// Try On'yomi first (more common in compound words)
	// Convert On'yomi to hiragana for comparison
	for (const reading of onyomi) {
		const hiraganaOn = toHiragana(reading);
		// Simple heuristic: check if reading starts at position
		// This is simplified - real implementation would need syllable matching
		if (normalizedReading.includes(hiraganaOn)) {
			return {
				success: true,
				reading: reading.toUpperCase(),
				type: 'ONYOMI',
			};
		}
	}

	// Try Kun'yomi
	for (const reading of kunyomi) {
		const normalizedKun = reading.toLowerCase();
		if (normalizedReading.includes(normalizedKun)) {
			return {
				success: true,
				reading: reading,
				type: 'KUNYOMI',
			};
		}
	}

	// No match found - mark as irregular
	return {
		success: false,
		reading: fullReading, // Use full reading as fallback
		type: 'IRREGULAR',
	};
}
