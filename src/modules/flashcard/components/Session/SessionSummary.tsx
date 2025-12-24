'use client';

import { CheckCircleOutlined, DashboardOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Flex, Result, Row, Statistic, theme } from 'antd';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { useSessionStore } from '../../store/useSessionStore';

export default function SessionSummary() {
	const { sessionStats, queue } = useSessionStore();
	const { token } = theme.useToken();
	const router = useRouter();

	const { reviews, startTime, endTime } = sessionStats;

	// Calculate Duration
	const durationMs = (endTime || Date.now()) - (startTime || Date.now());
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
		<div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 16px' }}>
			<Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
				<Result
					status="success"
					title="Session Complete!"
					subTitle="Great job! You've finished your reviews for now."
					icon={<CheckCircleOutlined style={{ color: token.colorSuccess }} />}
					extra={[
						<Button
							key="dashboard"
							type="primary"
							size="large"
							icon={<DashboardOutlined />}
							onClick={() => router.push('/dashboard')}
						>
							Dashboard
						</Button>,
						<Button key="decks" size="large" onClick={() => router.push('/decks')}>
							Browse Decks
						</Button>,
					]}
				>
					<div className="desc">
						<Row gutter={[16, 16]} justify="center">
							<Col xs={12} sm={6}>
								<Statistic title="Total Reviews" value={totalReviews} />
							</Col>
							<Col xs={12} sm={6}>
								<Statistic
									title="Time"
									value={durationSec > 60 ? `${durationMin}m` : `${durationSec}s`}
								/>
							</Col>
							<Col xs={12} sm={6}>
								<Statistic
									title="New L1"
									value={reviews[1]} // Again
									valueStyle={{ color: token.colorError }}
								/>
							</Col>
							<Col xs={12} sm={6}>
								<Statistic
									title="Perfect L4"
									value={reviews[4]} // Easy
									valueStyle={{ color: token.colorSuccess }}
								/>
							</Col>
						</Row>
					</div>
				</Result>
			</Card>
		</div>
	);
}
