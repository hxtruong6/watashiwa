'use client';

import { theme } from 'antd';
import { PanInfo, motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import React, { useState } from 'react';

import { SmartCard } from '../../types';
// We will add other faces later as we migrate them
// import { GapFillFace } from './Faces/GapFillFace';
import { InterventionFace } from './Faces/InterventionFace';
import { StandardFace } from './StandardFace';

interface CardShellProps {
	card: SmartCard;
	isActive: boolean;
	isNext: boolean; // Used for stack visuals
	children?: React.ReactNode; // Optional overlay
	onSwipeRight?: () => void;
	onSwipeLeft?: () => void;
	onSwipeUp?: () => void;

	// Global Settings passed down
	showFurigana?: boolean;
	showRomaji?: boolean;
}

export const CardShell: React.FC<CardShellProps> = ({
	card,
	isActive,
	isNext,
	children,
	onSwipeRight,
	onSwipeLeft,
	onSwipeUp,
	showFurigana,
	showRomaji,
}) => {
	const { token } = theme.useToken();
	const [isFlipped, setIsFlipped] = useState(false);
	const controls = useAnimation();

	// Motion Values for Swipe Physics
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const rotate = useTransform(x, [-200, 200], [-30, 30]); // Tilt effect

	// Color feedback interpolation
	const opacityRight = useTransform(x, [50, 150], [0, 1]); // Green overlay for "Good"
	const opacityLeft = useTransform(x, [-50, -150], [0, 1]); // Red overlay for "Again"
	const opacityUp = useTransform(y, [-50, -150], [0, 1]); // Blue overlay for "Easy"

	const handleDragEnd = async (_: any, info: PanInfo) => {
		const threshold = 100;
		const velocityThreshold = 500;

		// Swipe Right (Good)
		if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
			await controls.start({ x: 500, opacity: 0 });
			onSwipeRight?.();
		}
		// Swipe Left (Again)
		else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
			await controls.start({ x: -500, opacity: 0 });
			onSwipeLeft?.();
		}
		// Swipe Up (Easy)
		else if (info.offset.y < -threshold || info.velocity.y < -velocityThreshold) {
			await controls.start({ y: -500, opacity: 0 });
			onSwipeUp?.();
		}
		// Snap Back
		else {
			controls.start({ x: 0, y: 0 });
		}
	};

	const handleTap = () => {
		setIsFlipped(!isFlipped);
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
							if (!isFlipped) setIsFlipped(true);

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
	};

	return (
		<motion.div
			style={{
				position: 'absolute',
				width: '100%',
				maxWidth: '340px',
				aspectRatio: '3/4',
				perspective: 1000,
				x,
				y,
				rotate: isActive ? rotate : 0,
				touchAction: 'none', // Important for drag
				cursor: isActive ? 'grab' : 'default',
			}}
			variants={variants}
			initial="hidden"
			animate={isActive ? 'active' : isNext ? 'next' : 'hidden'}
			transition={{ type: 'spring', stiffness: 300, damping: 30 }}
			drag={isActive ? 'x' : false} // Only active card is draggable (mostly x-axis)
			dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
			onDragEnd={handleDragEnd}
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
				}}
				animate={{ rotateY: isFlipped ? 180 : 0 }}
				transition={{ duration: 0.4, ease: 'easeOut' }}
				onClick={handleTap}
			>
				{/* FRONT FACE */}
				<div
					style={{
						position: 'absolute',
						width: '100%',
						height: '100%',
						backfaceVisibility: 'hidden',
						background: token.colorBgContainer,
						borderRadius: token.borderRadiusLG,
						overflow: 'hidden',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					{/* Feedback Overlays */}
					<motion.div
						style={{
							position: 'absolute',
							inset: 0,
							background: token.colorSuccess,
							opacity: opacityRight,
							zIndex: 1,
							pointerEvents: 'none',
						}}
					/>
					<motion.div
						style={{
							position: 'absolute',
							inset: 0,
							background: token.colorError,
							opacity: opacityLeft,
							zIndex: 1,
							pointerEvents: 'none',
						}}
					/>
					<motion.div
						style={{
							position: 'absolute',
							inset: 0,
							background: token.colorPrimary, // Using Primary/Blue for "Easy"
							opacity: opacityUp,
							zIndex: 1,
							pointerEvents: 'none',
						}}
					/>

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
						background: token.colorBgContainer,
						borderRadius: token.borderRadiusLG,
						transform: 'rotateY(180deg)',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						overflow: 'hidden',
					}}
				>
					<div style={{ width: '100%', height: '100%' }}>{renderFace('back')}</div>
				</div>
			</motion.div>
		</motion.div>
	);
};
