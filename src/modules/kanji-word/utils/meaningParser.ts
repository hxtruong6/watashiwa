/**
 * Meaning Parser Utility
 *
 * Extracts and parses vocabulary meanings from JSONB format
 * Handles multiple language keys and fallbacks
 */
import type { Vocabulary } from '@prisma/client';

export interface ParsedMeanings {
	en: string;
	vi: string;
}

/**
 * Parse vocabulary meanings from JSONB format
 * Supports multiple language key formats (en/english, vi/vietnamese)
 *
 * @param vocab - Vocabulary object with meanings JSONB field
 * @returns Parsed meanings with English and Vietnamese translations
 *
 * @example
 * ```typescript
 * const meanings = parseVocabularyMeanings(vocab);
 * // { en: "School", vi: "Trường học" }
 * ```
 */
export function parseVocabularyMeanings(vocab: Vocabulary | null): ParsedMeanings {
	if (!vocab || !vocab.meanings) {
		return {
			en: 'No meaning',
			vi: 'Không có nghĩa',
		};
	}

	const meanings = vocab.meanings as Record<string, string[]> | null;

	if (!meanings) {
		return {
			en: 'No meaning',
			vi: 'Không có nghĩa',
		};
	}

	// Support multiple key formats
	const meaningEn =
		meanings.en?.[0] || meanings.english?.[0] || meanings.English?.[0] || 'No meaning';
	const meaningVi =
		meanings.vi?.[0] || meanings.vietnamese?.[0] || meanings.Vietnamese?.[0] || 'Không có nghĩa';

	return {
		en: meaningEn,
		vi: meaningVi,
	};
}
