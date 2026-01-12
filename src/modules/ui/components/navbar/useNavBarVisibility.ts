import { useUIStore } from '@/modules/ui/store/useUIStore';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

/**
 * Visibility reasons for debugging and logging
 */
export type VisibilityReason =
	| 'visible'
	| 'auth_page'
	| 'active_study_session'
	| 'exercises_page'
	| 'admin_route'
	| 'store_hidden';

export interface UseNavBarVisibilityReturn {
	shouldShow: boolean;
	reason: VisibilityReason;
}

/**
 * useNavBarVisibility Hook
 * Consolidated visibility logic for navbar
 * Handles both route-based (hard rules) and store-based (soft rules) hiding
 *
 * Hard Rules (Route-based):
 * - Auth pages (login, forgot-password, reset-password)
 * - Active study sessions (has deckId/courseId in URL)
 * - Exercises page
 * - Admin routes
 *
 * Soft Rules (Store-based):
 * - Focus mode or other UI states
 */
export function useNavBarVisibility(): UseNavBarVisibilityReturn {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const isNavBarVisible = useUIStore((state) => state.isNavBarVisible);

	return useMemo(() => {
		// Hard Rule 1: Auth pages
		const isAuthPage =
			pathname === '/login' || pathname === '/forgot-password' || pathname === '/reset-password';
		if (isAuthPage) {
			return { shouldShow: false, reason: 'auth_page' };
		}

		// Hard Rule 2: Active study session (has deckId/courseId in URL)
		const hasDeckId = searchParams.get('deckId');
		const hasDeckSlug = searchParams.get('deckSlug');
		const hasCourseId = searchParams.get('courseId');
		const isActiveStudySession =
			pathname?.startsWith('/study') && (hasDeckId || hasDeckSlug || hasCourseId);
		if (isActiveStudySession) {
			return { shouldShow: false, reason: 'active_study_session' };
		}

		// Hard Rule 3: Exercises page
		if (pathname === '/exercises') {
			return { shouldShow: false, reason: 'exercises_page' };
		}

		// Hard Rule 4: Admin routes
		if (pathname?.startsWith('/admin')) {
			return { shouldShow: false, reason: 'admin_route' };
		}

		// Soft Rule: Store-based hiding (e.g., Focus Mode)
		if (!isNavBarVisible) {
			return { shouldShow: false, reason: 'store_hidden' };
		}

		// Default: Show navbar
		return { shouldShow: true, reason: 'visible' };
	}, [pathname, searchParams, isNavBarVisible]);
}
