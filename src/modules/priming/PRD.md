# Product Requirements Document: Contextual Story Reader

**Feature ID:** F-PRIMING-001  
**Product:** WatashiWa - Memory-First Japanese Learning App  
**Module:** `src/modules/priming/`  
**Status:** 📋 APPROVED FOR DEVELOPMENT  
**Priority:** 🔥 HIGH IMPACT  
**Owner:** Product Team  
**Created:** January 16, 2026  
**Last Updated:** January 16, 2026

**Related Documents:**

- [Design Context & Research](./DESIGN_CONTEXT.md)
- [Product V2 Strategy](../../docs/product_v2.md)
- [CUBE Architecture](../../docs/srs_architecture.md)
- [Design System](../../docs/design_system.md)

---

## Executive Summary

### The Opportunity

WatashiWa currently focuses on flashcard-based vocabulary acquisition (SRS + Smart CUBE interventions). However, research shows that **contextual learning** - where vocabulary is encountered within meaningful narratives - produces 2-3x stronger retention than isolated word memorization. Users consistently request more "natural" ways to encounter new vocabulary before diving into flashcard reviews.

The gap: **We lack a gentle, engaging entry point that primes learners with new vocabulary in context before formal study begins.**

### The Solution

The **Contextual Story Reader** (internal codename: "Explorer's Log") transforms pre-study vocabulary introduction from boring word lists into an interactive narrative experience. Users read engaging stories written in their native language (English/Vietnamese) with Japanese vocabulary naturally embedded as **"collectible gems"** they discover through reading.

**How It Works:**

1. **Story Format**: Multi-paragraph narrative (90% native language, 10% target Japanese vocabulary)
2. **Interactive Discovery**: Japanese words appear as clickable highlights within the story
3. **Smart Tooltips**: Click a word → popup shows meaning, reading, and pronunciation audio
4. **Collection Mechanics**: Each clicked word "flies" into a collection drawer, gamifying completion
5. **Progress Flow**: Complete all word discoveries → unlock next story part OR proceed to flashcard study

### Strategic Alignment with CUBE

This feature directly implements the **"C" (Context)** pillar of WatashiWa's Smart CUBE system:

| CUBE Pillar           | Implementation in Story Reader                                                              |
| --------------------- | ------------------------------------------------------------------------------------------- |
| **Context (C)**       | **PRIMARY**: Comprehensible input (i+1) through graded narratives with 90% known content    |
| **Understanding (U)** | Tooltip etymology, Hán Việt connections, and visual kanji breakdowns                        |
| **Blocking (B)**      | Story examples highlight usage differences for confusable words (e.g., いきます vs. きます) |
| **Encoding (E)**      | Interactive discovery creates stronger memory encoding than passive reading                 |

### Expected Impact

| Metric                      | Current Baseline                | Target (3 Months Post-Launch)               | Measurement Method                                          |
| --------------------------- | ------------------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| **Pre-Study Engagement**    | 0% (no pre-study phase)         | 70%+ users complete story before flashcards | Analytics: story completion rate                            |
| **New Word Recognition**    | ~40% (cold start in flashcards) | 65%+ (warmed up via stories)                | First flashcard attempt success rate for story-primed words |
| **Session Initiation Rate** | Baseline: 3.2 sessions/week     | +15% (3.7 sessions/week)                    | Story reading lowers barrier to "starting"                  |
| **D7 Retention**            | 35%                             | +8pp (43%)                                  | Story engagement creates habit momentum                     |
| **User Satisfaction**       | +32 NPS                         | +8 pts (+40 NPS)                            | Qualitative: "I love the stories" feedback                  |

### Why This Matters Now

**User Research Signals:**

- 68% of users report "anxiety" when encountering new vocabulary in flashcards (Dec 2025 survey)
- 54% request "more natural" ways to learn words before memorization drills
- Vietnamese learners specifically mention wanting "story context" to reduce cognitive load

**Competitive Gap:**

- Duolingo Stories: Engaging but passive (no interaction, no collection mechanics)
- LingQ: Interactive but cluttered (overwhelming UI, no gamification)
- Traditional SRS apps (Anki, WaniKani): Zero contextual pre-exposure

**Strategic Timing:**
We're uniquely positioned to combine:

1. **Graded reader methodology** (proven effective)
2. **Collection game mechanics** (dopamine-driven engagement)
3. **Smart CUBE integration** (vocabulary flows from stories → flashcards → knowledge graph)

---

## Product Strategy & Vision

### The "Curiosity-to-Context" Learning Loop

**Hypothesis**: Vocabulary learning fails not because users can't memorize, but because **cold-start anxiety** (encountering unknown words with zero context) triggers avoidance and forgetting.

**The Missing Bridge:**

```
Current Flow (High Friction):
  New Deck → [😰 ANXIETY GAP] → Flashcard Study → Forgetting → Intervention

Proposed Flow (Low Friction):
  New Deck → [📖 Story Reading] → [✨ Discovery] → Flashcard Study → Retention ↑
```

**Behavioral Science Foundation:**

1. **Comprehensible Input (Krashen)**: Learning happens at "i+1" (90% known, 10% new)
2. **Dual Coding Theory**: Words + narrative context = stronger encoding
3. **Gamification**: Collection completion triggers dopamine (progress visualization)
4. **Reduced Anxiety**: Familiar language "scaffold" prevents cognitive overload

### The Three Strategic Pillars

```
        CONTEXTUAL STORY READER
                 │
    ┌────────────┼────────────┐
    │            │            │
  PRIMING    DISCOVERY    FLOW BRIDGE
    │            │            │
 "Warm up    "Learn       "Natural
  brain      through      transition
  before     play, not    to deep
  study"     drills"      study"
```

**Pillar 1: Pre-Study Priming**

- **Goal**: Activate relevant neural pathways before formal study
- **Method**: Stories introduce vocabulary with 90% comprehensible context
- **Outcome**: First flashcard exposure becomes recognition (not cold memorization)

**Pillar 2: Discovery-Based Learning**

- **Goal**: Transform passive reading into active exploration
- **Method**: Interactive word clicking + collection mechanics
- **Outcome**: Engagement without study fatigue (feels like reading, not learning)

**Pillar 3: Seamless Study Transition**

- **Goal**: Bridge narrative learning to flashcard mastery
- **Method**: Collected words automatically become prioritized in next study session
- **Outcome**: Zero friction between "casual exploration" and "serious study"

### Market Positioning: The "Netflix of Vocabulary Learning"

**Positioning Statement:**
_For serious Japanese learners who dread the anxiety of cold-start flashcards, WatashiWa's Story Reader is the contextual pre-study experience that transforms vocabulary introduction from intimidating drills into engaging narrative discovery—unlike Duolingo (passive stories) or LingQ (cluttered interface), we combine interactive collection mechanics with Smart CUBE intelligence for seamless study flow._

**Competitive Differentiation Matrix:**

