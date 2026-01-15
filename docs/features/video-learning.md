# Video Learning Feature - Specification

**Status:** ✅ Implemented  
**Created:** 2025-01-29  
**Last Updated:** 2025-01-29  
**Module:** `src/modules/videos/`  
**Priority:** High

**Related Documentation:**

- [API Reference](./video-learning-api.md) - Server Actions and data layer
- [Component Usage Guide](./video-learning-component-usage.md) - React components and hooks
- [Technical Recommendations](./video-learning-recommendations.md) - Library choices and format decisions

---

## 1. Overview

### 1.1 Feature Description

A comprehensive video learning system that allows users to learn Japanese through video content with:

- **Interactive video player** with playback controls (play, pause, stop, speed adjustment)
- **Real-time subtitle synchronization** - words highlight as they are spoken in the video
- **Bilingual display** - Japanese subtitles with Vietnamese translations
- **Word-level granularity** - Each word/phrase is individually highlighted with color coding and romaji pronunciation

### 1.2 User Goals

- Learn Japanese through authentic video content
- Improve listening comprehension
- Understand sentence structure and word usage in context
- Practice pronunciation with visual and audio cues

### 1.3 Business Goals

- Increase user engagement through interactive content
- Provide alternative learning method to flashcards
- Support different learning styles (visual, auditory)
- Track learning progress through video consumption

---

## 2. User Stories

### 2.1 Core User Stories

**US-1: Video Playback**
> As a learner, I want to play, pause, stop, and adjust playback speed of learning videos so that I can learn at my own pace.

**US-2: Subtitle Highlighting**
> As a learner, I want to see which words are being spoken in real-time through visual highlighting so that I can follow along with the audio.

**US-3: Translation Display**
> As a learner, I want to see Vietnamese translations below Japanese subtitles so that I can understand the meaning of sentences.

**US-4: Word Breakdown**
> As a learner, I want to see individual words with romaji pronunciation so that I can learn proper reading and pronunciation.

**US-5: Progress Tracking**
> As a learner, I want my video watching progress to be saved so that I can resume from where I left off.

### 2.2 Future Enhancements (Out of Scope for MVP)

- Word click to see vocabulary details
- Bookmark specific timestamps
- Repeat sentence functionality
- Speed adjustment per sentence
- Quiz questions after video
- Community comments on videos

---

## 3. Technical Architecture

### 3.1 Module Structure

```
src/modules/videos/
├── components/
│   ├── VideoPlayer/
│   │   ├── VideoPlayer.tsx          # Main video player component
│   │   ├── VideoControls.tsx        # Play, pause, stop, speed controls
│   │   ├── SubtitleDisplay.tsx      # Subtitle rendering with highlighting
│   │   ├── TranslationDisplay.tsx   # Translation text display
│   │   └── WordHighlight.tsx        # Individual word highlighting logic
│   ├── VideoLearningPage.tsx       # Main page component (Client)
│   └── index.ts                     # Barrel exports
├── hooks/
│   ├── useVideoPlayer.ts            # Video playback state & controls
│   ├── useSubtitleSync.ts           # Subtitle synchronization logic
│   └── useVideoProgress.ts          # Progress tracking
├── store/
│   └── useVideoStore.ts             # Zustand store for video state
├── actions.ts                       # Server Actions
├── data.ts                          # Data access layer (Prisma)
├── services.ts                      # Business logic
├── types.ts                         # TypeScript types
└── utils/
    ├── subtitle-parser.ts           # Parse subtitle formats (SRT, VTT, JSON)
    └── timing-utils.ts              # Timing calculations
```

### 3.2 Data Model

#### 3.2.1 Database Schema (Prisma)

