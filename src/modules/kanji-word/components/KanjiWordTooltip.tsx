/**
 * KanjiWordTooltip Component
 *
 * Popup tooltip showing vocabulary details on hover/tap
 */
'use client';

import { PlayCircleFilled, RightOutlined } from '@ant-design/icons';
import { Button, Space, Typography, theme } from 'antd';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { TOOLTIP_CONFIG } from '../constants';
import type { KanjiWordTooltipProps } from '../types';
import { parseVocabularyMeanings } from '../utils/meaningParser';
import {
	calculateTooltipPosition,
	createAnimationPortal,
	prefersReducedMotion,
} from '../utils/tooltipHelpers';

const { useToken } = theme;

const { Text, Title } = Typography;

export function KanjiWordTooltip({
	vocab,
	anchorElement,
	onClose,
	onSeeMore,
}: KanjiWordTooltipProps) {
	const tooltipRef = useRef<HTMLDivElement>(null);
	const { token } = useToken();
	const [position, setPosition] = useState<{
		x: number;
		y: number;
		placement: 'top' | 'bottom' | 'left' | 'right';
	}>({
		x: 0,
		y: 0,
		placement: 'top',
	});
	const [isPlayingAudio, setIsPlayingAudio] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	// Derive visibility from props (no state needed)
	const isVisible = Boolean(vocab && anchorElement);

	// Cleanup audio on unmount
	useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current = null;
			}
		};
	}, []);

	// Calculate position when vocab/anchor changes
	// Use useLayoutEffect for synchronous DOM measurements (tooltip positioning)
	// Note: setState in useLayoutEffect is necessary here to avoid flickering during positioning
	// This is a legitimate use case for DOM measurement and synchronous updates
	useLayoutEffect(() => {
		if (!vocab || !anchorElement || !tooltipRef.current) {
			return;
		}

		const tooltipWidth = TOOLTIP_CONFIG.WIDTH;
		const tooltipHeight = TOOLTIP_CONFIG.HEIGHT;

		const pos = calculateTooltipPosition(anchorElement, tooltipWidth, tooltipHeight);

		// Update position synchronously to avoid flickering
		// This is a legitimate use case for setState in useLayoutEffect (DOM measurement)
		setPosition(pos);
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
				// TODO: Show user-friendly error message (e.g., toast notification)
			});

			audioRef.current.onended = () => {
				setIsPlayingAudio(false);
			};
		} else {
			// Fallback: Use Web Speech API
			if ('speechSynthesis' in window) {
				const utterance = new SpeechSynthesisUtterance(vocab.wordSurface);
				utterance.lang = 'ja-JP';
				utterance.rate = 0.8;
				window.speechSynthesis.speak(utterance);
			}
		}
	}, [vocab]);

	const handleSeeMore = useCallback(() => {
		if (vocab && onSeeMore) {
			onSeeMore(vocab.id);
		}
		onClose();
	}, [vocab, onSeeMore, onClose]);

	if (!vocab) return null;

	// Parse meanings using utility function
	const { en: meaningEn, vi: meaningVi } = parseVocabularyMeanings(vocab);

	// Extract tags
	const tags = vocab.tags || [];

	const reducedMotion = prefersReducedMotion();
	const portal = createAnimationPortal('kanji-word-tooltip-portal');

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
				width: `${TOOLTIP_CONFIG.WIDTH}px`,
				minHeight: '280px',
				// Use explicit background properties to avoid conflicts with shorthand 'background'
				backgroundColor: token.colorBgElevated || '#fff',
				backgroundImage: 'none',
				backgroundRepeat: 'no-repeat',
				backgroundPosition: 'initial',
				backgroundSize: 'initial',
				borderRadius: token.borderRadiusLG || 16,
				boxShadow: token.boxShadowSecondary || '0 8px 32px rgba(0, 0, 0, 0.12)',
				border: `1px solid ${token.colorBorder}`,
				padding: token.paddingLG || 24,
				zIndex: TOOLTIP_CONFIG.Z_INDEX,
				pointerEvents: isVisible ? 'auto' : 'none',
				visibility: isVisible ? 'visible' : 'hidden',
				opacity: isVisible ? 1 : 0,
				transform: reducedMotion ? 'none' : isVisible ? 'scale(1)' : 'scale(0.95)',
				transition: reducedMotion
					? 'none'
					: 'opacity 200ms ease, transform 200ms ease, visibility 0s linear 200ms',
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
					{tags.slice(0, 5).map((tag, idx) => (
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

	return createPortal(tooltipContent, portal);
}
