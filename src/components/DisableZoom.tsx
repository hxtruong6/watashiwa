'use client';

import { useEffect } from 'react';

export default function DisableZoom() {
	useEffect(() => {
		const handleTouchMove = (e: TouchEvent) => {
			// detailed check to allow scrolling but prevent pinch-zoom
			if (e.touches.length > 1) {
				e.preventDefault();
			}
		};

		// Prevent iOS Safari pinch-zoom gesture (safer than blocking touchend, which can break taps/clicks)
		const handleGestureStart = (e: Event) => {
			e.preventDefault();
		};

		// Prevent Ctrl + Wheel zoom (Desktop/Trackpad)
		const handleWheel = (e: WheelEvent) => {
			if (e.ctrlKey) {
				e.preventDefault();
			}
		};

		document.addEventListener('touchmove', handleTouchMove, { passive: false });
		document.addEventListener('gesturestart', handleGestureStart, { passive: false });
		document.addEventListener('wheel', handleWheel, { passive: false });

		return () => {
			document.removeEventListener('touchmove', handleTouchMove);
			document.removeEventListener('gesturestart', handleGestureStart);
			document.removeEventListener('wheel', handleWheel);
		};
	}, []);

	return null;
}
