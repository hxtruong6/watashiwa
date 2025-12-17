import { useState, useEffect } from 'react';

/**
 * Hook to handle "Zen Mode" distraction-free scrolling.
 * Hides the header when scrolling down, shows it when scrolling up.
 */
export function useZenMode<T extends HTMLElement>(
	threshold = 10,
	elementRef?: React.RefObject<T | null>,
) {
	const [headerVisible, setHeaderVisible] = useState(true);

	useEffect(() => {
		const target = elementRef?.current || window;
		let lastScrollY = elementRef?.current ? elementRef.current.scrollTop : window.scrollY;

		const handleScroll = () => {
			const currentScrollY = elementRef?.current ? elementRef.current.scrollTop : window.scrollY;
			const diff = currentScrollY - lastScrollY;

			// Scroll Down -> Hide Header
			if (diff > threshold && currentScrollY > 50) {
				setHeaderVisible(false);
			}
			// Scroll Up -> Show Header
			else if (diff < -threshold) {
				setHeaderVisible(true);
			}
			lastScrollY = currentScrollY;
		};

		target.addEventListener('scroll', handleScroll, { passive: true });
		return () => target.removeEventListener('scroll', handleScroll);
	}, [threshold, elementRef]);

	return { headerVisible };
}
