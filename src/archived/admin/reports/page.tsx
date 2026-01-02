import themeConfig from '@/lib/theme/themeConfig';
import { getUserWithRole } from '@/modules/auth/auth.actions';
import AdminReportTable from '@/modules/report/components/AdminReportTable';
import { getReports } from '@/modules/report/report.data';
import { UserRole } from '@prisma/client';
import { Skeleton } from 'antd';
import { redirect } from 'next/navigation';
import React, { Suspense } from 'react';

async function AdminReportsContent() {
	const currentUser = await getUserWithRole();

	if (
		!currentUser ||
		(currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.MODERATOR)
	) {
		redirect('/dashboard');
	}

	// Fetch pending reports initially
	const result = await getReports(50);
	const initialReports = result.success && result.data ? result.data : [];

	return (
		<div style={{ padding: '24px' }}>
			<div style={{ marginBottom: 24 }}>
				<h1
					style={{
						fontSize: '24px',
						fontWeight: 'bold',
						color: themeConfig.token?.colorPrimary,
						margin: 0,
					}}
				>
					Report Management
				</h1>
				<p style={{ color: '#666', marginTop: 8 }}>
					Review and resolve user-submitted content reports.
				</p>
			</div>

			<div
				style={{
					background: 'white',
					borderRadius: '16px',
					border: '1px solid #E0E0E0',
					overflow: 'hidden',
				}}
			>
				<AdminReportTable initialReports={initialReports} />
			</div>
		</div>
	);
}

export default async function AdminReportsPage() {
	return (
		<Suspense fallback={<Skeleton active paragraph={{ rows: 8 }} />}>
			<AdminReportsContent />
		</Suspense>
	);
}
