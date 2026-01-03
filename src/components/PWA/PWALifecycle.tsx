'use client';

import { useEffect } from 'react';

export default function PWALifecycle() {
	useEffect(() => {
		if (
			typeof window !== 'undefined' &&
			'serviceWorker' in navigator &&
			(window as any).workbox === undefined
		) {
			navigator.serviceWorker
				.register('/sw.js')
				.then((registration) => {
					// console.log('SW Registered: ', registration);
				})
				.catch((error) => {
					console.log('SW Registration Failed: ', error);
				});
		}
	}, []);

	return null;
}
