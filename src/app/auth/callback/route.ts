import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get('code');
	// if "next" is in param, use it as the redirect URL
	const next = searchParams.get('next') ?? '/';

	if (code) {
		const supabase = await createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			// Sync user to DB after successful email verification
			// We dynamic import to avoid bundling server actions in route if not needed,
			// but standard import is fine here as this IS a server route.
			const { syncUser } = await import('@/services/actions');
			await syncUser();

			const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
			const isLocalEnv = process.env.NODE_ENV === 'development';
			if (isLocalEnv) {
				// we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
				return NextResponse.redirect(`${origin}${next}`);
			} else if (forwardedHost) {
				return NextResponse.redirect(`https://${forwardedHost}${next}`);
			} else {
				return NextResponse.redirect(`${origin}${next}`);
			}
		} else {
			// Redirect to error page with error message
			return NextResponse.redirect(
				`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`,
			);
		}
	}

	// return the user to an error page with instructions
	return NextResponse.redirect(
		`${origin}/auth/auth-code-error?error=${encodeURIComponent('No authorization code provided')}`,
	);
}
