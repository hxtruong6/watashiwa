'use server';

import { prisma } from '@/lib/db';
import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';

/**
 * Helper to get current authenticated user
 * Wrapped in React `cache` to ensure we only hit Supabase Auth once per request
 * even if this is called multiple times by Layout, Page, and Components.
 */
export const getUser = cache(async () => {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		return null;
	}

	return user;
});

/**
 * Ensure Supabase user exists in Prisma DB
 * Called from auth callbacks or ensures consistency
 */
export async function syncUser() {
	try {
		const user = await getUser();
		if (!user) return { success: false, error: 'No authenticated user' };

		// Upsert user to ensure they exist
		const dbUser = await prisma.user.upsert({
			where: { id: user.id },
			update: {
				email: user.email!,
				updatedAt: new Date(),
				avatarUrl: user.user_metadata?.avatar_url,
				lastLogin: new Date(),
			},
			create: {
				id: user.id,
				email: user.email!,
				name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
				avatarUrl: user.user_metadata?.avatar_url,
				lastLogin: new Date(),
			},
		});

		return { success: true, role: dbUser.role };
	} catch (error) {
		console.error('Error syncing user:', error);
		return { success: false, error: 'Failed to sync user' };
	}
}
