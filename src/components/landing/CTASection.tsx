'use client';

import React from 'react';
import { Button, Typography } from 'antd';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { useTranslations } from 'next-intl';

const { Title, Paragraph } = Typography;

export default function CTASection() {
	const t = useTranslations('Landing');

	return (
		<section
			style={{
				padding: '120px 0',
				background: '#1E3A5F',
				textAlign: 'center',
				color: '#fff',
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			{/* Decorative Circles */}
			<div
				style={{
					position: 'absolute',
					top: -100,
					left: -100,
					width: 400,
					height: 400,
					background: 'rgba(255,255,255,0.03)',
					borderRadius: '50%',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					bottom: -50,
					right: -50,
					width: 300,
					height: 300,
					background: 'rgba(255,255,255,0.03)',
					borderRadius: '50%',
				}}
			/>

			<div
				style={{
					maxWidth: 880,
					margin: '0 auto',
					padding: '0 24px',
					position: 'relative',
					zIndex: 10,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}
			>
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
				>
					<Title
						level={2}
						style={{ color: '#fff', marginBottom: 24, fontSize: 'clamp(32px, 4vw, 48px)' }}
					>
						{t('ctaTitle')}
					</Title>
					<Paragraph
						style={{
							color: 'rgba(255,255,255,0.8)',
							fontSize: 20,
							marginBottom: 48,
							maxWidth: 600,
						}}
					>
						{t('ctaSubtitle')}
					</Paragraph>

					<Link href="/login">
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button
								type="primary"
								size="large"
								style={{
									height: 64,
									padding: '0 48px',
									fontSize: 20,
									borderRadius: 32,
									background: '#708238', // Zen Green
									border: 'none',
									boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
								}}
							>
								{t('ctaButton')}
							</Button>
						</motion.div>
					</Link>
				</motion.div>
			</div>
		</section>
	);
}
