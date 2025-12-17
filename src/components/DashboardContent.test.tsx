import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardContent from './DashboardContent';
import React from 'react';

// Mock sub-components to avoid deep rendering issues and focus on Dashboard layout
vi.mock('@/components/dashboard', () => ({
	HeroSection: () => <div data-testid="HeroSection">HeroSection</div>,
	DueCTA: () => <div data-testid="DueCTA">DueCTA</div>,
	StatsGrid: () => <div data-testid="StatsGrid">StatsGrid</div>,
	WeeklyChart: () => <div data-testid="WeeklyChart">WeeklyChart</div>,
	QuickActions: () => <div data-testid="QuickActions">QuickActions</div>,
	MyDecks: () => <div data-testid="MyDecks">MyDecks</div>,
	TrendingTips: () => <div data-testid="TrendingTips">TrendingTips</div>,
	MyContributions: () => <div data-testid="MyContributions">MyContributions</div>,
	DonationButton: () => <div data-testid="DonationButton">DonationButton</div>,
	GlobalLeaderboard: () => <div data-testid="GlobalLeaderboard">GlobalLeaderboard</div>,
	NextReviewWidget: () => <div data-testid="NextReviewWidget">NextReviewWidget</div>,
	MatchaWisdomWidget: () => <div data-testid="MatchaWisdomWidget">MatchaWisdomWidget</div>,
}));

// Mock external libs
// eslint-disable-next-line @typescript-eslint/no-require-imports
const confetti = vi.fn();
vi.mock('canvas-confetti', () => ({
	default: (...args: any[]) => confetti(...args),
}));

vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: vi.fn(),
		refresh: vi.fn(),
	}),
}));

vi.mock('antd', async () => {
	const actual = await vi.importActual('antd');
	return {
		...actual,
		theme: {
			useToken: () => ({
				token: {
					colorPrimary: '#1890ff',
					colorSuccess: '#52c41a',
					colorWarning: '#faad14',
				},
			}),
		},
	};
});

describe('DashboardContent Component', () => {
	const mockStats = {
		streak: 5,
		totalReviewed: 10,
	};

	const mockWeeklyStats = {
		days: [],
		thisWeekTotal: 50,
		bestDay: { day: 'Mon', count: 20 },
	};

	const mockForecast = {
		nextReview: new Date(),
		urgentCard: null,
		forecastCount: 0,
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders all widgets correctly', () => {
		render(
			<DashboardContent
				reviewCount={5}
				stats={mockStats}
				weeklyStats={mockWeeklyStats}
				dailyGoal={50}
				forecast={mockForecast}
			/>,
		);

		expect(screen.getByTestId('HeroSection')).toBeInTheDocument();
		expect(screen.getByTestId('NextReviewWidget')).toBeInTheDocument(); // Forecast present
		expect(screen.getByTestId('DueCTA')).toBeInTheDocument();
		expect(screen.getByTestId('WeeklyChart')).toBeInTheDocument();
		expect(screen.getByTestId('StatsGrid')).toBeInTheDocument();
		expect(screen.getByTestId('GlobalLeaderboard')).toBeInTheDocument();
		expect(screen.getByTestId('MyDecks')).toBeInTheDocument();
	});

	it('does not render NextReviewWidget if forecast is missing', () => {
		render(
			<DashboardContent
				reviewCount={5}
				stats={mockStats}
				weeklyStats={mockWeeklyStats}
				dailyGoal={50}
				forecast={undefined}
			/>,
		);
		expect(screen.queryByTestId('NextReviewWidget')).not.toBeInTheDocument();
	});

	it('triggers confetti when daily goal is reached', async () => {
		render(
			<DashboardContent
				reviewCount={0}
				stats={{ ...mockStats, totalReviewed: 50 }} // Hit goal
				dailyGoal={50}
			/>,
		);

		await waitFor(() => {
			expect(confetti).toHaveBeenCalledTimes(1);
		});
	});

	it('does not trigger confetti if goal not reached', () => {
		render(
			<DashboardContent
				reviewCount={0}
				stats={{ ...mockStats, totalReviewed: 49 }} // 1 short
				dailyGoal={50}
			/>,
		);

		expect(confetti).not.toHaveBeenCalled();
	});
});
