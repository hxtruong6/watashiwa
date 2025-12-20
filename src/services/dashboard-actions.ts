'use server';

import { prisma } from '@/lib/db';
import { getUser } from '@/modules/auth/auth.actions';
import { Kanji, StudyCard, Vocab } from '@prisma/client';

export interface WisdomWordData {
	id: string; // Card ID
	kanji: string;
	reading: string;
	meaning: string;
	hanViet: string;
	// Animation props will be handled by the component, but we return data needed
}

type StudyCardWithContent = StudyCard & {
	vocab: Vocab | null;
	kanji: Kanji | null;
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
		// We fetch a bit more than needed to allow for random sampling if we want,
		// but for now, simple prioritization is fine.

		// Priority A: Leeches (State 3 = Relearning, or Lapses > 2)
		const leeches = (await prisma.studyCard.findMany({
			where: {
				userId: user.id,
				OR: [
					{ state: 3 }, // Relearning
					{ lapses: { gt: 2 } }, // Failed often
				],
			},
			take: limit,
			include: { vocab: true, kanji: true },
			orderBy: { lastReview: 'asc' }, // Show ones not seen in a while?
		})) as unknown as StudyCardWithContent[];

		let candidates: StudyCardWithContent[] = [...leeches];

		// Priority B: Active Learning (State 1)
		if (candidates.length < limit) {
			const learning = (await prisma.studyCard.findMany({
				where: {
					userId: user.id,
					state: 1,
					id: { notIn: candidates.map((c) => c.id) },
				},
				take: limit - candidates.length,
				include: { vocab: true, kanji: true },
				orderBy: { lastReview: 'desc' }, // Recently reviewed
			})) as unknown as StudyCardWithContent[];
			candidates = [...candidates, ...learning];
		}

		// Priority C: New (State 0)
		if (candidates.length < limit) {
			const newCards = (await prisma.studyCard.findMany({
				where: {
					userId: user.id,
					state: 0,
					id: { notIn: candidates.map((c) => c.id) },
				},
				take: limit - candidates.length,
				include: { vocab: true, kanji: true },
				orderBy: { createdAt: 'desc' },
			})) as unknown as StudyCardWithContent[];
			candidates = [...candidates, ...newCards];
		}

		// Shuffle the results so it's not always "Hardest first" in the display list
		const shuffled = candidates.sort(() => Math.random() - 0.5);

		return shuffled.map(mapCardToWisdom).filter((w) => w.kanji); // Filter out any empty mapping
	} catch (error) {
		console.error('Error fetching wisdom words:', error);
		return [];
	}
}

function mapCardToWisdom(card: StudyCardWithContent): WisdomWordData {
	if (card.vocab) {
		return {
			id: card.id,
			kanji: card.vocab.wordSurface,
			reading: card.vocab.readingKana || '',
			meaning: card.vocab.meaning,
			hanViet: card.vocab.hanViet,
		};
	} else if (card.kanji) {
		return {
			id: card.id,
			kanji: card.kanji.kanji,
			reading: card.kanji.onyomi[0] || card.kanji.kunyomi[0] || '', // Pick first reading
			meaning: card.kanji.meaning,
			hanViet: card.kanji.hanViet,
		};
	}
	// Fallback (shouldn't happen if DB clean)
	return {
		id: card.id,
		kanji: '?',
		reading: '',
		meaning: '',
		hanViet: '',
	};
}
