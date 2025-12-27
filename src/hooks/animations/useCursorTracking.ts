/**
 * Hook for tracking cursor position relative to an element
 * Used for magnetic button effects (Approach 2)
 */
import { useEffect, useRef, useState } from 'react';

interface CursorPosition {
	x: number;
	y: number;
}

export function useCursorTracking() {
	const [cursorPos, setCursorPos] = useState<CursorPosition>({ x: 0, y: 0 });
	const elementRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		const element = elementRef.current;
		if (!element) return;

		const handleMouseMove = (e: MouseEvent) => {
			const rect = element.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			setCursorPos({
				x: e.clientX - centerX,
				y: e.clientY - centerY,
			});
		};

		const handleMouseLeave = () => {
			setCursorPos({ x: 0, y: 0 });
		};

		element.addEventListener('mousemove', handleMouseMove);
		element.addEventListener('mouseleave', handleMouseLeave);

		return () => {
			element.removeEventListener('mousemove', handleMouseMove);
			element.removeEventListener('mouseleave', handleMouseLeave);
		};
	}, []);

	return { ref: elementRef, cursorPos };
}
