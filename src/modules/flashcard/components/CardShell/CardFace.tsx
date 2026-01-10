'use client';

import { getCardFaceBaseStyles } from '@/modules/flashcard/utils/transformUtils';
import { theme } from 'antd';
import { motion } from 'framer-motion';
import React from 'react';

/**
 * Props for CardFace component
 */
export interface CardFaceProps {
	/**
	 * Which side of the card (front or back)
	 */
	side: 'front' | 'back';
	/**
	 * Content to render inside the face
	 */
	children: React.ReactNode;
	/**
	 * Optional exit color for animation trail
	 */
	exitColor?: string;
	/**
	 * Whether the card is exiting (for exit animation)
	 */
	isExiting?: boolean;
}

/**
 * Consistent wrapper for front/back card faces
 *
 * Provides:
 * - Consistent styling (background, border-radius, overflow)
 * - Backface visibility handling
 * - Exit animation overlay
 * - User selection prevention
 */
export const CardFace: React.FC<CardFaceProps> = ({
	side,
	children,
	exitColor,
	isExiting = false,
}) => {
	const { token } = theme.useToken();

	// Get base styles with consistent styling
	const baseStyles = getCardFaceBaseStyles(token.colorBgContainer, token.borderRadiusLG);

	// Front face stays centered without scrolling (simple content)
	const isBackFace = side === 'back';
	const contentStyles: React.CSSProperties = {
		// background: 'yellow',
		zIndex: 2,
		width: '100%',
		height: '100%',
		...(isBackFace
			? {
					// Back face: Scrollable with CSS-based centering
					display: 'flex',
					flexDirection: 'column',
					overflowY: 'auto' as const,
					overflowX: 'hidden' as const,
					WebkitOverflowScrolling: 'touch' as const, // Smooth scrolling on iOS
					// Ensure scrollbar styling is subtle
					scrollbarWidth: 'thin' as const,
					scrollbarColor: `${token.colorBorder} transparent`,
					// CSS-based centering: Use padding to center initial viewport
					// This creates equal space above and below content when scrolled to top
					// The padding values will be applied by the content wrapper
				}
			: {
					overflow: 'hidden' as const, // Front face: no scrolling needed
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}),
	};

	return (
		<div style={baseStyles}>
			{/* Exit Color Trail Overlay */}
			{isExiting && exitColor && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 0.3 }}
					exit={{ opacity: 0 }}
					style={{
						position: 'absolute',
						inset: 0,
						background: exitColor,
						zIndex: 3,
						pointerEvents: 'none',
					}}
				/>
			)}

			<div style={contentStyles}>{children}</div>
		</div>
	);
};
