import { SmartCard } from '@/types/smart-cube';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

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
}

type SessionStore = SessionState & SessionActions;

// --- Store Implementation ---

export const useSessionStore = create<SessionStore>()(
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
		},

		nextCard: () => {
			set((state) => {
				const nextIndex = state.currentIndex + 1;
				if (nextIndex < state.queue.length) {
					state.currentIndex = nextIndex;
					state.currentCard = state.queue[nextIndex];
				} else {
					// Session Complete Logic (Placeholder)
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
			// 1. Optimistic UI: Move directly to next card
			// In a real app, we log the rating to DB here
			console.log(`[SessionStore] Rated: ${rating} for card ${get().currentCard?.id}`);

			// Delay slightly for animation if needed, or call nextCard immediately
			get().nextCard();
		},
	})),
);
