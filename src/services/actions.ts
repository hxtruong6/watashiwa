'use server';

import { prisma } from '@/lib/db';
import { createClient } from '@/utils/supabase/server';
import type { VocabCard } from '@/generated/prisma';
import {
	Card,
	createEmptyCard,
	fsrs,
	generatorParameters,
	Rating,
	ReviewLog,
	State,
} from 'ts-fsrs';

// Initialize FSRS with default parameters
const params = generatorParameters({ enable_fuzz: true });
const f = fsrs(params);

/**
 * Helper to get current authenticated user
 */
async function getUser() {
	const supabase = createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();
	if (error || !user) {
		return null;
	}
	return user;
}

/**
 * Get the next card due for review for the CURRENT user
 */
export async function getNextReviewCard(): Promise<VocabCard | null> {
	try {
		const user = await getUser();
		if (!user) return null; // Or throw error to redirect to login

		const card = await prisma.vocabCard.findFirst({
			where: {
				userId: user.id,
			},
			orderBy: {
				due: 'asc',
			},
		});

		return card;
	} catch (error) {
		console.error('Error fetching next review card:', error);
		return null;
	}
}

/**
 * Convert Prisma VocabCard to FSRS Card object
 */
function toFsrsCard(vocabCard: VocabCard): Card {
	return {
		due: vocabCard.due,
		stability: vocabCard.stability,
		difficulty: vocabCard.difficulty,
		elapsed_days: vocabCard.elapsed_days,
		scheduled_days: vocabCard.scheduled_days,
		reps: vocabCard.reps,
		lapses: vocabCard.lapses,
		state: vocabCard.state as State,
		last_review: vocabCard.last_review || undefined,
	};
}

/**
 * Submit a review for a card using FSRS algorithm
 * Validates ownership
 */
export async function submitReview(
	cardId: string,
	rating: number,
): Promise<{ success: boolean; nextCard?: VocabCard | null; error?: string }> {
	try {
		const user = await getUser();
		if (!user) return { success: false, error: 'Unauthorized' };

		// 1. Fetch current card (ensure owned by user)
		const vocabCard = await prisma.vocabCard.findUnique({
			where: {
				id: cardId,
				userId: user.id, // Security check
			},
		});

		if (!vocabCard) {
			return { success: false, error: 'Card not found or unauthorized' };
		}

		// 2. Validate Rating
		if (![1, 2, 3, 4].includes(rating)) {
			return { success: false, error: 'Invalid rating' };
		}
		const fsrsRating = rating as Rating;

		// 3. FSRS Calculation
		const currentCard = toFsrsCard(vocabCard);
		const now = new Date();
		const schedulingCards = f.repeat(currentCard, now);
		const { card: newCard, log: reviewLog } = schedulingCards[fsrsRating];

		// 4. Update Database
		await prisma.vocabCard.update({
			where: { id: cardId },
			data: {
				due: newCard.due,
				stability: newCard.stability,
				difficulty: newCard.difficulty,
				elapsed_days: newCard.elapsed_days,
				scheduled_days: newCard.scheduled_days,
				reps: newCard.reps,
				lapses: newCard.lapses,
				state: newCard.state,
				last_review: newCard.last_review,
			},
		});

		// Create Review Log with userId
		await prisma.reviewLog.create({
			data: {
				cardId: cardId,
				rating: reviewLog.rating,
				review: reviewLog.review,
				scheduled_days: reviewLog.scheduled_days,
				elapsed_days: reviewLog.elapsed_days,
				state: reviewLog.state,
				userId: user.id,
			},
		});

		console.log(
			`Reviewed Card ${cardId} by User ${user.id}: Rating ${rating} -> Due ${newCard.due.toISOString()}`,
		);

		// 5. Fetch next card
		const nextCard = await getNextReviewCard();

		return { success: true, nextCard };
	} catch (error) {
		console.error('Error submitting review:', error);
		return { success: false, error: 'Failed to submit review' };
	}
}
