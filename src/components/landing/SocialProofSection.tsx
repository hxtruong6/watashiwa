'use client';

import React from 'react';
import { Typography, Row, Col, theme } from 'antd';
import { motion } from 'framer-motion';

import { useTranslations } from 'next-intl';

const { Text } = Typography;
const { useToken } = theme;

export default function SocialProofSection() {
	const { token } = useToken();
	const t = useTranslations('Landing');

	const stats = [
		{ label: t('statsLearners'), value: '10,000+', color: token.colorPrimary },
		{ label: t('statsReviews'), value: '1M+', color: token.colorSuccess },
		{ label: t('statsDecks'), value: '1,200+', color: token.colorWarning },
		{ label: t('statsPassRate'), value: '94%', color: token.colorError },
	];

	return (
		<section
			style={{
				padding: '60px 0',
				background: token.colorBgContainer,
				borderTop: `1px solid ${token.colorBorderSecondary}`,
				borderBottom: `1px solid ${token.colorBorderSecondary}`,
				overflow: 'hidden', // Prevent horizontal scroll from Row negative margins
			}}
		>
			<div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
				{/* Responsive gutter: Smaller on mobile to save space/prevent overflow */}
				<Row
					gutter={[
						{ xs: 16, sm: 24, md: 48 },
						{ xs: 32, md: 48 },
					]}
					justify="center"
				>
					{stats.map((stat, index) => (
						<Col xs={24} sm={12} md={6} key={index} style={{ textAlign: 'center' }}>
							<motion.div
								initial={{ opacity: 0, scale: 0.5 }}
								whileInView={{ opacity: 1, scale: 1 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
							>
								<Text
									style={{
										display: 'block',
										fontSize: 'clamp(32px, 3vw, 42px)',
										fontWeight: 800,
										color: stat.color,
										lineHeight: 1.2,
									}}
								>
									{stat.value}
								</Text>
								<Text type="secondary" style={{ fontSize: 16 }}>
									{stat.label}
								</Text>
							</motion.div>
						</Col>
					))}
				</Row>
			</div>
		</section>
	);
}
