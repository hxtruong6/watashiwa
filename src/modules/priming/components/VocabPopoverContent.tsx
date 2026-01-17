/**
 * VocabPopoverContent Component
 *
 * Shared content component for vocabulary popover/tooltip
 * Used by both SmartTooltip (priming) and KanjiWordTooltip (kanji-word)
 */

'use client';

import { PlayCircleFilled } from '@ant-design/icons';
import { Button, Space, Spin, Typography, theme } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { VocabMeta } from '../types';

const { Text, Title } = Typography;
const { useToken } = theme;

interface VocabPopoverContentProps {
	vocab: VocabMeta | null;
	isCollected?: boolean;
	isLoading?: boolean;
	onAudioPlay?: (vocabularyId: string) => void;
	autoPlayAudio?: boolean;
}

export function VocabPopoverContent({
	vocab,
	isCollected = false,
	isLoading = false,
	onAudioPlay,
	autoPlayAudio = false,
}: VocabPopoverContentProps) {
	const { token } = useToken();
	const [isPlayingAudio, setIsPlayingAudio] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

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

	// Auto-play audio when popover opens
	useEffect(() => {
		if (!vocab || !autoPlayAudio || !vocab.audioUrl) return;

		const autoPlayTimer = setTimeout(() => {
			handleAudioClick();
		}, 300);

		return () => clearTimeout(autoPlayTimer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [vocab, autoPlayAudio]);

	const handleAudioClick = useCallback(() => {
		if (!vocab) return;

		// Only play if audioUrl exists
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

			onAudioPlay?.(vocab.vocabularyId);
		} else {
			// Fallback: Use Web Speech API (only if no audioUrl)
			if ('speechSynthesis' in window) {
				const utterance = new SpeechSynthesisUtterance(vocab.wordSurface);
				utterance.lang = 'ja-JP';
				utterance.rate = 0.8;
				window.speechSynthesis.speak(utterance);
				onAudioPlay?.(vocab.vocabularyId);
			}
		}
	}, [vocab, onAudioPlay]);

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

	return (
		<div style={{ width: 320, minHeight: 260 }}>
			{/* Word Surface (Kanji/Kana) */}
			<Title
				level={3}
				style={{
					margin: '0 0 8px 0',
					fontSize: '28px',
					fontWeight: 700,
					color: token.colorText || '#1a1a1a',
				}}
			>
				{vocab.wordSurface}
			</Title>

			{/* Reading (Romaji/Furigana) */}
			<Text
				style={{
					display: 'block',
					fontSize: '16px',
					color: token.colorTextSecondary || '#666',
					marginBottom: '16px',
				}}
			>
				{vocab.wordReading}
			</Text>

			{/* Audio Button - Only show if audioUrl exists */}
			{vocab.audioUrl && (
				<Button
					type="primary"
					icon={<PlayCircleFilled />}
					onClick={handleAudioClick}
					loading={isPlayingAudio}
					size="small"
					style={{
						marginBottom: '16px',
					}}
				>
					Play Audio
				</Button>
			)}

			{/* Meanings */}
			<Space orientation="vertical" size={8} style={{ width: '100%', marginBottom: '16px' }}>
				<div>
					<Text strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#999' }}>
						English
					</Text>
					<div>
						<Text style={{ fontSize: '16px', color: token.colorText || '#333' }}>
							{vocab.meaningEn}
						</Text>
					</div>
				</div>

				<div>
					<Text strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#999' }}>
						Tiếng Việt
					</Text>
					<div>
						<Text style={{ fontSize: '16px', color: token.colorText || '#333' }}>
							{vocab.meaningVi}
						</Text>
					</div>
				</div>

				{/* Hán Việt (Critical for Vietnamese learners) */}
				{vocab.hanViet && (
					<div
						style={{
							backgroundColor: token.colorPrimaryBg || 'rgba(108, 99, 255, 0.08)',
							padding: '12px',
							borderRadius: '8px',
							marginTop: '8px',
						}}
					>
						<Text
							strong
							style={{
								fontSize: '12px',
								textTransform: 'uppercase',
								color: token.colorPrimary || '#6C63FF',
							}}
						>
							Hán Việt
						</Text>
						<div>
							<Text
								style={{
									fontSize: '18px',
									fontWeight: 600,
									color: token.colorPrimary || '#6C63FF',
								}}
							>
								{vocab.hanViet}
							</Text>
						</div>
					</div>
				)}
			</Space>

			{/* Collection Status Badge */}
			{isCollected && (
				<div
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: '6px',
						padding: '6px 12px',
						backgroundColor: token.colorPrimaryBg || 'rgba(108, 99, 255, 0.1)',
						borderRadius: '20px',
						fontSize: '13px',
						fontWeight: 600,
						color: token.colorPrimary || '#6C63FF',
					}}
				>
					<span>✓</span>
					<span>Collected</span>
				</div>
			)}
		</div>
	);
}
