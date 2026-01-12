import { getUserStats } from '@/modules/user/user.actions';
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
 *
 * During static generation: Returns default streak (24) to prevent bailout
 * During request-time: Returns actual user stats when logged in
 */
export default async function NavBar() {
	let user = null;
	let streak = 24; // Default value for static generation

	try {
		// Wait for request context before accessing cookies
		// This will throw during static generation, which is expected
		await connection();

		const { getUser } = await import('@/modules/auth/auth.actions');
		user = await getUser();

		// Fetch streak data if user is authenticated
		if (user?.id) {
			const stats = await getUserStats(user.id);
			streak = stats.streak;
		}
	} catch {
		// During prerendering/static generation:
		// - connection() throws (expected behavior)
		// - getUserStats() may throw due to new Date() usage
		// Return default values to prevent static generation bailout
		// NavBarClient handles null users gracefully and will show default streak
	}

	return <NavBarClient user={user} streak={streak} />;
}
