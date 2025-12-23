import { getAllUsers } from '@/modules/admin/admin.actions';
import { getUserWithRole } from '@/modules/auth/auth.actions';
import React from 'react';

// Updated import
import ClientUserTable from './components/ClientUserTable';

export default async function AdminUsersPage() {
	const users = await getAllUsers();
	const currentUser = await getUserWithRole(); // Fetch current user

	return (
		<div>
			<h2 style={{ marginBottom: 32, fontSize: 30, fontWeight: 'bold', color: '#1f1f1f' }}>
				User Management
			</h2>

			<div
				style={{
					background: 'white',
					padding: 24,
					borderRadius: 16,
					boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
				}}
			>
				<ClientUserTable initialUsers={users} currentUserId={currentUser?.id} />
			</div>
		</div>
	);
}
