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
});

const SubmitReviewSchema = z.object({
	vocabId: z.string(),
	rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

/**
 * Fetch Session with Real Data
 * 1. Get Due Cards (Review)
 * 2. Get New Cards (Learn)
 */
export async function fetchSessionAction(input: { deckId?: string } = {}) {
	return executeSafeAction(
		FetchSessionSchema,
		input,
		async ({ deckId }, { userId }) => {
			if (!userId) return []; // Should be caught by requireAuth but safe check

			const limit = 10; // Fixed session limit for now

			// 1. Fetch Due Reviews
			const dueReviews = await prisma.userReview.findMany({
				where: {
					userId,
					nextReviewAt: { lte: new Date() },
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
						deckId: deckId,
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

/**
 * Submit Review Action (FSRS)
 */
export async function submitReviewAction(input: { vocabId: string; rating: 1 | 2 | 3 | 4 }) {
	return executeSafeAction(
		SubmitReviewSchema,
		input,
		async ({ vocabId, rating }, { userId }) => {
			if (!userId) throw new Error('Unauthorized'); // Double check

			// 1. Get current state (if any)
			const existingReview = await prisma.userReview.findUnique({
				where: {
					userId_vocabId: { userId, vocabId },
				},
			});

			// 2. Prepare FSRS Card
			const now = new Date();
			let fCard: Card;

			if (existingReview) {
				fCard = {
					due: existingReview.nextReviewAt,
					stability: existingReview.stability,
					difficulty: existingReview.difficulty,
					elapsed_days: existingReview.elapsedDays,
					scheduled_days: existingReview.scheduledDays,
					reps: existingReview.reps,
					lapses: existingReview.lapses,
					state: existingReview.state,
					last_review: existingReview.lastReview || undefined,
					learning_steps: 0, // TODO: Implement learning steps
				};
			} else {
				fCard = createEmptyCard(now);
			}

			// 3. Calculate new state
			const fRating = mapRatingToFSRS(rating);
			const fLog = fsrs.repeat(fCard, now)[fRating];

			// 4. Update DB via Nested Write (Atomic)
			const newState = fLog.card;
			const srsStage = getSRSStage(newState);

			const logEntry = {
				userId,
				rating: rating,
				reviewDate: now,
				duration: 0,
				scheduledDays: newState.scheduled_days,
				elapsedDays: newState.elapsed_days,
				state: existingReview?.state || 0,
			};

			await prisma.userReview.upsert({
				where: { userId_vocabId: { userId, vocabId } },
				update: {
					nextReviewAt: newState.due,
					srsStage: srsStage,
					stability: newState.stability,
					difficulty: newState.difficulty,
					elapsedDays: newState.elapsed_days,
					scheduledDays: newState.scheduled_days,
					reps: newState.reps,
					lapses: newState.lapses,
					state: newState.state,
					lastReview: now,
					reviewLogs: {
						create: logEntry,
					},
				},
				create: {
					userId,
					vocabId,
					nextReviewAt: newState.due,
					srsStage: srsStage,
					stability: newState.stability,
					difficulty: newState.difficulty,
					elapsedDays: newState.elapsed_days,
					scheduledDays: newState.scheduled_days,
					reps: newState.reps,
					lapses: newState.lapses,
					state: newState.state,
					lastReview: now,
					reviewLogs: {
						create: logEntry,
					},
				},
			});

			return { success: true, nextReview: newState.due };
		},
		{ requireAuth: true },
	);
}
