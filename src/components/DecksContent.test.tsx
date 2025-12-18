import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import DecksContent from './DecksContent';

// Mock next/navigation
vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: vi.fn() }),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
	useLocale: () => 'en',
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

describe('DecksContent', () => {
	const mockDecks = [
		{
			id: '1',
			title: 'JLPT N5',
			description: 'Basic vocabulary',
			isPublic: true,
			authorId: 'user1',
			_count: { vocab: 10, kanji: 5 },
		},
		{
			id: '2',
			title: 'My Private Deck',
			description: 'Secret stuff',
			isPublic: false,
			authorId: 'user1',
			_count: { vocab: 0, kanji: 0 },
		},
	];

	it('renders list of decks', () => {
		render(<DecksContent decks={mockDecks} userId="user1" />);

		expect(screen.getByText('JLPT N5')).toBeInTheDocument();
		expect(screen.getByText('My Private Deck')).toBeInTheDocument();
		expect(screen.getByText('libraryTitle')).toBeInTheDocument(); // Translation key
	});

	it('renders Create Deck button', () => {
		render(<DecksContent decks={mockDecks} userId="user1" />);
		const buttons = screen.getAllByText('newDeck'); // Translation key
		expect(buttons.length).toBeGreaterThan(0);
	});

	it('renders empty state when no decks', () => {
		render(<DecksContent decks={[]} userId="user1" />);
		expect(screen.getByText('noDecksDescription')).toBeInTheDocument();
		expect(screen.getByText('createDeckButton')).toBeInTheDocument();
	});
});
