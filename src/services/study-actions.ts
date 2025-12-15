'use server';

import { prisma } from '@/lib/db';
import { getUser } from '@/services/actions';
import { Question } from '@/types/exercises';

import { z } from 'zod';

const ExerciseSchema = z.object({
	deckIds: z.array(z.string()).default([]),
	count: z.number().min(1).max(50).default(10),
});

/**
 * Fetches random vocabulary questions for a study session.
 */
export async function getExerciseQuestions(
	deckIds: string[] = [],
	count: number = 10,
): Promise<{ success: boolean; data?: Question[]; error?: string }> {
	const validation = ExerciseSchema.safeParse({ deckIds, count });
	if (!validation.success) {
		return { success: false, error: 'Invalid input parameters.' };
	}
	const cleanData = validation.data;
	// Use cleanData.deckIds and cleanData.count instead of args

	try {
		const user = await getUser();
		if (!user) return { success: false, error: 'Unauthorized' };

		// 1. Build Where Clause
		// 1. Build Where Clause
		// Fix: Allow Public decks OR Owned decks. Previously it was strictly owned decks.
		const whereClause: any = {
			deck: {
				OR: [{ isPublic: true }, { authorId: user.id }],
			},
		};

		if (cleanData.deckIds.length > 0) {
			whereClause.deckId = { in: cleanData.deckIds };
		}

		// 2. Fetch Pool of Vocab
		// Optimization: For large DBs, this is slow. For MVP (small personal decks), fetching ID list then random sampling is okay.
		// Better MVP: Fetch all IDs, shuffle in JS, take top N.

		const allVocabs = await prisma.vocab.findMany({
			where: whereClause,
			select: {
				id: true,
				wordSurface: true,
				meaning: true,
				readingKana: true,
				hanViet: true,
				audioUrl: true,
			},
		});

		if (allVocabs.length < 4) {
			return {
				success: false,
				error: 'NOT_ENOUGH_CARDS',
			};
		}

		// 3. Shuffle (Fisher-Yates)
		const shuffled = [...allVocabs];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}

		// 4. Select Target Candidates
		const candidates = shuffled.slice(0, cleanData.count);

		// 5. Build Questions
		const questions: Question[] = candidates.map((target) => {
			// Pick 3 distractors
			// Improved Distractor Logic: Try to find words with same length first
			const targetLength = target.wordSurface.length;
			// Fix: Filter by MEANING to prevent duplicates
			const pool = allVocabs.filter(
				(v) =>
					v.id !== target.id &&
					v.meaning.trim().toLowerCase() !== target.meaning.trim().toLowerCase(),
			);

			// 1. Try to find candidates with same length
			const sameLength = pool.filter((v) => v.wordSurface.length === targetLength);

			let selectedDistractors: typeof allVocabs = [];

			if (sameLength.length >= 3) {
				// Pick 3 unique by meaning
				const uniqueMeanings = new Set<string>();
				const candidates: typeof allVocabs = [];
				const shuffledSameLength = sameLength.sort(() => 0.5 - Math.random());

				for (const item of shuffledSameLength) {
					if (!uniqueMeanings.has(item.meaning.trim().toLowerCase())) {
						uniqueMeanings.add(item.meaning.trim().toLowerCase());
						candidates.push(item);
						if (candidates.length === 3) break;
					}
				}
				selectedDistractors = candidates;
			}

			// If still not enough (either <3 same length, or duplicates reduced count)
			if (selectedDistractors.length < 3) {
				const currentMeanings = new Set(
					selectedDistractors.map((d) => d.meaning.trim().toLowerCase()),
				);

				// Get others
				const others = pool.filter(
					(v) =>
						v.wordSurface.length !== targetLength &&
						!currentMeanings.has(v.meaning.trim().toLowerCase()),
				);

				const shuffledOthers = others.sort(() => 0.5 - Math.random());

				// Fill up to 3
				for (const item of shuffledOthers) {
					if (selectedDistractors.length >= 3) break;
					if (!currentMeanings.has(item.meaning.trim().toLowerCase())) {
						currentMeanings.add(item.meaning.trim().toLowerCase());
						selectedDistractors.push(item);
					}
				}
			}

			// Shuffle the selected distractors again just in case (though selection was random)
			const distractors = selectedDistractors.map((v) => v.meaning);

			// Shuffle options (Correct + Distractors)
			const options = [...distractors, target.meaning].sort(() => 0.5 - Math.random());

			return {
				id: target.id,
				type: 'multiple_choice',
				challenge: target.wordSurface, // Kanji provided
				correctAnswer: target.meaning, // Identify meaning
				options: options,
				// Metadata
				reading: target.readingKana || undefined,
				meaning: target.meaning,
				hanViet: target.hanViet || undefined,
				audioUrl: target.audioUrl || undefined,
			};
		});

		return { success: true, data: questions };
	} catch (error) {
		console.error('Error fetching exercise questions:', error);
		return { success: false, error: 'Failed to generate exercises.' };
	}
}
