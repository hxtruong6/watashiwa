import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Redirect old /profile/setup/cube route to new public /info/cube route
 * This preserves any existing bookmarks or links
 * Access cookies() to satisfy Next.js requirement before Sentry intercepts
 */
export default async function CubeIntroductionPage() {
	// Access cookies() to satisfy Next.js requirement for crypto.randomUUID()
	// This prevents Sentry interception issues during prerendering
	try {
		await cookies();
	} catch {
		// During prerendering, cookies() rejects - this is expected
	}
	redirect('/info/cube');
}
