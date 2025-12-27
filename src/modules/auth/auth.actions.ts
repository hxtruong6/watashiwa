'use server';

import { prisma } from '@/lib/db';
import { executeSafeAction } from '@/modules/core/action-client';
import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';
import { z } from 'zod';

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
	return executeSafeAction(z.void(), undefined, async () => {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) throw new Error('No authenticated user');

		// Extract provider info from Supabase metadata
		const provider = user.app_metadata?.provider || 'email';
		const providerId = user.app_metadata?.provider_id || user.id;

		// Get existing user to merge providers
		const existingUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: { authProviders: true, primaryAuthProvider: true },
		});

		const isNewUser = !existingUser;

		// Merge providers (avoid duplicates)
		const existingProviders =
			(existingUser?.authProviders as Array<{
				provider: string;
				providerId: string;
				lastUsed: string;
			}>) || [];
		const providerEntry = {
			provider,
			providerId,
			lastUsed: new Date().toISOString(),
		};

		const updatedProviders = [
			...existingProviders.filter((p) => p.provider !== provider),
			providerEntry,
		];

		// Determine primary provider (prefer OAuth if exists)
		const primaryProvider =
			provider !== 'email' ? provider : existingUser?.primaryAuthProvider || 'email';

		// Upsert user to ensure they exist
		const dbUser = await prisma.user.upsert({
			where: { id: user.id },
			update: {
				email: user.email!,
				updatedAt: new Date(),
				avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
				lastLogin: new Date(),
				authProviders: updatedProviders,
				primaryAuthProvider: primaryProvider,
			},
			create: {
				id: user.id,
				email: user.email!,
				name:
					user.user_metadata?.full_name ||
					user.user_metadata?.name ||
					user.email?.split('@')[0] ||
					'User',
				avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
				lastLogin: new Date(),
				authProviders: [providerEntry],
				primaryAuthProvider: provider,
			},
		});

		return { role: dbUser.role, isNewUser };
	});
}

/**
 * Check if user has completed any study sessions
 * Used for analytics to detect first-time users
 */
export async function hasUserStudiedBefore(userId: string): Promise<boolean> {
	try {
		const reviewCount = await prisma.reviewLog.count({
			where: { userId },
		});
		return reviewCount > 0;
	} catch (error) {
		console.error('Error checking user study history:', error);
		return false;
	}
}

/**
 * Get authenticated user with their role from DB
 * Useful for role-based access control checks
 */
export const getUserWithRole = cache(async () => {
	const user = await getUser();
	if (!user) return null;

	const dbUser = await prisma.user.findUnique({
		where: { id: user.id },
		select: { id: true, role: true, name: true, email: true },
	});

	return dbUser;
});
