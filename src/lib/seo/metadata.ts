/**
 * SEO Metadata Utilities
 * Type-safe metadata generation helpers for Next.js App Router
 */
import type { Metadata } from 'next';

import { ASSET_PATHS, SEO_CONFIG, SEO_DEFAULTS } from './constants';

export type Locale = 'vi' | 'en';

export interface MetadataOptions {
	title?: string;
	description?: string;
	keywords?: string[];
	image?: string;
	url?: string;
	type?: 'website' | 'article' | 'profile';
	locale?: Locale;
	noindex?: boolean;
	nofollow?: boolean;
	canonical?: string;
}

/**
 * Generate complete metadata object for a page
 */
export function generatePageMetadata(options: MetadataOptions = {}): Metadata {
	const {
		title,
		description,
		keywords,
		image = ASSET_PATHS.logo.large,
		url,
		type = 'website',
		locale = SEO_CONFIG.defaultLocale,
		noindex = false,
		nofollow = false,
		canonical,
	} = options;

	const siteUrl = SEO_CONFIG.siteUrl;
	const fullTitle = title ? `${title} | ${SEO_CONFIG.siteName}` : SEO_DEFAULTS.title[locale];
	const fullDescription = description || SEO_DEFAULTS.description[locale];
	const fullKeywords = keywords || SEO_DEFAULTS.keywords[locale];
	const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
	const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;
	const canonicalUrl = canonical ? `${siteUrl}${canonical}` : fullUrl;

	const metadata: Metadata = {
		metadataBase: new URL(siteUrl),
		title: fullTitle,
		description: fullDescription,
		keywords: fullKeywords as string[],
		alternates: {
			canonical: canonicalUrl,
			languages: {
				'vi-VN': `${siteUrl}${url || ''}`,
				'en-US': `${siteUrl}${url || ''}`,
				'x-default': `${siteUrl}${url || ''}`,
			},
		},
		openGraph: {
			title: fullTitle,
			description: fullDescription,
			url: fullUrl,
			siteName: SEO_CONFIG.siteName,
			images: [
				{
					url: fullImage,
					width: 1200,
					height: 630,
					alt: title || SEO_CONFIG.siteName,
				},
			],
			locale: locale === 'vi' ? 'vi_VN' : 'en_US',
			type,
		},
		twitter: {
			card: 'summary_large_image',
			title: fullTitle,
			description: fullDescription,
			images: [fullImage],
			creator: SEO_CONFIG.twitterHandle,
		},
	};

	if (noindex || nofollow) {
		metadata.robots = {
			index: !noindex,
			follow: !nofollow,
			googleBot: {
				index: !noindex,
				follow: !nofollow,
			},
		};
	}

	return metadata;
}

/**
 * Generate metadata for course pages
 */
export function generateCourseMetadata(
	course: {
		title: string;
		titleEn?: string | null;
		description?: string | null;
		descriptionEn?: string | null;
		slug: string;
		headerImage?: string | null;
	},
	locale: Locale = 'vi',
): Metadata {
	const title = locale === 'vi' ? course.title : course.titleEn || course.title;
	const description =
		locale === 'vi'
			? course.description || SEO_DEFAULTS.description.vi
			: course.descriptionEn || course.description || SEO_DEFAULTS.description.en;

	if (!course.slug) {
		throw new Error('Course must have a slug for metadata generation');
	}
	const url = `/courses/${course.slug}`;
	const image = course.headerImage || ASSET_PATHS.logo.large;

	return generatePageMetadata({
		title,
		description,
		keywords: SEO_DEFAULTS.keywords[locale] as unknown as string[],
		image,
		url,
		type: 'article',
		locale,
		canonical: url,
	});
}

/**
 * Generate metadata for deck pages
 */
export function generateDeckMetadata(
	deck: {
		title: string;
		titleEn?: string | null;
		description?: string | null;
		descriptionEn?: string | null;
		slug: string;
		headerImage?: string | null;
	},
	locale: Locale = 'vi',
): Metadata {
	const title = locale === 'vi' ? deck.title : deck.titleEn || deck.title;
	const description =
		locale === 'vi'
			? deck.description || SEO_DEFAULTS.description.vi
			: deck.descriptionEn || deck.description || SEO_DEFAULTS.description.en;

	if (!deck.slug) {
		throw new Error('Deck must have a slug for metadata generation');
	}
	const url = `/decks/${deck.slug}`;
	const image = deck.headerImage || ASSET_PATHS.logo.large;

	return generatePageMetadata({
		title,
		description,
		keywords: SEO_DEFAULTS.keywords[locale] as unknown as string[],
		image,
		url,
		type: 'article',
		locale,
		canonical: url,
	});
}
