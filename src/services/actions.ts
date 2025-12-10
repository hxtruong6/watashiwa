'use server';

import { prisma } from '@/lib/db';
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
 * Get the next card due for review
 * Fetches the card with the earliest due date
 */
export async function getNextReviewCard(): Promise<VocabCard | null> {
	try {
		const card = await prisma.vocabCard.findFirst({
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
 */
export async function submitReview(
	cardId: string,
	rating: number,
): Promise<{ success: boolean; nextCard?: VocabCard | null; error?: string }> {
	try {
		// 1. Fetch current card
		const vocabCard = await prisma.vocabCard.findUnique({
			where: { id: cardId },
		});

		if (!vocabCard) {
			return { success: false, error: 'Card not found' };
		}

		// 2. Validate Rating
		if (![1, 2, 3, 4].includes(rating)) {
			return { success: false, error: 'Invalid rating' };
		}
		const fsrsRating = rating as Rating; // 1=Again, 2=Hard, 3=Good, 4=Easy

		// 3. FSRS Calculation
		const currentCard = toFsrsCard(vocabCard);
		const now = new Date();
		// f.repeat returns record of all possible outcomes. We pick the one for our rating.
		const schedulingCards = f.repeat(currentCard, now);
		const { card: newCard, log: reviewLog } = schedulingCards[fsrsRating];

		// 4. Update Database
		// Update the Card
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

		// Create Review Log
		await prisma.reviewLog.create({
			data: {
				cardId: cardId,
				rating: reviewLog.rating,
				review: reviewLog.review,
				scheduled_days: reviewLog.scheduled_days,
				elapsed_days: reviewLog.elapsed_days,
				state: reviewLog.state,
			},
		});

		console.log(`Reviewed Card ${cardId}: Rating ${rating} -> Due ${newCard.due.toISOString()}`);

		// 5. Fetch next card immediately for smooth UX
		const nextCard = await getNextReviewCard();

		return { success: true, nextCard };
	} catch (error) {
		console.error('Error submitting review:', error);
		return { success: false, error: 'Failed to submit review' };
	}
}
