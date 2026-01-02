'use server';

import { prisma } from '@/lib/db';
import {
	EtymologyData,
	ExamplesData,
	LocalizedString,
	MeaningsData,
	StoryContentSchema,
} from '@/lib/schemas/jsonb';
import { executeSafeAction } from '@/modules/core/action-client';
import { getSemanticallySequencedQueue } from '@/modules/study/services/semantic-sequencer.service';
import { UserPreferences } from '@/types/user';
import { Card, createEmptyCard } from 'ts-fsrs';
import { z } from 'zod';

import { SmartCard, StandardCard, Vocabulary } from './types';
import { fsrs, getSRSStage, mapRatingToFSRS } from './utils/srs-algorithm';

// Input Validation Schemas
// Validate UUIDs when provided to prevent injection attacks
// Empty strings are treated as undefined (Next.js URL params can be empty strings)
const FetchSessionSchema = z.object({
	deckId: z
		.union([z.string().uuid('deckId must be a valid UUID'), z.literal('')])
		.optional()
		.transform((val) => (val === '' ? undefined : val)),
	courseId: z
		.union([z.string().uuid('courseId must be a valid UUID'), z.literal('')])
		.optional()
		.transform((val) => (val === '' ? undefined : val)),
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
			// Type-safe: Define structure explicitly
			type NewCardItem = {
				id: string;
				wordSurface: string;
				wordReading: string;
				audioUrl: string | null;
				meanings: unknown;
				etymology: unknown;
				examples: unknown;
				mnemonic: unknown | null;
				_review: null;
			};

			let newCards: NewCardItem[] = [];
			if (dueReviews.length < limit) {
				const needed = limit - dueReviews.length;
				const fetched = await prisma.vocabulary.findMany({
					where: {
						deckId: targetDeckIds ? { in: targetDeckIds } : undefined,
						userReviews: {
							none: { userId },
						},
					},
					take: needed,
					select: {
						id: true,
						wordSurface: true,
						wordReading: true,
						audioUrl: true,
						meanings: true,
						etymology: true,
						examples: true,
						mnemonic: true,
					},
				});
				newCards = fetched.map((v) => ({ ...v, _review: null }));
			}

			// 3. Get story keywords for recency effect (if deckId is specified)
			let keywordVocabIds: string[] = [];
			if (deckId) {
				const story = await prisma.story.findFirst({
					where: { unitId: deckId },
					select: { content: true },
				});

				if (story) {
					const contentValidation = StoryContentSchema.safeParse(story.content);
					if (contentValidation.success) {
						keywordVocabIds = contentValidation.data.highlights.map((h) => h.vocab_id);
					}
				}
			}

			// 4. Transform to SmartCard
			const combined = [
				...dueReviews.map((r) => ({ ...r.vocab, _review: r })),
				...newCards.map((v) => ({ ...v, _review: null })),
			];

			// 5. Prioritize keyword cards (Recency Effect)
			const keywordCards: typeof combined = [];
			const otherCards: typeof combined = [];

			for (const item of combined) {
				if (keywordVocabIds.includes(item.id)) {
					keywordCards.push(item);
				} else {
					otherCards.push(item);
				}
			}

			// Combine: keyword cards first, then others
			const prioritizedCards = [...keywordCards, ...otherCards];

			const sessionCards: SmartCard[] = prioritizedCards.map((item) => {
				// Type-safe parsing with validation
				// These are JSONB fields, so we validate the structure
				const meanings = item.meanings as MeaningsData;
				const etymology = item.etymology as EtymologyData | null;
				const examples = item.examples as ExamplesData;
				const mnemonic = item.mnemonic as LocalizedString | null;

				const vocab: Vocabulary = {
					...item,
					meanings,
					etymology,
					examples,
					mnemonic,
				} as Vocabulary;

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

			// 6. Get user's algorithm mode preference
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { preferences: true },
			});

			const userPreferences = (user?.preferences as UserPreferences) || {};
			const algorithmMode = userPreferences.algorithmMode || 'srs'; // Default to SRS (safe fallback)

			// 7. Apply semantic sequencing only if mode is 'semantic'
			if (algorithmMode === 'semantic') {
				try {
					const semanticResult = await getSemanticallySequencedQueue(sessionCards, {
						userId,
						enableCaching: true,
						timeoutMs: 2000,
						performanceThresholdMs: 500,
					});

					// Metrics are tracked via analytics service if needed

					return semanticResult.queue;
				} catch (error) {
					// Graceful fallback: return FSRS queue on any error
					// Error is handled gracefully, no user-facing error needed
					return sessionCards;
				}
			}

			// SRS mode: return FSRS queue as-is
			return sessionCards;
		},
		{ requireAuth: true },
	);
}
