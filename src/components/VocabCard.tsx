'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, Typography, Tag, Divider, Flex, Button } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import KanjiBreakdown from './KanjiBreakdown';

const { Title, Text, Paragraph } = Typography;

// Temporary interface until we import full generated types
interface VocabCardProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	card: any; // We will type this properly with Prisma types later
	showAnswer: boolean;
	showFurigana?: boolean;
	showRomaji?: boolean;
	autoPlayAudio?: boolean;
}

export default function VocabCard({
	card,
	showAnswer,
	showFurigana = true,
	showRomaji = false,
	autoPlayAudio = false,
}: VocabCardProps) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);

	const {
		kanji,
		reading,
		meaning,
		exampleSentence,
		exampleMeaning,
		partsOfSpeech,
		audioUrl,
		romaji,
		kanjiBreakdown,
		hanViet,
		wordParts,
	} = card?.vocab || {};

	// Auto-play logic
	useEffect(() => {
		if (autoPlayAudio && audioUrl && audioRef.current) {
			// Small delay to ensure smooth transition
			const timer = setTimeout(() => {
				audioRef.current
					?.play()
					.then(() => setIsPlaying(true))
					.catch((err) => console.error('Auto-play failed:', err));
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [card?.vocab?.id, autoPlayAudio, audioUrl]);

	// If no card, show loading or empty state
	if (!card || !card.vocab) return null;

	// Handle Audio Playback
	const toggleAudio = (e?: React.MouseEvent) => {
		e?.stopPropagation(); // Prevent card flip if clicking button
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				// Stop other audios if needed (requires global state, skipping for now)
				audioRef.current.currentTime = 0;
				audioRef.current.play().catch((err) => console.error('Audio play failed:', err));
			}
			setIsPlaying(!isPlaying);
		}
	};

	// Reset play state when audio ends
	const onAudioEnded = () => {
		setIsPlaying(false);
	};

	return (
		<div style={{ perspective: 1000, width: '100%', maxWidth: 600, margin: '0 auto' }}>
			{/* Hidden Audio Element */}
			{audioUrl && (
				<audio
					ref={audioRef}
					src={audioUrl}
					preload="none"
					onEnded={onAudioEnded}
					onPause={() => setIsPlaying(false)}
					onPlay={() => setIsPlaying(true)}
					onLoadStart={() => setIsPlaying(false)}
				/>
			)}

			{/* Floating Audio Button */}
			{audioUrl && (
				<Button
					type="text"
					shape="circle"
					icon={
						isPlaying ? (
							<PauseCircleOutlined style={{ fontSize: 32, color: '#1890ff' }} />
						) : (
							<PlayCircleOutlined style={{ fontSize: 32, color: '#1890ff' }} />
						)
					}
					onClick={toggleAudio}
					style={{
						position: 'absolute',
						top: 16,
						right: 16,
						zIndex: 50,
						background: 'white',
						boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
					}}
				/>
			)}

			<Card
				style={{
					width: '100%',
					minHeight: 400,
					boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
					borderRadius: 16,
					overflow: 'hidden',
					border: 'none',
					display: 'flex',
					flexDirection: 'column',
				}}
				styles={{
					body: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
				}}
			>
				<Flex vertical align="center" justify="center" style={{ flex: 1 }}>
					{/* Front of Card (Always Visible) */}
					<div style={{ position: 'relative', width: '100%', textAlign: 'center' }}>
						{/* Main Word Display */}

						{/* Main Word Display */}
						{wordParts && Array.isArray(wordParts) && wordParts.length > 0 ? (
							<Flex justify="center" align="end" gap={4} wrap="wrap">
								{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
								{wordParts.map((part: any, index: number) => (
									<Flex key={index} vertical align="center">
										{/* Furigana */}
										<div
											style={{
												height: 24,
												marginBottom: 0,
												opacity: showFurigana ? 1 : 0,
												transition: 'opacity 0.3s ease',
												display: 'flex',
												alignItems: 'flex-end',
											}}
										>
											<Text type="secondary" style={{ fontSize: 14 }}>
												{part.furigana || '　'}
											</Text>
										</div>

										{/* Kanji/Text */}
										<Title
											level={1}
											style={{
												fontSize: '64px',
												margin: '0',
												lineHeight: 1,
												color: '#1E3A5F',
											}}
										>
											{part.text}
										</Title>

										{/* Romaji */}
										<div
											style={{
												marginTop: 8,
												minHeight: 24,
												opacity: showRomaji ? 1 : 0,
												transition: 'opacity 0.3s ease',
											}}
										>
											<Text type="secondary" style={{ fontSize: 14, fontStyle: 'italic' }}>
												{part.romaji || ''}
											</Text>
										</div>
									</Flex>
								))}
							</Flex>
						) : (
							<>
								{/* Fallback for legacy data */}
								{/* Furigana (Reading) - Only show if enabled */}
								<div
									style={{
										height: 24,
										marginBottom: 4,
										opacity: showFurigana ? 1 : 0,
										transition: 'opacity 0.3s ease',
									}}
								>
									<Text type="secondary" style={{ fontSize: 18 }}>
										{reading}
									</Text>
								</div>

								<Title level={1} style={{ fontSize: '64px', margin: '0 0 8px', color: '#1E3A5F' }}>
									{kanji}
								</Title>

								{/* Romaji - Only show if enabled */}
								<div
									style={{
										marginTop: 8,
										minHeight: 24,
										opacity: showRomaji && romaji ? 1 : 0,
										transition: 'opacity 0.3s ease',
									}}
								>
									<Text type="secondary" style={{ fontSize: 16, fontStyle: 'italic' }}>
										{romaji}
									</Text>
								</div>
							</>
						)}
					</div>

					{/* Back of Card (Reveal) */}
					<div
						style={{
							opacity: showAnswer ? 1 : 0,
							transform: showAnswer ? 'translateY(0)' : 'translateY(20px)',
							transition: 'opacity 0.3s ease, transform 0.3s ease',
							width: '100%',
							textAlign: 'center',
							pointerEvents: showAnswer ? 'auto' : 'none',
						}}
					>
						{showAnswer && (
							<>
								<Divider style={{ margin: '24px 0' }} />

								{/* Han Viet Badge / Tag */}
								{hanViet && (
									<div style={{ marginBottom: 16 }}>
										<Tag color="volcano" style={{ fontSize: 14, padding: '4px 10px' }}>
											{hanViet}
										</Tag>
									</div>
								)}

								<div style={{ marginBottom: 16 }}>
									<Title level={3} style={{ margin: '0 0 8px' }}>
										{meaning}
									</Title>
									{partsOfSpeech && (
										<div>
											<Tag color="geekblue">{partsOfSpeech}</Tag>
										</div>
									)}
								</div>

								{exampleSentence && (
									<div
										style={{ background: '#F9F7F2', padding: 16, borderRadius: 8, width: '100%' }}
									>
										<Paragraph
											style={{
												fontSize: 18,
												marginBottom: 8,
												textAlign: 'left',
												lineHeight: '2.5', // Increased line height for Ruby
											}}
										>
											{/* Handle both new structured format and fallback string format */}
											{typeof exampleSentence === 'object' && 'parts' in exampleSentence ? (
												// eslint-disable-next-line @typescript-eslint/no-explicit-any
												(exampleSentence as any).parts.map((part: any, index: number) => (
													<React.Fragment key={index}>
														{part.furigana ? (
															<ruby style={{ margin: '0 2px' }}>
																{part.text}
																<rt
																	style={{
																		fontSize: '0.6em',
																		color: '#888',
																		userSelect: 'none',
																	}}
																>
																	{part.furigana}
																</rt>
															</ruby>
														) : (
															<span>{part.text}</span>
														)}
													</React.Fragment>
												))
											) : (
												// Fallback for string
												<span>{exampleSentence as unknown as string}</span>
											)}
										</Paragraph>
										<Text
											type="secondary"
											style={{ fontSize: 14, display: 'block', textAlign: 'left' }}
										>
											{typeof exampleSentence === 'object' && 'translation' in exampleSentence
												? // eslint-disable-next-line @typescript-eslint/no-explicit-any
													(exampleSentence as any).translation
												: exampleMeaning}
										</Text>
									</div>
								)}

								{/* Kanji Breakdown Section */}
								{kanjiBreakdown && Array.isArray(kanjiBreakdown) && kanjiBreakdown.length > 0 && (
									<>
										<Divider style={{ margin: '24px 0 16px' }} />
										<KanjiBreakdown breakdown={kanjiBreakdown} />
									</>
								)}
							</>
						)}
					</div>
				</Flex>
			</Card>
		</div>
	);
}
