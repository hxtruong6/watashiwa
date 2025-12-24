'use client';

import { updateUserRole } from '@/modules/admin/admin.actions';
import RoleBadge from '@/modules/user/components/RoleBadge';
import { UserRole } from '@prisma/client';
import { Modal, Select, Table, message } from 'antd';
import React, { useState } from 'react';

interface User {
	id: string;
	name: string | null;
	email: string;
	role: UserRole;
	createdAt?: Date;
}

interface ClientUserTableProps {
	initialUsers: User[];
	currentUserId?: string;
}

export default function ClientUserTable({ initialUsers, currentUserId }: ClientUserTableProps) {
	const [users, setUsers] = useState(initialUsers);

	const handleRoleChangeRequest = (userId: string, newRole: UserRole, currentRole: UserRole) => {
		Modal.confirm({
			title: 'Confirm Role Change',
			content: `Are you sure you want to change user's role from ${currentRole} to ${newRole}?`,
			onOk: async () => {
				await performRoleUpdate(userId, newRole);
			},
		});
	};

	const performRoleUpdate = async (userId: string, newRole: UserRole) => {
		const hide = message.loading('Updating role...', 0);
		try {
			const result = await updateUserRole(userId, newRole);
			hide();
			if (result.success) {
				message.success('Role updated successfully');
				setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
			} else {
				message.error(result.error || 'Failed to update role');
			}
		} catch {
			hide();
			message.error('An unexpected error occurred');
		}
	};

	const columns = [
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
			render: (text: string | null) => text || 'N/A',
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
		},
		{
			title: 'Role',
			dataIndex: 'role',
			key: 'role',
			render: (role: UserRole) => <RoleBadge role={role} showUser />,
		},
		{
			title: 'Action',
			key: 'action',
			render: (_: unknown, record: User) => (
				<Select
					value={record.role}
					style={{ width: 120 }}
					onChange={(value) => handleRoleChangeRequest(record.id, value, record.role)}
					disabled={record.id === currentUserId}
				>
					<Select.Option value={UserRole.USER}>User</Select.Option>
					<Select.Option value={UserRole.MODERATOR}>Moderator</Select.Option>
					<Select.Option value={UserRole.ADMIN}>Admin</Select.Option>
				</Select>
			),
		},
	];

	return <Table dataSource={users} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />;
}
