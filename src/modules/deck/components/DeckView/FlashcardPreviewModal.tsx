/**
 * DeckView - Flashcard Preview Modal
 *
 * Scrollable modal for previewing flashcard information (front + back)
 * Shows all card information in a single scrollable view
 */
'use client';

import { useAudioPlayer } from '@/components/Audio/useAudioPlayer';
import { useTtsSettings } from '@/components/Audio/useTtsSettings';
import { HanVietBadge } from '@/modules/vocabulary/components/HanVietBadge';
import { WordWithFurigana } from '@/modules/vocabulary/components/WordWithFurigana';
import { SoundOutlined } from '@ant-design/icons';
import { Card, Divider, Empty, Flex, Grid, Modal, Space, Typography, theme } from 'antd';
import { useLocale } from 'next-intl';
import React, { useMemo } from 'react';

import type { ContentType, StoryItem, VocabularyItem } from '../../types';

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

export interface DeckViewAudioProps {
	speak: (text: string) => void;
	stop: () => void;
	isPlaying: boolean;
}

interface FlashcardPreviewModalProps {
	open: boolean;
	item: VocabularyItem | StoryItem | null;
	type: ContentType;
	onClose: () => void;
	/** When provided (e.g. from DeckView), use this player so voice/speed match the deck page */
	audio?: DeckViewAudioProps | null;
}

