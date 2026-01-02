import { updateSession } from '@/utils/supabase/middleware';
import { type NextRequest } from 'next/server';

/**
 * Next.js Middleware
 * Handles authentication only.
 * Setup completion is checked at page level (server-side).
 */
export async function middleware(request: NextRequest) {
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
		 * - public files (public folder)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