```prisma
model Video {
  id            String   @id @default(uuid())
  title         String
  titleEn       String?  @map("title_en")
  description   String?
  videoUrl      String   @map("video_url")      // CDN URL or external URL
  thumbnailUrl  String?  @map("thumbnail_url")
  duration      Int      // Duration in seconds
  deckId        String?  @map("deck_id")        // Optional: link to deck
  deck          Deck?    @relation(fields: [deckId], references: [id])
  
  // Metadata
  level         String?  // e.g., "N5", "N4", "Beginner"
  tags          String[]
  language      String   @default("ja")          // Source language
  targetLanguage String  @default("vi")         // Translation language
  
  // Content Status
  contentStatus ContentStatus @default(DRAFT)
  verifiedAt    DateTime?
  verifiedBy    String?
  
  // Relations
  subtitles     Subtitle[]
  videoLogs     VideoLog[]
  
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  
  @@index([deckId])
  @@index([contentStatus])
}

model Subtitle {
  id          String   @id @default(uuid())
  videoId     String   @map("video_id")
  video       Video    @relation(fields: [videoId], references: [id], onDelete: Cascade)
  
  // Timing
  startTime   Float    @map("start_time")       // Start time in seconds
  endTime     Float    @map("end_time")         // End time in seconds
  
  // Content
  sentence    String   // Japanese sentence
  translation Json     // { "vi": "...", "en": "..." }
  words       Json     // Word-level timing data (see SubtitleWord type)
  
  // Display
  order       Int      // Sentence order in video
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@index([videoId, order])
  @@index([videoId, startTime])
}

model VideoLog {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  videoId     String   @map("video_id")
  video       Video    @relation(fields: [videoId], references: [id], onDelete: Cascade)
  
  // Progress
  currentTime Float    @default(0) @map("current_time")  // Last watched position
  completed   Boolean  @default(false)
  watchTime   Int      @default(0) @map("watch_time")   // Total seconds watched
  
  // Analytics
  playCount   Int      @default(0) @map("play_count")
  lastWatched DateTime @default(now()) @map("last_watched")
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@unique([userId, videoId])
  @@index([userId])
  @@index([videoId])
}
```

#### 3.2.2 TypeScript Types

```typescript
// src/modules/videos/types.ts

export interface Video {
  id: string
  title: string
  titleEn?: string
  description?: string
  videoUrl: string
  thumbnailUrl?: string
  duration: number
  deckId?: string
  level?: string
  tags: string[]
  language: string
  targetLanguage: string
  contentStatus: ContentStatus
  subtitles: Subtitle[]
  createdAt: Date
  updatedAt: Date
}

export interface Subtitle {
  id: string
  videoId: string
  startTime: number
  endTime: number
  sentence: string
  translation: {
    vi: string
    en?: string
  }
  words: SubtitleWord[]
  order: number
}

export interface SubtitleWord {
  // Word/phrase text
  text: string
  
  // Romaji pronunciation
  romaji: string
  
  // Timing within the sentence (relative to sentence startTime)
  startTime: number  // Relative to sentence start
  endTime: number    // Relative to sentence start
  
  // Display properties
  color?: string     // Color category (e.g., "yellow", "green", "purple", "red")
  type?: string      // Word type (e.g., "noun", "verb", "particle")
}

export interface VideoProgress {
  videoId: string
  currentTime: number
  completed: boolean
  watchTime: number
  playCount: number
  lastWatched: Date
}

export interface VideoPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  playbackRate: number  // 0.5, 0.75, 1.0, 1.25, 1.5, 2.0
  volume: number
  isMuted: boolean
  activeSubtitleId: string | null
  activeWordIndex: number | null
}
```

### 3.3 Component Architecture

#### 3.3.1 Component Hierarchy

```
VideoLearningPage (Client Component)
├── VideoPlayer (Client Component)
│   ├── <video> element
│   └── VideoControls (Client Component)
│       ├── Play/Pause button
│       ├── Stop button
│       ├── Speed selector
│       └── Progress bar
├── SubtitleDisplay (Client Component)
│   └── WordHighlight (for each word)
└── TranslationDisplay (Client Component)
```

#### 3.3.2 Key Components

**VideoPlayer.tsx**

- Manages video element and playback state
- Handles video events (play, pause, timeupdate, ended)
- Syncs current time with subtitle highlighting
- Uses `useVideoPlayer` hook for state management

**SubtitleDisplay.tsx**

- Renders current sentence with word-level highlighting
- Receives active word index from parent
- Applies color coding to words
- Displays romaji below each word

**TranslationDisplay.tsx**

- Shows Vietnamese translation of current sentence
- Updates when active subtitle changes

**VideoControls.tsx**

