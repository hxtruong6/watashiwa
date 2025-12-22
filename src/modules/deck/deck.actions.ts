/**
 * Deck Module - Actions Layer
 *
 * Server Actions for deck operations
 */

'use server';

import { prisma } from '@/lib/db';
import { getUser } from '@/modules/auth/auth.actions';

import * as deckData from './deck.data';

/**
 * Get deck by ID with details and user stats
 */
export async function getDeck(id: string) {
	try {
		const user = await getUser();
		if (!user) return null;

		const deck = await deckData.getDeckById(id, user.id);
		if (!deck) return null;

		// Calculate User Stats for this deck
		const userReviews = await prisma.userReview.findMany({
			where: {
				userId: user.id,
				vocab: { deckId: id },
			},
			select: { srsStage: true },
		});

		const stats = {
			total: deck._count.vocabularies + deck._count.stories,
			started: userReviews.length,
			new: userReviews.filter((r) => r.srsStage === 0).length,
			learning: userReviews.filter((r) => r.srsStage === 1 || r.srsStage === 3).length,
			review: userReviews.filter((r) => r.srsStage === 2).length,
			unseen: deck._count.vocabularies + deck._count.stories - userReviews.length,
		};

		return { ...deck, stats };
	} catch (error) {
		console.error('Error fetching deck:', error);
		return null;
	}
}

/**
 * Get all decks visible to current user
 */
export async function getDecks() {
	try {
		const user = await getUser();
		if (!user) return [];

		return await deckData.getAllDecks(user.id);
	} catch (error) {
		console.error('Error fetching decks:', error);
		return [];
	}
}
