/**
 * DeckView - Content Grid View Component
 *
 * Grid layout for displaying vocab/story items
 */
import { useAudioPlayer } from '@/components/Audio/useAudioPlayer';
import { HanVietBadge } from '@/modules/vocabulary/components/HanVietBadge';
import { WordWithFurigana } from '@/modules/vocabulary/components/WordWithFurigana';
import { SoundOutlined } from '@ant-design/icons';
import { Button, Card, Col, Flex, Grid, Row, Typography, theme } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { ContentType, StoryItem, VocabularyItem } from '../../types';

const { Text } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

/**
 * Audio Button Component for Vocabulary Cards
 * Subtle audio icon in top right with click animation
 */
interface AudioButtonProps {
	wordReading: string | null;
	wordSurface: string;
	isMobile: boolean;
	onStopPlayAll?: () => void;
}

function AudioButton({ wordReading, wordSurface, isMobile, onStopPlayAll }: AudioButtonProps) {
	const { token } = useToken();
	const [isAnimating, setIsAnimating] = useState(false);

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
	} = useAudioPlayer({
		rate: ttsSettings.speed,
		voiceUri: ttsSettings.voiceUri,
		lang: 'ja-JP',
	});

	// Derive playing state from TTS
	const isActuallyPlaying = isTtsPlaying;

	// Reset animation after audio ends
	useEffect(() => {
		if (!isTtsPlaying) {
			const timer = setTimeout(() => setIsAnimating(false), 300);
			return () => clearTimeout(timer);
		}
	}, [isTtsPlaying]);

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation(); // Prevent card click

			// Stop "play all" if it's running
			if (onStopPlayAll) {
				onStopPlayAll();
			}

			if (isActuallyPlaying) {
				stop();
				setIsAnimating(false);
			} else {
				// Trigger animation
				setIsAnimating(true);
				// Play audio using reading (preferred) or surface
				speak(wordReading || wordSurface);
			}
		},
		[isActuallyPlaying, stop, speak, wordReading, wordSurface, onStopPlayAll],
	);

	return (
		<Button
			type="text"
			size="small"
			icon={
				<SoundOutlined
					style={{
						fontSize: isMobile ? 14 : 16,
						color: isActuallyPlaying ? token.colorPrimary : token.colorTextTertiary,
						opacity: isActuallyPlaying ? 1 : 0.5,
						transition: 'all 0.2s ease',
						transform: isAnimating ? 'scale(1.3)' : 'scale(1)',
						animation: isActuallyPlaying ? 'audioPulse 1.5s ease-in-out infinite' : 'none',
					}}
				/>
			}
			onClick={handleClick}
			style={{
				position: 'absolute',
				top: 8,
				right: 8,
				minWidth: isMobile ? 28 : 32,
				minHeight: isMobile ? 28 : 32,
				padding: 0,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 10,
				opacity: 0.7,
				transition: 'opacity 0.2s ease',
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.opacity = '1';
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.opacity = '0.7';
			}}
		/>
	);
}

interface ContentGridViewProps {
	type: ContentType;
	data: (VocabularyItem | StoryItem)[];
	showMeaning: boolean;
	onItemClick: (item: VocabularyItem | StoryItem, type: ContentType) => void;
	onCommentClick: (item: VocabularyItem | StoryItem, type: ContentType) => void;
	currentPlayingWordId?: string | null;
	onStopPlayAll?: () => void;
}