export function FlashcardPreviewModal({ open, item, type, onClose, audio }: FlashcardPreviewModalProps) {
	const screens = useBreakpoint();
	const { token } = useToken();
	const locale = (useLocale() as 'vi' | 'en') || 'vi';

	// Explicit breakpoint variables for clarity
	const isMobile = screens.xs || screens.sm; // < 768px
	const isDesktop = screens.md || screens.lg || screens.xl; // ≥ 768px

	// Responsive modal width: mobile-first approach
	const modalWidth = useMemo(() => {
		if (screens.xl) return 800; // Large desktop
		if (screens.lg) return 700; // Desktop
		if (screens.md) return 600; // Tablet
		return '90vw'; // Mobile: 90% of viewport width
	}, [screens]);

	// Use parent's audio when provided (same voice/speed as deck page); otherwise own TTS
	const ttsSettings = useTtsSettings();
	const ownPlayer = useAudioPlayer({
		rate: ttsSettings.speed,
		voiceUri: ttsSettings.voiceUri,
		lang: 'ja-JP',
	});

	const speak = audio?.speak ?? ownPlayer.speak;
	const stop = audio?.stop ?? ownPlayer.stop;
	const isPlaying = audio?.isPlaying ?? ownPlayer.isPlaying;

	// Handle audio playback
	const handlePlayAudio = React.useCallback(() => {
		if (item && type === 'vocab') {
			const vocab = item as VocabularyItem;
			if (isPlaying) {
				stop();
			} else {
				// Use reading (preferred) or wordSurface for TTS
				speak(vocab.wordReading || vocab.wordSurface);
			}
		}
	}, [item, type, speak, stop, isPlaying]);

	if (!item || type !== 'vocab') {
		return (
			<Modal
				open={open}
				onCancel={onClose}
				footer={null}
				width={modalWidth}
				centered
				closable={true}
				maskClosable={true}
				keyboard={true}
			>
				<Empty
					description={
						type === 'story'
							? 'Story preview is not available in flashcard format'
							: 'No flashcard data available'
					}
					style={{ padding: token.paddingXL }}
				/>
			</Modal>
		);
	}

	const vocab = item as VocabularyItem;
	const { wordSurface, wordReading, meanings, hanViet } = vocab;

	// Extract meanings
	const viMeanings = meanings?.vi || [];
	const enMeanings = meanings?.en || [];
	const allMeanings = viMeanings.length > 0 ? viMeanings : enMeanings;

	// Extract examples (if available in the vocab item)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const examples = (vocab as any).examples || [];
	const hasExamples = Array.isArray(examples) && examples.length > 0;

	// Extract etymology (if available)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const etymology = (vocab as any).etymology || null;
	const hasEtymology = etymology && typeof etymology === 'object';

	return (
		<Modal
			open={open}
			onCancel={onClose}
			footer={null}
			width={modalWidth}
			centered
			closable={true}
			maskClosable={true}
			keyboard={true}
			transitionName=""
			maskTransitionName=""
			style={{ maxWidth: '100vw' }}
			styles={{
				body: {
					padding: isDesktop ? token.paddingLG : token.paddingMD,
					maxHeight: '90vh',
					overflow: 'auto',
				},
			}}
			aria-labelledby="flashcard-preview-title"
		>
			<Card
				style={{
					width: '100%',
					border: 'none',
					boxShadow: 'none',
				}}
			>
				{/* Front Section */}
				<Flex vertical align="center" gap="middle" style={{ marginBottom: token.marginLG }}>
					{/* Word Surface with Furigana */}
					<Title
						level={1}
						style={{
							fontSize: isMobile ? 'clamp(32px, 8vw, 48px)' : 'clamp(40px, 6vw, 64px)',
							fontWeight: 500,
							margin: 0,
							color: token.colorPrimary,
							textAlign: 'center',
							lineHeight: 1.2,
						}}
					>
						<WordWithFurigana
							wordSurface={wordSurface}
							wordReading={wordReading ?? undefined}
							furiganaMapping={(item as VocabularyItem).furiganaMapping ?? undefined}
							showReadingLine={true}
							fontSize={isMobile ? 32 : 40}
							rtFontSize={isMobile ? 16 : 22}
						/>
					</Title>

					{/* Audio Button */}
					<Space>
						<button
							onClick={handlePlayAudio}
							style={{
								border: 'none',
								background: 'transparent',
								cursor: 'pointer',
								padding: '8px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								borderRadius: '50%',
								transition: 'background 0.2s',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = token.colorFillTertiary;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = 'transparent';
							}}
							aria-label="Play audio"
						>
							<SoundOutlined
								style={{
									fontSize: isMobile ? 24 : 28,
									color: token.colorPrimary,
									opacity: isPlaying ? 1 : 0.7,
								}}
							/>
						</button>
					</Space>
				</Flex>

				<Divider style={{ margin: `${token.marginLG}px 0` }} />

				{/* Back Section */}
				<Flex vertical gap="large">
					{/* Han Viet Badge */}
					{hanViet && (
						<div>
							<HanVietBadge hanViet={hanViet} size={isMobile ? 'medium' : 'large'} />
						</div>
					)}

					{/* Meanings */}
					{allMeanings.length > 0 && (
						<div>
							<Text
								strong
								style={{
									fontSize: isMobile ? 14 : 16,
									color: token.colorTextSecondary,
									display: 'block',
									marginBottom: token.marginSM,
								}}
							>
								Meanings:
							</Text>
							<Space direction="vertical" size="small" style={{ width: '100%' }}>
								{allMeanings.map((meaning, index) => (
									<Text
										key={index}
										style={{
											fontSize: isMobile ? 16 : 18,
											lineHeight: 1.6,
										}}
									>
										{index + 1}. {meaning}
									</Text>
								))}
							</Space>
						</div>
					)}

					{/* Examples */}
					{hasExamples && (
						<div>
							<Text
								strong
								style={{
									fontSize: isMobile ? 14 : 16,
									color: token.colorTextSecondary,
									display: 'block',
									marginBottom: token.marginSM,
								}}
							>
								Examples:
							</Text>
							<Space direction="vertical" size="middle" style={{ width: '100%' }}>
								{examples.slice(0, 3).map(
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									(example: any, index: number) => (
										<Card
											key={index}
											size="small"
											style={{
												background: token.colorFillAlter,
												border: `1px solid ${token.colorBorderSecondary}`,
											}}
										>
											<Paragraph
												style={{
													margin: 0,
													fontSize: isMobile ? 15 : 16,
													lineHeight: 1.6,
												}}
											>
												{example.sentence || example.japanese || ''}
											</Paragraph>
											{example.translation && (
												<Text
													type="secondary"
													style={{
														fontSize: isMobile ? 13 : 14,
														display: 'block',
														marginTop: token.marginXS,
													}}
												>
													{typeof example.translation === 'string'
														? example.translation
														: example.translation.vi || example.translation.en || ''}
												</Text>
											)}
										</Card>
									),
								)}
							</Space>
						</div>
					)}

					{/* Etymology */}
					{hasEtymology && (
						<div>
							<Text
								strong
								style={{
									fontSize: isMobile ? 14 : 16,
									color: token.colorTextSecondary,
									display: 'block',
									marginBottom: token.marginSM,
								}}
							>
								Etymology:
							</Text>
							<Space direction="vertical" size="middle" style={{ width: '100%' }}>
								{/* Etymology Parts */}
								{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
								{Array.isArray((etymology as any).parts) &&
									/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
									(etymology as any).parts.map(
										/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
										(part: any, index: number) => (
											<div key={index} style={{ marginBottom: token.marginMD }}>
												<Flex gap={8} align="center" style={{ marginBottom: token.marginXS }}>
													<Text
														strong
														style={{
															fontSize: isMobile ? 18 : 20,
															color: token.colorTextHeading,
														}}
													>
														{part.kanji}
													</Text>
													{part.han_viet && <HanVietBadge hanViet={part.han_viet} size="small" />}
												</Flex>
												{part.meaning && (
													<Text
														style={{
															fontSize: isMobile ? 14 : 15,
															color: token.colorText,
															lineHeight: 1.5,
														}}
													>
														{typeof part.meaning === 'object'
															? part.meaning[locale] || part.meaning.en || part.meaning.vi
															: part.meaning}
													</Text>
												)}
											</div>
										),
									)}

								{/* Etymology Note */}
								{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
								{(etymology as any).note && (
									<Card
										size="small"
										style={{
											background: token.colorFillAlter,
											border: `1px solid ${token.colorBorderSecondary}`,
											marginTop: token.marginMD,
										}}
									>
										<Text
											type="secondary"
											strong
											style={{
												fontSize: isMobile ? 12 : 13,
												display: 'block',
												marginBottom: token.marginXS,
											}}
										>
											Note:
										</Text>
										<Text
											style={{
												fontSize: isMobile ? 14 : 15,
												color: token.colorText,
												lineHeight: 1.6,
											}}
										>
											{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
											{typeof (etymology as any).note === 'object'
												? // eslint-disable-next-line @typescript-eslint/no-explicit-any
													(etymology as any).note[locale] ||
													// eslint-disable-next-line @typescript-eslint/no-explicit-any
													(etymology as any).note.en ||
													// eslint-disable-next-line @typescript-eslint/no-explicit-any
													(etymology as any).note.vi
												: // eslint-disable-next-line @typescript-eslint/no-explicit-any
													(etymology as any).note}
										</Text>
									</Card>
								)}
							</Space>
						</div>
					)}
				</Flex>
			</Card>
		</Modal>
	);
}
