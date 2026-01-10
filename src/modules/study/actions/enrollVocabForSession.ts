'use server';

import { prisma } from '@/lib/db';
import {
	EtymologySchema,
	ExamplesSchema,
	FuriganaMappingSchema,
	LocalizedString,
	MeaningsSchema,
} from '@/lib/schemas/jsonb';
import { executeSafeAction } from '@/modules/core/action-client';
import { StandardCard } from '@/modules/flashcard/types';
import { invalidateRelatedWordsCache } from '@/modules/study/services/semantic-relationship.service';
import { invalidateSemanticCache } from '@/modules/study/services/semantic-sequencer.service';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const EnrollVocabSchema = z.object({
	vocabId: z.string().uuid(),
});

// Proper Prisma type for UserReview with included vocab relation
type UserReviewWithVocab = Prisma.UserReviewGetPayload<{
	include: {
		vocab: {
			select: {
				id: true;
				deckId: true;
				tags: true;
				wordSurface: true;
				wordReading: true;
				wordRomaji: true;
				hanViet: true;
				meanings: true;
				examples: true;
				etymology: true;
				mnemonic: true;
				audioUrl: true;
				imageUrl: true;
				pitchPattern: true;
				pitchSvgPath: true;
				homonymGroupId: true;
				furiganaMapping: true;
				contentStatus: true;
				verifiedAt: true;
				verifiedBy: true;
				createdAt: true;
				updatedAt: true;
				deletedAt: true;
				wordOrder: true;
			};
		};
	};
}>;

/**
 * Enroll a vocabulary item for the current user's study session
 * Creates or retrieves UserReview and returns a SmartCard ready to be added to session queue
 */
export async function enrollVocabForSessionAction(input: { vocabId: string }) {
	return executeSafeAction(
		EnrollVocabSchema,
		input,
		async ({ vocabId }, { userId }) => {
			if (!userId) {
				throw new Error('Unauthorized');
			}

			// 1. Find or create UserReview
			const userReview: UserReviewWithVocab = await prisma.userReview.upsert({
				where: {
					userId_vocabId: { userId, vocabId },
				},
				update: {
					// If already exists, just return it (don't reset progress)
					updatedAt: new Date(),
				},
				create: {
					userId,
					vocabId,
					srsStage: 0, // New
					state: 0,
					nextReviewAt: new Date(),
				},
				include: {
					vocab: {
						select: {
							id: true,
							deckId: true,
							tags: true,
							wordSurface: true,
							wordReading: true,
							wordRomaji: true,
							hanViet: true,
							meanings: true,
							examples: true,
							etymology: true,
							mnemonic: true,
							audioUrl: true,
							imageUrl: true,
							pitchPattern: true,
							pitchSvgPath: true,
							homonymGroupId: true,
							furiganaMapping: true,
							contentStatus: true,
							verifiedAt: true,
							verifiedBy: true,
							createdAt: true,
							updatedAt: true,
							deletedAt: true,
							wordOrder: true,
						},
					},
				},
			});

			// 2. Parse JSONB fields
			const meanings = MeaningsSchema.parse(userReview.vocab.meanings);
			const etymology = userReview.vocab.etymology
				? EtymologySchema.parse(userReview.vocab.etymology)
				: null;
			const examples = ExamplesSchema.parse(userReview.vocab.examples);
			const mnemonic = userReview.vocab.mnemonic
				? (userReview.vocab.mnemonic as LocalizedString)
				: null;
			const furiganaMapping = userReview.vocab.furiganaMapping
				? FuriganaMappingSchema.parse(userReview.vocab.furiganaMapping)
				: null;

			// 3. Build Vocabulary domain object
			const vocab = {
				...userReview.vocab,
				meanings,
				etymology,
				examples,
				mnemonic,
				furiganaMapping,
			};

			// 4. Build StandardCard (SmartCard)
			const card: StandardCard = {
				id: userReview.id,
				vocabId: userReview.vocabId,
				nextReview: userReview.nextReviewAt,
				srsStage: userReview.srsStage,
				variant: 'BASIC',
				front: {
					hero: vocab.wordSurface,
					reading: vocab.wordReading,
					audio: vocab.audioUrl || '',
				},
				back: {
					details: vocab,
				},
			};

			// 5. Invalidate caches (user's vocabulary state changed)
			await Promise.all([
				invalidateRelatedWordsCache(userId),
				invalidateSemanticCache(userId),
			]).catch((err) => {
				// Non-blocking: log but don't fail the enrollment
				console.warn('[enrollVocabForSession] Cache invalidation failed (non-critical):', err);
			});

			return card;
		},
		{ requireAuth: true },
	);
}
