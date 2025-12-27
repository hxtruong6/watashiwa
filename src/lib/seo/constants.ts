/**
 * SEO Constants
 * Centralized configuration for SEO metadata across the application
 */

export const SEO_CONFIG = {
	siteName: 'WatashiWa',
	siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://watashiwa.app',
	defaultLocale: 'vi',
	locales: ['vi', 'en'] as const,
	twitterHandle: '@watashiwa', // Update if you have a Twitter handle
} as const;

export const SEO_DEFAULTS = {
	title: {
		vi: 'WatashiWa: Học hết khoai, nhớ cực dai',
		en: 'WatashiWa: Learn Smart, Not Hard',
	},
	description: {
		vi: 'Người bạn đồng hành học tiếng Nhật với SRS. Không áp lực, nhớ lâu, học theo cách của bạn. Hai hệ máy, miễn phí & mã nguồn mở.',
		en: 'Your Japanese learning buddy. Master vocab with SRS, zero pressure. Open source & free forever.',
	},
	keywords: {
		vi: [
			'học tiếng nhật',
			'srs',
			'hán việt',
			'kanji',
			'jlpt',
			'minna no nihongo',
			'từ vựng tiếng nhật',
			'spaced repetition',
			'học kanji',
		],
		en: [
			'learn japanese',
			'srs',
			'kanji',
			'spaced repetition',
			'jlpt',
			'han viet',
			'vocabulary',
			'japanese learning',
			'minna no nihongo',
		],
	},
} as const;

export const STATIC_PAGES = [
	{ path: '', priority: 1.0, changeFrequency: 'weekly' as const },
	{ path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
	{ path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
	{ path: '/courses', priority: 0.9, changeFrequency: 'weekly' as const },
	{ path: '/decks', priority: 0.8, changeFrequency: 'weekly' as const },
	{ path: '/privacy-policy', priority: 0.5, changeFrequency: 'yearly' as const },
	{ path: '/terms-of-service', priority: 0.5, changeFrequency: 'yearly' as const },
	{ path: '/cookie-policy', priority: 0.5, changeFrequency: 'yearly' as const },
	{ path: '/data-rights', priority: 0.5, changeFrequency: 'yearly' as const },
] as const;
