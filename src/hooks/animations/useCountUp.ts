/**
 * Hook for counting up numbers with animation
 * Optimized for performance using requestAnimationFrame
 */
import { useEffect, useState } from 'react';

interface UseCountUpOptions {
	duration?: number;
	start?: number;
	easing?: (t: number) => number;
}

const easeOutCubic = (t: number): number => {
	return 1 - Math.pow(1 - t, 3);
};

export function useCountUp(
	end: number,
	options: UseCountUpOptions = {},
): { count: number; isAnimating: boolean } {
	const { duration = 1500, start = 0, easing = easeOutCubic } = options;
	const [count, setCount] = useState(start);
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		// Respect reduced motion preference
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) {
			// Use setTimeout to avoid synchronous setState
			setTimeout(() => setCount(end), 0);
			return;
		}

		// Use setTimeout to avoid synchronous setState
		setTimeout(() => setIsAnimating(true), 0);
		const startTime = Date.now();
		const difference = end - start;

		const animate = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = easing(progress);
			const current = Math.round(start + difference * eased);

			setCount(current);

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				setIsAnimating(false);
			}
		};

		const frameId = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(frameId);
		};
	}, [end, start, duration, easing]);

	return { count, isAnimating };
}
