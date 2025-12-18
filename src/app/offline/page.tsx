'use client';

import { ReloadOutlined, WifiOutlined } from '@ant-design/icons';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Button, Flex, Typography, message, theme } from 'antd';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

const { Title, Text } = Typography;
const { useToken } = theme;

export default function OfflinePage() {
	const { token } = useToken();
	const [isChecking, setIsChecking] = useState(false);

	// Safe translation fallback
	const tOffline = useTranslations('Offline');
	const tCommon = useTranslations('Common');

	// 1. Smart Recovery: Auto-detect when internet comes back
	useEffect(() => {
		const handleOnline = () => {
			message.success(tOffline('reconnectSuccess'));
			setTimeout(() => {
				window.location.reload();
			}, 1000);
		};

		const handleOffline = () => {
			// Optional: Show a toast?
		};

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, [tOffline]);

	const handleRetry = () => {
		setIsChecking(true);
		// Simulate check (visual feedback)
		setTimeout(() => {
			window.location.reload();
		}, 800);
	};

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: '100vh',
				backgroundColor: token.colorBgLayout,
				padding: 24,
				textAlign: 'center',
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			{/* 2. Zen Visuals: Animated Breathing Background */}
			<motion.div
				animate={{
					scale: [1, 1.2, 1],
					opacity: [0.3, 0.1, 0.3],
				}}
				transition={{
					duration: 4,
					repeat: Infinity,
					ease: 'easeInOut',
				}}
				style={{
					position: 'absolute',
					width: '60vw',
					height: '60vw',
					borderRadius: '50%',
					background: token.colorPrimary,
					filter: 'blur(80px)',
					zIndex: 0,
				}}
			/>

			{/* Main Content Card */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
				style={{ zIndex: 1, maxWidth: 400, width: '100%' }}
			>
				<Flex vertical align="center" gap="large">
					{/* 3. Lottie Cat Animation */}
					<div style={{ width: 280, height: 280, position: 'relative' }}>
						<DotLottieReact
							src="/assets/animations/LoaderCat.lottie"
							loop
							autoplay
							style={{ width: '100%', height: '100%' }}
						/>
					</div>

					<Flex vertical gap="small">
						<Title level={2} style={{ margin: 0, color: token.colorTextHeading }}>
							{tOffline('title')}
						</Title>
						<Text type="secondary" style={{ fontSize: 16 }}>
							{tOffline('subtitle')}
						</Text>
						<Text type="secondary">{tOffline('desc')}</Text>
					</Flex>

					<Button
						type="primary"
						icon={isChecking ? <WifiOutlined spin /> : <ReloadOutlined />}
						size="large"
						onClick={handleRetry}
						loading={isChecking}
						style={{
							marginTop: 16,
							height: 48, // Mobile First Touch Target
							borderRadius: 24,
							paddingLeft: 32,
							paddingRight: 32,
							boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
						}}
					>
						{tOffline('retry') || tCommon('retry')}
					</Button>
				</Flex>
			</motion.div>
		</div>
	);
}
