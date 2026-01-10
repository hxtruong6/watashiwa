'use client';

import { Card, Flex, theme } from 'antd';
import { motion } from 'framer-motion';
import React from 'react';

import AppSkeleton from './AppSkeleton';

const { useToken } = theme;

/**
 * FlipCardSkeleton - Zen Mastery Loading Component
 *
 * A unified loading skeleton featuring a single card in the middle of the page
 * with a subtle pulse/breathing animation. Aligns with the "Zen Mastery" design
 * philosophy: minimal, calm, and empowering.
 *
 * Design Philosophy:
 * - Single focused card (not distracting)
 * - Subtle pulse animation (breathing effect)
 * - Theme-aware (light/dark mode compatible)
 * - Mobile-first responsive design
 *
 * @example
 *
 * import FlipCardSkeleton from '@/modules/ui/components/skeletons/FlipCardSkeleton';
 *
 * export default function Loading() {
 *   return <FlipCardSkeleton />;
 * }
 */
export default function FlipCardSkeleton() {
	const { token } = useToken();

	// Subtle pulse/breathing animation
	// Scale: gentle expansion/contraction (1 → 1.02 → 1)
	// Opacity: soft fade in/out (0.9 → 1 → 0.9)
	const pulseAnimation = {
		scale: [1, 1.02, 1],
		opacity: [0.9, 1, 0.9],
	};

	const pulseTransition = {
		duration: 2,
		repeat: Infinity,
		ease: 'easeInOut' as const,
	};

	return (
		<Flex
			vertical
			align="center"
			justify="center"
			style={{
				minHeight: '60vh',
				padding: token.paddingLG, // 24px
				width: '100%',
			}}
		>
			<motion.div
				animate={pulseAnimation}
				transition={pulseTransition}
				style={{
					width: '100%',
					maxWidth: 400,
				}}
			>
				<Card
					style={{
						borderRadius: token.borderRadiusLG, // 16px
						boxShadow: token.boxShadow,
						backgroundColor: token.colorBgContainer,
						border: `1px solid ${token.colorBorder}`,
						padding: token.paddingLG, // 24px
					}}
				>
					<AppSkeleton variant="compact" rows={3} title={false} />
				</Card>
			</motion.div>
		</Flex>
	);
}
