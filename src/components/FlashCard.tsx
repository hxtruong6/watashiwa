'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card as AntCard, Typography, Tag, Divider, Flex, Button, theme, Image } from 'antd';
import { PauseCircleOutlined, SoundOutlined, EyeOutlined } from '@ant-design/icons';
import KanjiBreakdown from './KanjiBreakdown';

const { useToken } = theme;
import { useAudioPlayer } from './Audio/useAudioPlayer';

const { Title, Text, Paragraph } = Typography;

// We can define proper types based on schema
// But for now sticking to "any" for flexibility during migration or partial types

interface FlashCardProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	card: any; // Requires card.vocab OR card.kanji
	showAnswer: boolean;
	showFurigana?: boolean;
	showRomaji?: boolean;
	autoPlayAudio?: 'off' | 'question' | 'answer';
}

export interface FlashCardHandle {
	playAudio: () => void;
	playExampleAudio: () => void;
}

import { useTranslations } from 'next-intl';

const FlashCard = React.forwardRef<FlashCardHandle, FlashCardProps>(
	(
		{
			card,
			showAnswer,
			showFurigana = true,
			showRomaji = false,
			autoPlayAudio = 'off',
		}: FlashCardProps,
		ref,
	) => {
		const { token } = useToken();
		const t = useTranslations();
		// Audio State
		const audioRef = useRef<HTMLAudioElement | null>(null);
		const [isFilePlaying, setIsFilePlaying] = useState(false);
		const [imageError, setImageError] = useState(false);

		// Reset error state when card changes
		useEffect(() => {
			setImageError(false);
		}, [card?.id]);

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

		// Detect if this is a Vocab card or Kanji card
		const isVocab = !!card?.vocab;
		const isKanji = !!card?.kanji;

		// Extract Vocab Data
		const vocabData = card?.vocab || {};
		const {
			kanji: vocabKanji,
			reading,
			meaning: vocabMeaning,
			exampleSentence,
			exampleMeaning, // legacy field?
			partsOfSpeech,
			audioUrl,
			imageUrl: vocabImageUrl,
			romaji,
			kanjiBreakdown,
			hanViet: vocabHanViet,
			wordParts,
		} = vocabData;

		// Extract Kanji Data
		const kanjiData = card?.kanji || {};
		const {
			kanji: charKanji, // The character itself
			hanViet: kanjiHanViet,
			onyomi,
			kunyomi,
			strokes,
			meaning: kanjiMeaning,
			examples: kanjiExamples,
			radicals,
			imageUrl: kanjiImageUrl,
		} = kanjiData;

		// Common Display Data
		const frontText = isVocab ? vocabKanji || vocabData.wordSurface : charKanji;
		const activeImageUrl = isVocab ? vocabImageUrl : kanjiImageUrl;

		const playAudio = () => {
			if (isVocab) {
				if (audioUrl && audioRef.current) {
					audioRef.current.currentTime = 0;
					audioRef.current
						.play()
						.then(() => setIsFilePlaying(true))
						.catch((err) => console.error('Audio play failed:', err));
				} else {
					// TTS Fallback
					// Read latest speed from local storage to ensure it's up to date
					const savedSpeed =
						typeof window !== 'undefined' ? localStorage.getItem('watashiwa_audio_speed') : '1';
					const speed = savedSpeed ? parseFloat(savedSpeed) : 1;

					// If we only have kana (reading) and no kanji, just use reading
					// If we have kanji, preferably use reading for TTS to ensure correct pronunciation, OR kanji if reading is missing.
					// Actually, for Japanese TTS, Kanji is usually fine but reading is safer if polysemous.
					// But `speak` takes text.
					speak(reading || vocabKanji || frontText, { rate: speed });
				}
			}
		};

		const playExampleAudio = () => {
			if (!isVocab || !exampleSentence) return;

			let textToSpeak = '';
			if (typeof exampleSentence === 'object' && 'parts' in exampleSentence) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				textToSpeak = (exampleSentence as any).parts
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					.map((p: any) => p.text)
					.join('');
			} else if (typeof exampleSentence === 'object' && 'sentence' in exampleSentence) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				textToSpeak = (exampleSentence as any).sentence;
			} else if (typeof exampleSentence === 'string') {
				textToSpeak = exampleSentence;
			}

			if (textToSpeak) {
				const savedSpeed =
					typeof window !== 'undefined' ? localStorage.getItem('watashiwa_audio_speed') : '1';
				const speed = savedSpeed ? parseFloat(savedSpeed) : 1;
				speak(textToSpeak, { rate: speed });
			}
		};

		// Expose methods to parent
		React.useImperativeHandle(ref, () => ({
			playAudio,
			playExampleAudio,
		}));

		// Auto-play logic
		useEffect(() => {
			if (isVocab && autoPlayAudio !== 'off') {
				let shouldPlay = false;

				if (autoPlayAudio === 'question') {
					// Play immediately on mount/card change
					shouldPlay = true;
				} else if (autoPlayAudio === 'answer' && showAnswer) {
					// Play only when answer is revealed
					shouldPlay = true;
				}

				if (shouldPlay) {
					// If using TTS (!audioUrl), wait for voices to be loaded
					if (!audioUrl && voices.length === 0) return;

					// Small delay for smooth UX
					const timer = setTimeout(() => {
						playAudio();
					}, 300);
					return () => clearTimeout(timer);
				}
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [card?.id, showAnswer, autoPlayAudio, isVocab, voices.length]);

		// Handle Audio Playback Toggle
		const toggleAudio = (e?: React.MouseEvent) => {
			e?.stopPropagation();
			if (isPlaying) {
				if (audioRef.current && !audioRef.current.paused) {
					audioRef.current.pause();
				}
				stop();
				setIsFilePlaying(false);
			} else {
				playAudio();
			}
		};

		if (!card || (!isVocab && !isKanji)) return null;

		return (
			<div style={{ perspective: 1000, width: '100%', maxWidth: 600, margin: '0 auto' }}>
				{/* Hidden Audio Element */}
				{audioUrl && (
					<audio
						ref={audioRef}
						src={audioUrl}
						preload="none"
						onEnded={() => setIsFilePlaying(false)}
						onPause={() => setIsFilePlaying(false)}
						onPlay={() => setIsFilePlaying(true)}
						onLoadStart={() => setIsFilePlaying(false)}
					/>
				)}

				<AntCard
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
							{/* Audio Button (Vocab Only) */}
							{isVocab && (
								<Button
									type="text"
									shape="circle"
									icon={
										isPlaying ? (
											<PauseCircleOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
										) : (
											<SoundOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
										)
									}
									onClick={toggleAudio}
									style={{
										position: 'absolute',
										top: 0,
										right: 0,
										zIndex: 10,
										width: 48,
										height: 48,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										borderRadius: '50%',
										background: 'rgba(255, 255, 255, 0.1)', // Glass effect
										backdropFilter: 'blur(4px)',
										boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
										border: '1px solid rgba(0,0,0,0.02)',
										transition: 'all 0.3s ease',
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.transform = 'scale(1.05)';
										e.currentTarget.style.boxShadow = `0 4px 15px ${token.colorPrimary}1a`; // approximate 0.1 opacity
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.transform = 'scale(1)';
										e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
									}}
								/>
							)}

							{/* Tag for Type (Vocab vs Kanji) - Optional but helpful */}
							<div style={{ position: 'absolute', top: 0, left: 0 }}>
								<Tag color={isVocab ? 'geekblue' : 'purple'}>{isVocab ? 'Vocab' : 'Kanji'}</Tag>
							</div>

							{/* Main Content Area */}
							{isVocab && wordParts && Array.isArray(wordParts) && wordParts.length > 0 ? (
								<Flex
									justify="center"
									align="end"
									gap={4}
									wrap="wrap"
									style={{ marginTop: 12, marginBottom: 12 }}
								>
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
													fontSize: '64px', // Slightly smaller to fit multiple
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
									{/* Top Secondary Text */}
									{isVocab ? (
										// Furigana
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
									) : (
										// Strokes
										<div style={{ height: 24, marginBottom: 4 }}>
											<Text type="secondary" style={{ fontSize: 14 }}>
												{strokes} strokes
											</Text>
										</div>
									)}

									{/* Main Text */}
									<Title
										level={1}
										style={{ fontSize: '80px', margin: '4px 0 16px', color: token.colorPrimary }}
									>
										{frontText}
									</Title>

									{/* Bottom Secondary Text (Romaji for Vocab) */}
									{isVocab && (
										<div
											style={{
												minHeight: 24,
												opacity: showRomaji && romaji ? 1 : 0,
												transition: 'opacity 0.3s ease',
											}}
										>
											<Text type="secondary" style={{ fontSize: 16, fontStyle: 'italic' }}>
												{romaji}
											</Text>
										</div>
									)}
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
								// Hide when not shown to prevent layout issues?
								// Actually opacity/transform is nice for animation.
							}}
						>
							{showAnswer && (
								<>
									<Divider style={{ margin: '24px 0' }} />

									{/* Render Image if exists and not errored */}
									{activeImageUrl && !imageError && (
										<div style={{ marginBottom: 20 }}>
											<Image
												src={activeImageUrl}
												alt={frontText}
												onError={() => setImageError(true)}
												width="100%"
												style={{
													maxHeight: 140,
													objectFit: 'contain',
													borderRadius: 12,
													boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
													background: token.colorBgContainer, // Fallback background
												}}
												placeholder={
													<div
														style={{
															width: '100%',
															height: '100%',
															minHeight: 140,
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															background: token.colorFillAlter, // Theme-aware background
															borderRadius: 12,
															color: token.colorTextSecondary, // Theme-aware text
														}}
													>
														<Flex vertical align="center" gap="small">
															<EyeOutlined style={{ fontSize: 24, opacity: 0.5 }} />
															<Text type="secondary">{t('Common.loading')}</Text>
														</Flex>
													</div>
												}
											/>
										</div>
									)}

									{/* ---- VOCAB BACK ---- */}

									{isVocab && (
										<>
											{/* Han Viet Badge - Refined ("Zen" Style) */}
											{vocabHanViet && (
												<div style={{ marginBottom: 12 }}>
													<Text
														type="secondary"
														style={{
															fontSize: 14,
															letterSpacing: '0.05em',
															textTransform: 'uppercase',
															color: token.colorTextTertiary,
															borderBottom: `1px solid ${token.colorBorderSecondary}`,
															paddingBottom: 2,
														}}
													>
														{vocabHanViet}
													</Text>
												</div>
											)}

											<div style={{ marginBottom: 16 }}>
												<Title level={3} style={{ margin: '0 0 8px' }}>
													{vocabMeaning}
												</Title>
												{partsOfSpeech && (
													<div>
														<Tag color="geekblue">{partsOfSpeech}</Tag>
													</div>
												)}
											</div>

											{exampleSentence &&
												exampleSentence !== '' &&
												Object.keys(exampleSentence).length > 0 && (
													<div
														style={{
															background: token.colorBgLayout,
															padding: 16,
															borderRadius: 8,
															width: '100%',
														}}
													>
														<Flex align="start" justify="space-between" gap="small">
															<div style={{ flex: 1 }}>
																<Paragraph
																	style={{
																		fontSize: 18,
																		marginBottom: 8,
																		textAlign: 'left',
																		lineHeight: '2.5',
																	}}
																>
																	{typeof exampleSentence === 'object' &&
																	'parts' in exampleSentence ? (
																		// eslint-disable-next-line @typescript-eslint/no-explicit-any
																		(exampleSentence as any).parts.map(
																			// eslint-disable-next-line @typescript-eslint/no-explicit-any
																			(part: any, index: number) => (
																				<React.Fragment key={index}>
																					{part.furigana ? (
																						<ruby style={{ margin: '0 2px' }}>
																							{part.text}
																							<rt
																								style={{
																									fontSize: '0.6em',
																									color: token.colorTextSecondary,
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
																			),
																		)
																	) : typeof exampleSentence === 'object' &&
																	  'sentence' in exampleSentence ? (
																		<span>{(exampleSentence as any)?.sentence || ''}</span>
																	) : typeof exampleSentence === 'string' ? (
																		<span>{exampleSentence}</span>
																	) : null}
																</Paragraph>
																<Text
																	type="secondary"
																	style={{
																		fontSize: 14,
																		display: 'block',
																		textAlign: 'left',
																	}}
																>
																	{typeof exampleSentence === 'object' &&
																	'translation' in exampleSentence
																		? // eslint-disable-next-line @typescript-eslint/no-explicit-any
																			(exampleSentence as any).translation
																		: exampleMeaning}
																</Text>
															</div>
															<Button
																type="text"
																shape="circle"
																icon={<SoundOutlined style={{ color: token.colorWarning }} />}
																onClick={playExampleAudio}
															/>
														</Flex>
													</div>
												)}

											{/* Kanji Breakdown */}
											{kanjiBreakdown &&
												Array.isArray(kanjiBreakdown) &&
												kanjiBreakdown.length > 0 && (
													<>
														<Divider style={{ margin: '24px 0 16px' }} />
														<KanjiBreakdown breakdown={kanjiBreakdown} />
													</>
												)}
										</>
									)}

									{/* ---- KANJI BACK ---- */}
									{isKanji && (
										<>
											{/* Han Viet - Refined */}
											{kanjiHanViet && (
												<div style={{ marginBottom: 16 }}>
													<Text
														type="secondary"
														style={{
															fontSize: 16,
															letterSpacing: '0.05em',
															textTransform: 'uppercase',
															color: token.colorTextTertiary,
															borderBottom: `1px solid ${token.colorBorderSecondary}`,
															paddingBottom: 2,
														}}
													>
														{kanjiHanViet}
													</Text>
												</div>
											)}

											{/* Meaning */}
											<Title level={3} style={{ margin: '0 0 16px' }}>
												{kanjiMeaning}
											</Title>

											{/* Onyomi / Kunyomi */}
											<Flex justify="center" gap="large" style={{ marginBottom: 16 }}>
												<div style={{ textAlign: 'center' }}>
													<Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
														Onyomi
													</Text>
													<Text strong style={{ fontSize: 16, color: token.colorError }}>
														{onyomi?.join(', ') || '-'}
													</Text>
												</div>
												<div style={{ textAlign: 'center' }}>
													<Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
														Kunyomi
													</Text>
													<Text strong style={{ fontSize: 16, color: token.colorSuccess }}>
														{kunyomi?.join(', ') || '-'}
													</Text>
												</div>
											</Flex>

											{/* Radicals */}
											{/* Assuming radicals is Array<{kanji, hanViet, meaning}> */}
											{radicals && Array.isArray(radicals) && radicals.length > 0 && (
												<div style={{ textAlign: 'left', marginTop: 16 }}>
													<Text strong style={{ fontSize: 13, color: token.colorTextSecondary }}>
														Radicals:
													</Text>
													<div style={{ marginTop: 4 }}>
														{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
														{radicals.map((r: any, idx: number) => (
															<Tag key={idx}>
																{r.kanji} ({r.meaningVi || r.meaning})
															</Tag>
														))}
													</div>
												</div>
											)}

											{/* Examples */}
											{kanjiExamples &&
												Array.isArray(kanjiExamples) &&
												kanjiExamples.length > 0 && (
													<div
														style={{
															marginTop: 16,
															textAlign: 'left',
															width: '100%',
														}}
													>
														<Divider style={{ margin: '12px 0' }}>Examples</Divider>
														<div style={{ display: 'grid', gap: 8, width: '100%' }}>
															{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
															{kanjiExamples.slice(0, 3).map((ex: any, i: number) => (
																<div
																	key={i}
																	style={{
																		display: 'flex',
																		justifyContent: 'space-between',
																		fontSize: 14,
																	}}
																>
																	<div>
																		<Text strong>{ex.word}</Text>
																		<Text type="secondary" style={{ marginLeft: 8 }}>
																			{ex.kana}
																		</Text>
																	</div>
																	<Text>{ex.meaningVi || ex.meaning}</Text>
																</div>
															))}
														</div>
													</div>
												)}
										</>
									)}
								</>
							)}
						</div>
					</Flex>
				</AntCard>
			</div>
		);
	},
);

FlashCard.displayName = 'FlashCard';

export default FlashCard;
