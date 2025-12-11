'use client';

import React from 'react';
import { Typography, Button, Flex, Card, Statistic, Row, Col } from 'antd';
import Link from 'next/link';
import {
	ClockCircleOutlined,
	FireOutlined,
	CheckCircleOutlined,
	RightOutlined,
	ReadOutlined,
	EditOutlined,
} from '@ant-design/icons';
import { motion } from 'motion/react';

const { Title, Text } = Typography;

interface DashboardContentProps {
	reviewCount: number;
	stats: {
		streak: number;
		totalReviewed: number;
	};
}

export default function DashboardContent({ reviewCount, stats }: DashboardContentProps) {
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	};

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}
		>
			{/* Hero Section */}
			<motion.div variants={itemVariants}>
				<Flex
					vertical
					align="center"
					justify="center"
					style={{ minHeight: '35vh', textAlign: 'center' }}
				>
					<Title
						level={1}
						style={{
							fontSize: 'clamp(2rem, 5vw, 3.5rem)', // Responsive font size
							marginBottom: 16,
							color: '#1E3A5F',
							fontWeight: 700,
							letterSpacing: '-0.02em',
						}}
					>
						Ready to learn?
					</Title>
					<Text
						type="secondary"
						style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', marginBottom: 48, maxWidth: 500 }}
					>
						{' '}
						{reviewCount > 0
							? "You have cards waiting for your attention. Let's keep the streak alive."
							: "You're all caught up for now. Relax or explore new decks."}
					</Text>

					{reviewCount > 0 ? (
						<Link href="/study" style={{ width: '100%', maxWidth: 300 }}>
							<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
								<Button
									type="primary"
									size="large"
									style={{
										height: 72,
										width: '100%',
										fontSize: '1.5rem',
										borderRadius: 36,
										boxShadow: '0 12px 24px rgba(30, 58, 95, 0.25)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										gap: 12,
									}}
								>
									Start Review{' '}
									<span style={{ opacity: 0.6, fontSize: '1rem' }}>({reviewCount})</span>
								</Button>
							</motion.div>
						</Link>
					) : (
						<motion.div whileHover={{ y: -5 }} style={{ width: '100%', maxWidth: 450 }}>
							<Card
								style={{
									borderRadius: 24,
									textAlign: 'center',
									boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
									border: 'none',
								}}
							>
								<Flex vertical align="center" gap="middle" style={{ padding: 24 }}>
									<CheckCircleOutlined style={{ fontSize: 56, color: '#708238' }} />
									<div>
										<Title level={3} style={{ margin: '0 0 8px' }}>
											All caught up!
										</Title>
										<Text type="secondary">
											Great job. Check back later or learn new cards from your library.
										</Text>
									</div>
									<Link href="/decks">
										<Button
											size="large"
											type="default"
											icon={<RightOutlined />}
											iconPlacement="end"
										>
											Browse Decks
										</Button>
									</Link>
								</Flex>
							</Card>
						</motion.div>
					)}
				</Flex>
			</motion.div>

			{/* Stats Grid */}
			<Row gutter={[24, 24]} style={{ marginTop: 64 }}>
				<Col xs={24} sm={12}>
					<motion.div variants={itemVariants} whileHover={{ y: -4 }}>
						<Card
							variant="borderless"
							style={{
								boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
								borderRadius: 20,
								height: '100%',
							}}
						>
							<Statistic
								title={<Text type="secondary">Day Streak</Text>}
								value={stats.streak}
								prefix={<FireOutlined style={{ color: '#FAAD14', fontSize: 28, marginRight: 8 }} />}
								styles={{ content: { color: '#1E3A5F', fontWeight: 600, fontSize: '2.5rem' } }}
							/>
						</Card>
					</motion.div>
				</Col>
				<Col xs={24} sm={12}>
					<motion.div variants={itemVariants} whileHover={{ y: -4 }}>
						<Card
							variant="borderless"
							style={{
								boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
								borderRadius: 20,
								height: '100%',
							}}
						>
							<Statistic
								title={<Text type="secondary">Reviewed Today</Text>}
								value={stats.totalReviewed}
								prefix={
									<ClockCircleOutlined style={{ color: '#708238', fontSize: 28, marginRight: 8 }} />
								}
								styles={{ content: { color: '#1E3A5F', fontWeight: 600, fontSize: '2.5rem' } }}
							/>
						</Card>
					</motion.div>
				</Col>
			</Row>

			{/* Quick Access */}
			<div style={{ marginTop: 48 }}>
				<Title level={4} style={{ marginBottom: 24, color: '#1E3A5F' }}>
					Quick Access
				</Title>
				<Row gutter={[16, 16]}>
					<Col xs={12} sm={6}>
						<Link href="/dashboard/vocab">
							<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
								<Card
									size="small"
									hoverable
									style={{
										textAlign: 'center',
										borderRadius: 16,
										border: '1px solid #f0f0f0',
										boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
									}}
								>
									<ReadOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
									<Text strong style={{ display: 'block' }}>
										All Vocab
									</Text>
								</Card>
							</motion.div>
						</Link>
					</Col>
					<Col xs={12} sm={6}>
						<Link href="/dashboard/kanji">
							<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
								<Card
									size="small"
									hoverable
									style={{
										textAlign: 'center',
										borderRadius: 16,
										border: '1px solid #f0f0f0',
										boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
									}}
								>
									<EditOutlined style={{ fontSize: 24, color: '#722ed1', marginBottom: 8 }} />
									<Text strong style={{ display: 'block' }}>
										All Kanji
									</Text>
								</Card>
							</motion.div>
						</Link>
					</Col>
				</Row>
			</div>
		</motion.div>
	);
}
