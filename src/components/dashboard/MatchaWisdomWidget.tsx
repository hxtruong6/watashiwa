'use client';

import React, { useState } from 'react';
import { Card, Typography, theme } from 'antd';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SoundOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { useToken } = theme;

interface WordData {
	id: string;
	kanji: string;
	reading: string;
	meaning: string;
	x: number; // Initial position %
	y: number; // Initial position %
	duration: number;
	delay: number;
}

// Wisdom Data (Mock for Ambient Learning)
const WISDOM_WORDS: WordData[] = [
	{
		id: '1',
		kanji: '木漏れ日',
		reading: 'Komorebi',
		meaning: 'Sunlight filtering through trees',
		x: 20,
		y: 30,
		duration: 8,
		delay: 0,
	},
	{
		id: '2',
		kanji: '浮世',
		reading: 'Ukiyo',
		meaning: 'The floating world',
		x: 70,
		y: 20,
		duration: 9,
		delay: 1,
	},
	{
		id: '3',
		kanji: '積ん読',
		reading: 'Tsundoku',
		meaning: 'Acquiring books but letting them pile up',
		x: 50,
		y: 60,
		duration: 7,
		delay: 2,
	},
];

export default function MatchaWisdomWidget() {
	const { token } = useToken();
	// const t = useTranslations('Dashboard.MatchaWisdom'); // We'll add keys later, fallback for now
	const [selectedWord, setSelectedWord] = useState<string | null>(null);

	const handleWordClick = (word: WordData) => {
		if (selectedWord === word.id) {
			setSelectedWord(null); // Deselect
			return;
		}

		setSelectedWord(word.id);

		// Simple Audio Synthesis
		if ('speechSynthesis' in window) {
			const utterance = new SpeechSynthesisUtterance(word.kanji);
			utterance.lang = 'ja-JP';
			window.speechSynthesis.speak(utterance);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
			style={{ marginBottom: 24 }}
		>
			<Card
				styles={{
					body: {
						padding: 0,
						// Responsive height: use simple query or safe default
						height: 240, // Reduced from 300 for better mobile fit. Ideally use responsive CSS class.
						position: 'relative',
						overflow: 'hidden',
						background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorSuccessBg} 100%)`,
						display: 'flex',
						alignItems: 'center', // This centers the Lottie vertically
						justifyContent: 'center',
					},
				}}
				style={{
					borderRadius: 24,
					border: 'none',
					boxShadow: `0 8px 32px ${token.colorSuccess}1A`,
				}}
			>
				{/* Lottie Background - Positioned at bottom to start steam effect from cup */}
				<div
					style={{
						width: '100%',
						height: '80%', // Lottie takes bottom 80% to leave top space for words
						position: 'absolute',
						bottom: 0,
						opacity: 0.9,
						zIndex: 1, // Base layer
					}}
				>
					<DotLottieReact
						src="/assets/animations/MatchaTea.lottie"
						loop
						autoplay
						style={{ width: '100%', height: '100%', objectFit: 'contain' }}
					/>
				</div>

				{/* Floating Words Layer - ABOVE Lottie visually */}
				<div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
					{WISDOM_WORDS.map((word) => {
						const isSelected = selectedWord === word.id;
						const isOtherSelected = selectedWord !== null && !isSelected;

						return (
							<motion.div
								key={word.id}
								// Floating Animation (Disabled if selected)
								animate={
									isSelected
										? { left: '50%', top: '40%', x: '-50%', y: '-50%', scale: 1.2, opacity: 1 } // Center selection
										: {
												left: ['-10%', '110%'], // Move across PARENT width
												y: [0, -10, 0, 10, 0],
												opacity: isOtherSelected ? 0.2 : [0, 1, 1, 0],
											}
								}
								transition={
									isSelected
										? { type: 'spring', stiffness: 300, damping: 20 }
										: {
												left: {
													duration: word.duration * 1.5,
													repeat: Infinity,
													ease: 'linear',
													delay: word.delay,
												},
												y: {
													duration: 4,
													repeat: Infinity,
													ease: 'easeInOut',
												},
												opacity: isOtherSelected
													? { duration: 0.3 }
													: {
															duration: word.duration * 1.5,
															times: [0, 0.1, 0.9, 1],
															repeat: Infinity,
															delay: word.delay,
														},
											}
								}
								style={{
									position: 'absolute',
									top: `${word.y}%`, // Use Y from data (should be 5-40% for "Above" tea)
									zIndex: isSelected ? 20 : 10,
									cursor: 'pointer',
								}}
								onClick={() => handleWordClick(word)}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<div
									style={{
										background: 'rgba(255, 255, 255, 0.85)', // More opaque for readability
										backdropFilter: 'blur(8px)',
										padding: '8px 16px',
										borderRadius: 20,
										boxShadow: `0 4px 12px rgba(0,0,0,0.1)`,
										border: `1px solid rgba(255,255,255,0.9)`,
										textAlign: 'center',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										whiteSpace: 'nowrap', // Prevent text wrapping
									}}
								>
									<Text
										strong
										style={{
											fontSize: 16,
											color: token.colorText,
											fontFamily: "'Noto Sans JP', sans-serif",
										}}
									>
										{word.kanji}
									</Text>

									{/* Revealed Info */}
									<AnimatePresence>
										{isSelected && (
											<motion.div
												initial={{ opacity: 0, height: 0, width: 0 }}
												animate={{ opacity: 1, height: 'auto', width: 'auto' }}
												exit={{ opacity: 0, height: 0, width: 0 }}
												style={{ overflow: 'hidden' }}
											>
												<div
													style={{
														marginTop: 4,
														display: 'flex',
														flexDirection: 'column',
														alignItems: 'center',
														gap: 2,
														minWidth: 100, // Ensure nice width when expanded
													}}
												>
													<Text type="secondary" style={{ fontSize: 12 }}>
														{word.reading}
													</Text>
													<Text
														style={{ fontSize: 13, color: token.colorPrimary, fontWeight: 500 }}
													>
														{word.meaning}
													</Text>
													<SoundOutlined style={{ marginTop: 4, color: token.colorSuccess }} />
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							</motion.div>
						);
					})}
				</div>

				{/* Title / Instruction (Quietly in the corner) */}
				<div style={{ position: 'absolute', bottom: 16, left: 24, zIndex: 0, opacity: 0.8 }}>
					<Text strong style={{ color: token.colorSuccess, fontSize: 12, letterSpacing: 1 }}>
						MATCHA WISDOM
					</Text>
				</div>
			</Card>
		</motion.div>
	);
}
