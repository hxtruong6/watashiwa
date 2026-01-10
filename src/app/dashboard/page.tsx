import { syncUser } from '@/modules/auth/auth.actions';
import { getUserWithRole } from '@/modules/auth/auth.actions';
import DashboardDataLoader from '@/modules/dashboard/components/DashboardDataLoader';
import { hasCompletedSetup } from '@/utils/setup-check';
import { UserRole } from '@prisma/client';
import { Skeleton } from 'antd';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';

interface Props {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Component that handles auth checks and redirects - wrapped in Suspense for cacheComponents
async function DashboardAuthGuard({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	await connection();
	// Sync user on load
	await syncUser();

	// Get user for auth checks
	const user = await getUserWithRole();
	console.log('user', user);

	// Check if user has completed setup (server-side protection)
	if (user) {
		const setupCompleted = await hasCompletedSetup(user.id);
		console.log('setupCompleted', setupCompleted);
		if (!setupCompleted) {
			redirect('/profile/setup');
		}
	}

	// Check for role-based redirect
	const resolvedSearchParams = await searchParams;
	if (
		user &&
		(user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR) &&
		!resolvedSearchParams?.app
	) {
		redirect('/admin');
	}

	// Return the dashboard content
	return <DashboardDataLoader user={user} />;
}

export default async function Dashboard(props: Props) {
	// Wrap auth checks and data fetching in Suspense for Partial Prerendering compatibility
	return (
		<Suspense fallback={<Skeleton active paragraph={{ rows: 8 }} />}>
			<DashboardAuthGuard searchParams={props.searchParams} />
		</Suspense>
	);
}
