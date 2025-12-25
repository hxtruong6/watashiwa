'use server';

import { prisma } from '@/lib/db';
import { executeSafeAction } from '@/modules/core/action-client';
import { Card, createEmptyCard } from 'ts-fsrs';
import { z } from 'zod';

import { SmartCard, StandardCard, Vocabulary } from './types';
import { fsrs, getSRSStage, mapRatingToFSRS } from './utils/srs-algorithm';

// Input Validation Schemas
const FetchSessionSchema = z.object({
	deckId: z.string().optional(),
	courseId: z.string().optional(),
});

/**
 * Fetch Session with Real Data
 * 1. Get Due Cards (Review)
 * 2. Get New Cards (Learn)
 */
export async function fetchSessionAction(input: { deckId?: string; courseId?: string } = {}) {
	return executeSafeAction(
		FetchSessionSchema,
		input,
		async ({ deckId, courseId }, { userId }) => {
			if (!userId) return [];

			const limit = 10;

			// Resolve Deck IDs
			let targetDeckIds: string[] | undefined = undefined;

			if (deckId) {
				targetDeckIds = [deckId];
			} else if (courseId) {
				const courseDecks = await prisma.courseDeck.findMany({
					where: { courseId },
					select: { deckId: true },
				});
				targetDeckIds = courseDecks.map((cd) => cd.deckId);
			}

			// 1. Fetch Due Reviews
			const dueReviews = await prisma.userReview.findMany({
				where: {
					userId,
					nextReviewAt: { lte: new Date() },
					vocab: targetDeckIds
						? {
								deckId: { in: targetDeckIds },
							}
						: undefined,
				},
				include: { vocab: true },
				take: limit,
				orderBy: { nextReviewAt: 'asc' },
			});

			// 2. Fetch New Cards (if needed to fill quota)
			let newCards: any[] = [];
			if (dueReviews.length < limit) {
				const needed = limit - dueReviews.length;
				newCards = await prisma.vocabulary.findMany({
					where: {
						deckId: targetDeckIds ? { in: targetDeckIds } : undefined,
						userReviews: {
							none: { userId },
						},
					},
					take: needed,
				});
			}

			// 3. Transform to SmartCard
			const combined = [
				...dueReviews.map((r) => ({ ...r.vocab, _review: r })),
				...newCards.map((v) => ({ ...v, _review: null })),
			];

			const sessionCards: SmartCard[] = combined.map((item) => {
				const meanings = item.meanings as any;
				const etymology = item.etymology as any;
				const examples = item.examples as any;
				const mnemonic = item.mnemonic as any;

				const vocab: Vocabulary = {
					...item,
					meanings,
					etymology,
					examples,
					mnemonic,
				};

				const card: StandardCard = {
					id: item._review?.id || `new_${item.id}`,
					vocabId: item.id,
					nextReview: item._review?.nextReviewAt || null,
					srsStage: item._review?.srsStage || 0,
					variant: 'BASIC',
					front: {
						hero: item.wordSurface,
						reading: item.wordReading,
						audio: item.audioUrl || '',
					},
					back: {
						details: vocab,
					},
				};
				return card;
			});

			return sessionCards;
		},
		{ requireAuth: true },
	);
}
