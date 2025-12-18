'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { Suspense, useEffect } from 'react';

function PostHogPageView() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		// Track page views
		if (pathname) {
			let url = window.origin + pathname;
			if (searchParams && searchParams.toString()) {
				url = url + `?${searchParams.toString()}`;
			}
			posthog.capture('$pageview', {
				$current_url: url,
			});
		}
	}, [pathname, searchParams]);

	return null;
}

export default function PostHogPageTracker() {
	return (
		<Suspense fallback={null}>
			<PostHogPageView />
		</Suspense>
	);
}
