import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStudySession } from './useStudySession';
import * as actions from '@/services/actions';
import * as courseActions from '@/services/course-actions';

// Mock external actions
vi.mock('@/services/actions', () => ({
	submitReview: vi.fn(),
	getDailyProgress: vi.fn(),
	getReviewQueue: vi.fn(),
}));

vi.mock('@/services/course-actions', () => ({
	getCourseById: vi.fn(),
}));

vi.mock('antd', async () => {
	return {
		App: {
			useApp: () => ({
				message: { error: vi.fn() },
			}),
		},
	};
});

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}));

describe('useStudySession Hook', () => {
	const mockCard = { id: 'c1', deckId: 'd1', state: 0 };

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(actions.getDailyProgress).mockResolvedValue({
			reviewsToday: 0,
			limitReviews: 100,
			newCardsToday: 0,
			limitNewCards: 20,
			dueCount: 10,
			reviewsAvailable: 10,
			// totalReviewCount: 0,
			// masteredCount: 0,
			// learningCount: 0,
			// newCount: 0,
		});
	});

	it('initializes with loading state', async () => {
		vi.mocked(actions.getReviewQueue).mockResolvedValue([]);

		const { result } = renderHook(() => useStudySession({ deckId: 'd1' }));

		expect(result.current.loading).toBe(true);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});
	});

	it('fetches cards on mount and sets first card', async () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		vi.mocked(actions.getReviewQueue).mockResolvedValue([mockCard as any]);

		const { result } = renderHook(() => useStudySession({ deckId: 'd1' }));

		await waitFor(() => {
			expect(result.current.card).toEqual(mockCard);
			expect(result.current.loading).toBe(false);
		});
	});

	it('completes session when queue is empty/server returns empty', async () => {
		vi.mocked(actions.getReviewQueue).mockResolvedValue([]);

		const { result } = renderHook(() => useStudySession({ deckId: 'd1' }));

		await waitFor(() => {
			expect(result.current.sessionComplete).toBe(true);
		});
	});

	it('optimistically updates stats on rate', async () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		vi.mocked(actions.getReviewQueue).mockResolvedValue([mockCard as any]);
		vi.mocked(actions.submitReview).mockResolvedValue({ success: true });

		const { result } = renderHook(() => useStudySession({ deckId: 'd1' }));

		// Wait for load
		await waitFor(() => expect(result.current.card).toBeTruthy());

		// Rate
		act(() => {
			result.current.handleRate(3);
		});

		// Expect stats update
		expect(result.current.dailyStats.reviewsToday).toBe(1);

		// Check submit called
		expect(actions.submitReview).toHaveBeenCalledWith('c1', 3, 'd1');
	});
});
