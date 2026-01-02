'use server';

import { prisma } from '@/lib/db';
import { UserPreferencesSchema } from '@/lib/schemas/user';
import { executeSafeAction } from '@/modules/core/action-client';
import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';
import { z } from 'zod';

/**
 * Helper to get current authenticated user
 * Wrapped in React `cache` to ensure we only hit Supabase Auth once per request
 * even if this is called multiple times by Layout, Page, and Components.
 * Note: The cookies() call in createClient() will handle dynamic rendering.
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
 * Note: The cookies() call in createClient() will handle dynamic rendering.
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

		// Vietnamese-first preferences for new users
		// Note: language/interfaceLanguage/culturalContext are stored in User model fields, not preferences JSONB
		// Preferences JSONB is for tutorials, haptic feedback, fsrsParams, etc.
		// Validate with Zod schema per architecture requirements
		const vietnamesePreferences = isNewUser
			? UserPreferencesSchema.parse({}) // Empty preferences object, validated
			: undefined;

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
				// Don't set language here - let it default to "en" from schema
				// Language will be set when user completes profile setup
				preferences: vietnamesePreferences || {},
			},
		});

		// No sync needed - page-level checks query DB directly

		// Send welcome email for new users (non-blocking)
		if (isNewUser) {
			// Dynamic import to avoid bundling Inngest in client components
			const { inngest } = await import('@/inngest/client');

			// Trigger welcome email event (non-blocking, fire and forget)
			inngest
				.send({
					name: 'user/registered',
					data: {
						userEmail: dbUser.email,
						userName: dbUser.name || dbUser.email.split('@')[0],
						userId: dbUser.id,
						language: dbUser.language || 'en',
					},
				})
				.catch((error: unknown) => {
					// Log error but don't block user registration
					console.error('Failed to trigger welcome email:', error);
				});
		}

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
 * Note: The cookies() call via getUser() will handle dynamic rendering.
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
