'use client';

import { useEffect } from 'react';

/**
 * Workaround for AntD v6.1.2 + React 19.2.3 popup positioning bug
 * Fixes dropdowns/selects that are positioned at huge negative inset values
 * by correcting the coordinate calculation after popup render
 *
 * OPTIMIZED VERSION:
 * - Only fixes popups when they're actually visible and incorrectly positioned
 * - Uses passive event listeners for better performance
 * - Debounced MutationObserver to reduce DOM queries
 */
export default function AntdPopupFix() {
	useEffect(() => {
		// Only run on client
		if (typeof window === 'undefined' || typeof document === 'undefined') return;

		let rafId: number | null = null;
		let timeoutId: NodeJS.Timeout | null = null;

		const fixPopupPosition = () => {
			// Cancel any pending animation frame
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
			}

			rafId = requestAnimationFrame(() => {
				// Find all AntD popup containers with incorrect positioning
				const popups = document.querySelectorAll<HTMLElement>(
					'.ant-select-dropdown, .ant-dropdown, .ant-picker-dropdown, .ant-popover, .ant-tooltip',
				);

				popups.forEach((popup) => {
					// Skip if popup is not visible
					if (popup.offsetParent === null && popup.style.display === 'none') {
						return;
					}

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

				rafId = null;
			});
		};

		// Debounced version for MutationObserver
		const debouncedFix = () => {
			if (timeoutId !== null) {
				clearTimeout(timeoutId);
			}
			timeoutId = setTimeout(fixPopupPosition, 50); // Debounce to 50ms
		};

		// Fix immediately on mount
		fixPopupPosition();

		// Use MutationObserver to fix popups as they appear (debounced)
		const observer = new MutationObserver(() => {
			debouncedFix();
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['style', 'class'],
		});

		// Fix on scroll and resize (passive listeners for better performance)
		window.addEventListener('scroll', fixPopupPosition, { passive: true });
		window.addEventListener('resize', fixPopupPosition, { passive: true });

		return () => {
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
			}
			if (timeoutId !== null) {
				clearTimeout(timeoutId);
			}
			observer.disconnect();
			window.removeEventListener('scroll', fixPopupPosition);
			window.removeEventListener('resize', fixPopupPosition);
		};
	}, []);

	return null;
}
