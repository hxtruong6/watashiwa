import { executeSafeAction } from '@/modules/core/action-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SemanticRelationshipService } from '../services/semantic-relationship.service';
import { getRelatedWordsAction } from './getRelatedWords';

// Mock executeSafeAction to avoid complex Supabase mocking
const mockExecuteSafeAction = vi.fn();
vi.mock('@/modules/core/action-client', () => ({
	executeSafeAction: (...args: any[]) => mockExecuteSafeAction(...args),
}));

// Mock SemanticRelationshipService
vi.mock('../services/semantic-relationship.service', () => ({
	SemanticRelationshipService: {
		getRelatedWords: vi.fn(),
	},
}));

describe('getRelatedWordsAction', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetAllMocks();
		mockExecuteSafeAction.mockClear();
	});

	it('should call SemanticRelationshipService.getRelatedWords with correct params', async () => {
		const mockRelatedWords = [
			{
				vocab: {
					id: 'vocab-1',
					wordSurface: '学生',
					wordReading: 'がくせい',
					meanings: { en: ['student'], vi: ['học sinh'] },
				},
				relationshipTypes: [{ kind: 'confusion', confusionType: 'HOMONYM' }],
				strength: 0.9,
			},
		];

		vi.mocked(SemanticRelationshipService.getRelatedWords).mockResolvedValue(mockRelatedWords);

		// Set up mock implementation
		mockExecuteSafeAction.mockImplementation(async (schema, input, handler) => {
			const validationResult = schema.safeParse(input);
			if (!validationResult.success) {
				return { success: false, error: 'Validation Failed' };
			}
			const data = await handler(validationResult.data, { userId: 'test-user' });
			return { success: true, data };
		});

		const result = await getRelatedWordsAction({ vocabId: '11111111-1111-1111-1111-111111111111' });

		expect(mockExecuteSafeAction).toHaveBeenCalled();
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual(mockRelatedWords);
		}
		expect(SemanticRelationshipService.getRelatedWords).toHaveBeenCalledWith(
			'11111111-1111-1111-1111-111111111111',
			'test-user',
		);
	});

	it('should return empty array when userId is missing', async () => {
		mockExecuteSafeAction.mockImplementation(async (schema, input, handler, options) => {
			// Simulate requireAuth: true and no user
			if (options?.requireAuth) {
				return { success: false, error: 'Unauthorized' };
			}
			const validationResult = schema.safeParse(input);
			if (!validationResult.success) {
				return { success: false, error: 'Validation Failed' };
			}
			const data = await handler(validationResult.data, { userId: null });
			return { success: true, data };
		});

		const result = await getRelatedWordsAction({ vocabId: '11111111-1111-1111-1111-111111111111' });

		expect(result.success).toBe(false);
		expect(result.error).toBe('Unauthorized');
		expect(SemanticRelationshipService.getRelatedWords).not.toHaveBeenCalled();
	});

	it('should return empty array on service error (graceful degradation)', async () => {
		vi.mocked(SemanticRelationshipService.getRelatedWords).mockRejectedValue(
			new Error('Service error'),
		);

		// Set up mock implementation
		mockExecuteSafeAction.mockImplementation(async (schema, input, handler) => {
			const validationResult = schema.safeParse(input);
			if (!validationResult.success) {
				return { success: false, error: 'Validation Failed' };
			}
			const data = await handler(validationResult.data, { userId: 'test-user' });
			return { success: true, data };
		});

		const result = await getRelatedWordsAction({ vocabId: '11111111-1111-1111-1111-111111111111' });

		expect(mockExecuteSafeAction).toHaveBeenCalled();
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual([]);
		}
	});

	it('should validate UUID format', async () => {
		mockExecuteSafeAction.mockImplementation(async (schema, input) => {
			const validationResult = schema.safeParse(input);
			if (!validationResult.success) {
				return { success: false, error: 'Validation Failed' };
			}
			return { success: true, data: [] };
		});

		const result = await getRelatedWordsAction({ vocabId: 'invalid-uuid' });

		expect(mockExecuteSafeAction).toHaveBeenCalled();
		expect(result.success).toBe(false);
		expect(result.error).toBe('Validation Failed');
		expect(SemanticRelationshipService.getRelatedWords).not.toHaveBeenCalled();
	});
});
