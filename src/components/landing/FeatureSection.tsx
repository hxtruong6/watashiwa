'use client';

import React from 'react';
import { Typography, Row, Col } from 'antd';
import {
	ThunderboltOutlined,
	MobileOutlined,
	ReadOutlined,
	SafetyCertificateOutlined,
	GlobalOutlined,
	BarChartOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';

import { useTranslations } from 'next-intl';

const { Title, Paragraph } = Typography;

export default function FeatureSection() {
	const t = useTranslations('Landing');

	const features = [
		{
			title: t('featureSRS'),
			description: t('featureSRSDesc'),
			icon: <ThunderboltOutlined style={{ fontSize: 40, color: '#fff' }} />,
			color: 'linear-gradient(135deg, #1E3A5F 0%, #112239 100%)',
			size: 'large',
			delay: 0,
		},
		{
			title: t('featureKanji'),
			description: t('featureKanjiDesc'),
			icon: <ReadOutlined style={{ fontSize: 32, color: '#555' }} />,
			color: '#fff',
			size: 'medium',
			delay: 0.1,
		},
		{
			title: t('featureMobile'),
			description: t('featureMobileDesc'),
			icon: <MobileOutlined style={{ fontSize: 32, color: '#555' }} />,
			color: '#fff',
			size: 'medium',
			delay: 0.2,
		},
		{
			title: t('featureOffline'),
			description: t('featureOfflineDesc'),
			icon: <SafetyCertificateOutlined style={{ fontSize: 32, color: '#555' }} />,
			color: '#fff',
			size: 'medium',
			delay: 0.3,
		},
		{
			title: t('featureAnalytics'),
			description: t('featureAnalyticsDesc'),
			icon: <BarChartOutlined style={{ fontSize: 32, color: '#555' }} />,
			color: '#fff',
			size: 'medium',
			delay: 0.4,
		},
		{
			title: t('featureCommunity'),
			description: t('featureCommunityDesc'),
			icon: <GlobalOutlined style={{ fontSize: 32, color: '#fff' }} />,
			color: 'linear-gradient(135deg, #708238 0%, #506126 100%)',
			size: 'large',
			delay: 0.5,
		},
	];

	return (
		<section
			id="features"
			style={{
				padding: '100px 0',
				background: '#F9F7F2',
			}}
		>
			<div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', width: '100%' }}>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<Title
						level={2}
						style={{ color: '#1E3A5F', marginBottom: 16, textAlign: 'center', fontSize: '2.5rem' }}
					>
						{t('featuresTitle')}
					</Title>
					<Paragraph
						style={{
							textAlign: 'center',
							fontSize: 18,
							color: '#666',
							maxWidth: 600,
							margin: '0 auto 60px',
						}}
					>
						{t('featuresSubtitle')}
					</Paragraph>
				</motion.div>

				<Row gutter={[24, 24]}>
					{features.map((feature, index) => (
						<Col
							xs={24}
							md={feature.size === 'large' ? 16 : 8}
							lg={feature.size === 'large' ? 16 : 8}
							key={index}
							style={{ display: 'flex' }}
						>
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: feature.delay }}
								style={{ width: '100%', height: '100%' }}
							>
								<motion.div
									whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
									style={{
										height: '100%',
										background: feature.color,
										borderRadius: 24,
										padding: 32,
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'space-between',
										border: feature.size === 'medium' ? '1px solid #EAEAEA' : 'none',
										color: feature.size === 'large' ? 'white' : 'inherit',
									}}
								>
									<div style={{ marginBottom: 24 }}>
										<div
											style={{
												width: 64,
												height: 64,
												borderRadius: 16,
												background: feature.size === 'large' ? 'rgba(255,255,255,0.2)' : '#F5F5F5',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												marginBottom: 24,
											}}
										>
											{feature.icon}
										</div>
										<Title
											level={3}
											style={{
												marginTop: 0,
												marginBottom: 12,
												color: feature.size === 'large' ? 'white' : '#1E3A5F',
												fontSize: feature.size === 'large' ? 28 : 20,
											}}
										>
											{feature.title}
										</Title>
										<Paragraph
											style={{
												color: feature.size === 'large' ? 'rgba(255,255,255,0.85)' : '#666',
												fontSize: 16,
												margin: 0,
											}}
										>
											{feature.description}
										</Paragraph>
									</div>
									{feature.size === 'large' && (
										<div
											style={{
												width: '100%',
												height: 4,
												background: 'rgba(255,255,255,0.1)',
												borderRadius: 2,
												marginTop: 'auto',
											}}
										>
											<div
												style={{
													width: '40%',
													height: '100%',
													background: 'white',
													borderRadius: 2,
												}}
											/>
										</div>
									)}
								</motion.div>
							</motion.div>
						</Col>
					))}
				</Row>
			</div>
		</section>
	);
}
