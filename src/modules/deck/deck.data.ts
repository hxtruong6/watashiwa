/**
 * Deck Module - Data Layer
 *
 * Handles all Prisma queries for Deck operations
 */
import { DEFAULT_PER_PAGE } from '@/lib';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

/**
 * Fetch a single deck by ID with vocabularies
 */
export async function getDeckById(id: string, userId: string) {
	return await prisma.deck.findFirst({
		where: {
			id,
			OR: [{ isPublic: true }, { authorId: userId }],
		},
		include: {
			author: {
				select: { name: true, id: true },
			},
			vocabularies: {
				where: {
					contentStatus: 'VERIFIED', // Only show verified content
				},
				orderBy: { createdAt: 'desc' },
				// include: {
				// 	_count: {
				// 		select: { cardComments: true },
				// 	},
				// },
			},
			stories: {
				orderBy: { createdAt: 'desc' },
			},
			_count: {
				select: { vocabularies: true, stories: true },
			},
		},
	});
}

/**
 * Fetch all decks visible to user
 */
export async function getAllDecks(userId: string) {
	return await prisma.deck.findMany({
		where: {
			OR: [{ isPublic: true }, { authorId: userId }],
		},
		include: {
			_count: {
				select: { vocabularies: true, stories: true },
			},
		},
		orderBy: [
			{ sortOrder: 'asc' }, // Primary: explicit sort order
			{ createdAt: 'desc' }, // Fallback: newest first
		],
	});
}

// get all decks for admin
export async function getAllDecksForAdmin({
	page = 1,
	perPage = 10,
	search = '',
	sortField = 'createdAt',
	sortOrder = 'desc',
}: {
	page?: number;
	perPage?: number;
	search?: string;
	sortField?: string;
	sortOrder?: 'asc' | 'desc';
}) {
	const skip = (page - 1) * perPage || 0; // Fix skip calculation (page 1 should be 0)
	const take = perPage || DEFAULT_PER_PAGE;

	const where: Prisma.DeckWhereInput = search
		? {
				OR: [
					{ title: { contains: search, mode: 'insensitive' } },
					{ description: { contains: search, mode: 'insensitive' } },
				],
			}
		: {};

	const [data, total] = await Promise.all([
		prisma.deck.findMany({
			where,
			include: {
				_count: {
					select: { vocabularies: true, stories: true },
				},
				author: {
					select: { name: true, email: true },
				},
			},
			orderBy: {
				[sortField]: sortOrder,
			},
			skip,
			take,
		}),
		prisma.deck.count({ where }),
	]);

	return { data, total };
}

export async function getDeckDetailForAdmin(id: string) {
	return await prisma.deck.findUnique({
		where: {
			id,
		},
		include: {
			_count: {
				select: { vocabularies: true, stories: true },
			},
		},
	});
}

export async function getDeckVocabularies({
	deckId,
	page = 1,
	limit = 20,
	search = '',
	status,
}: {
	deckId: string;
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
}) {
	const where: Prisma.VocabularyWhereInput = {
		deckId,
		...(status ? { contentStatus: status as any } : {}),
		...(search
			? {
					OR: [
						{ wordSurface: { contains: search, mode: 'insensitive' } },
						{ wordReading: { contains: search, mode: 'insensitive' } },
						{ hanViet: { contains: search, mode: 'insensitive' } },
					],
				}
			: {}),
	};

	const [data, total] = await Promise.all([
		prisma.vocabulary.findMany({
			where,
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { createdAt: 'desc' },
		}),
		prisma.vocabulary.count({ where }),
	]);

	return { data, total };
}
