'use client';

import {
	TRANSFORM_CONSTANTS,
	getBackFaceTransform,
	getBackfaceVisibility,
	getFrontFaceTransform,
} from '@/modules/flashcard/utils/transformUtils';
import { theme } from 'antd';
import { motion } from 'framer-motion';
import React from 'react';

/**
 * Props for CardFlipContainer component
 */
export interface CardFlipContainerProps {
	/**
	 * Whether the card is flipped (back side visible)
	 */
	isFlipped: boolean;
	/**
	 * Handler for flip interactions (click/touch)
	 */
	onFlip: (e: React.MouseEvent | React.TouchEvent) => void;
	/**
	 * Front and back face components as children
	 * Expected: Two children (FrontFace and BackFace)
	 */
	children: React.ReactNode;
	/**
	 * Optional className for styling
	 */
	className?: string;
}

/**
 * Pure 3D flip animation container
 *
 * Reliable approach (classic):
 * - Container rotates (`rotateY: 0|180`)
 * - Back face is pre-rotated 180deg so it becomes readable after the container flip.
 *
 * This prevents mirrored/backwards text (a common bug when trying to rotate only children).
 */
export const CardFlipContainer: React.FC<CardFlipContainerProps> = ({
	isFlipped,
	onFlip,
	children,
	className,
}) => {
	const { token } = theme.useToken();

	// Extract front and back faces from children
	// React.Children.toArray handles both single child and multiple children
	const childrenArray = React.Children.toArray(children);
	const frontFace = childrenArray[0];
	const backFace = childrenArray[1];

	const frontTransform = getFrontFaceTransform();
	const backTransform = getBackFaceTransform();

	return (
		<motion.div
			style={{
				width: '100%',
				height: '100%',
				position: 'relative',
				transformStyle: 'preserve-3d',
				WebkitTransformStyle: 'preserve-3d', // iOS Safari
				borderRadius: token.borderRadiusLG,
				boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
				// NOTE: Overflow clipping is already handled on each face (`CardFace`).
				// Keeping overflow hidden here can flatten 3D in some browsers.
				willChange: 'transform', // Performance hint for mobile browsers
			}}
			className={className}
			animate={{ rotateY: isFlipped ? 180 : 0 }}
			transition={{
				duration: TRANSFORM_CONSTANTS.FLIP_DURATION,
				ease: TRANSFORM_CONSTANTS.FLIP_EASING,
			}}
		>
			{/* FRONT FACE */}
			<div
				role="button"
				tabIndex={0}
				aria-label="Flip card to reveal answer"
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					...getBackfaceVisibility(),
					...frontTransform,
					cursor: 'pointer',
				}}
				onClick={onFlip}
				onKeyDown={(e) => {
					// Support keyboard navigation (Enter/Space to flip)
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						// Create a synthetic event for onFlip
						const syntheticEvent = {
							...e,
							stopPropagation: () => e.stopPropagation(),
						} as unknown as React.MouseEvent;
						onFlip(syntheticEvent);
					}
				}}
			>
				{frontFace}
			</div>

			{/* BACK FACE */}
			<div
				role="button"
				tabIndex={0}
				aria-label="Flip card back to front"
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					...getBackfaceVisibility(),
					...backTransform,
					cursor: 'pointer',
				}}
				onClick={(e) => {
					// Only flip if clicking on non-interactive areas
					// Interactive elements (buttons, links) should call stopPropagation()
					const target = e.target as HTMLElement;
					const currentTarget = e.currentTarget as HTMLElement;

					// Check for actual interactive elements:
					// 1. Buttons (native or Ant Design)
					// 2. Links
					// 3. Elements with role="button" (but exclude the flip container itself)
					//
					// NOTE: We removed the [style*="overflow"] check because it was too broad
					// and was blocking clicks on scrollable content areas. Scrollable containers
					// should allow flipping - only actual interactive elements should prevent it.
					const interactiveButton = target.closest('button');
					const interactiveLink = target.closest('a');
					const roleButton = target.closest('[role="button"]');
					const isRoleButtonButNotContainer = roleButton && roleButton !== currentTarget;

					const isInteractiveElement =
						!!interactiveButton || !!interactiveLink || !!isRoleButtonButNotContainer;

					// If clicking on interactive element, don't flip (they handle their own clicks)
					// Otherwise, allow flip on empty space, text, or scrollable areas
					// Elements with stopPropagation (like CollapsibleSection) will already prevent the flip
					if (!isInteractiveElement) {
						onFlip(e);
					}
				}}
				onKeyDown={(e) => {
					// Support keyboard navigation (Enter/Space to flip)
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						const syntheticEvent = {
							...e,
							stopPropagation: () => e.stopPropagation(),
						} as unknown as React.MouseEvent;
						onFlip(syntheticEvent);
					}
				}}
			>
				{backFace}
			</div>
		</motion.div>
	);
};
