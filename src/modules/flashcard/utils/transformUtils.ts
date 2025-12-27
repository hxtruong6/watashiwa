/**
 * Transform Utilities for 3D Card Flip Animations
 *
 * Centralizes all 3D transform logic with proper browser prefixes
 * to ensure consistency and eliminate duplication.
 */

/**
 * Generate 3D transform string with WebKit vendor prefix
 * @param transform - CSS transform string (e.g., 'translateZ(-1px) rotateY(180deg)')
 * @returns Object with both standard and WebKit-prefixed transforms
 */
export function get3DTransform(transform: string): {
	transform: string;
	WebkitTransform: string;
} {
	return {
		transform,
		WebkitTransform: transform, // iOS Safari vendor prefix
	};
}

/**
 * Get backface visibility styles for 3D card faces
 * Critical for proper 3D flip animations, especially on iOS Safari
 */
export function getBackfaceVisibility(): {
	backfaceVisibility: 'hidden';
	WebkitBackfaceVisibility: 'hidden';
} {
	return {
		backfaceVisibility: 'hidden',
		WebkitBackfaceVisibility: 'hidden', // Critical for iOS Safari
	};
}

/**
 * Get user selection prevention styles
 * Prevents text selection during card interactions
 */
export function getUserSelectStyles(): {
	userSelect: 'none';
	WebkitUserSelect: 'none';
	WebkitTouchCallout: 'none';
} {
	return {
		userSelect: 'none',
		WebkitUserSelect: 'none',
		WebkitTouchCallout: 'none',
	};
}

/**
 * Get base styles for card face (front or back)
 * Provides consistent styling for both faces
 */
export function getCardFaceBaseStyles(
	backgroundColor: string,
	borderRadius: number,
): React.CSSProperties {
	return {
		position: 'absolute',
		width: '100%',
		height: '100%',
		...getBackfaceVisibility(),
		background: backgroundColor,
		borderRadius,
		overflow: 'hidden', // Default: hidden for front face
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'flex-start', // Changed from 'center' to allow top-aligned scrolling content
		...getUserSelectStyles(),
	};
}

/**
 * Get transform styles for front face
 * Front face uses translateZ(0) or no transform for proper positioning
 */
export function getFrontFaceTransform(): {
	transform: string;
	WebkitTransform: string;
} {
	// translate3d(0,0,0) keeps the face on its own composited layer in many browsers.
	// We intentionally do NOT rotate the front face.
	return get3DTransform('translate3d(0, 0, 0)');
}

/**
 * Get transform styles for back face
 *
 * IMPORTANT:
 * The back face MUST be pre-rotated 180deg (classic, reliable approach).
 * Rotating only the back face *content* causes mirrored/backwards rendering because
 * backface-visibility is evaluated on the face plane itself, not its children.
 */
export function getBackFaceTransform(): {
	transform: string;
	WebkitTransform: string;
} {
	// When the container rotates 180deg, this face becomes oriented toward the viewer:
	// container(180) + face(180) = 360 (same as 0) => readable, not mirrored.
	return get3DTransform('translate3d(0, 0, 0) rotateY(180deg)');
}

/**
 * Constants for transform values
 */
export const TRANSFORM_CONSTANTS = {
	FLIP_DURATION: 0.4, // seconds
	FLIP_EASING: 'easeOut',
	PERSPECTIVE: 1000, // pixels
} as const;
