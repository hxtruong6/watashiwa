'use server';

import { executeSafeAction } from '@/modules/core/action-client';

import { StudyData } from './study.data';
import { GetQueueSchema, SubmitReviewSchema } from './study.dto';
import { StudyService } from './study.service';

/**
 * Get Next Review Card
 */
export async function getNextReviewCard(input: { deckIdOrIds?: string | string[] }) {
	// Manually wrapping because createSafeAction wrapper is abstract
	// Reusing GetQueueSchema for simplicity or defining a new one
	// Let's rely on flexible input for now or use a proper schema

	// Note: The input here comes from the client component usually as args.
	// We'll wrap it.
	return executeSafeAction(
		GetQueueSchema.pick({ deckIdOrIds: true }),
		input,
		async (data, { userId }) => {
			if (!userId) throw new Error('Unauthorized');

			// 1. Check Limits (Basic check, optimizations later)
			const stats = await StudyData.getDailyStats(userId, 200, 20); // Hardcoded limits for V2 MVP
			if (stats.hasReachedReviewLimit) return null;

			// 2. Find Due
			const dueCards = await StudyData.findDueCards(
				userId,
				1,
				Array.isArray(data.deckIdOrIds)
					? data.deckIdOrIds
					: data.deckIdOrIds
						? [data.deckIdOrIds]
						: undefined,
			);
			if (dueCards.length > 0) return dueCards[0];

			// 3. Find New
			if (stats.hasReachedNewCardLimit) return null;
			const candidate = await StudyData.findNewContentCandidate(
				userId,
				Array.isArray(data.deckIdOrIds)
					? data.deckIdOrIds
					: data.deckIdOrIds
						? [data.deckIdOrIds]
						: undefined,
			);

			if (candidate) {
				// Enroll
				return StudyData.createCard(userId, {
					vocabId: candidate.item.id,
				});
			}

			return null;
		},
	);
}

/**
 * Get Queue (Smart Prefetching)
 */
export async function getReviewQueue(input: { deckIdOrIds?: string | string[]; limit?: number }) {
	return executeSafeAction(GetQueueSchema, input, async (data, { userId }) => {
		if (!userId) throw new Error('Unauthorized');

		const limit = data.limit ?? 3;
		const deckIds = Array.isArray(data.deckIdOrIds)
			? data.deckIdOrIds
			: data.deckIdOrIds
				? [data.deckIdOrIds]
				: undefined;

		// 1. Check Limits
		const stats = await StudyData.getDailyStats(userId, 200, 20);
		if (stats.hasReachedReviewLimit) return [];

		// 2. Due Cards
		// Fetch up to limit
		const dueCards = await StudyData.findDueCards(userId, limit, deckIds);

		if (dueCards.length >= limit) return dueCards;

		// 3. New Cards (JIT)
		const queue = [...dueCards];
		const needed = limit - queue.length;

		if (stats.hasReachedNewCardLimit || needed <= 0) return queue;

		// Try to enroll 'needed' amount
		// Naive loop for MVP (optimized in V3)
		for (let i = 0; i < needed; i++) {
			const candidate = await StudyData.findNewContentCandidate(userId, deckIds);
			if (!candidate) break;

			const newCard = await StudyData.createCard(userId, {
				vocabId: candidate.item.id,
			});
			queue.push(newCard);
		}

		return queue;
	});
}

/**
 * Submit Review
 */
export async function submitReview(input: {
	cardId: string;
	rating: number;
	deckIdOrIds?: string | string[];
}) {
	return executeSafeAction(SubmitReviewSchema, input, async (data, { userId }) => {
		if (!userId) throw new Error('Unauthorized');

		// 1. Get Card
		const card = await StudyData.getCardById(data.cardId, userId);
		if (!card) throw new Error('Card not found');

		// 2. Calculate FSRS
		const { nextCard, reviewLog } = StudyService.calculateNextState(card, data.rating);

		// 3. Update DB
		await StudyData.updateCardProgress(
			card.id,
			userId,
			{
				...nextCard,
				last_review: nextCard.last_review || undefined,
			},
			{
				rating: reviewLog.rating,
				review: reviewLog.review,
				duration: 0, // TODO: Add duration tracking to frontend
			},
		);

		// 4. Return next card (Optimistic/Sequential)
		// Note: We need to define how to handle "getNext" inside this action or if client calls it separately.
		// Current V1 pattern returns `nextCard`.
		// Let's call getNextReviewCard directly (internal call, not via action wrapper to save overhead?)
		// Actually, reused logic is better.

		// Helper to re-fetch queue or next card
		const deckIds = data.deckIdOrIds;
		// We can't await exported action easily without double-wrapping.
		// Let's just return success: true and let client fetch next.
		// BUT, requirement says "optimistic UI" or fast response.
		// Let's duplicate the "Get Next" call logic here or extract it to a shared internal function.

		// For modularity, let's extract "findNextCard" logic to Service or Data layer?
		// No, Data layer is CRUD. Service is Logic.
		// Action allows composing.

		// Let's implement a quick "get next" here reusing Data layer.
		const nextReviewCard = (
			await StudyData.findDueCards(
				userId,
				1,
				Array.isArray(deckIds) ? deckIds : deckIds ? [deckIds] : undefined,
			)
		)[0];

			nextCard: nextReviewCard ?? null,
			message: 'Review recorded',
		};
	});
}

/**
 * Get Daily Progress (Dashboard)
 */
export async function getDailyProgress() {
	return executeSafeAction(z.void(), undefined, async (_, { userId }) => {
		if (!userId) throw new Error('Unauthorized');
		// Hardcoded limits for MVP, or fetch user settings?
		// StudyData.getDailyStats assumes limits passed in.
		// We should fetch user settings.
		// Avoiding circular dependency, we fetch settings here or in StudyData?
		// StudyData should be pure data. Logic belongs here.
		// But we don't have access to User settings easily without importing user module.
		// Let's import getUserSettings from user module.
		
		// Wait, user module is separate.
		// Ideally we fetch settings.
		// For now, hardcode or fetch via prisma directly?
		// Let's use hardcoded defaults matching actions.ts: 200, 20.
		
		const stats = await StudyData.getDailyStats(userId, 200, 20);
		return stats;
	});
}

/**
 * Get Review Count (Badge)
 */
export async function getReviewCount() {
	return executeSafeAction(z.void(), undefined, async (_, { userId }) => {
		if (!userId) return 0;
		// Reuse getDailyStats? Or just count.
		// getDailyStats is efficient enough.
		const stats = await StudyData.getDailyStats(userId, 200, 20);
		return stats.dueCount;
	});
}
