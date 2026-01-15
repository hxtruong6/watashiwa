/**
 * Video Player Component
 *
 * Main video element with loading and error states
 */
'use client';

import { Alert, Button, Flex, Skeleton } from 'antd';
import { memo, useCallback, useEffect, useState } from 'react';

import { SEEK_STEP_SECONDS, SWIPE_THRESHOLD_PX } from '../../constants';
import styles from './VideoPlayer.module.css';

interface VideoError extends Error {
	troubleshootingTips?: string[];
}

interface VideoPlayerProps {
	videoUrl: string;
	videoRef: React.RefObject<HTMLVideoElement>;
	onLoaded?: () => void;
	onError?: (error: Error) => void;
	captionTracks?: Array<{
		src: string;
		srclang: string;
		label: string;
		default?: boolean;
	}>;
	onSeek?: (time: number) => void;
}

function VideoPlayerComponent({
	videoUrl,
	videoRef,
	onLoaded,
	onError,
	captionTracks = [],
	onSeek,
}: VideoPlayerProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<VideoError | null>(null);
	const [isBuffering, setIsBuffering] = useState(false);
	const [swipeStart, setSwipeStart] = useState<{ x: number; time: number } | null>(null);

	// Handle swipe gestures for seeking (mobile)
	const handleTouchStart = useCallback(
		(e: React.TouchEvent) => {
			const touch = e.touches[0];
			if (touch && videoRef.current) {
				setSwipeStart({
					x: touch.clientX,
					time: videoRef.current.currentTime,
				});
			}
		},
		[videoRef],
	);

	const handleTouchMove = useCallback(
		(e: React.TouchEvent) => {
			// Prevent default to avoid scrolling while swiping
			if (swipeStart) {
				e.preventDefault();
			}
		},
		[swipeStart],
	);

	const handleTouchEnd = useCallback(
		(e: React.TouchEvent) => {
			if (!swipeStart || !videoRef.current || !onSeek) return;

			const touch = e.changedTouches[0];
			if (!touch) return;

			const deltaX = touch.clientX - swipeStart.x;

			// Only trigger if swipe is significant
			if (Math.abs(deltaX) > SWIPE_THRESHOLD_PX) {
				const currentTime = videoRef.current.currentTime;
				const newTime =
					deltaX > 0
						? currentTime + SEEK_STEP_SECONDS // Swipe right: forward
						: currentTime - SEEK_STEP_SECONDS; // Swipe left: backward

				onSeek(Math.max(0, Math.min(newTime, videoRef.current.duration || 0)));
			}

			setSwipeStart(null);
		},
		[swipeStart, onSeek, videoRef],
	);

	// Handle video loaded
	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		const handleLoadedMetadata = () => {
			setIsLoading(false);
			onLoaded?.();
		};

		const handleWaiting = () => {
			// Video is buffering
			setIsBuffering(true);
		};

		const handleCanPlay = () => {
			// Video can start playing
			setIsBuffering(false);
		};

		const handlePlaying = () => {
			// Video is playing (not buffering)
			setIsBuffering(false);
		};

		const handleError = () => {
			const video = videoRef.current;
			if (!video) return;

			let errorMessage = 'Failed to load video';
			let troubleshootingTips: string[] = [];

			if (video.error) {
				switch (video.error.code) {
					case video.error.MEDIA_ERR_ABORTED:
						errorMessage = 'Video loading was aborted';
						troubleshootingTips = [
							'Check your internet connection',
							'Try refreshing the page',
							'Clear your browser cache',
						];
						break;
					case video.error.MEDIA_ERR_NETWORK:
						errorMessage = 'Network error occurred';
						troubleshootingTips = [
							'Check your internet connection',
							'Try using a different network',
							'Disable VPN if active',
							'Check firewall settings',
						];
						break;
					case video.error.MEDIA_ERR_DECODE:
						errorMessage = 'Video format error';
						troubleshootingTips = [
							'Video file may be corrupted',
							'Try a different browser',
							'Update your browser to the latest version',
						];
						break;
					case video.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
						errorMessage = 'Video format not supported';
						troubleshootingTips = [
							'Your browser may not support this video format',
							'Try using Chrome, Firefox, or Safari',
							'Update your browser to the latest version',
						];
						break;
					default:
						errorMessage = video.error.message || 'Failed to load video';
						troubleshootingTips = [
							'Try refreshing the page',
							'Clear your browser cache',
							'Try a different browser',
						];
				}
			}

			// Store error with troubleshooting tips
			const error = new Error(errorMessage) as VideoError;
			error.troubleshootingTips = troubleshootingTips;
			setLoadError(error);
			setIsLoading(false);
			onError?.(error);
		};

		video.addEventListener('loadedmetadata', handleLoadedMetadata);
		video.addEventListener('error', handleError);
		video.addEventListener('waiting', handleWaiting);
		video.addEventListener('canplay', handleCanPlay);
		video.addEventListener('playing', handlePlaying);

		return () => {
			video.removeEventListener('loadedmetadata', handleLoadedMetadata);
			video.removeEventListener('error', handleError);
			video.removeEventListener('waiting', handleWaiting);
			video.removeEventListener('canplay', handleCanPlay);
			video.removeEventListener('playing', handlePlaying);
		};
	}, [videoRef, onLoaded, onError]);

	const error = loadError;

	return (
		<Flex
			vertical
			align="center"
			justify="center"
			style={{
				width: '100%',
				position: 'relative',
			}}
		>
			{isLoading && (
				<div className={styles.skeletonContainer}>
					<Skeleton.Image
						active
						style={{
							width: '100%',
							aspectRatio: '16/9',
							maxHeight: '600px',
						}}
					/>
				</div>
			)}

			{error && (
				<Alert
					title="Video Error"
					description={
						<div>
							<p style={{ marginBottom: error.troubleshootingTips ? '12px' : 0 }}>
								{error.message}
							</p>
							{error.troubleshootingTips && error.troubleshootingTips.length > 0 && (
								<div>
									<p style={{ marginBottom: '8px', fontWeight: 500 }}>Troubleshooting:</p>
									<ul style={{ margin: 0, paddingLeft: '20px' }}>
										{error.troubleshootingTips.map((tip: string, index: number) => (
											<li key={index} style={{ marginBottom: '4px' }}>
												{tip}
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					}
					type="error"
					showIcon
					action={
						<Button
							size="small"
							type="primary"
							onClick={() => {
								setLoadError(null);
								setIsLoading(true);
								const video = videoRef.current;
								if (video) {
									video.load();
								}
							}}
						>
							Retry
						</Button>
					}
					style={{
						width: '100%',
						marginBottom: 16,
					}}
				/>
			)}

			<video
				ref={videoRef}
				src={videoUrl}
				controls={false}
				className={styles.video}
				style={{
					display: isLoading || error ? 'none' : 'block',
					width: '100%',
					aspectRatio: '16/9',
					maxHeight: '600px',
					objectFit: 'contain',
				}}
				aria-label="Video player"
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
			>
				{/* WebVTT Caption Tracks */}
				{captionTracks.map((track, index) => (
					<track
						key={index}
						kind="captions"
						src={track.src}
						srcLang={track.srclang}
						label={track.label}
						default={track.default}
					/>
				))}
			</video>

			{/* Buffering Indicator */}
			{isBuffering && !isLoading && !error && (
				<div className={styles.bufferingIndicator} aria-live="polite" aria-label="Video buffering">
					<div className={styles.spinner} />
					<span className={styles.bufferingText}>Buffering...</span>
				</div>
			)}
		</Flex>
	);
}

export const VideoPlayer = memo(VideoPlayerComponent);
