import { prisma } from '@/lib/db';
import { SEO_CONFIG, STATIC_PAGES } from '@/lib/seo/constants';
import { MetadataRoute } from 'next';

/**
 * Dynamic Sitemap Generation
 * Generates sitemap.xml with all public pages, courses, and decks
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = SEO_CONFIG.siteUrl;
	const now = new Date();

	// Static pages
	const staticPages: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
		url: `${baseUrl}${page.path}`,
		lastModified: now,
		changeFrequency: page.changeFrequency,
		priority: page.priority,
		alternates: {
			languages: {
				'vi-VN': `${baseUrl}${page.path}`,
				'en-US': `${baseUrl}${page.path}`,
			},
		},
	}));

	// Public courses
	const publicCourses = await prisma.course.findMany({
		where: {
			isPublic: true,
			deletedAt: null,
		},
		select: {
			slug: true,
			updatedAt: true,
		},
	});

	const coursePages: MetadataRoute.Sitemap = publicCourses.map((course) => ({
		url: `${baseUrl}/courses/${course.slug}`,
		lastModified: course.updatedAt,
		changeFrequency: 'weekly',
		priority: 0.8,
		alternates: {
			languages: {
				'vi-VN': `${baseUrl}/courses/${course.slug}`,
				'en-US': `${baseUrl}/courses/${course.slug}`,
			},
		},
	}));

	// Public decks
	const publicDecks = await prisma.deck.findMany({
		where: {
			isPublic: true,
			deletedAt: null,
		},
		select: {
			slug: true,
			updatedAt: true,
		},
	});

	const deckPages: MetadataRoute.Sitemap = publicDecks.map((deck) => ({
		url: `${baseUrl}/decks/${deck.slug}`,
		lastModified: deck.updatedAt,
		changeFrequency: 'weekly',
		priority: 0.7,
		alternates: {
			languages: {
				'vi-VN': `${baseUrl}/decks/${deck.slug}`,
				'en-US': `${baseUrl}/decks/${deck.slug}`,
			},
		},
	}));

	return [...staticPages, ...coursePages, ...deckPages];
}
