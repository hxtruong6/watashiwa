/**
 * Deck Module - Actions Layer
 *
 * Server Actions for deck operations
 */

'use server';

import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/lib';
import { prisma } from '@/lib/db';
import { generateSlug } from '@/lib/utils/slug';
import { getUser } from '@/modules/auth/auth.actions';
import { executeAdminAction, executeSafeAction } from '@/modules/core/action-client';
/**
 * Get all decks visible to current user
 */
// -----------------------------------------------------------------------------
// getUserDecksWithStats (Aggregated)
// -----------------------------------------------------------------------------

import { StudyData } from '@/modules/study/study.data';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import { z } from 'zod';

import * as deckData from './deck.data';

/**
 * Get deck by ID or slug with details and user stats
 */
export async function getDeck(idOrSlug: string) {
	try {
		const user = await getUser();
		if (!user) return null;

		const deck = await deckData.getDeckByIdOrSlug(idOrSlug, user.id);
		if (!deck) return null;

		// Calculate User Stats for this deck
		const userReviews = await prisma.userReview.findMany({
			where: {
				userId: user.id,
				vocab: { deckId: deck.id },
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

const CreateDeckSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	isPublic: z.boolean().optional(),
	headerImage: z.string().optional(),
});
const IdSchema = z.string().min(1);

export async function getUserDecksWithStats() {
	try {
		const user = await getUser();
		if (!user) return { learningDecks: [], createdDecks: [] };
		const userId = user.id;

		// 1. Fetch All Visible Decks
		const allDecks = await deckData.getAllDecks(userId);

		// 2. Fetch All User Reviews (Lightweight)
		const userReviews = await StudyData.getUserReviewStats(userId);

		// 3. Aggregate Stats in Memory
		const deckStatsMap = new Map<
			string,
			{
				dueCount: number;
				totalCards: number;
				masteredCount: number;
				lastStudied?: Date;
				nextReview?: Date; // Earliest future review
			}
		>();

		const now = new Date();

		for (const review of userReviews) {
			const deckId = review.vocab?.deckId;
			if (!deckId) continue;

			const current = deckStatsMap.get(deckId) || {
				dueCount: 0,
				totalCards: 0,
				masteredCount: 0,
			};

			current.totalCards++;

			if (review.nextReviewAt && review.nextReviewAt <= now) {
				current.dueCount++;
			}

			// Mastered: State=Review(2) and Interval > 21 days (approximated by stability/check)
			// V1 used stability > 21. Let's stick to that if available, or just check srsStage >= 4?
			// Let's use stability > 21 as per V1 logic
			if (review.state === 2 && (review.stability ?? 0) > 21) {
				current.masteredCount++;
			}

			// Last Studied (Max)
			if (review.lastReview) {
				if (!current.lastStudied || review.lastReview > current.lastStudied) {
					current.lastStudied = review.lastReview;
				}
			}

			// Next Review (Min Future)
			if (review.nextReviewAt && review.nextReviewAt > now) {
				if (!current.nextReview || review.nextReviewAt < current.nextReview) {
					current.nextReview = review.nextReviewAt;
				}
			}

			deckStatsMap.set(deckId, current);
		}

		// 4. Split and Enrich Decks
		const createdDecks = [];
		const learningDecks = [];

		for (const deck of allDecks) {
			const stats = deckStatsMap.get(deck.id);

			// Enrich deck object
			// Note: We need to match the return shape expected by UI
			// UI expects: deck + learningStats object
			const deckWithStats = {
				...deck,
				learningStats: stats
					? {
							hasCards: true,
							dueCount: stats.dueCount,
							totalCards: stats.totalCards,
							masteredCount: stats.masteredCount,
							lastStudied: stats.lastStudied || null,
							nextReview: stats.nextReview || null,
						}
					: null,
				learnersCount: 0, // Placeholder, implementing learner count needs aggregate query
			};

			if (deck.authorId === userId) {
				createdDecks.push(deckWithStats);
			}

			// If it has stats (user has studied it), add to learningDecks
			// Even created decks can be "learning" decks if I study them?
			// The original UI separated "Learning" (Public/Other) vs "Created" (Mine).
			// But usually "Learning" includes ANY deck I have progress in.
			// Let's follow V1: learningDecks = all decks I have cards for
			if (stats && stats.totalCards > 0) {
				learningDecks.push(deckWithStats);
			}
		}

		// Sort Learning Decks
		learningDecks.sort((a, b) => {
			// Due count descending
			const dueA = a.learningStats?.dueCount || 0;
			const dueB = b.learningStats?.dueCount || 0;
			if (dueA !== dueB) return dueB - dueA;

			// Last studied (Recent first)
			const timeA = a.learningStats?.lastStudied?.getTime() || 0;
			const timeB = b.learningStats?.lastStudied?.getTime() || 0;
			return timeB - timeA;
		});

		// Sort Created Decks (Already sorted by DB, but we keep that)
		// We might want to populate learnersCount for created decks.
		// That requires a separate GroupBy query on UserReview.
		// Let's implement that separately or skip for now (it was N+1 or raw query previously).
		// Raw query on UserReview for created decks:
		// We might want to populate learnersCount for created decks.
		// That requires a separate GroupBy query on UserReview.
		// Let's implement that separately or skip for now (it was N+1 or raw query previously).

		return { learningDecks, createdDecks };
	} catch (error) {
		console.error('Error fetching user decks with stats:', error);
		return { learningDecks: [], createdDecks: [] };
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

		// Generate slug if title is provided
		let slug: string | undefined;
		if (data.title) {
			// Get all existing slugs to ensure uniqueness
			const existingDecks = await prisma.deck.findMany({
				select: { slug: true },
			});
			const existingSlugs = existingDecks.map((d) => d.slug).filter(Boolean) as string[];
			slug = generateSlug(data.title, existingSlugs);
		}

		const deck = await prisma.deck.create({
			data: {
				title: data.title,
				description: data.description,
				isPublic: data.isPublic ?? false,
				headerImage: data.headerImage,
				authorId: user.id,
				slug,
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

		// Verify ownership and get current slug
		const existing = await prisma.deck.findUnique({
			where: { id },
			select: { authorId: true, slug: true },
		});
		if (!existing || existing.authorId !== user.id) {
			return { success: false, error: 'Unauthorized' };
		}

		// Generate slug only if title changed and slug is null (immutability: don't update existing slug)
		let slug: string | undefined;
		if (data.title && !existing.slug) {
			// Get all existing slugs to ensure uniqueness
			const existingDecks = await prisma.deck.findMany({
				select: { slug: true },
			});
			const existingSlugs = existingDecks.map((d) => d.slug).filter(Boolean) as string[];
			slug = generateSlug(data.title, existingSlugs);
		}

		const deck = await prisma.deck.update({
			where: { id },
			data: {
				...data,
				...(slug ? { slug } : {}),
			} as any,
		});
		revalidatePath('/dashboard/decks');
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

		const existing = await prisma.deck.findUnique({ where: { id } });
		if (!existing || existing.authorId !== user.id) {
			return { success: false, error: 'Unauthorized' };
		}

		await prisma.deck.delete({ where: { id } });
		revalidatePath('/dashboard/decks');
		return { success: true };
	} catch (error) {
		console.error('Error deleting deck:', error);
		return { success: false, error: 'Failed to delete deck' };
	}
}

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

/**
 * Get decks with due counts for dashboard
 */
export const getDecksWithDue = cache(async (userId?: string) => {
	try {
		if (userId && !IdSchema.safeParse(userId).success) return [];

		let uid = userId;
		if (!uid) {
			const user = await getUser();
			if (!user) return [];
			uid = user.id;
		}

		const decks = await prisma.deck.findMany({
			where: {
				OR: [{ isPublic: true }, { authorId: uid }],
			},
			include: {
				_count: {
					select: { vocabularies: true },
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		// Get due counts for each deck
		const decksWithDue = await Promise.all(
			decks.map(async (deck) => {
				const dueCount = await prisma.userReview.count({
					where: {
						userId: uid,
						nextReviewAt: { lte: new Date() },
						vocab: { deckId: deck.id },
					},
				});

				return {
					id: deck.id,
					title: deck.title,
					cardCount: deck._count.vocabularies,
					dueCount,
				};
			}),
		);

		return decksWithDue;
	} catch (error) {
		console.error('Error fetching decks with due:', error);
		return [];
	}
});
