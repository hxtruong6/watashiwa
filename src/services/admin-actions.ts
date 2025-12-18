'use server';

import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

import { getUser } from './actions';

const IdSchema = z.string().min(1);

const DeckSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	isPublic: z.boolean(),
});

const UpdateDeckSchema = DeckSchema.partial();

const VocabSchema = z.object({
	deckId: IdSchema,
	wordSurface: z.string().min(1),
	readingKana: z.string().min(1),
	meaning: z.string().min(1),
	hanViet: z.string().optional(),
	exampleSentence: z.any().optional(),
	wordParts: z.any().optional(),
});

const KanjiSchema = z.object({
	deckId: IdSchema,
	kanji: z.string().min(1),
	meaning: z.string().min(1),
	hanViet: z.string().optional(),
	onyomi: z.string().optional(),
	kunyomi: z.string().optional(),
	strokes: z.number().int().min(0).optional(),
	examples: z.any().optional(),
});

// Helper to ensure Admin/Mod access
async function requireAdminOrMod() {
	const user = await getUser();
	if (!user) throw new Error('Unauthorized');

	const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
	if (!dbUser || (dbUser.role !== UserRole.ADMIN && dbUser.role !== UserRole.MODERATOR)) {
		throw new Error('Forbidden: Admin or Moderator access required');
	}
	return dbUser;
}

// --- Deck Management ---

export async function getAdminDecks() {
	try {
		await requireAdminOrMod();
		const decks = await prisma.deck.findMany({
			orderBy: { createdAt: 'desc' },
			include: {
				author: { select: { name: true, email: true } },
				_count: { select: { vocab: true, kanji: true } },
			},
		});
		return { success: true, data: decks };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function getAdminDeck(id: string) {
	try {
		if (!IdSchema.safeParse(id).success) return { success: false, error: 'Invalid ID' };
		await requireAdminOrMod();
		const deck = await prisma.deck.findUnique({
			where: { id },
			include: {
				vocab: { orderBy: { createdAt: 'desc' } },
				kanji: { orderBy: { createdAt: 'desc' } },
			},
		});
		return { success: true, data: deck };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function createDeck(data: { title: string; description?: string; isPublic: boolean }) {
	try {
		const validation = DeckSchema.safeParse(data);
		if (!validation.success) return { success: false, error: 'Invalid data' };

		const user = await requireAdminOrMod();
		const deck = await prisma.deck.create({
			data: {
				title: data.title,
				description: data.description,
				isPublic: data.isPublic,
				authorId: user.id,
			},
		});
		return { success: true, data: deck };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function updateDeck(
	id: string,
	data: { title?: string; description?: string; isPublic?: boolean },
) {
	try {
		if (!IdSchema.safeParse(id).success) return { success: false, error: 'Invalid ID' };
		const validation = UpdateDeckSchema.safeParse(data);
		if (!validation.success) return { success: false, error: 'Invalid data' };

		await requireAdminOrMod();
		const deck = await prisma.deck.update({
			where: { id },
			data,
		});
		return { success: true, data: deck };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function deleteDeck(id: string) {
	try {
		if (!IdSchema.safeParse(id).success) return { success: false, error: 'Invalid ID' };
		await requireAdminOrMod();
		await prisma.deck.delete({ where: { id } });
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

// --- Vocab Management ---

export async function createVocab(data: {
	deckId: string;
	wordSurface: string;
	readingKana: string;
	meaning: string;
	hanViet?: string;
	exampleSentence?: any; // Json
	wordParts?: any; // Json
}) {
	try {
		const validation = VocabSchema.safeParse(data);
		if (!validation.success) return { success: false, error: 'Invalid data' };
		await requireAdminOrMod();

		// Optional: Check uniqueness within deck?
		// Global uniqueness isn't required by schema, but might be nice.
		// For now, allow duplicates structure-wise.

		const vocab = await prisma.vocab.create({
			data: {
				deckId: data.deckId,
				wordSurface: data.wordSurface,
				readingKana: data.readingKana,
				meaning: data.meaning,
				hanViet: data.hanViet || '',
				exampleSentence: data.exampleSentence || {},
				wordParts: data.wordParts || [],
				kanjiBreakdown: [], // Default empty or passed?
			},
		});
		return { success: true, data: vocab };
	} catch (error: any) {
		console.error('Create Vocab Error', error);
		return { success: false, error: error.message };
	}
}

export async function deleteVocab(id: string) {
	try {
		if (!IdSchema.safeParse(id).success) return { success: false, error: 'Invalid ID' };
		await requireAdminOrMod();
		await prisma.vocab.delete({ where: { id } });
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

// --- Kanji Management ---

export async function createKanji(data: {
	deckId: string;
	kanji: string;
	meaning: string;
	hanViet?: string;
	onyomi?: string; // Comma separated or array? Schema says String[]
	kunyomi?: string;
	strokes?: number;
	examples?: any;
}) {
	try {
		const validation = KanjiSchema.safeParse(data);
		if (!validation.success) return { success: false, error: 'Invalid data' };
		await requireAdminOrMod();

		// Convert string inputs to arrays if needed
		const onyomiArr = data.onyomi
			? data.onyomi
					.split(/[,、]/)
					.map((s) => s.trim())
					.filter(Boolean)
			: [];
		const kunyomiArr = data.kunyomi
			? data.kunyomi
					.split(/[,、]/)
					.map((s) => s.trim())
					.filter(Boolean)
			: [];

		const kanji = await prisma.kanji.create({
			data: {
				deckId: data.deckId,
				kanji: data.kanji,
				meaning: data.meaning,
				hanViet: data.hanViet || '',
				onyomi: onyomiArr,
				kunyomi: kunyomiArr,
				strokes: data.strokes || 0,
				radicals: [], // Placeholder
				examples: data.examples || [],
			},
		});
		return { success: true, data: kanji };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function deleteKanji(id: string) {
	try {
		if (!IdSchema.safeParse(id).success) return { success: false, error: 'Invalid ID' };
		await requireAdminOrMod();
		await prisma.kanji.delete({ where: { id } });
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
