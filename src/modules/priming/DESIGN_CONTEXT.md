# Contextual Story Reader - Design Context & Research

**Module:** `src/modules/priming/`  
**Status:** 🔄 Design Phase  
**Last Updated:** January 16, 2026

---

## Overview

This document captures the design thinking, UX research, and technical considerations for the **Contextual Story Reader** (also known as "The Explorer's Log" or "Contextual Weaver"). This feature transforms vocabulary learning from isolated memorization into an engaging narrative experience with embedded interactive learning.

---

## The Core Problem

Traditional vocabulary learning suffers from:

1. **Context Deficit**: Words are learned in isolation without situational meaning
2. **Cognitive Overload**: Learners face walls of foreign text that trigger anxiety
3. **Passive Learning**: Reading without interaction leads to shallow processing
4. **Motivation Gap**: Flashcard fatigue and lack of narrative engagement

---

## The Solution: Contextual Graded Reader with Interactive Scaffolding

### Core Concept: "Flow & Discover"

By embedding target Japanese vocabulary inside the user's native language (English/Vietnamese), we:

- **Reduce cognitive load** dramatically
- **Enable contextual guessing** before confirmation
- **Create flow state** where learning feels like reading, not studying
- **Gamify discovery** through vocabulary "collection mechanics"

### The Innovation: Collection Mechanics

Instead of presenting vocabulary as "words to study," we reframe them as **"hidden gems to collect"** within stories:

1. **Initial State**: Story loads with Japanese words highlighted but not yet "discovered"
2. **Interactive Engagement**: Users click/tap words to reveal meaning and collect them
3. **Collection Drawer**: Bottom panel shows silhouettes that fill in as words are discovered
4. **Completion Reward**: All words collected = story mastered = unlock next part

---

## Design Philosophy: "The Explorer's Log"

### Visual Style

- **Clean, high whitespace** - Editorial quality (think Medium or Apple Books)
- **Glassmorphism accents** - Modern, depth-based UI elements
- **Playful interactive elements** - But never childish

### Typography

- **Body Text**: High-readability serif font (Noto Serif JP)
- **Line Height**: Generous 1.6-1.8 for reduced eye strain
- **Japanese Words**: Distinctive inline pills with soft color highlights

### Color Palette (Zen Japanese)

