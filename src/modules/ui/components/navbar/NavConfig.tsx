import {
	CompassOutlined,
	DeploymentUnitOutlined,
	FontSizeOutlined,
	ReadOutlined,
	RocketOutlined,
} from '@ant-design/icons';
import React from 'react';

export interface NavItem {
	key: string;
	label: string;
	path: string;
	icon: React.ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
	{
		key: 'mission',
		label: 'Mission',
		path: '/dashboard?app=true', // Keeping original 'dashboard' logic
		icon: <CompassOutlined />,
	},
	{
		key: 'discover',
		label: 'Discover',
		path: '/decks',
		icon: <RocketOutlined />, // 'Telescope' replacement
	},
	{
		key: 'collection',
		label: 'Collection',
		path: '/dashboard/decks',
		icon: <DeploymentUnitOutlined />, // 'LayerGroup' replacement or similar
	},
	{
		key: 'journey',
		label: 'Journey',
		path: '/dashboard/courses',
		icon: <ReadOutlined />,
	},
	{
		key: 'kanaReference',
		label: 'Kana',
		path: '/reference/kana',
		icon: <FontSizeOutlined />,
	},
];

/**
 * List of protected routes that require authentication
 * These routes will redirect to login if accessed by public users
 */
const PROTECTED_ROUTES = ['/study', '/decks', '/dashboard'];

/**
 * Check if a route path is protected (requires authentication)
 * @param path - The route path to check (e.g., '/decks', '/dashboard/courses')
 * @returns true if the route is protected, false otherwise
 */
export function isProtectedRoute(path: string): boolean {
	// Handle edge cases: empty string or invalid path
	if (!path || typeof path !== 'string') {
		return false;
	}

	// Remove query parameters and hash for comparison
	const cleanPath = path.split('?')[0].split('#')[0].trim();

	// Handle empty path after cleaning
	if (!cleanPath || cleanPath === '') {
		return false;
	}

	// Normalize trailing slashes (remove them for comparison)
	const normalizedPath =
		cleanPath.endsWith('/') && cleanPath !== '/' ? cleanPath.slice(0, -1) : cleanPath;

	// Check exact matches and path prefixes
	return PROTECTED_ROUTES.some((route) => {
		// Exact match (with or without trailing slash)
		if (normalizedPath === route || normalizedPath === `${route}/`) {
			return true;
		}
		// Path starts with route (e.g., '/dashboard/courses' starts with '/dashboard')
		if (normalizedPath.startsWith(`${route}/`)) {
			return true;
		}
		// Special case: root path with app=true is protected
		if (normalizedPath === '/' && path.includes('app=true')) {
			return true;
		}
		return false;
	});
}

/**
 * List of auth pages that should not be used as returnUrl to prevent redirect loops
 */
const AUTH_PAGES = ['/login', '/forgot-password', '/reset-password', '/auth'];

/**
 * Validate returnUrl to prevent open redirect vulnerabilities
 * Only allows relative paths starting with '/'
 * @param returnUrl - The returnUrl to validate (may be URL-encoded)
 * @returns true if valid, false otherwise
 */
export function isValidReturnUrl(returnUrl: string | null): boolean {
	if (!returnUrl) {
		return false;
	}

	// Decode URL-encoded paths to prevent bypass attempts (e.g., %2F)
	let decodedUrl: string;
	try {
		decodedUrl = decodeURIComponent(returnUrl);
	} catch {
		// Invalid encoding - reject
		return false;
	}

	// Must start with '/' (relative path)
	if (!decodedUrl.startsWith('/')) {
		return false;
	}

	// Reject external URLs (http://, https://, //)
	if (decodedUrl.match(/^https?:\/\//i) || decodedUrl.startsWith('//')) {
		return false;
	}

	// Reject javascript: and data: protocols
	if (decodedUrl.match(/^(javascript|data):/i)) {
		return false;
	}

	// Reject directory traversal attempts (../, ..\\, etc.)
	if (
		decodedUrl.includes('../') ||
		decodedUrl.includes('..\\') ||
		decodedUrl.includes('..%2F') ||
		decodedUrl.includes('..%5C')
	) {
		return false;
	}

	// Reject auth pages to prevent redirect loops
	const pathWithoutQuery = decodedUrl.split('?')[0].split('#')[0];
	if (
		AUTH_PAGES.some(
			(authPage) => pathWithoutQuery === authPage || pathWithoutQuery.startsWith(`${authPage}/`),
		)
	) {
		return false;
	}

	// Reject overly long URLs (potential DoS)
	const MAX_URL_LENGTH = 2048;
	if (decodedUrl.length > MAX_URL_LENGTH) {
		return false;
	}

	return true;
}