| Feature               | Duolingo Stories | LingQ        | Traditional SRS | **WatashiWa Stories**      |
| --------------------- | ---------------- | ------------ | --------------- | -------------------------- |
| Narrative Context     | ✅ Good          | ✅ Good      | ❌ None         | ✅ Excellent               |
| Interactive Discovery | ❌ Passive       | ⚠️ Basic     | ❌ None         | ✅ Gamified Collection     |
| Visual Polish         | ✅ High          | ❌ Cluttered | ❌ Minimal      | ✅ Zen Minimalist          |
| SRS Integration       | ❌ Separate      | ❌ Separate  | N/A             | ✅ Seamless (CUBE)         |
| Vietnamese Support    | ⚠️ Limited       | ❌ None      | ⚠️ Manual       | ✅ Native (Hán Việt)       |
| Collection Mechanics  | ❌ None          | ❌ None      | ❌ None         | ✅ Pokémon-style Discovery |

---

## User Journeys

### Journey 1: Linh - From Flashcard Anxiety to Story Confidence

**User Profile:**

- **Name**: Linh Nguyễn
- **Age**: 22, Vietnamese university student
- **Level**: JLPT N5 (6 months studying)
- **Pain Point**: Feels overwhelmed when flashcard sessions start with 30+ unknown words. Often quits mid-session due to anxiety.

**Current Experience (Without Story Reader):**

1. **07:00 AM** - Linh opens WatashiWa, sees "30 New Cards" notification → Feels anxious
2. **07:02 AM** - Starts flashcard session → First card: "いきます" (no context) → Guesses wrong → Confidence drops
3. **07:08 AM** - After 10 failed attempts on new words, closes app feeling defeated
4. **Result**: Avoids app for 2 days, D7 retention suffers

**New Experience (With Story Reader):**

1. **07:00 AM** - Linh opens WatashiWa, sees **"New Story Available: The Daily Commute"** (with illustration)
2. **07:02 AM** - Starts reading: _"Every morning, I usually **いきます** to **学校** by **バス**..."_
3. **07:03 AM** - Clicks "いきます" → Tooltip appears: "Ikimasu - to go (polite form)" + audio pronunciation
4. **07:04 AM** - Continues reading, clicks 5 more words → Collection drawer shows "6/12 words discovered" → Feels progress
5. **07:10 AM** - Completes story → "All words collected! 🎉 Ready to study flashcards?"
6. **07:12 AM** - Starts flashcard session → Recognizes "いきます" from story → Gets it right → Confidence boost ✨
7. **Result**: Completes full session, feels empowered, returns next day

**Emotional Transformation:**

- **Before**: Anxiety → Avoidance → Guilt
- **After**: Curiosity → Discovery → Mastery

**Key Requirements Surfaced:**

- R1: Stories must feel "completable" (clear progress indicators)
- R2: Word discovery must feel rewarding (animation + sound feedback)
- R3: Transition from stories to flashcards must be seamless (1-click)
- R4: Vietnamese interface for native comprehension

---

### Journey 2: Tuấn - From Boredom to Engagement

**User Profile:**

- **Name**: Tuấn Lê
- **Age**: 27, software engineer
- **Level**: JLPT N4 (2 years studying)
- **Pain Point**: Finds traditional flashcards "boring and robotic." Wants more "natural" learning but lacks time for textbooks.

**Current Experience (Without Story Reader):**

1. **09:00 PM** - Tuấn reviews flashcards while tired from work
2. **09:05 PM** - Mindlessly clicks through cards, not fully processing
3. **09:15 PM** - Closes app, retains very little due to passive engagement

**New Experience (With Story Reader):**

1. **09:00 PM** - Opens app, sees **"Continue Your Story: Travel Schedule - Part 3"**
2. **09:02 PM** - Reads engaging narrative about planning a trip with Japanese friends
3. **09:08 PM** - Clicks interesting words (新幹線, 飛行機) → Learns in context → Feels natural
4. **09:15 PM** - Completes story + flashcard session → Retains more due to emotional engagement
5. **Result**: Looks forward to tomorrow's story continuation

**Emotional Transformation:**

- **Before**: Obligation → Boredom → Minimal retention
- **After**: Curiosity → Enjoyment → Strong retention

**Key Requirements Surfaced:**

- R5: Stories must feel like entertainment, not textbooks (narrative quality)
- R6: Multi-part story arcs create "return habit" (serial storytelling)
- R7: Words must integrate naturally into stories (not forced)
- R8: Support for "pause and resume" (busy professional lifestyle)

---

### Journey 3: Mai - From Confusion to Clarity (Hán Việt Bridge)

**User Profile:**

- **Name**: Mai Trần
- **Age**: 19, high school graduate
- **Level**: Beginner (2 months)
- **Superpower**: Native Vietnamese speaker with strong Hán Việt knowledge
- **Pain Point**: Can't leverage her existing Hán Việt knowledge in current learning tools

**New Experience (With Story Reader + Hán Việt Integration):**

1. **06:00 PM** - Reads story, clicks "学校" (gakkou - school)
2. **06:01 PM** - Tooltip shows: "学校 = HỌC (học) + HIỆU (trường) → School"
3. **06:02 PM** - **"Aha!" moment** - Realizes Japanese Kanji ≈ Vietnamese Hán Việt
4. **06:05 PM** - Clicks "学生" (student) → Sees "HỌC (học) + SANH (sinh) → Student"
5. **06:06 PM** - Brain connects: Same "学" root → School + Student family
6. **Result**: Rapid vocabulary acquisition through cultural bridge

**Emotional Transformation:**

- **Before**: Kanji feels arbitrary and intimidating
- **After**: Kanji feels logical and familiar (leveraging L1 knowledge)

**Key Requirements Surfaced:**

- R9: Hán Việt etymology must be prominent in tooltips (Vietnamese users)
- R10: Knowledge graph connections shown visually (學 family: 学校, 学生, 大学)
- R11: User can toggle Hán Việt hints on/off (preference)

---

## Innovation & Novel Patterns

### Core Innovation Thesis

**Collection Mechanics > Passive Reading**

Traditional graded readers (LingQ, Duolingo Stories) present vocabulary but fail to create **intrinsic motivation for interaction**. Users can passively scroll without engaging, leading to shallow processing.

**WatashiWa's Innovation**: Apply **Pokémon-style collection mechanics** to vocabulary discovery:

1. **Empty Slots Create Desire**: Collection drawer shows silhouettes of words not yet discovered → Creates "completion itch"
2. **Discovery = Reward**: Clicking a word triggers satisfying animation (word "flies" to collection) + haptic feedback + progress update
3. **Visual Progress**: "8/12 words collected" creates clear goal and dopamine hits
4. **Completion Badge**: Finishing a story unlocks achievement → Shares on social → Virality

**Why This Works** (Behavioral Science):

- **Zeigarnik Effect**: Incomplete collections create cognitive tension → Motivation to finish
- **Variable Rewards**: Each word click = small dopamine hit (like slot machine)
- **Progress Visualization**: Seeing collection fill = intrinsic motivation

### Novel Pattern 1: "Inline Pills" Visual Design

**Problem**: Traditional highlights (yellow background, underline) look like errors or links.

**Our Solution**: Japanese words appear as **"inline pill chips"** - soft-rounded rectangles with color fill + subtle shadow.

