import { useState, useEffect, useCallback, useRef } from 'react';

interface UseZenModeOptions<T extends HTMLElement> {
	scrollThreshold?: number;
	autoHideDelay?: number; // milliseconds, 0 to disable
	elementRef?: React.RefObject<T | null>;
}

interface UseZenModeReturn {
	headerVisible: boolean;
	isAutoHidden: boolean;
	forceShow: () => void;
	forceHide: () => void;
	resetTimer: () => void;
}

/**
 * Hook to handle "Zen Mode" distraction-free experience.
 * - Auto-hides header after inactivity
 * - Hides header when scrolling down
 * - Shows header when scrolling up
 * - Provides manual controls (forceShow, forceHide)
 */
export function useZenMode<T extends HTMLElement>(
	scrollThreshold: number,
	elementRef?: React.RefObject<T | null>,
	autoHideDelay?: number,
): UseZenModeReturn;

export function useZenMode<T extends HTMLElement>(options: UseZenModeOptions<T>): UseZenModeReturn;

export function useZenMode<T extends HTMLElement>(
	scrollThresholdOrOptions: number | UseZenModeOptions<T> = 10,
	elementRef?: React.RefObject<T | null>,
	autoHideDelay = 3000,
): UseZenModeReturn {
	// Parse options (support both old and new API)
	const options: UseZenModeOptions<T> =
		typeof scrollThresholdOrOptions === 'number'
			? {
					scrollThreshold: scrollThresholdOrOptions,
					elementRef,
					autoHideDelay,
				}
			: scrollThresholdOrOptions;

	const { scrollThreshold = 10, autoHideDelay: delay = 3000, elementRef: ref } = options;

	const [headerVisible, setHeaderVisible] = useState(true);
	const [isAutoHidden, setIsAutoHidden] = useState(false);
	const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);

	// Clear auto-hide timer
	const clearAutoHideTimer = useCallback(() => {
		if (autoHideTimerRef.current) {
			clearTimeout(autoHideTimerRef.current);
			autoHideTimerRef.current = null;
		}
	}, []);

	// Reset auto-hide timer
	const resetTimer = useCallback(() => {
		clearAutoHideTimer();

		if (delay > 0) {
			autoHideTimerRef.current = setTimeout(() => {
				setHeaderVisible(false);
				setIsAutoHidden(true);
			}, delay);
		}
	}, [delay, clearAutoHideTimer]);

	// Force show header
	const forceShow = useCallback(() => {
		setHeaderVisible(true);
		setIsAutoHidden(false);
		resetTimer(); // Restart timer after showing
	}, [resetTimer]);

	// Force hide header
	const forceHide = useCallback(() => {
		clearAutoHideTimer();
		setHeaderVisible(false);
		setIsAutoHidden(false); // Manual hide, not auto-hide
	}, [clearAutoHideTimer]);

	// Scroll-based show/hide
	useEffect(() => {
		const target = ref?.current || window;
		let lastScrollY = ref?.current ? ref.current.scrollTop : window.scrollY;

		const handleScroll = () => {
			const currentScrollY = ref?.current ? ref.current.scrollTop : window.scrollY;
			const diff = currentScrollY - lastScrollY;

			// Scroll Down -> Hide Header (manual hide, not auto-hide)
			if (diff > scrollThreshold && currentScrollY > 50) {
				setHeaderVisible(false);
				setIsAutoHidden(false);
				clearAutoHideTimer();
			}
			// Scroll Up -> Show Header
			else if (diff < -scrollThreshold) {
				setHeaderVisible(true);
				setIsAutoHidden(false);
				resetTimer(); // Restart timer after showing
			}

			lastScrollY = currentScrollY;
		};

		target.addEventListener('scroll', handleScroll, { passive: true });
		return () => target.removeEventListener('scroll', handleScroll);
	}, [scrollThreshold, ref, resetTimer, clearAutoHideTimer]);

	// Initialize auto-hide timer on mount
	useEffect(() => {
		if (delay > 0) {
			resetTimer();
		}

		return () => clearAutoHideTimer();
	}, [delay, resetTimer, clearAutoHideTimer]);

	return {
		headerVisible,
		isAutoHidden,
		forceShow,
		forceHide,
		resetTimer,
	};
}
