'use client';

import React from 'react';
import { Typography, Row, Col, theme, Grid } from 'antd';
import {
	ThunderboltOutlined,
	MobileOutlined,
	ReadOutlined,
	GlobalOutlined,
	BarChartOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import { useTranslations } from 'next-intl';

const { Title, Paragraph } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

export default function FeatureSection() {
	const { token } = useToken();
	const screens = useBreakpoint();
	const t = useTranslations('Landing');
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		const timer = setTimeout(() => setMounted(true), 0);
		return () => clearTimeout(timer);
	}, []);

	// During SSR/initial render, assume mobile (false) to match server
	// Once mounted, usage real screens breakpoint
	const isMd = mounted ? screens.md : false;

	const features = [
		{
			title: t('featureSRS'),
			description: t('featureSRSDesc'),
			icon: <ThunderboltOutlined style={{ fontSize: 40, color: '#fff' }} />,
			color: `linear-gradient(135deg, ${token.colorPrimary} 0%, #112239 100%)`,
			size: 'large',
			delay: 0,
		},
		{
			title: t('featureKanji'),
			description: t('featureKanjiDesc'),
			icon: <ReadOutlined style={{ fontSize: 32, color: token.colorTextSecondary }} />,
			color: token.colorBgContainer,
			size: 'medium',
			delay: 0.1,
		},
		{
			title: t('featureMobile'),
			description: t('featureMobileDesc'),
			icon: <MobileOutlined style={{ fontSize: 32, color: token.colorTextSecondary }} />,
			color: token.colorBgContainer,
			size: 'medium',
			delay: 0.2,
		},
		{
			title: t('featureOffline'),
			description: t('featureOfflineDesc'),
			// icon: <SafetyCertificateOutlined style={{ fontSize: 32, color: token.colorTextSecondary }} />,
			// Replaced with LoaderCat animation
			element: (
				<div
					style={{
						width: 60,
						height: 60,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<DotLottieReact
						src="/assets/animations/LoaderCat.lottie"
						loop
						autoplay
						style={{ width: '100%', height: '100%' }}
					/>
				</div>
			),
			color: token.colorBgContainer,
			size: 'medium',
			delay: 0.3,
		},
		{
			title: t('featureAnalytics'),
			description: t('featureAnalyticsDesc'),
			icon: <BarChartOutlined style={{ fontSize: 32, color: token.colorTextSecondary }} />,
			color: token.colorBgContainer,
			size: 'medium',
			delay: 0.4,
		},
		{
			title: t('featureCommunity'),
			description: t('featureCommunityDesc'),
			icon: <GlobalOutlined style={{ fontSize: 32, color: '#fff' }} />,
			color: `linear-gradient(135deg, ${token.colorSuccess} 0%, #506126 100%)`,
			size: 'large',
			delay: 0.5,
		},
	];

	return (
		<section
			id="features"
			style={{
				padding: isMd ? '100px 4px' : '60px 4px',
				background: token.colorBgLayout,
				overflowX: 'hidden',
				maxWidth: '100%',
				margin: '0 auto',
			}}
		>
			<div
				style={{
					maxWidth: 1200,
					margin: '0 auto',
					padding: isMd ? '0 24px' : '0 16px',
					// backgroundColor: 'red',
				}}
			>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<Title
						level={2}
						style={{
							color: token.colorPrimary,
							marginBottom: 16,
							textAlign: 'center',
							fontSize: isMd ? '2.5rem' : '1.75rem',
						}}
					>
						{t('featuresTitle')}
					</Title>
					<Paragraph
						style={{
							textAlign: 'center',
							fontSize: isMd ? 18 : 16,
							color: token.colorTextSecondary,
							maxWidth: 600,
							margin: isMd ? '0 auto 60px' : '0 auto 32px',
						}}
					>
						{t('featuresSubtitle')}
					</Paragraph>
				</motion.div>

				<Row gutter={isMd ? [24, 24] : [0, 16]}>
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
										padding: isMd ? 32 : 20,
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'space-between',
										border: feature.size === 'medium' ? `1px solid ${token.colorBorder}` : 'none',
										color: feature.size === 'large' ? 'white' : token.colorText,
									}}
								>
									<div style={{ marginBottom: 24 }}>
										<div
											style={{
												width: isMd ? 64 : 56,
												height: isMd ? 64 : 56,
												borderRadius: 16,
												background:
													feature.size === 'large'
														? 'rgba(255,255,255,0.2)'
														: token.colorFillTertiary,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												marginBottom: 24,
												overflow: 'hidden', // Contain animation if needed
											}}
										>
											{feature.element || feature.icon}
										</div>
										<Title
											level={3}
											style={{
												marginTop: 0,
												marginBottom: 12,
												color: feature.size === 'large' ? 'white' : token.colorPrimary,
												fontSize: feature.size === 'large' ? (isMd ? 28 : 24) : isMd ? 20 : 18,
											}}
										>
											{feature.title}
										</Title>
										<Paragraph
											style={{
												color:
													feature.size === 'large'
														? 'rgba(255,255,255,0.85)'
														: token.colorTextSecondary,
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
