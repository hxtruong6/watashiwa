'use client';

import React from 'react';
import { Button, Typography, Flex, Badge, theme } from 'antd';
import { motion } from 'framer-motion';
import { RocketOutlined, RightOutlined, CheckCircleFilled } from '@ant-design/icons';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
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
										background: `linear-gradient(120deg, ${token.colorSuccess} 0%, ${token.colorPrimary} 100%)`,
										WebkitBackgroundClip: 'text',
										WebkitTextFillColor: 'transparent',
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

					{/* Right Visual (Mockup) */}
					<div
						style={{
							flex: '1 1 340px', // Responsive basis
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							position: 'relative',
						}}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
							animate={{ opacity: 1, scale: 1, rotate: 0 }}
							transition={{
								type: 'spring',
								stiffness: 60,
								damping: 15, // Bouncy!
								delay: 0.2,
							}}
							style={{ position: 'relative', width: '100%', maxWidth: 450 }}
						>
							{/* Floating Emojis Background */}
							<motion.div
								animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
								transition={{ duration: 5, repeat: Infinity }}
								style={{ position: 'absolute', top: -40, right: 0, fontSize: 40, zIndex: 0 }}
							>
								🚀
							</motion.div>
							<motion.div
								animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
								transition={{ duration: 6, repeat: Infinity, delay: 1 }}
								style={{ position: 'absolute', bottom: -20, left: -20, fontSize: 40, zIndex: 0 }}
							>
								🔥
							</motion.div>

							{/* Glassmorphic Card Mockup */}
							<div
								style={{
									position: 'relative',
									background: isDark
										? 'rgba(21, 31, 50, 0.7)' // Dark glass
										: 'rgba(255, 255, 255, 0.65)', // Light glass
									backdropFilter: 'blur(24px)',
									border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255, 255, 255, 0.9)'}`,
									boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.15)', // Deeper shadow
									borderRadius: '32px',
									padding: '32px',
									zIndex: 1,
								}}
							>
								{/* Mock UI Content */}
								<Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
									<div
										style={{
											width: 48,
											height: 48,
											borderRadius: 14,
											background: token.colorPrimary,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											color: 'white',
											fontWeight: 'bold',
										}}
									>
										W
									</div>
									<div
										style={{
											width: 80,
											height: 8,
											borderRadius: 4,
											background: 'rgba(0,0,0,0.1)',
										}}
									/>
								</Flex>

								<Flex vertical gap="small" align="center" style={{ padding: '20px 0 40px' }}>
									<Text
										style={{
											fontSize: 96,
											lineHeight: 1,
											fontWeight: 'bold',
											color: token.colorText,
										}}
									>
										猫
									</Text>
									<Text style={{ fontSize: 28, color: token.colorTextSecondary, fontWeight: 500 }}>
										{t('mockupNeko')}
									</Text>
									<Text type="secondary" style={{ fontSize: 16 }}>
										{t('mockupTranslation')}
									</Text>

									{/* Difficulty Buttons Mockup */}
									<Flex gap="small" style={{ marginTop: 32 }}>
										<div
											style={{
												padding: '8px 24px',
												borderRadius: 12,
												background: token.colorError,
												opacity: 0.2,
												height: 12,
												width: 40,
											}}
										/>
										<div
											style={{
												padding: '8px 24px',
												borderRadius: 12,
												background: token.colorWarning,
												opacity: 0.2,
												height: 12,
												width: 40,
											}}
										/>
										<div
											style={{
												padding: '8px 24px',
												borderRadius: 12,
												background: token.colorSuccess,
												opacity: 1, // Highlight 'Good'
												height: 12,
												width: 40,
												boxShadow: `0 0 15px ${token.colorSuccess}`,
											}}
										/>
									</Flex>
								</Flex>

								<div
									style={{
										position: 'absolute',
										bottom: 24,
										right: 24,
										background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
										color: token.colorSuccess,
										padding: '6px 12px',
										borderRadius: 12,
										fontSize: 12,
										fontWeight: 700,
										boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
									}}
								>
									{t('mockupSRS')}
								</div>
							</div>

							{/* Floating Streak Element */}
							<motion.div
								animate={{ y: [0, -10, 0] }}
								transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
								style={{
									position: 'absolute',
									top: 20,
									right: -30,
									background: token.colorBgContainer,
									padding: '12px 20px',
									borderRadius: 16,
									boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
									zIndex: 2,
									border: `1px solid ${token.colorBorder}`,
								}}
							>
								<Flex gap="small" align="center">
									<span style={{ fontSize: 20 }}>🔥</span>
									<div>
										<div
											style={{
												fontSize: 10,
												color: token.colorTextSecondary,
												textTransform: 'uppercase',
												letterSpacing: 1,
											}}
										>
											{t('mockupStreak')}
										</div>
										<div style={{ fontWeight: 800, color: token.colorPrimary, fontSize: 16 }}>
											{t('mockupDays')}
										</div>
									</div>
								</Flex>
							</motion.div>
						</motion.div>
					</div>
				</Flex>
			</div>
		</section>
	);
}
