'use client';

import { validateCachedMethod } from '@/modules/auth/utils/loginMethodCache';
import { useCallback } from 'react';

export interface CachedLoginMethod {
	email: string;
	providers: Array<{
		provider: 'email' | 'google';
		lastUsed: string; // ISO timestamp
		badge?: 'recent' | 'today' | 'week' | 'month' | 'old';
	}>;
	cachedAt: string; // For cache invalidation
}

const CACHE_KEY = 'watashi_login_methods';
const CACHE_TTL = 90 * 24 * 60 * 60 * 1000; // 90 days
const MAX_CACHE_ENTRIES = 10; // Limit cache size to prevent quota issues

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
	if (typeof window === 'undefined') return false;
	try {
		const test = '__localStorage_test__';
		localStorage.setItem(test, test);
		localStorage.removeItem(test);
		return true;
	} catch {
		return false;
	}
}

/**
 * Calculate badge based on last used timestamp
 */
function calculateBadge(lastUsed: string): 'recent' | 'today' | 'week' | 'month' | 'old' {
	const lastUsedDate = new Date(lastUsed);
	const now = new Date();
	const diffMs = now.getTime() - lastUsedDate.getTime();
	const diffDays = diffMs / (1000 * 60 * 60 * 24);

	if (diffDays < 1) {
		return 'today';
	} else if (diffDays < 7) {
		return 'week';
	} else if (diffDays < 30) {
		return 'month';
	} else if (diffDays < 90) {
		return 'recent';
	}
	return 'old';
}

/**
 * Custom hook for managing login method cache in localStorage
 * Provides fast access to previously used login methods with "last login" badges
 */
export function useLoginMethodCache() {
	const getCachedMethods = useCallback((): CachedLoginMethod[] => {
		if (typeof window === 'undefined' || !isLocalStorageAvailable()) return [];

		try {
			const cached = localStorage.getItem(CACHE_KEY);
			if (!cached) return [];

			const parsed = JSON.parse(cached);
			// Validate it's an array
			if (!Array.isArray(parsed)) {
				// Corrupted data - clear it
				localStorage.removeItem(CACHE_KEY);
				return [];
			}

			const now = Date.now();

			// Filter and validate entries
			const validEntries = parsed
				.filter((entry: unknown) => {
					// Validate structure
					if (!validateCachedMethod(entry)) return false;
					// Filter expired entries
					const cachedAt = new Date((entry as CachedLoginMethod).cachedAt).getTime();
					return now - cachedAt < CACHE_TTL;
				})
				.map((entry: CachedLoginMethod) => ({
					...entry,
					// Validate email format
					email: entry.email.trim().toLowerCase(),
					providers: entry.providers.map((p) => ({
						...p,
						badge: calculateBadge(p.lastUsed),
					})),
				}))
				.filter((entry) => {
					// Basic email validation
					const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
					return emailRegex.test(entry.email);
				});

			// If we had to filter out invalid entries, save the cleaned version
			if (validEntries.length !== parsed.length) {
				try {
					localStorage.setItem(CACHE_KEY, JSON.stringify(validEntries));
				} catch {
					// If we can't save, continue with valid entries
				}
			}

			return validEntries;
		} catch (error) {
			// Corrupted JSON or other error - clear cache
			console.error('[LoginCache] Failed to read cache:', error);
			try {
				localStorage.removeItem(CACHE_KEY);
			} catch {
				// Ignore errors when clearing
			}
			return [];
		}
	}, []);

	const updateCache = useCallback(
		(email: string, provider: 'email' | 'google') => {
			if (typeof window === 'undefined' || !isLocalStorageAvailable()) return;

			try {
				// Sanitize email
				const sanitizedEmail = email.trim().toLowerCase();
				if (!sanitizedEmail || !sanitizedEmail.includes('@')) return;

				const methods = getCachedMethods();
				const existing = methods.find((m) => m.email === sanitizedEmail);

				const providerEntry = {
					provider,
					lastUsed: new Date().toISOString(),
				};

				let updatedMethods: CachedLoginMethod[];

				if (existing) {
					// Update existing entry
					const providerIndex = existing.providers.findIndex((p) => p.provider === provider);
					if (providerIndex >= 0) {
						existing.providers[providerIndex] = providerEntry;
					} else {
						existing.providers.push(providerEntry);
					}
					existing.cachedAt = new Date().toISOString();
					updatedMethods = methods;
				} else {
					// Add new entry
					const newEntry: CachedLoginMethod = {
						email: sanitizedEmail,
						providers: [providerEntry],
						cachedAt: new Date().toISOString(),
					};
					updatedMethods = [...methods, newEntry];

					// Implement LRU eviction if we exceed max entries
					if (updatedMethods.length > MAX_CACHE_ENTRIES) {
						// Sort by cachedAt (oldest first) and remove oldest
						updatedMethods.sort((a, b) => {
							const timeA = new Date(a.cachedAt).getTime();
							const timeB = new Date(b.cachedAt).getTime();
							return timeA - timeB;
						});
						updatedMethods = updatedMethods.slice(-MAX_CACHE_ENTRIES);
					}
				}

				// Save back to localStorage
				localStorage.setItem(CACHE_KEY, JSON.stringify(updatedMethods));
			} catch (error) {
				// Handle quota exceeded error
				if (error instanceof DOMException && error.name === 'QuotaExceededError') {
					console.warn('[LoginCache] Storage quota exceeded, implementing LRU eviction');
					try {
						// Try to reduce cache size by removing oldest entries
						const methods = getCachedMethods();
						if (methods.length > 1) {
							// Keep only the most recent entry
							methods.sort((a, b) => {
								const timeA = new Date(a.cachedAt).getTime();
								const timeB = new Date(b.cachedAt).getTime();
								return timeB - timeA;
							});
							localStorage.setItem(CACHE_KEY, JSON.stringify([methods[0]]));
						}
					} catch (retryError) {
						console.error('[LoginCache] Failed to recover from quota error:', retryError);
						// Clear cache as last resort
						try {
							localStorage.removeItem(CACHE_KEY);
						} catch {
							// Ignore
						}
					}
				} else {
					console.error('[LoginCache] Failed to update cache:', error);
				}
			}
		},
		[getCachedMethods],
	);

	const clearCache = useCallback(() => {
		if (typeof window === 'undefined' || !isLocalStorageAvailable()) return;
		try {
			localStorage.removeItem(CACHE_KEY);
		} catch (error) {
			console.error('[LoginCache] Failed to clear cache:', error);
		}
	}, []);

	const getCachedMethodForEmail = useCallback(
		(email: string): CachedLoginMethod | null => {
			const methods = getCachedMethods();
			return methods.find((m) => m.email === email) || null;
		},
		[getCachedMethods],
	);

	return {
		getCachedMethods,
		getCachedMethodForEmail,
		updateCache,
		clearCache,
	};
}
