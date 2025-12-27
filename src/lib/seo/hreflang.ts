/**
 * hreflang Tag Utilities
 * For international SEO and language alternates
 */
import { SEO_CONFIG } from './constants';

export type Locale = 'vi' | 'en';

export interface HreflangLink {
	href: string;
	hreflang: string;
}

/**
 * Generate hreflang links for a page
 * @param path - The path without locale prefix (e.g., '/courses/minna-no-nihongo')
 * @param currentLocale - Current locale of the page
 * @returns Array of hreflang link objects
 */
export function generateHreflangLinks(
	path: string,
	currentLocale: Locale = SEO_CONFIG.defaultLocale,
): HreflangLink[] {
	const baseUrl = SEO_CONFIG.siteUrl;
	const cleanPath = path.startsWith('/') ? path : `/${path}`;

	return SEO_CONFIG.locales.map((locale) => ({
		href: `${baseUrl}${cleanPath}`,
		hreflang: locale === 'vi' ? 'vi-VN' : 'en-US',
	}));
}

/**
 * Generate hreflang metadata for Next.js Metadata API
 */
export function generateHreflangMetadata(path: string): {
	alternates: {
		languages: Record<string, string>;
	};
} {
	const baseUrl = SEO_CONFIG.siteUrl;
	const cleanPath = path.startsWith('/') ? path : `/${path}`;

	return {
		alternates: {
			languages: {
				'vi-VN': `${baseUrl}${cleanPath}`,
				'en-US': `${baseUrl}${cleanPath}`,
				'x-default': `${baseUrl}${cleanPath}`,
			},
		},
	};
}
