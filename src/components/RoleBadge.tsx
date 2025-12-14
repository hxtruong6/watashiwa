'use client';

import React from 'react';
import { Tag } from 'antd';
import { UserRole } from '@prisma/client';
import { getRoleColor } from '@/lib/auth/roleGuard';

interface RoleBadgeProps {
	role: UserRole;
	showUser?: boolean; // Whether to show badge for generic USER role
}

export default function RoleBadge({ role, showUser = false }: RoleBadgeProps) {
	if (!showUser && role === UserRole.USER) {
		return null;
	}

	return (
		<Tag color={getRoleColor(role)} style={{ borderRadius: 10, border: 'none', fontWeight: 600 }}>
			{role}
		</Tag>
	);
}
