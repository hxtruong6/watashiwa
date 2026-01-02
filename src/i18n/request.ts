import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { cache } from 'react';

import { routing } from './routing';

/**
 * Safely get cookies during prerendering.
 * Uses React's cache() to dedupe calls and properly handle promise rejections.
 * During static generation, cookies() rejects - we catch and return null.
 * This prevents the error from being logged as a HANGING_PROMISE_REJECTION.
 */
export const getCookiesSafely = cache(async () => {
	try {
		return await cookies();
	} catch {
		// During prerendering, cookies() rejects when the prerender is complete.
		// This is expected behavior - return null to indicate we're in prerendering.
		// The error is caught here to prevent it from propagating to Next.js error handling.
		return null;
	}
});

export default getRequestConfig(async () => {
	let locale: string | undefined;

	// Get locale from cookies (user preference)
	// During prerendering, this will return null and we'll use the default locale
	const cookieStore = await getCookiesSafely();
	if (cookieStore) {
		locale = cookieStore.get('NEXT_LOCALE')?.value;
	}

	// specific valid locale check
	const finalLocale =
		locale && routing.locales.includes(locale as 'vi' | 'en') ? locale : routing.defaultLocale;

	return {
		locale: finalLocale,
		messages: (await import(`./messages/${finalLocale}.json`)).default,
	};
});
