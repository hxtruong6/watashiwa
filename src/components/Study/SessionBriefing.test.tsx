import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SessionBriefing from './SessionBriefing';
import React from 'react';
import { StudyCardWithDetails } from '@/services/actions';

// Mock Hooks and Components
vi.mock('next-intl', () => ({
	useTranslations: () => (key: string, params?: any) => {
		if (params) return `${key} ${JSON.stringify(params)}`;
		return key;
	},
}));

vi.mock('antd', async () => {
	const actual = await vi.importActual('antd');
	return {
		...actual,
		theme: {
			useToken: () => ({
				token: {
					colorBgContainer: '#ffffff',
					colorBgLayout: '#f0f2f5',
					colorPrimary: '#1890ff',
				},
			}),
		},
		// Mock other heavy components if needed, or rely on jsdom
	};
});

vi.mock('@/hooks/study/useFlashCardAudio', () => ({
	useFlashCardAudio: () => ({
		playAudio: vi.fn(),
		isPlaying: false,
	}),
}));

describe('SessionBriefing Component', () => {
	const mockOnStart = vi.fn();

	const mockNewCard: StudyCardWithDetails = {
		id: '1',
		deckId: 'd1',
		state: 0, // NEW
		due: new Date(),
		stability: 0,
		difficulty: 0,
		lapses: 0,
		reps: 0,
		lastReview: null,
		step: 0,
		createdAt: new Date(),
		updatedAt: new Date(),
		vocabId: 'v1',
		vocab: {
			id: 'v1',
			wordSurface: 'Hello',
			reading: 'Hello',
			meaning: 'Greeting',
			unitId: 'u1',
			han_viet: 'XIN CHAO',
		} as any,
		kanjiId: null,
		kanji: null,
	};

	const mockReviewCard: StudyCardWithDetails = {
		...mockNewCard,
		id: '2',
		state: 2, // REVIEW
		difficulty: 8, // HARD -> Critical
		vocab: {
			...mockNewCard.vocab,
			id: 'v2',
			wordSurface: 'World',
			han_viet: 'THE GIOI',
		} as any,
	};

	const mockStats = {
		limitNewCards: 20,
		newCardsToday: 5,
		limitReviews: 100,
		reviewsToday: 10,
		reviewsAvailable: 50,
	};

	it('renders correctly with new and critical cards', () => {
		render(
			<SessionBriefing
				queue={[mockNewCard, mockReviewCard]}
				stats={mockStats}
				onStart={mockOnStart}
			/>,
		);

		// Check Header Text
		expect(screen.getByText('briefing.title')).toBeInTheDocument();

		// Check New Section
		expect(screen.getByText('briefing.sectionNew')).toBeInTheDocument();
		expect(screen.getByText('Hello')).toBeInTheDocument(); // Vocab surface

		// Check Review Section
		expect(screen.getByText('briefing.sectionReview')).toBeInTheDocument();

		// Check Start Button
		const startBtn = screen.getByText('briefing.startSession');
		expect(startBtn).toBeInTheDocument();
	});

	it('calls onStart when start button is clicked', () => {
		render(<SessionBriefing queue={[mockNewCard]} stats={mockStats} onStart={mockOnStart} />);

		const startBtn = screen.getByText('briefing.startSession');
		fireEvent.click(startBtn);
		expect(mockOnStart).toHaveBeenCalledTimes(1);
	});

	it('calculates remaining counts correctly', () => {
		// remainingNew = 20 - 5 = 15
		render(<SessionBriefing queue={[]} stats={mockStats} onStart={mockOnStart} />);

		expect(screen.getByText(/briefing.missionNew {"count":15}/)).toBeInTheDocument();
	});
});
