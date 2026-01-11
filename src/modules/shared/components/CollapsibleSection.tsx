'use client';

import { DownOutlined } from '@ant-design/icons';
import { Flex, Typography, theme } from 'antd';
import { motion } from 'framer-motion';
import React, { useLayoutEffect, useRef, useState } from 'react';

interface CollapsibleSectionProps {
	title: string;
	icon?: React.ReactNode;
	/**
	 * Controlled mode: When provided, component is controlled by parent
	 * Uncontrolled mode: When undefined, component manages its own state
	 */
	expanded?: boolean;
	/**
	 * Initial expanded state (only used in uncontrolled mode)
	 */
	defaultExpanded?: boolean;
	/**
	 * Callback when expanded state changes
	 */
	onToggle?: (expanded: boolean) => void;
	children: React.ReactNode;
}

/**
 * CollapsibleSection Component
 *
 * Supports both controlled and uncontrolled modes:
 * - Controlled: Parent manages state via `expanded` prop
 * - Uncontrolled: Component manages state internally, uses `defaultExpanded` as initial value
 *
 * Best Practice: Use controlled mode when parent needs to manage state,
 * uncontrolled mode for simple, independent UI toggles.
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
	title,
	icon,
	expanded: controlledExpanded,
	defaultExpanded = false,
	onToggle,
	children,
}) => {
	// Internal state for uncontrolled mode
	const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
	const hasUserToggledRef = useRef(false);
	const prevDefaultExpandedRef = useRef(defaultExpanded);

	// Determine if component is controlled
	const isControlled = controlledExpanded !== undefined;

	// Sync defaultExpanded changes to internal state (handles breakpoint detection timing)
	// Only sync if user hasn't manually toggled and defaultExpanded changed from false to true
	// This handles the case where breakpoint detection completes after initial render
	useLayoutEffect(() => {
		if (
			!isControlled &&
			!hasUserToggledRef.current &&
			prevDefaultExpandedRef.current !== defaultExpanded &&
			defaultExpanded === true
		) {
			// Defer state update to avoid cascading renders warning
			requestAnimationFrame(() => {
				setInternalExpanded(true);
			});
		}
		prevDefaultExpandedRef.current = defaultExpanded;
	}, [defaultExpanded, isControlled]);

	// Get current expanded state
	const expanded = isControlled ? controlledExpanded : internalExpanded;

	// Measure content height for animation in 3D transform contexts
	// Simplified: measure only when needed (on mount and when expanded)
	const measureRef = useRef<HTMLDivElement>(null);
	const [contentHeight, setContentHeight] = useState<number>(0);
	const contentHeightRef = useRef<number>(0);

	// Measure on mount and when expanded state changes
	useLayoutEffect(() => {
		const measureElement = measureRef.current;
		if (!measureElement) return;

		const measureHeight = () => {
			// Use requestAnimationFrame to ensure layout is complete
			requestAnimationFrame(() => {
				if (!measureElement) return;

				const height = measureElement.scrollHeight;
				// Minimum 1px to prevent animation issues with empty content
				const measuredHeight = Math.max(height, 1);

				if (measuredHeight > 0 && measuredHeight !== contentHeightRef.current) {
					contentHeightRef.current = measuredHeight;
					setContentHeight(measuredHeight);
				}
			});
		};

		if (expanded) {
			// Small delay to allow content to render when expanding
			const timeoutId = setTimeout(measureHeight, 50);
			return () => clearTimeout(timeoutId);
		} else {
			// Measure on mount even if collapsed (for initial height calculation)
			measureHeight();
		}
	}, [expanded, children]);

	const { token } = theme.useToken();

	// Extract padding to constant to avoid duplication
	const CONTENT_PADDING = '0 16px 16px';

	const handleToggle = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent event from bubbling to parent (e.g., card flip)
		const newState = !expanded;

		if (isControlled) {
			// Controlled mode: call callback to let parent update state
			onToggle?.(newState);
		} else {
			// Uncontrolled mode: update internal state
			hasUserToggledRef.current = true; // Mark that user has manually toggled
			setInternalExpanded(newState);
			onToggle?.(newState);
		}
	};

	return (
		<div
			onClick={(e) => e.stopPropagation()}
			style={{
				marginBottom: 16,
				borderRadius: token.borderRadius,
				background: token.colorFillAlter,
				overflow: 'hidden',
				position: 'relative',
			}}
		>
			{/* Header with toggle */}
			<button
				type="button"
				onClick={handleToggle}
				style={{
					width: '100%',
					padding: '12px 16px',
					background: 'transparent',
					border: 'none',
					cursor: 'pointer',
				}}
			>
				<Flex align="center" justify="space-between" style={{ width: '100%' }}>
					<Flex align="center" gap={8}>
						{icon}
						<Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>
							{title}
						</Typography.Text>
					</Flex>
					<DownOutlined
						style={{
							fontSize: 12,
							color: token.colorTextTertiary,
							transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
							transition: 'transform 0.2s ease',
						}}
					/>
				</Flex>
			</button>

			{/* Hidden measurement wrapper - always rendered to measure content height */}
			{/* Positioned outside overflow context to ensure accurate measurement */}
			<div
				ref={measureRef}
				aria-hidden="true"
				style={{
					position: 'absolute',
					top: 0,
					left: '-9999px', // Move off-screen horizontally instead of vertically
					visibility: 'hidden',
					height: 'auto',
					width: '100%',
					maxWidth: '100%', // Ensure width matches
					pointerEvents: 'none',
					zIndex: -1,
					overflow: 'visible', // Critical: allow content to expand fully
				}}
			>
				<div style={{ padding: CONTENT_PADDING }}>{children}</div>
			</div>

			{/* Content with animation */}
			<motion.div
				initial={false}
				animate={{
					height: expanded ? contentHeight : 0,
					opacity: expanded ? 1 : 0,
				}}
				transition={{ duration: 0.2, ease: 'easeInOut' }}
				style={{ overflow: 'hidden' }}
			>
				<div style={{ padding: CONTENT_PADDING }}>{children}</div>
			</motion.div>
		</div>
	);
};
