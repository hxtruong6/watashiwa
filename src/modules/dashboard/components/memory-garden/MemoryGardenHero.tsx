'use client';

/**
 * Scenario A: Morning Reflection (Dashboard Hero)
 * 
 * Shows a zoomed-out view of the user's memory garden with health insights.
 * Clicking on red "cracks" (leeches) triggers an intervention session.
 */

import { Button, Card, Flex, Typography, theme } from 'antd';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { Suspense } from 'react';

import { MemoryGarden } from './';
import type { MemoryGardenData, MemoryTile } from './types';

const { Text, Title } = Typography;
const { useToken } = theme;

interface MemoryGardenHeroProps {
	data: MemoryGardenData | null;
	loading?: boolean;
}

export default function MemoryGardenHero({ data, loading }: MemoryGardenHeroProps) {
	const { token } = useToken();
	const t = useTranslations('Dashboard');
	const router = useRouter();

	// Compute health message
	const getHealthMessage = () => {
		if (!data) return null;

		if (data.leechCount === 0) {
			return {
				text: 'Your garden is healthy and thriving!',
				type: 'success' as const,
			};
		}

		if (data.leechCount <= 5) {
			return {
				text: `You have ${data.leechCount} weak spot${data.leechCount > 1 ? 's' : ''} forming.`,
				type: 'warning' as const,
			};
		}

		return {
			text: `Your memory foundation has ${data.leechCount} unstable areas. Repair them to build stronger ground.`,
			type: 'error' as const,
		};
	};

	const healthMessage = getHealthMessage();

	// Handle tile click (navigate to intervention session)
	const handleTileClick = (tile: MemoryTile) => {
		if (tile.isLeech) {
			// Navigate to intervention session for this specific leech
			router.push(`/study?intervention=${tile.vocabId}`);
		}
	};

	if (loading) {
		return (
			<Card
				variant="borderless"
				style={{
					borderRadius: 20,
					boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
					background: token.colorBgContainer,
					minHeight: 400,
				}}
			>
				<Flex vertical align="center" justify="center" style={{ minHeight: 400 }}>
					<Text type="secondary">Loading your memory garden...</Text>
				</Flex>
			</Card>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			style={{ marginBottom: 24 }}
		>
			<Card
				variant="borderless"
				style={{
					borderRadius: 20,
					boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
					background: token.colorBgContainer,
				}}
			>
				<Flex vertical gap={16}>
					{/* Header */}
					<Flex vertical align="center" style={{ textAlign: 'center' }}>
						<Title level={4} style={{ margin: 0, color: token.colorText }}>
							Your Memory Garden
						</Title>
						<Text type="secondary" style={{ fontSize: 14 }}>
							{data
								? `${data.totalCount} words • ${data.masteredCount} mastered • Health: ${data.healthScore}/100`
								: 'Start studying to build your garden'}
						</Text>
					</Flex>

					{/* Health Message */}
					{healthMessage && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.2 }}
						>
							<Flex
								align="center"
								justify="center"
								gap={12}
								style={{
									padding: '12px 16px',
									background:
										healthMessage.type === 'success'
											? token.colorSuccessBg
											: healthMessage.type === 'warning'
												? token.colorWarningBg
												: token.colorErrorBg,
									borderRadius: 8,
								}}
							>
								<Text
									style={{
										color:
											healthMessage.type === 'success'
												? token.colorSuccess
												: healthMessage.type === 'warning'
													? token.colorWarning
													: token.colorError,
										fontWeight: 500,
									}}
								>
									{healthMessage.text}
								</Text>
								{data && data.leechCount > 0 && (
									<Button
										type="primary"
										size="small"
										onClick={() => {
											// Navigate to intervention session for all leeches
											router.push('/study?mode=intervention');
										}}
									>
										Fix Cracks
									</Button>
								)}
							</Flex>
						</motion.div>
					)}

					{/* 3D Garden Visualization */}
					<Suspense
						fallback={
							<div
								style={{
									height: 300,
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
						<MemoryGarden
							data={data}
							onTileClick={handleTileClick}
							height={300}
							showControls={true}
							autoRotate={true}
							animationMode="static"
						/>
					</Suspense>

					{/* Insight Text */}
					<Text
						type="secondary"
						style={{ fontSize: 12, textAlign: 'center', fontStyle: 'italic' }}
					>
						High ground = Mastery • Flat = Learning • Holes = Weak spots
					</Text>
				</Flex>
			</Card>
		</motion.div>
	);
}

