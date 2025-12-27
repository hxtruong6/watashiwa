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
			onClick={onFlip}
			onTouchStart={onFlip}
		>
			{/* FRONT FACE */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					...getBackfaceVisibility(),
					...frontTransform,
				}}
			>
				{frontFace}
			</div>

			{/* BACK FACE */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					...getBackfaceVisibility(),
					...backTransform,
				}}
			>
				{backFace}
			</div>
		</motion.div>
	);
};
