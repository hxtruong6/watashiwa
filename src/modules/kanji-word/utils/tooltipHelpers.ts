/**
 * Tooltip Helper Utilities
 *
 * Helper functions for tooltip positioning and animation
 */

/**
 * Calculate tooltip position relative to anchor element
 */
export function calculateTooltipPosition(
	anchorElement: HTMLElement,
	tooltipWidth: number,
	tooltipHeight: number,
): { x: number; y: number; placement: 'top' | 'bottom' | 'left' | 'right' } {
	const rect = anchorElement.getBoundingClientRect();
	const scrollX = window.scrollX || window.pageXOffset;
	const scrollY = window.scrollY || window.pageYOffset;

	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;

	// Default: try to place above (top)
	let x = rect.left + scrollX + rect.width / 2 - tooltipWidth / 2;
	let y = rect.top + scrollY - tooltipHeight - 8;
	let placement: 'top' | 'bottom' | 'left' | 'right' = 'top';

	// Adjust if tooltip would go off-screen
	if (y < scrollY) {
		// Not enough space above, try below
		y = rect.bottom + scrollY + 8;
		placement = 'bottom';
	}

	if (x < scrollX) {
		// Too far left
		x = scrollX + 8;
	} else if (x + tooltipWidth > scrollX + viewportWidth) {
		// Too far right
		x = scrollX + viewportWidth - tooltipWidth - 8;
	}

	if (y + tooltipHeight > scrollY + viewportHeight) {
		// Still doesn't fit, try left or right
		if (rect.left > tooltipWidth + 16) {
			// Place to the left
			x = rect.left + scrollX - tooltipWidth - 8;
			y = rect.top + scrollY + rect.height / 2 - tooltipHeight / 2;
			placement = 'left';
		} else if (rect.right + tooltipWidth + 16 < viewportWidth) {
			// Place to the right
			x = rect.right + scrollX + 8;
			y = rect.top + scrollY + rect.height / 2 - tooltipHeight / 2;
			placement = 'right';
		}
	}

	return { x, y, placement };
}

// Portal cache to reuse existing portals
const portalCache = new Map<string, HTMLElement>();

/**
 * Create animation portal for tooltips
 * Reuses existing portal if available to prevent DOM accumulation
 */
export function createAnimationPortal(id: string): HTMLElement {
	// Check cache first
	if (portalCache.has(id)) {
		const cached = portalCache.get(id);
		if (cached && document.body.contains(cached)) {
			return cached;
		}
		// Portal was removed from DOM, remove from cache
		portalCache.delete(id);
	}

	// Check if portal exists in DOM
	let portal = document.getElementById(id);

	if (!portal) {
		portal = document.createElement('div');
		portal.id = id;
		portal.style.position = 'fixed';
		portal.style.top = '0';
		portal.style.left = '0';
		portal.style.width = '100%';
		portal.style.height = '100%';
		portal.style.pointerEvents = 'none';
		portal.style.zIndex = '10000';
		document.body.appendChild(portal);
	}

	// Cache the portal
	portalCache.set(id, portal);

	return portal;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
