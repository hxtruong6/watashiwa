import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import DeckView from './DeckView';

// Mock next/navigation
vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
	notFound: vi.fn(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}));

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

// Mock sub-components
vi.mock('@/components/FlashCard', () => ({
	default: () => <div data-testid="FlashCard">FlashCard</div>,
}));
vi.mock('@/components/comments/CommentDrawer', () => ({
	default: () => <div data-testid="CommentDrawer">CommentDrawer</div>,
}));
vi.mock('@/components/SmartContentInput', () => ({
	default: () => <div data-testid="SmartContentInput">SmartContentInput</div>,
}));
vi.mock('@/components/BackButton', () => ({
	default: () => <div data-testid="BackButton">BackButton</div>,
}));

// Mock Ant Design
vi.mock('antd', async () => {
	const actual = await vi.importActual('antd');
	return {
		...actual,
		theme: {
			useToken: () => ({
				token: {
					colorPrimary: '#1890ff',
					colorBgLayout: '#ffffff',
				},
			}),
		},
	};
});

describe('DeckView', () => {
	const mockDeck = {
		id: '1',
		title: 'Master Kanji',
		description: 'Hardcore deck',
		isPublic: true,
		authorId: 'user1',
		vocab: [{ id: 'v1', wordSurface: 'Suru', meaning: 'To do' }],
		kanji: [],
		stats: { total: 10, started: 5, new: 5, learning: 2, review: 3, unseen: 5 },
	};

	it('renders deck details', () => {
		render(<DeckView deck={mockDeck} isOwner={false} />);
		// Title appears in Breadcrumb and Header, so use getAll or specific role
		expect(screen.getAllByText('Master Kanji').length).toBeGreaterThan(0);
		expect(screen.getByText('Hardcore deck')).toBeInTheDocument();
	});

	it('shows Edit button for owner', () => {
		render(<DeckView deck={mockDeck} isOwner={true} />);
		// "addNewContent" is the translation key for the edit button
		expect(screen.getByText('addNewContent')).toBeInTheDocument();
	});

	it('hides Edit button for non-owner', () => {
		render(<DeckView deck={mockDeck} isOwner={false} />);
		expect(screen.queryByText('addNewContent')).not.toBeInTheDocument();
	});
});
