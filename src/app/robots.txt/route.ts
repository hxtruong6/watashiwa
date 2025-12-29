import { SEO_CONFIG } from '@/lib/seo/constants';
import { NextResponse } from 'next/server';

/**
 * Custom robots.txt Route Handler
 *
 * This route handler overrides the robots.ts file to ensure
 * we have full control over the robots.txt output and prevent
 * non-standard directives (like Content-signal) from being added.
 *
 * Per robots.txt standards:
 * - Patterns should start with "/" or "*"
 * - No redundant wildcard patterns (e.g., /dashboard/ already blocks /dashboard/*)
 * - Only standard directives: User-agent, Allow, Disallow, Sitemap
 */
export async function GET() {
	const baseUrl = SEO_CONFIG.siteUrl;

	// Build robots.txt content manually to ensure only standard directives
	const robotsTxt = [
		'# robots.txt',
		'# Generated for WatashiWa',
		'',
		'User-agent: *',
		'Allow: /',
		'Disallow: /dashboard/',
		'Disallow: /admin/',
		'Disallow: /api/',
		'Disallow: /study/',
		'Disallow: /auth/',
		'Disallow: /login/',
		'Disallow: /forgot-password/',
		'Disallow: /reset-password/',
		'Disallow: /offline/',
		'',
		'User-agent: Googlebot',
		'Allow: /',
		'Disallow: /dashboard/',
		'Disallow: /admin/',
		'Disallow: /api/',
		'Disallow: /study/',
		'Disallow: /auth/',
		'Disallow: /login/',
		'Disallow: /forgot-password/',
		'Disallow: /reset-password/',
		'Disallow: /offline/',
		'',
		`Sitemap: ${baseUrl}/sitemap.xml`,
		'',
	].join('\n');

	return new NextResponse(robotsTxt, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=3600',
		},
	});
}
