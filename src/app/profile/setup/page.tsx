import { getUser } from '@/modules/auth/auth.actions';
import { PageSkeleton } from '@/modules/ui/components/skeletons';
import { hasCompletedSetup } from '@/utils/setup-check';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import ProfileSetupForm from './ProfileSetupForm';

interface Props {
	searchParams: Promise<{ returnUrl?: string }>;
}

async function ProfileSetupContent(props: Props) {
	const searchParams = await props.searchParams;
	const returnUrl = searchParams.returnUrl;

	const user = await getUser();
	if (!user) {
		redirect('/login');
	}

	const setupCompleted = await hasCompletedSetup(user.id);
	if (setupCompleted) {
		const redirectPath = returnUrl && returnUrl.startsWith('/') ? returnUrl : '/dashboard';
		redirect(redirectPath);
	}

	return <ProfileSetupForm returnUrl={returnUrl} />;
}

export default async function ProfileSetupPage(props: Props) {
	return (
		<Suspense fallback={<PageSkeleton />}>
			<ProfileSetupContent {...props} />
		</Suspense>
	);
}
