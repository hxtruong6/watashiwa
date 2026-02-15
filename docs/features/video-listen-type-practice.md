# Video Listen & Type Practice - Feature Specification

**Status:** 📋 Planning  
**Created:** 2025-02-15  
**Last Updated:** 2025-02-15  
**Module:** `src/modules/videos/` (new practice sub-module)  
**Priority:** High  
**Route:** `/learn/videos/[videoId]/practice`

**Related Documentation:**

- [Video Learning Feature](./video-learning.md) - Base video learning system
- [Video Learning API](./video-learning-api.md) - Server Actions and data layer

---

## 1. Overview

### 1.1 Feature Description

**Listen & Type** is a practice mode where users listen to audio/video sentences and type what they hear. It helps learners improve listening comprehension and writing (hiragana, katakana, kanji) through dictation-style exercises.

**Key characteristics:**

- **Separate route:** `/learn/videos/[videoId]/practice` — keeps logic isolated from the main watch page
- **Two practice modes:** Fill the Blank (cloze) and Full Sentence
- **Per-sentence audio:** Play, repeat, and speed control for each sentence
- **Validation modes:** Kana-only (N5/N4) or Kanji-required (advanced)
- **Clean UI:** Tooltips on icons, minimal clutter

### 1.2 User Goals

- Improve listening comprehension through dictation
- Practice writing Japanese (hiragana, katakana, kanji)
- Learn at their own pace with repeat and speed controls
- Build confidence with incremental difficulty (fill blank → full sentence)

### 1.3 Business Goals

- Increase engagement with video content
- Provide alternative learning modality (listening + writing)
- Support JLPT N5/N4 learners (target ICP)
- Differentiate from passive video watching

---

## 2. Architecture Decisions

### 2.1 Route Structure

**Decision: Option C — Separate Route**

| Aspect | Detail |
|--------|--------|
| **URL** | `/learn/videos/[videoId]/practice` |
| **Rationale** | Keeps `VideoLearningPage` focused on watching; practice logic in dedicated page |
| **Navigation** | Link from video watch page: "Practice" button/tab |
| **Data** | Reuses `getVideoData` action; same video + subtitles |

### 2.2 Data Model

**Decision: Deferred to Next Phase**

- No new database tables for MVP
- Practice state is client-side only (Zustand or React state)
- Future phase may add: `PracticeSession`, `PracticeAttempt` for analytics and progress tracking

---

## 3. Practice Modes

### 3.1 Mode A: Fill the Blank (Cloze)

