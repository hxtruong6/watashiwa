/**
 * Video Progress Bar Component
 *
 * Displays video progress with seek functionality, buffered segments, and time display
 * Mobile-first design with touch-optimized controls
 */
'use client';

import { theme } from 'antd';
import { Typography } from 'antd';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import styles from './VideoProgressBar.module.css';

const { Text } = Typography;

interface VideoProgressBarProps {
	currentTime: number;
	duration: number;
	bufferedRanges?: TimeRanges | null;
	onSeek: (time: number) => void;
}

interface BufferedSegment {
	start: number;
	end: number;
}

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
function formatTime(seconds: number): string {
	if (!isFinite(seconds) || isNaN(seconds)) return '0:00';

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
	return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse TimeRanges to buffered segments array
 */
function parseBufferedRanges(ranges: TimeRanges | null): BufferedSegment[] {
	if (!ranges || ranges.length === 0) return [];

	const segments: BufferedSegment[] = [];
	for (let i = 0; i < ranges.length; i++) {
		segments.push({
			start: ranges.start(i),
			end: ranges.end(i),
		});
	}
	return segments;
}

function VideoProgressBarComponent({
	currentTime,
	duration,
	bufferedRanges,
	onSeek,
}: VideoProgressBarProps) {
	const { token } = theme.useToken();
	const progressBarRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [hoverTime, setHoverTime] = useState<number | null>(null);
	const [isHovering, setIsHovering] = useState(false);

	// Calculate progress percentage
	const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

	// Parse buffered ranges
	const bufferedSegments = parseBufferedRanges(bufferedRanges ?? null);

	// Handle click/touch on progress bar
	const handleSeek = useCallback(
		(clientX: number) => {
			const bar = progressBarRef.current;
			if (!bar || duration <= 0) return;

			const rect = bar.getBoundingClientRect();
			const x = clientX - rect.left;
			const percentage = Math.max(0, Math.min(1, x / rect.width));
			const seekTime = percentage * duration;

			onSeek(seekTime);
		},
		[duration, onSeek],
	);

	// Mouse/touch event handlers
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			setIsDragging(true);
			handleSeek(e.clientX);
		},
		[handleSeek],
	);

	const handleTouchStart = useCallback(
		(e: React.TouchEvent) => {
			e.preventDefault();
			setIsDragging(true);
			const touch = e.touches[0];
			if (touch) {
				handleSeek(touch.clientX);
			}
		},
		[handleSeek],
	);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging) return;

			const bar = progressBarRef.current;
			if (!bar || duration <= 0) return;

			const rect = bar.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const percentage = Math.max(0, Math.min(1, x / rect.width));
			const hoverTimeValue = percentage * duration;

			setHoverTime(hoverTimeValue);
			handleSeek(e.clientX);
		},
		[isDragging, duration, handleSeek],
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
		setHoverTime(null);
	}, []);

	const handleMouseEnter = useCallback(() => {
		setIsHovering(true);
	}, []);

	const handleMouseLeave = useCallback(() => {
		setIsHovering(false);
		if (!isDragging) {
			setHoverTime(null);
		}
	}, [isDragging]);

	const handleMouseMoveOver = useCallback(
		(e: React.MouseEvent) => {
			if (duration <= 0) return;

			const bar = progressBarRef.current;
			if (!bar) return;

			const rect = bar.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const percentage = Math.max(0, Math.min(1, x / rect.width));
			const hoverTimeValue = percentage * duration;

			setHoverTime(hoverTimeValue);
		},
		[duration],
	);

	// Global mouse events for dragging
	useEffect(() => {
		if (isDragging) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
			document.addEventListener('touchmove', (e) => {
				if (isDragging) {
					e.preventDefault();
					const touch = e.touches[0];
					if (touch) {
						handleSeek(touch.clientX);
					}
				}
			});
			document.addEventListener('touchend', handleMouseUp);

			return () => {
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			};
		}
	}, [isDragging, handleMouseMove, handleMouseUp, handleSeek]);

	return (
		<div
			className={styles.container}
			style={{
				padding: 'var(--spacing-sm) var(--spacing-md)',
			}}
		>
			{/* Time Display */}
			<div className={styles.timeDisplay}>
				<Text
					type="secondary"
					style={{
						fontSize: '14px',
						color: token.colorTextSecondary,
						fontFamily: 'monospace',
					}}
				>
					{formatTime(currentTime)}
				</Text>
				<Text
					type="secondary"
					style={{
						fontSize: '14px',
						color: token.colorTextSecondary,
						fontFamily: 'monospace',
					}}
				>
					{formatTime(duration)}
				</Text>
			</div>

			{/* Progress Bar */}
			<div
				ref={progressBarRef}
				className={styles.progressBar}
				onMouseDown={handleMouseDown}
				onTouchStart={handleTouchStart}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				onMouseMove={handleMouseMoveOver}
				role="slider"
				aria-label="Video progress"
				aria-valuemin={0}
				aria-valuemax={duration}
				aria-valuenow={currentTime}
				aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}, ${Math.round(progress)}% complete`}
				tabIndex={0}
				aria-live="polite"
				aria-atomic="true"
				onKeyDown={(e) => {
					// Keyboard navigation: Arrow keys for seeking
					if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
						e.preventDefault();
						const delta = e.key === 'ArrowLeft' ? -5 : 5;
						const newTime = Math.max(0, Math.min(duration, currentTime + delta));
						onSeek(newTime);
					}
				}}
				style={{
					backgroundColor: token.colorBorderSecondary,
					borderRadius: token.borderRadius,
					position: 'relative',
					cursor: 'pointer',
					touchAction: 'none',
				}}
			>
				{/* Buffered Segments */}
				{bufferedSegments.map((segment, index) => {
					const startPercent = (segment.start / duration) * 100;
					const endPercent = (segment.end / duration) * 100;
					const width = endPercent - startPercent;

					return (
						<div
							key={index}
							className={styles.bufferedSegment}
							style={{
								left: `${startPercent}%`,
								width: `${width}%`,
								backgroundColor: token.colorBorder,
								opacity: 0.3,
							}}
						/>
					);
				})}

				{/* Progress Fill */}
				<div
					className={styles.progressFill}
					style={{
						width: `${progress}%`,
						backgroundColor: token.colorPrimary,
						borderRadius: token.borderRadius,
					}}
				/>

				{/* Progress Handle */}
				<div
					className={styles.progressHandle}
					style={{
						left: `${progress}%`,
						backgroundColor: token.colorPrimary,
						borderColor: token.colorBgBase,
						transform: isHovering || isDragging ? 'scale(1.2)' : 'scale(1)',
						transition: 'transform 0.2s ease',
					}}
				/>

				{/* Hover Tooltip */}
				{isHovering && hoverTime !== null && (
					<div
						className={styles.hoverTooltip}
						style={{
							left: `${(hoverTime / duration) * 100}%`,
							backgroundColor: token.colorBgContainer,
							color: token.colorText,
							border: `1px solid ${token.colorBorder}`,
						}}
					>
						{formatTime(hoverTime)}
					</div>
				)}
			</div>
		</div>
	);
}

export const VideoProgressBar = memo(VideoProgressBarComponent);
