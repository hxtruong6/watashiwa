'use client';

import React from 'react';
import { Button, Typography, Flex, Badge } from 'antd';
import { motion } from 'framer-motion';
import { RocketOutlined, RightOutlined, CheckCircleFilled } from '@ant-design/icons';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
const { Title, Paragraph, Text } = Typography;

export default function HeroSection() {
	// Hook for translations
	const t = useTranslations('Landing');

	return (
		<section
			style={{
				minHeight: '90vh',
				position: 'relative',
				overflow: 'hidden',
				background: '#F9F7F2',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center', // Fix: Center content horizontally
			}}
		>
			{/* Ambient Background Elements */}
			<div
				style={{
					position: 'absolute',
					top: '-20%',
					right: '-10%',
					width: '60vw',
					height: '60vw',
					background:
						'radial-gradient(circle, rgba(112, 130, 56, 0.15) 0%, rgba(255,255,255,0) 70%)',
					filter: 'blur(60px)',
					borderRadius: '50%',
					zIndex: 0,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					bottom: '-10%',
					left: '-10%',
					width: '50vw',
					height: '50vw',
					background: 'radial-gradient(circle, rgba(30, 58, 95, 0.1) 0%, rgba(255,255,255,0) 70%)',
					filter: 'blur(60px)',
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
				<div style={{ display: 'none' }}>
					{/* Spacer for potential navbar overlap if needed, though strictly not required with minHeight 90vh flex center */}
				</div>
				<Flex vertical align="center">
					<Flex
						vertical={false}
						wrap="wrap"
						justify="center"
						align="center"
						style={{ width: '100%' }}
					>
						{/* Left Content */}
						<div
							style={{
								flex: '1 1 500px', // Flex basis 500px, grow and shrink
								marginBottom: 48,
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'flex-start',
								textAlign: 'left',
							}}
						>
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, ease: 'easeOut' }}
								style={{ width: '100%' }}
							>
								<div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
									<Badge
										count={t('badge')}
										style={{ backgroundColor: '#708238', color: '#fff', marginBottom: 16 }}
									/>
								</div>

								<Title
									level={1}
									style={{
										fontSize: 'clamp(32px, 5vw, 72px)',
										fontWeight: 800,
										color: '#1E3A5F',
										lineHeight: 1.1,
										marginTop: 16,
										marginBottom: 24,
										letterSpacing: '-0.02em',
										textAlign: 'left',
									}}
								>
									{t('heroTitle')} <br />
									<span
										style={{
											background: 'linear-gradient(120deg, #708238 0%, #A3B18A 100%)',
											WebkitBackgroundClip: 'text',
											WebkitTextFillColor: 'transparent',
										}}
									>
										{t('heroTitleAccent')}
									</span>
								</Title>

								<Paragraph
									style={{
										fontSize: '1.25rem',
										color: '#555',
										marginBottom: 40,
										maxWidth: '90%',
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
									<Link href="/login" style={{ width: 'auto' }}>
										<motion.div
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											style={{ width: '100%' }}
										>
											<Button
												type="primary"
												size="large"
												icon={<RocketOutlined />}
												style={{
													height: 60,
													padding: '0 40px',
													fontSize: 18,
													borderRadius: 16,
													background: '#1E3A5F',
													boxShadow: '0 10px 30px rgba(30, 58, 95, 0.3)',
													border: 'none',
													width: '100%',
												}}
											>
												{t('startLearning')}
											</Button>
										</motion.div>
									</Link>
									<Link href="#features" style={{ width: 'auto' }}>
										<motion.div
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											style={{ width: '100%' }}
										>
											<Button
												size="large"
												icon={<RightOutlined />}
												style={{
													height: 60,
													padding: '0 32px',
													fontSize: 18,
													borderRadius: 16,
													background: 'white',
													border: '1px solid #E0E0E0',
													color: '#555',
													width: '100%',
												}}
											>
												{t('exploreFeatures')}
											</Button>
										</motion.div>
									</Link>
								</div>

								<Flex gap="middle" wrap="wrap" style={{ marginTop: 40 }} justify="flex-start">
									<Flex gap="small" align="center">
										<CheckCircleFilled style={{ color: '#708238' }} />
										<Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
											{t('freePlan')}
										</Text>
									</Flex>
									<Flex gap="small" align="center">
										<CheckCircleFilled style={{ color: '#708238' }} />
										<Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
											{t('noAds')}
										</Text>
									</Flex>
									<Flex gap="small" align="center">
										<CheckCircleFilled style={{ color: '#708238' }} />
										<Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
											{t('openSource')}
										</Text>
									</Flex>
								</Flex>
							</motion.div>
						</div>

						{/* Right Visual */}
						<div
							style={{
								flex: '1 1 500px', // Flex basis 500px
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<motion.div
								initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
								animate={{ opacity: 1, scale: 1, rotate: 0 }}
								transition={{ duration: 1, delay: 0.2 }}
								style={{ position: 'relative', width: '100%', maxWidth: 500 }}
							>
								{/* Decorative backdrop blob */}
								<div
									style={{
										position: 'absolute',
										top: '10%',
										left: '10%',
										right: '10%',
										bottom: '10%',
										background: 'linear-gradient(135deg, #E8EBF2 0%, #F9F7F2 100%)',
										borderRadius: '40px',
										transform: 'rotate(-6deg)',
										zIndex: 0,
									}}
								/>

								{/* Glassmorphic Card Mockup */}
								<div
									style={{
										position: 'relative',
										background: 'rgba(255, 255, 255, 0.7)',
										backdropFilter: 'blur(20px)',
										border: '1px solid rgba(255, 255, 255, 0.8)',
										boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
										borderRadius: '24px',
										padding: '40px',
										zIndex: 1,
										transform: 'rotate(0deg)',
										transition: 'transform 0.3s ease',
									}}
								>
									{/* Mock UI Content */}
									<Flex justify="space-between" align="center" style={{ marginBottom: 30 }}>
										<div
											style={{
												width: 40,
												height: 40,
												borderRadius: 10,
												background: '#1E3A5F',
											}}
										/>
										<div
											style={{
												width: 120,
												height: 10,
												borderRadius: 5,
												background: '#E0E0E0',
											}}
										/>
									</Flex>

									<Flex vertical gap="middle" align="center" style={{ padding: '40px 0' }}>
										<Text style={{ fontSize: 80, fontWeight: 'bold', color: '#2D2D2D' }}>猫</Text>
										<Text style={{ fontSize: 24, color: '#666' }}>Neko (Cat)</Text>

										<Flex gap="small" style={{ marginTop: 20 }}>
											<div
												style={{
													width: 60,
													height: 8,
													borderRadius: 4,
													background: '#FF4D4F',
												}}
											/>
											<div
												style={{
													width: 60,
													height: 8,
													borderRadius: 4,
													background: '#FAAD14',
												}}
											/>
											<div
												style={{
													width: 60,
													height: 8,
													borderRadius: 4,
													background: '#52C41A',
												}}
											/>
										</Flex>
									</Flex>

									<div
										style={{
											position: 'absolute',
											bottom: 20,
											right: 20,
											background: '#708238',
											color: 'white',
											padding: '8px 16px',
											borderRadius: 20,
											fontSize: 12,
											fontWeight: 600,
										}}
									>
										SRS Active
									</div>
								</div>

								{/* Floating Elements */}
								<motion.div
									animate={{ y: [0, -15, 0] }}
									transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
									style={{
										position: 'absolute',
										top: -20,
										right: 20,
										background: 'white',
										padding: '16px 24px',
										borderRadius: 16,
										boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
										zIndex: 2,
									}}
								>
									<Flex gap="small" align="center">
										<span style={{ fontSize: 24 }}>🔥</span>
										<div>
											<div style={{ fontSize: 12, color: '#888' }}>Streak</div>
											<div style={{ fontWeight: 'bold', color: '#1E3A5F' }}>12 Days</div>
										</div>
									</Flex>
								</motion.div>
							</motion.div>
						</div>
					</Flex>
				</Flex>
			</div>
		</section>
	);
}
