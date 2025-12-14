import { UserRole } from '@/generated/prisma';
import themeConfig from '@/lib/theme/themeConfig';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
	[UserRole.USER]: 1,
	[UserRole.MODERATOR]: 2,
	[UserRole.ADMIN]: 3,
};

/**
 * Check if a user has at least the required role
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
	return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Helper to ensure user has required role, throws error if not
 * Useful for server actions
 */
export function requireRole(userRole: UserRole | undefined, requiredRole: UserRole) {
	if (!userRole || !hasRole(userRole, requiredRole)) {
		throw new Error('Unauthorized: Insufficient permissions');
	}
}

/**
 * Get color for role badge
 */
export function getRoleColor(role: UserRole): string {
	switch (role) {
		case UserRole.ADMIN:
			return themeConfig.token?.colorError || '#E64A19'; // Red
		case UserRole.MODERATOR:
			return themeConfig.token?.colorInfo || '#1976D2'; // Blue
		default:
			return themeConfig.token?.colorTextSecondary || '#8c8c8c'; // Grey
	}
}
