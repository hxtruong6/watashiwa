# Video Learning Feature - Library & Format Recommendations

**Created:** 2025-01-29  
**Status:** Recommendations for Implementation

---

## 1. Video Player Library Recommendation

### ✅ **Recommendation: Native HTML5 Video (MVP)**

**Why:**

- **Lightweight**: Zero dependencies, ~0KB bundle size
- **Full Control**: Complete access to all video events and properties
- **Perfect for Custom Controls**: Easy to build exactly what you need
- **Real-time Sync**: Direct access to `currentTime` for subtitle synchronization
- **Performance**: Native browser implementation, optimized
- **Your Requirements**: You only need play, pause, stop, speed - all native features

**Implementation:**

```typescript
// Simple, direct, no library overhead
const videoRef = useRef<HTMLVideoElement>(null)

<video
  ref={videoRef}
  src={videoUrl}
  onTimeUpdate={handleTimeUpdate}
  onPlay={handlePlay}
  onPause={handlePause}
  // ... other events
/>
```

**When to Consider Alternatives:**

- If you need to support YouTube/Vimeo URLs → `react-player` (but you're using CDN, so not needed)
- If you need HLS/DASH streaming → Native HTML5 + HLS.js (but CDN MP4 is fine for MVP)
- If you need advanced features like annotations, chapters → `video.js` (but too heavy for MVP)

**Bundle Size Impact:**

- Native HTML5: **0KB** ✅
- react-player: ~50KB
- video.js: ~200KB+ (too heavy)

---

### Alternative: react-player (If Needed Later)

**When to Use:**

- If you need to support multiple video sources (YouTube, Vimeo, etc.)
- If you want a more opinionated API

**Pros:**

- Good React integration
- Supports multiple sources
- Well-maintained

**Cons:**

- Adds bundle size
- Less control over native events
- Overkill for your use case (CDN videos)

---

## 2. Subtitle Format Recommendation

### ✅ **Recommendation: JSON Format (Manual Creation)**

**Why JSON is Best for Your Needs:**

1. **Word-Level Timing**: Native support - no format limitations
2. **Easy Manual Creation**: Human-readable, easy to edit
3. **Flexible Structure**: Can add any metadata you need
4. **No Parser Needed**: Just `JSON.parse()` - instant
5. **Type-Safe**: Easy to validate with Zod schemas
6. **Translation Support**: Built-in support for multiple languages
7. **Color Coding**: Can store color/type metadata per word

**Recommended JSON Structure:**

```json
{
	"version": "1.0",
	"videoId": "video-123",
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
				},
				{
					"text": "が",
					"romaji": "ga",
					"startTime": 1.2,
					"endTime": 1.4,
					"color": "green",
					"type": "particle"
				},
				{
					"text": "終わって",
					"romaji": "owatte",
					"startTime": 1.4,
					"endTime": 2.0,
					"color": "green",
					"type": "verb"
				},
				{
					"text": "から",
					"romaji": "kara",
					"startTime": 2.0,
					"endTime": 2.3,
					"color": "green",
					"type": "particle"
				},
				{
					"text": "一人で",
					"romaji": "hitori de",
					"startTime": 2.3,
					"endTime": 3.0,
					"color": "yellow",
					"type": "adverb"
				},
				{
					"text": "いろいろ",
					"romaji": "iroiro",
					"startTime": 3.0,
					"endTime": 3.8,
					"color": "purple",
					"type": "adverb"
				},
				{
					"text": "考えた。",
					"romaji": "kangaeta",
					"startTime": 3.8,
					"endTime": 4.5,
					"color": "red",
					"type": "verb"
				}
			]
		}
	]
}
```

**Zod Schema for Validation:**

```typescript
// src/modules/videos/types.ts
import { z } from 'zod';

export const SubtitleWordSchema = z.object({
	text: z.string(),
	romaji: z.string(),
	startTime: z.number().min(0),
	endTime: z.number().min(0),
	color: z.enum(['yellow', 'green', 'purple', 'red', 'blue', 'light-blue']).optional(),
	type: z.string().optional(),
});

export const SubtitleSchema = z.object({
	id: z.string(),
	order: z.number().int().min(1),
	startTime: z.number().min(0),
	endTime: z.number().min(0),
	sentence: z.string(),
	translation: z.object({
		vi: z.string(),
		en: z.string().optional(),
	}),
	words: z.array(SubtitleWordSchema),
});

export const VideoSubtitleFileSchema = z.object({
	version: z.string().default('1.0'),
	videoId: z.string(),
	language: z.string().default('ja'),
	targetLanguage: z.string().default('vi'),
	subtitles: z.array(SubtitleSchema),
});

export type VideoSubtitleFile = z.infer<typeof VideoSubtitleFileSchema>;
export type Subtitle = z.infer<typeof SubtitleSchema>;
export type SubtitleWord = z.infer<typeof SubtitleWordSchema>;
```

**Benefits:**

- ✅ No parser library needed - just `JSON.parse()`
- ✅ Easy to create manually or via admin UI
- ✅ Type-safe with Zod validation
- ✅ Supports all your requirements (word timing, colors, translations)
- ✅ Easy to extend (add more metadata later)

---

### Alternative Formats (Not Recommended for MVP)

#### SRT Format

**Why Not:**

- ❌ No word-level timing support
- ❌ No color/styling metadata
- ❌ No translation support (would need separate file)
- ❌ Would need parser library (`srt-parser-js`)
- ❌ Limited to sentence-level only

**When to Use:**

- If importing from external sources
- If you want industry-standard format
- **But**: You'd still need to convert to JSON for word-level highlighting

#### VTT (WebVTT) Format

**Why Not:**

- ❌ No word-level timing (sentence-level only)
- ❌ Limited styling (CSS-based, not per-word)
- ❌ No translation support
- ❌ More complex than JSON

**When to Use:**

- If you want browser-native subtitle support
- If you need accessibility features (screen readers)
- **But**: Still need JSON for word-level highlighting

#### ASS Format

**Why Not:**

- ❌ Very complex format (karaoke-style timing)
- ❌ Hard to create manually
- ❌ Would need `jassub` library (~50KB)
- ❌ Overkill for your needs

**When to Use:**

- If you need advanced styling/animations
- If you have existing ASS files
- **But**: JSON is simpler and more flexible

---

## 3. Subtitle Parser Recommendation

### ✅ **No Parser Needed (JSON Format)**

Since we're using JSON format:

- **Import**: Just `JSON.parse(fileContent)` ✅
- **Export**: Just `JSON.stringify(data, null, 2)` ✅
- **Validation**: Use Zod schema ✅

### Optional: Import Parser (Future Enhancement)

If you want to **import** SRT/VTT files and convert to JSON:

**Library Options:**

1. **`srt-parser-js`** (~2KB) - For SRT import
2. **`node-webvtt`** (~5KB) - For VTT import
3. **Custom parser** - Simple regex-based (recommended)

**Recommendation:**

- **MVP**: No parser needed (manual JSON creation)
- **Future**: Add simple custom parser for SRT/VTT import
- **Admin UI**: Create a subtitle editor that exports JSON

---

## 4. Implementation Strategy

### Phase 1: JSON Format (MVP)

1. ✅ Use JSON format for all subtitles
2. ✅ Store in database as JSONB (already in schema)
3. ✅ Manual creation via admin UI or direct JSON upload
4. ✅ No parser library needed

### Phase 2: Import Support (Future)

1. Add SRT/VTT import functionality
2. Convert to JSON format on import
3. Store as JSON in database
4. Use simple custom parser (no library needed)

### Phase 3: Admin Editor (Future)

1. Build visual subtitle editor
2. Export as JSON
3. Support word-level timing annotation
4. Color coding UI

---

## 5. File Upload & Storage

### Recommended Flow

1. **Admin Uploads JSON File**

   ```typescript
   // Server Action
   async function uploadSubtitleFile(videoId: string, file: File) {
   	const content = await file.text();
   	const data = VideoSubtitleFileSchema.parse(JSON.parse(content));
   	// Validate and save to database
   }
   ```

2. **Store in Database (JSONB)**

   ```prisma
   model Subtitle {
     // ... other fields
     words Json  // Store SubtitleWord[] as JSONB
   }
   ```

3. **Retrieve and Use**

   ```typescript
   // Already parsed from database
   const subtitles = await getVideoSubtitles(videoId);
   // subtitles[0].words is already SubtitleWord[]
   ```

---

## 6. Color Coding Strategy

### Recommended Color System

Based on your image, use semantic color coding:

```typescript
const WORD_COLORS = {
	time: 'yellow', // 今日、一人で
	verb: 'red', // 考えた、思う
	noun: 'green', // 仕事、物
	particle: 'green', // が、から、の
	adverb: 'purple', // いろいろ
	adjective: 'light-blue', // 大変
} as const;
```

**Store in JSON:**

- Each word has `color` and `type` fields
- UI applies color based on `color` field
- Fallback to `type` if `color` missing

---

## 7. Final Recommendations Summary

### ✅ **Use These:**

1. **Video Player**: Native HTML5 `<video>` element
   - Zero dependencies
   - Full control
   - Perfect for your needs

2. **Subtitle Format**: JSON
   - Easy manual creation
   - Word-level timing
   - No parser needed
   - Type-safe with Zod

3. **Storage**: Database JSONB
   - Already in Prisma schema
   - Efficient querying
   - Type-safe retrieval

### ❌ **Don't Use (For MVP):**

1. **react-player**: Overkill, adds bundle size
2. **video.js**: Too heavy (~200KB)
3. **SRT/VTT Format**: No word-level timing
4. **Subtitle Parser Library**: Not needed with JSON

### 🔮 **Consider Later:**

1. **SRT/VTT Import**: Add simple parser for external files
2. **Admin Editor**: Visual subtitle creation tool
3. **HLS.js**: If you need streaming later

---

## 8. Example JSON File Template

Create this as a template for content creators:

```json
{
	"version": "1.0",
	"videoId": "your-video-id",
	"language": "ja",
	"targetLanguage": "vi",
	"subtitles": [
		{
			"id": "sub-1",
			"order": 1,
			"startTime": 0.0,
			"endTime": 4.5,
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
				}
				// ... more words
			]
		}
	]
}
```

---

## 9. Next Steps

1. ✅ **Decide on JSON format** (recommended)
2. ✅ **Use native HTML5 video** (recommended)
3. Create Zod schemas for validation
4. Build admin UI for subtitle creation (or use JSON upload)
5. Implement word-level highlighting with JSON data

---

## 10. Questions Answered

**Q: What library for video player?**  
A: Native HTML5 video - no library needed for MVP.

**Q: What format for subtitles?**  
A: JSON format - easy manual creation, word-level timing, no parser needed.

**Q: Do we need a subtitle parser?**  
A: No - JSON format means just `JSON.parse()`. Add SRT/VTT import later if needed.

**Q: How to create subtitles manually?**  
A: Create JSON files with the structure above, or build an admin UI that exports JSON.

---

**Conclusion:** Keep it simple. Native HTML5 video + JSON subtitles = Fast development, zero unnecessary dependencies, full control. 🚀
