'use client';

/**
 * Scenario B: Burnout Shield (Intervention Blocker)
 * 
 * Shows when user tries to learn new words but has too many reviews or leeches.
 * Visualizes WHY the restriction exists (unstable memory foundation).
 */

import { Button, Card, Flex, Typography, theme } from 'antd';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';

import { MemoryGarden } from './';
import type { MemoryGardenData } from './types';

const { Text, Title } = Typography;
const { useToken } = theme;

interface InterventionBlockerProps {
	data: MemoryGardenData | null;
	dueCount: number;
	leechCount: number;
	onDismiss?: () => void;
}

export default function InterventionBlocker({
	data,
	dueCount,
	leechCount,
	onDismiss,
}: InterventionBlockerProps) {
	const { token } = useToken();
	const t = useTranslations('Dashboard');
	const router = useRouter();
	const [pulsePhase, setPulsePhase] = useState(0);

	// Pulse animation for red tiles
	useEffect(() => {
		if (!data || data.leechCount === 0) return;

		const interval = setInterval(() => {
			setPulsePhase((prev) => (prev + 0.1) % (Math.PI * 2));
		}, 50);

		return () => clearInterval(interval);
	}, [data]);

	// Determine blocker reason
	const getBlockerReason = () => {
		if (leechCount >= 5) {
			return {
				title: 'Unstable Memory Foundation',
				message:
					'Your memory foundation has too many weak spots. We cannot build on shaky ground. Repair the cracks first.',
				severity: 'error' as const,
			};
		}

		if (dueCount >= 50) {
			return {
				title: 'Review Backlog Detected',
				message:
					'You have many reviews waiting. Focus on strengthening your existing knowledge before learning new words.',
				severity: 'warning' as const,
			};
		}

		return {
			title: 'Memory Health Check',
			message: 'Your memory garden needs attention. Review weak spots before adding new words.',
			severity: 'warning' as const,
		};
	};

	const reason = getBlockerReason();

	if (!data || (leechCount === 0 && dueCount < 20)) {
		// Don't show blocker if conditions aren't met
		return null;
	}

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.3 }}
			style={{ marginBottom: 24 }}
		>
			<Card
				variant="borderless"
				style={{
					borderRadius: 20,
					boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
					background: token.colorBgContainer,
					border: `2px solid ${
						reason.severity === 'error' ? token.colorError : token.colorWarning
					}`,
				}}
			>
				<Flex vertical gap={16}>
					{/* Header with Warning Icon */}
					<Flex align="center" gap={12}>
						<div
							style={{
								width: 40,
								height: 40,
								borderRadius: '50%',
								background:
									reason.severity === 'error' ? token.colorErrorBg : token.colorWarningBg,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontSize: 20,
							}}
						>
							{reason.severity === 'error' ? '⚠️' : '💡'}
						</div>
						<Flex vertical style={{ flex: 1 }}>
							<Title level={5} style={{ margin: 0, color: token.colorText }}>
								{reason.title}
							</Title>
							<Text type="secondary" style={{ fontSize: 14 }}>
								{reason.message}
							</Text>
						</Flex>
					</Flex>

					{/* Pulsing Garden Visualization */}
					<Suspense
						fallback={
							<div
								style={{
									height: 250,
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
							height={250}
							showControls={false}
							autoRotate={false}
							animationMode="pulse"
						/>
					</Suspense>

					{/* Action Buttons */}
					<Flex gap={12} justify="flex-end">
						{onDismiss && (
							<Button onClick={onDismiss}>Dismiss</Button>
						)}
						<Button
							type="primary"
							onClick={() => {
								if (leechCount > 0) {
									router.push('/study?mode=intervention');
								} else {
									router.push('/study');
								}
							}}
						>
							{leechCount > 0 ? 'Fix Cracks' : 'Start Reviews'}
						</Button>
					</Flex>
				</Flex>
			</Card>
		</motion.div>
	);
}

