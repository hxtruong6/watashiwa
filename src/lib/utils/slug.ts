/**
 * Slug Generation Utility
 *
 * Converts titles to URL-friendly slugs with support for:
 * - Japanese character transliteration
 * - Special character handling
 * - Uniqueness validation
 */

/**
 * Simple transliteration for Japanese characters
 * For more robust handling, consider using a library like 'transliteration'
 * This is a basic fallback that handles common cases
 */
function transliterateJapanese(text: string): string {
	// Basic Japanese character handling
	// Replace common Japanese characters with romanized equivalents
	// This is a simplified version - for production, consider using a library
	return text
		.replace(/[\u3040-\u309F]/g, '') // Hiragana - remove for now
		.replace(/[\u30A0-\u30FF]/g, '') // Katakana - remove for now
		.replace(/[\u4E00-\u9FAF]/g, '') // Kanji - remove for now
		.trim();
}

/**
 * Generate a URL-friendly slug from a title
 *
 * @param title - The title to convert to a slug
 * @param existingSlugs - Array of existing slugs to check for uniqueness
 * @param maxLength - Maximum length of the slug (default: 100)
 * @returns A unique, URL-friendly slug
 */
export function generateSlug(title: string, existingSlugs: string[], maxLength = 100): string {
	if (!title || title.trim().length === 0) {
		return 'untitled';
	}

	// 1. Normalize: lowercase, trim
	let slug = title.toLowerCase().trim();

	// 2. Handle Japanese: transliterate to romanized
	// If the result is empty after transliteration, use a fallback
	const transliterated = transliterateJapanese(slug);
	if (transliterated.length > 0) {
		slug = transliterated;
	} else {
		// If all characters were Japanese, create a basic slug from first few chars
		// This is a fallback - in production you might want to use a proper transliteration library
		slug = title
			.substring(0, 20)
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.trim();
		if (slug.length === 0) {
			slug = 'untitled';
		}
	}

	// 3. Replace spaces and special chars
	slug = slug
		.replace(/\s+/g, '-') // Spaces to hyphens
		.replace(/[^\w\-]/g, '') // Remove non-word chars (keep alphanumeric and hyphens)
		.replace(/\-+/g, '-') // Multiple hyphens to one
		.replace(/^\-+|\-+$/g, ''); // Trim hyphens from start/end

	// 4. Truncate to max length
	if (slug.length > maxLength) {
		slug = slug.substring(0, maxLength);
		// Ensure we don't end with a hyphen after truncation
		slug = slug.replace(/\-+$/, '');
	}

	// 5. Ensure uniqueness
	let finalSlug = slug;
	let counter = 1;

	// Filter out null/undefined from existingSlugs
	const validExistingSlugs = existingSlugs.filter((s): s is string => Boolean(s));

	while (validExistingSlugs.includes(finalSlug)) {
		const suffix = `-${counter}`;
		const truncated = slug.substring(0, maxLength - suffix.length);
		finalSlug = `${truncated}${suffix}`;
		counter++;

		// Safety check to prevent infinite loops
		if (counter > 1000) {
			// Fallback: append timestamp
			finalSlug = `${slug.substring(0, maxLength - 15)}-${Date.now().toString().slice(-10)}`;
			break;
		}
	}

	// Final fallback if slug is empty
	if (!finalSlug || finalSlug.length === 0) {
		finalSlug = 'untitled';
	}

	return finalSlug;
}
