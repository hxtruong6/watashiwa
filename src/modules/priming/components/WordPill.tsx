/**
 * WordPill Component
 *
 * Interactive inline word chip for Japanese vocabulary
 * Handles hover/click states, collection status, and tooltip trigger
 */

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { VocabMeta } from '../types';
import { prefersReducedMotion } from '../utils/animationHelpers';

interface WordPillProps {
	vocab: VocabMeta;
	isCollected: boolean;
	onClick: (event: React.MouseEvent, vocabularyId: string) => void;
	onOpenTooltip: (vocab: VocabMeta, anchorElement: HTMLElement) => void;
}

function WordPillComponent({ vocab, isCollected, onClick, onOpenTooltip }: WordPillProps) {
	const pillRef = useRef<HTMLSpanElement>(null);
	const shimmerTriggeredRef = useRef(false);
	const [isHovered, setIsHovered] = useState(false);
	const [isPressed, setIsPressed] = useState(false);
	const [hasShimmer, setHasShimmer] = useState(false);
	const [isFocused, setIsFocused] = useState(false);

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();

			if (!pillRef.current) return;

			// Trigger click callback
			onClick(e, vocab.vocabularyId);

			// Open tooltip
			onOpenTooltip(vocab, pillRef.current);
		},
		[vocab, onClick, onOpenTooltip],
	);

	const handleMouseEnter = useCallback(() => {
		setIsHovered(true);
	}, []);

	const handleMouseLeave = useCallback(() => {
		setIsHovered(false);
		setIsPressed(false);
	}, []);

	const handleMouseDown = useCallback(() => {
		setIsPressed(true);
	}, []);

	const handleMouseUp = useCallback(() => {
		setIsPressed(false);
	}, []);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				e.stopPropagation();
				if (pillRef.current) {
					// Create a synthetic mouse event to trigger click
					const syntheticEvent = {
						currentTarget: pillRef.current,
						stopPropagation: () => {},
					} as React.MouseEvent;
					handleClick(syntheticEvent);
				}
			}
		},
		[handleClick],
	);

	const handleFocus = useCallback(() => {
		setIsFocused(true);
	}, []);

	const handleBlur = useCallback(() => {
		setIsFocused(false);
	}, []);

	// Trigger shimmer effect on mount for uncollected words
	useEffect(() => {
		if (!isCollected && !shimmerTriggeredRef.current && pillRef.current) {
			shimmerTriggeredRef.current = true;
			setHasShimmer(true);

			// Remove shimmer class after animation completes (800ms)
			const timer = setTimeout(() => {
				setHasShimmer(false);
			}, 800);

			return () => clearTimeout(timer);
		}
	}, [isCollected]);

	// Check if animations should be disabled
	const reducedMotion = prefersReducedMotion();

	return (
		<span
			ref={pillRef}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			onFocus={handleFocus}
			onBlur={handleBlur}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			role="button"
			tabIndex={0}
			aria-label={`Japanese word: ${vocab.wordSurface}, meaning: ${vocab.meaningEn}`}
			data-vocab-id={vocab.vocabularyId}
			data-collected={isCollected}
			style={{
				// Base styles
				display: 'inline-block',
				position: 'relative',
				cursor: 'pointer',
				padding: '0px 4px',
				margin: '0 2px',
				borderRadius: '6px',
				fontWeight: 600,
				userSelect: 'none',
				WebkitTapHighlightColor: 'transparent',

				// Color based on state
				backgroundColor: isCollected ? 'rgba(108, 99, 255, 0.15)' : 'rgba(148, 201, 115, 0.20)',
				color: isCollected ? '#6C63FF' : '#2D5016',
				textDecoration: isCollected ? 'none' : 'underline',
				textDecorationStyle: 'dotted',
				textDecorationColor: isCollected ? 'transparent' : '#94C973',
				textUnderlineOffset: '3px',

				// Focus styles for keyboard navigation
				...(isFocused && {
					outline: '3px solid #6C63FF',
					outlineOffset: '2px',
				}),

				// Interaction states
				...(isHovered &&
					!reducedMotion && {
						transform: 'translateY(-2px)',
						boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
						backgroundColor: isCollected ? 'rgba(108, 99, 255, 0.25)' : 'rgba(148, 201, 115, 0.35)',
					}),

				...(isPressed &&
					!reducedMotion && {
						transform: 'translateY(0px) scale(0.95)',
						boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
					}),

				// Smooth transitions
				transition: reducedMotion
					? 'none'
					: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
			}}
			className={hasShimmer && !reducedMotion ? 'shimmer-once' : ''}
		>
			{vocab.wordSurface}

			{/* Collected checkmark */}
			{isCollected && (
				<span
					style={{
						position: 'absolute',
						top: '-6px',
						right: '-6px',
						width: '14px',
						height: '14px',
						borderRadius: '50%',
						backgroundColor: '#6C63FF',
						color: '#fff',
						fontSize: '10px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
					}}
					aria-hidden="true"
				>
					✓
				</span>
			)}

			{/* Shimmer effect styles */}
			<style jsx>{`
				@keyframes shimmer {
					0% {
						opacity: 1;
					}
					50% {
						opacity: 0.7;
						box-shadow: 0 0 8px rgba(148, 201, 115, 0.6);
					}
					100% {
						opacity: 1;
					}
				}

				.shimmer-once {
					animation: shimmer 0.8s ease-in-out;
				}
			`}</style>
		</span>
	);
}

// Memoize to prevent unnecessary re-renders
export const WordPill = React.memo(WordPillComponent, (prevProps, nextProps) => {
	// Custom comparison for better performance
	return (
		prevProps.vocab.vocabularyId === nextProps.vocab.vocabularyId &&
		prevProps.isCollected === nextProps.isCollected &&
		prevProps.onClick === nextProps.onClick &&
		prevProps.onOpenTooltip === nextProps.onOpenTooltip
	);
});

/**
 * WordPill Skeleton (for loading states)
 */
export function WordPillSkeleton({ width = 60 }: { width?: number }) {
	return (
		<span
			style={{
				display: 'inline-block',
				width: `${width}px`,
				height: '24px',
				margin: '0 2px',
				borderRadius: '6px',
				backgroundColor: 'rgba(0, 0, 0, 0.06)',
				animation: 'pulse 1.5s ease-in-out infinite',
			}}
			aria-hidden="true"
		>
			<style jsx>{`
				@keyframes pulse {
					0%,
					100% {
						opacity: 1;
					}
					50% {
						opacity: 0.5;
					}
				}
			`}</style>
		</span>
	);
}
