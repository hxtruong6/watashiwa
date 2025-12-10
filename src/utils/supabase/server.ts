import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
	const cookieStore = cookies();

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, {
								...options,
								// Force 30 days expiration if not specified,
								// though Supabase usually handles 'maxAge' in the 'options' passed here.
								// We ensure it's persistent.
								maxAge: 30 * 24 * 60 * 60,
							}),
						);
					} catch {
						// The `setAll` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing
						// user sessions.
					}
				},
			},
		},
	);
}
