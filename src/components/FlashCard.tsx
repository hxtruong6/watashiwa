'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card as AntCard, Typography, Tag, Divider, Flex, Button } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import KanjiBreakdown from './KanjiBreakdown';

const { Title, Text, Paragraph } = Typography;

// We can define proper types based on schema
// But for now sticking to "any" for flexibility during migration or partial types

interface FlashCardProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	card: any; // Requires card.vocab OR card.kanji
	showAnswer: boolean;
	showFurigana?: boolean;
	showRomaji?: boolean;
	autoPlayAudio?: boolean;
}

export default function FlashCard({
	card,
	showAnswer,
	showFurigana = true,
	showRomaji = false,
	autoPlayAudio = false,
}: FlashCardProps) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);

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
	} = kanjiData;

	// Common Display Data
	const frontText = isVocab ? vocabKanji || vocabData.wordSurface : charKanji;
	// secondaryFrontText removed as unused (logic handled in JSX)
	// For Kanji, we might want reading on front? Usually just the char is front.
	// Maybe simple Onyomi/Kunyomi summary or just strokes? Strokes is good for pure recognition.

	const playAudio = React.useCallback(() => {
		if (audioUrl && audioRef.current) {
			audioRef.current.currentTime = 0;
			audioRef.current
				.play()
				.then(() => setIsPlaying(true))
				.catch((err) => console.error('Audio play failed:', err));
		}
	}, [audioUrl]);

	// Auto-play logic (Vocab only usually)
	useEffect(() => {
		if (isVocab && autoPlayAudio && audioUrl && audioRef.current) {
			const timer = setTimeout(() => {
				playAudio();
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [card?.id, autoPlayAudio, audioUrl, isVocab, playAudio]);

	// Handle Audio Playback Toggle
	const toggleAudio = (e?: React.MouseEvent) => {
		e?.stopPropagation();
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				playAudio();
			}
			setIsPlaying(!isPlaying);
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
					onEnded={() => setIsPlaying(false)}
					onPause={() => setIsPlaying(false)}
					onPlay={() => setIsPlaying(true)}
					onLoadStart={() => setIsPlaying(false)}
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
				bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
			>
				<Flex vertical align="center" justify="center" style={{ flex: 1 }}>
					{/* Front of Card (Always Visible) */}
					<div style={{ position: 'relative', width: '100%', textAlign: 'center' }}>
						{/* Audio Button (Vocab Only) */}
						{isVocab && audioUrl && (
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
									top: 0,
									right: 0,
									zIndex: 10,
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
									style={{ fontSize: '80px', margin: '4px 0 16px', color: '#1E3A5F' }}
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

								{/* ---- VOCAB BACK ---- */}
								{isVocab && (
									<>
										{/* Han Viet Badge */}
										{vocabHanViet && (
											<div style={{ marginBottom: 16 }}>
												<Tag color="volcano" style={{ fontSize: 14, padding: '4px 10px' }}>
													{vocabHanViet}
												</Tag>
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

										{exampleSentence && (
											<div
												style={{
													background: '#F9F7F2',
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
														lineHeight: '2.5',
													}}
												>
													{typeof exampleSentence === 'object' && 'parts' in exampleSentence ? (
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
															),
														)
													) : (
														<span>{exampleSentence as unknown as string}</span>
													)}
												</Paragraph>
												<Text
													type="secondary"
													style={{
														fontSize: 14,
														display: 'block',
														textAlign: 'left',
													}}
												>
													{typeof exampleSentence === 'object' && 'translation' in exampleSentence
														? // eslint-disable-next-line @typescript-eslint/no-explicit-any
															(exampleSentence as any).translation
														: exampleMeaning}
												</Text>
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
										{/* Han Viet */}
										{kanjiHanViet && (
											<div style={{ marginBottom: 16 }}>
												<Tag color="volcano" style={{ fontSize: 16, padding: '4px 12px' }}>
													{kanjiHanViet}
												</Tag>
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
												<Text strong style={{ fontSize: 16, color: '#cf1322' }}>
													{onyomi?.join(', ') || '-'}
												</Text>
											</div>
											<div style={{ textAlign: 'center' }}>
												<Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
													Kunyomi
												</Text>
												<Text strong style={{ fontSize: 16, color: '#389e0d' }}>
													{kunyomi?.join(', ') || '-'}
												</Text>
											</div>
										</Flex>

										{/* Radicals */}
										{/* Assuming radicals is Array<{kanji, hanViet, meaning}> */}
										{radicals && Array.isArray(radicals) && radicals.length > 0 && (
											<div style={{ textAlign: 'left', marginTop: 16 }}>
												<Text strong style={{ fontSize: 13, color: '#666' }}>
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
										{kanjiExamples && Array.isArray(kanjiExamples) && kanjiExamples.length > 0 && (
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
}
