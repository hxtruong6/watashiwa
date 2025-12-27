'use client';

import { syncUser } from '@/modules/auth/auth.actions';
import { identifyUserForAuth, trackSignupEvent } from '@/modules/auth/utils/authAnalytics';
import { createClient } from '@/utils/supabase/client';
import type { AuthError } from '@supabase/supabase-js';
import { useCallback, useMemo, useState } from 'react';

type AuthMode = 'login' | 'signup';

interface AuthState {
	loading: boolean;
	error: string | null;
	message: string | null;
}

interface UseAuthOptions {
	onSuccess?: (role?: string) => void;
	onError?: (error: string) => void;
	/**
	 * Translation function for error messages
	 * Should be from useTranslations('Login') hook
	 */
	t?: (key: string) => string;
}

interface AuthResult {
	success: boolean;
	error?: string;
	requiresConfirmation?: boolean;
}

/**
 * Custom hook for authentication logic
 * Separates business logic from UI, making it testable and reusable
 *
 * Performance: Memoizes Supabase client to avoid recreation on every render
 * Memory: Single client instance shared across hook lifecycle
 */
export function useAuth(options: UseAuthOptions = {}) {
	const { onSuccess, onError, t } = options;

	// Memoize Supabase client - created once per hook instance
	const supabase = useMemo(() => createClient(), []);

	const [state, setState] = useState<AuthState>({
		loading: false,
		error: null,
		message: null,
	});

	/**
	 * Reset state to initial values
	 * Used when switching between login/signup modes
	 */
	const resetState = useCallback(() => {
		setState({
			loading: false,
			error: null,
			message: null,
		});
	}, []);

	/**
	 * Handle post-authentication redirect
	 * Uses window.location.href to force full page reload, ensuring middleware
	 * sees the new session cookie. This is necessary for Next.js auth flows.
	 */
	const handlePostAuthRedirect = useCallback((role?: string) => {
		if (role === 'ADMIN') {
			window.location.href = '/admin';
			return;
		}
		// Force full reload ensures middleware sees the new cookie
		window.location.href = '/';
	}, []);

	/**
	 * Process successful authentication
	 * Handles user sync, analytics, and redirect
	 * Defensive: Handles all error cases gracefully
	 */
	const processAuthSuccess = useCallback(
		async (mode: AuthMode, user: { id: string; email?: string | null }) => {
			try {
				// Sync user to database (non-blocking if fails)
				const syncResult = await syncUser();
				const role = syncResult.data?.role;
				const isNewUser = syncResult.data?.isNewUser;

				// Get full user data for analytics
				const { data: userData } = await supabase.auth.getUser();

				// Analytics: Identify user (non-blocking)
				if (syncResult.success && userData?.user) {
					await identifyUserForAuth(userData.user);
				}

				// Analytics: Track signup event (non-blocking)
				if (mode === 'signup' && isNewUser && userData?.user) {
					trackSignupEvent(user.id, 'email', 'landing_page');
				}

				// Call success callback if provided
				if (onSuccess) {
					onSuccess(role);
				} else {
					// Default: redirect based on role
					handlePostAuthRedirect(role);
				}
			} catch (error) {
				// Log but don't block - user is already authenticated
				console.error('[Auth] Post-auth processing failed:', error);
				// Still redirect even if analytics/sync fails
				if (onSuccess) {
					onSuccess();
				} else {
					handlePostAuthRedirect();
				}
			}
		},
		[supabase, onSuccess, handlePostAuthRedirect],
	);

	/**
	 * Handle authentication errors
	 * Provides user-friendly error messages with translation support
	 */
	const handleAuthError = useCallback(
		(error: AuthError | Error | unknown): string => {
			if (error && typeof error === 'object' && 'message' in error) {
				const authError = error as AuthError;
				// Map common Supabase errors to user-friendly messages
				if (authError.message.includes('Invalid login credentials')) {
					return t?.('errorInvalidCredentials') || 'Invalid email or password';
				}
				if (authError.message.includes('Email not confirmed')) {
					return t?.('errorEmailNotConfirmed') || 'Please check your email to confirm your account';
				}
				if (authError.message.includes('User already registered')) {
					return t?.('errorUserExists') || 'An account with this email already exists';
				}
				return (
					authError.message || t?.('errorAuthFailed') || 'An error occurred during authentication'
				);
			}
			return t?.('unexpectedError') || 'An unexpected error occurred';
		},
		[t],
	);

	/**
	 * Login handler with validation and error handling
	 */
	const login = useCallback(
		async (email: string, password: string): Promise<AuthResult> => {
			setState({ loading: true, error: null, message: null });

			try {
				// Validate inputs are not empty (Zod validation happens in component)
				if (!email?.trim() || !password) {
					throw new Error(t?.('errorAllFieldsRequired') || 'Email and password are required');
				}

				const { data, error } = await supabase.auth.signInWithPassword({
					email: email.trim().toLowerCase(),
					password,
				});

				if (error) {
					const errorMessage = handleAuthError(error);
					setState({ loading: false, error: errorMessage, message: null });
					onError?.(errorMessage);
					return { success: false, error: errorMessage };
				}

				if (!data.user) {
					throw new Error('Authentication succeeded but no user data returned');
				}

				// Process successful login
				await processAuthSuccess('login', data.user);

				return { success: true };
			} catch (error) {
				const errorMessage = handleAuthError(error);
				setState({ loading: false, error: errorMessage, message: null });
				onError?.(errorMessage);
				return { success: false, error: errorMessage };
			}
		},
		[supabase, handleAuthError, processAuthSuccess, onError, t],
	);

	/**
	 * Signup handler with validation and error handling
	 */
	const signup = useCallback(
		async (email: string, password: string, name: string): Promise<AuthResult> => {
			setState({ loading: true, error: null, message: null });

			try {
				// Validate inputs (Zod validation happens in component)
				if (!email?.trim() || !password || !name?.trim()) {
					throw new Error(t?.('errorAllFieldsRequired') || 'All fields are required');
				}

				// Validate origin exists (defensive)
				const origin = typeof window !== 'undefined' ? window.location.origin : '';
				if (!origin) {
					throw new Error(t?.('errorOriginMissing') || 'Unable to determine application origin');
				}

				const { data, error } = await supabase.auth.signUp({
					email: email.trim().toLowerCase(),
					password,
					options: {
						emailRedirectTo: `${origin}/auth/callback`,
						data: {
							full_name: name.trim(),
						},
					},
				});

				if (error) {
					const errorMessage = handleAuthError(error);
					setState({ loading: false, error: errorMessage, message: null });
					onError?.(errorMessage);
					return { success: false, error: errorMessage };
				}

				// Check if email confirmation is required
				if (!data.session) {
					// Email confirmation required - component will handle message display
					setState({
						loading: false,
						error: null,
						message: null, // Component handles translation
					});
					return { success: true, requiresConfirmation: true };
				}

				// User logged in immediately (email confirmation disabled)
				if (!data.user) {
					throw new Error('Signup succeeded but no user data returned');
				}

				await processAuthSuccess('signup', data.user);

				return { success: true };
			} catch (error) {
				const errorMessage = handleAuthError(error);
				setState({ loading: false, error: errorMessage, message: null });
				onError?.(errorMessage);
				return { success: false, error: errorMessage };
			}
		},
		[supabase, handleAuthError, processAuthSuccess, onError, t],
	);

	return {
		...state,
		login,
		signup,
		resetState,
		setMessage: (msg: string | null) => setState((prev) => ({ ...prev, message: msg })),
	};
}
