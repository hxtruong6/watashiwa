/**
 * Video Learning Page - Client Component
 *
 * Coordinates all video learning components
 */
'use client';

import { Alert, Button, Flex } from 'antd';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { memo, useCallback, useEffect, useState } from 'react';

import { useSubtitleSync } from '../hooks/useSubtitleSync';
import { useVideoKeyboardShortcuts } from '../hooks/useVideoKeyboardShortcuts';
import { useVideoPlayer } from '../hooks/useVideoPlayer';
import { useVideoProgress } from '../hooks/useVideoProgress';
import type { Video, VideoProgress } from '../types';
import { CompletionCelebration } from './VideoPlayer/CompletionCelebration';
import { ResumePrompt } from './VideoPlayer/ResumePrompt';
import SubtitleDisplay from './VideoPlayer/SubtitleDisplay';
import TranslationDisplay from './VideoPlayer/TranslationDisplay';
import { VideoPlayerContainer } from './VideoPlayer/VideoPlayerContainer';

interface VideoLearningPageProps {
	video: Video;
	initialProgress: VideoProgress | null;
}

function VideoLearningPageComponent({ video, initialProgress }: VideoLearningPageProps) {
	const t = useTranslations('Practice');
	const videoPlayer = useVideoPlayer();
	const {
		currentTime,
		duration,
		isPlaying,
		videoRef,
		seek,
		play,
		pause,
		stop,
		setPlaybackRate,
		playbackRate,
		volume,
		setVolume,
		toggleMute,
	} = videoPlayer;

	// Keyboard shortcuts
	useVideoKeyboardShortcuts({
		videoRef,
		isPlaying,
		play,
		pause,
		seek,
		setVolume,
		toggleMute,
		volume,
		duration,
		enabled: true,
	});

	// Caption state
	const [captionsEnabled, setCaptionsEnabled] = useState(false);
	const [bufferedRanges, setBufferedRanges] = useState<TimeRanges | null>(null);
	const [captionTrackCount, setCaptionTrackCount] = useState(0);

	// Resume prompt state
	const [showResumePrompt, setShowResumePrompt] = useState(false);
	// Lazy initialization for localStorage preference
	const [dontAskResume, setDontAskResume] = useState(() => {
		if (typeof window !== 'undefined') {
			return localStorage.getItem('video-resume-dont-ask') === 'true';
		}
		return false;
	});

	// Completion celebration state
	const [showCompletion, setShowCompletion] = useState(false);

	// Update buffered ranges and caption track count
	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		const updateBuffered = () => {
			setBufferedRanges(video.buffered);
		};

		const updateCaptionTracks = () => {
			setCaptionTrackCount(video.textTracks?.length || 0);
		};

		video.addEventListener('progress', updateBuffered);
		video.addEventListener('loadedmetadata', updateBuffered);
		video.addEventListener('loadedmetadata', updateCaptionTracks);

		// Initial check
		updateCaptionTracks();

		return () => {
			video.removeEventListener('progress', updateBuffered);
			video.removeEventListener('loadedmetadata', updateBuffered);
			video.removeEventListener('loadedmetadata', updateCaptionTracks);
		};
	}, [videoRef]);

	// Toggle captions
	const handleCaptionToggle = useCallback(
		(enabled: boolean) => {
			setCaptionsEnabled(enabled);
			const video = videoRef.current;
			if (video && video.textTracks) {
				for (let i = 0; i < video.textTracks.length; i++) {
					video.textTracks[i].mode = enabled ? 'showing' : 'hidden';
				}
			}
		},
		[videoRef],
	);

	// Validate subtitles - computed once on mount
	const subtitleError = (() => {
		if (video.subtitles.length === 0) {
			return 'No subtitles available for this video';
		}
		// Validate subtitle timing
		const hasInvalidTiming = video.subtitles.some((sub) => {
			if (sub.startTime >= sub.endTime) return true;
			if (sub.words.some((word) => word.startTime >= word.endTime)) return true;
			return false;
		});

		if (hasInvalidTiming) {
			return 'Some subtitles have invalid timing data';
		}
		return null;
	})();

	// Show resume prompt if there's saved progress
	useEffect(() => {
		// Use setTimeout to avoid synchronous setState in effect
		const timer = setTimeout(() => {
			if (
				initialProgress &&
				initialProgress.currentTime > 0 &&
				!dontAskResume &&
				duration > 0 &&
				initialProgress.currentTime < duration - 5 // Don't show if less than 5s remaining (RESUME_PROMPT_MIN_TIME_REMAINING_SECONDS)
			) {
				setShowResumePrompt(true);
			}
		}, 0);
		return () => clearTimeout(timer);
	}, [initialProgress, dontAskResume, duration]);

	// Handle resume prompt actions
	const handleResume = useCallback(() => {
		if (initialProgress) {
			seek(initialProgress.currentTime);
		}
		setShowResumePrompt(false);
	}, [initialProgress, seek]);

	const handleStartFromBeginning = useCallback(() => {
		seek(0);
		setShowResumePrompt(false);
	}, [seek]);

	const handleDontAskAgain = useCallback(() => {
		setDontAskResume(true);
		// Save user preference to localStorage with error handling
		try {
			localStorage.setItem('video-resume-dont-ask', 'true');
		} catch (error) {
			// localStorage unavailable (private mode, quota exceeded)
			console.warn('Failed to save preference to localStorage:', error);
			// TODO: Consider saving to backend instead
		}
	}, []);

	// Track progress
	const { progress: videoProgress } = useVideoProgress({
		videoId: video.id,
		currentTime,
		duration,
		isPlaying,
		onCompleted: () => {
			// Show completion modal when video completes
			setShowCompletion(true);
		},
	});

	// Subtitle sync - already memoized internally in hook
	const { activeSubtitle, activeWordIndex } = useSubtitleSync(currentTime, video.subtitles);

	return (
		<Flex
			vertical
			align="center"
			role="main"
			aria-label="Video learning player"
			style={{
				width: '100%',
				maxWidth: '1200px',
				margin: '0 auto',
				padding: '24px 16px',
			}}
			className="video-learning-page"
		>
			{/* Screen reader status announcements */}
			<div
				aria-live="polite"
				aria-atomic="true"
				className="sr-only"
				aria-label="Video playback status"
			>
				{isPlaying ? 'Video playing' : 'Video paused'}
				{', '}
				{Math.round((currentTime / duration) * 100)}% complete
			</div>
			{/* Video Player with Integrated Controls */}
			<VideoPlayerContainer
				videoUrl={video.videoUrl}
				videoRef={videoRef}
				onSeek={seek}
				captionTracks={[]} // TODO: Add caption tracks from video data
				currentTime={currentTime}
				duration={duration}
				isPlaying={isPlaying}
				playbackRate={playbackRate}
				play={play}
				pause={pause}
				stop={stop}
				setPlaybackRate={setPlaybackRate}
				captionsEnabled={captionsEnabled}
				onCaptionToggle={handleCaptionToggle}
				captionTrackCount={captionTrackCount}
				bufferedRanges={bufferedRanges}
			/>

			{/* Subtitle Display */}
			<div style={{ width: '100%', marginTop: 'var(--spacing-md)' }}>
				{subtitleError ? (
					<Alert
						title="Subtitle Warning"
						description={subtitleError}
						type="warning"
						showIcon
						style={{ marginBottom: 16 }}
					/>
				) : null}
				<SubtitleDisplay subtitle={activeSubtitle} activeWordIndex={activeWordIndex} />
			</div>

			{/* Translation Display */}
			<div style={{ width: '100%' }}>
				<TranslationDisplay subtitle={activeSubtitle} />
			</div>

			{/* Practice link */}
			{video.subtitles.length > 0 && (
				<div style={{ width: '100%', marginTop: 'var(--spacing-md)' }}>
					<Link href={`/learn/videos/${video.id}/practice`}>
						<Button type="default" size="large">
							{t('practice')}
						</Button>
					</Link>
				</div>
			)}

			{/* Resume Prompt Modal */}
			{initialProgress && (
				<ResumePrompt
					open={showResumePrompt}
					currentTime={initialProgress.currentTime}
					duration={duration}
					onResume={handleResume}
					onStartFromBeginning={handleStartFromBeginning}
					onDontAskAgain={handleDontAskAgain}
				/>
			)}

			{/* Completion Celebration Modal */}
			<CompletionCelebration
				open={showCompletion}
				watchTime={videoProgress?.watchTime || 0}
				onClose={() => setShowCompletion(false)}
			/>
		</Flex>
	);
}

// Memoize to prevent unnecessary re-renders
export const VideoLearningPage = memo(VideoLearningPageComponent);
