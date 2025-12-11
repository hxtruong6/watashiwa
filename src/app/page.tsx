import React from 'react';
import { getReviewCount, getUserStats, syncUser } from '@/services/actions';
import DashboardContent from '@/components/DashboardContent';

export default async function Dashboard() {
	// Sync user on load
	await syncUser();

	const [reviewCount, stats] = await Promise.all([getReviewCount(), getUserStats()]);

	return <DashboardContent reviewCount={reviewCount} stats={stats} />;
}
