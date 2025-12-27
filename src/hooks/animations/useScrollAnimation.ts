/**
 * Hook for scroll-triggered animations using Intersection Observer
 * Optimized for performance with proper cleanup
 */
import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
	threshold?: number;
	rootMargin?: string;
	triggerOnce?: boolean;
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
	const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;

	const [isVisible, setIsVisible] = useState(false);
	const elementRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		const element = elementRef.current;
		if (!element) return;

		// Respect reduced motion preference
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) {
			// Use setTimeout to avoid synchronous setState
			setTimeout(() => setIsVisible(true), 0);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					if (triggerOnce) {
						observer.unobserve(element);
					}
				} else if (!triggerOnce) {
					setIsVisible(false);
				}
			},
			{
				threshold,
				rootMargin,
			},
		);

		observer.observe(element);

		return () => {
			observer.disconnect();
		};
	}, [threshold, rootMargin, triggerOnce]);

	return { ref: elementRef, isVisible };
}