**Visual Effect:**

```
Normal Text: "Every morning, I usually"
Word Pill:   [いきます] (soft indigo background, rounded corners, subtle glow)
Normal Text: "to school by bus."
```

**Benefits:**

- Looks intentional and designed (not accidental highlighting)
- Visually distinct = brain recognizes "this is interactive"
- Hover/click state: Pill slightly lifts (3D effect) → Invites interaction

### Novel Pattern 2: "Ghost Animation" Collection Flow

**Problem**: Standard UI has no satisfying feedback when clicking words.

**Our Solution**: When user clicks word, a **"ghost clone"** of the word floats down to collection drawer.

**Animation Sequence:**

1. User clicks word → Original word stays in text
2. Ghost clone created → Floats down (1.2s ease-out curve) with slight rotation
3. Ghost reaches drawer → Merges into empty silhouette slot with burst effect
4. Silhouette fills with color + word appears
5. Haptic feedback (mobile) + subtle sound (optional)

**Inspiration**: iOS app deletion animation, Pokémon catch animation

### Novel Pattern 3: "Peek-a-boo" Translation

**Problem**: Showing full translation = users get lazy and skip reading.

**Our Solution**: **Sentence-level on-demand translation** instead of paragraph-level.

**Interaction:**

- **Mobile**: Long-press on a sentence → Translation fades in below that sentence only
- **Desktop**: Hover on sentence + hold Cmd/Ctrl → Translation appears

**Benefits:**

