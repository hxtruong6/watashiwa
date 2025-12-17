import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StudyContent from './StudyContent';
import React from 'react';
import { StudyCardWithDetails } from '@/services/actions';

// --- Mocks ---

// Mock next-intl
vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
	useSearchParams: () => ({
		get: vi.fn(),
	}),
	useRouter: () => ({
		push: vi.fn(),
	}),
}));

// Mock Ant Design
vi.mock('antd', async () => {
	const actual = await vi.importActual('antd');
	const LayoutContent = ({ children, style }: any) => <div style={style}>{children}</div>;
	const MockLayout = ({ children, style }: any) => <div style={style}>{children}</div>;
	MockLayout.Content = LayoutContent;

	return {
		...actual,
		theme: {
			useToken: () => ({
				token: {
					colorBgLayout: '#f0f2f5',
				},
			}),
		},
		Layout: MockLayout,
		Drawer: ({ children, open }: any) => (open ? <div>{children}</div> : null),
		App: {
			useApp: () => ({ message: { error: vi.fn(), success: vi.fn() } }),
		},
	};
});

// Mock Server Actions
vi.mock('@/services/actions', () => ({
	getUserSettings: vi.fn().mockResolvedValue(null),
	getCompletedTutorials: vi.fn().mockResolvedValue([]),
	DEFAULT_LIMIT_NEW_CARDS: 20,
	DEFAULT_LIMIT_REVIEWS: 200,
}));

// Mock Hooks
const mockHandleRate = vi.fn();
const mockSetShowAnswer = vi.fn();
const mockUseStudySession = vi.fn();

vi.mock('@/hooks/study/useStudySession', () => ({
	useStudySession: () => mockUseStudySession(),
}));

vi.mock('@/hooks/study/useZenMode', () => ({
	useZenMode: () => ({ headerVisible: true }),
}));

vi.mock('@/hooks/study/useStudyShortcuts', () => ({
	useStudyShortcuts: () => {},
}));

vi.mock('@/hooks/useTutorialStore', () => ({
	useTutorialStore: {
		getState: () => ({
			setCompletedTutorials: vi.fn(),
			mergeTutorials: vi.fn(),
		}),
	},
}));

// Mock Child Components to simplify testing flow
vi.mock('@/components/FlashCard', () => ({
	__esModule: true,
	default: ({ showAnswer, onReveal }: any) => (
		<div data-testid="flashcard">
			FlashCard Content
			{showAnswer ? <div data-testid="answer">Answer Revealed</div> : null}
			<button onClick={onReveal}>Reveal</button>
		</div>
	),
}));

vi.mock('@/components/RatingBar', () => ({
	__esModule: true,
	default: ({ onRate }: any) => (
		<div data-testid="rating-bar">
			<button onClick={() => onRate(1)}>Ag</button>
			<button onClick={() => onRate(3)}>Gd</button>
		</div>
	),
}));

vi.mock('@/components/Study/SessionBriefing', () => ({
	__esModule: true,
	default: ({ onStart }: any) => (
		<div data-testid="session-briefing">
			Briefing
			<button onClick={onStart}>Start</button>
		</div>
	),
}));

vi.mock('@/components/Study/SessionSummary', () => ({
	__esModule: true,
	default: () => <div data-testid="session-summary">Summary</div>,
}));

vi.mock('@/components/Shared/Loading', () => ({
	__esModule: true,
	default: () => <div data-testid="loading">Loading...</div>,
}));

vi.mock('@/components/VocabSettings', () => ({
	__esModule: true,
	default: () => <div data-testid="vocab-settings">Settings</div>,
}));

vi.mock('@/components/ReportModal', () => ({
	__esModule: true,
	default: () => <div data-testid="report-modal">Report</div>,
}));

vi.mock('@/components/comments/CommentDrawer', () => ({
	__esModule: true,
	default: () => <div data-testid="comment-drawer">Comments</div>,
}));

vi.mock('@/components/Study/StudyHeader', () => ({
	__esModule: true,
	default: () => <div data-testid="study-header">Header</div>,
}));

vi.mock('@/components/Shared/AppTutorial', () => ({
	__esModule: true,
	default: () => <div data-testid="app-tutorial">Tutorial</div>,
}));

