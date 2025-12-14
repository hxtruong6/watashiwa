import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, Typography, Tag, Divider, Flex, Button, theme } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import KanjiBreakdown from './KanjiBreakdown';
import { useAudioPlayer } from './Audio/useAudioPlayer';

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

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
	const { token } = useToken();
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isFilePlaying, setIsFilePlaying] = useState(false);

	// TTS Player
	const [ttsSettings] = useState(() => {
		if (typeof window === 'undefined') return { voiceUri: '', speed: 1 };
		const savedVoice = localStorage.getItem('watashiwa_audio_voice');
		const savedSpeed = localStorage.getItem('watashiwa_audio_speed');
		return {
			voiceUri: savedVoice || '',
			speed: savedSpeed ? parseFloat(savedSpeed) : 1,
		};
	});

	const {
		speak,
		stop,
		isPlaying: isTtsPlaying,
		voices,
	} = useAudioPlayer({
		rate: ttsSettings.speed,
		voiceUri: ttsSettings.voiceUri,
		lang: 'ja-JP',
	});

	// Derived Play State
	const isPlaying = isFilePlaying || isTtsPlaying;

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

	// Stop audio when card changes
	// Track previous card ID to derive state resets
	const [prevCardId, setPrevCardId] = useState(card?.vocab?.id);

	// Reset playing state during render if card changes (avoids cascading effect)
	if (card?.vocab?.id !== prevCardId) {
		setPrevCardId(card?.vocab?.id);
		setIsFilePlaying(false);
	}

	// Stop audio side-effects when card changes
	useEffect(() => {
		stop();
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
		}
		// setIsFilePlaying(false) is handled during render above
	}, [card?.vocab?.id, stop]);

	const playAudio = useCallback(() => {
		if (audioUrl && audioRef.current) {
			audioRef.current
				.play()
				.then(() => setIsFilePlaying(true))
				.catch((err) => console.error('Auto-play failed:', err));
		} else {
			// Fallback to TTS
			// Prioritize reading (kana) for pronunciation, then kanji
			// But for TTS, kanji is actually fine if the engine is good.
			// But 'reading' is usually Hiragana/Katakana.
			// Let's use the visible text (Kanji) if available, or Reading.
			speak(kanji || reading);
		}
	}, [audioUrl, kanji, reading, speak]);

	// Auto-play logic
	useEffect(() => {
		if (autoPlayAudio) {
			// If using TTS (!audioUrl), wait for voices to be loaded
			if (!audioUrl && voices.length === 0) return;

			// Small delay to ensure smooth transition
			const timer = setTimeout(() => {
				playAudio();
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [card?.vocab?.id, autoPlayAudio, audioUrl, playAudio, voices.length]);

	// Handle Audio Playback
	const toggleAudio = (e?: React.MouseEvent) => {
		e?.stopPropagation(); // Prevent card flip if clicking button

		if (isPlaying) {
			if (audioRef.current && !audioRef.current.paused) {
				audioRef.current.pause();
			}
			stop(); // Stop TTS
			setIsFilePlaying(false);
		} else {
			playAudio();
		}
	};

	// If no card, show loading or empty state
	if (!card || !card.vocab) return null;

	// Reset play state when audio ends
	const onAudioEnded = () => {
		setIsFilePlaying(false);
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
					onPause={() => setIsFilePlaying(false)}
					onPlay={() => setIsFilePlaying(true)}
					onLoadStart={() => setIsFilePlaying(false)}
				/>
			)}

			{/* Floating Audio Button */}
			<Button
				type="text"
				shape="circle"
				icon={
					isPlaying ? (
						<PauseCircleOutlined style={{ fontSize: 32, color: token.colorPrimary }} />
					) : (
						<PlayCircleOutlined style={{ fontSize: 32, color: token.colorPrimary }} />
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

			{/* Audio Element for file playback */}
			{audioUrl && (
				<audio
					ref={audioRef}
					src={audioUrl}
					preload="none"
					onEnded={onAudioEnded}
					onPause={() => setIsFilePlaying(false)}
					onPlay={() => setIsFilePlaying(true)}
					onLoadStart={() => setIsFilePlaying(false)}
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
												color: token.colorPrimary,
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

								<Title
									level={1}
									style={{ fontSize: '64px', margin: '0 0 8px', color: token.colorPrimary }}
								>
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
										style={{
											background: token.colorBgLayout,
											padding: 16,
											borderRadius: 8,
											width: '100%',
										}}
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
