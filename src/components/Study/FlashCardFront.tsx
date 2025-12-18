import { PauseCircleOutlined, SoundOutlined } from '@ant-design/icons';
import { Button, Flex, Grid, Tag, Typography, theme } from 'antd';
import React from 'react';

const { useToken } = theme;
const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

interface FlashCardFrontProps {
	isVocab: boolean;
	frontText: string;
	reading?: string;
	strokes?: number;
	wordParts?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
	romaji?: string;

	// Display Options
	showFurigana: boolean;
	showRomaji: boolean;

	// Audio
	isPlaying: boolean;
	onToggleAudio?: (e: React.MouseEvent) => void;
}

export default function FlashCardFront({
	isVocab,
	frontText,
	reading,
	strokes,
	wordParts,
	romaji,
	showFurigana,
	showRomaji,
	isPlaying,
	onToggleAudio,
}: FlashCardFrontProps) {
	const { token } = useToken();
	const screens = useBreakpoint();

	// Responsive font sizes: smaller on mobile to prevent overflow
	// wordParts layout uses smaller font
	const wordPartsFontSize = screens.md ? 64 : screens.sm ? 56 : 48;
	const singleTextFontSize = screens.md ? 80 : screens.sm ? 64 : 56;

	return (
		<Flex vertical align="center" justify="center" style={{ flex: 1 }}>
			<div
				style={{
					position: 'relative',
					width: '100%',
					textAlign: 'center',
					paddingRight: isVocab && onToggleAudio ? 80 : 0, // More space for audio button
				}}
			>
				{/* Audio Button (Vocab Only) */}
				{isVocab && onToggleAudio && (
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
						onClick={onToggleAudio}
						style={{
							position: 'absolute',
							top: -8, // Slightly higher
							right: 8, // Small margin from edge
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
							e.currentTarget.style.boxShadow = `0 4px 15px ${token.colorPrimary}1a`;
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = 'scale(1)';
							e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
						}}
					/>
				)}

				{/* Tag for Type (Vocab vs Kanji) - Optional but helpful */}
				{/* <div style={{ position: 'absolute', top: 0, left: 0 }}>
					<Tag color={isVocab ? 'geekblue' : 'purple'}>{isVocab ? 'Vocab' : 'Kanji'}</Tag>
				</div> */}

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
										fontSize: `${wordPartsFontSize}px`,
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
							style={{
								fontSize: `${singleTextFontSize}px`,
								margin: '4px 0 16px',
								color: token.colorPrimary,
							}}
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
		</Flex>
	);
}
