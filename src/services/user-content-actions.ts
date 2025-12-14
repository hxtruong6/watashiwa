'use server';

import { prisma } from '@/lib/db';
import { getUser } from '@/services/actions';
import { revalidatePath } from 'next/cache';

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
