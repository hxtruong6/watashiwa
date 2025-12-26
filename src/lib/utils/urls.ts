/**
 * URL Generation Utilities
 *
 * Provides functions to generate URLs for courses and decks,
 * preferring slugs when available, falling back to IDs.
 */

/**
 * Generate a URL for a course
 * Prefers slug if available, otherwise uses ID
 *
 * @param course - Course object with id and optional slug
 * @returns URL path for the course
 */
export function getCourseUrl(course: { id: string; slug?: string | null }): string {
	return course.slug ? `/courses/${course.slug}` : `/courses/${course.id}`;
}

/**
 * Generate a URL for a deck
 * Prefers slug if available, otherwise uses ID
 *
 * @param deck - Deck object with id and optional slug
 * @returns URL path for the deck
 */
export function getDeckUrl(deck: { id: string; slug?: string | null }): string {
	return deck.slug ? `/decks/${deck.slug}` : `/decks/${deck.id}`;
}
