'use server';

import { prisma } from '@/lib/db';
import { getUser } from '@/modules/auth/auth.actions';
import { UserReview, Vocabulary } from '@prisma/client';

export interface WisdomWordData {
	id: string; // Review ID or Vocab ID? Usually use Vocab ID for display? Or Review ID/Vocab ID tuple.
	kanji: string;
	reading: string;
	meaning: string;
	hanViet: string;
	// Animation props will be handled by the component, but we return data needed
}

type UserReviewWithContent = UserReview & {
	vocab: Vocabulary;
};

/**
 * Fetch "Wisdom Words" for the dashboard.
 * Strategy:
 * 1. Prioritize "Leech" cards (Relearning or High Lapses) -> Repost difficult items.
 * 2. Fill with "Learning" cards -> Keep active items fresh.
 * 3. Fill with "New" cards -> Preview upcoming content.
 */
export async function getMatchaWisdomWords(limit: number = 10): Promise<WisdomWordData[]> {
	try {
		const user = await getUser();
		if (!user) return [];

		// 1. Fetch Candidates
		// Priority A: Leeches (srsStage 3 = Relearning, or Lapses > 2)
		const leeches = (await prisma.userReview.findMany({
			where: {
				userId: user.id,
				OR: [
					{ srsStage: 3 }, // Relearning
					{ lapses: { gt: 2 } }, // Failed often
				],
			},
			take: limit,
			include: { vocab: true },
			orderBy: { lastReview: 'asc' }, // Show ones not seen in a while?
		})) as UserReviewWithContent[];

		let candidates: UserReviewWithContent[] = [...leeches];

		// Priority B: Active Learning (srsStage 1)
		if (candidates.length < limit) {
			const learning = (await prisma.userReview.findMany({
				where: {
					userId: user.id,
					srsStage: 1,
					id: { notIn: candidates.map((c) => c.id) },
				},
				take: limit - candidates.length,
				include: { vocab: true },
				orderBy: { lastReview: 'desc' }, // Recently reviewed
			})) as UserReviewWithContent[];
			candidates = [...candidates, ...learning];
		}

		// Priority C: New (srsStage 0)
		if (candidates.length < limit) {
			const newCards = (await prisma.userReview.findMany({
				where: {
					userId: user.id,
					srsStage: 0,
					id: { notIn: candidates.map((c) => c.id) },
				},
				take: limit - candidates.length,
				include: { vocab: true },
				orderBy: { nextReviewAt: 'desc' }, // CreatedAt is not on UserReview. Use nextReviewAt or just standard index.
			})) as UserReviewWithContent[];
			candidates = [...candidates, ...newCards];
		}

		// Shuffle the results
		const shuffled = candidates.sort(() => Math.random() - 0.5);

		return shuffled.map(mapReviewToWisdom);
	} catch (error) {
		console.error('Error fetching wisdom words:', error);
		return [];
	}
}

function mapReviewToWisdom(review: UserReviewWithContent): WisdomWordData {
	const vocab = review.vocab;
	const isKanji = vocab.tags.includes('kanji');

	// Extract meaning from JSON
	const meaningsEn = (vocab.meanings as any)?.en || [];
	const meaning = meaningsEn[0] || '';

	return {
		id: vocab.id,
		kanji: vocab.wordSurface,
		reading: vocab.wordReading,
		meaning: meaning,
		hanViet: vocab.hanViet || '',
	};
}
