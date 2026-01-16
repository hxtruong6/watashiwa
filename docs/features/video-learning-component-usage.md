# Video Learning Component Usage Guide

## Overview

The Video Learning feature consists of several React components that work together to provide a complete video learning experience with real-time subtitle highlighting and translation.

## Components

### `VideoLearningPage`

Main page component that orchestrates all video learning components.

**Props:**

```typescript
interface VideoLearningPageProps {
	video: Video;
	initialProgress: VideoProgress | null;
}
```

**Usage:**

```typescript
import { VideoLearningPage } from '@/modules/videos/components';

<VideoLearningPage
  video={videoData}
  initialProgress={userProgress}
/>
```

**Features:**

- Coordinates video player, controls, subtitles, and translation
- Handles progress tracking and auto-save
- Validates subtitle data
- Manages error states

---

### `VideoPlayer`

Renders the HTML5 video element with loading and error states.

**Props:**

```typescript
interface VideoPlayerProps {
	videoUrl: string;
	videoRef: React.RefObject<HTMLVideoElement>;
	onLoaded?: () => void;
	onError?: (error: Error) => void;
}
```

**Usage:**

```typescript
import { VideoPlayer } from '@/modules/videos/components';
import { useVideoPlayer } from '@/modules/videos/hooks/useVideoPlayer';

const { videoRef } = useVideoPlayer();

<VideoPlayer
  videoUrl={video.videoUrl}
  videoRef={videoRef}
  onLoaded={() => console.log('Video loaded')}
  onError={(error) => console.error(error)}
/>
```

**Features:**

- Loading skeleton while video loads
- Error handling with retry button
- Responsive video container (16:9 aspect ratio)
- Accessibility support (ARIA labels)

---

### `VideoControls`

Playback controls for the video player.

**Props:**

```typescript
interface VideoControlsProps {
	isPlaying: boolean;
	playbackRate: number;
	play: () => Promise<void>;
	pause: () => void;
	stop: () => void;
	setPlaybackRate: (rate: number) => void;
}
```

**Usage:**

```typescript
import { VideoControls } from '@/modules/videos/components';
import { useVideoPlayer } from '@/modules/videos/hooks/useVideoPlayer';

const {
  isPlaying,
  playbackRate,
  play,
  pause,
  stop,
  setPlaybackRate
} = useVideoPlayer();

<VideoControls
  isPlaying={isPlaying}
  playbackRate={playbackRate}
  play={play}
  pause={pause}
  stop={stop}
  setPlaybackRate={setPlaybackRate}
/>
```

**Features:**

- Play/Pause toggle
- Stop button
- Playback speed selector (0.5x - 2.0x)
- Keyboard navigation support
- Touch-friendly on mobile

---

### `SubtitleDisplay`

Displays Japanese subtitles with real-time word highlighting.

**Props:**

```typescript
interface SubtitleDisplayProps {
	subtitle: Subtitle | null;
	activeWordIndex: number | null;
}
```

**Usage:**

```typescript
import SubtitleDisplay from '@/modules/videos/components/SubtitleDisplay';
import { useSubtitleSync } from '@/modules/videos/hooks/useSubtitleSync';

const { activeSubtitle, activeWordIndex } = useSubtitleSync(
  currentTime,
  video.subtitles
);

<SubtitleDisplay
  subtitle={activeSubtitle}
  activeWordIndex={activeWordIndex}
/>
```

**Features:**

- Real-time word highlighting as video plays
- Romaji pronunciation display
- Color coding based on word type
- Smooth transitions
- Screen reader support

---

### `TranslationDisplay`

Displays the Vietnamese translation of the current subtitle.

**Props:**

```typescript
interface TranslationDisplayProps {
	subtitle: Subtitle | null;
}
```

**Usage:**

```typescript
import TranslationDisplay from '@/modules/videos/components/TranslationDisplay';

<TranslationDisplay subtitle={activeSubtitle} />
```

**Features:**

- Shows Vietnamese translation
- Updates automatically with subtitle changes
- Screen reader announcements

---

## Hooks

### `useVideoPlayer`

