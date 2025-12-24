import { submitReviewAction } from '@/modules/flashcard/flashcard.actions';
import { SmartCard } from '@/modules/flashcard/types';
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
	submitRating: (rating: 1 | 2 | 3 | 4) => Promise<void>;
	endSession: () => void;
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

			submitRating: async (rating) => {
				const { currentCard, nextCard } = get();

				if (!currentCard) return;

				console.log(`[SessionStore] Rated: ${rating} for card ${currentCard.id}`);

				// Update Stats
				set((state) => {
					state.sessionStats.reviews[rating] += 1;
				});

				// 1. Optimistic UI: Handle "Again" logic locally
				// If Rating is 1 (Again), re-queue the card
				if (rating === 1) {
					console.log('[SessionStore] Re-queueing AGAIN card');

					set((state) => {
						// Insert duplicate of card at currentIndex + 3 (or end)
						// We need to clone it to avoid reference issues if we mutate later
						const cardClone = { ...currentCard, id: `${currentCard.id}_retry` };

						const offset = 3;
						const insertIndex = Math.min(state.currentIndex + 1 + offset, state.queue.length);

						state.queue.splice(insertIndex, 0, cardClone);
					});
				}

				// 2. Persist to Server (Fire & Forget)
				// We don't await this to block UI, but we log errors
				submitReviewAction({ vocabId: currentCard.vocabId, rating })
					.then((res) => {
						if (!res.success) {
							console.error(
								'[SessionStore] Failed to persist review for',
								currentCard.vocabId,
								res.error,
							);
						} else {
							console.log('[SessionStore] Persisted review. Next Due:', res.data?.nextReview);
						}
					})
					.catch((err) => {
						console.error('[SessionStore] Error persisting review:', err);
					});

				// 3. Move to next card immediately
				nextCard();
			},
		})),
		{ name: 'FlashcardSessionStore' },
	),
);
