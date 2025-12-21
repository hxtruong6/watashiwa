import { AdminShell } from '@/components/admin/Layout/AdminShell';
import { hasRole } from '@/lib/auth/roleGuard';
import { getUserWithRole } from '@/services/actions';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import React from 'react';

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

	return <AdminShell user={user}>{children}</AdminShell>;
}
