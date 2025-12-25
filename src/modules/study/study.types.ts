import { UserReview, Vocabulary } from '@prisma/client';

export type StudyCardWithDetails = UserReview & {
	vocab?: (Vocabulary & { _count?: { cardComments: number } }) | null;
};

export interface InterventionPayload {
	vocabId1: string;
	vocabId2: string;
	vocab1: Vocabulary;
	vocab2: Vocabulary;
	explanation: any; // ConfusionExplanation schema
}

export type QueueItem =
	| { type: 'REVIEW'; id: string }
	| { type: 'INTERVENTION'; id: string; originId: string; payload: InterventionPayload };
