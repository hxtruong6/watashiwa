import { updateSession } from '@/utils/supabase/middleware';
import { type NextRequest } from 'next/server';

/**
 * Next.js Proxy
 * Handles authentication only.
 * Setup completion is checked at page level (server-side).
 */
export async function proxy(request: NextRequest) {
	// Handle authentication via Supabase
	return await updateSession(request);
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - sw.js (service worker - handled by route handler)
		 * - robots.txt (handled by route handler)
		 * - public files (public folder)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|sw.js|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
