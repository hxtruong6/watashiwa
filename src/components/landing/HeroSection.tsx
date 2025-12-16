'use client';

import React from 'react';
import { Button, Typography, Flex, Badge, theme } from 'antd';
import { motion } from 'framer-motion';
import { RocketOutlined, RightOutlined, CheckCircleFilled } from '@ant-design/icons';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import InteractiveFlipCard from './InteractiveFlipCard';

const { Title, Paragraph, Text } = Typography;
const { useToken } = theme;

export default function HeroSection() {
	// Hook for translations
	const t = useTranslations('Landing');
	const { token } = useToken();

	// Quick check for dark mode based on background token
	const isDark = token.colorBgBase === '#151F32';

	return (
		<section
			style={{
				minHeight: '100svh', // Use svh for better mobile viewport handling
				position: 'relative',
				overflow: 'hidden',
				background: token.colorBgLayout,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				paddingTop: 0, // Flex center handles alignment better
			}}
		>
			{/* Ambient Background Elements */}
			<div
				style={{
					position: 'absolute',
					top: '-20%',
					right: '-10%',
					width: 'min(80vw, 800px)',
					height: 'min(80vw, 800px)',
					background:
						'radial-gradient(circle, rgba(112, 130, 56, 0.15) 0%, rgba(255,255,255,0) 70%)',
					filter: 'blur(80px)', // Increased blur
					borderRadius: '50%',
					zIndex: 0,
					pointerEvents: 'none',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					bottom: '-10%',
					left: '-10%',
					width: 'min(70vw, 600px)',
					height: 'min(70vw, 600px)',
					background: `radial-gradient(circle, ${token.colorPrimary}1a 0%, rgba(255,255,255,0) 70%)`,
					filter: 'blur(80px)',
					borderRadius: '50%',
					zIndex: 0,
					pointerEvents: 'none',
				}}
			/>

			<div
				style={{
					width: '100%',
					maxWidth: 1200,
					padding: '0 24px',
					position: 'relative',
					zIndex: 10,
				}}
			>
				<Flex
					vertical={false}
					wrap="wrap-reverse" // Text on top on mobile? No, standard is visual on top or text on top. Let's do Text on Top (standard wrap)
					justify="center"
					align="center"
					gap={40}
					style={{ width: '100%' }}
				>
					{/* Left Content (Text) */}
					<div
						style={{
							flex: '1 1 340px', // Allow shrinking, but decent base width
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'flex-start',
							textAlign: 'left',
							marginBottom: 20,
						}}
					>
						<motion.div
							initial={{ opacity: 0, x: -50 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ type: 'spring', stiffness: 50, damping: 20 }}
							style={{ width: '100%' }}
						>
							<div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
								<Badge
									count={t('badge')}
									style={{
										backgroundColor: token.colorSuccess,
										color: '#fff',
										marginBottom: 16,
										boxShadow: '0 4px 12px rgba(112, 130, 56, 0.3)',
									}}
								/>
							</div>

							<Title
								level={1}
								style={{
									fontSize: 'clamp(32px, 6vw, 64px)', // Responsive font size
									fontWeight: 800,
									color: token.colorPrimary,
									lineHeight: 1.1,
									marginTop: 8,
									marginBottom: 24,
									letterSpacing: '-0.02em',
									textAlign: 'left',
								}}
							>
								{t('heroTitle')} <br />
								<span
									style={{
										color: isDark ? '#68D391' : '#68D391',
										textShadow: isDark ? '0 0 20px rgba(104, 211, 145, 0.4)' : 'none',
										display: 'inline-block',
									}}
								>
									{t('heroTitleAccent')}
								</span>
							</Title>

							<Paragraph
								style={{
									fontSize: 'clamp(1rem, 2vw, 1.25rem)',
									color: token.colorText,
									marginBottom: 32,

									maxWidth: '600px', // Prevent too wide on desktop
									lineHeight: 1.6,
									textAlign: 'left',
								}}
							>
								{t('heroSubtitle')}
							</Paragraph>

							<div
								style={{
									display: 'flex',
									flexWrap: 'wrap',
									gap: 16,
									justifyContent: 'flex-start',
									width: '100%',
								}}
							>
								<Link href="/login" style={{ flex: '1 1 auto', minWidth: '140px' }}>
									<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
										<Button
											type="primary"
											size="large"
											icon={<RocketOutlined />}
											style={{
												height: 56,
												fontSize: 18,
												borderRadius: 16,
												background: token.colorPrimary,
												boxShadow: `0 10px 30px ${token.colorPrimary}4d`,
												border: 'none',
												width: '100%',
												fontWeight: 'bold',
											}}
										>
											{t('startLearning')}
										</Button>
									</motion.div>
								</Link>
								<Link href="#features" style={{ flex: '1 1 auto', minWidth: '140px' }}>
									<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
										<Button
											size="large"
											icon={<RightOutlined />}
											style={{
												height: 56,
												fontSize: 18,
												borderRadius: 16,
												background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
												backdropFilter: 'blur(10px)',
												border: `1px solid ${token.colorBorder}`,
												color: token.colorText,
												width: '100%',
												fontWeight: 500,
											}}
										>
											{t('exploreFeatures')}
										</Button>
									</motion.div>
								</Link>
							</div>

							<Flex gap="middle" wrap="wrap" style={{ marginTop: 32 }} justify="flex-start">
								<Flex gap="small" align="center">
									<CheckCircleFilled style={{ color: token.colorSuccess }} />
									<Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
										{t('freePlan')}
									</Text>
								</Flex>
								<Flex gap="small" align="center">
									<CheckCircleFilled style={{ color: token.colorSuccess }} />
									<Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
										{t('noAds')}
									</Text>
								</Flex>
								<Flex gap="small" align="center">
									<CheckCircleFilled style={{ color: token.colorSuccess }} />
									<Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
										{t('openSource')}
									</Text>
								</Flex>
							</Flex>
						</motion.div>
					</div>

					{/* Right Visual (Interactive Flip Card) */}
					<div style={{ flex: '1 1 340px' }}>
						<InteractiveFlipCard
							frontKanji={t('mockupKanji')}
							frontSRSState={t('mockupSRS')}
							backAnimationSrc="/assets/animations/Ramen.lottie"
							backKanji={t('mockupKanji')}
							backFurigana={t('mockupFurigana')}
							backRomaji={t('mockupReading')}
							backMeaning={t('mockupMeaning')}
							backExample={t('mockupExample')}
							backExampleTrans={t('mockupExampleTrans')}
							streakLabel={t('mockupStreak')}
							streakValue={t('mockupDays')}
							tapHint={t('mockupTapToReveal')}
						/>
					</div>
				</Flex>
			</div>
		</section>
	);
}
