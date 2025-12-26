/**
 * KeywordHighlight Component
 *
 * Renders a clickable keyword with audio playback
 */

'use client';

import { useAudioPlayer } from '@/components/Audio/useAudioPlayer';
import { trackEvent } from '@/lib/analytics';
import { SoundOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useCallback, useEffect, useState } from 'react';

interface KeywordHighlightProps {
	vocabId: string;
	wordSurface: string;
	wordReading?: string;
	audioUrl?: string | null;
	children: React.ReactNode;
}

export function KeywordHighlight({
	vocabId,
	wordSurface,
	wordReading,
	children,
}: KeywordHighlightProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const { speak, stop } = useAudioPlayer({
		rate: 0.8,
		lang: 'ja-JP',
	});

	// Cleanup timeout on unmount to prevent memory leaks
	useEffect(() => {
		if (isPlaying) {
			const timeoutId = setTimeout(() => {
				setIsPlaying(false);
			}, 2000);

			return () => {
				clearTimeout(timeoutId);
			};
		}
	}, [isPlaying]);

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();

			if (isPlaying) {
				stop();
				setIsPlaying(false);
				return;
			}

			// Track keyword tap
			trackEvent('KEYWORD_TAPPED', {
				word_id: vocabId,
				word_text: wordSurface,
			});

			// Play audio (TTS - audioUrl support can be added later)
			speak(wordReading || wordSurface);
			setIsPlaying(true);
		},
		[vocabId, wordSurface, wordReading, isPlaying, speak, stop],
	);

	return (
		<Tooltip title={`Click to hear: ${wordSurface}`} placement="top">
			<span
				onClick={handleClick}
				style={{
					color: '#faad14',
					fontWeight: 600,
					cursor: 'pointer',
					textDecoration: 'underline',
					textDecorationStyle: 'dotted',
					position: 'relative',
					display: 'inline-block',
				}}
			>
				{children}
				{isPlaying && (
					<SoundOutlined
						style={{
							marginLeft: 4,
							fontSize: 12,
							animation: 'pulse 1s infinite',
						}}
					/>
				)}
			</span>
		</Tooltip>
	);
}
