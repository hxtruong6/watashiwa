/**
 * URL Generation Utilities
 *
 * Provides functions to generate URLs for courses and decks.
 * Slugs are required - all URLs use slugs exclusively.
 */

/**
 * Generate a URL for a course
 *
 * @param course - Course object with required slug
 * @returns URL path for the course
 * @throws Error if slug is missing
 */
export function getCourseUrl(course: { slug: string }): string {
	if (!course.slug) {
		throw new Error('Course must have a slug');
	}
	return `/courses/${course.slug}`;
}

/**
 * Generate a URL for a deck
 *
 * @param deck - Deck object with required slug
 * @returns URL path for the deck
 * @throws Error if slug is missing
 */
export function getDeckUrl(deck: { slug: string }): string {
	if (!deck.slug) {
		throw new Error('Deck must have a slug');
	}
	return `/decks/${deck.slug}`;
}
