import { getUser } from '@/modules/auth/auth.actions';
import { hasCompletedSetup } from '@/utils/setup-check';
import { redirect } from 'next/navigation';

import ProfileSetupForm from './ProfileSetupForm';

interface Props {
	searchParams: Promise<{ returnUrl?: string }>;
}

export default async function ProfileSetupPage(props: Props) {
	const searchParams = await props.searchParams;
	const returnUrl = searchParams.returnUrl;

	// Server-side authentication check
	const user = await getUser();
	if (!user) {
		redirect('/login');
	}

	const setupCompleted = await hasCompletedSetup(user.id);
	if (setupCompleted) {
		// Default to /dashboard for authenticated users (main board)
		const redirectPath = returnUrl && returnUrl.startsWith('/') ? returnUrl : '/dashboard';
		redirect(redirectPath);
	}

	return <ProfileSetupForm returnUrl={returnUrl} />;
}
