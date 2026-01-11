import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Privacy page - redirects to privacy-policy for consistency
 * Access cookies() to satisfy Next.js requirement before Sentry intercepts
 */
export default async function PrivacyPage() {
	// Access cookies() to satisfy Next.js requirement for crypto.randomUUID()
	// This prevents Sentry interception issues during prerendering
	try {
		await cookies();
	} catch {
		// During prerendering, cookies() rejects - this is expected
	}
	redirect('/privacy-policy');
}
