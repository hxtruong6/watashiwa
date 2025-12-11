'use client';

import React from 'react';
import { Button, Typography, Flex } from 'antd';
import { motion } from 'framer-motion';
import { RocketOutlined, RightOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function HeroSection() {
	return (
		<section
			style={{
				minHeight: '80vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '60px 24px',
				background: 'linear-gradient(135deg, #F9F7F2 0%, #E8EBF2 100%)',
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			<Flex
				vertical
				align="center"
				justify="center"
				style={{ maxWidth: 800, textAlign: 'center', zIndex: 2 }}
			>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					<Title
						level={1}
						style={{
							fontSize: 'clamp(32px, 5vw, 64px)',
							fontWeight: 700,
							color: '#1E3A5F',
							marginBottom: 24,
						}}
					>
						Master Japanese with <br />
						<span style={{ color: '#708238' }}>Zen Focus</span>
					</Title>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
				>
					<Paragraph
						style={{
							fontSize: 'clamp(16px, 1.2vw, 20px)',
							color: '#555',
							marginBottom: 40,
							maxWidth: 600,
						}}
					>
						A distraction-free Flashcard (SRS) platform designed for serious learners. Optimize your
						study time with our smart algorithm and clean interface.
					</Paragraph>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.4 }}
				>
					<Flex gap="middle" wrap="wrap" justify="center">
						<Link href="/login">
							<Button
								type="primary"
								size="large"
								icon={<RocketOutlined />}
								style={{
									height: 56,
									padding: '0 32px',
									fontSize: 18,
									borderRadius: 28,
									background: '#1E3A5F',
								}}
							>
								Start Learning
							</Button>
						</Link>
						<Link href="#features">
							<Button
								size="large"
								icon={<RightOutlined />}
								style={{
									height: 56,
									padding: '0 32px',
									fontSize: 18,
									borderRadius: 28,
								}}
							>
								Explore Features
							</Button>
						</Link>
					</Flex>
				</motion.div>
			</Flex>

			{/* Decorative Elements */}
			<motion.div
				style={{
					position: 'absolute',
					top: '10%',
					right: '5%',
					fontSize: '12rem',
					opacity: 0.05,
					color: '#1E3A5F',
					zIndex: 1,
					pointerEvents: 'none',
				}}
				initial={{ rotate: -10 }}
				animate={{ rotate: 10 }}
				transition={{ repeat: Infinity, duration: 10, repeatType: 'reverse' }}
			>
				学
			</motion.div>
			<motion.div
				style={{
					position: 'absolute',
					bottom: '15%',
					left: '5%',
					fontSize: '10rem',
					opacity: 0.05,
					color: '#708238',
					zIndex: 1,
					pointerEvents: 'none',
				}}
				initial={{ rotate: 10 }}
				animate={{ rotate: -10 }}
				transition={{ repeat: Infinity, duration: 12, repeatType: 'reverse' }}
			>
				夢
			</motion.div>
		</section>
	);
}
