/**
 * Video Controls Component
 *
 * Playback controls: play/pause, stop, speed selector
 */
'use client';

import { PauseCircleOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { Badge, Button, Flex, Select, Space } from 'antd';
import { memo, useCallback } from 'react';

import { PLAYBACK_RATE_OPTIONS } from '../../constants';

// Type assertion needed because Ant Design Select expects mutable array
const PLAYBACK_RATE_OPTIONS_MUTABLE = [...PLAYBACK_RATE_OPTIONS] as Array<{
	label: string;
	value: number;
}>;

interface VideoControlsProps {
	isPlaying: boolean;
	playbackRate: number;
	play: () => Promise<void>;
	pause: () => void;
	stop: () => void;
	setPlaybackRate: (rate: number) => void;
}

function VideoControlsComponent({
	isPlaying,
	playbackRate,
	play,
	pause,
	stop,
	setPlaybackRate,
}: VideoControlsProps) {
	const handlePlayPause = useCallback(() => {
		if (isPlaying) {
			pause();
		} else {
			play();
		}
	}, [isPlaying, play, pause]);

	const handleSpeedChange = useCallback(
		(value: number) => {
			setPlaybackRate(value);
		},
		[setPlaybackRate],
	);

	return (
		<Flex
			justify="center"
			align="center"
			gap="middle"
			wrap="wrap"
			role="toolbar"
			aria-label="Video playback controls"
			style={{
				width: '100%',
				padding: 'var(--spacing-md) var(--spacing-sm)',
			}}
			className="video-controls"
		>
			<Space size="middle" wrap>
				<Button
					type="primary"
					size="large"
					icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
					onClick={handlePlayPause}
					aria-label={isPlaying ? 'Pause video' : 'Play video'}
					aria-pressed={isPlaying}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							handlePlayPause();
						}
					}}
					style={{
						minWidth: '80px',
						minHeight: '48px', // Mobile touch target
						touchAction: 'manipulation',
					}}
					className="video-control-button"
				>
					{isPlaying ? 'Pause' : 'Play'}
				</Button>

				<Button
					size="large"
					icon={<StopOutlined />}
					onClick={stop}
					aria-label="Stop video and reset to beginning"
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							stop();
						}
					}}
					style={{
						minWidth: '80px',
						minHeight: '48px', // Mobile touch target
						touchAction: 'manipulation',
					}}
					className="video-control-button"
				>
					Stop
				</Button>

				<Flex align="center" gap="small">
					<Select
						value={playbackRate}
						onChange={handleSpeedChange}
						options={PLAYBACK_RATE_OPTIONS_MUTABLE}
						style={{
							width: 100,
							minWidth: 80,
							minHeight: '48px', // Mobile touch target
						}}
						size="large"
						aria-label="Playback speed selector"
						aria-describedby="speed-description"
						className="video-speed-select"
					/>
					{playbackRate !== 1.0 && (
						<Badge
							count={`${playbackRate}x`}
							style={{
								backgroundColor: 'rgba(24, 144, 255, 0.8)',
								fontSize: '12px',
								fontWeight: 600,
								minWidth: '36px',
								height: '24px',
								lineHeight: '24px',
								borderRadius: '12px',
							}}
							title={`Playing at ${playbackRate}x speed`}
						/>
					)}
				</Flex>
				<span id="speed-description" className="sr-only">
					Current playback speed: {playbackRate}x
				</span>
			</Space>
		</Flex>
	);
}

export const VideoControls = memo(VideoControlsComponent);
