# Video Learning API Documentation

## Overview

The Video Learning feature provides a comprehensive API for managing video content, subtitles, and user progress tracking. All Server Actions use the `executeSafeAction` wrapper for authentication and validation.

## Server Actions

### `getVideoData`

Fetches video data including subtitles and user progress.

**Input Schema:**
```typescript
{
  videoId: string; // UUID
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    video: Video;
    progress: VideoProgress | null;
  };
  error?: string;
}
```

**Usage:**
```typescript
const result = await getVideoData({ videoId: 'uuid-here' });
if (result.success && result.data) {
  const { video, progress } = result.data;
}
```

**Authentication:** Optional (public videos can be viewed without auth, but progress requires auth)

---

### `updateVideoProgress`

Updates the user's video watching progress.

**Input Schema:**
```typescript
{
  videoId: string; // UUID
  currentTime: number; // Current playback position in seconds (min: 0)
  watchTime: number; // Total time watched in seconds (min: 0)
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    progress: VideoProgress;
  };
  error?: string;
}
```

**Usage:**
```typescript
const result = await updateVideoProgress({
  videoId: 'uuid-here',
  currentTime: 120.5,
  watchTime: 300,
});
```

**Authentication:** Required

**Auto-save:** The `useVideoProgress` hook automatically saves progress every 5 seconds while playing.

---

### `markVideoCompleted`

Marks a video as completed for the user.

**Input Schema:**
```typescript
{
  videoId: string; // UUID
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    progress: VideoProgress;
  };
  error?: string;
}
```

**Usage:**
```typescript
const result = await markVideoCompleted({ videoId: 'uuid-here' });
```

**Authentication:** Required

---

## Data Access Layer

### `getVideoById(videoId: string): Promise<Video | null>`

Fetches a video by ID with all subtitles parsed and validated.

**Returns:** `Video | null`

**Throws:** Never throws - returns `null` on error

---

### `getUserVideoProgress(userId: string, videoId: string): Promise<VideoProgress | null>`

Fetches user's progress for a specific video.

**Returns:** `VideoProgress | null`

**Throws:** Never throws - returns `null` if no progress found

---

### `upsertVideoProgress(userId: string, videoId: string, data: { currentTime: number; watchTime: number; completed?: boolean }): Promise<VideoProgress>`

Creates or updates user's video progress.

**Returns:** `VideoProgress`

**Throws:** `Error` if database operation fails

---

## Type Definitions

### `Video`

```typescript
interface Video {
  id: string;
  title: string;
  titleEn?: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number; // seconds
  deckId?: string;
  level?: string;
  tags: string[];
  language: string;
  targetLanguage: string;
  contentStatus: ContentStatus;
  verifiedAt?: Date;
  verifiedBy?: string;
  subtitles: Subtitle[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### `Subtitle`

```typescript
interface Subtitle {
  id: string;
  videoId: string;
  startTime: number; // seconds
  endTime: number; // seconds
  sentence: string; // Japanese sentence
  translation: {
    vi: string;
    en?: string;
  };
  words: SubtitleWord[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### `SubtitleWord`

```typescript
interface SubtitleWord {
  text: string;
  romaji: string;
  startTime: number; // relative to subtitle startTime
  endTime: number; // relative to subtitle startTime
  color?: 'yellow' | 'green' | 'purple' | 'red' | 'blue' | 'light-blue';
  type?: string; // e.g., "noun", "verb", "particle"
}
```

### `VideoProgress`

```typescript
interface VideoProgress {
  id: string;
  userId: string;
  videoId: string;
  currentTime: number; // seconds
  watchTime: number; // seconds
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Subtitle JSON Format

See `docs/features/video-learning-demo-data.json` for a complete example.

**Structure:**
```json
{
  "version": "1.0",
  "videoId": "string",
  "language": "ja",
  "targetLanguage": "vi",
  "subtitles": [
    {
      "id": "string",
      "order": 1,
      "startTime": 0.0,
      "endTime": 5.2,
      "sentence": "Japanese sentence",
      "translation": {
        "vi": "Vietnamese translation",
        "en": "English translation (optional)"
      },
      "words": [
        {
          "text": "word",
          "romaji": "romaji",
          "startTime": 0.0,
          "endTime": 0.8,
          "color": "yellow",
          "type": "noun"
        }
      ]
    }
  ]
}
```

**Validation:** Use `VideoSubtitleFileSchema` from `src/modules/videos/types.ts` for validation.

---

## Error Handling

All Server Actions return errors in the response object rather than throwing:

```typescript
const result = await getVideoData({ videoId });
if (!result.success) {
  console.error(result.error);
  // Handle error
}
```

Data layer functions may throw errors for database operations, but Server Actions catch and return them in the response.

---

## Performance Considerations

1. **Auto-save Throttling:** Progress is saved every 5 seconds (debounced)
2. **Time Updates:** Video time updates are throttled to 100ms
3. **Memoization:** Subtitle sync calculations are memoized
4. **Component Memoization:** Components use `React.memo` to prevent unnecessary re-renders

---

## Accessibility

- All interactive elements have ARIA labels
- Keyboard navigation supported (Enter/Space for buttons)
- Screen reader announcements for subtitle changes
- Focus management for video controls

---

## Mobile Support

- Responsive layout with mobile-first approach
- Touch-friendly controls (minimum 44x44px touch targets)
- Optimized font sizes for small screens
- Flexible layout that adapts to screen size