- Encourages active reading (must consciously request translation)
- Prevents "translation crutch" dependency
- Maintains immersion (doesn't reveal entire story at once)

---

## Product Scope

### MVP - Minimum Viable Product (Phase 1)

**Core Reading Experience:**

- ✅ Multi-part story system (3-5 parts per story arc)
- ✅ Inline pill design for Japanese vocabulary
- ✅ Smart tooltip with meaning, reading, audio pronunciation
- ✅ Collection drawer with progress tracking
- ✅ Ghost animation for word collection
- ✅ Vietnamese + English interface support

**Story Content:**

- ✅ 3 story arcs (5 parts each = 15 total story parts)
- ✅ N5 vocabulary focus (~12 words per story part)
- ✅ Topics: Daily life, travel, social interactions
- ✅ 300-400 characters per story part (2-3 minute read)

**Integration with Core App:**

- ✅ Story completion tracked in user progress
- ✅ Collected words auto-added to flashcard review queue
- ✅ Story unlocks based on deck/unit progress
- ✅ Analytics: story completion rate, word click rate, time-to-complete

**Basic Personalization:**

- ✅ User can select preferred reading language (EN/VI)
- ✅ User can toggle audio auto-play
- ✅ User can adjust text size (3 sizes: S/M/L)
- ✅ Progress saves if user exits mid-story

**Performance & Polish:**

- ✅ Smooth animations (60fps) on mobile + desktop
- ✅ Offline support (PWA caching) for downloaded stories
- ✅ Accessible keyboard navigation (Tab → Enter to click words)
- ✅ Screen reader support for word tooltips

**Out of Scope for MVP:**

- ❌ User-generated stories (future Phase 2)
- ❌ AI-generated personalized stories (future Phase 3)
- ❌ Audio narration of full story (future Phase 2)
- ❌ 3D knowledge graph visualization in stories (future Phase 3)
- ❌ Social sharing of collections (future Phase 2)

---

### Post-MVP Features (Phase 2)

**Enhanced Reading Experience:**

- Audio narration with real-time word highlighting (karaoke-style)
- "Focus mode" - dims non-active paragraphs for concentration
- Customizable highlight color themes (user preference)
- "Peek-a-boo" sentence translation (long-press)

**Advanced Personalization:**

- AI-adjusted story difficulty based on user's vocabulary level
- Story recommendations based on weak vocabulary clusters
- "Re-encountered words" - stories reuse words user forgot in flashcards

**Social & Gamification:**

- Share collection progress on social media
- Leaderboard: Fastest collection times
- Achievement badges for story completion milestones
- Community-voted favorite stories

**Content Expansion:**

- 10+ story arcs (50+ parts total)
- N4 and N3 vocabulary levels
- Themed collections: Business Japanese, Anime Cultural References, JLPT Prep
- User-submitted story translations (community contribution)

---

### Vision (Phase 3+)

**AI-Powered Adaptive Stories:**

- Stories generated in real-time based on user's weak vocabulary
- Personalized narratives using user's interests (from profile)
- Dynamic difficulty adjustment (adds more unknown words if user excels)

**Multimedia Integration:**

- Video stories with subtitle sync (like YouTube Learn feature)
- Interactive branching narratives (choose-your-own-adventure)
- Voice acting by native speakers (professional recording)

**Cross-Feature Integration:**

- Knowledge graph visualization embedded in stories (click word → see connections)
- Story-triggered Smart CUBE interventions (if user confused → mini-drill)
- AI Memory Coach suggests stories based on forgetting curve

**Ecosystem Expansion:**

- Story content marketplace (creators sell stories)
- Multi-language support (Korean, Chinese, Spanish learners)
- API for third-party content creators
- White-label licensing for educational institutions

---

## Functional Requirements

### Story Content Management

**FR1: Story Structure**

- System supports multi-part story arcs (minimum 3 parts, maximum 10 parts per arc)
- Each story part contains: title (multi-language), body text (multi-language), vocabulary highlights (with position data), full translation (safety net)
- Story parts are tagged with: difficulty level (N5/N4/N3), topic category, estimated read time

**FR2: Vocabulary Highlighting Data**

- Each highlighted word includes: surface form (kanji/kana), reading (hiragana), meaning (EN/VI), position index in each language version
- System stores Hán Việt etymology data for Vietnamese learners (optional field)
- Words link to existing Vocabulary records in database (for flashcard integration)

**FR3: Story Progression**

- Users can access stories based on deck/unit unlock status
- Users can pause mid-story and resume later (progress auto-saves)
- Users can replay completed stories (no limit)
- System tracks: completion status, words collected count, total read time

**FR4: Content Delivery**

- Stories are pre-loaded into app (no streaming during reading for smooth UX)
- Offline support via PWA caching (stories available without internet)
- Images/illustrations preloaded for each story arc (optional enhancement)

---

### Interactive Reading Experience

**FR5: Text Rendering**

- System renders text using position-based segmentation (not string replacement)
- Japanese words appear as "inline pill" components (distinctive visual design)
- Non-highlighted text renders in native language (user's preference: EN or VI)
- Text is responsive and readable on mobile (320px) to desktop (2560px)

**FR6: Word Interaction**

- **Desktop**: Hover on word → subtle glow effect; Click → tooltip appears
- **Mobile**: Tap on word → tooltip appears; Long-press (300ms) → preview mode
- Tooltip contains: word (large), reading (smaller), meaning (bold), audio play button, Hán Việt hint (for VI users)
- Clicking outside tooltip or pressing Esc → closes tooltip

**FR7: Audio Pronunciation**

- Each word click triggers audio pronunciation (Japanese TTS or pre-recorded)
- Audio auto-plays on first click (configurable in settings)
- User can replay audio by clicking speaker icon in tooltip
- Audio uses clear, slow pronunciation for learners (0.8x speed)

**FR8: Collection Mechanics**

- When word clicked → "ghost animation" carries word to collection drawer
- Collection drawer shows: total word count, collected count, progress bar, word cards
- Collected words change visual state: grayscale silhouette → colored card with kanji
- Haptic feedback (mobile) + optional sound effect (can be disabled)

**FR9: Translation Toggle**

- User can click "Show Translation" button below story text
- Translation appears as interlinear text (fades in between lines)
- OR (future enhancement): Long-press sentence → translation for that sentence only
- System tracks translation usage (analytics) to measure learning independence

---

### User Personalization

**FR10: Reading Preferences**

- User selects preferred reading language: English or Vietnamese (stored in profile)
- User adjusts text size: Small (16px), Medium (18px), Large (20px)
- User toggles audio auto-play: On (default) or Off
- User toggles Hán Việt hints: Always Show (Vietnamese users), On Click, Hidden

**FR11: Progress Tracking**

- System tracks per story: completion percentage, words collected, time spent
- User can view "Story Progress" page: all stories with completion badges
- Achievements unlock at milestones: First story complete, 10 stories complete, etc.
- Progress syncs across devices (server-side storage)

**FR12: Study Integration**

- Collected words auto-add to user's flashcard review queue (with "story context" tag)
- User can start flashcard session directly from story completion screen (1-click)
- Flashcards show "First seen in story: The Daily Commute" (context reminder)
- Analytics track: story-primed words vs. cold-start words (retention comparison)

---

### Content Quality & Safety

**FR13: Story Validation**

- All stories reviewed by native Japanese speakers before publication
- Vocabulary position data validated (automated test ensures correct highlighting)
- Vietnamese translations reviewed by native speakers (cultural accuracy)
- JLPT level tags verified against official vocabulary lists

**FR14: User Feedback**

- Users can report errors in stories (typos, wrong translations, broken audio)
- Users can rate stories (1-5 stars) with optional text feedback
- System flags stories with <3.5 average rating for review
- Admin dashboard shows: story completion rates, error reports, ratings

---

## Non-Functional Requirements

### Performance

**NFR1: Loading & Rendering**

- Story initial load: <2 seconds on 3G network (including images)
- Text rendering with highlights: <300ms for 500 character stories
- Tooltip open animation: <150ms (feels instant)
- Ghost collection animation: 1.2 seconds (smooth 60fps)

**NFR2: Smooth Animations**

- All animations run at 60fps on mobile devices (tested: iPhone 12, Samsung S21)
- No frame drops during ghost animation or tooltip transitions
- Blur/focus effects use GPU acceleration (transform/opacity only, no layout thrashing)

**NFR3: Offline Support**

- Downloaded stories accessible without internet (PWA service worker caching)
- Progress auto-saves locally → syncs when connection restored
- Cached audio files for all words in downloaded stories

**NFR4: Scalability**

- System supports 100+ story arcs (1000+ parts) without performance degradation
- Database queries for story content: <100ms (indexed by story_id, user_id)
- Concurrent users: 10,000+ reading stories simultaneously without server load issues

---

### Accessibility

**NFR5: WCAG 2.1 AA Compliance**

- All text meets 4.5:1 contrast ratio (body text) and 3:1 (large text)
- Keyboard navigation: Tab → focuses words in reading order; Enter → opens tooltip
- Screen reader announces: "Clickable Japanese word: いきます" → Tooltip content read aloud
- Focus indicators visible and high-contrast (3px blue outline)

**NFR6: Inclusive Design**

- Text size adjustable (3 sizes) without breaking layout
- Color blindness mode: uses icons + color + opacity for "collected" state
- Reduced motion mode: disables ghost animation (respects prefers-reduced-motion)
- Touch targets: minimum 44x44px (WCAG mobile guidelines)

**NFR7: Language Support**

- Vietnamese interface fully localized (all UI strings, error messages)
- Hán Việt hints use proper Vietnamese diacritics (no character mangling)
- Right-to-left text support for future Arabic/Hebrew expansions (architecture prepared)

---

### Security & Privacy

**NFR8: Data Protection**

- User story progress encrypted at rest (AES-256)
- No personal data in story content (generic narratives only)
- Analytics data anonymized (user_id hashed) before aggregation
- GDPR compliance: users can export story progress data

**NFR9: Content Safety**

- Stories reviewed for cultural sensitivity (no offensive content)
- User-submitted feedback moderated (profanity filter + human review)
- Audio files scanned for malware before upload (pre-recorded audio)

---

### Reliability

**NFR10: Uptime & Error Handling**

- Story service availability: 99.5% uptime (core learning feature)
- Graceful degradation: If audio fails → show text-only reading
- If tooltip fails → fallback to inline word meaning
- Auto-save progress every 30 seconds (prevents data loss on app crash)

**NFR11: Error Recovery**

- If user loses connection mid-story → local cache serves content
- If collection animation glitches → word still marked collected (data integrity)
- If story content corrupt → show error message + suggest alternative story

---

## User Experience Specifications

### Visual Design System

**Color Palette:**

- **Background**: Off-white (#FAFAF9) - reduces eye strain
- **Body Text**: Charcoal (#333333) - high contrast
- **Word Pills (Default)**: Soft Matcha Green (#94C973) background + Dark Green (#2D5016) text
- **Word Pills (Hover)**: Brighter Matcha (#A6D982) + slight lift (box-shadow)
- **Word Pills (Collected)**: Periwinkle Blue (#6C63FF) background + checkmark icon
- **Tooltip Background**: Pure White (#FFFFFF) with 0 8px 24px rgba(0,0,0,0.12) shadow

**Typography:**

- **Body Text**: Noto Serif JP (or fallback: Georgia, serif)
- **Font Size**: 18px default (adjustable to 16px/20px)
- **Line Height**: 1.7 (generous for readability)
- **Word Pills**: 600 font-weight (semi-bold) + 0px 4px padding
- **Tooltip Word**: 24px bold, Reading: 14px gray, Meaning: 16px semi-bold

**Spacing:**

- **Paragraph Gaps**: 24px (clear visual separation)
- **Word Pills**: 2px horizontal margin (prevent crowding)
- **Collection Drawer**: 80px fixed height (bottom of screen, sticky)

---

### Interaction Patterns

**Micro-interactions:**

1. **Shimmer Effect** (on story load):
   - All word pills pulse once (0.8s duration)
   - Effect: Subtle opacity change (1.0 → 0.75 → 1.0) + soft glow
   - Purpose: Signals "these are clickable"

2. **Hover State** (desktop):
   - Word pill lifts 2px (transform: translateY(-2px))
   - Shadow deepens (0 2px 8px rgba(0,0,0,0.15))
   - Cursor changes to pointer
   - Transition: 150ms ease-out

3. **Click/Tap State**:
   - Word pill scales down slightly (transform: scale(0.95))
   - Haptic feedback on mobile (light impact)
   - Ghost clone created and begins float animation

4. **Ghost Animation**:
   - Clone of word pill created at original position
   - Floats down to collection drawer (1.2s cubic-bezier ease)
   - Slight rotation (0deg → 3deg → 0deg) during flight
   - On arrival: merges into silhouette with burst particle effect

5. **Tooltip Entrance**:
   - Appears above/below word (auto-positions to avoid screen edges)
   - Fade in (opacity 0 → 1) + scale up (0.95 → 1.0) over 200ms
   - Audio auto-plays (if enabled) 300ms after tooltip appears
   - Backdrop blur (backdrop-filter: blur(3px)) applied to story text

6. **Collection Drawer Update**:
   - Progress bar fills smoothly (transition: width 500ms ease)
   - Number updates with counting animation (7/12 → 8/12)
   - Collected word card flips from gray to color (3D flip effect)

---

### Responsive Behavior

**Mobile (320px - 767px):**

- Story text: 16px font size (readability on small screens)
- Word pills: 44px minimum height (touch target requirement)
- Tooltip: Full-width at bottom of screen (modal style)
- Collection drawer: Horizontal scroll for word cards
- Ghost animation: Shorter path (1.0s instead of 1.2s)

**Tablet (768px - 1023px):**

- Story text: 18px font size
- Tooltip: Positioned near word (floating, not modal)
- Collection drawer: Grid layout (2 rows if many words)

**Desktop (1024px+):**

- Story text: 18px default (user adjustable)
- Tooltip: Smart positioning (above/below word, avoid edges)
- Collection drawer: Single row with smooth scrolling
- Hover effects enabled (no touch-and-hold required)

---

### Accessibility Features

**Keyboard Navigation Flow:**

1. User presses Tab → First word pill receives focus (blue outline)
2. User presses Tab again → Next word pill focused (reading order)
3. User presses Enter/Space → Tooltip opens
4. User presses Esc → Tooltip closes, focus returns to word pill
5. User presses Tab → Next word pill focused

**Screen Reader Announcements:**

- On word focus: "Clickable Japanese word: ikimasu"
- On tooltip open: "Tooltip opened. Word: ikimasu. Reading: i-ki-ma-su. Meaning: to go. Button: Play audio."
- On collection: "Word collected. Progress: 8 of 12 words."

**High Contrast Mode:**

- Word pills: Solid border + high-contrast background
- Collected state: Uses checkmark icon (not just color)
- Focus indicators: Thicker border (4px) for visibility

---

## Technical Architecture

### Component Structure (Vertical Slice)

```
src/modules/priming/
  ├── components/
  │   ├── StoryReader.tsx           # Main container (Client Component)
  │   ├── StoryHeader.tsx            # Title + progress indicator
  │   ├── StoryText.tsx              # Renders segmented text + word pills
  │   ├── WordPill.tsx               # Interactive word chip
  │   ├── WordTooltip.tsx            # Smart tooltip with audio
  │   ├── CollectionDrawer.tsx       # Bottom sticky drawer
  │   ├── WordCard.tsx               # Individual collected word card
  │   └── TranslationToggle.tsx     # Show/hide translation
  ├── hooks/
  │   ├── useStoryProgress.ts        # Track user progress (Zustand)
  │   ├── useWordCollection.ts       # Handle collection logic
  │   ├── useAudioPlayer.ts          # Audio playback (reused from existing)
  │   └── useTextSegmentation.ts     # Parse story text into segments
  ├── utils/
  │   ├── parseStoryText.ts          # Position-based text parsing
  │   ├── tooltipPositioning.ts      # Smart tooltip placement
  │   └── animationHelpers.ts        # Ghost animation utilities
  ├── actions.ts                     # Server Actions (MUST use executeSafeAction)
  ├── services.ts                    # Business logic (pure functions)
  ├── data.ts                        # Prisma queries (DB access)
  ├── types.ts                       # TypeScript interfaces
  └── PRD.md                         # This document
```

### Data Models (Prisma Schema)

```prisma
model Story {
  id          String   @id @default(uuid())
  slug        String   @unique  // URL-friendly identifier
  order       Int      // Story arc sequencing

  // Multi-language content (JSONB)
  content     Json     // { title: {en, vi}, body_text: {en, vi, ja}, translation: {en, vi}, highlights: ["word1", "word2"] }

  // Metadata
  difficulty  String   // "N5" | "N4" | "N3"
  category    String   // "daily_life" | "travel" | "social"
  readTimeMin Int      // Estimated read time (minutes)

  // Relations
  vocabularies StoryVocabulary[]
  userLogs     StoryLog[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([difficulty, category])
}

model StoryVocabulary {
  id           String @id @default(uuid())
  storyId      String
  vocabularyId String

  // Position data for highlighting (JSONB)
  positions    Json   // { en: [25, 120], vi: [21, 115], ja: [13, 98] }

  story        Story      @relation(fields: [storyId], references: [id], onDelete: Cascade)
  vocabulary   Vocabulary @relation(fields: [vocabularyId], references: [id])

  @@unique([storyId, vocabularyId])
  @@index([storyId])
}

model StoryLog {
  id           String   @id @default(uuid())
  userId       String
  storyId      String

  // Progress tracking
  completedAt  DateTime?
  wordsCollected Int    @default(0)
  totalWords   Int
  readTimeSeconds Int   @default(0)

  // Behavior tracking (JSONB)
  analytics    Json     // { clickedWords: [id1, id2], translationUsed: boolean, pausedTimes: [...] }

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  story        Story    @relation(fields: [storyId], references: [id], onDelete: Cascade)

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([userId, storyId])
  @@index([userId])
  @@index([storyId])
}
```

### Server Actions Pattern

**Critical: ALL Server Actions MUST use `executeSafeAction`**

Example:

```typescript
// src/modules/priming/actions.ts
'use server';

import { executeSafeAction } from '@/modules/core/action-client';
import { z } from 'zod';

import { getStoryBySlug, markStoryAsRead } from './services';

const GetStoryInputSchema = z.object({
 slug: z.string().min(1),
});

export async function getStoryAction(input: unknown) {
 return executeSafeAction(
  GetStoryInputSchema,
  input,
  async (data, { userId }) => {
   const story = await getStoryBySlug(data.slug, userId);
   return story;
  },
  { requireAuth: true },
 );
}

const MarkCollectedInputSchema = z.object({
 storyId: z.string().uuid(),
 vocabularyId: z.string().uuid(),
 readTimeSeconds: z.number().int().positive(),
});

export async function markWordCollectedAction(input: unknown) {
 return executeSafeAction(
  MarkCollectedInputSchema,
  input,
  async (data, { userId }) => {
   await markStoryAsRead(userId, data.storyId, data.vocabularyId);
   return { success: true };
  },
  { requireAuth: true },
 );
}
```

### Text Parsing Algorithm

**Critical: Position-Based Rendering (Not String Replacement)**

```typescript
// src/modules/priming/utils/parseStoryText.ts

interface Segment {
 type: 'text' | 'vocab';
 content: string;
 meta?: {
  vocabularyId: string;
  reading: string;
  meaning: string;
  audioUrl?: string;
 };
}

export function parseStoryText(
 text: string,
 highlights: Array<{
  word_surface: string;
  length: number;
  positions: { [locale: string]: number[] };
 }>,
 locale: 'en' | 'vi' | 'ja',
): Segment[] {
 const segments: Segment[] = [];
 const positions = highlights
  .flatMap((h) => h.positions[locale].map((pos) => ({ pos, length: h.length, data: h })))
  .sort((a, b) => a.pos - b.pos);

 let lastIndex = 0;

 for (const { pos, length, data } of positions) {
  // Add text before this word
  if (pos > lastIndex) {
   segments.push({ type: 'text', content: text.slice(lastIndex, pos) });
  }

  // Add vocab word
  segments.push({
   type: 'vocab',
   content: text.slice(pos, pos + length),
   meta: {
    vocabularyId: data.vocabularyId,
    reading: data.reading,
    meaning: data.meaning,
    audioUrl: data.audioUrl,
   },
  });

  lastIndex = pos + length;
 }

 // Add remaining text
 if (lastIndex < text.length) {
  segments.push({ type: 'text', content: text.slice(lastIndex) });
 }

 return segments;
}
```

---

## Content Strategy

### Story Creation Guidelines

**Narrative Quality Standards:**

1. **Comprehensibility**: 90% of content in native language (EN/VI)
2. **Natural Integration**: Japanese words flow naturally in sentences (not forced)
3. **Emotional Engagement**: Stories have relatable characters and mild drama/humor
4. **Cultural Relevance**: Topics resonate with target audience (Vietnamese/English speakers learning Japanese)

**Vocabulary Selection:**

- 10-15 target words per story part
- Words from JLPT N5/N4 official lists
- Priority: High-frequency words (used in daily conversation)
- Avoid: Overly academic or rare vocabulary

**Example Story Part (Good):**

```
Title: "The Lost Wallet"
Body: "I was walking to the コンビニ when I saw a 財布 on the ground.
I picked it up and saw a 名前 inside. 'Should I call the 警察?' I wondered.
Then, an おばあさん came running toward me, out of breath.
'My 財布!' she cried. 'ありがとうございます!' she said with tears of joy."

Vocabulary Density: 6 words / ~200 characters = ~3% (optimal)
Emotional Hook: Helping someone → feels good → memorable
```

**Example Story Part (Bad - Too Dense):**

```
"The 会議 at the 会社 was about 経済 and 投資. The 社長 said..."

Problem: 5 words in first sentence = too overwhelming
Fix: Reduce to 2-3 words per sentence, spread across paragraphs
```

### Content Pipeline

**Phase 1: MVP Content**

- **Goal**: 15 story parts (3 arcs × 5 parts each)
- **Timeline**: Pre-launch (2 months)
- **Process**:
  1. **Writer** (bilingual EN-JA or VI-JA): Draft story in native language
  2. **Vocabulary Specialist**: Identify JLPT N5 target words to embed
  3. **Integration**: Rewrite story to naturally include target words
  4. **Translation**: Create EN + VI versions if starting from other language
  5. **Review**: Native speakers (JA, EN, VI) validate accuracy and flow
  6. **Position Mapping**: Technical writer maps word positions in each language version
  7. **QA**: Automated test validates position data (no highlighting errors)

**Phase 2: Post-Launch Expansion**

- **Goal**: 50+ story parts (10 arcs)
- **Process**: Same as Phase 1 + user feedback integration
- **Community Contributions**: Allow users to submit stories (moderated queue)

**Phase 3: AI-Assisted Generation**

- **Goal**: Personalized stories generated per user
- **Process**:
  1. AI generates story draft based on user's weak vocabulary
  2. Human editor reviews for quality + cultural sensitivity
  3. Native speaker validates translations
  4. Published to user's personal story feed

---

## Analytics & Success Metrics

### Key Performance Indicators (KPIs)

**Engagement Metrics:**

| Metric                        | Definition                                                   | Target       | Measurement Frequency |
| ----------------------------- | ------------------------------------------------------------ | ------------ | --------------------- |
| **Story Completion Rate**     | % of started stories that are finished (all words collected) | 70%+         | Daily                 |
| **Words Collected Per Story** | Average number of words clicked out of total available       | 10/12 (83%+) | Per story             |
| **Time to First Click**       | Seconds from story load to first word click                  | <15s         | Per session           |
| **Re-read Rate**              | % of users who replay completed stories                      | 15%+         | Weekly                |
| **Session Initiation Lift**   | % increase in flashcard sessions after story engagement      | +15%         | Weekly                |

**Learning Effectiveness Metrics:**

| Metric                            | Definition                                                            | Target                | Measurement Frequency |
| --------------------------------- | --------------------------------------------------------------------- | --------------------- | --------------------- |
| **Story-Primed Word Recognition** | % correct on first flashcard attempt for story-primed words           | 65%+                  | Per flashcard session |
| **Cold-Start Word Recognition**   | % correct on first flashcard attempt for non-primed words (control)   | 40% (baseline)        | Per flashcard session |
| **Retention Improvement**         | Difference between story-primed vs cold-start recognition             | +25pp (65% vs 40%)    | Monthly               |
| **Translation Dependency Rate**   | % of story sessions where user clicked "Show Translation"             | <30% (lower = better) | Per story             |
| **Translation Dependency Trend**  | Change in translation usage over time (user becomes more independent) | -10% per month        | Monthly               |

**Behavioral Metrics:**

| Metric                         | Definition                                                               | Target | Measurement Frequency |
| ------------------------------ | ------------------------------------------------------------------------ | ------ | --------------------- |
| **D1 Retention (Story Users)** | % of users who return Day 1 after reading first story                    | 60%+   | Daily                 |
| **D7 Retention (Story Users)** | % of users who return Day 7 after reading first story                    | 43%+   | Weekly                |
| **Study Frequency Lift**       | % increase in study sessions per week for story users vs non-story users | +20%   | Weekly                |
| **Feature Adoption Rate**      | % of active users who try story reading within first 7 days              | 80%+   | Weekly                |

**Quality Metrics:**

| Metric                   | Definition                                                                    | Target | Measurement Frequency |
| ------------------------ | ----------------------------------------------------------------------------- | ------ | --------------------- |
| **Story Ratings**        | Average user rating (1-5 stars)                                               | 4.2+   | Per story             |
| **Error Report Rate**    | % of story sessions where user reported error (typo, wrong translation, etc.) | <2%    | Weekly                |
| **Audio Play Rate**      | % of word clicks that trigger audio playback                                  | 85%+   | Per story             |
| **Animation Smoothness** | % of sessions with 60fps animation performance (no frame drops)               | 95%+   | Daily (auto-logged)   |

---

### Analytics Implementation

**Event Tracking (via existing analytics system):**

```typescript
// Story Loading
trackEvent('story_started', {
 story_id: string,
 story_slug: string,
 difficulty: 'N5' | 'N4' | 'N3',
 user_level: string,
});

// Word Interaction
trackEvent('word_clicked', {
 story_id: string,
 vocabulary_id: string,
 word_surface: string,
 position_in_story: number, // Which word clicked (1st, 2nd, etc.)
 time_since_story_start: number, // Seconds
});

// Collection Progress
trackEvent('word_collected', {
 story_id: string,
 vocabulary_id: string,
 collection_count: number, // Total collected so far (e.g., 5/12)
 total_words: number,
});

// Story Completion
trackEvent('story_completed', {
 story_id: string,
 words_collected: number,
 total_words: number,
 read_time_seconds: number,
 translation_used: boolean,
 audio_plays_count: number,
});

// Translation Usage
trackEvent('translation_toggled', {
 story_id: string,
 translation_shown: boolean, // true = user clicked to reveal
 time_since_story_start: number,
});

// Flashcard Integration
trackEvent('story_to_flashcard_transition', {
 story_id: string,
 words_primed: number, // How many story words are in next flashcard session
});
```

**Dashboard Metrics (for Product Team):**

1. **Story Funnel Dashboard:**
   - Stories started → Words clicked → Stories completed
   - Drop-off points (which stories have low completion?)
   - Time-to-complete distribution (are stories too long?)

2. **Learning Effectiveness Dashboard:**
   - Story-primed word recognition rate (line chart over time)
   - Comparison: Story users vs non-story users (flashcard performance)
   - Heatmap: Which words have low click rates? (maybe unclear context?)

3. **Content Performance Dashboard:**
   - Story ratings (sorted by rating, flag <4.0 for review)
   - Error report heatmap (which stories have most issues?)
   - Popular stories (most completed, highest re-read rate)

4. **User Behavior Dashboard:**
   - Cohort retention: Story users vs non-story users
   - Session frequency: Before/after story feature launch
   - Translation dependency trend (are users becoming more independent?)

---

## Go-to-Market Strategy

### Launch Plan (3-Phase Rollout)

**Phase 1: Closed Beta (2 weeks)**

- **Audience**: 50 existing active users (Vietnamese, JLPT N5-N4 level)
- **Content**: 1 story arc (5 parts)
- **Goal**: Validate UX, identify bugs, measure engagement
- **Success Criteria**:
  - 70%+ story completion rate
  - 4.0+ average rating
  - <5 critical bugs reported
- **Feedback Loop**: Daily Slack channel with beta users, quick iteration

**Phase 2: Soft Launch (1 month)**

- **Audience**: All active users (opt-in via banner: "Try New Story Feature")
- **Content**: 3 story arcs (15 parts)
- **Goal**: Scale to full user base, measure learning effectiveness
- **Success Criteria**:
  - 60%+ adoption rate (60% of active users try stories)
  - 65%+ story-primed word recognition (vs 40% baseline)
  - Positive qualitative feedback (NPS survey)
- **Marketing**: Email blast, in-app notification, social media teaser

**Phase 3: Full Launch (Ongoing)**

- **Audience**: All users (new + existing)
- **Content**: 3 story arcs at launch → expand to 10 arcs over 3 months
- **Goal**: Establish stories as core feature, drive retention
- **Success Criteria**:
  - D7 retention +8pp lift (35% → 43%)
  - 80%+ feature adoption within 7 days (new users)
  - Featured in app store updates (iOS/Android)
- **Marketing**: Press release, influencer partnerships (Japanese learning YouTubers), Reddit/Quora AMAs

---

### Marketing Messaging

**Value Proposition (User-Facing):**

> "Learn Japanese vocabulary the natural way—through engaging stories, not boring flashcards. Click words to discover meanings, collect them all, and watch your language skills grow."

**Key Messages:**

1. **"Netflix for Vocabulary"**
   - Stories feel like entertainment, not study
   - Binge-worthy narrative arcs (cliffhangers between parts)
   - "Just one more story" addictiveness

2. **"Discover, Don't Memorize"**
   - Interactive word discovery (like treasure hunting)
   - Collection mechanics make learning feel like a game
   - See progress visually (collection drawer fills up)

3. **"Context is King"**
   - Words in sentences = easier to remember than isolated flashcards
   - Native language scaffold reduces anxiety
   - Smooth transition to flashcard mastery

4. **"For Vietnamese Learners, By Vietnamese Learners"**
   - Hán Việt bridges make Kanji intuitive
   - Stories culturally relevant (topics Vietnamese learners care about)
   - Interface in Vietnamese (no language barrier)

**Channels:**

1. **In-App:**
   - Banner: "New Feature: Learn Through Stories 📖✨"
   - Onboarding tooltip for new users: "Try a story before flashcards!"
   - Push notification: "Your next story is waiting: The Lost Wallet"

2. **Email:**
   - Subject: "We've Made Vocabulary Learning Fun (Finally!)"
   - Body: Showcase story reader GIF + testimonial from beta user

3. **Social Media:**
   - Instagram: Carousel post showing before/after (boring flashcards → beautiful story UI)
   - TikTok: 15-second demo of word collection animation (satisfying!)
   - Reddit r/LearnJapanese: "We built a story reader with Pokémon-style word collection" (discussion thread)

4. **Influencer Partnerships:**
   - Send free Samurai tier to Japanese learning YouTubers (100K+ subs)
   - Request: Video review of story feature (if they genuinely like it)
   - Incentive: Affiliate code (20% discount for their audience)

---

## Risks & Mitigation

### Technical Risks

**Risk 1: Animation Performance on Low-End Devices**

- **Impact**: High (could alienate users with older phones)
- **Likelihood**: Medium
- **Mitigation**:
  - Feature detection: Disable ghost animation on devices with <30fps detection
  - Fallback: Instant collection (no animation) if performance poor
  - User setting: "Reduce animations" toggle in settings

**Risk 2: Position Data Accuracy**

- **Impact**: Critical (incorrect highlighting breaks UX)
- **Likelihood**: Low (with proper QA)
- **Mitigation**:
  - Automated test suite validates position data for every story
  - Visual regression testing (screenshots of rendered stories)
  - Manual QA review by bilingual team member before publication

**Risk 3: Audio File Availability**

- **Impact**: Medium (TTS fallback available)
- **Likelihood**: Low
- **Mitigation**:
  - Primary: Use existing TTS system (Web Speech API)
  - Future: Pre-recorded audio by native speakers (better quality)
  - Offline: Cache audio files in PWA service worker

---

### Content Risks

**Risk 4: Story Quality Inconsistency**

- **Impact**: High (bad stories = user churn)
- **Likelihood**: Medium (depends on writer skill)
- **Mitigation**:
  - Hire experienced bilingual content writers (JA-EN, JA-VI)
  - Editorial review process (3 reviewers per story)
  - User ratings flag low-quality stories (<4.0) for revision
  - Beta test new stories before full launch

**Risk 5: Vocabulary Selection Misalignment**

- **Impact**: Medium (wrong words = ineffective learning)
- **Likelihood**: Low (JLPT lists are standardized)
- **Mitigation**:
  - Strict adherence to JLPT N5/N4 official word lists
  - Frequency analysis (prioritize most-used words in native content)
  - User feedback: "This word feels too advanced" flag

---

### User Experience Risks

**Risk 6: Translation Dependency**

- **Impact**: Medium (users may rely on translation crutch)
- **Likelihood**: High (natural user behavior)
- **Mitigation**:
  - Hide translation by default (require conscious click)
  - Track usage (analytics) and nudge users with low dependency
  - Gamification: Bonus XP for completing story without translation
  - Future: "Peek-a-boo" sentence translation (harder to abuse)

**Risk 7: Overwhelming Cognitive Load**

- **Impact**: High (users quit mid-story if too hard)
- **Likelihood**: Medium
- **Mitigation**:
  - Strict vocabulary density: Max 15 words per story (10-12 optimal)
  - Difficulty filtering: Only show stories matching user's JLPT level
  - Progressive unlock: Start with easiest story, unlock harder ones later
  - User setting: Adjust text size for readability

---

### Business Risks

**Risk 8: Low Adoption Rate**

- **Impact**: Critical (feature fails if users don't try it)
- **Likelihood**: Low (with proper onboarding)
- **Mitigation**:
  - Prominent placement: Dashboard banner + onboarding tooltip
  - Push notification: "Your first story is ready!" (Day 2 after signup)
  - Social proof: Show "10,000+ users loved this story" badge
  - A/B test messaging: "Try Story Mode" vs "Learn Without Flashcards"

**Risk 9: Content Scaling Cost**

- **Impact**: Medium (expensive to produce 50+ stories)
- **Likelihood**: High (quality content is expensive)
- **Mitigation**:
  - MVP: 15 stories (covers first 3 months)
  - Community contributions: Allow users to submit stories (moderated)
  - AI-assisted generation (Phase 3): Reduces writer workload by 50%
  - Samurai tier benefit: Access to premium stories (monetization)

---

## Success Criteria & Validation

### Validation Metrics (3-Month Post-Launch)

**Tier 1: Must-Have (Launch Blockers)**

- ✅ Story completion rate ≥ 70%
- ✅ Story-primed word recognition ≥ 65% (vs 40% baseline)
- ✅ Average story rating ≥ 4.2 / 5.0
- ✅ D7 retention lift ≥ +5pp (35% → 40%+)

**Tier 2: Should-Have (Optimization Targets)**

- ✅ Feature adoption ≥ 60% within 7 days
- ✅ Translation dependency rate ≤ 30%
- ✅ Re-read rate ≥ 15%
- ✅ Session frequency lift ≥ +15%

**Tier 3: Nice-to-Have (Aspirational)**

- ✅ Viral sharing: 5%+ of users share story progress
- ✅ Content requests: 10+ user-submitted story ideas
- ✅ Press coverage: Featured in 1+ EdTech publications

### Qualitative Validation

**User Interview Questions (Post-Launch):**

1. "How do stories compare to flashcards for learning new words?"
2. "Did you feel less anxious encountering new vocabulary in stories vs flashcards?"
3. "Which story did you enjoy most, and why?"
4. "Did the collection mechanics motivate you to finish stories?"
5. "What would make the story experience even better?"

**Expected Themes:**

- "Stories make learning feel natural, not forced"
- "I love the satisfaction of collecting all words"
- "Vietnamese support + Hán Việt hints are game-changers"
- "I wish there were more stories!"

---

## Appendix

### A. Sample Story Data Structure

```json
{
 "id": "story-001-daily-commute-part1",
 "slug": "daily-commute-part-1",
 "order": 1,
 "title": {
  "en": "The Daily Commute - Part 1",
  "vi": "Việc Đi Lại Hằng Ngày - Phần 1",
  "ja": "毎日の通勤 - パート1"
 },
 "body_text": {
  "en": "Every morning, I usually いきます to 学校 by バス. However, today the weather was beautiful, so I decided to go 歩いて.",
  "vi": "Mỗi sáng, tôi thường いきます đến 学校 bằng バス. Tuy nhiên, hôm nay thời tiết rất đẹp, nên tôi quyết định đi 歩いて.",
  "ja": "毎朝、私はたいていバスで学校へいきます。しかし、今日は天気が良かったので、歩いていくことにしました。"
 },
 "translation": {
  "en": "Every morning, I usually go to school by bus. However, today the weather was beautiful, so I decided to go on foot.",
  "vi": "Mỗi sáng, tôi thường đi đến trường học bằng xe buýt. Tuy nhiên, hôm nay thời tiết rất đẹp, nên tôi quyết định đi bộ."
 },
 "highlights": [
  {
   "word_surface": "いきます",
   "length": 4,
   "positions": { "en": [25], "vi": [21], "ja": [13] },
   "vocabulary_id": "vocab-uuid-001",
   "reading": "いきます",
   "meaning_en": "to go (polite)",
   "meaning_vi": "đi (lịch sự)",
   "han_viet_hint": "Động từ: đi, tới"
  },
  {
   "word_surface": "学校",
   "length": 2,
   "positions": { "en": [33], "vi": [30], "ja": [9] },
   "vocabulary_id": "vocab-uuid-002",
   "reading": "がっこう",
   "meaning_en": "school",
   "meaning_vi": "trường học",
   "han_viet_hint": "学 (HỌC) + 校 (HIỆU) = Trường học"
  }
 ],
 "difficulty": "N5",
 "category": "daily_life",
 "read_time_min": 2
}
```

### B. Glossary

- **Word Pill**: The inline UI component representing clickable Japanese vocabulary
- **Ghost Animation**: The floating animation when a word is collected
- **Collection Drawer**: The bottom sticky panel showing collected words
- **Story Arc**: A series of connected story parts (typically 5 parts per arc)
- **Comprehensible Input (i+1)**: Krashen's theory that learners acquire language when exposed to content slightly above their current level
- **Hán Việt**: Vietnamese readings of Chinese characters (Kanji), used as a learning bridge
- **JLPT N5/N4**: Japanese Language Proficiency Test levels (N5 = beginner, N4 = elementary)

### C. References

**Academic Research:**

- Krashen, S. (1982). _Principles and Practice in Second Language Acquisition_. Pergamon Press.
- Paivio, A. (1986). _Mental Representations: A Dual Coding Approach_. Oxford University Press.
- Deterding, S. et al. (2011). "Gamification: Toward a Definition." CHI 2011 Workshop.

**Product Inspirations:**

- Duolingo Stories: [duolingo.com/stories](https://www.duolingo.com/stories)
- LingQ: [lingq.com](https://www.lingq.com)
- Readlang: [readlang.com](https://readlang.com)

**Design Resources:**

- [Ant Design v6 Documentation](https://ant.design)
- [Material Design Motion Guidelines](https://m3.material.io/styles/motion)
- [WebAIM: Designing for Screen Readers](https://webaim.org/articles/screenreader_testing/)

---

**Document Version**: 1.0  
**Approval Status**: ✅ Approved for Development  
**Next Review Date**: Post-Beta (2 weeks after Phase 1 launch)

**Approvers:**

- [ ] Product Manager: **********\_\_\_**********
- [ ] Engineering Lead: **********\_\_\_**********
- [ ] UX Designer: **********\_\_\_**********
- [ ] Content Lead: **********\_\_\_**********

---

_End of Product Requirements Document_
