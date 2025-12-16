'use client';

import React from 'react';
import { Button, Typography, theme, Grid } from 'antd';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { useTranslations } from 'next-intl';

const { Title, Paragraph } = Typography;
const { useToken } = theme;

export default function CTASection() {
	const { token } = useToken();
	const t = useTranslations('Landing');
	const { md } = Grid.useBreakpoint();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	// Default to mobile (false) during SSR to avoid hydration mismatch
	const isDesktop = mounted && md;

	return (
		<section
			style={{
				padding: isDesktop ? '72px 0' : '100px 0',
				background: token.colorPrimary,
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
					top: isDesktop ? -50 : -20,
					left: isDesktop ? -50 : -20,
					width: 'clamp(150px, 30vw, 400px)',
					height: 'clamp(150px, 30vw, 400px)',
					background: 'rgba(255,255,255,0.03)',
					borderRadius: '50%',
					pointerEvents: 'none',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					bottom: isDesktop ? -25 : -15,
					right: isDesktop ? -25 : -15,
					width: 'clamp(120px, 20vw, 300px)',
					height: 'clamp(120px, 20vw, 300px)',
					background: 'rgba(255,255,255,0.03)',
					borderRadius: '50%',
					pointerEvents: 'none',
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
						style={{ color: '#fff', marginBottom: 24, fontSize: 'clamp(28px, 5vw, 48px)' }}
					>
						{t('ctaTitle')}
					</Title>
					<Paragraph
						style={{
							color: 'rgba(255,255,255,0.8)',
							fontSize: isDesktop ? 20 : 16,
							marginBottom: isDesktop ? 48 : 32,
							maxWidth: 600,
						}}
					>
						{t('ctaSubtitle')}
					</Paragraph>

					<Link href="/login" style={{ display: 'inline-block' }}>
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button
								type="primary"
								size="large"
								style={{
									height: isDesktop ? 64 : 56,
									padding: isDesktop ? '0 48px' : '0 32px',
									fontSize: isDesktop ? 20 : 18,
									borderRadius: 32,
									background: token.colorSuccess, // Zen Green
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
