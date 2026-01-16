/**
 * SmartTooltip Component
 *
 * Smart pop-up for vocabulary details
 * Shows Kanji/Kana, Romaji/Furigana, meanings, Hán Việt, and audio playback
 */

'use client';

import { PlayCircleFilled } from '@ant-design/icons';
import { Button, Space, Typography } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { VocabMeta } from '../types';
import {
	calculateTooltipPosition,
	createAnimationPortal,
	prefersReducedMotion,
} from '../utils/animationHelpers';

const { Text, Title } = Typography;

interface SmartTooltipProps {
	vocab: VocabMeta | null;
	anchorElement: HTMLElement | null;
	isCollected: boolean;
	onClose: () => void;
	onAudioPlay: (vocabularyId: string) => void;
}

export function SmartTooltip({
	vocab,
	anchorElement,
	isCollected,
	onClose,
	onAudioPlay,
}: SmartTooltipProps) {
	const tooltipRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState({ x: 0, y: 0, placement: 'top' as const });
	const [isVisible, setIsVisible] = useState(false);
	const [isPlayingAudio, setIsPlayingAudio] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	// Calculate position when vocab/anchor changes
	useEffect(() => {
		if (!vocab || !anchorElement || !tooltipRef.current) return;

		const tooltipWidth = 320;
		const tooltipHeight = 260;

		const pos = calculateTooltipPosition(anchorElement, tooltipWidth, tooltipHeight);
		setPosition(pos);
		setIsVisible(true);
	}, [vocab, anchorElement]);

	// Close on outside click
	useEffect(() => {
		if (!vocab) return;

		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (
				tooltipRef.current &&
				!tooltipRef.current.contains(target) &&
				!anchorElement?.contains(target)
			) {
				onClose();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [vocab, anchorElement, onClose]);

	// Close on ESC key
	useEffect(() => {
		if (!vocab) return;

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [vocab, onClose]);

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

			onAudioPlay(vocab.vocabularyId);
		} else {
			// Fallback: Use Web Speech API
			if ('speechSynthesis' in window) {
				const utterance = new SpeechSynthesisUtterance(vocab.wordSurface);
				utterance.lang = 'ja-JP';
				utterance.rate = 0.8;
				window.speechSynthesis.speak(utterance);
				onAudioPlay(vocab.vocabularyId);
			}
		}
	}, [vocab, onAudioPlay]);

	if (!vocab) return null;

	const reducedMotion = prefersReducedMotion();
	const portal = createAnimationPortal('tooltip-portal');

	const tooltipContent = (
		<div
			ref={tooltipRef}
			role="dialog"
			aria-label="Word details"
			aria-modal="false"
			style={{
				position: 'fixed',
				left: `${position.x}px`,
				top: `${position.y}px`,
				width: '320px',
				minHeight: '260px',
				backgroundColor: '#fff',
				borderRadius: '16px',
				boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)',
				padding: '24px',
				zIndex: 10000,
				pointerEvents: 'auto',
				opacity: isVisible ? 1 : 0,
				transform: reducedMotion ? 'none' : isVisible ? 'scale(1)' : 'scale(0.95)',
				transition: reducedMotion ? 'none' : 'opacity 200ms ease, transform 200ms ease',
			}}
		>
			{/* Close button */}
			<Button
				type="text"
				size="small"
				onClick={onClose}
				style={{
					position: 'absolute',
					top: '8px',
					right: '8px',
					padding: '4px',
					minWidth: 'auto',
				}}
				aria-label="Close tooltip"
			>
				✕
			</Button>

			{/* Word Surface (Kanji/Kana) */}
			<Title
				level={3}
				style={{
					margin: '0 0 8px 0',
					fontSize: '28px',
					fontWeight: 700,
					color: '#1a1a1a',
				}}
			>
				{vocab.wordSurface}
			</Title>

			{/* Reading (Romaji/Furigana) */}
			<Text
				style={{
					display: 'block',
					fontSize: '16px',
					color: '#666',
					marginBottom: '16px',
				}}
			>
				{vocab.wordReading}
			</Text>

			{/* Audio Button */}
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

			{/* Meanings */}
			<Space direction="vertical" size={8} style={{ width: '100%', marginBottom: '16px' }}>
				<div>
					<Text strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#999' }}>
						English
					</Text>
					<div>
						<Text style={{ fontSize: '16px', color: '#333' }}>{vocab.meaningEn}</Text>
					</div>
				</div>

				<div>
					<Text strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#999' }}>
						Tiếng Việt
					</Text>
					<div>
						<Text style={{ fontSize: '16px', color: '#333' }}>{vocab.meaningVi}</Text>
					</div>
				</div>

				{/* Hán Việt (Critical for Vietnamese learners) */}
				{vocab.hanViet && (
					<div
						style={{
							backgroundColor: 'rgba(108, 99, 255, 0.08)',
							padding: '12px',
							borderRadius: '8px',
							marginTop: '8px',
						}}
					>
						<Text strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6C63FF' }}>
							Hán Việt
						</Text>
						<div>
							<Text style={{ fontSize: '18px', fontWeight: 600, color: '#6C63FF' }}>
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
						backgroundColor: 'rgba(108, 99, 255, 0.1)',
						borderRadius: '20px',
						fontSize: '13px',
						fontWeight: 600,
						color: '#6C63FF',
					}}
				>
					<span>✓</span>
					<span>Collected</span>
				</div>
			)}
		</div>
	);

	return createPortal(tooltipContent, portal);
}
