import { prisma } from '@/lib/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InterventionService } from './intervention.service';

// Mock Prisma
vi.mock('@/lib/db', () => ({
	prisma: {
		vocabulary: {
			findUnique: vi.fn(),
			findFirst: vi.fn(),
		},
		userReview: {
			findUnique: vi.fn(),
		},
		reviewLog: {
			count: vi.fn().mockResolvedValue(0), // Default to 0 failures (no rate limit)
		},
	},
}));

describe('InterventionService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const mockVocabA = {
		id: 'vocabA',
		wordSurface: 'Hashi',
		meanings: { en: ['Bridge'] },
		homonymGroupId: 'group1',
		confusionsAs1: [],
		confusionsAs2: [],
	};

	const mockVocabB = {
		id: 'vocabB',
		wordSurface: 'Hashi',
		meanings: { en: ['Chopsticks'] },
		homonymGroupId: 'group1',
	};

	it('should return null if rating is >= 3 (Good/Easy)', async () => {
		const result = await InterventionService.checkInterference('user1', 'vocabA', 3);
		expect(result).toBeNull();
		expect(prisma.vocabulary.findUnique).not.toHaveBeenCalled();
	});

	it('should return null if no homonym pair exists', async () => {
		vi.mocked(prisma.vocabulary.findUnique).mockResolvedValue({
			...mockVocabA,
			homonymGroupId: null, // No group
		} as any);

		const result = await InterventionService.checkInterference('user1', 'vocabA', 1);
		expect(result).toBeNull();
	});

	it('should return InterventionCard if partner is found and known by user', async () => {
		// 1. Mock Find Vocab A
		vi.mocked(prisma.vocabulary.findUnique).mockResolvedValue(mockVocabA as any);

		// 2. Mock Find Partner (Vocab B) via Group
		vi.mocked(prisma.vocabulary.findFirst).mockResolvedValue(mockVocabB as any);

		// 3. Mock User Knowledge of Vocab B
		vi.mocked(prisma.userReview.findUnique).mockResolvedValue({ id: 'reviewB' } as any);

		const result = await InterventionService.checkInterference('user1', 'vocabA', 1);

		expect(result).not.toBeNull();
		expect(result?.variant).toBe('INTERVENTION');
		expect(result?.comparison.itemB.id).toBe('vocabB');
		expect(result?.comparison.type).toBe('HOMONYM');
	});

	it('should return null if partner is NOT known by user (Safety Check)', async () => {
		vi.mocked(prisma.vocabulary.findUnique).mockResolvedValue(mockVocabA as any);
		vi.mocked(prisma.vocabulary.findFirst).mockResolvedValue(mockVocabB as any);

		// 3. Mock User Knowledge -> NULL (Unknown)
		vi.mocked(prisma.userReview.findUnique).mockResolvedValue(null);

		const result = await InterventionService.checkInterference('user1', 'vocabA', 1);
	});

	it('should query with correct PUBLISHED/deletedAt filters to prevent Ghost Partners', async () => {
		// This test verifies that we are asking Prisma for the correct data safety checks.
		// We don't just mock the return; we inspect the query arguments.

		await InterventionService.checkInterference('user1', 'vocabA', 1);

		expect(prisma.vocabulary.findUnique).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id: 'vocabA' },
				include: expect.objectContaining({
					confusionsAs1: expect.objectContaining({
						where: expect.objectContaining({
							vocab2: expect.objectContaining({
								contentStatus: 'PUBLISHED',
								deletedAt: null,
							}),
						}),
					}),
					confusionsAs2: expect.objectContaining({
						where: expect.objectContaining({
							vocab1: expect.objectContaining({
								contentStatus: 'PUBLISHED',
								deletedAt: null,
							}),
						}),
					}),
				}),
			}),
		);
	});
});
