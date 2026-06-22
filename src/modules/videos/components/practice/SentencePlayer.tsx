'use client';

import {
	AudioOutlined,
	PauseCircleOutlined,
	PlayCircleOutlined,
	ReloadOutlined,
} from '@ant-design/icons';
import { Button, Flex, Select, Slider, Space, Tooltip } from 'antd';
import { useTranslations } from 'next-intl';
import { memo, useCallback } from 'react';

const PRACTICE_SPEED_OPTIONS = [
	{ label: '0.5x', value: 0.5 },
	{ label: '0.75x', value: 0.75 },
	{ label: '1x', value: 1.0 },
	{ label: '1.25x', value: 1.25 },
	{ label: '1.5x', value: 1.5 },
] as const;

export interface SentencePlayerProps {
	videoUrl: string;
	videoRef: React.RefObject<HTMLVideoElement | null>;
	isPlaying: boolean;
	playbackRate: number;
	volume: number;
	isMuted: boolean;
	playCurrentSentence: () => Promise<void>;
	repeatCurrentSentence: () => Promise<void>;
	play: () => Promise<void>;
	pause: () => void;
	setPlaybackRate: (rate: number) => void;
	setVolume: (v: number) => void;
	toggleMute: () => void;
	disabled?: boolean;
}

function SentencePlayerComponent({
	videoUrl,
	videoRef,
	isPlaying,
	playbackRate,
	volume,
	isMuted,
	playCurrentSentence,
	repeatCurrentSentence,
	pause,
	setPlaybackRate,
	setVolume,
	toggleMute,
	disabled = false,
}: SentencePlayerProps) {
	const t = useTranslations('Practice');

	const handlePlayPause = useCallback(async () => {
		if (isPlaying) {
			pause();
		} else {
			await playCurrentSentence();
		}
	}, [isPlaying, pause, playCurrentSentence]);

	return (
		<Flex vertical gap="small" style={{ width: '100%' }}>
			<video
				ref={videoRef}
				src={videoUrl}
				controls={false}
				playsInline
				style={{
					width: '100%',
					maxHeight: 220,
					objectFit: 'contain',
					backgroundColor: '#0a0a0a',
					borderRadius: 'var(--ant-borderRadiusLG, 8px)',
					border: '1px solid var(--ant-colorBorderSecondary)',
				}}
			/>
			<Flex
				justify="center"
				align="center"
				gap="middle"
				wrap="wrap"
				role="toolbar"
				aria-label="Sentence playback controls"
			>
				<Tooltip title={t('play')}>
					<Button
						type="primary"
						size="large"
						icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
						onClick={handlePlayPause}
						disabled={disabled}
						aria-label={t('play')}
					/>
				</Tooltip>
				<Tooltip title={t('repeat')}>
					<Button
						size="large"
						icon={<ReloadOutlined />}
						onClick={repeatCurrentSentence}
						disabled={disabled}
						aria-label={t('repeat')}
					/>
				</Tooltip>
				<Tooltip title={t('speed')}>
					<Select
						value={playbackRate}
						onChange={setPlaybackRate}
						options={[...PRACTICE_SPEED_OPTIONS]}
						style={{ width: 80 }}
						size="large"
						aria-label={t('speed')}
						disabled={disabled}
					/>
				</Tooltip>
				<Tooltip title={t('volume')}>
					<Space>
						<Button
							size="large"
							icon={<AudioOutlined />}
							onClick={toggleMute}
							aria-label={t('volume')}
							disabled={disabled}
						/>
						<Slider
							min={0}
							max={1}
							step={0.1}
							value={isMuted ? 0 : volume}
							onChange={setVolume}
							style={{ width: 80 }}
							disabled={disabled}
						/>
					</Space>
				</Tooltip>
			</Flex>
		</Flex>
	);
}

export const SentencePlayer = memo(SentencePlayerComponent);
