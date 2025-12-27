import { SEO_CONFIG } from '@/lib/seo/constants';
import { MetadataRoute } from 'next';

/**
 * robots.txt Generation
 * Controls search engine crawler access
 */
export default function robots(): MetadataRoute.Robots {
	const baseUrl = SEO_CONFIG.siteUrl;

	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: [
					'/dashboard/',
					'/admin/',
					'/api/',
					'/study/',
					'/auth/',
					'/login/',
					'/forgot-password/',
					'/reset-password/',
					'/offline/',
					// Private user-specific routes
					'/dashboard/*',
					'/admin/*',
					'/api/*',
					'/study/*',
				],
			},
			{
				userAgent: 'Googlebot',
				allow: '/',
				disallow: [
					'/dashboard/',
					'/admin/',
					'/api/',
					'/study/',
					'/auth/',
					'/login/',
					'/forgot-password/',
					'/reset-password/',
					'/offline/',
				],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
