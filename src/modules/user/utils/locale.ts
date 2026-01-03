/**
 * Locale Utility Functions
 * Handles cookie management for next-intl locale preference
 */

export type Locale = 'en' | 'vi';

/**
 * Sets the NEXT_LOCALE cookie for next-intl
 * This cookie is read by the i18n system to determine the current locale
 *
 * @param locale - The locale to set ('en', 'vi')
 */
export function setLocaleCookie(locale: Locale): void {
	document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}
