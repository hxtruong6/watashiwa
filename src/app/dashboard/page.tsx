import { redirect } from 'next/navigation';
import { UserRole } from '@/generated/prisma';
import { getDashboardData, syncUser, getUserWithRole } from '@/services/actions';
import DashboardContent from '@/components/DashboardContent';

interface Props {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Dashboard(props: Props) {
	const searchParams = await props.searchParams;

	// Sync user on load
	await syncUser();

	// Check for role-based redirect
	const user = await getUserWithRole();
	if (
		user &&
		(user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR) &&
		!searchParams?.app
	) {
		redirect('/admin');
	}

	// Get all dashboard data in a single call
	const data = await getDashboardData();

	if (!data) {
		return <div>Loading...</div>;
	}

	return (
		<DashboardContent
			reviewCount={data.reviewCount}
			stats={data.stats}
			weeklyStats={data.weeklyStats}
			decks={data.decksWithDue}
			userName={data.userName}
			dailyGoal={data.userSettings?.limitReviews ?? 50}
			userRole={user?.role}
		/>
	);
}