Manages video playback state and controls.

**Returns:**

```typescript
{
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  error: Error | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}
```

**Usage:**

```typescript
import { useVideoPlayer } from '@/modules/videos/hooks/useVideoPlayer';

const { currentTime, isPlaying, videoRef, play, pause, seek } = useVideoPlayer();
```

**Features:**

- Throttled time updates (100ms)
- Automatic event listener management
- Error handling
- Cleanup on unmount

---

### `useSubtitleSync`

Synchronizes subtitles with video playback.

**Parameters:**

```typescript
useSubtitleSync(
  currentTime: number,
  subtitles: Subtitle[]
)
```

**Returns:**

```typescript
{
	activeSubtitle: Subtitle | null;
	activeWordIndex: number | null;
}
```

**Usage:**

```typescript
import { useSubtitleSync } from '@/modules/videos/hooks/useSubtitleSync';

const { activeSubtitle, activeWordIndex } = useSubtitleSync(currentTime, video.subtitles);
```

**Features:**

- Word-level timing synchronization
- Memoized calculations for performance
- Edge case handling (before/after subtitles, invalid timing)

---

### `useVideoProgress`

Manages and persists video watching progress.

**Parameters:**

```typescript
useVideoProgress({
  videoId: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onCompleted?: () => void;
})
```

**Returns:**

```typescript
{
	isSaving: boolean;
	progress: VideoProgress | null;
	loadProgress: () => Promise<void>;
}
```

**Usage:**

```typescript
import { useVideoProgress } from '@/modules/videos/hooks/useVideoProgress';

const { isSaving, progress } = useVideoProgress({
	videoId: video.id,
	currentTime,
	duration,
	isPlaying,
	onCompleted: () => console.log('Video completed'),
});
```

**Features:**

- Auto-save every 5 seconds (debounced)
- Automatic completion detection
- Progress loading on mount
- Error handling with retry

---

## Complete Example

```typescript
'use client';

import { VideoLearningPage } from '@/modules/videos/components';
import { getVideoData } from '@/modules/videos/actions';
import { useEffect, useState } from 'react';

export default function VideoPage({ videoId }: { videoId: string }) {
  const [videoData, setVideoData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVideo() {
      const result = await getVideoData({ videoId });
      if (result.success && result.data) {
        setVideoData(result.data.video);
        setProgress(result.data.progress);
      }
      setLoading(false);
    }
    loadVideo();
  }, [videoId]);

  if (loading) return <div>Loading...</div>;
  if (!videoData) return <div>Video not found</div>;

  return (
    <VideoLearningPage
      video={videoData}
      initialProgress={progress}
    />
  );
}
```

---

## Styling

Components use CSS Modules for styling. Customize by overriding CSS variables:

```css
/* Override Ant Design theme tokens */
:root {
	--ant-color-primary: #your-color;
	--ant-color-text: #your-text-color;
}
```

Mobile responsiveness is built-in with media queries at 768px and 480px breakpoints.

---

## Best Practices

1. **Always provide `initialProgress`** to `VideoLearningPage` to restore user's position
2. **Handle errors gracefully** - components show error states but you should handle API errors
3. **Use memoization** - components are already memoized, but ensure props are stable
4. **Accessibility** - all components support keyboard navigation and screen readers
5. **Mobile-first** - test on mobile devices to ensure touch targets are adequate

---

## Performance Tips

1. **Lazy load videos** - use `loading="lazy"` for video elements (handled automatically)
2. **Throttle updates** - time updates are already throttled to 100ms
3. **Memoize callbacks** - use `useCallback` for callbacks passed to components
4. **Code splitting** - use dynamic imports for video components if needed

---

## Troubleshooting

**Video doesn't load:**

- Check video URL is accessible
- Verify video format is supported (MP4 recommended)
- Check browser console for CORS errors

**Subtitles don't highlight:**

- Verify subtitle timing data is valid (startTime < endTime)
- Check word timing is relative to subtitle startTime
- Ensure subtitles are sorted by order

**Progress doesn't save:**

- Verify user is authenticated
- Check network connection
- Review browser console for errors
