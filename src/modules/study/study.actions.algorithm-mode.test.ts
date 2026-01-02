import { prisma } from '@/lib/db';
import { getUser } from '@/modules/auth/auth.actions';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateAlgorithmModePreference } from './study.actions';

// Mock dependencies
vi.mock('@/lib/db', () => ({
	prisma: {
		user: {
			findUnique: vi.fn(),
			update: vi.fn(),
		},
	},
}));

vi.mock('@/modules/auth/auth.actions', () => ({
	getUser: vi.fn(),
}));

vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}));

describe('updateAlgorithmModePreference', () => {
	const mockUserId = 'test-user-id';

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getUser).mockResolvedValue({
			id: mockUserId,
			email: 'test@example.com',
		} as any);
	});

	it('should validate input with Zod schema', async () => {
		const result = await updateAlgorithmModePreference({
			algorithmMode: 'invalid' as any,
		});

		expect(result.success).toBe(false);
		expect(result.error).toBeDefined();
	});

	it('should update database correctly for semantic mode', async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue({
			id: mockUserId,
			preferences: {},
		} as any);

		vi.mocked(prisma.user.update).mockResolvedValue({
			id: mockUserId,
			preferences: { algorithmMode: 'semantic' },
		} as any);

		const result = await updateAlgorithmModePreference({
			algorithmMode: 'semantic',
		});

		expect(result.success).toBe(true);
		expect(prisma.user.update).toHaveBeenCalledWith({
			where: { id: mockUserId },
			data: {
				preferences: { algorithmMode: 'semantic' },
				updatedAt: expect.any(Date),
			},
		});
	});

	it('should update database correctly for SRS mode', async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue({
			id: mockUserId,
			preferences: { algorithmMode: 'semantic' },
		} as any);

		vi.mocked(prisma.user.update).mockResolvedValue({
			id: mockUserId,
			preferences: { algorithmMode: 'srs' },
		} as any);

		const result = await updateAlgorithmModePreference({
			algorithmMode: 'srs',
		});

		expect(result.success).toBe(true);
		expect(prisma.user.update).toHaveBeenCalledWith({
			where: { id: mockUserId },
			data: {
				preferences: { algorithmMode: 'srs' },
				updatedAt: expect.any(Date),
			},
		});
	});

	it('should merge with existing preferences', async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue({
			id: mockUserId,
			preferences: {
				tutorials: { completedOnboarding: true },
				hapticFeedback: true,
			},
		} as any);

		vi.mocked(prisma.user.update).mockResolvedValue({
			id: mockUserId,
			preferences: {
				tutorials: { completedOnboarding: true },
				hapticFeedback: true,
				algorithmMode: 'semantic',
			},
		} as any);

		const result = await updateAlgorithmModePreference({
			algorithmMode: 'semantic',
		});

		expect(result.success).toBe(true);
		expect(prisma.user.update).toHaveBeenCalledWith({
			where: { id: mockUserId },
			data: {
				preferences: {
					tutorials: { completedOnboarding: true },
					hapticFeedback: true,
					algorithmMode: 'semantic',
				},
				updatedAt: expect.any(Date),
			},
		});
	});

	it('should handle unauthorized access', async () => {
		vi.mocked(getUser).mockResolvedValue(null);

		const result = await updateAlgorithmModePreference({
			algorithmMode: 'semantic',
		});

		expect(result.success).toBe(false);
		expect(result.error).toBeDefined();
		expect(prisma.user.update).not.toHaveBeenCalled();
	});

	it('should handle invalid input', async () => {
		const result = await updateAlgorithmModePreference({
			algorithmMode: 'invalid' as any,
		});

		expect(result.success).toBe(false);
		expect(result.error).toBeDefined();
	});
});
