'use client';

import { CheckCircleFilled, RightOutlined, RocketOutlined } from '@ant-design/icons';
import { Badge, Button, Flex, Typography, theme } from 'antd';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';

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
				minHeight: 'calc(100svh - 64px)',
				position: 'relative',
				overflow: 'hidden',
				background: token.colorBgLayout,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				paddingTop: 0,
			}}
		>
			<div
				className="gradient-orb-1"
				style={{
					position: 'absolute',
					top: '-20%',
					right: '-10%',
					width: 'min(80vw, 800px)',
					height: 'min(80vw, 800px)',
					background:
						'radial-gradient(circle, rgba(112, 130, 56, 0.15) 0%, rgba(255,255,255,0) 70%)',
					filter: 'blur(80px)',
					borderRadius: '50%',
					zIndex: 0,
					pointerEvents: 'none',
					willChange: 'transform',
					animation: 'gradientDrift 20s ease-in-out infinite',
				}}
			/>
			<div
				className="gradient-orb-2"
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
					willChange: 'transform',
					animation: 'gradientDrift 25s ease-in-out infinite reverse',
				}}
			/>

			<div
				style={{
					maxWidth: 1200,
					padding: '0 24px',
					position: 'relative',
					zIndex: 10,
				}}
			>
				<Flex
					vertical={false}
					wrap="wrap-reverse"
					justify="center"
					align="center"
					gap={40}
					style={{ width: '100%' }}
				>
					{/* Left Content (Text) */}
					<div
						style={{
							flex: '1 1 340px',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'flex-start',
							textAlign: 'left',
							marginBottom: 20,
						}}
					>
						<div style={{ width: '100%' }}>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.4 }}
								style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}
							>
								<Badge
									count={t('badge')}
									style={{
										backgroundColor: token.colorSuccess,
										color: '#fff',
										marginBottom: 16,
										boxShadow: '0 4px 12px rgba(112, 130, 56, 0.3)',
									}}
								/>
							</motion.div>

							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.6 }}
							>
								<Title
									level={1}
									style={{
										fontSize: 'clamp(32px, 6vw, 64px)',
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
										className="hero-accent"
										style={{
											color: '#68D391',
											textShadow: isDark ? '0 0 20px rgba(104, 211, 145, 0.4)' : 'none',
											display: 'inline-block',
											animation: 'breathingGlow 3s ease-in-out infinite',
										}}
									>
										{t('heroTitleAccent')}
									</span>
								</Title>
							</motion.div>

							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.6, delay: 0.4 }}
							>
								<Paragraph
									style={{
										fontSize: 'clamp(1rem, 2vw, 1.25rem)',
										color: token.colorText,
										marginBottom: 32,
										maxWidth: '600px',
										lineHeight: 1.6,
										textAlign: 'left',
									}}
								>
									{t('heroSubtitle')}
								</Paragraph>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.5 }}
								style={{
									display: 'flex',
									flexWrap: 'wrap',
									gap: 16,
									justifyContent: 'flex-start',
									width: '100%',
								}}
							>
								<Link href="/login" style={{ flex: '1 1 auto', minWidth: '140px' }}>
									<div>
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
									</div>
								</Link>
								<Link href="#features" style={{ flex: '1 1 auto', minWidth: '140px' }}>
									<div>
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
									</div>
								</Link>
							</motion.div>

							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.5, delay: 0.7 }}
							>
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
					</div>

					<div style={{ flex: '1 1 340px' }}>
						<InteractiveFlipCard
							frontKanji={t('mockupKanji')}
							frontTag={t('mockupTag')}
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
