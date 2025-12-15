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

		// Prevent double-tap to zoom
		let lastTouchEnd = 0;
		const handleTouchEnd = (e: TouchEvent) => {
			const now = new Date().getTime();
			if (now - lastTouchEnd <= 300) {
				e.preventDefault();
			}
			lastTouchEnd = now;
		};

		// Prevent Ctrl + Wheel zoom (Desktop/Trackpad)
		const handleWheel = (e: WheelEvent) => {
			if (e.ctrlKey) {
				e.preventDefault();
			}
		};

		document.addEventListener('touchmove', handleTouchMove, { passive: false });
		document.addEventListener('touchend', handleTouchEnd, { passive: false });
		document.addEventListener('wheel', handleWheel, { passive: false });

		return () => {
			document.removeEventListener('touchmove', handleTouchMove);
			document.removeEventListener('touchend', handleTouchEnd);
			document.removeEventListener('wheel', handleWheel);
		};
	}, []);

	return null;
}
