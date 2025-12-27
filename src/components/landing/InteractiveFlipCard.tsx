'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Flex, Typography, theme } from 'antd';
import { motion } from 'framer-motion';
import React, { useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface FlipCardProps {
	frontKanji: string;
	frontTag?: string;
	backAnimationSrc: string;
	backKanji: string; // 美味しい
	backFurigana: string; // おいしい
	backRomaji: string; // Oishii
	backMeaning: string; // Ngon
	backExample: string;
	backExampleTrans: string;
	streakLabel?: string;
	streakValue?: string;
	maxWidth?: string | number;
	tapHint?: string;
}

export default function InteractiveFlipCard({
	frontKanji,
	frontTag,
	backAnimationSrc,
	backKanji,
	backFurigana,
	backRomaji,
	backMeaning,
	backExample,
	backExampleTrans,
	streakLabel,
	streakValue,
	maxWidth = 'min(340px, 85vw)',
	tapHint = 'Tap to reveal',
}: FlipCardProps) {
	const { token } = useToken();
	const [isFlipped, setIsFlipped] = useState(false);
	const [hasInteracted, setHasInteracted] = useState(false);

	// Quick check for dark mode based on background token
	const isDark = token.colorBgBase === '#151F32';

	React.useEffect(() => {
		if (hasInteracted) return;

		let timeoutId: NodeJS.Timeout;

		const runCycle = () => {
			// Initially Front (false). Wait 2s to flip to Back (true).
			timeoutId = setTimeout(() => {
				setIsFlipped(true); // Flip to Back

				// Wait 4s on Back, then flip to Front (false)
				timeoutId = setTimeout(() => {
					setIsFlipped(false); // Flip to Front
					runCycle();
				}, 4000);
			}, 2000);
		};

		runCycle();

		return () => clearTimeout(timeoutId);
	}, [hasInteracted]);

	const handleFlip = () => {
		setHasInteracted(true); // Stop auto-flip on interaction
		setIsFlipped(!isFlipped);
	};

	// Detailed styling for consistent height/box model
	const cardFaceStyle: React.CSSProperties = {
		position: 'absolute',
		width: '100%',
		height: '100%',
		backfaceVisibility: 'hidden',
		WebkitBackfaceVisibility: 'hidden',
		borderRadius: '32px',
		padding: '24px', // Standardized padding
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.15)',
		border: `1px solid ${token.colorBorder}`,
		boxSizing: 'border-box', // Ensure padding doesn't affect dimensions
		background: token.colorBgContainer, // Default
	};

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				position: 'relative',
				perspective: '1000px', // Crucial for 3D flip
				zIndex: 20, // Ensure it's above background hits
			}}
		>
			<motion.div
				initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
				animate={{ opacity: 1, scale: 1, rotate: 0 }}
				transition={{
					type: 'spring',
					stiffness: 60,
					damping: 15,
					delay: 0.2,
				}}
				style={{ position: 'relative', width: '100%', maxWidth }}
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

				{/* Card Container for 3D Transform */}
				<motion.div
					style={{
						width: '100%',
						aspectRatio: '360/520', // Slightly taller for study content
						position: 'relative',
						transformStyle: 'preserve-3d',
						cursor: 'pointer',
					}}
					animate={{ rotateY: isFlipped ? 180 : 0 }}
					transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
					onClick={handleFlip}
				>
					{/* Front Side */}
					<div
						style={{
							...cardFaceStyle,
							background: isDark
								? 'rgba(21, 31, 50, 0.7)' // Dark glass
								: 'rgba(255, 255, 255, 0.65)', // Light glass
							backdropFilter: 'blur(24px)',
							border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255, 255, 255, 0.9)'}`,
						}}
					>
						{/* Mock UI Content - Top Bar */}
						<Flex
							justify="space-between"
							align="center"
							style={{ width: '100%', marginBottom: 'auto' }}
						>
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

						{/* Main Front Content */}
						<Flex vertical gap="large" align="center" style={{ marginBottom: 'auto' }}>
							<Text
								style={{
									fontSize: 'clamp(56px, 15vw, 100px)', // Responsive Font Size
									lineHeight: 1,
									fontWeight: 'bold',
									color: token.colorText,
									textAlign: 'center',
								}}
							>
								{frontKanji}
							</Text>

							{/* Hint to tap */}
							<Text type="secondary" style={{ fontSize: 14, opacity: 0.7 }}>
								{tapHint}
							</Text>
						</Flex>

						{/* Footer area */}
						<div style={{ width: '100%', marginTop: 'auto' }}>
							{/* Difficulty Buttons Mockup */}
							<Flex gap="small" justify="center" style={{ marginBottom: 24 }}>
								<div
									style={{
										padding: '6px 16px',
										borderRadius: 12,
										background: token.colorError,
										opacity: 0.1,
										height: 10,
										width: 32,
									}}
								/>
								<div
									style={{
										padding: '6px 16px',
										borderRadius: 12,
										background: token.colorWarning,
										opacity: 0.1,
										height: 10,
										width: 32,
									}}
								/>
								<div
									style={{
										padding: '6px 16px',
										borderRadius: 12,
										background: token.colorSuccess,
										opacity: 0.1,
										height: 10,
										width: 32,
									}}
								/>
							</Flex>

							{frontTag && (
								<Flex justify="flex-end">
									<div
										style={{
											background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
											color: token.colorSuccess,
											padding: '6px 12px',
											borderRadius: 12,
											fontSize: 12,
											fontWeight: 700,
											boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
										}}
									>
										{frontTag}
									</div>
								</Flex>
							)}
						</div>
					</div>

					{/* Back Side (Study Layout) */}
					<div
						style={{
							...cardFaceStyle, // Inherit same dimensions/padding
							background: token.colorBgContainer,
							transform: 'rotateY(180deg)',
							justifyContent: 'flex-start', // Align top
							padding: '32px 24px',
						}}
					>
						{/* Top: Animation (Context) */}
						<DotLottieReact
							src={backAnimationSrc}
							loop
							autoplay
							style={{ width: 'auto', height: '120px', marginBottom: 16 }}
						/>

						{/* Detail Block */}
						<Flex vertical align="center" gap={4} style={{ width: '100%' }}>
							{/* Reading (Furigana) */}
							<Text type="secondary" style={{ fontSize: 16 }}>
								{backFurigana}
							</Text>

							{/* Kanji */}
							<Text
								style={{
									fontSize: 32,
									fontWeight: 800,
									color: token.colorPrimary,
									lineHeight: 1.2,
								}}
							>
								{backKanji}
							</Text>

							{/* Romaji */}
							<Text type="secondary" style={{ fontSize: 14, fontStyle: 'italic', marginBottom: 8 }}>
								{backRomaji}
							</Text>

							<div
								style={{
									width: 40,
									height: 4,
									borderRadius: 2,
									background: token.colorBorder,
									marginBottom: 12,
								}}
							/>

							{/* Meaning */}
							<Text
								style={{
									fontSize: 24,
									fontWeight: 700,
									color: token.colorText,
									marginBottom: 16,
								}}
							>
								{backMeaning}
							</Text>

							{/* Example Sentence */}
							<div
								style={{
									background: 'rgba(0,0,0,0.03)',
									padding: '12px',
									borderRadius: 12,
									width: '100%',
									textAlign: 'center',
								}}
							>
								<Text style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
									{backExample}
								</Text>
								<Text type="secondary" style={{ fontSize: 12 }}>
									{backExampleTrans}
								</Text>
							</div>
						</Flex>
					</div>
				</motion.div>

				{/* Floating Streak Element */}
				{(streakLabel || streakValue) && (
					<motion.div
						animate={{ y: [0, -10, 0] }}
						transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
						style={{
							position: 'absolute',
							top: 30,
							right: -15,
							background: token.colorBgContainer,
							padding: '12px 20px',
							borderRadius: 16,
							boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
							zIndex: 30, // Above card
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
									{streakLabel || 'Streak'}
								</div>
								<div style={{ fontWeight: 800, color: token.colorPrimary, fontSize: 16 }}>
									{streakValue || '0 Days'}
								</div>
							</div>
						</Flex>
					</motion.div>
				)}
			</motion.div>
		</div>
	);
}
