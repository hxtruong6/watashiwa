import { useCallback, useState } from 'react';

/**
 * Options for useCardFlip hook
 */
export interface UseCardFlipOptions {
	/**
	 * Controlled flip state (when provided, component is controlled)
	 * When undefined, component manages its own state (uncontrolled)
	 */
	showAnswer?: boolean;
	/**
	 * Callback when flip is triggered (for controlled components)
	 */
	onReveal?: () => void;
}

/**
 * Return type for useCardFlip hook
 */
export interface UseCardFlipReturn {
	/**
	 * Current flip state (true = back side visible, false = front side visible)
	 */
	isFlipped: boolean;
	/**
	 * Handler for flip interactions (click/touch)
	 * Stops event propagation to prevent bubbling to parent elements
	 */
	handleFlip: (e: React.MouseEvent | React.TouchEvent) => void;
}

/**
 * Hook for managing card flip state
 *
 * Handles both controlled and uncontrolled flip states:
 * - Controlled: Uses showAnswer prop, calls onReveal callback
 * - Uncontrolled: Manages internal state, allows toggling
 *
 * @param options - Configuration options
 * @returns Flip state and handler
 */
export function useCardFlip(options: UseCardFlipOptions = {}): UseCardFlipReturn {
	const { showAnswer, onReveal } = options;

	// Internal state for uncontrolled mode
	const [internalFlipped, setInternalFlipped] = useState(false);

	// Determine if component is controlled
	const isControlled = showAnswer !== undefined;

	// Get current flip state
	const isFlipped = isControlled ? showAnswer : internalFlipped;

	// Handle flip interaction
	const handleFlip = useCallback(
		(e: React.MouseEvent | React.TouchEvent) => {
			// Prevent event bubbling to parent elements (e.g., RatingBar buttons)
			e.stopPropagation();

			if (isControlled) {
				// Controlled mode: call callback if provided
				if (onReveal) {
					onReveal();
				}
			} else {
				// Uncontrolled mode: toggle internal state
				setInternalFlipped((prev) => !prev);
			}
		},
		[isControlled, onReveal],
	);

	return {
		isFlipped,
		handleFlip,
	};
}
