import { EyeOutlined, SoundOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Image, Tag, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

import KanjiBreakdown from '../KanjiBreakdown';

// Check relative path

const { useToken } = theme;
const { Title, Text, Paragraph } = Typography;

interface FlashCardBackProps {
	card: any; // eslint-disable-line @typescript-eslint/no-explicit-any
	showAnswer: boolean;
	activeImageUrl?: string;
	imageError: boolean;
	setImageError: (err: boolean) => void;
	playExampleAudio: () => void;
	frontText?: string;
}

export default function FlashCardBack({
	card,
	showAnswer,
	activeImageUrl,
	imageError,
	setImageError,
	playExampleAudio,
	frontText,
}: FlashCardBackProps) {
	const { token } = useToken();
	const t = useTranslations();

	// Determine Type
	const isVocab = !!card?.vocab;
	const isKanji = !!card?.kanji;

	// Vocab Data
	const vocabData = card?.vocab || {};
	const {
		meaning: vocabMeaning,
		exampleSentence,
		exampleMeaning,
		partsOfSpeech,
		kanjiBreakdown,
		hanViet: vocabHanViet,
	} = vocabData;

	// Kanji Data
	const kanjiData = card?.kanji || {};
	const {
		hanViet: kanjiHanViet,
		onyomi,
		kunyomi,
		meaning: kanjiMeaning,
		examples: kanjiExamples,
		radicals,
	} = kanjiData;

	return (
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
									background: token.colorBgContainer,
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
											background: token.colorFillAlter,
											borderRadius: 12,
											color: token.colorTextSecondary,
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
													{typeof exampleSentence === 'object' && 'translation' in exampleSentence
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
							{kanjiBreakdown && Array.isArray(kanjiBreakdown) && kanjiBreakdown.length > 0 && (
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
	);
}
