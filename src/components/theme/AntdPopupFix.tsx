'use client';

import { useEffect } from 'react';

/**
 * Workaround for AntD v6.1.2 + React 19.2.3 popup positioning bug
 * Fixes dropdowns/selects that are positioned at huge negative inset values
 * by correcting the coordinate calculation after popup render
 */
export default function AntdPopupFix() {
	useEffect(() => {
		// Only run on client
		if (typeof window === 'undefined' || typeof document === 'undefined') return;

		const fixPopupPosition = () => {
			// Find all AntD popup containers with incorrect positioning
			const popups = document.querySelectorAll<HTMLElement>(
				'.ant-select-dropdown, .ant-dropdown, .ant-picker-dropdown, .ant-popover, .ant-tooltip',
			);

			popups.forEach((popup) => {
				const style = window.getComputedStyle(popup);
				const top = parseFloat(style.top);
				const left = parseFloat(style.left);

				// Check if position has huge negative values (bug indicator)
				// This happens when AntD incorrectly subtracts scroll offset
				if ((top < -1000 || left < -1000) && popup.offsetParent === document.body) {
					// Find the trigger element - AntD uses data attributes and aria relationships
					let trigger: HTMLElement | null = null;

					// Method 1: Find by popup's ID and look for elements that reference it
					const popupId = popup.id;
					if (popupId) {
						// Try various selectors that AntD might use
						trigger =
							(document.querySelector(
								`[aria-controls="${popupId}"], [aria-owns="${popupId}"], [aria-expanded="true"][aria-controls*="${popupId}"]`,
							) as HTMLElement) || null;
					}

					// Method 2: Find by looking for open select/dropdown components
					if (!trigger) {
						// Find elements with aria-expanded="true" (open state)
						const openTriggers = document.querySelectorAll<HTMLElement>(
							'[aria-expanded="true"].ant-select-selector, [aria-expanded="true"][role="combobox"], .ant-select-open .ant-select-selector, .ant-dropdown-open',
						);

						// Get the most recently visible one (likely the one that just opened)
						for (const t of Array.from(openTriggers)) {
							const rect = t.getBoundingClientRect();
							if (rect.width > 0 && rect.height > 0) {
								trigger = t;
								break;
							}
						}
					}

					// Method 3: Find by CSS class patterns (fallback)
					if (!trigger) {
						const selectors = document.querySelectorAll<HTMLElement>(
							'.ant-select-selector, .ant-dropdown-trigger, [role="combobox"]',
						);
						// Get the first visible one
						for (const t of Array.from(selectors)) {
							const rect = t.getBoundingClientRect();
							if (rect.width > 0 && rect.height > 0 && rect.top >= 0) {
								trigger = t;
								break;
							}
						}
					}

					if (trigger) {
						const triggerRect = trigger.getBoundingClientRect();
						const scrollY = window.scrollY || window.pageYOffset;
						const scrollX = window.scrollX || window.pageXOffset;

						// Get placement from class (bottomLeft, topRight, etc.)
						const placement =
							popup.className.match(/ant-select-dropdown-placement-(\w+)/)?.[1] || 'bottomLeft';
						const isRight = placement.includes('right') || placement.includes('Right');
						const isTop = placement.includes('top') || placement.includes('Top');

						// Calculate correct absolute position based on placement
						let correctTop: number;
						let correctLeft: number;

						if (isTop) {
							correctTop = triggerRect.top + scrollY - (popup.offsetHeight || 200) - 4;
						} else {
							// Default to bottom
							correctTop = triggerRect.bottom + scrollY + 4;
						}

						if (isRight) {
							correctLeft = triggerRect.right + scrollX - (popup.offsetWidth || 200);
						} else {
							// Default to left align
							correctLeft = triggerRect.left + scrollX;
						}

						// Apply corrected position
						// Use !important to override AntD's inline styles
						popup.style.setProperty('top', `${correctTop}px`, 'important');
						popup.style.setProperty('left', `${correctLeft}px`, 'important');
						popup.style.setProperty('right', 'auto', 'important');
						popup.style.setProperty('bottom', 'auto', 'important');
						popup.style.setProperty('inset', 'auto', 'important');

						// Ensure popup is clickable
						popup.style.pointerEvents = 'auto';
						popup.style.zIndex = '1050'; // Ensure it's above other content
					}
				}
			});
		};

		// Fix immediately and on interval (for popups that appear after initial render)
		fixPopupPosition();
		const interval = setInterval(fixPopupPosition, 100);

		// Use MutationObserver to fix popups as they appear
		const observer = new MutationObserver(() => {
			// Use requestAnimationFrame to batch DOM reads
			requestAnimationFrame(fixPopupPosition);
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['style', 'class'],
		});

		// Fix on scroll (in case popup is open during scroll)
		window.addEventListener('scroll', fixPopupPosition, { passive: true });
		window.addEventListener('resize', fixPopupPosition, { passive: true });

		return () => {
			clearInterval(interval);
			observer.disconnect();
			window.removeEventListener('scroll', fixPopupPosition);
			window.removeEventListener('resize', fixPopupPosition);
		};
	}, []);

	return null;
}
