import { redirect } from 'next/navigation';
import { getUserWithRole } from '@/services/actions';
import { hasRole } from '@/lib/auth/roleGuard';
import { UserRole } from '@/generated/prisma';
import React from 'react';
import themeConfig from '@/lib/theme/themeConfig';
import {
	DashboardOutlined,
	UserOutlined,
	ArrowLeftOutlined,
	ReadOutlined,
	FlagOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	// Note: Server component, but theme token usage might require client component or just inline style for layout.
	// Actually, `useToken` is a hook, so it must be used in a client component.
	// This file is `export default async function AdminLayout`, which implies it's a Server Component.
	// Server Components cannot use hooks like `useToken`.
	// However, we can use the hex codes imported from `themeConfig` directly if we export them, or just accept that Server Components might need hardcoded values or a shared constant file.
	// Wait, `themeConfig.ts` exports `theme` object. We can import `theme` and access `theme.token.colorPrimary`.
	// Let's try that.
	const user = await getUserWithRole();

	if (!user || !hasRole(user.role, UserRole.MODERATOR)) {
		redirect('/dashboard?app=true');
	}

	return (
		<div
			style={{
				minHeight: '100vh',
				background: '#f5f5f5',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			{/* Admin Header */}
			<header
				style={{
					background: themeConfig.token?.colorPrimary,
					padding: '0 24px',
					height: 64,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					color: 'white',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
					<h1 style={{ margin: 0, color: 'white', fontSize: 20, fontWeight: 600 }}>Admin Panel</h1>
					<span
						style={{
							background: 'rgba(255, 255, 255, 0.2)',
							padding: '2px 8px',
							borderRadius: 4,
							fontSize: 12,
						}}
					>
						{user.role}
					</span>
				</div>
				<Link href="/dashboard?app=true" style={{ color: 'white', textDecoration: 'none' }}>
					<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
						<ArrowLeftOutlined /> Back to App
					</div>
				</Link>
			</header>

			<div style={{ display: 'flex', flex: 1 }}>
				{/* Sidebar */}
				<aside
					style={{
						width: 250,
						background: 'white',
						borderRight: '1px solid #f0f0f0',
						padding: '24px 0',
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
						<Link href="/admin" style={{ textDecoration: 'none' }}>
							<div
								style={{
									padding: '12px 24px',
									display: 'flex',
									gap: 12,
									alignItems: 'center',
									color: '#1f1f1f',
									cursor: 'pointer',
								}}
							>
								<DashboardOutlined /> Dashboard
							</div>
						</Link>

						{hasRole(user.role, UserRole.ADMIN) && (
							<Link href="/admin/users" style={{ textDecoration: 'none' }}>
								<div
									style={{
										padding: '12px 24px',
										display: 'flex',
										gap: 12,
										alignItems: 'center',
										color: '#1f1f1f',
										cursor: 'pointer',
									}}
								>
									<UserOutlined /> Users
								</div>
							</Link>
						)}

						<div style={{ padding: '12px 24px', color: '#888', fontSize: 12, marginTop: 8 }}>
							CONTENT
						</div>

						{hasRole(user.role, UserRole.ADMIN) && (
							<>
								<Link href="/admin/decks" style={{ textDecoration: 'none' }}>
									<div
										style={{
											padding: '12px 24px',
											display: 'flex',
											gap: 12,
											alignItems: 'center',
											color: '#1f1f1f',
											cursor: 'pointer',
										}}
									>
										<ReadOutlined /> Decks
									</div>
								</Link>
							</>
						)}

						{/* Reports - Available to Mods & Admins */}
						<Link href="/admin/reports" style={{ textDecoration: 'none' }}>
							<div
								style={{
									padding: '12px 24px',
									display: 'flex',
									gap: 12,
									alignItems: 'center',
									color: '#1f1f1f',
									cursor: 'pointer',
								}}
							>
								<FlagOutlined /> User Reports
							</div>
						</Link>
					</div>
				</aside>

				{/* Content */}
				<main style={{ flex: 1, padding: 32 }}>{children}</main>
			</div>
		</div>
	);
}
