import { useEffect, useState } from 'react';

/**
 * useResponsiveBreakpoint Hook
 * Handles responsive breakpoints with proper SSR support
 * Uses CSS media queries to avoid hydration mismatch
 */
export function useResponsiveBreakpoint() {
	// Initialize with false (desktop) for SSR
	// Will update on client after mount
	const [isMobile, setIsMobile] = useState(() => {
		// Only check window on client side
		if (typeof window !== 'undefined') {
			return window.matchMedia('(max-width: 575px)').matches;
		}
		return false;
	});

	useEffect(() => {
		// Use CSS media query for more reliable detection
		const mediaQuery = window.matchMedia('(max-width: 575px)');
		const updateIsMobile = () => setIsMobile(mediaQuery.matches);

		// Set initial value (in case it changed between render and effect)
		updateIsMobile();

		// Listen for changes
		mediaQuery.addEventListener('change', updateIsMobile);

		return () => {
			mediaQuery.removeEventListener('change', updateIsMobile);
		};
	}, []);

	return isMobile;
}
