import type { NavItem } from './NavConfig';

/**
 * Navbar constants and utilities
 * Centralized magic numbers and helper functions
 */

// Spacing constants
export const NAVBAR_SPACER_DESKTOP = 110;
export const NAVBAR_SPACER_MOBILE = 60;

// Z-index constants
export const NAVBAR_Z_INDEX = 1000;

// Glass morphism constants
export const GLASS_DOCK_BLUR = 'blur(16px)';
export const GLASS_DOCK_BORDER_RADIUS = 24;

/**
 * Check if a nav item is active based on current pathname
 * Fixes inconsistent "Mission" route matching by using consistent startsWith pattern
 *
 * @param pathname - Current route pathname (from usePathname())
 * @param navItem - Nav item to check
 * @param searchParams - Optional search params for special cases (e.g., Mission with app=true)
 * @returns true if the nav item should be marked as active
 */
export function isActiveRoute(
	pathname: string,
	navItem: NavItem,
	searchParams?: URLSearchParams,
): boolean {
	// Special case: Mission route (/dashboard?app=true)
	// Check if pathname is '/' with app=true, or if pathname starts with '/dashboard'
	if (navItem.path === '/dashboard?app=true') {
		// Check for root path with app=true param
		if (pathname === '/' && searchParams?.get('app') === 'true') {
			return true;
		}
		// Check if pathname starts with /dashboard
		if (pathname.startsWith('/dashboard')) {
			return true;
		}
		return false;
	}

	// For root path nav items, use exact match
	if (navItem.path === '/') {
		return pathname === '/';
	}

	// For all other routes, use startsWith pattern (consistent behavior)
	// Remove query params from navItem.path for comparison
	const basePath = navItem.path.split('?')[0].split('#')[0];
	return pathname.startsWith(basePath) && basePath !== '/';
}
