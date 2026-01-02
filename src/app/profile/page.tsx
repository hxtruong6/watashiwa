import { getUser } from '@/modules/auth/auth.actions';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

/**
 * Profile page - redirects authenticated users to dashboard
 * where they can access settings via the settings modal in NavBar
 * With cacheComponents enabled, auth calls are wrapped in Suspense for proper handling
 */
async function ProfilePageContent(): Promise<React.ReactNode> {
	const user = await getUser();

	if (!user) {
		// Redirect unauthenticated users to login
		redirect('/login?returnUrl=/profile');
	}

	// Redirect authenticated users to dashboard
	// Settings are accessible via the settings modal in NavBar
	redirect('/dashboard');
}

export default async function ProfilePage() {
	return (
		<Suspense
			fallback={
				<div
					style={{
						minHeight: '100vh',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					Loading...
				</div>
			}
		>
			<ProfilePageContent />
		</Suspense>
	);
}
