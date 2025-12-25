import { prisma } from '@/lib/db';
import { InterventionCard, Vocabulary } from '@/modules/flashcard/types';
import { UserReview } from '@prisma/client';

export const InterventionService = {
	/**
	 * Check if an intervention successfully triggers.
	 * Returns the hydrated InterventionCard if triggered, otherwise null.
	 */
	checkInterference: async (
		userId: string,
		vocabId: string,
		rating: number,
	): Promise<InterventionCard | null> => {
		// 1. Only trigger on Fail (1) or Hard (2)
		if (rating >= 3) return null;

		try {
			// --- RATE LIMIT CHECK (Scenario 5.4.4: Don't Spam) ---
			// Check if we already intervened for this vocab in the last 24 hours?
			// Since we don't have a dedicated "InterventionLog" table, we can inferred it from UserReview logs?
			// OR we assume session-based rate limiting is handled by the client?
			// Plan says "If I fail the same word twice in a session".
			// Let's use a simple in-memory check or look at recent review logs for this vocab.
			// If the user *just* failed this word (e.g. < 10 mins ago), we shouldn't show it again.

			const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
			const recentFailureCount = await prisma.reviewLog.count({
				where: {
					userId,
					reviewDate: { gt: tenMinutesAgo },
					rating: { lt: 3 }, // Fail (1) or Hard (2)
					reviewItem: {
						vocabId: vocabId,
					},
				},
			});

			// If count is >= 2, we have failed at least twice in 10 mins.
			// Trigger only on the FIRST failure (count === 1).
			if (recentFailureCount >= 2) {
				console.log('[Intervention] Rate Limit: Skipped (Repeated Failure)');
				// ANALYTICS: INTERVENTION_IGNORED
				return null;
			}

			// 2. Fetch the current vocab to find homonym links
			const currentVocab = await prisma.vocabulary.findUnique({
				where: { id: vocabId },
				include: {
					confusionsAs1: {
						include: { vocab2: true },
						where: {
							vocab2: {
								contentStatus: 'PUBLISHED',
								deletedAt: null,
							},
						},
					},
					confusionsAs2: {
						include: { vocab1: true },
						where: {
							vocab1: {
								contentStatus: 'PUBLISHED',
								deletedAt: null,
							},
						},
					},
				},
			});

			if (!currentVocab) return null;

			// 3. Find a partner
			let partnerVocab: (typeof currentVocab)['confusionsAs1'][0]['vocab2'] | null = null;
			let confusionType: 'HOMONYM' | 'LOOKALIKE' = 'HOMONYM';

			if (currentVocab.confusionsAs1.length > 0) {
				partnerVocab = currentVocab.confusionsAs1[0].vocab2;
				confusionType = currentVocab.confusionsAs1[0].type as any;
			} else if (currentVocab.confusionsAs2.length > 0) {
				partnerVocab = currentVocab.confusionsAs2[0].vocab1;
				confusionType = currentVocab.confusionsAs2[0].type as any;
			}

			// Priority 2: Homonym Group (if no pair)
			if (!partnerVocab && currentVocab.homonymGroupId) {
				const groupMember = await prisma.vocabulary.findFirst({
					where: {
						homonymGroupId: currentVocab.homonymGroupId,
						id: { not: vocabId },
						contentStatus: 'PUBLISHED',
						deletedAt: null,
					},
				});
				if (groupMember) {
					partnerVocab = groupMember;
					confusionType = 'HOMONYM';
				}
			}

			if (!partnerVocab) return null;

			// 4. Verify user knows the partner
			const partnerReview = await prisma.userReview.findUnique({
				where: {
					userId_vocabId: {
						userId,
						vocabId: partnerVocab.id,
					},
				},
			});

			if (!partnerReview) return null;

			// 5. Hydrate & Construct Card
			const hydrate = (v: typeof currentVocab): Vocabulary => {
				return {
					...v,
					meanings: v.meanings as any,
					etymology: v.etymology as any,
					examples: v.examples as any,
					mnemonic: v.mnemonic as any,
				};
			};

			const itemA = hydrate(currentVocab);
			const itemB = hydrate(partnerVocab as any);

			const card: InterventionCard = {
				id: `intervention_${new Date().getTime()}`,
				vocabId: itemA.id,
				nextReview: null,
				srsStage: 0,
				variant: 'INTERVENTION',
				comparison: {
					type: confusionType, // Now correctly typed
					itemA,
					itemB,
					audioUrl: itemA.audioUrl || '',
					targetId: itemA.id,
				},
				front: {
					question: 'Which one matches the audio?',
				},
				back: {
					details: itemA,
				},
			};

			// ANALYTICS: Track Trigger
			console.log(
				`[Analytics] INTERVENTION_TRIGGERED: ${itemA.wordSurface} vs ${itemB.wordSurface}`,
			);

			return card;
		} catch (error) {
			console.error('[InterventionService] Error checking interference:', error);
			return null;
		}
	},
};
