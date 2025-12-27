'use client';

import { useCardFlip } from '@/modules/flashcard/hooks/useCardFlip';
import { TRANSFORM_CONSTANTS } from '@/modules/flashcard/utils/transformUtils';
import type { CardBackSettings } from '@/modules/study/store/useStudyPreferences';
import { motion, useAnimation } from 'framer-motion';
import React, { useEffect } from 'react';

import { SmartCard } from '../../types';
import { CardFace } from './CardFace';
import { CardFlipContainer } from './CardFlipContainer';
import { getVariantRenderer } from './cardVariantRegistry';

interface CardShellProps {
	card: SmartCard;
	isActive: boolean;
	isNext: boolean; // Used for stack visuals
	showAnswer?: boolean; // Controlled reveal state
	onReveal?: () => void; // Callback for reveal/toggle (toggles when answer is already shown)
	children?: React.ReactNode; // Optional overlay

	// Global Settings passed down
	showFurigana?: boolean;
	showRomaji?: boolean;
	isExiting?: boolean; // For exit animation
	exitColor?: string; // Color trail for exit animation

	// Audio Props
	isPlaying?: boolean;
	onPlayAudio?: (e: React.MouseEvent) => void;

	// Design Variant
	designVariant?: 'safe' | 'aggressive' | 'minimalist';

	// Card Back Settings
	cardBackSettings?: CardBackSettings;
}

export const CardShell: React.FC<CardShellProps> = ({
	card,
	isActive,
	isNext,
	showAnswer,
	onReveal,
	children,
	showFurigana,
	showRomaji,
	isExiting = false,
	exitColor,
	isPlaying = false,
	onPlayAudio,
	designVariant = 'safe',
	cardBackSettings,
}) => {
	const controls = useAnimation();

	// Use flip hook for state management
	const { isFlipped, handleFlip } = useCardFlip({
		showAnswer,
		onReveal,
	});

	// Handle exit animation
	useEffect(() => {
		if (isExiting) {
			controls.start({
				opacity: 0,
				scale: 0.9,
				y: -50,
				transition: { duration: 0.4 },
			});
		}
	}, [isExiting, controls]);

	// Get variant renderer
	const renderFace = getVariantRenderer(card.variant);

	// Prepare props for variant renderer
	const variantProps = {
		card,
		side: 'front' as const,
		showFurigana,
		showRomaji,
		isPlaying,
		onPlayAudio,
		designVariant,
		cardBackSettings,
		isFlipped,
		onReveal,
		controls,
	};

	// Shell Styles based on Active/Next state
	const variants = {
		active: {
			scale: 1,
			y: 0,
			zIndex: 10,
			opacity: 1,
		},
		next: {
			scale: 0.95,
			y: 20,
			zIndex: 5,
			opacity: 0.6,
		},
		hidden: {
			scale: 0.9,
			y: 40,
			zIndex: 0,
			opacity: 0,
		},
		exit: {
			opacity: 0,
			scale: 0.9,
			y: -50,
		},
	};

	return (
		<motion.div
			style={{
				position: 'absolute',
				width: '100%',
				maxWidth: '340px',
				aspectRatio: '3/4',
				perspective: TRANSFORM_CONSTANTS.PERSPECTIVE,
				cursor: isActive ? 'pointer' : 'default', // Always clickable when active (allows toggle)
			}}
			variants={variants}
			initial="hidden"
			animate={isExiting ? 'exit' : isActive ? 'active' : isNext ? 'next' : 'hidden'}
			transition={{ type: 'spring', stiffness: 300, damping: 30 }}
		>
			<CardFlipContainer isFlipped={isFlipped} onFlip={handleFlip}>
				{/* Front Face */}
				<CardFace side="front" exitColor={exitColor} isExiting={isExiting}>
					{renderFace({ ...variantProps, side: 'front' })}
					{children}
				</CardFace>

				{/* Back Face */}
				<CardFace side="back" exitColor={exitColor} isExiting={isExiting}>
					{renderFace({ ...variantProps, side: 'back' })}
				</CardFace>
			</CardFlipContainer>
		</motion.div>
	);
};
