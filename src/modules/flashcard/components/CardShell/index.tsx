'use client';

import type { CardBackSettings } from '@/modules/study/store/useStudyPreferences';
import { theme } from 'antd';
import { motion, useAnimation } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { SmartCard } from '../../types';
// We will add other faces later as we migrate them
// import { GapFillFace } from './Faces/GapFillFace';
import { InterventionFace } from './Faces/InterventionFace';
import { StandardFace } from './StandardFace';

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
	const { token } = theme.useToken();
	const controls = useAnimation();

	// Use showAnswer directly if provided, otherwise use internal state
	const [internalFlipped, setInternalFlipped] = useState(false);
	const isFlipped = showAnswer !== undefined ? showAnswer : internalFlipped;

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

	const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
		e.stopPropagation(); // Prevent event bubbling to RatingBar buttons
		if (showAnswer === undefined) {
			// Only allow internal flip if not controlled
			setInternalFlipped(!internalFlipped);
		} else if (onReveal) {
			// Allow toggle: if answer is shown, flip back to front; if not, reveal answer
			// This gives users agency to review the question again
			onReveal();
		}
	};

	// --- VARIANT RENDER LOGIC ---
	const renderFace = (side: 'front' | 'back') => {
		switch (card.variant) {
			case 'GAP_FILL':
				return <div>Gap Fill Coming Soon</div>;
			case 'INTERVENTION':
				return (
					<InterventionFace
						key={card.id}
						card={card}
						onResolve={(isCorrect) => {
							// FAIL OPEN STRATEGY:
							// Whether correct or incorrect, we reveal the answer (Back of Card).
							// If incorrect, the user sees the correct item details immediately.
							// We do NOT trap them in a loop.
							if (!isFlipped) {
								if (onReveal) {
									onReveal();
								} else if (showAnswer === undefined) {
									setInternalFlipped(true);
								}
							}

							if (!isCorrect) {
								// Optional: You might want to trigger a visual "Wrong" feedback here before flipping,
								// but for instant flow, just flipping is acceptable.
								// Or we could start the Shake animation for 0.5s then Flip?
								controls.start({
									x: [0, -10, 10, -10, 10, 0],
									transition: { duration: 0.3 },
								});
								// Wait for shake? No, instant is better for "Fail Open".
							}
						}}
					/>
				);
			case 'BASIC':
			default:
				return (
					<StandardFace
						card={card as any}
						side={side}
						showFurigana={showFurigana}
						showRomaji={showRomaji}
						isPlaying={isPlaying}
						onPlayAudio={onPlayAudio}
						designVariant={designVariant}
						cardBackSettings={cardBackSettings}
					/>
				);
		}
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
				perspective: 1000,
				cursor: isActive ? 'pointer' : 'default', // Always clickable when active (allows toggle)
			}}
			variants={variants}
			initial="hidden"
			animate={isExiting ? 'exit' : isActive ? 'active' : isNext ? 'next' : 'hidden'}
			transition={{ type: 'spring', stiffness: 300, damping: 30 }}
		>
			{/* 3D Flip Container */}
			<motion.div
				style={{
					width: '100%',
					height: '100%',
					position: 'relative',
					transformStyle: 'preserve-3d',
					borderRadius: token.borderRadiusLG,
					boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
					overflow: 'hidden', // Critical: Clips backface on mobile
					willChange: 'transform', // Performance hint for mobile browsers
				}}
				animate={{ rotateY: isFlipped ? 180 : 0 }}
				transition={{ duration: 0.4, ease: 'easeOut' }}
				onClick={handleTap}
				onTouchStart={handleTap}
			>
				{/* FRONT FACE */}
				<div
					style={{
						position: 'absolute',
						width: '100%',
						height: '100%',
						backfaceVisibility: 'hidden',
						WebkitBackfaceVisibility: 'hidden', // Critical for iOS Safari
						// Use translate3d for better mobile hardware acceleration
						// No Z-offset needed - backface visibility handles hiding
						transform: 'translate3d(0, 0, 0)',
						WebkitTransform: 'translate3d(0, 0, 0)', // iOS Safari vendor prefix
						background: token.colorBgContainer,
						borderRadius: token.borderRadiusLG,
						overflow: 'hidden',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						userSelect: 'none',
						WebkitUserSelect: 'none',
						WebkitTouchCallout: 'none',
					}}
				>
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

					<div style={{ zIndex: 2, width: '100%', height: '100%' }}>
						{renderFace('front')}
						{children}
					</div>
				</div>

				{/* BACK FACE */}
				<div
					style={{
						position: 'absolute',
						width: '100%',
						height: '100%',
						backfaceVisibility: 'hidden',
						WebkitBackfaceVisibility: 'hidden', // Critical for iOS Safari
						// Rotate first, then translate - ensures proper backface culling on mobile
						transform: 'rotateY(180deg) translate3d(0, 0, 0)',
						WebkitTransform: 'rotateY(180deg) translate3d(0, 0, 0)', // iOS Safari vendor prefix
						background: token.colorBgContainer,
						borderRadius: token.borderRadiusLG,
						overflow: 'hidden',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						userSelect: 'none',
						WebkitUserSelect: 'none',
						WebkitTouchCallout: 'none',
					}}
				>
					<div style={{ width: '100%', height: '100%' }}>{renderFace('back')}</div>
				</div>
			</motion.div>
		</motion.div>
	);
};
