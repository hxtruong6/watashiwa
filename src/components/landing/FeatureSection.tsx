'use client';

import React from 'react';
import { Flex, Card, Typography } from 'antd';
import {
	ThunderboltOutlined,
	MobileOutlined,
	ReadOutlined,
	SafetyCertificateOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Paragraph } = Typography;

const features = [
	{
		icon: <ThunderboltOutlined style={{ fontSize: 32, color: '#1E3A5F' }} />,
		title: 'Smart Repetition (SRS)',
		description:
			'Powered by the advanced FSRS algorithm to schedule cards exactly when you need to review them.',
	},
	{
		icon: <ReadOutlined style={{ fontSize: 32, color: '#708238' }} />,
		title: 'Kanji & Vocab Focus',
		description:
			'Dedicated modes for Kanji strokes and vocabulary context to deepen your understanding.',
	},
	{
		icon: <MobileOutlined style={{ fontSize: 32, color: '#FAAD14' }} />,
		title: 'Mobile First Design',
		description:
			'Study anywhere, anytime with an interface optimized for one-handed usage on mobile devices.',
	},
	{
		icon: <SafetyCertificateOutlined style={{ fontSize: 32, color: '#E64A19' }} />,
		title: 'Offline Capable',
		description:
			'Seamlessly syncs your progress, but works buttery smooth even when connectivity is spotty.',
	},
];

export default function FeatureSection() {
	return (
		<section
			id="features"
			style={{
				padding: '80px 24px',
				background: '#fff',
			}}
		>
			<Flex vertical align="center" style={{ maxWidth: 1200, margin: '0 auto' }}>
				<Title level={2} style={{ color: '#1E3A5F', marginBottom: 60, textAlign: 'center' }}>
					Why choose WatashiWa?
				</Title>

				<Flex wrap="wrap" gap="large" justify="center">
					{features.map((feature, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							style={{ width: '100%', maxWidth: 280 }}
						>
							<Card
								hoverable
								style={{ height: '100%', borderColor: '#f0f0f0', borderRadius: 16 }}
								styles={{ body: { padding: 32, textAlign: 'center' } }}
							>
								<div style={{ marginBottom: 24 }}>{feature.icon}</div>
								<Title level={4} style={{ marginBottom: 16 }}>
									{feature.title}
								</Title>
								<Paragraph type="secondary">{feature.description}</Paragraph>
							</Card>
						</motion.div>
					))}
				</Flex>
			</Flex>
		</section>
	);
}
