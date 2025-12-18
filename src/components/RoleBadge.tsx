'use client';

import { getRoleColor } from '@/lib/auth/roleGuard';
import { UserRole } from '@prisma/client';
import { Tag } from 'antd';
import React from 'react';

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
