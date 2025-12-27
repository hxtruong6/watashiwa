import { AdminShell } from '@/components/admin/Layout/AdminShell';
import { hasRole } from '@/lib/auth/roleGuard';
import { getUserWithRole } from '@/modules/auth/auth.actions';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import React from 'react';

// Force dynamic rendering - this layout uses cookies for authentication
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	const user = await getUserWithRole();

	if (!user || !hasRole(user.role, UserRole.MODERATOR)) {
		redirect('/dashboard?app=true');
	}

	return <AdminShell user={user}>{children}</AdminShell>;
}