export function ContentGridView({
	type,
	data,
	showMeaning,
	onItemClick,
	onCommentClick, // Comment button is currently commented out in UI
	currentPlayingWordId,
	onStopPlayAll,
}: ContentGridViewProps) {
	const { token } = useToken();
	const screens = useBreakpoint();
	// Suppress unused parameter warning - onCommentClick is for future use
	void onCommentClick;

	// Ref to track card elements for scrolling
	const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

	// Scroll to current playing word
	useEffect(() => {
		if (currentPlayingWordId) {
			const cardElement = cardRefs.current.get(currentPlayingWordId);
			if (cardElement) {
				// Smooth scroll to the card
				cardElement.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
					inline: 'nearest',
				});
			}
		}
	}, [currentPlayingWordId]);

	return (
		<>
			<style>
				{`
					@keyframes audioPulse {
						0%, 100% {
							transform: scale(1);
							opacity: 0.7;
						}
						50% {
							transform: scale(1.15);
							opacity: 1;
						}
					}
				`}
			</style>
			<Row gutter={[screens.xs ? 8 : 16, screens.xs ? 8 : 16]}>
				{data.map((item) => {
					const wordSurface =
						type === 'vocab'
							? (item as VocabularyItem).wordSurface
							: (item as StoryItem).content?.title?.vi ||
								(item as StoryItem).content?.title?.en ||
								'Story';
					const wordReading = type === 'vocab' ? (item as VocabularyItem).wordReading : null;
					const hanViet = type === 'vocab' ? (item as VocabularyItem).hanViet : null;
					const meanings = type === 'vocab' ? (item as VocabularyItem).meanings : null;
					const furiganaMapping =
						type === 'vocab' ? (item as VocabularyItem).furiganaMapping : null;

					// Extract first meaning from meanings object (prefer vi, fallback to en)
					const meaningText =
						type === 'vocab'
							? meanings?.vi?.[0] || meanings?.en?.[0] || ''
							: (item as StoryItem).content?.body_text?.substring(0, 100) || '';

					// Responsive font sizes - improved for mobile readability
					const titleFontSize = screens.xs ? 20 : screens.sm ? 19 : 20;
					const meaningFontSize = screens.xs ? 14 : 14;
					// Furigana should be more readable on mobile (0.65x instead of 0.6x)
					const furiganaFontSize = screens.xs ? titleFontSize * 0.65 : titleFontSize * 0.6;

					const isCurrentlyPlaying = currentPlayingWordId === item.id && type === 'vocab';

					return (
						<Col xs={24} sm={12} md={8} lg={6} xl={6} xxl={6} key={item.id}>
							<div
								ref={(el) => {
									if (el) {
										cardRefs.current.set(item.id, el);
									} else {
										cardRefs.current.delete(item.id);
									}
								}}
							>
								<Card
									hoverable
									style={{
										height: '100%',
										borderRadius: 12,
										borderColor: isCurrentlyPlaying
											? token.colorPrimary
											: token.colorBorderSecondary,
										borderWidth: isCurrentlyPlaying ? 2 : 1,
										minHeight: screens.xs ? (showMeaning ? 110 : 100) : showMeaning ? 140 : 110,
										position: 'relative',
										// backgroundColor: isCurrentlyPlaying
										// 	? token.colorPrimaryBg
										// 	: token.colorBgContainer,
										transition: 'all 0.3s ease',
										boxShadow: isCurrentlyPlaying ? `0 4px 12px ${token.colorPrimary}40` : 'none',
									}}
									className="hover-trigger"
									onClick={() => onItemClick(item, type)}
									styles={{
										body: {
											// Increased padding on mobile for better touch targets and breathing room
											padding: screens.xs ? token.padding : token.padding,
										},
									}}
								>
									{/* Audio button - only for vocab items */}
									{type === 'vocab' && wordReading && (
										<AudioButton
											wordReading={wordReading}
											wordSurface={wordSurface}
											isMobile={screens.xs || false}
											onStopPlayAll={onStopPlayAll}
										/>
									)}
									<Flex vertical gap={screens.xs ? 'small' : 'middle'}>
										{/* Header: Word/Title and Actions */}
										<Flex justify="space-between" align="start" gap="small" wrap="wrap">
											<Flex vertical gap={2} style={{ flex: 1, minWidth: 0 }}>
												{/* Word: shared WordWithFurigana (reading line only when no furigana) */}
												{type === 'vocab' ? (
													<div style={{ color: token.colorPrimary, wordBreak: 'break-word' }}>
														<WordWithFurigana
															wordSurface={wordSurface}
															wordReading={wordReading ?? undefined}
															furiganaMapping={furiganaMapping ?? undefined}
															showReadingLine={true}
															fontSize={titleFontSize}
															rtFontSize={furiganaFontSize}
														/>
													</div>
												) : (
													<Text
														strong
														style={{
															fontSize: titleFontSize,
															color: token.colorPrimary,
															wordBreak: 'break-word',
															lineHeight: 1.3,
														}}
													>
														{wordSurface}
													</Text>
												)}
												{/* HanViet below kanji - Polished UI/UX for learning aid */}
												{type === 'vocab' && hanViet && (
													<HanVietBadge hanViet={hanViet} size={screens.xs ? 'medium' : 'small'} />
												)}
											</Flex>
											{/* TODO: Add comment button back in */}
											{/* <Flex gap={4} align="center" style={{ flexShrink: 0 }}>
											<div
												className={`hover-target ${
													item._count?.cardComments && item._count.cardComments > 0 ? 'visible' : ''
												}`}
											>
												<Button
													size="small"
													type="text"
													icon={<CommentOutlined />}
													style={{
														minWidth: screens.xs ? 32 : 36,
														minHeight: screens.xs ? 32 : 36,
													}}
													onClick={(e) => {
														e.stopPropagation();
														onCommentClick(item, type);
													}}
												/>
											</div>
										</Flex> */}
										</Flex>

										{/* Meaning (conditional) */}
										{showMeaning && meaningText && (
											<Text
												ellipsis={{
													tooltip: {
														title: meaningText,
														// Better mobile tooltip placement
														placement: screens.xs ? 'top' : 'top',
													},
												}}
												style={{
													fontSize: meaningFontSize,
													lineHeight: 1.5,
													color: token.colorTextSecondary,
													// Consistent height prevents layout shift
													minHeight: screens.xs
														? type === 'vocab'
															? 42
															: 63
														: type === 'vocab'
															? 40
															: 60,
													display: '-webkit-box',
													WebkitLineClamp: type === 'vocab' ? 2 : 3,
													WebkitBoxOrient: 'vertical',
													overflow: 'hidden',
												}}
											>
												{meaningText}
											</Text>
										)}
									</Flex>
								</Card>
							</div>
						</Col>
					);
				})}
			</Row>
		</>
	);
}
