import { hasRole } from '@/lib/auth/roleGuard';
import { AdminShell } from '@/modules/admin/components/Layout/AdminShell';
import { getUserWithRole } from '@/modules/auth/auth.actions';
import { PageSkeleton } from '@/modules/ui/components/skeletons';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import React, { Suspense } from 'react';

// Admin layout requires role-based authentication via cookies()
// With cacheComponents enabled, these calls are wrapped in Suspense for proper handling

async function AdminLayoutContent({ children }: { children: React.ReactNode }) {
	const user = await getUserWithRole();

	if (!user || !hasRole(user.role, UserRole.MODERATOR)) {
		redirect('/dashboard?app=true');
	}

	return <AdminShell user={user}>{children}</AdminShell>;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<Suspense fallback={<PageSkeleton />}>
			<AdminLayoutContent>{children}</AdminLayoutContent>
		</Suspense>
	);
}
