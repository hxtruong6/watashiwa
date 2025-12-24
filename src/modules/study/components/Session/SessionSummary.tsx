'use client';

import { CheckCircleOutlined, DashboardOutlined } from '@ant-design/icons';
import { Button, Flex, Typography, theme } from 'antd';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { useSessionStore } from '../../store/useSessionStore';

const { Title, Text } = Typography;

export default function SessionSummary() {
	const { sessionStats } = useSessionStore();
	const { token } = theme.useToken();
	const router = useRouter();

	const { reviews, startTime, endTime } = sessionStats;

	// Calculate Duration
	// eslint-disable-next-line react-hooks/purity
	const currentTime = Date.now();
	const durationMs = (endTime || currentTime) - (startTime || currentTime);
	const durationSec = Math.round(durationMs / 1000);
	const durationMin = Math.floor(durationSec / 60);

	// Calculate total reviews
	const totalReviews = reviews[1] + reviews[2] + reviews[3] + reviews[4];

	// Trigger Confetti on Mount
	useEffect(() => {
		const duration = 3000;
		const end = Date.now() + duration;

		const frame = () => {
			confetti({
				particleCount: 2,
				angle: 60,
				spread: 55,
				origin: { x: 0 },
			});
			confetti({
				particleCount: 2,
				angle: 120,
				spread: 55,
				origin: { x: 1 },
			});

			if (Date.now() < end) {
				requestAnimationFrame(frame);
			}
		};

		frame();
	}, []);

	return (
		<div
			style={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '40px 16px',
				background: token.colorBgLayout,
			}}
		>
			<Flex
				vertical
				align="center"
				gap={32}
				style={{
					maxWidth: 500,
					width: '100%',
				}}
			>
				{/* Success Icon */}
				<CheckCircleOutlined
					style={{
						fontSize: 120,
						color: '#6B8E23', // Olive green matching the reference
					}}
				/>

				{/* Title */}
				<Flex vertical align="center" gap={8}>
					<Title level={2} style={{ margin: 0, textAlign: 'center', fontSize: 32 }}>
						Session Complete!
					</Title>
					<Text type="secondary" style={{ fontSize: 16, textAlign: 'center' }}>
						Great job! You&apos;ve finished your reviews for now.
					</Text>
				</Flex>

				{/* Action Buttons */}
				<Flex vertical gap={12} style={{ width: '100%', maxWidth: 300 }}>
					<Button
						type="primary"
						size="large"
						icon={<DashboardOutlined />}
						onClick={() => router.push('/dashboard')}
						block
						style={{
							height: 56,
							fontSize: 18,
							fontWeight: 600,
							borderRadius: 12,
						}}
					>
						Dashboard
					</Button>
					<Button
						size="large"
						onClick={() => router.push('/decks')}
						block
						style={{
							height: 56,
							fontSize: 18,
							fontWeight: 600,
							borderRadius: 12,
						}}
					>
						Browse Decks
					</Button>
				</Flex>

				{/* Statistics */}
				<Flex gap={24} style={{ marginTop: 24 }}>
					<Flex vertical align="center" gap={4}>
						<Text type="secondary" style={{ fontSize: 12 }}>
							Total Reviews
						</Text>
						<Text strong style={{ fontSize: 32, lineHeight: 1 }}>
							{totalReviews}
						</Text>
					</Flex>
					<Flex vertical align="center" gap={4}>
						<Text type="secondary" style={{ fontSize: 12 }}>
							Time
						</Text>
						<Text strong style={{ fontSize: 32, lineHeight: 1 }}>
							{durationSec > 60 ? `${durationMin}m` : `${durationSec}s`}
						</Text>
					</Flex>
					<Flex vertical align="center" gap={4}>
						<Text type="secondary" style={{ fontSize: 12 }}>
							New L1
						</Text>
						<Text strong style={{ fontSize: 32, lineHeight: 1, color: token.colorError }}>
							{reviews[1]}
						</Text>
					</Flex>
					<Flex vertical align="center" gap={4}>
						<Text type="secondary" style={{ fontSize: 12 }}>
							Perfect L4
						</Text>
						<Text strong style={{ fontSize: 32, lineHeight: 1, color: token.colorSuccess }}>
							{reviews[4]}
						</Text>
					</Flex>
				</Flex>
			</Flex>
		</div>
	);
}
