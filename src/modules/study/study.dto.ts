import { IdSchema } from '@/modules/core/dto';
import { ReviewLog, UserReview, Vocabulary } from '@prisma/client';
import { z } from 'zod';

// --- Domain Models ---

export type StudyCardWithDetails = UserReview & {
	vocab?: (Vocabulary & { _count?: { cardComments: number } }) | null;
};

// --- Input Schemas ---

export const DeckFilterSchema = z.object({
	deckIdOrIds: z.union([z.string(), z.array(z.string())]).optional(),
});

export const SubmitReviewSchema = z.object({
	cardId: IdSchema,
	rating: z.number().int().min(1).max(4),
	deckIdOrIds: DeckFilterSchema.shape.deckIdOrIds,
});

export const GetQueueSchema = z.object({
	limit: z.number().int().min(1).max(20).default(3).optional(),
	deckIdOrIds: DeckFilterSchema.shape.deckIdOrIds,
});

// --- Output Types ---

export type ReviewResult = {
	nextCard: StudyCardWithDetails | null;
	reviewLog: ReviewLog; // Return the log created
};