- **Background**: Off-white / Cream (#FAFAF9) - easier on eyes
- **Body Text**: Dark Charcoal (#333333)
- **Highlight Color**: Soft Matcha Green (#94C973) or Periwinkle Blue (#6C63FF)
- **Popup Background**: Pure White with heavy drop shadow
- **Accent**: Vermilion for "collected" state

---

## User Experience Flow

### Phase A: Initial Load

```
User enters story → Text renders → Japanese words pulse once (shimmer)
→ Empty collection drawer shows "X words to discover"
```

**Visual Cues:**

- Japanese words have subtle underline or pill background
- Small "pulse" animation on first render to indicate interactivity
- Collection drawer at bottom shows silhouette placeholders

### Phase B: The Reading Flow

```
User reads naturally → Encounters unknown word → Clicks/taps
→ Rest of text blurs slightly → Popup appears with meaning + audio
→ Word "flies" down to collection drawer → Continues reading
```

**Focus Effect:**

- Active paragraph stays 100% opacity
- Previous/upcoming paragraphs dim to 70% opacity
- On word click: backdrop-filter blur(2px) for immersion

### Phase C: The Discovery

```
Word clicked → Smart tooltip appears → Auto-play pronunciation
→ User understands → Closes popup → Word marked "collected"
→ Animation: word ghost floats to drawer, fills silhouette
```

**Reward Loop:**

- Haptic feedback on mobile (subtle vibration)
- Soft "ding" sound (optional, user-controlled)
- Visual satisfaction of filling collection

### Phase D: Review & Translation

```
User stuck → Clicks "Translate" → Interlinear translation fades in
→ OR → Long-press sentence for single-sentence translation
```

**Safety Net:**

- Full translation available but not prominent
- Encourages contextual guessing first
- "Peek-a-boo" translation for single sentences

### Phase E: Completion

```
All words collected → "Next Part" button glows
→ User proceeds to Part 2 → Previous words may reappear (spaced repetition)
```

---

## Technical Implementation Strategy

### Data Structure (JSON Format)

Each story part contains:

```json
{
 "title": { "en": "...", "vi": "...", "ja": "..." },
 "body_text": {
  "en": "Every morning, I usually **いきます** to **学校**...",
  "vi": "Mỗi sáng, tôi thường **いきます** đến **学校**...",
  "ja": "毎朝、私はたいていバスで学校へいきます..."
 },
 "translation": { "en": "...", "vi": "..." },
 "highlights": [
  {
   "word_surface": "いきます",
   "length": 4,
   "positions": { "en": [25], "vi": [21], "ja": [13] }
  }
 ]
}
```

### Text Parsing Logic

**Critical Requirement**: Use position-based rendering, NOT string replacement.

```javascript
// Utility Function: renderSegmentedText
function renderSegmentedText(text, highlights, locale) {
 // 1. Sort highlights by position
 // 2. Slice text into segments: [text] [vocab] [text] [vocab]...
 // 3. Return array of { type: 'text' | 'vocab', content, meta }
}
```

**Why Position-Based?**

- Same word may appear multiple times with different contexts
- Prevents rendering errors from overlapping replacements
- Ensures exact alignment with audio timestamps (future feature)

### Component Architecture

```
StoryContainer (Server Component)
  ├─ StoryReader (Client Component)
  │   ├─ FocusTextRenderer
  │   │   └─ InteractiveWordChip (×N)
  │   ├─ SmartTooltip (Portal)
  │   └─ CollectionDrawer
  │       └─ VocabCard (×N)
  └─ TranslationToggle
```

---

## Micro-interactions & Animations

### 1. The Shimmer Effect

On initial load, highlighted words pulse once:

```css
@keyframes shimmer {
 0% {
  opacity: 1;
 }
 50% {
  opacity: 0.7;
  box-shadow: 0 0 8px rgba(148, 201, 115, 0.6);
 }
 100% {
  opacity: 1;
 }
}
```

### 2. The Collection Animation

When word is clicked:

```
1. Word in text → Ghost clone created
2. Ghost floats/flies down to drawer (1.2s ease-out)
3. On arrival → Silhouette fills with color
4. Haptic feedback + subtle scale bounce
```

### 3. The Blur Focus

When tooltip appears:

```css
.story-text {
 backdrop-filter: blur(2px);
 transition: backdrop-filter 0.3s ease;
}
```

### 4. Tooltip Entrance

Smart positioning to avoid screen edges:

```javascript
// Calculate optimal position (above/below/left/right)
// Animate: scale(0.9) → scale(1) + fade in (200ms)
```

---

## Advanced Features (Post-MVP)

### 1. "Peek-a-boo" Translation

Long-press (mobile) or hold-hover (desktop) on a **sentence** to see translation for that sentence only.

**Why:** Prevents lazy reading of full translation; encourages active processing.

### 2. Gradual Difficulty (Scaffolding)

If "いきます" appears in Part 1 and user collects it:

- **Part 3**: Same word appears with subtle underline (not bold highlight)
- **Part 5**: Same word appears with no highlighting

**Why:** Forces memory retrieval; progressive autonomy.

### 3. Audio Sync (Future)

Each word's position maps to audio timestamp:

```json
"audio_timestamps": {
  "いきます": { "start": 2.3, "end": 3.1 }
}
```

Auto-plays section audio, highlights words in real-time.

---

## Edge Cases & Considerations

### 1. Long Stories

**Problem**: 800+ character stories cause scroll fatigue.

**Solution**:

- Break into natural paragraphs
- Progressive loading (first 2 paragraphs visible, "Continue reading..." expands)
- Focus effect dims non-active paragraphs

### 2. Overlapping Highlights

**Problem**: "学生" and "生" both highlighted in same text.

**Solution**:

- Longer match takes precedence
- Position-based rendering prevents overlap
- Visual: nested highlights use opacity stacking

### 3. Mobile Touch Conflicts

**Problem**: Users may accidentally trigger words while scrolling.

**Solution**:

- Require tap-and-hold (300ms) for tooltip
- Or: Double-tap to collect, single-tap for quick preview
- Scroll velocity detection (ignore taps during fast scroll)

### 4. Translation Dependency

**Problem**: Users over-rely on full translation.

**Solution**:

- Track translation usage (analytics)
- Show "Try without translation" nudge if >80% usage
- Gamify: Bonus XP for completing without translation

---

## Accessibility Considerations

### Screen Readers

- Announce: "Clickable Japanese word: いきます"
- Tooltip content should be in ARIA live region
- Collection drawer updates should announce: "Word collected: 3 of 12"

### Keyboard Navigation

- Tab through highlighted words in reading order
- Enter/Space to open tooltip
- Escape to close
- Arrow keys to navigate collection drawer

### Color Blindness

- Don't rely solely on color for "collected" state
- Use icon (checkmark) + color + opacity change
- High contrast mode option

---

## Success Metrics

### Engagement Metrics

- **Collection Rate**: % of words clicked per story
- **Completion Rate**: % of stories finished (all words collected)
- **Time to First Click**: Speed of engagement
- **Re-read Rate**: Users revisiting completed stories

### Learning Effectiveness

- **Recall Rate**: Recognition of collected words in flashcards (7 days later)
- **Context Transfer**: Usage of words in sentence construction tasks
- **Translation Dependency**: % decrease in translation usage over time

### UX Quality

- **Flow Disruption**: Frequency of leaving mid-story
- **Tooltip Interaction Time**: Optimal = 3-8 seconds
- **Error Rate**: Accidental clicks during scroll

---

## References & Inspiration

### Academic

- **Krashen's Input Hypothesis**: Comprehensible input (i+1)
- **Dual Coding Theory**: Visual + textual encoding
- **Gamification Research**: Progress visualization and collection mechanics

### Product Inspirations

- **Duolingo Stories**: Narrative-based learning (but lacks interactivity)
- **LingQ**: Word highlighting (but cluttered UI, no collection mechanics)
- **Readlang**: Click-to-translate (but passive, no gamification)
- **Memrise**: Mnemonic focus (but isolated flashcards)

### Design Inspirations

- **Medium**: Editorial typography and reading experience
- **Apple Books**: Clean, focus-mode reading
- **Pokémon GO**: Collection completion dopamine
- **Notion**: Smooth animations and glassmorphism

---

## Open Questions for Product Team

1. **Story Length**: Optimal character count per part? (Current: ~300 chars)
2. **Vocabulary Density**: How many new words per story? (Current: ~12)
3. **Repetition Strategy**: When should collected words reappear?
4. **Audio Priority**: Should we invest in native speaker recordings or use TTS?
5. **Social Features**: Allow users to share their collection progress?

---

## Next Steps

1. **User Testing**: Test with 5-10 Vietnamese learners (N5-N4 level)
2. **A/B Testing**: Collection mechanics vs. traditional word list
3. **Content Pipeline**: Establish story generation workflow (AI + human QA)
4. **Technical Prototype**: Build MVP with Part 1 data to validate UX

---

**Document Maintainers**: Product Team, UX Design  
**Review Cycle**: Monthly during feature development
