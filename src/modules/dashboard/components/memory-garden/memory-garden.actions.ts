'use server';

/**
 * Memory Garden Data Actions
 * 
 * Fetches memory topology data for the 3D visualization.
 * 
 * Performance Strategy:
 * - Single query with efficient aggregation
 * - Limits result set to prevent memory issues
 * - Computes health metrics server-side
 */

import { prisma } from '@/lib/db';
import { getUser } from '@/modules/auth/auth.actions';

import type { MemoryGardenData, MemoryTile } from './types';

const MAX_TILES = 2000; // Match component limit

/**
 * Get Memory Garden Data
 * 
 * Fetches user's vocabulary reviews and computes memory topology.
 * 
 * Edge Cases Handled:
 * - Empty user data (returns empty garden)
 * - Malformed stability values (clamped to valid range)
 * - Missing vocabulary relations (filtered out)
 */
export async function getMemoryGardenData(
	limit: number = MAX_TILES,
	deckId?: string,
): Promise<MemoryGardenData | null> {
	try {
		const user = await getUser();
		if (!user) {
			return null;
		}

		// Fetch user reviews with vocabulary data
		const reviews = await prisma.userReview.findMany({
			where: {
				userId: user.id,
				...(deckId && {
					vocab: {
						deckId,
					},
				}),
			},
			take: limit,
			include: {
				vocab: {
					select: {
						id: true,
						wordSurface: true,
						meanings: true,
					},
				},
			},
			orderBy: {
				lastReview: 'desc', // Most recently reviewed first
			},
		});

		// Transform to MemoryTile format
		const tiles: MemoryTile[] = reviews
			.filter((review) => review.vocab) // Defensive: Filter out missing vocab
			.map((review) => {
				const vocab = review.vocab!;
				const meanings = (vocab.meanings as any)?.vi || (vocab.meanings as any)?.en || [];
				const meaning = Array.isArray(meanings) ? meanings[0] : '';

				// Defensive: Clamp stability to valid range
				const stability = Math.max(0, review.stability ?? 0);
				const lapses = Math.max(0, review.lapses ?? 0);
				const srsStage = Math.max(0, Math.min(3, review.srsStage ?? 0));

				// Determine if leech (chronically failed)
				const isLeech = lapses >= 3 || srsStage === 3; // Relearning stage

				// Normalize stability for visualization (0.0 to 1.0)
				// Cap at 100 days for normalization
				const stabilityNormalized = Math.min(stability / 100, 1.0);

				return {
					vocabId: vocab.id,
					wordSurface: vocab.wordSurface,
					meaning,
					stability,
					lapses,
					srsStage,
					isLeech,
					stabilityNormalized,
				};
			});

		// Compute aggregate metrics
		const totalCount = tiles.length;
		const leechCount = tiles.filter((t) => t.isLeech).length;
		const masteredCount = tiles.filter((t) => t.stability > 21).length;

		// Health Score: 0-100
		// Formula: (1 - leechRatio) * 50 + (masteredRatio) * 50
		const leechRatio = totalCount > 0 ? leechCount / totalCount : 0;
		const masteredRatio = totalCount > 0 ? masteredCount / totalCount : 0;
		const healthScore = Math.round((1 - leechRatio) * 50 + masteredRatio * 50);

		return {
			tiles,
			totalCount,
			leechCount,
			masteredCount,
			healthScore,
		};
	} catch (error) {
		console.error('[MemoryGarden] Error fetching data:', error);
		return null;
	}
}

/**
 * Get Memory Garden Data for Specific Deck
 * 
 * Convenience wrapper for deck-scoped visualization.
 */
export async function getMemoryGardenDataForDeck(deckId: string) {
	return getMemoryGardenData(MAX_TILES, deckId);
}

