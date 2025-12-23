import { prisma } from '@/lib/db';
import { cleanDatabase } from '@/lib/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateUserSettings } from './user.actions';

// Mock Supabase to return a test user ID
vi.mock('@/utils/supabase/server', () => ({
	createClient: vi.fn(() =>
		Promise.resolve({
			auth: {
				getUser: vi.fn(() =>
					Promise.resolve({
						data: { user: { id: 'test-user-id' } },
						error: null,
					}),
				),
			},
		}),
	),
}));

describe('User Actions (Integration)', () => {
	beforeEach(async () => {
		await cleanDatabase();

		// Create a test user in the real DB
		await prisma.user.create({
			data: {
				id: 'test-user-id',
				email: 'test@example.com',
				name: 'Test User',
				limitNewCards: 10,
				limitReviews: 50,
			},
		});
	});

	it('should update user settings in the real database', async () => {
		const updateInput = {
			limitNewCards: 25,
			limitReviews: 100,
			language: 'vi' as const,
		};

		const result = await updateUserSettings(updateInput);

		expect(result.success).toBe(true);

		// Verify in DB
		const updatedUser = await prisma.user.findUnique({
			where: { id: 'test-user-id' },
		});

		expect(updatedUser?.limitNewCards).toBe(25);
		expect(updatedUser?.limitReviews).toBe(100);
		expect(updatedUser?.language).toBe('vi');
	});

	it('should return unauthorized if no user is found', async () => {
		// Override mock to return no user
		const { createClient } = await import('@/utils/supabase/server');
		(createClient as any).mockImplementationOnce(() =>
			Promise.resolve({
				auth: {
					getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
				},
			}),
		);

		const result = await updateUserSettings({ limitNewCards: 30 });

		expect(result.success).toBe(false);
		expect(result.error).toBe('Unauthorized');
	});
});
