import React from 'react';
import { getDashboardData, syncUser } from '@/services/actions';
import DashboardContent from '@/components/DashboardContent';

export default async function Dashboard() {
	// Sync user on load
	await syncUser();

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
		/>
	);
}
