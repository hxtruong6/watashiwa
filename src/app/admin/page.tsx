import { AdminStatsWidget } from '@/components/admin/Dashboard/AdminStatsWidget';
import { DashboardErrorBoundary } from '@/components/admin/Dashboard/DashboardErrorBoundary';
import { DashboardTitle } from '@/components/admin/Dashboard/DashboardTitle';
import { VocabStatsWidget } from '@/components/admin/Dashboard/VocabStatsWidget';
import { Skeleton } from 'antd';
import React, { Suspense } from 'react';

export default function AdminDashboard() {
	return (
		<div>
			<DashboardTitle level={2} style={{ marginBottom: 32 }}>
				Overview
			</DashboardTitle>

			<DashboardErrorBoundary>
				<Suspense fallback={<Skeleton active paragraph={{ rows: 4 }} />}>
					<AdminStatsWidget />
				</Suspense>
			</DashboardErrorBoundary>

			{/* QA Section */}
			<div style={{ marginTop: 48 }}>
				<DashboardTitle level={3} style={{ marginBottom: 24 }}>
					Content Quality
				</DashboardTitle>
				<DashboardErrorBoundary>
					<Suspense fallback={<Skeleton active />}>
						<VocabStatsWidget />
					</Suspense>
				</DashboardErrorBoundary>
			</div>
		</div>
	);
}
