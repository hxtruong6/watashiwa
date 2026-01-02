import { AdminStatsWidget } from '@/modules/admin/components/Dashboard/AdminStatsWidget';
import { DashboardErrorBoundary } from '@/modules/admin/components/Dashboard/DashboardErrorBoundary';
import { DashboardTitle } from '@/modules/admin/components/Dashboard/DashboardTitle';
import { VocabStatsWidget } from '@/modules/admin/components/Dashboard/VocabStatsWidget';
import { Skeleton } from 'antd';
import React, { Suspense } from 'react';

// Admin routes require role-based authentication checks via cookies()
// With cacheComponents enabled, these calls are wrapped in Suspense for proper handling

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
