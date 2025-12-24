import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { SmartCard } from '../types';

interface SessionState {
	// 1. Data Slice
	queue: SmartCard[];

	// 2. Headless State (Cursor)
	currentIndex: number;
	isSessionActive: boolean;

	// 3. Computed Helper
	currentCard: SmartCard | null;
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

			// Actions
			startSession: (cards) => {
				set((state) => {
					state.queue = cards;
					state.currentIndex = 0;
					state.isSessionActive = true;
					state.currentCard = cards[0] || null;
				});
				console.log('[SessionStore] Session Started', cards.length);
			},

			endSession: () => {
				set((state) => {
					state.isSessionActive = false;
					state.currentCard = null;
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
				const { currentCard, currentIndex, queue, nextCard } = get();

				console.log(`[SessionStore] Rated: ${rating} for card ${currentCard?.id}`);

				// SRS LOGIC (Stub)
				// If Rating is 1 (Again), re-queue the card
				if (rating === 1 && currentCard) {
					console.log('[SessionStore] Re-queueing AGAIN card');

					set((state) => {
						// Insert duplicate of card at currentIndex + 3 (or end)
						// We need to clone it to avoid reference issues if we mutate later
						const cardClone = { ...currentCard, id: `${currentCard.id}_retry` };

						// Determine insert position: at most 3 spots ahead, but not beyond bounds
						// If we are at index 0, length 10. We want to insert at index 3 (4th card).
						// If we are at index 8, length 10. We insert at 10 (end).

						const offset = 3;
						const insertIndex = Math.min(state.currentIndex + 1 + offset, state.queue.length);

						state.queue.splice(insertIndex, 0, cardClone);
					});
				}

				// Move to next card (Animation delay could be handled in UI or here)
				// For "Zen" UI, we want immediate response usually, but CardShell handles animation.
				// We should probably wait for the animation to finish?
				// For now, immediate state update allows CardShell `onSwipe` to trigger this,
				// and CardShell local state manages the exit animation visual.
				nextCard();
			},
		})),
		{ name: 'FlashcardSessionStore' },
	),
);
