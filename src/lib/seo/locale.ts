/**
 * Locale Utilities for SEO Metadata
 * Safe locale detection for generateMetadata functions
 */
import { routing } from '@/i18n/routing';
import { getLocale } from 'next-intl/server';

export type Locale = 'vi' | 'en';

/**
 * Get the current locale from request context.
 * Falls back to default locale during prerendering or if request context is unavailable.
 *
 * This function is safe to use in generateMetadata functions.
 * During static generation/prerendering, it will return the default locale.
 *
 * @returns Promise resolving to the current locale ('vi' | 'en')
 */
export async function getLocaleForMetadata(): Promise<Locale> {
	try {
		// Try to get locale from request context (cookies)
		const locale = await getLocale();
		// Validate locale is one of our supported locales
		if (locale === 'vi' || locale === 'en') {
			return locale;
		}
		// If invalid, fall back to default
		return routing.defaultLocale as Locale;
	} catch {
		// During prerendering, getLocale() may fail
		// Fall back to default locale
		return routing.defaultLocale as Locale;
	}
}
