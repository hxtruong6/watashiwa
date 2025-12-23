import { UserReview, Vocabulary } from '@prisma/client';

export type StudyCardWithDetails = UserReview & {
	vocab?: (Vocabulary & { _count?: { cardComments: number } }) | null;
};
