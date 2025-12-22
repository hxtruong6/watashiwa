/**
 * Deck Module - Data Layer
 *
 * Handles all Prisma queries for Deck operations
 */
import { prisma } from '@/lib/db';

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
