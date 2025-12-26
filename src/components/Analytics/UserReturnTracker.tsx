'use client';

import { trackEvent } from '@/lib/analytics';
import { getUserWithRole } from '@/modules/auth/auth.actions';
import { useEffect, useRef } from 'react';

/**
 * Tracks user_returned event when user visits after 24+ hours
 * This component should be placed in the root layout
 */
export default function UserReturnTracker() {
	const hasTracked = useRef(false);

	useEffect(() => {
		async function checkUserReturn() {
			if (hasTracked.current) return;

			try {
				const user = await getUserWithRole();
				if (!user) return;

				// Check lastLogin from user metadata
				// We'll need to get this from the server or store it client-side
				// For now, we'll use localStorage to track last visit
				const lastVisitKey = `last_visit_${user.id}`;
				const lastVisit = localStorage.getItem(lastVisitKey);
				const now = Date.now();

				if (lastVisit) {
					const hoursSinceLastVisit = (now - parseInt(lastVisit, 10)) / (1000 * 60 * 60);

					// Track if user returned after 24+ hours
					if (hoursSinceLastVisit >= 24) {
						const daysSinceLastVisit = Math.floor(hoursSinceLastVisit / 24);

						// Get total visits count from localStorage
						const visitCountKey = `visit_count_${user.id}`;
						const totalVisits = parseInt(localStorage.getItem(visitCountKey) || '0', 10) + 1;
						localStorage.setItem(visitCountKey, totalVisits.toString());

						trackEvent('user_returned', {
							days_since_last_visit: daysSinceLastVisit,
							total_visits: totalVisits,
							// We'll need to get streak and last_study_date from server if needed
							streak_days: 0, // TODO: Get from user data
							last_study_date: null, // TODO: Get from user data
						});
					}
				}

				// Update last visit timestamp
				localStorage.setItem(lastVisitKey, now.toString());
				hasTracked.current = true;
			} catch (error) {
				console.error('[Analytics] Failed to track user return:', error);
			}
		}

		checkUserReturn();
	}, []);

	return null;
}
