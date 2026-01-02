import { getUserWithRole } from '@/modules/auth/auth.actions';
import DashboardOverview from '@/modules/dashboard/components/DashboardOverview';
import DashboardErrorState from '@/modules/dashboard/components/home/DashboardErrorState';
import { getDashboardData } from '@/modules/dashboard/dashboard.actions';
import { getLeaderboard } from '@/modules/leaderboard/leaderboard.actions';
import { getReviewForecast } from '@/modules/study/study.actions';

interface DashboardDataLoaderProps {
	user: Awaited<ReturnType<typeof getUserWithRole>>;
}

export default async function DashboardDataLoader({ user }: DashboardDataLoaderProps) {
	// Parallelize fetching
	const [data, leaderboard, forecast] = await Promise.all([
		getDashboardData(),
		getLeaderboard(),
		getReviewForecast(),
	]);

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
