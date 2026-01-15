/**
 * Video Player Container Component
 *
 * Wraps video player with integrated controls overlay
 * Controls appear on hover/tap for better UX
 */
'use client';

import { Flex } from 'antd';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { CaptionToggle } from './CaptionToggle';
import { VideoControls } from './VideoControls';
import { VideoPlayer } from './VideoPlayer';
import styles from './VideoPlayerContainer.module.css';
import { VideoProgressBar } from './VideoProgressBar';

interface VideoPlayerContainerProps {
	videoUrl: string;
	videoRef: React.RefObject<HTMLVideoElement | null>;
	onSeek: (time: number) => void;
	captionTracks?: Array<{
		src: string;
		srclang: string;
		label: string;
		default?: boolean;
	}>;
	// Player state
	currentTime: number;
	duration: number;
	isPlaying: boolean;
	playbackRate: number;
	play: () => Promise<void>;
	pause: () => void;
	stop: () => void;
	setPlaybackRate: (rate: number) => void;
	// Caption state
	captionsEnabled: boolean;
	onCaptionToggle: (enabled: boolean) => void;
	captionTrackCount: number;
	// Buffered ranges
	bufferedRanges: TimeRanges | null;
}

function VideoPlayerContainerComponent({
	videoUrl,
	videoRef,
	onSeek,
	captionTracks,
	currentTime,
	duration,
	isPlaying,
	playbackRate,
	play,
	pause,
	stop,
	setPlaybackRate,
	captionsEnabled,
	onCaptionToggle,
	captionTrackCount,
	bufferedRanges,
}: VideoPlayerContainerProps) {
	const [showControls, setShowControls] = useState(true);
	const [isHovering, setIsHovering] = useState(false);
	const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Auto-hide controls after 3 seconds when playing
	const handleMouseEnter = useCallback(() => {
		setIsHovering(true);
		setShowControls(true);
		// Clear any pending hide timeout
		if (hideControlsTimeoutRef.current) {
			clearTimeout(hideControlsTimeoutRef.current);
			hideControlsTimeoutRef.current = null;
		}
	}, []);

	const handleMouseLeave = useCallback(() => {
		setIsHovering(false);
		// Clear existing timeout
		if (hideControlsTimeoutRef.current) {
			clearTimeout(hideControlsTimeoutRef.current);
		}
		if (isPlaying) {
			// Hide controls after delay when playing
			hideControlsTimeoutRef.current = setTimeout(() => {
				setIsHovering((prev) => {
					if (!prev) {
						setShowControls(false);
					}
					return prev;
				});
				hideControlsTimeoutRef.current = null;
			}, 3000);
		}
	}, [isPlaying]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (hideControlsTimeoutRef.current) {
				clearTimeout(hideControlsTimeoutRef.current);
			}
		};
	}, []);

	// Show controls when paused
	const handlePlay = useCallback(async () => {
		await play();
		setShowControls(true);
	}, [play]);

	const handlePause = useCallback(() => {
		pause();
		setShowControls(true);
	}, [pause]);

	return (
		<div
			className={styles.container}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onTouchStart={() => setShowControls(true)}
		>
			{/* Video Player */}
			<div className={styles.videoWrapper}>
				<VideoPlayer
					videoUrl={videoUrl}
					videoRef={videoRef as React.RefObject<HTMLVideoElement>}
					onSeek={onSeek}
					captionTracks={captionTracks}
				/>

				{/* Controls Overlay */}
				<div className={`${styles.controlsOverlay} ${showControls ? styles.visible : ''}`}>
					{/* Progress Bar */}
					<div className={styles.progressBarWrapper}>
						<VideoProgressBar
							currentTime={currentTime}
							duration={duration}
							bufferedRanges={bufferedRanges}
							onSeek={onSeek}
						/>
					</div>

					{/* Controls */}
					<div className={styles.controlsWrapper}>
						<Flex justify="center" align="center" gap="middle" wrap="wrap">
							<VideoControls
								isPlaying={isPlaying}
								playbackRate={playbackRate}
								play={handlePlay}
								pause={handlePause}
								stop={stop}
								setPlaybackRate={setPlaybackRate}
							/>
							<CaptionToggle
								isEnabled={captionsEnabled}
								onToggle={onCaptionToggle}
								trackCount={captionTrackCount}
							/>
						</Flex>
					</div>
				</div>
			</div>
		</div>
	);
}

export const VideoPlayerContainer = memo(VideoPlayerContainerComponent);
