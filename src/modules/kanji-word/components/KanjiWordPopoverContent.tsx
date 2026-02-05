/**
 * KanjiWordPopoverContent Component
 *
 * Content component for KanjiWord popover/tooltip
 * Displays vocabulary details with audio playback
 */

'use client';

import { useAudioPlayer } from '@/components/Audio/useAudioPlayer';
import { useTtsSettings } from '@/components/Audio/useTtsSettings';
import { PlayCircleFilled, RightOutlined } from '@ant-design/icons';
import type { Vocabulary } from '@prisma/client';
import { Button, Space, Spin, Typography, theme } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';

import { parseVocabularyMeanings } from '../utils/meaningParser';

const { Text, Title } = Typography;
const { useToken } = theme;

interface KanjiWordPopoverContentProps {
	vocab: Vocabulary | null;
	isLoading?: boolean;
	onSeeMore?: (vocabId: string) => void;
}

export function KanjiWordPopoverContent({
	vocab,
	isLoading = false,
	onSeeMore,
}: KanjiWordPopoverContentProps) {
	const { token } = useToken();
	const [isPlayingAudio, setIsPlayingAudio] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const ttsSettings = useTtsSettings();
	const { speak } = useAudioPlayer({
		rate: ttsSettings.speed,
		voiceUri: ttsSettings.voiceUri,
		lang: 'ja-JP',
	});

	// Cleanup audio on unmount
	useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.currentTime = 0;
				audioRef.current = null;
			}
		};
	}, []);

	const handleAudioClick = useCallback(() => {
		if (!vocab) return;

		if (vocab.audioUrl) {
			// Play actual audio file
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.currentTime = 0;
			}

			audioRef.current = new Audio(vocab.audioUrl);
			setIsPlayingAudio(true);

			audioRef.current.play().catch((error) => {
				console.error('Audio playback failed:', error);
				setIsPlayingAudio(false);
			});

			audioRef.current.onended = () => {
				setIsPlayingAudio(false);
			};
		} else {
			const textToSpeak = vocab.wordReading || vocab.wordSurface;
			if (textToSpeak) speak(textToSpeak);
		}
	}, [vocab, speak]);

	const handleSeeMore = useCallback(() => {
		if (vocab && onSeeMore) {
			onSeeMore(vocab.id);
		}
	}, [vocab, onSeeMore]);

	if (isLoading) {
		return (
			<div
				style={{
					width: 320,
					minHeight: 200,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					gap: token.marginMD || 16,
				}}
			>
				<Spin size="large" />
				<Text type="secondary">Loading word details...</Text>
			</div>
		);
	}

	if (!vocab) return null;

	// Parse meanings using utility function
	const { en: meaningEn, vi: meaningVi } = parseVocabularyMeanings(vocab);

	// Extract tags
	const tags = vocab.tags || [];

	return (
		<div style={{ width: 320, minHeight: 280 }}>
			{/* Word Surface (Kanji/Kana) */}
			<Title
				level={4}
				style={{
					margin: '0 0 8px 0',
					fontSize: '24px',
					fontWeight: 700,
					color: token.colorText,
				}}
			>
				{vocab.wordSurface}
			</Title>

			{/* Reading */}
			<Space direction="vertical" size={4} style={{ width: '100%', marginBottom: 16 }}>
				<Text
					style={{
						display: 'block',
						fontSize: '16px',
						color: token.colorTextSecondary,
					}}
				>
					{vocab.wordReading}
				</Text>
				{vocab.wordRomaji && (
					<Text
						style={{
							display: 'block',
							fontSize: '14px',
							color: token.colorTextTertiary,
							fontStyle: 'italic',
						}}
					>
						{vocab.wordRomaji}
					</Text>
				)}
			</Space>

			{/* Audio Button */}
			<Button
				type="primary"
				icon={<PlayCircleFilled />}
				onClick={handleAudioClick}
				loading={isPlayingAudio}
				size="small"
				style={{
					marginBottom: 16,
				}}
			>
				Play Audio
			</Button>

			{/* Meanings */}
			<Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 16 }}>
				<div>
					<Text
						strong
						style={{
							fontSize: '12px',
							textTransform: 'uppercase',
							color: token.colorTextTertiary,
						}}
					>
						English
					</Text>
					<div>
						<Text style={{ fontSize: '15px', color: token.colorText }}>{meaningEn}</Text>
					</div>
				</div>

				<div>
					<Text
						strong
						style={{
							fontSize: '12px',
							textTransform: 'uppercase',
							color: token.colorTextTertiary,
						}}
					>
						Tiếng Việt
					</Text>
					<div>
						<Text style={{ fontSize: '15px', color: token.colorText }}>{meaningVi}</Text>
					</div>
				</div>

				{/* Hán Việt */}
				{vocab.hanViet && (
					<div
						style={{
							backgroundColor: token.colorPrimaryBg || 'rgba(108, 99, 255, 0.08)',
							padding: token.paddingSM || 12,
							borderRadius: token.borderRadius || 8,
							marginTop: 8,
						}}
					>
						<Text
							strong
							style={{
								fontSize: '12px',
								textTransform: 'uppercase',
								color: token.colorPrimary,
							}}
						>
							Hán Việt
						</Text>
						<div>
							<Text
								style={{
									fontSize: '18px',
									fontWeight: 600,
									color: token.colorPrimary,
								}}
							>
								{vocab.hanViet}
							</Text>
						</div>
					</div>
				)}
			</Space>

			{/* Tags */}
			{tags.length > 0 && (
				<Space wrap size={4} style={{ marginBottom: 16 }}>
					{tags.slice(0, 5).map((tag: string, idx: number) => (
						<span
							key={idx}
							style={{
								display: 'inline-block',
								padding: '2px 8px',
								backgroundColor: token.colorFillSecondary,
								borderRadius: token.borderRadiusSM || 4,
								fontSize: '11px',
								color: token.colorTextSecondary,
							}}
						>
							{tag}
						</span>
					))}
				</Space>
			)}

			{/* See More Link */}
			{onSeeMore && (
				<Button
					type="link"
					icon={<RightOutlined />}
					iconPosition="end"
					onClick={handleSeeMore}
					style={{
						padding: 0,
						height: 'auto',
					}}
				>
					See more details
				</Button>
			)}
		</div>
	);
}
