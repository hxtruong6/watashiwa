'use client';

import { trackEvent } from '@/lib/analytics';
import { useEffect, useRef } from 'react';

/**
 * Hook to track feature discovery
 * Call this in feature pages to track when users first discover a feature
 */
export function useFeatureDiscovery(
	featureName: string,
	discoveryMethod: 'navigation' | 'tutorial' | 'suggestion' = 'navigation',
) {
	const hasTracked = useRef(false);

	useEffect(() => {
		if (hasTracked.current) return;

		// Check if user has discovered this feature before
		const discoveryKey = `feature_discovered_${featureName}`;
		const hasDiscovered = localStorage.getItem(discoveryKey);

		if (!hasDiscovered) {
			// Get days since signup (approximate from localStorage)
			const signupDateKey = 'user_signup_date';
			const signupDate = localStorage.getItem(signupDateKey);
			const daysSinceSignup = signupDate
				? Math.floor((Date.now() - parseInt(signupDate, 10)) / (1000 * 60 * 60 * 24))
				: 0;

			trackEvent('feature_discovered', {
				feature_name: featureName,
				days_since_signup: daysSinceSignup,
				discovery_method: discoveryMethod,
			});

			// Mark as discovered
			localStorage.setItem(discoveryKey, 'true');
			hasTracked.current = true;
		}
	}, [featureName, discoveryMethod]);
}
