'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, theme } from 'antd';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SoundOutlined } from '@ant-design/icons';
import { getMatchaWisdomWords, WisdomWordData } from '@/services/dashboard-actions';
import { useTranslations } from 'next-intl';

const { Text } = Typography;
const { useToken } = theme;

interface AnimatedWordData extends WisdomWordData {
	xVal: number; // Animation prop X
	yVal: number; // Animation prop Y
	duration: number;
	delay: number;
}

// Fallback data for new users or loading
const FALLBACK_WORDS: WisdomWordData[] = [
	{
		id: 'demo-1',
		kanji: '木漏れ日',
		reading: 'Komorebi',
		meaning: 'Sunlight filtering through trees',
		hanViet: 'MỘC LẬU NHẬT',
	},
	{
		id: 'demo-2',
		kanji: '浮世',
		reading: 'Ukiyo',
		meaning: 'The floating world',
		hanViet: 'PHÙ THẾ',
	},
	{
		id: 'demo-3',
		kanji: '積ん読',
		reading: 'Tsundoku',
		meaning: 'Acquiring books but letting them pile up',
		hanViet: 'TÍCH ĐỘC',
	},
];

// ... imports remain same

export default function MatchaWisdomWidget() {
	const { token } = useToken();
	const t = useTranslations('Dashboard');
	const [selectedWord, setSelectedWord] = useState<string | null>(null);
	const [words, setWords] = useState<AnimatedWordData[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			let data = await getMatchaWisdomWords(5);

			if (data.length === 0) {
				data = FALLBACK_WORDS;
			}

			// Map to animation props
			const animatedData: AnimatedWordData[] = data.map((word, index) => ({
				...word,
				// Randomize start positions slightly to avoid monotonous stacking
				// We still use the CSS transform for main movement, but these can seed the randomness
				xVal: Math.random() * 20,
				yVal: Math.random() * 30, // 0-30%
				duration: 8 + Math.random() * 4, // 8-12s duration
				delay: index * 4, // Stagger them out nicely
			}));

			setWords(animatedData);
		};

		fetchData();
	}, []);

	const handleWordClick = (word: AnimatedWordData) => {
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

	// Keyboard handler for A11y
	const handleKeyDown = (e: React.KeyboardEvent, word: AnimatedWordData) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleWordClick(word);
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
					aria-hidden="true"
					style={{
						width: '100%',
						height: '80%', // Lottie takes bottom 80% to leave top space for words
						position: 'absolute',
						bottom: 0,
						opacity: 0.9,
						pointerEvents: 'none', // Allow clicks to pass through to words if needed, though they are above
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

				{/* Floating Words Layer - Explicitly ABOVE Lottie (z-index 10) */}
				<div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
					{words.map((word) => {
						const isSelected = selectedWord === word.id;
						const isOtherSelected = selectedWord !== null && !isSelected;

						return (
							<motion.div
								key={word.id}
								role="button"
								tabIndex={0}
								aria-label={`View details for ${word.kanji}`}
								onKeyDown={(e) => handleKeyDown(e, word)}
								// Use transform (x/y) for GPU-accelerated smooth animation
								animate={
									isSelected
										? {
												x: '-50%',
												y: '-50%',
												left: '50%',
												top: '40%',
												scale: 1.2,
												opacity: 1,
											}
										: {
												// Move from off-screen left (-50px) to off-screen right (calc(100% + 50px))
												// We use Viewport width percentages (vw) or just percentages of parent
												x: ['-20%', '120%'],
												y: [0, -15, 0, 15, 0], // Bobbing effect
												opacity: isOtherSelected ? 0.2 : [0, 1, 1, 0], // Fade in/out at edges
											}
								}
								transition={
									isSelected
										? { type: 'spring', stiffness: 300, damping: 20 }
										: {
												x: {
													duration: word.duration * 2, // Slower for smoother "zen" feel
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
															duration: word.duration * 2,
															times: [0, 0.1, 0.9, 1],
															repeat: Infinity,
															delay: word.delay,
														},
											}
								}
								style={{
									position: 'absolute',
									top: `${20 + (word.yVal % 30)}%`, // Constrain Y to 20-50% range (Top half)
									left: 0, // Base left, moved by x-transform
									zIndex: isSelected ? 20 : 10,
									pointerEvents: 'auto', // Re-enable clicks
									cursor: 'pointer',
								}}
								onClick={() => handleWordClick(word)}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<div
									style={{
										background: 'rgba(255, 255, 255, 0.9)', // Higher opacity
										backdropFilter: 'blur(12px)',
										padding: '6px 14px',
										borderRadius: 20,
										boxShadow: `0 4px 12px rgba(0,0,0,0.08)`,
										border: `1px solid rgba(255,255,255,1)`,
										textAlign: 'center',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										whiteSpace: 'nowrap',
									}}
								>
									{/* Always show Kanji + Reading for "Ambient Learning" */}
									<div
										style={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											lineHeight: 1.1,
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
										<Text type="secondary" style={{ fontSize: 10, marginTop: 0 }}>
											{word.reading}
										</Text>
									</div>

									{/* Revealed Meaning */}
									<AnimatePresence>
										{isSelected && (
											<motion.div
												aria-live="polite"
												initial={{ opacity: 0, height: 0, width: 0 }}
												animate={{ opacity: 1, height: 'auto', width: 'auto' }}
												exit={{ opacity: 0, height: 0, width: 0 }}
												style={{ overflow: 'hidden' }}
											>
												<div
													style={{
														marginTop: 6,
														paddingTop: 6,
														borderTop: `1px dashed ${token.colorSuccess}`,
														display: 'flex',
														flexDirection: 'column',
														alignItems: 'center',
														gap: 2,
														minWidth: 120,
													}}
												>
													<Text
														style={{
															fontSize: 13,
															color: token.colorPrimary,
															fontWeight: 500,
															whiteSpace: 'normal',
															textAlign: 'center',
														}}
													>
														{word.meaning}
													</Text>
													{word.hanViet && (
														<Text type="secondary" style={{ fontSize: 11, letterSpacing: 1 }}>
															{word.hanViet}
														</Text>
													)}
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
					<Text strong style={{ color: token.colorSuccess, fontSize: 11, letterSpacing: 1.5 }}>
						{t('matchaWisdom')}
					</Text>
				</div>
			</Card>
		</motion.div>
	);
}
