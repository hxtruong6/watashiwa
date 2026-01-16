/**
 * GhostAnimation Component
 *
 * Renders a ghost clone of a word that animates from its position to the collection drawer
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
	calculateAnimationDuration,
	calculateGhostAnimation,
	createAnimationPortal,
	easings,
	generateGhostTransform,
	prefersReducedMotion,
} from '../utils/animationHelpers';

interface GhostAnimationProps {
	wordElement: HTMLElement;
	drawerElement: HTMLElement;
	targetSlotIndex: number;
	wordText: string;
	onComplete: () => void;
}

export function GhostAnimation({
	wordElement,
	drawerElement,
	targetSlotIndex,
	wordText,
	onComplete,
}: GhostAnimationProps) {
	const ghostRef = useRef<HTMLSpanElement>(null);
	const [progress, setProgress] = useState(0);
	const animationFrameRef = useRef<number>(null);
	const startTimeRef = useRef<number>(null);

	const reducedMotion = prefersReducedMotion();

	// Calculate animation path once (memoized)
	const animationPath = useMemo(
		() => calculateGhostAnimation(wordElement, drawerElement, targetSlotIndex),
		[wordElement, drawerElement, targetSlotIndex],
	);

	const { startX, startY, endX, endY, distance } = animationPath;

	useEffect(() => {
		if (reducedMotion) {
			// Skip animation if reduced motion is preferred
			onComplete();
			return;
		}

		// Calculate duration (1.2s default, adjusted by distance)
		const duration = calculateAnimationDuration(distance, 800, 1400);

		// Get initial position for ghost element
		if (ghostRef.current) {
			ghostRef.current.style.left = `${startX}px`;
			ghostRef.current.style.top = `${startY}px`;
		}

		// Animation loop
		const animate = (currentTime: number) => {
			if (!startTimeRef.current) {
				startTimeRef.current = currentTime;
			}

			const elapsed = currentTime - startTimeRef.current;
			const rawProgress = Math.min(elapsed / duration, 1);
			const easedProgress = easings.easeOut(rawProgress);

			setProgress(easedProgress);

			if (rawProgress < 1) {
				animationFrameRef.current = requestAnimationFrame(animate);
			} else {
				// Animation complete
				onComplete();
			}
		};

		// Start animation
		animationFrameRef.current = requestAnimationFrame(animate);

		// Cleanup
		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [startX, startY, endX, endY, distance, onComplete, reducedMotion]);

	// Calculate transform based on progress
	const transform = generateGhostTransform(progress, startX, startY, endX, endY);

	if (reducedMotion) {
		return null;
	}

	const portal = createAnimationPortal('ghost-animation-portal');

	const ghostElement = (
		<span
			ref={ghostRef}
			style={{
				position: 'fixed',
				left: `${startX}px`,
				top: `${startY}px`,
				transform: transform.transform,
				opacity: transform.opacity,
				pointerEvents: 'none',
				zIndex: 10001,
				display: 'inline-block',
				padding: '0px 4px',
				margin: '0 2px',
				borderRadius: '6px',
				fontWeight: 600,
				backgroundColor: 'rgba(148, 201, 115, 0.20)',
				color: '#2D5016',
				textDecoration: 'underline',
				textDecorationStyle: 'dotted',
				textDecorationColor: '#94C973',
				textUnderlineOffset: '3px',
				willChange: 'transform, opacity',
			}}
			aria-hidden="true"
		>
			{wordText}
		</span>
	);

	return createPortal(ghostElement, portal);
}
