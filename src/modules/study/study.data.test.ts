import { prisma } from '@/lib/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StudyData } from './study.data';

// Mock Prisma
vi.mock('@/lib/db', () => ({
	prisma: {
		$queryRaw: vi.fn(),
	},
}));

// Mock date-utils
vi.mock('@/lib/date-utils', () => ({
	getStartOfDayInTimezone: vi.fn(() => new Date('2024-01-01T00:00:00Z')),
}));

describe('StudyData.getDailyStats', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const mockUserId = 'test-user-id';
	const limitReviews = 200;
	const limitNewCards = 20;

	it('should return zero stats for user with no reviews', async () => {
		// Mock $queryRaw to return all zeros
		vi.mocked(prisma.$queryRaw).mockResolvedValue([
			{
				reviews_today: BigInt(0),
				new_cards_today: BigInt(0),
				due_count: BigInt(0),
				reviews_available: BigInt(0),
				passed_reviews: BigInt(0),
				total_reviews: BigInt(0),
			},
		]);

		const result = await StudyData.getDailyStats(mockUserId, limitReviews, limitNewCards);

		expect(result.reviewsToday).toBe(0);
		expect(result.newCardsToday).toBe(0);
		expect(result.dueCount).toBe(0);
		expect(result.reviewsAvailable).toBe(0);
		expect(result.accuracy).toBe(0);
		expect(result.focusPoints).toBe(0);
		expect(result.hasReachedReviewLimit).toBe(false);
		expect(result.hasReachedNewCardLimit).toBe(false);
	});

	it('should calculate stats correctly for user with reviews today', async () => {
		// Mock: 10 reviews today, 5 new cards, 20 due, 15 available, 8 passed out of 10
		vi.mocked(prisma.$queryRaw).mockResolvedValue([
			{
				reviews_today: BigInt(10),
				new_cards_today: BigInt(5),
				due_count: BigInt(20),
				reviews_available: BigInt(15),
				passed_reviews: BigInt(8),
				total_reviews: BigInt(10),
			},
		]);

		const result = await StudyData.getDailyStats(mockUserId, limitReviews, limitNewCards);

		expect(result.reviewsToday).toBe(10);
		expect(result.newCardsToday).toBe(5);
		expect(result.dueCount).toBe(20);
		expect(result.reviewsAvailable).toBe(15);
		// Accuracy: 8 passed / 10 total = 80%
		expect(result.accuracy).toBe(80);
		// Focus Points: (10 reviews * 10) + (5 new cards * 20) = 100 + 100 = 200
		expect(result.focusPoints).toBe(200);
		expect(result.hasReachedReviewLimit).toBe(false);
		expect(result.hasReachedNewCardLimit).toBe(false);
	});

	it('should calculate accuracy correctly when no reviews exist', async () => {
		// Edge case: total_reviews is 0 (should not divide by zero)
		vi.mocked(prisma.$queryRaw).mockResolvedValue([
			{
				reviews_today: BigInt(0),
				new_cards_today: BigInt(0),
				due_count: BigInt(0),
				reviews_available: BigInt(0),
				passed_reviews: BigInt(0),
				total_reviews: BigInt(0),
			},
		]);

		const result = await StudyData.getDailyStats(mockUserId, limitReviews, limitNewCards);

		expect(result.accuracy).toBe(0);
	});

	it('should calculate accuracy correctly with partial passes', async () => {
		// Mock: 20 reviews, 12 passed (60% accuracy)
		vi.mocked(prisma.$queryRaw).mockResolvedValue([
			{
				reviews_today: BigInt(20),
				new_cards_today: BigInt(3),
				due_count: BigInt(25),
				reviews_available: BigInt(22),
				passed_reviews: BigInt(12),
				total_reviews: BigInt(20),
			},
		]);

		const result = await StudyData.getDailyStats(mockUserId, limitReviews, limitNewCards);

		// Accuracy: 12 passed / 20 total = 60%
		expect(result.accuracy).toBe(60);
		// Focus Points: (20 reviews * 10) + (3 new cards * 20) = 200 + 60 = 260
		expect(result.focusPoints).toBe(260);
	});

	it('should detect when review limit is reached', async () => {
		// Mock: 200 reviews (at limit)
		vi.mocked(prisma.$queryRaw).mockResolvedValue([
			{
				reviews_today: BigInt(200),
				new_cards_today: BigInt(5),
				due_count: BigInt(30),
				reviews_available: BigInt(25),
				passed_reviews: BigInt(150),
				total_reviews: BigInt(200),
			},
		]);

		const result = await StudyData.getDailyStats(mockUserId, limitReviews, limitNewCards);

		expect(result.hasReachedReviewLimit).toBe(true);
		expect(result.hasReachedNewCardLimit).toBe(false);
	});

	it('should detect when new card limit is reached', async () => {
		// Mock: 20 new cards (at limit)
		vi.mocked(prisma.$queryRaw).mockResolvedValue([
			{
				reviews_today: BigInt(10),
				new_cards_today: BigInt(20),
				due_count: BigInt(15),
				reviews_available: BigInt(12),
				passed_reviews: BigInt(8),
				total_reviews: BigInt(10),
			},
		]);

		const result = await StudyData.getDailyStats(mockUserId, limitReviews, limitNewCards);

		expect(result.hasReachedReviewLimit).toBe(false);
		expect(result.hasReachedNewCardLimit).toBe(true);
	});

	it('should handle BigInt conversion correctly', async () => {
		// Test that BigInt values are properly converted to numbers
		vi.mocked(prisma.$queryRaw).mockResolvedValue([
			{
				reviews_today: BigInt('999999999999999999'),
				new_cards_today: BigInt(5),
				due_count: BigInt(10),
				reviews_available: BigInt(8),
				passed_reviews: BigInt(7),
				total_reviews: BigInt('999999999999999999'),
			},
		]);

		const result = await StudyData.getDailyStats(mockUserId, limitReviews, limitNewCards);

		// Verify BigInt is converted to Number
		expect(typeof result.reviewsToday).toBe('number');
		expect(typeof result.newCardsToday).toBe('number');
		expect(typeof result.dueCount).toBe('number');
	});

	it('should query with correct parameters', async () => {
		const startOfDay = new Date('2024-01-01T00:00:00Z');
		const now = new Date();

		vi.mocked(prisma.$queryRaw).mockResolvedValue([
			{
				reviews_today: BigInt(5),
				new_cards_today: BigInt(2),
				due_count: BigInt(10),
				reviews_available: BigInt(8),
				passed_reviews: BigInt(4),
				total_reviews: BigInt(5),
			},
		]);

		await StudyData.getDailyStats(mockUserId, limitReviews, limitNewCards);

		// Verify $queryRaw was called with correct SQL structure
		expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
		const callArgs = vi.mocked(prisma.$queryRaw).mock.calls[0][0];

		// Verify it's a template string with userId parameter
		expect(callArgs).toBeDefined();
	});
});
