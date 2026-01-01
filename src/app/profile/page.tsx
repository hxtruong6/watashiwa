import { getUser } from '@/modules/auth/auth.actions';
import { redirect } from 'next/navigation';

/**
 * Profile page - redirects authenticated users to dashboard
 * where they can access settings via the settings modal in NavBar
 */
export default async function ProfilePage() {
	const user = await getUser();

	if (!user) {
		// Redirect unauthenticated users to login
		redirect('/login?returnUrl=/profile');
	}

	// Redirect authenticated users to dashboard
	// Settings are accessible via the settings modal in NavBar
	redirect('/dashboard');
}
