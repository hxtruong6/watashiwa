export const DEFAULT_LIMIT_NEW_CARDS = 10;
export const DEFAULT_LIMIT_REVIEWS = 100;

export const ADMIN_USER_ID = '00000000-0000-0000-0000-000000000000';

export const DEFAULT_PER_PAGE = 10;
export const DEFAULT_PAGE = 1;

/**
 * Layout Constants
 * Shared values for consistent positioning across the app
 */
export const LAYOUT = {
	/** Navbar fixed position from top */
	NAVBAR_TOP: 0,
	/** Navbar spacer height for desktop/tablet (≥768px) */
	NAVBAR_SPACER_DESKTOP: 110,
	/** Navbar spacer height for mobile (<768px) */
	NAVBAR_SPACER_MOBILE: 60,
	/** Calculate sticky top position for content below navbar */
	getStickyTop: (isMobile: boolean) => {
		return (
			LAYOUT.NAVBAR_TOP + (isMobile ? LAYOUT.NAVBAR_SPACER_MOBILE : LAYOUT.NAVBAR_SPACER_DESKTOP)
		);
	},
} as const;
