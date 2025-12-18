import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import LandingPage from './LandingPage';

// Mock child components
vi.mock('./HeroSection', () => ({
	default: () => <div data-testid="HeroSection">HeroSection</div>,
}));
vi.mock('./FeatureSection', () => ({
	default: () => <div data-testid="FeatureSection">FeatureSection</div>,
}));
vi.mock('./SocialProofSection', () => ({
	default: () => <div data-testid="SocialProofSection">SocialProofSection</div>,
}));
vi.mock('./CTASection', () => ({ default: () => <div data-testid="CTASection">CTASection</div> }));

vi.mock('antd', async () => {
	const actual = await vi.importActual('antd');
	return {
		...actual,
		theme: {
			useToken: () => ({
				token: {
					colorBgLayout: '#ffffff',
					colorTextSecondary: '#999999',
					colorBorderSecondary: '#eeeeee',
				},
			}),
		},
	};
});

describe('LandingPage Component', () => {
	it('renders all sections correctly', () => {
		render(<LandingPage />);

		expect(screen.getByTestId('HeroSection')).toBeInTheDocument();
		expect(screen.getByTestId('FeatureSection')).toBeInTheDocument();
		expect(screen.getByTestId('SocialProofSection')).toBeInTheDocument();
		expect(screen.getByTestId('CTASection')).toBeInTheDocument();
	});

	it('renders footer with current year', () => {
		render(<LandingPage />);
		const currentYear = new Date().getFullYear().toString();
		expect(screen.getByText(new RegExp(`© ${currentYear} WatashiWa`))).toBeInTheDocument();
	});
});
