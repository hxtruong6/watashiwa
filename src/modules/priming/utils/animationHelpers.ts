/**
 * Animation Helpers
 *
 * Utilities for ghost animation and tooltip positioning
 * Handles coordinate calculations and animation timing
 */

/**
 * Calculate coordinates for ghost animation
 * Returns start/end positions for word flying to collection drawer
 */
export function calculateGhostAnimation(
	wordElement: HTMLElement,
	drawerElement: HTMLElement,
	targetSlotIndex: number,
): {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	distance: number;
} {
	// Get word position
	const wordRect = wordElement.getBoundingClientRect();
	const startX = wordRect.left + wordRect.width / 2;
	const startY = wordRect.top + wordRect.height / 2;

	// Get drawer position
	const drawerRect = drawerElement.getBoundingClientRect();

	// Calculate target slot position in drawer
	// Assuming horizontal layout with ~80px per slot
	const slotWidth = 80;
	const slotMargin = 8;
	const slotOffset = targetSlotIndex * (slotWidth + slotMargin);

	const endX = drawerRect.left + slotOffset + slotWidth / 2;
	const endY = drawerRect.top + drawerRect.height / 2;

	// Calculate distance for timing
	const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

	return { startX, startY, endX, endY, distance };
}

/**
 * Calculate tooltip position
 * Smart positioning that avoids screen edges
 */
export function calculateTooltipPosition(
	wordElement: HTMLElement,
	tooltipWidth: number = 300,
	tooltipHeight: number = 200,
	offset: number = 12,
): {
	x: number;
	y: number;
	placement: 'top' | 'bottom' | 'left' | 'right';
	arrow: { x: number; y: number };
} {
	const wordRect = wordElement.getBoundingClientRect();
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;

	// Calculate center of word
	const wordCenterX = wordRect.left + wordRect.width / 2;
	const wordCenterY = wordRect.top + wordRect.height / 2;

	// Try placements in priority order: top, bottom, right, left
	const placements = [
		{
			name: 'top' as const,
			x: wordCenterX - tooltipWidth / 2,
			y: wordRect.top - tooltipHeight - offset,
			arrow: { x: wordCenterX, y: wordRect.top - offset },
		},
		{
			name: 'bottom' as const,
			x: wordCenterX - tooltipWidth / 2,
			y: wordRect.bottom + offset,
			arrow: { x: wordCenterX, y: wordRect.bottom + offset },
		},
		{
			name: 'right' as const,
			x: wordRect.right + offset,
			y: wordCenterY - tooltipHeight / 2,
			arrow: { x: wordRect.right + offset, y: wordCenterY },
		},
		{
			name: 'left' as const,
			x: wordRect.left - tooltipWidth - offset,
			y: wordCenterY - tooltipHeight / 2,
			arrow: { x: wordRect.left - offset, y: wordCenterY },
		},
	];

	// Find first placement that fits in viewport
	for (const placement of placements) {
		const fitsX = placement.x >= 0 && placement.x + tooltipWidth <= viewportWidth;
		const fitsY = placement.y >= 0 && placement.y + tooltipHeight <= viewportHeight;

		if (fitsX && fitsY) {
			return {
				x: placement.x,
				y: placement.y,
				placement: placement.name,
				arrow: placement.arrow,
			};
		}
	}

	// Fallback: center on screen (if none fit)
	return {
		x: Math.max(0, Math.min(wordCenterX - tooltipWidth / 2, viewportWidth - tooltipWidth)),
		y: Math.max(0, Math.min(wordCenterY - tooltipHeight / 2, viewportHeight - tooltipHeight)),
		placement: 'top',
		arrow: { x: wordCenterX, y: wordCenterY },
	};
}

/**
 * Generate CSS transform for ghost animation
 */
export function generateGhostTransform(
	progress: number,
	startX: number,
	startY: number,
	endX: number,
	endY: number,
) {
	// Calculate current position
	const currentX = startX + (endX - startX) * progress;
	const currentY = startY + (endY - startY) * progress;

	// Add slight rotation for organic feel
	const rotation = Math.sin(progress * Math.PI) * 3; // Max 3 degrees

	// Add slight scale effect
	const scale = 1 - progress * 0.2; // Shrink to 80% at end

	return {
		transform: `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg) scale(${scale})`,
		opacity: 1 - progress * 0.3, // Fade slightly
	};
}

/**
 * Easing functions for animations
 */
export const easings = {
	// Smooth ease out (default for most animations)
	easeOut: (t: number) => 1 - Math.pow(1 - t, 3),

	// Elastic ease out (bouncy finish)
	easeOutElastic: (t: number) => {
		const c4 = (2 * Math.PI) / 3;
		return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
	},

	// Back ease out (slight overshoot)
	easeOutBack: (t: number) => {
		const c1 = 1.70158;
		const c3 = c1 + 1;
		return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
	},

	// Linear (no easing)
	linear: (t: number) => t,
};

/**
 * Trigger haptic feedback (mobile only)
 */
export function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light') {
	if (!('vibrate' in navigator)) return;

	const patterns = {
		light: 10,
		medium: 20,
		heavy: 30,
	};

	navigator.vibrate(patterns[style]);
}

/**
 * Play collection sound (optional)
 */
export function playCollectionSound() {
	// Create audio context for subtle "ding" sound
	if (typeof window === 'undefined' || !window.AudioContext) return;

	try {
		const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);

		// Pleasant "ding" frequency
		oscillator.frequency.value = 800;
		oscillator.type = 'sine';

		// Fade out envelope
		gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

		oscillator.start(audioContext.currentTime);
		oscillator.stop(audioContext.currentTime + 0.2);
	} catch (error) {
		// Silently fail if audio not supported
		console.warn('Collection sound failed:', error);
	}
}

/**
 * Scroll element into view smoothly
 */
export function scrollIntoView(element: HTMLElement, offset: number = 100) {
	const elementRect = element.getBoundingClientRect();
	const absoluteElementTop = elementRect.top + window.pageYOffset;
	const middle = absoluteElementTop - window.innerHeight / 2 + offset;

	window.scrollTo({
		top: middle,
		behavior: 'smooth',
	});
}

/**
 * Check if device prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Animation timing calculator
 * Calculates duration based on distance (longer distance = longer animation)
 */
export function calculateAnimationDuration(
	distance: number,
	minDuration: number = 800,
	maxDuration: number = 1400,
): number {
	// Base calculation: 1px = 1ms, with min/max bounds
	const baseDuration = distance;
	return Math.max(minDuration, Math.min(maxDuration, baseDuration));
}

/**
 * Create portal for tooltip/ghost animation
 * Returns container element for React Portal
 */
export function createAnimationPortal(id: string = 'animation-portal'): HTMLElement {
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
		portal.style.zIndex = '9999';
		document.body.appendChild(portal);
	}

	return portal;
}