| Aspect | Specification |
|--------|---------------|
| **Display** | Sentence with `_____` for hidden word(s). Optional: `_____ (3文字)` for character count hint |
| **Blank selection** | **MVP:** Random — hide 1–2 words per sentence (configurable). **Future:** Vocabulary-based (words from user's deck) |
| **Input** | One input per blank, or single input with Tab to move between blanks |
| **Difficulty** | Easier; suitable for N5/N4 |

**Blank selection algorithm (MVP):**

- For sentences with 1–2 words: hide 1 word
- For sentences with 3+ words: hide 1–2 words (random, non-adjacent preferred)
- Never hide particles alone if it breaks grammar (e.g. `は` alone); prefer content words

### 3.2 Mode B: Full Sentence

| Aspect | Specification |
|--------|---------------|
| **Display** | No text shown; only audio/video playback |
| **Input** | Single text area for entire sentence |
| **Difficulty** | Harder; suitable for N4+ and review |

---

## 4. Audio/Video Playback

### 4.1 Per-Sentence Playback

| Requirement | Specification |
|-------------|---------------|
| **Scope** | Play only the current sentence's time range: `subtitle.startTime` → `subtitle.endTime` |
| **Source** | Use existing `Video` + `Subtitle` data; `words` array has relative timing |
| **Video element** | Same `<video>` element; seek to `subtitle.startTime` before play |

### 4.2 Controls

| Control | Behavior | Tooltip |
|---------|----------|---------|
| **Play** | Play current sentence from start | "Play this sentence" |
| **Repeat** | Replay current sentence | "Play this sentence again" |
| **Speed** | 0.5x, 0.75x, 1x, 1.25x, 1.5x | "Playback speed" |
| **Volume** | Mute/unmute, volume slider | "Volume" |

### 4.3 Auto-advance (Optional)

- When sentence audio ends, do NOT auto-advance to next sentence
- User must explicitly click "Next" or "Submit" to proceed
- Rationale: User controls pace; avoids rushing

---

## 5. Validation Modes

### 5.1 Kana Mode (N5/N4)

| Aspect | Specification |
|--------|---------------|
| **Compare** | Normalize both user input and expected to hiragana |
| **Kanji handling** | Expected `緑` → compare as `みどり` (from `word.romaji` → hiragana) |
| **User input** | Accept: hiragana, katakana, kanji. All normalized to hiragana for comparison |
| **Use case** | Focus on listening + reading; kanji recall not required |

### 5.2 Kanji Mode

| Aspect | Specification |
|--------|---------------|
| **Compare** | Character-by-character or word-by-word exact match |
| **User input** | Must type correct kanji (e.g. `緑` not `みどり`) |
| **Use case** | Kanji production practice |

### 5.3 Validation Logic (Technical)

```
Input: userAnswer, expectedText, mode ('kana' | 'kanji')

1. Normalize:
   - Trim whitespace
   - Collapse multiple spaces to single space
   - Optional: Remove punctuation (、。！？) for lenient mode

2. If mode === 'kana':
   - expectedHiragana = toHiragana(expectedText)  // use word.romaji → hiragana
   - userHiragana = toHiragana(userAnswer)       // katakana→hiragana, kanji→reading
   - Compare: expectedHiragana === userHiragana

3. If mode === 'kanji':
   - Compare: normalized(expectedText) === normalized(userAnswer)
   - Word-level: split by word boundaries, compare each segment
```

**Dependencies:** Romaji-to-hiragana conversion. Consider `wanakana` or similar for robust conversion. Subtitle words have `romaji`; can derive hiragana from that.

---

## 6. UI/UX Specification

### 6.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  [Back to Video]  │  Video Title                    [Settings]   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Video Player (minimized / compact)                         │ │
│  │  ▶ Play  │  🔁 Repeat  │  Speed: 1x ▼  │  🔊                │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  Sentence 3 of 12                          [Skip]  [Hint]       │
├─────────────────────────────────────────────────────────────────┤
│  (Fill mode)  緑さん _____ 見て                                  │
│  (Full mode)  [________________________________]  ← input       │
├─────────────────────────────────────────────────────────────────┤
│  [Submit]  [Show Answer]                                        │
│  ✓ Correct!  /  ✗ Try again. Expected: これ                     │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Tooltips (Required)

All icon-only buttons MUST have tooltips. Use Ant Design `Tooltip` component.

| Element | Tooltip (en) | Tooltip (vi) |
|---------|--------------|--------------|
| Play | "Play this sentence" | "Phát câu này" |
| Repeat | "Play this sentence again" | "Phát lại câu này" |
| Speed dropdown | "Playback speed" | "Tốc độ phát" |
| Volume | "Volume" | "Âm lượng" |
| Skip | "Skip to next sentence" | "Bỏ qua câu tiếp theo" |
| Hint | "Reveal one character" | "Gợi ý một ký tự" |
| Kana/Kanji mode | "Kana: type hiragana/katakana. Kanji: type exact kanji" | "Kana: gõ hiragana/katakana. Kanji: gõ đúng chữ Hán" |
| Fill/Full mode | "Fill blank: complete missing words. Full: type entire sentence" | "Điền chỗ trống / Gõ cả câu" |

### 6.3 States

| State | UI | User Action |
|-------|-----|-------------|
| **Idle** | Input empty, Play button ready | User plays audio, types answer |
| **Listening** | Audio playing, optional visual indicator | User waits or types |
| **Checking** | Submit clicked, loading spinner | — |
| **Correct** | Green checkmark, "Correct!" message, auto-advance or Next button | User clicks Next |
| **Incorrect** | Red X, "Try again. Expected: X" | User retries or clicks Show Answer |
| **Show Answer** | Reveal correct answer, dim input | User clicks Next |
| **Empty (no subtitles)** | Alert: "No subtitles available for practice" | User returns to watch page |
| **Loading** | Skeleton or spinner | — |
| **Error** | Error message with retry | User retries or goes back |

### 6.4 Responsive

- Mobile: Stack controls vertically; larger touch targets (min 44x44px)
- Desktop: Horizontal layout
- Input: Full width, min-height for multi-line (full sentence mode)

---

## 7. Acceptance Criteria (Expert Detail)

**Format:** Each AC uses **Given/When/Then** with **Preconditions**, **Verification Steps**, and **Priority** (P0=Must, P1=Should, P2=Nice-to-have).

---

### 7.1 Route & Navigation

#### AC-R1: Direct navigation to practice page

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | User is authenticated; video exists with `videoId` = valid UUID (e.g. `550e8400-e29b-41d4-a716-446655440000`) |
| **When** | User navigates to `/learn/videos/[videoId]/practice` (via URL, bookmark, or link) |
| **Then** | Page renders; practice UI is visible; no redirect occurs |
| **Verification** | 1. Open DevTools Network tab. 2. Navigate to URL. 3. Confirm `getVideoData` is called. 4. Confirm practice layout renders. 5. No 404 or redirect. |
| **Test Data** | Use existing video from seed (e.g. `video1` or seeded UUID) |

---

#### AC-R2: Unauthenticated user redirected

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | User has no valid session (logged out, expired cookie, or incognito with no login) |
| **When** | User navigates to `/learn/videos/[validVideoId]/practice` |
| **Then** | User is redirected to login page (or auth callback); practice page does not render |
| **Verification** | 1. Clear cookies / use incognito. 2. Navigate to practice URL. 3. Assert redirect to `/login` or equivalent. 4. Assert practice content not in DOM. |
| **Edge Case** | If app uses modal login: user sees login prompt; after login, user lands on practice page (or previous page per product decision) |

---

#### AC-R3: Invalid or non-existent videoId returns 404

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | User is authenticated |
| **When** | User navigates with invalid `videoId`: (a) malformed UUID `abc123`, (b) valid UUID format but non-existent `00000000-0000-0000-0000-000000000000`, (c) UUID of deleted/unpublished video |
| **Then** | Next.js `notFound()` is triggered; 404 page is displayed; no unhandled error |
| **Verification** | 1. Navigate to `/learn/videos/abc123/practice` → 404. 2. Navigate with non-existent UUID → 404. 3. Check no 500 in Network/Console. |
| **Test Data** | `abc123`, `00000000-0000-0000-0000-000000000000` |

---

#### AC-R4: Back to Video link navigates correctly

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | User is on `/learn/videos/[videoId]/practice` |
| **When** | User clicks "Back to Video" (or equivalent link/button) |
| **Then** | User is navigated to `/learn/videos/[videoId]` (watch page); URL updates; watch page renders |
| **Verification** | 1. Click Back. 2. Assert URL is `/learn/videos/[videoId]`. 3. Assert `VideoLearningPage` (or watch component) is visible. |
| **Edge Case** | Link must use same `videoId` from current route params |

---

#### AC-R5: Video with zero subtitles shows empty state

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Video exists but `video.subtitles` is empty array `[]` |
| **When** | User navigates to practice page for that video |
| **Then** | Empty state is displayed; message indicates "No subtitles available for practice" (or i18n equivalent); link/button to return to watch page is present; no practice UI (player, input, Submit) is shown |
| **Verification** | 1. Use video with `subtitles: []` (seed or mock). 2. Navigate to practice. 3. Assert empty state message. 4. Assert no input/Submit. 5. Assert Back link works. |
| **Edge Case** | Video with `subtitles: null` or undefined → treat as empty; show same empty state |

---

### 7.2 Data Loading

#### AC-D1: Video data loaded via getVideoData

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | User is authenticated; video exists with subtitles |
| **When** | Practice page mounts |
| **Then** | `getVideoData({ videoId })` is invoked (server-side or client fetch); returned data includes `video`, `subtitles` with `words`; page uses this data for practice |
| **Verification** | 1. Spy/mock `getVideoData`. 2. Load practice page. 3. Assert `getVideoData` called with correct `videoId`. 4. Assert subtitles rendered. |
| **Note** | Reuse same action as watch page; no duplicate fetch logic |

---

#### AC-D2: Subtitle with empty words array handled

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Given** | Video has subtitle where `subtitle.words` is `[]` |
| **When** | That subtitle is selected as current sentence |
| **Then** | Fallback: treat whole `subtitle.sentence` as single segment; Fill mode hides entire sentence or 1 "word"; Full mode uses full sentence as expected; no crash |
| **Verification** | 1. Seed subtitle with `words: []`. 2. Navigate to that sentence. 3. Assert no error. 4. Assert validation uses `sentence` as expected. |
| **Edge Case** | `words` is `null` or undefined → same fallback |

---

#### AC-D3: Loading state during fetch

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | User navigates to practice URL |
| **When** | `getVideoData` is in progress (e.g. slow 3G, artificial delay) |
| **Then** | Loading state is visible: skeleton, spinner, or "Loading..." text; no flash of empty/error; practice UI does not render until data is ready |
| **Verification** | 1. Throttle network to Slow 3G. 2. Navigate. 3. Assert loading indicator visible. 4. Assert no practice form before load completes. |
| **UX** | Use `PageSkeleton` or equivalent per project convention |

---

#### AC-D4: Error state when fetch fails

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | User navigates to practice URL |
| **When** | `getVideoData` fails (network error, 500, timeout) |
| **Then** | Error state is displayed; message is user-friendly (e.g. "Failed to load video"); retry option or "Go back" link is present; no unhandled exception in console |
| **Verification** | 1. Mock `getVideoData` to reject. 2. Load page. 3. Assert error message. 4. Assert retry/back available. 5. No 500 stack trace to user. |
| **Edge Case** | 404 from API → treat as video not found; show 404 page |

---

### 7.3 Fill the Blank Mode

#### AC-F1: Sentence displayed with blanks

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Fill mode selected; current subtitle has 3+ words (e.g. "緑さんこれ見て" → words: 緑, さん, これ, 見て) |
| **When** | Sentence is displayed |
| **Then** | 1–2 words are replaced by `_____` (blank placeholder); visible words remain in correct order; blanks are visually distinct (underline, dashed border, or similar); sentence remains readable |
| **Verification** | 1. Set Fill mode, 2 blanks. 2. Assert 2 `_____` in display. 3. Assert non-blank words in order. 4. Assert no raw "undefined" or empty strings. |
| **Example** | "緑さん _____ 見て" or "_____ さん _____ 見て" |

---

#### AC-F2: Blank positions deterministic within session

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Given** | User is on sentence N in Fill mode |
| **When** | User navigates away (e.g. Next) and returns to sentence N (e.g. Previous, if implemented) within same session |
| **Then** | Same words are hidden as blanks; blank positions do not change |
| **Verification** | 1. Note which words are blank on sentence 3. 2. Go to sentence 4, then back to 3. 3. Assert same blanks. |
| **Note** | Refresh may reset; acceptable for MVP. Document behavior. |

---

#### AC-F3: User can type in each blank

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Fill mode; sentence has 1 blank |
| **When** | User focuses the blank input and types (e.g. "これ") |
| **Then** | Input accepts Japanese (IME); characters appear; input is editable; backspace works |
| **Verification** | 1. Focus blank. 2. Type via IME. 3. Assert text in input. 4. Backspace. 5. Assert text removed. |
| **Given** | Sentence has 2 blanks |
| **When** | User tabs or clicks between blanks |
| **Then** | Each blank has its own input (or Tab moves focus); typing in one blank does not affect the other |
| **Verification** | 1. Type in blank 1. 2. Tab to blank 2. 3. Type. 4. Assert both values retained. |

---

#### AC-F4: Submit validates only blank values

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Fill mode; sentence "緑さん _____ 見て"; blank expects "これ" |
| **When** | User enters "これ" in the blank and clicks Submit |
| **Then** | Validation compares only the blank's value ("これ") against expected ("これ"); visible words ("緑さん", "見て") are not part of validation |
| **Verification** | 1. Enter correct blank value. 2. Submit. 3. Assert Correct. 4. Repeat with wrong value. 5. Assert Incorrect with expected "これ". |
| **Edge Case** | User modifies visible text (if editable) — out of scope; blanks are the only validated inputs |

---

#### AC-F5: All blanks correct → success

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Fill mode; 2 blanks; expected values "これ", "見て" |
| **When** | User enters "これ" in blank 1, "見て" in blank 2, and submits |
| **Then** | Result is Correct; success feedback shown (e.g. green checkmark, "Correct!"); Next button or auto-advance appears |
| **Verification** | 1. Fill both correctly. 2. Submit. 3. Assert Correct state. 4. Assert Next available. |
| **Validation Mode** | In Kana mode, "みて" should match "見て" (okurigana); in Kanji mode, "見て" required |

---

#### AC-F6: Any blank incorrect → show expected per blank

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Fill mode; 2 blanks expected "これ", "見て" |
| **When** | User enters "それ" in blank 1, "見て" in blank 2, and submits |
| **Then** | Result is Incorrect; feedback indicates blank 1 is wrong; expected value "これ" is shown for blank 1; blank 2 (correct) is not highlighted as wrong |
| **Verification** | 1. Enter wrong in blank 1, correct in blank 2. 2. Submit. 3. Assert Incorrect. 4. Assert "Expected: これ" (or per-blank feedback). 5. Assert blank 2 not marked wrong. |
| **UI** | Per-blank feedback preferred; minimum: show all expected values for incorrect blanks |

---

#### AC-F7: Single-word sentence

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Subtitle has 1 word (e.g. "あ" or "はい") |
| **When** | Fill mode displays this sentence |
| **Then** | That 1 word is hidden; display shows `_____`; user types the word; validation uses that word as expected |
| **Verification** | 1. Use single-word subtitle. 2. Assert one blank. 3. Type correct word. 4. Submit. 5. Assert Correct. |
| **Edge Case** | Sentence with 2 words → hide 1 only (AC-F8) |

---

#### AC-F8: Two-word sentence

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Subtitle has exactly 2 words (e.g. "はい そうです") |
| **When** | Fill mode displays this sentence |
| **Then** | 1 word is hidden (not both); display shows e.g. "_____ そうです" or "はい _____" |
| **Verification** | 1. Use two-word subtitle. 2. Assert exactly 1 blank. 3. Complete flow. |
| **Rationale** | Hiding both leaves nothing to learn from context |

---

#### AC-F9: Punctuation-only tokens not hidden alone

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Given** | `words` array includes punctuation as separate token (e.g. `{ text: "、", romaji: "" }`) |
| **When** | Blank selection runs |
| **Then** | Punctuation-only tokens are not chosen as blanks; content words (noun, verb, etc.) are preferred |
| **Verification** | 1. Use subtitle with punctuation token. 2. Assert no blank is punctuation only. 3. Assert at least one content word is blank. |
| **Note** | Depends on `words` structure; if punctuation is embedded in words, this may not apply |

---

### 7.4 Full Sentence Mode

#### AC-S1: No sentence text shown

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Full Sentence mode selected |
| **When** | Current sentence is displayed |
| **Then** | No Japanese sentence text is visible; only audio/video player, input area, and controls; user must listen to type |
| **Verification** | 1. Switch to Full mode. 2. Assert no `subtitle.sentence` in DOM. 3. Assert input is empty and focused (or focusable). |
| **Exception** | Translation may be hidden or shown per settings; sentence itself must not be visible |

---

#### AC-S2: Single input for full sentence

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Full Sentence mode |
| **When** | User types |
| **Then** | One text area (or input) accepts the entire sentence; multi-line allowed for long sentences; IME works; no character limit that truncates valid sentences |
| **Verification** | 1. Type full sentence. 2. Assert all characters in input. 3. Paste long sentence. 4. Assert no truncation. |
| **Min height** | Input should accommodate ~3 lines for long sentences (e.g. 50+ chars) |

---

#### AC-S3: Full sentence validation

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Full mode; expected sentence "緑さんこれ見て" |
| **When** | User types "緑さんこれ見て" and submits |
| **Then** | Validation compares entire user input to entire expected sentence (after normalization per validation mode); result is Correct |
| **Verification** | 1. Type exact match. 2. Submit. 3. Assert Correct. 4. Type with extra space. 5. Submit. 6. Assert behavior per lenient/strict setting. |

---

#### AC-S4: Correct full match

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Full mode; Kana mode; expected "みどりさんこれみて" (hiragana) |
| **When** | User types "みどりさんこれみて" (or equivalent in kanji that normalizes to same) and submits |
| **Then** | Result is Correct |
| **Verification** | 1. Match exactly in Kana mode. 2. Assert Correct. 3. In Kanji mode, type exact kanji. 4. Assert Correct. |

---

#### AC-S5: Incorrect shows expected sentence

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Full mode; expected "緑さんこれ見て" |
| **When** | User types "緑さんそれ見て" and submits |
| **Then** | Result is Incorrect; expected sentence "緑さんこれ見て" is displayed; user can see what they missed |
| **Verification** | 1. Submit wrong answer. 2. Assert Incorrect. 3. Assert expected text visible. 4. (P2) Assert diff/highlight of wrong part. |
| **MVP** | Showing expected is minimum; diff highlighting is P2 |

---

#### AC-S6: Lenient space handling

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Given** | Full mode; expected "みどりさんこれみて"; lenient mode on |
| **When** | User types "  みどりさん  これみて  " (extra leading/trailing/internal spaces) and submits |
| **Then** | Result is Correct; spaces are trimmed and collapsed before comparison |
| **Verification** | 1. Enter with extra spaces. 2. Submit. 3. Assert Correct. 4. Toggle lenient off. 5. Same input. 6. Assert Incorrect (if strict requires exact). |
| **Spec** | Trim both ends; collapse internal spaces to single space |

---

### 7.5 Audio Playback

#### AC-A1: Play starts from sentence start

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Current subtitle has `startTime: 24.0`, `endTime: 26.46`; video is paused or at different position |
| **When** | User clicks Play |
| **Then** | Video seeks to `subtitle.startTime` (24.0s); playback starts; audio plays from beginning of sentence |
| **Verification** | 1. Note `currentTime` before Play. 2. Click Play. 3. Assert `currentTime` becomes ~24.0. 4. Assert `paused` is false. 5. Listen: audio matches sentence. |
| **Tolerance** | Seek within ±0.1s acceptable |

---

#### AC-A2: Repeat replays current sentence

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | User has played sentence once; playback has stopped or ended |
| **When** | User clicks Repeat |
| **Then** | Video seeks to `subtitle.startTime`; playback starts; same sentence plays again |
| **Verification** | 1. Play sentence. 2. Wait for end or pause. 3. Click Repeat. 4. Assert seek to start. 5. Assert playback. |
| **Edge Case** | If already playing, Repeat may restart from start (implementation choice) |

---

#### AC-A3: Speed selector options

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Practice page loaded |
| **When** | User opens speed selector |
| **Then** | Options include 0.5x, 0.75x, 1x, 1.25x, 1.5x; current selection is indicated; selecting an option changes `video.playbackRate` |
| **Verification** | 1. Open dropdown. 2. Assert all 5 options. 3. Select 0.75x. 4. Assert `video.playbackRate === 0.75`. 5. Play. 6. Assert slower playback. |
| **Default** | 1x |

---

#### AC-A4: Volume control

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Practice page loaded |
| **When** | User adjusts volume (slider or mute) |
| **Then** | Volume changes; mute toggles audio on/off; state persists during session |
| **Verification** | 1. Move slider. 2. Assert volume change. 3. Click mute. 4. Assert no sound. 5. Unmute. 6. Assert sound. |

---

#### AC-A5: No auto-advance on sentence end

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | User is on sentence N |
| **When** | Sentence audio ends (video reaches `subtitle.endTime`) |
| **Then** | Playback stops; user remains on sentence N; no automatic advance to N+1; user must click Next or Submit to proceed |
| **Verification** | 1. Play sentence. 2. Do not interact. 3. Wait for audio end. 4. Assert still on same sentence. 5. Assert Next/Submit required. |

---

#### AC-A6: Seek before play

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Video is at 30s; current sentence starts at 24s |
| **When** | User clicks Play |
| **Then** | Before playing, video seeks to 24s; then plays |
| **Verification** | 1. Seek to 30s. 2. Click Play. 3. Assert `currentTime` becomes 24 before/during play. |
| **Note** | Ensures user always hears sentence from start |

---

#### AC-A7: Invalid timing handled

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Given** | Subtitle has `startTime >= endTime` (e.g. 24.0, 24.0) |
| **When** | That subtitle is current; user clicks Play |
| **Then** | No crash; either (a) skip to next valid subtitle, or (b) show warning and disable Play for this sentence |
| **Verification** | 1. Use subtitle with invalid timing. 2. Click Play. 3. Assert no throw. 4. Assert defined behavior (skip or warning). |
| **Edge Case** | `startTime` or `endTime` negative → treat as invalid |

---

#### AC-A8: No autoplay on load

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | User navigates to practice page |
| **When** | Page loads and renders |
| **Then** | Video does NOT auto-play; first playback requires user gesture (click Play) |
| **Verification** | 1. Load page. 2. Assert `video.paused === true`. 3. Assert no `play()` called before user click. |
| **Rationale** | Browser autoplay policy; avoids unexpected audio |

---

### 7.6 Validation — Kana Mode

#### AC-VK1: Hiragana input matches

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Kana mode; expected word "みどり" |
| **When** | User types "みどり" and submits |
| **Then** | Result is Correct |
| **Verification** | 1. Enter "みどり". 2. Submit. 3. Assert Correct. |
| **Test Data** | みどり, これ, です, たべる |

---

#### AC-VK2: Katakana input normalizes to hiragana

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Kana mode; expected "みどり" (hiragana) |
| **When** | User types "ミドリ" (katakana) and submits |
| **Then** | Result is Correct; katakana is converted to hiragana for comparison |
| **Verification** | 1. Enter ミドリ. 2. Submit. 3. Assert Correct. |
| **Test Data** | カ → か, ボルダリング → ぼるだりんぐ |
| **Edge Case** | Half-width katakana (ｶ) → normalize to full-width first, then to hiragana |

---

#### AC-VK3: Kanji input uses reading

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Kana mode; expected word "緑" with `romaji: "midori"` |
| **When** | User types "緑" (kanji) and submits |
| **Then** | Result is Correct; kanji is converted to reading (みどり) via `word.romaji` for comparison |
| **Verification** | 1. Expected 緑. 2. User types 緑. 3. Submit. 4. Assert Correct. |
| **Note** | System normalizes expected kanji to hiragana; user kanji also normalized to hiragana |

---

#### AC-VK4: Expected kanji uses romaji for comparison

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Kana mode; expected word `{ text: "緑", romaji: "midori" }` |
| **When** | Validation runs |
| **Then** | Expected value for comparison is hiragana derived from "midori" (みどり); not the kanji character itself |
| **Verification** | 1. User types みどり. 2. Submit. 3. Assert Correct. 4. User types 緑. 5. Submit. 6. Assert Correct. |
| **Implementation** | `romaji` → hiragana via wanakana or similar |

---

#### AC-VK5: Leading/trailing spaces ignored

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Kana mode; expected "みどり" |
| **When** | User types "  みどり  " and submits |
| **Then** | Result is Correct; trim is applied before comparison |
| **Verification** | 1. Enter "  みどり  ". 2. Submit. 3. Assert Correct. |
| **Test Data** | "\tみどり\n", " みどり " |

---

#### AC-VK6: Internal multiple spaces collapsed

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Given** | Kana mode; expected "みどり さん" (single space between) |
| **When** | User types "みどり  さん" (double space) and submits |
| **Then** | Result is Correct; multiple spaces collapsed to single space |
| **Verification** | 1. Enter "みどり  さん". 2. Submit. 3. Assert Correct. |
| **Regex** | `replace(/\s+/g, ' ')` or equivalent |

---

#### AC-VK7: Punctuation configurable

| Field | Detail |
|-------|--------|
| **Priority** | P2 |
| **Given** | Kana mode; expected "これ、見て"; lenient punctuation on |
| **When** | User types "これ見て" (no comma) and submits |
| **Then** | Result is Correct; punctuation (、。！？) stripped before comparison |
| **Verification** | 1. Enable lenient punctuation. 2. Omit punctuation. 3. Submit. 4. Assert Correct. 5. Disable. 6. Same input. 7. Assert Incorrect. |
| **Note** | MVP may default to lenient; document setting |

---

### 7.7 Validation — Kanji Mode

#### AC-VJ1: Exact kanji required

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Kanji mode; expected "聞く" (to hear) |
| **When** | User types "聴く" (to listen) and submits |
| **Then** | Result is Incorrect; homophones require exact kanji |
| **Verification** | 1. Expected 聞く. 2. User types 聴く. 3. Submit. 4. Assert Incorrect. 5. User types 聞く. 6. Submit. 7. Assert Correct. |
| **Test Data** | 聞く vs 聴く vs 効く |

---

#### AC-VJ2: Hiragana-only words exact match

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Kanji mode; expected "これ" |
| **When** | User types "これ" and submits |
| **Then** | Result is Correct |
| **Verification** | 1. Type exact. 2. Assert Correct. 3. Type "かれ". 4. Assert Incorrect. |
| **Note** | No kanji to compare; character-for-character match |

---

#### AC-VJ3: Katakana words exact match

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Kanji mode; expected "ボルダリング" |
| **When** | User types "ボルダリング" and submits |
| **Then** | Result is Correct |
| **Verification** | 1. Type exact. 2. Assert Correct. 3. Type "ボルダリン" (missing グ). 4. Assert Incorrect. |

---

#### AC-VJ4: Okurigana must match

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Kanji mode; expected "見て" (te-form) |
| **When** | User types "見る" (dictionary form) and submits |
| **Then** | Result is Incorrect; okurigana て vs る are different |
| **Verification** | 1. Expected 見て. 2. User types 見る. 3. Assert Incorrect. 4. User types 見て. 5. Assert Correct. |
| **Test Data** | 見て vs 見る, 食べた vs 食べる |

---

#### AC-VJ5: Homophones require correct kanji

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Kanji mode; expected "聞く" |
| **When** | User types "聴く" or "効く" and submits |
| **Then** | Result is Incorrect |
| **Verification** | 1. Try each homophone. 2. Assert all Incorrect. 3. Type 聞く. 4. Assert Correct. |
| **Note** | Same reading (きく), different kanji |

---

### 7.8 Navigation Between Sentences

#### AC-N1: Next advances to next sentence

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | User is on sentence 3 of 12 |
| **When** | User clicks Next (after Correct or Show Answer) |
| **Then** | Current sentence becomes 4; progress shows "Sentence 4 of 12"; new sentence displayed; input cleared; Play ready for new sentence |
| **Verification** | 1. On sentence 3. 2. Click Next. 3. Assert sentence 4. 4. Assert progress "4 of 12". 5. Assert input empty. |
| **Edge Case** | After Incorrect, Next may or may not advance (product decision); document |

---

#### AC-N2: Skip advances without validation

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | User is on sentence 3; input is empty or partially filled |
| **When** | User clicks Skip |
| **Then** | Advance to sentence 4; no validation; no Correct/Incorrect; input cleared |
| **Verification** | 1. On sentence 3. 2. Click Skip. 3. Assert sentence 4. 4. Assert no validation feedback. |
| **Use Case** | User doesn't know answer; wants to move on |

---

#### AC-N3: Last sentence Next behavior

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | User is on last sentence (e.g. 12 of 12) |
| **When** | User clicks Next after Correct or Show Answer |
| **Then** | Completion/summary view is shown; or user returns to first sentence; or modal "Practice complete" with option to replay; defined behavior, no crash |
| **Verification** | 1. Navigate to last sentence. 2. Complete or Show Answer. 3. Click Next. 4. Assert completion UI or defined flow. |
| **Product Decision** | Document: loop to first vs completion screen |

---

#### AC-N4: First sentence Previous (optional)

| Field | Detail |
|-------|--------|
| **Priority** | P2 |
| **Given** | User is on sentence 1 |
| **When** | Previous button exists |
| **Then** | Previous is disabled or hidden; or navigates to watch page |
| **Verification** | 1. On sentence 1. 2. Assert Previous disabled or absent. |
| **Note** | MVP may omit Previous; document |

---

#### AC-N5: Progress indicator accurate

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Video has 12 subtitles |
| **When** | User is on sentence 3 |
| **Then** | Progress shows "Sentence 3 of 12" (or i18n equivalent); updates when Next/Skip |
| **Verification** | 1. On sentence 3. 2. Assert "3 of 12". 3. Next. 4. Assert "4 of 12". |
| **Edge Case** | Filtered subtitles (e.g. skip invalid) — count reflects visible sentences |

---

### 7.9 Hint (Optional for MVP)

#### AC-H1: Hint reveals one character

| Field | Detail |
|-------|--------|
| **Priority** | P2 |
| **Given** | Fill mode; blank expects "これ"; user has not used hint |
| **When** | User clicks Hint |
| **Then** | First character "こ" is revealed in or near the blank; blank becomes "こ_____" or hint shown separately |
| **Verification** | 1. Click Hint. 2. Assert "こ" visible. 3. User can still type full answer. |
| **Note** | MVP may defer; P2 |

---

#### AC-H2: Multiple hints reveal sequentially

| Field | Detail |
|-------|--------|
| **Priority** | P2 |
| **Given** | Blank expects "これ"; user has used hint once ("こ" shown) |
| **When** | User clicks Hint again |
| **Then** | Next character "れ" revealed; display "これ" or "これ_____" |
| **Verification** | 1. Hint. 2. Hint again. 3. Assert "これ" or equivalent. |
| **Edge Case** | After full reveal, Hint disabled or no-op |

---

#### AC-H3: Hint does not auto-correct

| Field | Detail |
|-------|--------|
| **Priority** | P2 |
| **Given** | User has used Hint |
| **When** | User submits without completing |
| **Then** | Validation runs normally; hint does not mark as correct; user must type correct answer |
| **Verification** | 1. Hint. 2. Submit with wrong rest. 3. Assert Incorrect. |
| **Note** | Hint is aid only |

---

### 7.10 Settings

#### AC-X1: Practice mode selection

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | User is on practice page |
| **When** | User opens settings and selects "Fill the Blank" or "Full Sentence" |
| **Then** | Mode changes; UI updates (blanks vs full input); current sentence re-renders in new mode |
| **Verification** | 1. Select Fill. 2. Assert blanks. 3. Select Full. 4. Assert full input, no blanks. |
| **Persistence** | Session only; refresh resets to default |

---

#### AC-X2: Validation mode selection

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | User is on practice page |
| **When** | User selects "Kana" or "Kanji" |
| **Then** | Validation uses selected mode for subsequent submissions |
| **Verification** | 1. Kana mode. 2. Type みどり for 緑. 3. Assert Correct. 4. Switch to Kanji. 5. Type みどり. 6. Assert Incorrect. 7. Type 緑. 8. Assert Correct. |
| **Default** | Kana for MVP (N5/N4 focus) |

---

#### AC-X3: Blanks per sentence (Fill mode)

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Given** | Fill mode; sentence has 5+ words |
| **When** | User sets "1 blank" or "2 blanks" |
| **Then** | Next sentence shows 1 or 2 blanks accordingly |
| **Verification** | 1. Set 1 blank. 2. Assert 1 blank. 3. Set 2 blanks. 4. Assert 2 blanks. |
| **Note** | Short sentences may show fewer (see AC-F7, AC-F8) |

---

#### AC-X4: Settings persist in session

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Given** | User has set Full mode, Kanji validation |
| **When** | User navigates to next sentence, then back (if Previous exists) |
| **Then** | Settings remain Full, Kanji |
| **Verification** | 1. Change settings. 2. Next. 3. Back. 4. Assert same settings. |
| **Refresh** | Page refresh resets to defaults; acceptable for MVP |

---

### 7.11 Accessibility

#### AC-A11: Icon buttons have aria-label

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Practice page with Play, Repeat, Speed, Volume, Skip, Hint |
| **When** | Inspect each icon-only button |
| **Then** | Each has `aria-label` (or `title`) with descriptive text (e.g. "Play this sentence") |
| **Verification** | 1. Query `button[aria-label]` or `[title]`. 2. Assert all icon buttons have label. 3. Screen reader announces label. |
| **WCAG** | 4.1.2 Name, Role, Value |

---

#### AC-A12: Tooltips on hover/focus

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Icon button with tooltip |
| **When** | User hovers or focuses the button |
| **Then** | Tooltip appears within 300ms; describes action; dismisses on blur/mouseout |
| **Verification** | 1. Hover Play. 2. Assert tooltip "Play this sentence". 3. Focus with Tab. 4. Assert tooltip. 5. Blur. 6. Assert tooltip hidden. |
| **Component** | Ant Design Tooltip |

---

#### AC-A13: Keyboard navigation

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Practice page focused |
| **When** | User presses Tab repeatedly |
| **Then** | Focus moves through Play, Repeat, Speed, Volume, Skip, Hint, input, Submit, Next in logical order; Enter on Submit submits; focus visible (outline) |
| **Verification** | 1. Tab through. 2. Assert focus order. 3. Enter on Submit. 4. Assert validation runs. 5. Assert focus indicator visible. |
| **WCAG** | 2.1.1 Keyboard |

---

#### AC-A14: Screen reader announcements

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | User submits answer |
| **When** | Result is Correct or Incorrect |
| **Then** | Live region (`aria-live="polite"`) announces "Correct" or "Incorrect" and expected value if wrong |
| **Verification** | 1. Use screen reader. 2. Submit correct. 3. Assert "Correct" announced. 4. Submit wrong. 5. Assert "Incorrect" and expected announced. |
| **WCAG** | 4.1.3 Status Messages |

---

#### AC-A15: Input has label

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Input for answer |
| **When** | Inspect input |
| **Then** | Input has associated `<label>` (visible or `sr-only`) or `aria-label`; purpose is clear |
| **Verification** | 1. Query input. 2. Assert `id` + `label[for]` or `aria-label`. 2. Screen reader announces label. |
| **WCAG** | 1.3.1 Info and Relationships, 3.3.2 Labels or Instructions |

---

### 7.12 Internationalization (i18n)

#### AC-I1: UI strings from next-intl

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Practice page |
| **When** | Render all user-facing text |
| **Then** | No hardcoded English/Vietnamese; all strings from `useTranslations`; keys exist in `en.json`, `vi.json` |
| **Verification** | 1. Grep for hardcoded strings. 2. Assert none. 3. Switch locale. 4. Assert translations change. |
| **Keys** | e.g. `practice.play`, `practice.submit`, `practice.correct`, `practice.incorrect` |

---

#### AC-I2: Tooltips translated

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Locale set to `vi` |
| **When** | User hovers Play button |
| **Then** | Tooltip shows Vietnamese "Phát câu này" (or equivalent) |
| **Verification** | 1. Set locale vi. 2. Hover Play. 3. Assert Vietnamese tooltip. 4. Set locale en. 5. Assert English. |
| **Locales** | en, vi required; ja optional |

---

#### AC-I3: Error messages translated

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | Fetch fails or validation error |
| **When** | Error message is shown |
| **Then** | Message is in current locale; no raw error codes or English fallback in production |
| **Verification** | 1. Trigger fetch error. 2. Assert translated message. 3. Switch locale. 4. Trigger again. 5. Assert new locale. |
| **Examples** | "Failed to load video", "Please enter your answer" |

---

### 7.13 Additional Edge-Case ACs

#### AC-E1: Empty input on Submit

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | User has not typed anything (or only spaces) |
| **When** | User clicks Submit |
| **Then** | Validation does not run; inline error "Please enter your answer" (or i18n); input focused; no Correct/Incorrect |
| **Verification** | 1. Leave input empty. 2. Submit. 3. Assert error. 4. Assert no Correct/Incorrect. 5. Assert focus on input. |

---

#### AC-E2: Show Answer reveals correct text

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Given** | User is on a sentence; has not submitted or has submitted wrong |
| **When** | User clicks "Show Answer" |
| **Then** | Correct answer is displayed (in blanks or below input); input may be disabled or dimmed; Next button appears |
| **Verification** | 1. Click Show Answer. 2. Assert correct text visible. 3. Assert Next available. 4. Click Next. 5. Advance. |
| **Note** | Does not count as Correct for scoring (future) |

---

#### AC-E3: Page refresh resets state

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Given** | User is on sentence 5; has changed settings |
| **When** | User refreshes page (F5 or reload) |
| **Then** | Page reloads; user returns to sentence 1; settings reset to default; no persistence of session state |
| **Verification** | 1. Go to sentence 5. 2. Change mode. 3. Refresh. 4. Assert sentence 1. 5. Assert default settings. |
| **Future** | URL param `?sentence=5` could restore; out of MVP scope |

---

### 7.14 AC Summary Table

| Category | P0 Count | P1 Count | P2 Count | Total |
|----------|----------|----------|----------|-------|
| Route & Navigation | 5 | 0 | 0 | 5 |
| Data Loading | 3 | 1 | 0 | 4 |
| Fill the Blank | 7 | 2 | 0 | 9 |
| Full Sentence | 5 | 1 | 0 | 6 |
| Audio Playback | 6 | 1 | 0 | 7 |
| Validation Kana | 5 | 1 | 1 | 7 |
| Validation Kanji | 5 | 0 | 0 | 5 |
| Navigation | 4 | 0 | 1 | 5 |
| Hint | 0 | 0 | 3 | 3 |
| Settings | 2 | 2 | 0 | 4 |
| Accessibility | 5 | 0 | 0 | 5 |
| i18n | 3 | 0 | 0 | 3 |
| Edge Cases | 2 | 1 | 0 | 3 |
| **Total** | **56** | **9** | **5** | **70** |

---

## 8. Edge Cases Summary (Testing Checklist)

### 8.1 Data Edge Cases

| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| E1 | Video has 0 subtitles | Show empty state, link to watch page |
| E2 | Subtitle has empty `words` array | Fallback: treat whole sentence as one segment |
| E3 | Subtitle `startTime >= endTime` | Skip sentence or show warning |
| E4 | Word has empty `text` or `romaji` | Skip or use sentence-level fallback |
| E5 | Very long sentence (50+ chars) | Full sentence mode: multi-line input, no truncation |
| E6 | Single-character sentence (e.g. "あ") | Fill mode: hide it; Full mode: works |

### 8.2 Validation Edge Cases

| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| E7 | User types romaji in Kana mode | Convert to hiragana if supported; else treat as incorrect |
| E8 | User types half-width katakana (ｶ) | Normalize to full-width for comparison |
| E9 | User types mixed scripts (緑みどり) | Kana mode: normalize; Kanji mode: exact match fails |
| E10 | Expected has punctuation (、。) | Lenient: ignore; Strict: require |
| E11 | User adds extra spaces | Trim + collapse spaces |
| E12 | User submits empty input | Show validation error: "Please enter your answer" |
| E13 | Homophone kanji (聞く vs 聴く) | Kanji mode: must match exactly |

### 8.3 Playback Edge Cases

| # | Scenario | Expected Behavior |
|----|----------|-------------------|
| E14 | User clicks Play before video loaded | Show loading, or disable until ready |
| E15 | User seeks video manually during practice | Reset to sentence start on Play |
| E16 | Video fails to load (404, CORS) | Show error, retry option |
| E17 | Autoplay blocked by browser | Play button requires click; no auto-play |
| E18 | Sentence at end of video (endTime near duration) | Play normally |

### 8.4 UI Edge Cases

| # | Scenario | Expected Behavior |
|----|----------|-------------------|
| E19 | Window resize during practice | Layout responsive, no overflow |
| E20 | Very long word in Fill mode | Blank width accommodates or wraps |
| E21 | User switches mode (Fill ↔ Full) mid-session | Reset current sentence or preserve (specify) |
| E22 | User refreshes page | State lost; start from sentence 1 (or restore from URL?) |

### 8.5 Navigation Edge Cases

| # | Scenario | Expected Behavior |
|----|----------|-------------------|
| E23 | User on last sentence, clicks Next | Show completion/summary or loop to first |
| E24 | User on first sentence, clicks Previous | Disabled or go to watch page |
| E25 | Skip on last sentence | Same as E23 |
| E26 | Direct URL to `/practice` with invalid videoId | 404 |

---

## 9. Technical Architecture

### 9.1 Module Structure

```
src/
├── app/
│   └── learn/
│       └── videos/
│           └── [videoId]/
│               ├── page.tsx              # Watch page (existing)
│               └── practice/
│                   └── page.tsx           # NEW: Practice page
├── modules/
│   └── videos/
│       ├── components/
│       │   ├── VideoLearningPage.tsx     # Watch (existing)
│       │   └── practice/                 # NEW folder
│       │       ├── ListenTypePracticePage.tsx   # Main practice page component
│       │       ├── SentencePlayer.tsx            # Compact player + controls
│       │       ├── FillBlankInput.tsx            # Fill mode UI
│       │       ├── FullSentenceInput.tsx         # Full mode UI
│       │       ├── ValidationFeedback.tsx        # Correct/Incorrect display
│       │       └── PracticeSettings.tsx           # Mode, validation, blanks
│       ├── hooks/
│       │   ├── usePracticeSession.ts             # Sentence index, state
│       │   ├── useSentencePlayback.ts             # Per-sentence play/repeat/speed
│       │   └── useAnswerValidation.ts            # Validation logic
│       ├── utils/
│       │   └── practice-validation.ts             # Kana/kanji comparison
│       └── ... (existing)
```

### 9.2 Page Component (Thin)

```typescript
// app/learn/videos/[videoId]/practice/page.tsx
// - Fetch video via getVideoData
// - Auth check
// - Pass to ListenTypePracticePage
```

### 9.3 State Management

- **Local state:** Current sentence index, user input, correct/incorrect, settings
- **Zustand (optional):** `usePracticeStore` for settings persistence within session
- **URL state (optional):** `?sentence=3` for deep link / restore

### 9.4 Dependencies

| Dependency | Purpose | Notes |
|------------|---------|-------|
| `wanakana` (or similar) | Romaji ↔ Hiragana/Katakana conversion | For Kana mode validation |
| Existing: Ant Design, next-intl | UI, i18n | — |
| Existing: getVideoData | Data fetch | Reuse |

---

## 10. Data Model (Future Phase)

*Deferred to next phase. Included for planning.*

### 10.1 Potential Schema

```prisma
model PracticeSession {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  videoId     String   @map("video_id")
  mode        String   // "fill" | "full"
  validation  String   // "kana" | "kanji"
  startedAt   DateTime @map("started_at")
  completedAt DateTime? @map("completed_at")
  // ...
}

model PracticeAttempt {
  id           String   @id @default(uuid())
  sessionId    String   @map("session_id")
  subtitleId   String   @map("subtitle_id")
  userAnswer   String   @map("user_answer")
  isCorrect    Boolean  @map("is_correct")
  attemptNumber Int     @map("attempt_number")
  // ...
}
```

### 10.2 When to Implement

- User requests progress tracking
- Analytics on practice performance
- "Resume practice" feature

---

## 11. Phased Implementation

### Phase 1: MVP (This Spec)

| Scope | Deliverables |
|-------|---------------|
| Route | `/learn/videos/[videoId]/practice` page |
| Modes | Fill the Blank (random 1–2 words), Full Sentence |
| Validation | Kana mode only (simpler) |
| Playback | Per-sentence play, repeat, speed, volume |
| UI | Layout, tooltips, correct/incorrect feedback |
| Navigation | Next, Skip, progress indicator |

### Phase 2

| Scope | Deliverables |
|-------|---------------|
| Validation | Kanji mode |
| Hint | Reveal one character |
| Settings | Persist in localStorage |
| Vocabulary-based blanks | (If deck integration) |

### Phase 3

| Scope | Deliverables |
|-------|---------------|
| Data model | PracticeSession, PracticeAttempt |
| Progress | Resume, statistics |
| Analytics | Track completion, accuracy |

---

## 12. Success Metrics

| Metric | Target |
|--------|--------|
| Practice session completion rate | > 60% |
| Correct answer rate (first try) | Baseline to measure |
| Time to first practice | < 2 clicks from watch page |
| Accessibility | WCAG AA |

---

## 13. Changelog

- **2025-02-15**: Initial specification created
