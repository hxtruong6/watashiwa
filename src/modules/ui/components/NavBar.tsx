import { connection } from 'next/server';

import NavBarClient from './NavBarClient';

/**
 * NavBar Server Component
 * Fetches user data server-side and passes it to the client component
 * Follows Next.js 16 App Router best practices with cacheComponents (PPR)
 *
 * Pattern matches src/app/about structure:
 * - Server component handles data fetching with connection()
 * - Client component handles all interactivity
 */
export default async function NavBar() {
	// Wait for request context before accessing cookies
	await connection();

	let user = null;
	try {
		const { getUser } = await import('@/modules/auth/auth.actions');
		user = await getUser();
	} catch {
		// During prerendering, cookies() may reject. NavBarClient handles null users gracefully.
	}

	return <NavBarClient user={user} />;
}
