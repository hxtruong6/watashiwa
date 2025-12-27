/**
 * Utility functions for login method cache
 * Provides server-safe helpers and sanitization
 */

export interface CachedLoginMethod {
	email: string;
	providers: Array<{
		provider: 'email' | 'google';
		lastUsed: string;
		badge?: 'recent' | 'today' | 'week' | 'month' | 'old';
	}>;
	cachedAt: string;
}

const CACHE_KEY = 'watashi_login_methods';
const CACHE_TTL = 90 * 24 * 60 * 60 * 1000; // 90 days

/**
 * Sanitize email before storing in cache
 * Basic validation to prevent XSS
 */
export function sanitizeEmail(email: string): string {
	// Remove any potential script tags or dangerous characters
	return email.trim().toLowerCase().replace(/[<>]/g, '');
}

/**
 * Validate cached data structure
 * Prevents corrupted data from breaking the app
 */
export function validateCachedMethod(data: unknown): data is CachedLoginMethod {
	if (!data || typeof data !== 'object') return false;

	const obj = data as Record<string, unknown>;

	if (typeof obj.email !== 'string' || !obj.email) return false;
	if (!Array.isArray(obj.providers)) return false;
	if (typeof obj.cachedAt !== 'string') return false;

	// Validate providers array
	for (const provider of obj.providers) {
		if (typeof provider !== 'object' || !provider) return false;
		if (provider.provider !== 'email' && provider.provider !== 'google') return false;
		if (typeof provider.lastUsed !== 'string') return false;
	}

	return true;
}

/**
 * Get cache TTL in milliseconds
 */
export function getCacheTTL(): number {
	return CACHE_TTL;
}

/**
 * Check if cache entry is expired
 */
export function isCacheExpired(cachedAt: string): boolean {
	const cachedTime = new Date(cachedAt).getTime();
	const now = Date.now();
	return now - cachedTime >= CACHE_TTL;
}

/**
 * Calculate badge based on last used timestamp
 * Server-safe version (doesn't use Date.now())
 */
export function calculateBadge(
	lastUsed: string,
	now: Date = new Date(),
): 'recent' | 'today' | 'week' | 'month' | 'old' {
	const lastUsedDate = new Date(lastUsed);
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
 * Get cache key (for testing/mocking)
 */
export function getCacheKey(): string {
	return CACHE_KEY;
}
