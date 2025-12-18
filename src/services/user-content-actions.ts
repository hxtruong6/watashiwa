'use server';

import { prisma } from '@/lib/db';
import { getUser } from '@/services/actions';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const IdSchema = z.string().min(1);

const CreateDeckSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	isPublic: z.boolean().optional(),
	headerImage: z.string().optional(),
});

const UpdateDeckSchema = CreateDeckSchema.partial();

const CreateVocabSchema = z.object({
	wordSurface: z.string().min(1),
	readingKana: z.string().min(1),
	meaning: z.string().min(1),
	hanViet: z.string().optional(),
	exampleSentence: z.any().optional(),
	kanjiBreakdown: z.any().optional(),
	wordParts: z.any().optional(),
	imageUrl: z.string().optional(),
});

const CreateKanjiSchema = z.object({
	kanji: z.string().min(1),
	onyomi: z.array(z.string()),
	kunyomi: z.array(z.string()),
	meaning: z.string().min(1),
	strokes: z.number().int().min(0),
	hanViet: z.string().min(1),
	radicals: z.any().optional(),
	examples: z.any().optional(),
	imageUrl: z.string().optional(),
});

// Replaced simple getUserDecks with this stats-enriched version
export async function getUserDecksWithStats() {
	try {
		const user = await getUser();
		if (!user) return { learningDecks: [], createdDecks: [] };

		const now = new Date();

		// Get all decks user created
		const createdDecks = await prisma.deck.findMany({
			where: {
				authorId: user.id,
			},
			include: {
				_count: {
					select: { vocab: true, kanji: true },
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		// Get all public decks the user might be learning from
		const publicDecks = await prisma.deck.findMany({
			where: {
				isPublic: true,
				authorId: { not: user.id }, // Exclude own decks
			},
			include: {
				_count: {
					select: { vocab: true, kanji: true },
				},
			},
		});

		// Check which decks user is actively learning (has cards from)
		const allDecks = [...publicDecks, ...createdDecks];
		const learningDecksWithStats = [];

		for (const deck of allDecks) {
			// Get all cards from this deck that the user has (inline stats calculation)
			const userCards = await prisma.studyCard.findMany({
				where: {
					userId: user.id,
					OR: [{ vocab: { deckId: deck.id } }, { kanji: { deckId: deck.id } }],
				},
				select: {
					id: true,
					due: true,
					state: true,
					stability: true,
					lastReview: true,
				},
			});

			if (userCards.length > 0) {
				// Calculate statistics
				const dueCount = userCards.filter((card) => card.due <= now).length;
				const totalCards = userCards.length;
				const masteredCount = userCards.filter(
					(card) => card.state === 2 && card.stability !== null && card.stability > 21,
				).length;

				const lastStudiedCard = userCards
					.filter((card) => card.lastReview !== null)
					.sort((a, b) => {
						if (!a.lastReview || !b.lastReview) return 0;
						return b.lastReview.getTime() - a.lastReview.getTime();
					})[0];

				// Estimate Next Review (earliest due date in future)
				const futureCards = userCards
					.filter((c) => c.due > now)
					.sort((a, b) => a.due.getTime() - b.due.getTime());
				const nextReview = futureCards.length > 0 ? futureCards[0].due : null;

				learningDecksWithStats.push({
					...deck,
					learningStats: {
						hasCards: true,
						dueCount,
						totalCards,
						masteredCount,
						lastStudied: lastStudiedCard?.lastReview || null,
						nextReview,
					},
				});
			}
		}

		// Optimize Learner Count: Use SINGLE SQL query instead of N+1 loop
		// This scales much better for 10,000 users.
		const createdDeckIds = createdDecks.map((d) => d.id);

		let learnersCounts: { deck_id: string; count: number }[] = [];

		if (createdDeckIds.length > 0) {
			try {
				// We need to join StudyCard -> Vocab/Kanji -> Deck to group by deck_id
				// "StudyCard", "Vocab", "Kanji" are table names (prisma defaults to PascalCase models if not mapped)
				// Fields: user_id, vocab_id, kanji_id, deck_id are mapped in schema
				learnersCounts = await prisma.$queryRaw`
					SELECT 
						COALESCE(v.deck_id, k.deck_id) as deck_id,
						COUNT(DISTINCT sc.user_id)::int as count
					FROM "StudyCard" sc
					LEFT JOIN "Vocab" v ON sc.vocab_id = v.id
					LEFT JOIN "Kanji" k ON sc.kanji_id = k.id
					WHERE 
						(v.deck_id IN (${Prisma.join(createdDeckIds)}) OR k.deck_id IN (${Prisma.join(createdDeckIds)}))
						AND sc.user_id != ${user.id}
					GROUP BY COALESCE(v.deck_id, k.deck_id)
				`;
			} catch (err) {
				console.error('Failed to count learners via raw SQL, falling back to 0', err);
				// Fallback to 0 if query fails (e.g. migration mismatch)
			}
		}

		// Map counts back to decks
		const createdDecksWithStats = createdDecks.map((deck) => {
			const stat = learnersCounts.find((row) => row.deck_id === deck.id);
			return {
				...deck,
				learnersCount: stat ? Number(stat.count) : 0,
			};
		});

		// Sort learning decks by due count (desc), then last studied (desc)
		learningDecksWithStats.sort((a, b) => {
			// First by due count
			if (b.learningStats.dueCount !== a.learningStats.dueCount) {
				return b.learningStats.dueCount - a.learningStats.dueCount;
			}
			// Then by last studied (more recent first)
			const aTime = a.learningStats.lastStudied?.getTime() || 0;
			const bTime = b.learningStats.lastStudied?.getTime() || 0;
			return bTime - aTime;
		});

		return {
			learningDecks: learningDecksWithStats,
			createdDecks: createdDecksWithStats,
		};
	} catch (error) {
		console.error('Error fetching user decks with stats:', error);
		return { learningDecks: [], createdDecks: [] };
	}
}

// Kept for backward compatibility if needed, but updated page uses getUserDecksWithStats
export async function getUserDecks() {
	try {
		const user = await getUser();
		if (!user) return [];

		const decks = await prisma.deck.findMany({
			where: {
				authorId: user.id,
			},
			include: {
				_count: {
					select: { vocab: true, kanji: true },
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
		return decks;
	} catch (error) {
		console.error('Error fetching user decks:', error);
		return [];
	}
}

export async function createDeck(data: {
	title: string;
	description?: string;
	isPublic?: boolean;
	headerImage?: string;
}) {
	try {
		const validation = CreateDeckSchema.safeParse(data);
		if (!validation.success) return { success: false, error: 'Invalid data' };

		const user = await getUser();
		if (!user) return { success: false, error: 'Unauthorized' };

		const deck = await prisma.deck.create({
			data: {
				title: data.title,
				description: data.description,
				isPublic: data.isPublic ?? false,
				headerImage: data.headerImage,
				authorId: user.id,
			},
		});

		revalidatePath('/dashboard/decks');
		return { success: true, deck };
	} catch (error) {
		console.error('Error creating deck:', error);
		return { success: false, error: 'Failed to create deck' };
	}
}

export async function updateDeck(
	id: string,
	data: {
		title?: string;
		description?: string;
		isPublic?: boolean;
		headerImage?: string;
	},
) {
	try {
		const user = await getUser();
		if (!user) return { success: false, error: 'Unauthorized' };

		// Verify ownership
		const existing = await prisma.deck.findUnique({
			where: { id },
		});

		if (!existing || existing.authorId !== user.id) {
			return { success: false, error: 'Deck not found or unauthorized' };
		}

		const deck = await prisma.deck.update({
			where: { id },
			data: {
				...data,
			},
		});

		revalidatePath('/dashboard/decks');
		revalidatePath(`/decks/${id}`);
		return { success: true, deck };
	} catch (error) {
		console.error('Error updating deck:', error);
		return { success: false, error: 'Failed to update deck' };
	}
}

export async function deleteDeck(id: string) {
	try {
		if (!IdSchema.safeParse(id).success) return { success: false, error: 'Invalid ID' };
		const user = await getUser();
		if (!user) return { success: false, error: 'Unauthorized' };

		const existing = await prisma.deck.findUnique({
			where: { id },
		});

		if (!existing || existing.authorId !== user.id) {
			return { success: false, error: 'Deck not found or unauthorized' };
		}

		await prisma.deck.delete({
			where: { id },
		});

		revalidatePath('/dashboard/decks');
		return { success: true };
	} catch (error) {
		console.error('Error deleting deck:', error);
		return { success: false, error: 'Failed to delete deck' };
	}
}

export async function createVocab(
	deckId: string,
	data: {
		wordSurface: string;
		readingKana: string;
		meaning: string;
		hanViet?: string;
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		exampleSentence?: any; // Json
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		kanjiBreakdown?: any; // Json
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		wordParts?: any; // Json
		imageUrl?: string;
	},
) {
	try {
		const user = await getUser();
		if (!user) return { success: false, error: 'Unauthorized' };

		// Verify deck ownership
		const deck = await prisma.deck.findUnique({
			where: { id: deckId },
		});
		if (!deck || deck.authorId !== user.id) {
			return { success: false, error: 'Deck not found or unauthorized' };
		}

		const vocab = await prisma.vocab.create({
			data: {
				deckId,
				wordSurface: data.wordSurface,
				readingKana: data.readingKana,
				meaning: data.meaning,
				hanViet: data.hanViet ?? '',
				exampleSentence: data.exampleSentence ?? {},
				kanjiBreakdown: data.kanjiBreakdown ?? [],
				wordParts: data.wordParts,
				imageUrl: data.imageUrl,
			},
		});

		revalidatePath(`/decks/${deckId}`);
		return { success: true, vocab };
	} catch (error) {
		console.error('Error creating vocab:', error);
		return { success: false, error: 'Failed to create vocab' };
	}
}

export async function createKanji(
	deckId: string,
	data: {
		kanji: string;
		onyomi: string[];
		kunyomi: string[];
		meaning: string;
		strokes: number;
		hanViet: string;
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		radicals?: any;
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		examples?: any;
		imageUrl?: string;
	},
) {
	try {
		const user = await getUser();
		if (!user) return { success: false, error: 'Unauthorized' };

		// Verify deck ownership
		const deck = await prisma.deck.findUnique({
			where: { id: deckId },
		});
		if (!deck || deck.authorId !== user.id) {
			return { success: false, error: 'Deck not found or unauthorized' };
		}

		const kanji = await prisma.kanji.create({
			data: {
				deckId,
				kanji: data.kanji,
				onyomi: data.onyomi,
				kunyomi: data.kunyomi,
				meaning: data.meaning,
				strokes: data.strokes,
				hanViet: data.hanViet,
				radicals: data.radicals ?? [],
				examples: data.examples ?? [],
				imageUrl: data.imageUrl,
			},
		});

		revalidatePath(`/decks/${deckId}`);
		return { success: true, kanji };
	} catch (error) {
		console.error('Error creating kanji:', error);
		return { success: false, error: 'Failed to create kanji' };
	}
}

export async function deleteContent(type: 'vocab' | 'kanji', id: string) {
	try {
		if (!IdSchema.safeParse(id).success) return { success: false, error: 'Invalid ID' };
		const user = await getUser();
		if (!user) return { success: false, error: 'Unauthorized' };

		if (type === 'vocab') {
			const item = await prisma.vocab.findUnique({
				where: { id },
				include: { deck: true },
			});
			if (!item || item.deck.authorId !== user.id) {
				return { success: false, error: 'Unauthorized' };
			}
			await prisma.vocab.delete({ where: { id } });
			revalidatePath(`/decks/${item.deckId}`);
		} else {
			const item = await prisma.kanji.findUnique({
				where: { id },
				include: { deck: true },
			});
			if (!item || item.deck.authorId !== user.id) {
				return { success: false, error: 'Unauthorized' };
			}
			await prisma.kanji.delete({ where: { id } });
			revalidatePath(`/decks/${item.deckId}`);
		}

		return { success: true };
	} catch (error) {
		console.error(`Error deleting ${type}:`, error);
		return { success: false, error: 'Failed to delete' };
	}
}
