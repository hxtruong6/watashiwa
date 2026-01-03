import { prisma } from '@/lib/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { enrollVocabForSessionAction } from './enrollVocabForSession';

// Mock Prisma
vi.mock('@/lib/db', () => ({
	prisma: {
		userReview: {
			upsert: vi.fn(),
		},
	},
}));

// Mock cache invalidation
vi.mock('../services/semantic-relationship.service', () => ({
	invalidateRelatedWordsCache: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../services/semantic-sequencer.service', () => ({
	invalidateSemanticCache: vi.fn().mockResolvedValue(undefined),
}));

// Mock Supabase
const mockGetUser = vi.fn();
const mockCreateClient = vi.fn();

vi.mock('@/utils/supabase/server', () => ({
	createClient: async () => mockCreateClient(),
}));

vi.mock('next/headers', () => ({
	cookies: vi.fn().mockResolvedValue({
		getAll: vi.fn().mockReturnValue([]),
		set: vi.fn(),
	}),
	connection: vi.fn().mockResolvedValue(undefined),
}));

describe('enrollVocabForSessionAction', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetUser.mockResolvedValue({
			data: { user: { id: 'test-user' } },
		});
		mockCreateClient.mockResolvedValue({
			auth: {
				getUser: mockGetUser,
			},
		});
	});

	it('should create UserReview and return StandardCard', async () => {
		const mockVocab = {
			id: 'vocab-1',
			deckId: 'deck-1',
			tags: [],
			wordSurface: '学生',
			wordReading: 'がくせい',
			wordRomaji: null,
			hanViet: 'HỌC SINH',
			meanings: { en: ['student'], vi: ['học sinh'] },
			examples: [],
			etymology: null,
			mnemonic: null,
			audioUrl: null,
			imageUrl: null,
			pitchPattern: null,
			pitchSvgPath: null,
			homonymGroupId: null,
			contentStatus: 'PUBLISHED',
			verifiedAt: null,
			verifiedBy: null,
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
			wordOrder: 0,
		};

		const mockUserReview = {
			id: 'review-1',
			userId: 'test-user',
			vocabId: 'vocab-1',
			srsStage: 0,
			nextReviewAt: new Date(),
			vocab: mockVocab,
		};

		vi.mocked(prisma.userReview.upsert).mockResolvedValue(mockUserReview as any);

		const result = await enrollVocabForSessionAction({
			vocabId: '11111111-1111-1111-1111-111111111111',
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toMatchObject({
				id: 'review-1',
				vocabId: 'vocab-1',
				srsStage: 0,
				variant: 'BASIC',
				front: {
					hero: '学生',
					reading: 'がくせい',
				},
				back: {
					details: expect.objectContaining({
						wordSurface: '学生',
						wordReading: 'がくせい',
					}),
				},
			});
		}
		expect(prisma.userReview.upsert).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					userId_vocabId: {
						userId: 'test-user',
						vocabId: '11111111-1111-1111-1111-111111111111',
					},
				},
			}),
		);
	});

	it('should return existing UserReview if already enrolled', async () => {
		const mockVocab = {
			id: 'vocab-1',
			deckId: 'deck-1',
			tags: [],
			wordSurface: '大学',
			wordReading: 'だいがく',
			wordRomaji: null,
			hanViet: 'ĐẠI HỌC',
			meanings: { en: ['university'], vi: ['đại học'] },
			examples: [],
			etymology: null,
			mnemonic: null,
			audioUrl: null,
			imageUrl: null,
			pitchPattern: null,
			pitchSvgPath: null,
			homonymGroupId: null,
			contentStatus: 'PUBLISHED',
			verifiedAt: null,
			verifiedBy: null,
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
			wordOrder: 0,
		};

		const mockUserReview = {
			id: 'review-existing',
			userId: 'test-user',
			vocabId: 'vocab-1',
			srsStage: 2, // Already in review stage
			nextReviewAt: new Date(),
			vocab: mockVocab,
		};

		vi.mocked(prisma.userReview.upsert).mockResolvedValue(mockUserReview as any);

		const result = await enrollVocabForSessionAction({
			vocabId: '11111111-1111-1111-1111-111111111111',
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data?.srsStage).toBe(2); // Preserves existing stage
		}
	});
});
