'use server';

import { prisma } from '@/lib/db';
import { getUser } from '@/modules/auth/auth.actions';
import { mapVocabularyToSmartCard } from '@/modules/study/study.mapper';
import { SmartCard } from '@/types/smart-cube';

const DAILY_REVIEW_LIMIT = 50; // Default cap
const NEW_CARD_LIMIT = 10; // Default cap

export async function getReviewQueue(deckId?: string): Promise<{
	queue: SmartCard[];
	source: 'RESUME_SESSION' | 'DUE_REVIEWS' | 'NEW_LESSON' | 'EMPTY';
}> {
	const user = await getUser();
	if (!user) {
		throw new Error('Unauthorized');
	}

	// 1. Check for Active Session (Resume)
	// TODO: Add logic to check for unexpired StudySession (skipped for now to focus on Logic)

	// 2. Determine Deck Context
	let targetDeckId = deckId;

	if (!targetDeckId) {
		// Infer from last activity
		const lastReview = await prisma.userReview.findFirst({
			where: { userId: user.id },
			orderBy: { updatedAt: 'desc' },
			include: { vocab: true },
		});
		targetDeckId = lastReview?.vocab.deckId;
	}

	// Fallback: Pick the first available deck if still null
	if (!targetDeckId) {
		const firstDeck = await prisma.deck.findFirst({
			orderBy: { sortOrder: 'asc' },
		});
		targetDeckId = firstDeck?.id;
	}

	if (!targetDeckId) {
		return { queue: [], source: 'EMPTY' };
	}

	// 3. Priority A: Due Reviews (Across ALL decks or Specific Deck?)
	// User spec: "continue with user deck which are learning". So scoped to deck is safer.
	// Actually, standard SRS is usually global, but let's stick to the deck focus context for "Course" feel.

	const dueReviews = await prisma.userReview.findMany({
		where: {
			userId: user.id,
			vocab: { deckId: targetDeckId },
			nextReviewAt: { lte: new Date() },
			srsStage: { gt: 0 }, // Review, not New
		},
		take: DAILY_REVIEW_LIMIT,
		orderBy: { nextReviewAt: 'asc' }, // Overdue first
		include: { vocab: true },
	});

	// 4. Priority B: New Cards (If we have capacity)
	let newCards: any[] = [];
	if (dueReviews.length < DAILY_REVIEW_LIMIT) {
		const newLimit = Math.min(NEW_CARD_LIMIT, DAILY_REVIEW_LIMIT - dueReviews.length);

		// Find vocabs in this deck that user has NO review for
		// This query can be heavy. Optimization: Use "NOT IN" or "LEFT JOIN" logic.
		// Prisma: findMany where none in UserReview.

		newCards = await prisma.vocabulary.findMany({
			where: {
				deckId: targetDeckId,
				userReviews: {
					none: { userId: user.id },
				},
				contentStatus: { in: ['VERIFIED', 'PUBLISHED'] }, // Only safe content
			},
			take: newLimit,
			orderBy: { wordReading: 'asc' }, // Or sortOrder if available
		});
	}

	// 5. Merge & Map
	const combined = [...dueReviews.map((r) => r.vocab), ...newCards];

	if (combined.length === 0) {
		return { queue: [], source: 'EMPTY' };
	}

	const smartQueue = combined.map(mapVocabularyToSmartCard);

	return {
		queue: smartQueue,
		source: dueReviews.length > 0 ? 'DUE_REVIEWS' : 'NEW_LESSON',
	};
}
