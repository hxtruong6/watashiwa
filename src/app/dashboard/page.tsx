import { syncUser } from '@/modules/auth/auth.actions';
import { getUserWithRole } from '@/modules/auth/auth.actions';
import DashboardOverview from '@/modules/dashboard/components/DashboardOverview';
import DashboardErrorState from '@/modules/dashboard/components/home/DashboardErrorState';
import { getDashboardData } from '@/modules/dashboard/dashboard.actions';
import { getLeaderboard } from '@/modules/leaderboard/leaderboard.actions';
import { getReviewForecast } from '@/modules/study/study.actions';
import { hasCompletedSetup } from '@/utils/setup-check';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';

interface Props {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Dashboard(props: Props) {
	const searchParams = await props.searchParams;

	// Sync user on load
	await syncUser();

	// Parallelize fetching
	const [user, data, leaderboard, forecast] = await Promise.all([
		getUserWithRole(),
		getDashboardData(),
		getLeaderboard(),
		getReviewForecast(),
	]);

	// Check if user has completed setup (server-side protection)
	if (user) {
		const setupCompleted = await hasCompletedSetup(user.id);
		if (!setupCompleted) {
			redirect('/profile/setup');
		}
	}

	// Check for role-based redirect
	if (
		user &&
		(user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR) &&
		!searchParams?.app
	) {
		redirect('/admin');
	}

	if (!data) {
		return <DashboardErrorState />;
	}

	return (
		<DashboardOverview
			reviewCount={data.reviewCount}
			stats={data.stats}
			weeklyStats={data.weeklyStats}
			decks={data.decksWithDue}
			userName={data.userName}
			dailyGoal={data.userSettings?.limitReviews ?? 50}
			userRole={user?.role}
			leaderboard={leaderboard}
			userId={user?.id}
			userSettings={data.userSettings}
			forecast={forecast}
		/>
	);
}
