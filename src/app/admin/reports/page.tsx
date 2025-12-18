import themeConfig from '@/lib/theme/themeConfig';
import { getReports, getUserWithRole } from '@/services/actions';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import React from 'react';

import ClientReportsTable from './components/ClientReportsTable';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
	const currentUser = await getUserWithRole();

	if (
		!currentUser ||
		(currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.MODERATOR)
	) {
		redirect('/dashboard');
	}

	// Fetch pending reports initially
	// We handle data fetching in the client component for interactive filtering,
	// but we can pass initial data here if desired.
	// For simplicity, let's fetch in the client or pass initial data.
	// Let's pass initial data.
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
				<ClientReportsTable initialReports={initialReports} />
			</div>
		</div>
	);
}