- Play/Pause toggle
- Stop button (resets to beginning)
- Speed selector (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
- Volume control (optional for MVP)

---

## 4. Implementation Status

### 4.1 Phase 1: Foundation (MVP) ✅

**Status:** Completed

All core features have been implemented:

- ✅ Database schema and types
- ✅ Data access layer with Prisma
- ✅ Server Actions with authentication
- ✅ Video player with controls
- ✅ Real-time subtitle synchronization
- ✅ Progress tracking and auto-save
- ✅ Component architecture

**Note:** For detailed task breakdown, see implementation history. For component usage, see [Component Usage Guide](./video-learning-component-usage.md).

---

## 5. Implementation Summary

### 5.1 Core Features (Completed) ✅

All MVP features have been implemented:

- ✅ **Database Schema** - `Video`, `Subtitle`, `VideoLog` models with JSONB support
- ✅ **Data Access Layer** - Type-safe Prisma queries with error handling
- ✅ **Server Actions** - Authentication, validation, and progress tracking
- ✅ **Video Player** - HTML5 video with custom controls
- ✅ **Subtitle Sync** - Real-time word-level highlighting
- ✅ **Progress Tracking** - Auto-save every 5 seconds
- ✅ **Component Architecture** - Modular, reusable components

**Implementation Details:**

- Content status filtering: Only PUBLISHED videos are accessible
- Zod validation for JSONB parsing
- React Compiler optimized hooks
- Type-safe throughout

**For component usage:** See [Component Usage Guide](./video-learning-component-usage.md)  
**For API reference:** See [API Reference](./video-learning-api.md)

---

### 5.2 Future Enhancements

**Planned Enhancements:**

- Word click to show vocabulary details
- Bookmark timestamps
- Repeat sentence functionality
- Speed adjustment per sentence
- Quiz questions after video
- Community comments on videos
- Video recommendations
- Playlist support
- WebVTT caption tracks for accessibility
- Subtitle import from SRT/VTT formats

---

---

## 6. UI/UX Design Specifications

### 5.1 Layout Structure

```
┌─────────────────────────────────────┐
│         Video Player                 │
│    [Video Element - 16:9 aspect]    │
│                                      │
│    [Controls: Play | Stop | Speed]  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      Subtitle Sentence              │
│  [Word1] [Word2] [Word3] [Word4]    │
│   romaji  romaji  romaji  romaji    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      Translation                    │
│  Vietnamese translation text here   │
└─────────────────────────────────────┘
```

### 5.2 Color Coding

Based on the image, words are color-coded by type/function:

- **Yellow**: Time expressions (今日, 一人で)
- **Light Green**: Verbs and related particles (仕事が終わってから, 高くなって)
- **Purple**: Adverbs/descriptors (いろいろ)
- **Red**: Verbs/action words (考えた, 思う)
- **Light Blue**: Nouns and related particles (物の値段, 生活が大変)

**Implementation:**

- Store color in `SubtitleWord.color` field
- Apply via CSS classes or inline styles
- Use Ant Design theme tokens for consistency

### 5.3 Typography

- **Japanese Text**: Larger font size (18-20px), bold for active word
- **Romaji**: Smaller font size (12-14px), italic, below Japanese text
- **Translation**: Standard font size (14-16px), regular weight

### 5.4 Animations

- **Word Highlighting**: Smooth color transition (200-300ms)
- **Subtitle Change**: Fade in/out (300ms)
- **Active Word**: Scale up slightly (1.05x) or bold

---

## 7. Technical Considerations

### 6.1 Video Format & Hosting

- **Format**: MP4 (H.264) for maximum compatibility
- **Hosting**: CDN (Google Cloud Storage, AWS S3, or similar)
- **Streaming**: Consider HLS/DASH for long videos (future)

### 6.2 Subtitle Data Format

**✅ Recommended: JSON Format (Manual Creation)**

**Why JSON:**

- ✅ Word-level timing support (native)
- ✅ Easy manual creation and editing
- ✅ No parser library needed (just `JSON.parse()`)
- ✅ Type-safe with Zod validation
- ✅ Supports color coding, translations, metadata
- ✅ Flexible and extensible

**JSON Structure:**

```json
{
  "version": "1.0",
  "videoId": "video-1",
  "language": "ja",
  "targetLanguage": "vi",
  "subtitles": [
    {
      "id": "sub-1",
      "order": 1,
      "startTime": 5.2,
      "endTime": 8.5,
      "sentence": "今日、仕事が終わってから一人でいろいろ考えた。",
      "translation": {
        "vi": "Hôm nay, sau khi tan làm, tôi đã một mình suy nghĩ rất nhiều.",
        "en": "Today, after work ended, I thought about various things alone."
      },
      "words": [
        {
          "text": "今日、",
          "romaji": "kyou",
          "startTime": 0.0,
          "endTime": 0.8,
          "color": "yellow",
          "type": "time"
        },
        {
          "text": "仕事",
          "romaji": "shigoto",
          "startTime": 0.8,
          "endTime": 1.2,
          "color": "green",
          "type": "noun"
        }
      ]
    }
  ]
}
```

**Alternative Formats (Not Recommended for MVP):**

- ❌ SRT: No word-level timing
- ❌ VTT: No word-level timing  
- ❌ ASS: Too complex, requires library

**See [Recommendations Document](./video-learning-recommendations.md) for detailed format comparison.**

### 6.3 Timing Precision

- **Video Time**: Milliseconds precision (Float in seconds)
- **Word Timing**: Relative to sentence start time
- **Sync Accuracy**: ±100ms tolerance for word highlighting

### 6.4 Performance Targets

- **Video Load Time**: < 2 seconds
- **Subtitle Sync Latency**: < 50ms
- **Frame Rate**: 60fps during playback
- **Memory Usage**: < 100MB for video player

---

## 8. Testing Strategy

### 7.1 Unit Tests

- [ ] `useVideoPlayer` hook tests
- [ ] `useSubtitleSync` hook tests
- [ ] `subtitle-parser` utility tests
- [ ] `timing-utils` tests

### 7.2 Integration Tests

- [ ] Video playback flow
- [ ] Subtitle synchronization
- [ ] Progress saving
- [ ] Server Actions

### 7.3 E2E Tests (Playwright)

- [ ] Complete video learning flow
- [ ] Controls functionality
- [ ] Subtitle highlighting
- [ ] Progress persistence
- [ ] Mobile responsiveness

---

## 9. Dependencies

### 8.1 New Dependencies (if needed)

- **Video Player**: Native HTML5 `<video>` (no library needed for MVP) ✅
- **Subtitle Format**: JSON (no parser needed - just `JSON.parse()`) ✅
- **Subtitle Parsing**: Not needed for MVP (using JSON format). Add SRT/VTT import later if needed.
- **Timing**: Native `requestAnimationFrame` for sync

**See [Recommendations Document](./video-learning-recommendations.md) for detailed library analysis.**

### 8.2 Existing Dependencies

- Ant Design v6 (UI components)
- Zustand (state management, if needed)
- Next.js 16+ (App Router)
- Prisma (database)

---

## 10. API Contracts

**Note:** For detailed API documentation, see [API Reference](./video-learning-api.md).

### 9.1 Server Actions

```typescript
// Get video data with subtitles
getVideoData(videoId: string): Promise<ApiResponse<Video>>

// Update video progress
updateVideoProgress(
  videoId: string,
  currentTime: number,
  watchTime: number
): Promise<ApiResponse<VideoProgress>>

// Mark video as completed
markVideoCompleted(videoId: string): Promise<ApiResponse<VideoProgress>>
```

---

## 11. Success Metrics

### 10.1 User Engagement

- Average watch time per video
- Completion rate
- Return rate (users watching multiple videos)

### 10.2 Technical Metrics

- Video load time
- Subtitle sync accuracy
- Error rate
- Performance (FPS, memory)

---

## 12. Technical Decisions

**Note:** For detailed technical recommendations and library choices, see [Technical Recommendations](./video-learning-recommendations.md).

### Key Decisions Made

1. **Video Player:** Native HTML5 `<video>` element (no external library)
2. **Subtitle Format:** JSON format with word-level timing
3. **Subtitle Parsing:** Zod validation (no parser library needed)
4. **State Management:** React hooks + Zustand (if needed for global state)

---

## 13. Open Questions & Future Enhancements

1. **Video Hosting**: Where will videos be hosted? (CDN, external service)
2. **Subtitle Source**: How will subtitles be created? (Manual, AI-generated, imported)
3. **Word Timing**: How will word-level timing be extracted? (Manual annotation, AI, audio analysis)
4. **Video Library**: Will there be a video library/browser page?
5. **Video-Deck Relationship**: Should videos be linked to decks? (Optional in schema)
6. **Access Control**: Who can access videos? (Public, authenticated users, premium only)

---

## 14. References

- [Next.js Video Documentation](https://nextjs.org/docs)
- [HTML5 Video API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)
- [Ant Design Components](https://ant.design/components/overview/)
- Project Architecture: `docs/architecture.md`
- Module Structure: `docs/modules.md`

---

## 15. Changelog

- **2025-01-29**: Initial specification created
- **2025-01-29**: Implementation completed, documentation consolidated
