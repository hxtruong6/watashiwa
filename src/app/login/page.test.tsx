import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthPage from './page';

// Mock Supabase
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();

vi.mock('@/utils/supabase/client', () => ({
	createClient: () => ({
		auth: {
			signInWithPassword: mockSignIn,
			signUp: mockSignUp,
		},
	}),
}));

// Mock Actions
vi.mock('@/services/actions', () => ({
	syncUser: vi.fn(),
}));

// Mock Next.js & Components
vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: vi.fn() }),
}));

// Mock Antd App for 'message' context
vi.mock('antd', async () => {
	const actual = await vi.importActual('antd');
	return {
		...actual,
		App: {
			useApp: () => ({
				message: {
					success: vi.fn(),
					error: vi.fn(),
				},
			}),
		},
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

// Mock Form item animations if causing trouble (framer-motion)
vi.mock('framer-motion', () => ({
	motion: {
		div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
	},
}));

// Mock translations
vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}));

describe('AuthPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset mocks
		mockSignIn.mockResolvedValue({ error: null, data: {} });
		mockSignUp.mockResolvedValue({ error: null, data: { session: {} } });
	});

	it('renders login form by default', () => {
		render(<AuthPage />);
		expect(screen.getByPlaceholderText('emailPlaceholder')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('passwordPlaceholder')).toBeInTheDocument();
		expect(screen.queryByPlaceholderText('fullNamePlaceholder')).not.toBeInTheDocument();
		expect(screen.getByText('loginButton')).toBeInTheDocument();
	});

	it('switches to signup mode', () => {
		render(<AuthPage />);

		// Click switch button (the "Sign Up" link at the bottom)
		// When in 'login' mode, the submit button says 'loginButton', so 'signupButton' is unique to the toggle link.
		const toggleBtn = screen.getByText('signupButton');

		fireEvent.click(toggleBtn);

		expect(screen.getByPlaceholderText('fullNamePlaceholder')).toBeInTheDocument();
	});

	it('submits login form with correct credentials', async () => {
		render(<AuthPage />);

		fireEvent.change(screen.getByPlaceholderText('emailPlaceholder'), {
			target: { value: 'test@example.com' },
		});
		fireEvent.change(screen.getByPlaceholderText('passwordPlaceholder'), {
			target: { value: 'password123' },
		});

		const submitBtn = screen.getAllByText('loginButton')[0]; // The button inside form
		fireEvent.click(submitBtn);

		await waitFor(() => {
			expect(mockSignIn).toHaveBeenCalledWith({
				email: 'test@example.com',
				password: 'password123',
			});
		});
	});
});
