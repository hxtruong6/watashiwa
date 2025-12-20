import { VerificationDeck } from '@/components/Admin/QA/VerificationDeck';
import themeConfig from '@/lib/theme/themeConfig';
import { getAdminStats } from '@/services/actions';
import { FireOutlined, ReadOutlined, UserOutlined } from '@ant-design/icons';
import React from 'react';

export default async function AdminDashboard() {
	const stats = await getAdminStats();

	return (
		<div>
			<h2 style={{ marginBottom: 32, fontSize: 30, fontWeight: 'bold', color: '#1f1f1f' }}>
				Overview
			</h2>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
					gap: 24,
				}}
			>
				{/* Total Users */}
				<div
					style={{
						background: 'white',
						padding: 24,
						borderRadius: 16,
						boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
						display: 'flex',
						flexDirection: 'column',
						gap: 8,
					}}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#8c8c8c' }}>
						<UserOutlined style={{ fontSize: 24 }} />
						<span style={{ fontSize: 14 }}>Total Users</span>
					</div>
					<div style={{ fontSize: 32, fontWeight: 'bold', color: themeConfig.token?.colorPrimary }}>
						{stats.userCount}
					</div>
				</div>

				{/* Total Reviews */}
				<div
					style={{
						background: 'white',
						padding: 24,
						borderRadius: 16,
						boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
						display: 'flex',
						flexDirection: 'column',
						gap: 8,
					}}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#8c8c8c' }}>
						<ReadOutlined style={{ fontSize: 24 }} />
						<span style={{ fontSize: 14 }}>Total Reviews</span>
					</div>
					<div style={{ fontSize: 32, fontWeight: 'bold', color: themeConfig.token?.colorSuccess }}>
						{stats.reviewCount}
					</div>
				</div>

				{/* Active Today */}
				<div
					style={{
						background: 'white',
						padding: 24,
						borderRadius: 16,
						boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
						display: 'flex',
						flexDirection: 'column',
						gap: 8,
					}}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#8c8c8c' }}>
						<FireOutlined style={{ fontSize: 24 }} />
						<span style={{ fontSize: 14 }}>Active Today</span>
					</div>
					<div style={{ fontSize: 32, fontWeight: 'bold', color: '#FAAD14' }}>
						{stats.activeToday}
					</div>
				</div>
			</div>

			{/* QA Section */}
			<div style={{ marginTop: 48 }}>
				<VerificationDeck />
			</div>
		</div>
	);
}
