import { StudyCard } from '@prisma/client';
import { Card, Rating, State, fsrs, generatorParameters } from 'ts-fsrs';

/**
 * FSRS Configuration
 */
const params = generatorParameters({ enable_fuzz: true });
const f = fsrs(params);

/**
 * Business Logic Service for Study Module
 * Pure TS, no DB access.
 */
export const StudyService = {
	/**
	 * Convert Prisma Card to FSRS Card
	 */
	toFsrsCard: (card: StudyCard): Card => {
		return {
			due: card.due,
			stability: card.stability,
			difficulty: card.difficulty,
			elapsed_days: card.elapsedDays,
			scheduled_days: card.scheduledDays,
			reps: card.reps,
			lapses: card.lapses,
			state: card.state as State,
			last_review: card.lastReview || undefined,
			learning_steps: 0, // Add if we support learning steps
		};
	},

	/**
	 * Calculate Next Interval
	 */
	calculateNextState: (currentCard: StudyCard, rating: number) => {
		if (![1, 2, 3, 4].includes(rating)) {
			throw new Error('Invalid rating');
		}

		const fsrsCard = StudyService.toFsrsCard(currentCard);
		const now = new Date();
		const schedulingCards = f.repeat(fsrsCard, now);

		const fsrsRating = rating as Rating;
		const recordLog = schedulingCards[fsrsRating]; // This is RecordLogItem { card, log }

		if (!recordLog) {
			throw new Error('Failed to calculate schedule');
		}

		return {
			nextCard: recordLog.card,
			reviewLog: recordLog.log,
		};
	},
};
