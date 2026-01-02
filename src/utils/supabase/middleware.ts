import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	});

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
					supabaseResponse = NextResponse.next({
						request,
					});
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options),
					);
				},
			},
		},
	);

	// Do not run on login/auth routes to avoid loops
	if (
		request.nextUrl.pathname.startsWith('/login') ||
		request.nextUrl.pathname.startsWith('/auth') ||
		request.nextUrl.pathname.startsWith('/forgot-password') ||
		request.nextUrl.pathname.startsWith('/reset-password')
	) {
		return supabaseResponse;
	}

	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Protect Dashboard and Study routes
	if (
		!user &&
		(request.nextUrl.pathname.startsWith('/') ||
			request.nextUrl.pathname.startsWith('/study') ||
			request.nextUrl.pathname.startsWith('/decks'))
	) {
		if (request.nextUrl.pathname === '/login') {
			return supabaseResponse;
		}
		const url = request.nextUrl.clone();
		url.pathname = '/login';
		// Preserve returnUrl: redirect to login with original path as returnUrl
		// Only set returnUrl if it doesn't already exist (preserve existing returnUrl)
		if (!url.searchParams.has('returnUrl')) {
			const originalPath = request.nextUrl.pathname + request.nextUrl.search;
			// Validate the path before setting it (basic check - full validation happens in login page)
			if (originalPath && originalPath.startsWith('/') && !originalPath.startsWith('//')) {
				url.searchParams.set('returnUrl', originalPath);
			}
		}
		// Add sessionExpired flag to show user-friendly message
		// This indicates the user was redirected due to expired/invalid session
		url.searchParams.set('sessionExpired', 'true');
		return NextResponse.redirect(url);
	}

	return supabaseResponse;
}
