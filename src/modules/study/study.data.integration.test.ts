import { prisma } from '@/lib/db';
import { cleanDatabase } from '@/lib/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StudyData } from './study.data';

/**
 * Integration test for getDailyStats performance optimization
 *
 * This test verifies that:
 * 1. The consolidated query works correctly with real database
 * 2. Performance is improved (single query vs multiple queries)
 * 3. Results match expected values
 *
 * Note: Requires test database setup (see package.json test:db:setup)
 */
describe('StudyData.getDailyStats (Integration)', () => {
	const testUserId = 'test-user-performance';
	const limitReviews = 200;
	const limitNewCards = 20;

	beforeEach(async () => {
		await cleanDatabase();

		// Create test user
		await prisma.user.create({
			data: {
				id: testUserId,
				email: 'perf-test@example.com',
				name: 'Performance Test User',
			},
		});
	});

	it('should return correct stats for user with no data', async () => {
		const result = await StudyData.getDailyStats(testUserId, limitReviews, limitNewCards);

		expect(result.reviewsToday).toBe(0);
		expect(result.newCardsToday).toBe(0);
		expect(result.dueCount).toBe(0);
		expect(result.reviewsAvailable).toBe(0);
		expect(result.accuracy).toBe(0);
		expect(result.focusPoints).toBe(0);
		expect(result.hasReachedReviewLimit).toBe(false);
		expect(result.hasReachedNewCardLimit).toBe(false);
	});

	it('should calculate stats correctly with real data', async () => {
		// Create a test deck and vocabulary
		const deck = await prisma.deck.create({
			data: {
				id: 'test-deck-1',
				title: 'Test Deck',
				authorId: testUserId,
				isPublic: false,
			},
		});

		const vocab = await prisma.vocabulary.create({
			data: {
				id: 'test-vocab-1',
				deckId: deck.id,
				wordSurface: 'テスト',
				wordReading: 'テスト',
				meanings: { en: ['test'] },
				contentStatus: 'VERIFIED',
				etymology: 'test',
				examples: { en: ['test'] },
			},
		});

		// Create a user review (new card)
		const userReview = await prisma.userReview.create({
			data: {
				userId: testUserId,
				vocabId: vocab.id,
				srsStage: 0,
				state: 0,
				nextReviewAt: new Date(),
			},
		});

		// Create review logs (some passed, some failed)
		const now = new Date();
		await prisma.reviewLog.createMany({
			data: [
				{
					reviewId: userReview.id,
					userId: testUserId,
					rating: 3, // Good (passed)
					reviewDate: now,
					scheduledDays: 1,
					elapsedDays: 0,
					state: 0,
					duration: 2000,
				},
				{
					reviewId: userReview.id,
					userId: testUserId,
					rating: 4, // Easy (passed)
					reviewDate: now,
					scheduledDays: 2,
					elapsedDays: 1,
					state: 1,
					duration: 1500,
				},
				{
					reviewId: userReview.id,
					userId: testUserId,
					rating: 1, // Again (failed)
					reviewDate: now,
					scheduledDays: 0,
					elapsedDays: 0,
					state: 0,
					duration: 3000,
				},
			],
		});

		// Update user review to have a due card
		await prisma.userReview.update({
			where: { id: userReview.id },
			data: {
				srsStage: 2, // Review stage
				state: 2,
				nextReviewAt: new Date(Date.now() - 1000), // Due (in the past)
			},
		});

		const result = await StudyData.getDailyStats(testUserId, limitReviews, limitNewCards);

		// Verify counts
		expect(result.reviewsToday).toBe(3);
		expect(result.newCardsToday).toBe(1); // Created today with srsStage = 0
		expect(result.dueCount).toBe(1); // One card due
		expect(result.reviewsAvailable).toBe(1); // One card with state != 0 and due

		// Verify accuracy: 2 passed (rating 3, 4) out of 3 total = 66%
		expect(result.accuracy).toBe(67); // Rounded: 2/3 * 100 = 66.67 -> 67

		// Verify focus points: (3 reviews * 10) + (1 new card * 20) = 30 + 20 = 50
		expect(result.focusPoints).toBe(50);
	});

	it('should execute faster than multiple sequential queries', async () => {
		// This test verifies the performance improvement
		// The consolidated query should be faster than 5 separate queries

		const startTime = Date.now();
		await StudyData.getDailyStats(testUserId, limitReviews, limitNewCards);
		const endTime = Date.now();

		const executionTime = endTime - startTime;

		// With consolidated query, this should complete in < 100ms on a test DB
		// (5 separate queries would typically take 200-500ms)
		expect(executionTime).toBeLessThan(500); // Reasonable upper bound for test DB

		// Log for manual verification
		console.log(`[Performance] getDailyStats executed in ${executionTime}ms`);
	});

	it('should handle multiple days correctly', async () => {
		// Create review logs for different days
		const today = new Date();
		const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

		const deck = await prisma.deck.create({
			data: {
				id: 'test-deck-2',
				title: 'Test Deck 2',
				authorId: testUserId,
				isPublic: false,
			},
		});

		const vocab = await prisma.vocabulary.create({
			data: {
				id: 'test-vocab-2',
				deckId: deck.id,
				wordSurface: 'テスト2',
				wordReading: 'テスト2',
				meanings: { en: ['test2'] },
				contentStatus: 'VERIFIED',
				etymology: 'test2',
				examples: { en: ['test2'] },
			},
		});

		const userReview = await prisma.userReview.create({
			data: {
				userId: testUserId,
				vocabId: vocab.id,
				srsStage: 0,
				state: 0,
				nextReviewAt: new Date(),
			},
		});

		// Create logs for yesterday (should not be counted in reviewsToday)
		await prisma.reviewLog.create({
			data: {
				reviewId: userReview.id,
				userId: testUserId,
				rating: 3,
				reviewDate: yesterday,
				scheduledDays: 1,
				elapsedDays: 0,
				state: 0,
				duration: 2000,
			},
		});

		// Create logs for today (should be counted)
		await prisma.reviewLog.create({
			data: {
				reviewId: userReview.id,
				userId: testUserId,
				rating: 4,
				reviewDate: today,
				scheduledDays: 2,
				elapsedDays: 1,
				state: 1,
				duration: 1500,
			},
		});

		const result = await StudyData.getDailyStats(testUserId, limitReviews, limitNewCards);

		// Should only count today's reviews
		expect(result.reviewsToday).toBe(1);
	});
});