describe('StudyContent Component', () => {
	const mockCard: StudyCardWithDetails = {
		id: 'c1',
		state: 2, // Review
		difficulty: 5,
		due: new Date(),
		lapses: 0,
		reps: 5,
		lastReview: new Date(),
		stability: 5,
		scheduledDays: 1,
		elapsedDays: 1,
		step: 0,
		createdAt: new Date(),
		updatedAt: new Date(),
		userId: 'u1',
		vocabId: 'v1',
		kanjiId: null,
		vocab: {
			id: 'v1',
			wordSurface: 'Test Word',
			reading: 'Test Reading',
		} as any,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockHandleRate.mockReset();
		mockSetShowAnswer.mockReset();
	});

	it('renders loading state initially', () => {
		mockUseStudySession.mockReturnValue({
			card: null,
			loading: true,
			sessionComplete: false,
			dailyStats: { reviewsToday: 0, limitReviews: 100 },
			handleRate: mockHandleRate,
			showAnswer: false,
			setShowAnswer: mockSetShowAnswer,
			queue: [],
		});

		render(<StudyContent />);
		expect(screen.getByTestId('loading')).toBeInTheDocument();
	});

	it('renders Session Briefing when new cards are present', async () => {
		const newCard = { ...mockCard, state: 0 }; // New State
		mockUseStudySession.mockReturnValue({
			card: newCard,
			loading: false, // Done loading
			sessionComplete: false,
			dailyStats: { reviewsToday: 0, limitReviews: 100 },
			handleRate: mockHandleRate,
			showAnswer: false,
			setShowAnswer: mockSetShowAnswer,
			queue: [], // Queue can be empty if current card is new
		});

		render(<StudyContent />);

		// Wait for effect to switch phase
		await waitFor(() => {
			expect(screen.getByTestId('session-briefing')).toBeInTheDocument();
		});
	});

	it('renders Quiz directly (skipping briefing) for normal reviews', async () => {
		mockUseStudySession.mockReturnValue({
			card: mockCard,
			loading: false,
			sessionComplete: false,
			dailyStats: { reviewsToday: 0, limitReviews: 100 },
			handleRate: mockHandleRate,
			showAnswer: false,
			setShowAnswer: mockSetShowAnswer,
			queue: [],
		});

		render(<StudyContent />);

		await waitFor(() => {
			expect(screen.getByTestId('flashcard')).toBeInTheDocument();
		});
		expect(screen.queryByTestId('session-briefing')).not.toBeInTheDocument();
	});

	it('reveals answer when clicking reveal area', async () => {
		// We mock useState for showAnswer inside the test component wrapper if needed,
		// but here we are mocking the HoC return.
		// Actually, StudyContent uses the `showAnswer` from `useStudySession`.
		// So checking if `setShowAnswer` is called is the way.

		mockUseStudySession.mockReturnValue({
			card: mockCard,
			loading: false,
			sessionComplete: false,
			dailyStats: { reviewsToday: 0, limitReviews: 100 },
			handleRate: mockHandleRate,
			showAnswer: false,
			setShowAnswer: mockSetShowAnswer, // Spy
			queue: [],
		});

		render(<StudyContent />);

		await waitFor(() => screen.getByTestId('flashcard'));

		// Click the reveal button inside our mock FlashCard
		fireEvent.click(screen.getByText('Reveal'));

		expect(mockSetShowAnswer).toHaveBeenCalledWith(true);
	});

	it('shows RatingBar only when answer is revealed', async () => {
		// Case 1: Answer Hidden
		mockUseStudySession.mockReturnValueOnce({
			card: mockCard,
			loading: false,
			sessionComplete: false,
			dailyStats: { reviewsToday: 0, limitReviews: 100 },
			handleRate: mockHandleRate,
			showAnswer: false,
			setShowAnswer: mockSetShowAnswer,
			queue: [],
		});

		const { rerender } = render(<StudyContent />);
		await waitFor(() => screen.getByTestId('flashcard'));
		expect(screen.queryByTestId('rating-bar')).not.toBeInTheDocument();

		// Case 2: Answer Revealed
		mockUseStudySession.mockReturnValue({
			card: mockCard,
			loading: false,
			sessionComplete: false,
			dailyStats: { reviewsToday: 0, limitReviews: 100 },
			handleRate: mockHandleRate,
			showAnswer: true, // TRUE
			setShowAnswer: mockSetShowAnswer,
			queue: [],
		});

		rerender(<StudyContent />); // Rerender with new hook values

		await waitFor(() => {
			expect(screen.getByTestId('rating-bar')).toBeInTheDocument();
		});
	});

	it('calls handleRate when rating button is clicked', async () => {
		mockUseStudySession.mockReturnValue({
			card: mockCard,
			loading: false,
			sessionComplete: false,
			dailyStats: { reviewsToday: 0, limitReviews: 100 },
			handleRate: mockHandleRate,
			showAnswer: true,
			setShowAnswer: mockSetShowAnswer,
			queue: [],
		});

		render(<StudyContent />);
		await waitFor(() => screen.getByTestId('rating-bar'));

		fireEvent.click(screen.getByText('Gd')); // Matches mock "Gd" button (Rating 3)
		expect(mockHandleRate).toHaveBeenCalledWith(3);
	});

	it('renders Session Summary when session is complete', async () => {
		mockUseStudySession.mockReturnValue({
			card: null,
			loading: false,
			sessionComplete: true, // TRUE
			dailyStats: { reviewsToday: 10, limitReviews: 100 },
			handleRate: mockHandleRate,
			showAnswer: false,
			setShowAnswer: mockSetShowAnswer,
			queue: [],
		});

		render(<StudyContent />);

		await waitFor(() => {
			expect(screen.getByTestId('session-summary')).toBeInTheDocument();
		});
	});
});
