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
			const { syncUser } = await import('@/modules/auth/auth.actions');
			const syncResult = await syncUser();

			// Track OAuth/email confirmation signup if this is a new user
			if (syncResult.success && syncResult.data?.isNewUser) {
				const {
					data: { user },
				} = await supabase.auth.getUser();

				if (user) {
					// Determine signup method from provider
					const provider = user.app_metadata?.provider || 'email';
					const isOAuth = provider !== 'email';

					// Track signup event via backend analytics
					const { logAnalyticsEvent } = await import('@/modules/analytics/analytics.actions');
					await logAnalyticsEvent('user_signed_up', {
						distinct_id: user.id,
						method: isOAuth ? provider : 'email',
						source: 'email_confirmation',
						timestamp: new Date().toISOString(),
						user_properties: {
							email: user.email,
							name: user.user_metadata?.full_name || user.email?.split('@')[0],
						},
					});
				}
			}

			// Redirect new users to profile setup
			const redirectPath =
				syncResult.success && syncResult.data?.isNewUser ? '/profile/setup' : next;

			const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
			const isLocalEnv = process.env.NODE_ENV === 'development';
			if (isLocalEnv) {
				// we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
				return NextResponse.redirect(`${origin}${redirectPath}`);
			} else if (forwardedHost) {
				return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
			} else {
				return NextResponse.redirect(`${origin}${redirectPath}`);
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
