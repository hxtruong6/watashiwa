'use client';

import React from 'react';
import { Typography, Button, Card, Flex } from 'antd';
import Link from 'next/link';
import { CheckCircleOutlined, RightOutlined } from '@ant-design/icons';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

interface DueCTAProps {
	dueCount: number;
}

/**
 * Primary Call-to-Action showing due cards count and start review button
 */
export default function DueCTA({ dueCount }: DueCTAProps) {
	const t = useTranslations('Dashboard');

	if (dueCount > 0) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				style={{ marginBottom: 32 }}
			>
				<Link
					href="/study"
					style={{
						display: 'block',
						maxWidth: 360,
						margin: '0 auto',
					}}
				>
					<motion.div
						whileHover={{ scale: 1.03 }}
						whileTap={{ scale: 0.97 }}
						animate={{
							boxShadow: [
								'0 8px 24px rgba(30, 58, 95, 0.2)',
								'0 12px 32px rgba(30, 58, 95, 0.3)',
								'0 8px 24px rgba(30, 58, 95, 0.2)',
							],
						}}
						transition={{ boxShadow: { repeat: Infinity, duration: 2 } }}
						style={{ borderRadius: 32 }}
					>
						<Button
							type="primary"
							size="large"
							block
							style={{
								height: 64,
								fontSize: '1.25rem',
								borderRadius: 32,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: 12,
							}}
						>
							{t('startReview')}{' '}
							<span style={{ opacity: 0.7, fontSize: '1rem' }}>({dueCount})</span>
						</Button>
					</motion.div>
				</Link>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.1 }}
			whileHover={{ y: -4 }}
			style={{ maxWidth: 400, margin: '0 auto 32px' }}
		>
			<Card
				style={{
					borderRadius: 24,
					textAlign: 'center',
					boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
					border: 'none',
				}}
			>
				<Flex vertical align="center" gap="middle" style={{ padding: 16 }}>
					<CheckCircleOutlined style={{ fontSize: 48, color: '#708238' }} />
					<div>
						<Title level={4} style={{ margin: '0 0 8px' }}>
							{t('allCaughtUp')}
						</Title>
						<Text type="secondary">{t('allCaughtUpSubtitle')}</Text>
					</div>
					<Link href="/decks">
						<Button size="large" type="default" icon={<RightOutlined />} iconPlacement="end">
							{t('browseDecks')}
						</Button>
					</Link>
				</Flex>
			</Card>
		</motion.div>
	);
}
