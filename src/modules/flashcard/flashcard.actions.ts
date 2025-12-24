'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
// Assuming auth is set up, or we mock userId for now
import { v4 as uuidv4 } from 'uuid';

import { SmartCard, StandardCard, Vocabulary } from './types';

/**
 * Fetch Session with Real Data (Phase 5)
 * 1. Get Due Cards (Review)
 * 2. Get New Cards (Learn)
 */
export async function fetchSessionAction(deckId?: string): Promise<SmartCard[]> {
	try {
		// TODO: Get real user ID from session
		const userId = 'user_2rMmCA0ibx2pYAAAAA'; // Mock User ID or get from auth()

		const limit = 10; // Fixed session limit for now

		// 1. Fetch Due Reviews
		// Query UserReview where nextReview <= now
		const dueReviews = await prisma.userReview.findMany({
			where: {
				userId,
				nextReviewAt: { lte: new Date() },
				// If deckId is provided, filter by deck.
				// Using nested relation filter if needed, or if Vocabulary has deckId.
				// vocab: { deckId: deckId }
			},
			include: { vocab: true },
			take: limit,
			orderBy: { nextReviewAt: 'asc' },
		});

		// 2. Fetch New Cards (if needed to fill quota)
		let newCards: any[] = [];
		if (dueReviews.length < limit) {
			const needed = limit - dueReviews.length;
			// Find vocab that user has NOT reviewed yet
			newCards = await prisma.vocabulary.findMany({
				where: {
					// deckId: deckId, // Optional filter
					userReviews: {
						none: { userId },
					},
				},
				take: needed,
			});
		}

		// 3. Transform to SmartCard
		// We need a helper to safe-parse JSON fields

		const combined = [
			...dueReviews.map((r) => ({ ...r.vocab, _review: r })),
			...newCards.map((v) => ({ ...v, _review: null })),
		];

		const sessionCards: SmartCard[] = combined.map((item) => {
			// Safe Parse helpers (schema is trusted to match DB, but good to be safe)
			const meanings = item.meanings as any;
			const etymology = item.etymology as any;
			const examples = item.examples as any;
			const mnemonic = item.mnemonic as any;

			const vocab: Vocabulary = {
				...item,
				meanings,
				etymology,
				examples,
				mnemonic,
				han_viet_extracted: item.hanViet || '', // fallback
			};

			const card: StandardCard = {
				id: item._review?.id || `new_${item.id}`,
				vocabId: item.id,
				nextReview: item._review?.nextReviewAt || null,
				srsStage: item._review?.srsStage || 0,
				variant: 'BASIC',
				front: {
					hero: item.wordSurface,
					reading: item.wordReading,
					audio: item.audioUrl || '',
				},
				back: {
					details: vocab,
				},
			};
			return card;
		});

		return sessionCards;
	} catch (error) {
		console.error('[Action] Failed to fetch session:', error);
		return [];
	}
}
