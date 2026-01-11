/**
 * Locale Utilities for SEO Metadata
 * Safe locale detection for generateMetadata functions
 *
 * IMPORTANT: Metadata Best Practices
 * ===================================
 *
 * When to use STATIC metadata (`export const metadata`):
 * - Page content is static (doesn't change based on user/cookies)
 * - Metadata doesn't need to vary by locale (or you're okay with default locale)
 * - You want to avoid Sentry interception issues with crypto.randomUUID()
 * - Page is public and doesn't require authentication
 *
 * When to use DYNAMIC metadata (`generateMetadata()` function):
 * - Page metadata needs to vary by user locale (from cookies)
 * - Page metadata depends on route parameters (`params`)
 * - Page metadata needs to fetch data from database
 * - Page requires authentication-specific metadata
 *
 * If using generateMetadata(), you MUST:
 * 1. Call `ensureRequestDataAccess()` at the very start, OR
 * 2. Access `cookies()` directly before any other operations
 *
 * This ensures Next.js requirement is satisfied before Sentry intercepts.
 *
 * See: docs/guides/metadata-best-practices.md for full documentation
 */
import { routing } from '@/i18n/routing';
import { cookies } from 'next/headers';

export type Locale = 'vi' | 'en';

/**
 * Ensure request data is accessed before any crypto operations.
 * This must be called at the very start of generateMetadata() functions
 * to satisfy Next.js's requirement when Sentry or other instrumentation
 * uses crypto.randomUUID() internally.
 *
 * @returns Promise that resolves when cookies are accessed (or rejects during prerendering)
 */
export async function ensureRequestDataAccess(): Promise<void> {
	try {
		await cookies();
	} catch {
		// During prerendering, cookies() rejects - this is expected
	}
}

/**
 * Get the current locale from request context.
 * Falls back to default locale during prerendering or if request context is unavailable.
 *
 * This function is safe to use in generateMetadata functions.
 * During static generation/prerendering, it will return the default locale.
 *
 * IMPORTANT: This function accesses cookies() directly BEFORE any crypto operations,
 * which satisfies Next.js's requirement for crypto.randomUUID() usage.
 *
 * @returns Promise resolving to the current locale ('vi' | 'en')
 */
export async function getLocaleForMetadata(): Promise<Locale> {
	try {
		// Access cookies() FIRST - this satisfies Next.js's requirement that
		// request data must be accessed before any crypto.randomUUID() calls
		// (which may happen internally in metadata processing or Sentry instrumentation)
		const cookieStore = await cookies();
		const locale = cookieStore.get('NEXT_LOCALE')?.value;

		// Validate locale is one of our supported locales
		if (locale && routing.locales.includes(locale as 'vi' | 'en')) {
			return locale as Locale;
		}

		// Fall back to default locale
		return routing.defaultLocale as Locale;
	} catch {
		// During prerendering, cookies() rejects when prerender is complete.
		// This is expected - fall back to default locale
		return routing.defaultLocale as Locale;
	}
}
