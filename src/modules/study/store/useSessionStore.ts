import { trackEvent } from '@/lib/analytics';
import { SmartCard } from '@/modules/flashcard/types';
import { submitReview as submitReviewAction } from '@/modules/study/study.actions';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface SessionStats {
	startTime: number | null;
	endTime: number | null;
	reviews: {
		1: number; // Again
		2: number; // Hard
		3: number; // Good
		4: number; // Easy
	};
	forgottenCards: SmartCard[]; // Cards rated as "Again" (1) - for summary display
}

interface SessionState {
	// 1. Data Slice
	queue: SmartCard[];

	// 2. Headless State (Cursor)
	currentIndex: number;
	isSessionActive: boolean;

	// 3. Computed Helper
	currentCard: SmartCard | null;

	// 4. Statistics
	sessionStats: SessionStats;
}

interface SessionActions {
	// Actions
	nextCard: () => void;
	prevCard: () => void;
	startSession: (cards: SmartCard[]) => void;
	submitRating: (rating: 1 | 2 | 3 | 4, duration?: number) => Promise<void>;
	endSession: () => void;
	resetSession: () => void;
	insertCardAfterCurrent: (card: SmartCard) => void;
}

type SessionStore = SessionState & SessionActions;

// --- Store Implementation ---

export const useSessionStore = create<SessionStore>()(
	devtools(
		immer((set, get) => ({
			// Initial State
			queue: [],
			currentIndex: 0,
			isSessionActive: false,
			currentCard: null,
			sessionStats: {
				startTime: null,
				endTime: null,
				reviews: { 1: 0, 2: 0, 3: 0, 4: 0 },
				forgottenCards: [],
			},

			// Actions
			startSession: (cards) => {
				set((state) => {
					state.queue = cards;
					state.currentIndex = 0;
					state.isSessionActive = true;
					state.currentCard = cards[0] || null;

					// Reset Stats
					state.sessionStats = {
						startTime: Date.now(),
						endTime: null,
						reviews: { 1: 0, 2: 0, 3: 0, 4: 0 },
						forgottenCards: [],
					};
				});
				console.log('[SessionStore] Session Started', cards.length);
			},

			endSession: () => {
				set((state) => {
					state.isSessionActive = false;
					state.currentCard = null;
					state.sessionStats.endTime = Date.now();
				});
				console.log('[SessionStore] Session Ended');
			},

			resetSession: () => {
				set((state) => {
					state.queue = [];
					state.currentIndex = 0;
					state.isSessionActive = false;
					state.currentCard = null;
					state.sessionStats = {
						startTime: null,
						endTime: null,
						reviews: { 1: 0, 2: 0, 3: 0, 4: 0 },
						forgottenCards: [],
					};
				});
				console.log('[SessionStore] Session Reset');
			},

			nextCard: () => {
				set((state) => {
					const nextIndex = state.currentIndex + 1;
					if (nextIndex < state.queue.length) {
						state.currentIndex = nextIndex;
						state.currentCard = state.queue[nextIndex];
					} else {
						// Session Complete
						state.isSessionActive = false;
						state.currentCard = null;
						state.sessionStats.endTime = Date.now();
					}
				});
			},

			prevCard: () => {
				set((state) => {
					if (state.currentIndex > 0) {
						state.currentIndex -= 1;
						state.currentCard = state.queue[state.currentIndex];
					}
				});
			},

			insertCardAfterCurrent: (card) => {
				set((state) => {
					// Avoid duplicates by checking vocabId
					const existingIndex = state.queue.findIndex((c) => c.vocabId === card.vocabId);
					if (existingIndex !== -1) {
						console.log('[SessionStore] Card already in queue, skipping insert');
						return;
					}

					// Insert at currentIndex + 1 (or end if at last position)
					const insertIndex = Math.min(state.currentIndex + 1, state.queue.length);
					state.queue.splice(insertIndex, 0, card);
					console.log(`[SessionStore] Inserted card at index ${insertIndex}`);
				});
			},

			submitRating: async (rating, duration) => {
				const { currentCard, nextCard } = get();

				if (!currentCard) return;

				console.log(
					`[SessionStore] Rated: ${rating} for card ${currentCard.id} (duration: ${duration}ms)`,
				);

				// Store current card reference before moving to next
				const cardToSubmit = currentCard;
				const srsStageBefore = cardToSubmit.srsStage;

				// Update Stats
				set((state) => {
					state.sessionStats.reviews[rating] += 1;

					// Track forgotten cards (rating 1) for summary display
					if (rating === 1) {
						state.sessionStats.forgottenCards.push(cardToSubmit);
					}
				});

				// 1. Optimistic UI: Handle "Again" logic locally
				// If Rating is 1 (Again), re-queue the card
				if (rating === 1) {
					console.log('[SessionStore] Re-queueing AGAIN card');

					set((state) => {
						// Insert duplicate of card at currentIndex + 3 (or end)
						// We need to clone it to avoid reference issues if we mutate later
						const cardClone = { ...cardToSubmit, id: `${cardToSubmit.id}_retry` };

						const offset = 3;
						const insertIndex = Math.min(state.currentIndex + 1 + offset, state.queue.length);

						state.queue.splice(insertIndex, 0, cardClone);
					});
				}

				// 2. OPTIMISTIC: Move to next card immediately (before server call)
				// This provides instant feedback and maintains flow
				nextCard();

				// 3. Persist to Server (Non-blocking background sync)
				// Fire and forget - don't block UI on network latency
				submitReviewAction({ vocabId: cardToSubmit.vocabId, rating, duration })
					.then((res) => {
						if (!res.success) {
							console.error('[SessionStore] Failed to persist review', res.error);
						} else {
							console.log('[SessionStore] Persisted. Next Due:', res.data?.nextReview);

							// Track card reviewed event
							const cardType = srsStageBefore === 0 ? 'new' : 'review';
							// Get updated SRS stage from the next card in queue (if available)
							// For now, we'll use a simple heuristic: if rating is 1-2, likely still learning, if 3-4, likely review
							const srsStageAfter = rating <= 2 ? 1 : 2; // Simplified - actual stage comes from DB

							trackEvent('card_reviewed', {
								rating: rating,
								card_type: cardType,
								srs_stage_before: srsStageBefore,
								srs_stage_after: srsStageAfter,
								duration_ms: duration ?? 0,
								deck_id: ('deckId' in cardToSubmit ? cardToSubmit.deckId : null) || null,
							});

							// 4. INTERVENTION INJECTION (The "Smart Loop")
							if (res.data?.intervention) {
								console.log('[SessionStore] 🛡️ Intervention Triggered!', res.data.intervention.id);
								set((state) => {
									// Inject immediately after current card (next in line)
									// Note: currentIndex has already advanced, so we inject at current position
									state.queue.splice(state.currentIndex, 0, res.data!.intervention!);
								});
							}
						}
					})
					.catch((err) => {
						console.error('[SessionStore] Error persisting review:', err);
						// Error is logged but doesn't block UI flow
						// In production, you might want to queue failed reviews for retry
					});
			},
		})),
		{ name: 'FlashcardSessionStore' },
	),
);
