import { useEffect, useRef, useState } from 'react';

interface UseScrollPositionOptions {
	threshold?: number; // Scroll threshold in pixels to trigger scrolled state
	/**
	 * Direction-based behavior: If true, navbar returns to normal when scrolling up
	 * (but only within a "near top" zone). If false, only returns to normal when scrollY <= threshold.
	 * @default true
	 */
	directionBased?: boolean;
	/**
	 * Near top zone: Distance from top where scrolling up will expand navbar.
	 * Only applies when directionBased=true.
	 * @default 150 (pixels from top)
	 */
	nearTopZone?: number;
}

/**
 * useScrollPosition Hook
 * Tracks scroll position and returns whether user has scrolled past threshold
 *
 * With directionBased=true (default):
 * - Returns false when at top (scrollY <= threshold) OR when actively scrolling up within nearTopZone
 * - Returns true when scrolling down past threshold OR when far from top (scrollY > nearTopZone)
 *
 * With directionBased=false:
 * - Returns false when at top (scrollY <= threshold)
 * - Returns true when scrolled down (scrollY > threshold)
 */
export function useScrollPosition({
	threshold = 50,
	directionBased = true,
	nearTopZone = 150,
}: UseScrollPositionOptions = {}) {
	const [isScrolled, setIsScrolled] = useState(false);
	const lastScrollY = useRef(0);
	const scrollDirection = useRef<'up' | 'down' | null>(null);
	const scrollHistory = useRef<number[]>([]); // Track recent scroll positions for direction detection
	const rafId = useRef<number | null>(null);

	useEffect(() => {
		const updateScrollState = () => {
			const scrollY = window.scrollY || document.documentElement.scrollTop;

			// Update scroll history (keep last 3 positions for smoother direction detection)
			scrollHistory.current.push(scrollY);
			if (scrollHistory.current.length > 3) {
				scrollHistory.current.shift();
			}

			// Detect scroll direction using history (more reliable than single delta)
			if (scrollHistory.current.length >= 2) {
				const recentDelta =
					scrollHistory.current[scrollHistory.current.length - 1] - scrollHistory.current[0];
				if (Math.abs(recentDelta) > 2) {
					scrollDirection.current = recentDelta > 0 ? 'down' : 'up';
				}
			}

			// Direction is preserved for zone transitions - only cleared when explicitly needed (at top)

			if (directionBased) {
				// At top: always normal
				if (scrollY <= threshold) {
					setIsScrolled((prev) => {
						if (prev !== false) return false;
						return prev;
					});
					scrollDirection.current = null;
				}
				// Near top zone (threshold < scrollY <= nearTopZone): direction-based
				else if (scrollY <= nearTopZone) {
					// Scrolling down: compact
					if (scrollDirection.current === 'down') {
						setIsScrolled((prev) => {
							if (prev !== true) return true;
							return prev;
						});
					}
					// Scrolling up: normal (good for navigation when near top)
					else if (scrollDirection.current === 'up') {
						setIsScrolled((prev) => {
							if (prev !== false) return false;
							return prev;
						});
					}
					// No direction detected: use position-based default
					// Closer to threshold = normal, closer to nearTopZone = compact
					else {
						const distanceFromThreshold = scrollY - threshold;
						const zoneSize = nearTopZone - threshold;
						const isCloserToTop = distanceFromThreshold < zoneSize / 2;
						setIsScrolled((prev) => {
							const newValue = !isCloserToTop;
							if (prev !== newValue) return newValue;
							return prev;
						});
					}
				}
				// Far from top: always compact (maximize content visibility)
				else {
					setIsScrolled((prev) => {
						if (prev !== true) return true;
						return prev;
					});
				}
			} else {
				// Threshold-based behavior: Simple position check
				const newValue = scrollY > threshold;
				setIsScrolled((prev) => {
					if (prev !== newValue) return newValue;
					return prev;
				});
			}

			lastScrollY.current = scrollY;
		};

		const handleScroll = () => {
			// Use requestAnimationFrame for smoother updates
			if (rafId.current) {
				cancelAnimationFrame(rafId.current);
			}
			rafId.current = requestAnimationFrame(updateScrollState);
		};

		// Check initial scroll position
		updateScrollState();

		// Use passive listener for better performance
		window.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', handleScroll);
			if (rafId.current) {
				cancelAnimationFrame(rafId.current);
			}
		};
	}, [threshold, directionBased, nearTopZone]);

	return isScrolled;
}
