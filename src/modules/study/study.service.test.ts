import { StudyCard } from '@/lib/db';
import { describe, it } from 'node:test';
import { expect } from 'vitest';

import { StudyService } from './study.service';

describe('StudyService', () => {
	const mockCard: StudyCard = {
		id: '123',
		userId: 'user1',
		vocabId: 'vocab1',
		kanjiId: null,
		deckId: 'deck1',
		due: new Date(),
		stability: 0,
		difficulty: 0,
		elapsedDays: 0,
		scheduledDays: 0,
		reps: 0,
		lapses: 0,
		state: 0,
		lastReview: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	it('should convert Prisma card to FSRS card correctly', () => {
		const fsrsCard = StudyService.toFsrsCard(mockCard);
		expect(fsrsCard.state).toBe(0);
		expect(fsrsCard.reps).toBe(0);
		expect(fsrsCard.due).toEqual(mockCard.due);
	});

	it('should calculate next state for "Good" rating', () => {
		const result = StudyService.calculateNextState(mockCard, 3);

		expect(result.nextCard.state).not.toBe(0); // Should move out of New state
		expect(result.nextCard.reps).toBe(1);
		expect(result.reviewLog.rating).toBe(3);
	});

	it('should throw error for invalid rating', () => {
		expect(() => StudyService.calculateNextState(mockCard, 5)).toThrow('Invalid rating');
	});
});
