'use client';

/**
 * Scenario C: Post-Session Satisfaction (Dopamine Hit)
 * 
 * Shows before/after animation when user completes a review session.
 * Visualizes progress: red holes fill up and turn green, tiles rise.
 */

import { Card, Flex, Typography, theme } from 'antd';
import { motion } from 'framer-motion';
import React, { Suspense, useEffect, useState } from 'react';

import { MemoryGarden } from './';
import type { MemoryGardenData, MemoryTile } from './types';

const { Text, Title } = Typography;
const { useToken } = theme;

interface PostSessionAnimationProps {
	beforeData: MemoryGardenData | null;
	afterData: MemoryGardenData | null;
	onComplete?: () => void;
}

export default function PostSessionAnimation({
	beforeData,
	afterData,
	onComplete,
}: PostSessionAnimationProps) {
	const { token } = useToken();
	const [showBefore, setShowBefore] = useState(true);
	const [repairedTileIds, setRepairedTileIds] = useState<string[]>([]);

	// Compute which tiles were "repaired" (leeches that are no longer leeches)
	useEffect(() => {
		if (!beforeData || !afterData) return;

		const beforeLeeches = new Set(
			beforeData.tiles.filter((t) => t.isLeech).map((t) => t.vocabId),
		);
		const afterNonLeeches = afterData.tiles
			.filter((t) => !t.isLeech && beforeLeeches.has(t.vocabId))
			.map((t) => t.vocabId);

		setRepairedTileIds(afterNonLeeches);
	}, [beforeData, afterData]);

	// Animate: Show "before" for 2 seconds, then transition to "after"
	useEffect(() => {
		if (!beforeData || !afterData) return;

		const timer = setTimeout(() => {
			setShowBefore(false);
		}, 2000);

		return () => clearTimeout(timer);
	}, [beforeData, afterData]);

	// Call onComplete after animation finishes
	useEffect(() => {
		if (!showBefore && afterData && onComplete) {
			const timer = setTimeout(() => {
				onComplete();
			}, 3000); // Show "after" for 3 seconds

			return () => clearTimeout(timer);
		}
	}, [showBefore, afterData, onComplete]);

	if (!beforeData || !afterData) {
		return null;
	}

	const currentData = showBefore ? beforeData : afterData;
	const leechCountBefore = beforeData.leechCount;
	const leechCountAfter = afterData.leechCount;
	const repairedCount = leechCountBefore - leechCountAfter;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				background: 'rgba(0, 0, 0, 0.7)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 1000,
				padding: 24,
			}}
		>
			<Card
				style={{
					maxWidth: 600,
					width: '100%',
					borderRadius: 20,
					boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
				}}
			>
				<Flex vertical gap={16} align="center">
					{/* Title */}
					<Title level={3} style={{ margin: 0, textAlign: 'center' }}>
						{showBefore ? 'Before' : 'After'}
					</Title>

					{/* Success Message (After only) */}
					{!showBefore && repairedCount > 0 && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
						>
							<Text
								style={{
									fontSize: 18,
									fontWeight: 600,
									color: token.colorSuccess,
									textAlign: 'center',
								}}
							>
								🎉 You repaired {repairedCount} weak spot{repairedCount > 1 ? 's' : ''}!
							</Text>
						</motion.div>
					)}

					{/* Garden Visualization */}
					<Suspense
						fallback={
							<div
								style={{
									height: 350,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									background: token.colorBgLayout,
									borderRadius: 12,
								}}
							>
								<Text type="secondary">Loading visualization...</Text>
							</div>
						}
					>
						<motion.div
							key={showBefore ? 'before' : 'after'}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5 }}
							style={{ width: '100%' }}
						>
							<MemoryGarden
								data={currentData}
								height={350}
								showControls={false}
								autoRotate={false}
								animationMode={showBefore ? 'static' : 'repair'}
								repairedTileIds={repairedTileIds}
							/>
						</motion.div>
					</Suspense>

					{/* Stats */}
					<Flex gap={24} justify="center">
						<Flex vertical align="center">
							<Text type="secondary" style={{ fontSize: 12 }}>
								Leeches
							</Text>
							<Text
								strong
								style={{
									fontSize: 20,
									color: showBefore ? token.colorError : token.colorSuccess,
								}}
							>
								{showBefore ? leechCountBefore : leechCountAfter}
							</Text>
						</Flex>
						<Flex vertical align="center">
							<Text type="secondary" style={{ fontSize: 12 }}>
								Health Score
							</Text>
							<Text strong style={{ fontSize: 20, color: token.colorPrimary }}>
								{currentData.healthScore}/100
							</Text>
						</Flex>
					</Flex>

					{/* Insight Text */}
					<Text
						type="secondary"
						style={{ fontSize: 12, textAlign: 'center', fontStyle: 'italic' }}
					>
						{showBefore
							? 'Your memory foundation before the session'
							: 'Watch the holes fill and ground rise as your memory strengthens'}
					</Text>
				</Flex>
			</Card>
		</motion.div>
	);
}

