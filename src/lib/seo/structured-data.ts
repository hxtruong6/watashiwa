/**
 * Structured Data (JSON-LD) Generators
 * Schema.org markup for better search engine understanding
 */
import { SEO_CONFIG } from './constants';

export interface OrganizationSchema {
	'@context': string;
	'@type': 'EducationalOrganization';
	name: string;
	url: string;
	logo?: string;
	description?: string;
	sameAs?: string[];
}

export interface WebApplicationSchema {
	'@context': string;
	'@type': 'WebApplication';
	name: string;
	url: string;
	applicationCategory: string;
	operatingSystem: string;
	offers: {
		'@type': 'Offer';
		price: string;
		priceCurrency: string;
	};
	description?: string;
}

export interface CourseSchema {
	'@context': string;
	'@type': 'Course';
	name: string;
	description?: string;
	provider: {
		'@type': 'Organization';
		name: string;
	};
	url?: string;
	image?: string;
	inLanguage?: string;
	educationalLevel?: string;
}

export interface BreadcrumbListSchema {
	'@context': string;
	'@type': 'BreadcrumbList';
	itemListElement: Array<{
		'@type': 'ListItem';
		position: number;
		name: string;
		item?: string;
	}>;
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(): OrganizationSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'EducationalOrganization',
		name: SEO_CONFIG.siteName,
		url: SEO_CONFIG.siteUrl,
		logo: `${SEO_CONFIG.siteUrl}/assets/w_logo.png`,
		description: 'Japanese language learning platform with SRS (Spaced Repetition System)',
	};
}

/**
 * Generate WebApplication schema (for PWA)
 */
export function generateWebApplicationSchema(): WebApplicationSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: SEO_CONFIG.siteName,
		url: SEO_CONFIG.siteUrl,
		applicationCategory: 'EducationalApplication',
		operatingSystem: 'Web',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD',
		},
		description: 'Learn Japanese vocabulary with SRS. Free and open source.',
	};
}

/**
 * Generate Course schema
 */
export function generateCourseSchema(
	course: {
		title: string;
		titleEn?: string | null;
		description?: string | null;
		descriptionEn?: string | null;
		slug?: string | null;
		headerImage?: string | null;
		level?: string | null;
	},
	locale: 'vi' | 'en' = 'vi',
): CourseSchema {
	const title = locale === 'vi' ? course.title : course.titleEn || course.title;
	const description =
		locale === 'vi'
			? course.description || undefined
			: course.descriptionEn || course.description || undefined;
	const url = course.slug ? `${SEO_CONFIG.siteUrl}/courses/${course.slug}` : undefined;
	const image = course.headerImage
		? course.headerImage.startsWith('http')
			? course.headerImage
			: `${SEO_CONFIG.siteUrl}${course.headerImage}`
		: undefined;

	return {
		'@context': 'https://schema.org',
		'@type': 'Course',
		name: title,
		description,
		provider: {
			'@type': 'Organization',
			name: SEO_CONFIG.siteName,
		},
		url,
		image,
		inLanguage: locale === 'vi' ? 'vi-VN' : 'en-US',
		educationalLevel: course.level || undefined,
	};
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
	items: Array<{ name: string; url?: string }>,
): BreadcrumbListSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url ? `${SEO_CONFIG.siteUrl}${item.url}` : undefined,
		})),
	};
}

/**
 * Convert schema object to JSON-LD script tag content
 */
export function schemaToJsonLd(schema: object): string {
	return JSON.stringify(schema, null, 2);
}
