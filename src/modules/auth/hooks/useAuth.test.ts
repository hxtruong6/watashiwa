import * as supabaseClient from '@/utils/supabase/client';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from './useAuth';

// Mock Supabase client
vi.mock('@/utils/supabase/client', () => ({
	createClient: vi.fn(() => ({
		auth: {
			signOut: vi.fn(),
			getUser: vi.fn(),
		},
	})),
}));

// Mock auth actions
vi.mock('@/modules/auth/auth.actions', () => ({
	syncUser: vi.fn(),
}));

// Mock analytics
vi.mock('@/modules/auth/utils/authAnalytics', () => ({
	identifyUserForAuth: vi.fn(),
	trackSignupEvent: vi.fn(),
}));

describe('useAuth - logout', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Clear localStorage
		if (typeof window !== 'undefined') {
			localStorage.clear();
		}
	});

	it('should clear login method cache on logout', async () => {
		// Setup: Add login method cache
		if (typeof window !== 'undefined') {
			localStorage.setItem('watashi_login_methods', JSON.stringify({ test: 'data' }));
		}

		const mockSignOut = vi.fn().mockResolvedValue({ error: null });
		vi.mocked(supabaseClient.createClient).mockReturnValue({
			auth: {
				signOut: mockSignOut,
				getUser: vi.fn(),
			},
		} as any);

		const { result } = renderHook(() => useAuth());

		// Mock window.location.href
		delete (window as any).location;
		(window as any).location = { href: '' };

		await result.current.logout();

		// Verify localStorage was cleared
		expect(localStorage.getItem('watashi_login_methods')).toBeNull();
	});

	it('should call supabase.auth.signOut on logout', async () => {
		const mockSignOut = vi.fn().mockResolvedValue({ error: null });
		vi.mocked(supabaseClient.createClient).mockReturnValue({
			auth: {
				signOut: mockSignOut,
				getUser: vi.fn(),
			},
		} as any);

		const { result } = renderHook(() => useAuth());

		// Mock window.location.href
		delete (window as any).location;
		(window as any).location = { href: '' };

		await result.current.logout();

		// Verify signOut was called
		expect(mockSignOut).toHaveBeenCalledTimes(1);
	});

	it('should redirect to login page after successful logout', async () => {
		const mockSignOut = vi.fn().mockResolvedValue({ error: null });
		vi.mocked(supabaseClient.createClient).mockReturnValue({
			auth: {
				signOut: mockSignOut,
				getUser: vi.fn(),
			},
		} as any);

		const { result } = renderHook(() => useAuth());

		// Mock window.location.href
		delete (window as any).location;
		(window as any).location = { href: '' };

		await result.current.logout();

		// Verify redirect to login
		expect((window as any).location.href).toBe('/login');
	});

	it('should handle logout errors gracefully', async () => {
		const mockSignOut = vi.fn().mockResolvedValue({
			error: { message: 'Logout failed' },
		});
		vi.mocked(supabaseClient.createClient).mockReturnValue({
			auth: {
				signOut: mockSignOut,
				getUser: vi.fn(),
			},
		} as any);

		const onError = vi.fn();
		const { result } = renderHook(() =>
			useAuth({
				onError,
			}),
		);

		await result.current.logout();

		// Verify error callback was called
		await waitFor(() => {
			expect(onError).toHaveBeenCalled();
		});

		// Verify state has error
		expect(result.current.error).toBeTruthy();
	});

	it('should not redirect if logout fails', async () => {
		const mockSignOut = vi.fn().mockResolvedValue({
			error: { message: 'Logout failed' },
		});
		vi.mocked(supabaseClient.createClient).mockReturnValue({
			auth: {
				signOut: mockSignOut,
				getUser: vi.fn(),
			},
		} as any);

		const { result } = renderHook(() => useAuth());

		// Mock window.location.href
		delete (window as any).location;
		(window as any).location = { href: '' };

		await result.current.logout();

		// Verify no redirect happened
		expect((window as any).location.href).toBe('');
	});

	it('should clear state after successful logout', async () => {
		const mockSignOut = vi.fn().mockResolvedValue({ error: null });
		vi.mocked(supabaseClient.createClient).mockReturnValue({
			auth: {
				signOut: mockSignOut,
				getUser: vi.fn(),
			},
		} as any);

		const { result } = renderHook(() => useAuth());

		// Mock window.location.href
		delete (window as any).location;
		(window as any).location = { href: '' };

		await result.current.logout();

		// Verify state is cleared
		expect(result.current.error).toBeNull();
		expect(result.current.message).toBeNull();
		expect(result.current.loading).toBe(false);
	});
});
