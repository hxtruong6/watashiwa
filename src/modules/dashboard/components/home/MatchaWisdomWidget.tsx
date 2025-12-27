'use client';

import { WisdomWordData, getMatchaWisdomWords } from '@/modules/dashboard/dashboard.actions';
import { SoundOutlined } from '@ant-design/icons';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Card, Typography, theme } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface AnimatedWordData extends WisdomWordData {
	xVal: number;
	yVal: number;
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

export default function MatchaWisdomWidget() {
	const { token } = useToken();
	const t = useTranslations('Dashboard');
	const [selectedWord, setSelectedWord] = useState<string | null>(null);
	const [words, setWords] = useState<AnimatedWordData[]>([]);
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
		if (typeof window !== 'undefined') {
			return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		}
		return false;
	});

	// Check for reduced motion preference
	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

		const handleChange = (e: MediaQueryListEvent) => {
			setPrefersReducedMotion(e.matches);
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			let data = await getMatchaWisdomWords(5);

			if (data.length === 0) {
				data = FALLBACK_WORDS;
			}

			// Map to animation props with better vertical distribution
			const animatedData: AnimatedWordData[] = data.map((word, index) => {
				// Create distinct vertical lanes to prevent overlap
				const laneHeight = 60;
				const laneCount = data.length;
				const laneSize = laneHeight / laneCount;
				const baseLane = 10 + index * laneSize;

				return {
					...word,
					xVal: Math.random() * 20,
					yVal: baseLane + Math.random() * laneSize * 0.5,
					duration: 25 + Math.random() * 10, // Slower: 25-35 seconds for calm zen flow
					delay: index * 5, // Increase stagger delay too
				};
			});

			setWords(animatedData);
		};

		fetchData();
	}, []);

	const handleWordClick = (word: AnimatedWordData) => {
		if (selectedWord === word.id) {
			setSelectedWord(null);
			return;
		}

		setSelectedWord(word.id);

		if ('speechSynthesis' in window) {
			const utterance = new SpeechSynthesisUtterance(word.kanji);
			utterance.lang = 'ja-JP';
			window.speechSynthesis.speak(utterance);
		}

		setTimeout(() => {
			setSelectedWord(null);
		}, 3000);
	};

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
			style={{ marginBottom: 24, position: 'relative' }}
		>
			<Card
				styles={{
					body: {
						padding: 0,
						height: 240,
						position: 'relative',
						overflow: 'hidden',
						background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorSuccessBg} 100%)`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					},
				}}
				style={{
					borderRadius: 24,
					border: 'none',
					boxShadow: `0 8px 32px ${token.colorSuccess}1A`,
				}}
			>
				{/* Lottie Background */}
				<div
					aria-hidden="true"
					style={{
						width: '100%',
						height: '80%',
						position: 'absolute',
						bottom: 0,
						opacity: 0.9,
						pointerEvents: 'none',
						zIndex: 1,
					}}
				>
					<DotLottieReact
						src="/assets/animations/MatchaTea.lottie"
						loop
						autoplay
						speed={0.5}
						style={{ width: '100%', height: '100%', objectFit: 'contain' }}
					/>
				</div>

				{/* Floating Words Layer - Inside Card for proper containment */}
				<div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
					{words.map((word, index) => {
						const isSelected = selectedWord === word.id;
						const isOtherSelected = selectedWord !== null && !isSelected;

						return (
							<motion.div
								key={word.id}
								role="button"
								tabIndex={0}
								aria-label={`View details for ${word.kanji}`}
								onKeyDown={(e) => handleKeyDown(e, word)}
								animate={
									prefersReducedMotion
										? {
												// Static/low-motion fallback: just show words in a grid
												x: 0,
												y: 0,
												opacity: isOtherSelected ? 0.3 : 1,
												scale: isSelected ? 1.15 : 1,
											}
										: isSelected
											? {
													scale: 1.15,
													opacity: 1,
												}
											: {
													// Use viewport width (vw) for reliable cross-screen animation
													// From slightly off left (-5vw) to full screen width (100vw)
													x: ['-5vw', '100vw'],
													y: [0, -10, 0, 10, 0],
													opacity: isOtherSelected ? 0.3 : [0, 1, 1, 0],
												}
								}
								transition={
									prefersReducedMotion
										? {
												duration: 0.2,
											}
										: isSelected
											? {
													type: 'spring',
													stiffness: 100,
													damping: 30,
													scale: { duration: 0.3 },
												}
											: {
													x: {
														duration: word.duration,
														repeat: Infinity,
														ease: 'linear',
														delay: word.delay,
														repeatType: 'loop',
													},
													y: {
														duration: 5,
														repeat: Infinity,
														ease: 'easeInOut',
														repeatType: 'loop',
													},
													opacity: isOtherSelected
														? { duration: 0.3 }
														: {
																duration: word.duration,
																times: [0, 0.15, 0.85, 1],
																repeat: Infinity,
																delay: word.delay,
																repeatType: 'loop',
															},
												}
								}
								style={{
									position: 'absolute',
									top: prefersReducedMotion
										? `${10 + (index % words.length) * 15}%`
										: `${word.yVal}%`,
									left: prefersReducedMotion ? `${10 + (index % 3) * 30}%` : 0,
									zIndex: isSelected ? 20 : 10,
									pointerEvents: 'auto',
									cursor: 'pointer',
								}}
								onClick={() => handleWordClick(word)}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<div
									style={{
										background: 'rgba(255, 255, 255, 0.9)',
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

				{/* Title */}
				<div style={{ position: 'absolute', bottom: 16, left: 24, zIndex: 0, opacity: 0.8 }}>
					<Text strong style={{ color: token.colorSuccess, fontSize: 11, letterSpacing: 1.5 }}>
						{t('matchaWisdom')}
					</Text>
				</div>
			</Card>
		</motion.div>
	);
}
