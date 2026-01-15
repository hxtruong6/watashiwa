'use client';
import { useEffect, useRef, useState } from 'react';

type ElementSize = {
	width: number;
	height: number;
};

export function useElementSize<T extends HTMLElement>() {
	const elementRef = useRef<T | null>(null);
	const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

	useEffect(() => {
		const element = elementRef.current;
		if (!element) return undefined;

		const updateSize = () => {
			const { width, height } = element.getBoundingClientRect();
			setSize({
				width: Math.max(0, Math.round(width)),
				height: Math.max(0, Math.round(height)),
			});
		};

		updateSize();
		const observer = new ResizeObserver(updateSize);
		observer.observe(element);

		return () => {
			observer.disconnect();
		};
	}, []);

	return { elementRef, size };
}
