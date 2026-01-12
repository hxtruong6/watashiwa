# UI/UX DESIGN SPECIFICATION: AI-POWERED SEARCH & LEARNING ASSISTANT

**Product:** WatashiWa - Memory-First Japanese Learning App  
**Feature ID:** F-SA-001-UI  
**Design Version:** 1.0  
**Last Updated:** January 13, 2026  
**Design System:** [iOS16 Glass Style](../ios16-glass-design-guide.md) + [Zen Mastery](../design_system.md)  
**Designer:** Product Design Team  
**Related Docs:** [Feature PRD](./ai-search-assistant.md)

---

## 🎨 DESIGN PHILOSOPHY

### The "Zen Search" Principles

**1. Invisible Until Needed**  
Search should feel like it's always been there—not intrusive, just ready. Think: Spotlight on macOS, Command Palette in VSCode.

**2. Glass Morphism Meets Clarity**  
Beautiful blurred glass effects shouldn't compromise readability. Every element must pass WCAG AA contrast (4.5:1 minimum).

**3. Progressive Disclosure**  
Start simple (dictionary), reveal complexity gradually (AI features). Don't overwhelm on first use.

**4. Emotional Micro-Moments**  
Every interaction should feel delightful: smooth animations, satisfying haptics, gentle sounds (optional).

**5. Cross-Device Continuity**  
Muscle memory should transfer: Search icon in same spot on phone/tablet/desktop. Keyboard shortcuts consistent.

---

## 🎯 DESIGN GOALS

| Goal | Success Metric | Design Solution |
|------|----------------|-----------------|
| **Instant Discoverability** | 80% of users try search within 7 days | Prominent search icon with "New!" badge, glowing effect |
| **Zero Learning Curve** | <5s to complete first search | Familiar search UX (inspired by Google/Spotlight) |
| **Engagement Without Friction** | 92% click-through on results | Large tap targets, skeleton loaders, instant feedback |
| **AI Value Clarity** | 35% try AI features | Crown icon 👑, preview animations, clear CTAs |
| **Accessibility** | 100% WCAG AA compliance | High contrast, screen reader support, keyboard nav |

---

## 📐 DESIGN SYSTEM TOKENS

### Color Palette (Aligned with Zen Mastery)

**Light Mode:**

```css
--search-bg-glass: rgba(255, 255, 255, 0.85); /* Glass surface */
--search-bg-glass-strong: rgba(255, 255, 255, 0.92); /* Result cards */
--search-accent: #4F46E5; /* Indigo - Primary actions */
--search-accent-glow: rgba(79, 70, 229, 0.15); /* Glow effect */
--search-success: #10B981; /* Matcha Green - Mastery */
--search-warning: #EF4444; /* Vermilion - Alerts */
--search-text-primary: #2D2D2D; /* Sumi ink */
--search-text-secondary: #8C8C8C; /* Stone grey */
--search-border: rgba(0, 0, 0, 0.08); /* Subtle borders */
--search-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
```

**Dark Mode:**

```css
--search-bg-glass: rgba(21, 31, 50, 0.85); /* Deep Slate glass */
--search-bg-glass-strong: rgba(21, 31, 50, 0.92); /* Result cards */
--search-accent: #63B3ED; /* Clear Sky Blue */
--search-accent-glow: rgba(99, 179, 237, 0.15);
--search-success: #68D391; /* Emerald */
--search-warning: #FC8181; /* Red 300 */
--search-text-primary: rgba(255, 255, 255, 0.92);
--search-text-secondary: rgba(255, 255, 255, 0.65);
--search-border: rgba(255, 255, 255, 0.08);
--search-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
```

### Typography Scale

```css
--font-search-input: 18px / 24px (Mobile), 20px / 28px (Desktop);
--font-result-kanji: 24px / 32px (Bold, Noto Sans JP);
--font-result-reading: 14px / 20px (Regular);
--font-result-meaning: 16px / 24px (Regular);
--font-detail-kanji: 36px / 44px (Bold);
--font-detail-body: 16px / 24px (Regular);
```

### Spacing System (8pt Grid)

```
4px  = 0.5 unit (Micro spacing)
8px  = 1 unit (Default padding)
12px = 1.5 units (Compact spacing)
16px = 2 units (Standard gap)
24px = 3 units (Section spacing)
32px = 4 units (Large gap)
48px = 6 units (Page padding)
```

### Animation Timings

```css
--anim-instant: 100ms; /* Hover states */
--anim-quick: 200ms; /* Button clicks */
--anim-smooth: 300ms; /* Modal open/close */
--anim-graceful: 500ms; /* Page transitions */

/* Easing */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1); /* Smooth deceleration */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy */
```

---

## 📱 COMPONENT SPECIFICATIONS

## 1. SEARCH ICON (Entry Point)

### Visual Design

**Mobile Top Bar (iOS Style):**

```
┌────────────────────────────────────┐
│ [Logo]    WATASHIWA      [🔍] [☰] │  ← Glass blur (20px)
└────────────────────────────────────┘
                            ↑
                    Search Icon (24x24px)
```

**Desktop Header:**

```
┌───────────────────────────────────────────────────────┐
│ [Logo] WATASHIWA    [Home] [Study] [Stats]    [🔍 Search] [User ▾] │
└───────────────────────────────────────────────────────┘
                                                   ↑
                                    Search Button (with label)
```

**Mobile Bottom Dock (iOS 16 Style):**

```
┌────────────────────────────────────┐
│  [🏠]    [📚]    [🔍]    [👤]     │  ← Glass dock (28px blur, 92% opacity)
│  Home   Study  Search  Profile    │
└────────────────────────────────────┘
              ↑
     Active state = Glowing accent color
```

### States & Interactions

| State | Visual Treatment | Animation |
|-------|------------------|-----------|
| **Default** | Outlined icon, 24x24px, current color | None |
| **Hover** (Desktop) | Background: `rgba(accent, 0.08)`, scale: 1.05 | 100ms ease-out |
| **Active/Pressed** | Background: `rgba(accent, 0.12)`, scale: 0.95 | 100ms ease-out |
| **First-Time (New!)** | Purple glow pulse animation (2s loop) | Glow radius: 0→8px |
| **AI Available** | Small crown badge (8x8px) top-right corner | Fade in 200ms |

### Accessibility

```html
<button 
  aria-label="Search Japanese words, grammar, and vocabulary"
  aria-haspopup="dialog"
  aria-expanded="false"
  role="button"
>
  <SearchIcon />
  <span class="sr-only">Press Cmd+K to open search</span>
</button>
```

**Keyboard Shortcut:**

- Desktop: `Cmd+K` (Mac) / `Ctrl+K` (Windows)
- Mobile: N/A (tap only)

---

## 2. SEARCH MODAL (Main Interface)

### Layout Architecture

**Mobile (Full-Screen Overlay):**

```
┌────────────────────────────────────┐
│ ┌──────────────────────────────┐   │
│ │ [←]  Search    [Recent] [×]  │   │ ← Header (56px height)
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │ [🔍] Search anything...      │   │ ← Input (48px height)
│ └──────────────────────────────┘   │
│ ─────────────────────────────────  │
│                                    │
│ ┌──────────────────────────────┐   │
│ │  Recent Searches              │   │ ← Empty State
│ │  • 先生 (2h ago)               │   │   or
│ │  • 橋 (yesterday)              │   │   Results
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │  Suggested for You            │   │
│ │  • Your leeches (3 words)     │   │
│ │  • Trending words             │   │
│ └──────────────────────────────┘   │
└────────────────────────────────────┘
```

**Desktop (Centered Modal, 600px width):**

```
        [Screen darkened, blur(4px)]
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐  │
│  │ [×] Search WatashiWa          │  │ ← Header
│  ├───────────────────────────────┤  │
│  │ [🔍] Type to search...        │  │ ← Input
│  ├───────────────────────────────┤  │
│  │                               │  │
│  │  Empty State / Results        │  │ ← Content
│  │  (Max height: 70vh, scroll)   │  │
│  │                               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
         ↑
  Glass backdrop: blur(28px), 
  saturate(180%), shadow
```

### Modal Specifications

**Container:**

```css
.search-modal {
  /* Glass morphism */
  background: var(--search-bg-glass);
  backdrop-filter: blur(28px) saturate(180%);
  
  /* Shadows (iOS 16 multi-layer) */
  box-shadow: 
    0 0 0 1px rgba(255, 255, 255, 0.2) inset,  /* Inner glow */
    0 2px 8px rgba(0, 0, 0, 0.04),              /* Soft near shadow */
    0 8px 32px rgba(0, 0, 0, 0.08),             /* Medium shadow */
    0 24px 64px rgba(0, 0, 0, 0.12);            /* Deep shadow */
  
  /* Border */
  border: 1px solid var(--search-border);
  border-radius: 16px; /* Mobile: 0 (full-screen) */
  
  /* Animation */
  animation: modalSlideIn 300ms var(--ease-out-expo);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

**Mobile-Specific:**

```css
@media (max-width: 768px) {
  .search-modal {
    position: fixed;
    inset: 0; /* Full screen */
    border-radius: 0;
    animation: modalSlideUp 300ms var(--ease-out-expo);
  }
  
  @keyframes modalSlideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
}
```

---

## 3. SEARCH INPUT

### Visual Design

```
┌──────────────────────────────────────────────┐
│  [🔍]  Type Japanese, Romaji, English...     │  ← Placeholder
│        ▊                                     │  ← Cursor (blinking)
└──────────────────────────────────────────────┘
     ↑                                    
   Icon (20x20px, secondary color)
```

**Typing State:**

```
┌──────────────────────────────────────────────┐
│  [🔍]  sensei                         [×]    │  ← Clear button appears
└──────────────────────────────────────────────┘
     ↑                                      ↑
  Debouncing (300ms)                   Clear input
```

### Input Specifications

```css
.search-input {
  /* Size */
  height: 48px; /* Mobile */
  height: 56px; /* Desktop */
  padding: 0 16px 0 48px; /* Space for icon */
  
  /* Typography */
  font-size: 18px; /* Mobile */
  font-size: 20px; /* Desktop */
  font-weight: 400;
  color: var(--search-text-primary);
  
  /* Background */
  background: rgba(0, 0, 0, 0.02); /* Subtle inset */
  border: 1px solid var(--search-border);
  border-radius: 12px;
  
  /* Focus state */
  transition: all 200ms ease;
}

.search-input:focus {
  border-color: var(--search-accent);
  box-shadow: 
    0 0 0 3px var(--search-accent-glow),
    0 1px 2px rgba(0, 0, 0, 0.04);
  outline: none;
}
```

### Input Behaviors

| Behavior | Implementation | Timing |
|----------|----------------|--------|
| **Auto-focus** | Focus on modal open (mobile keyboard appears) | Immediate |
| **Debounce** | Wait 300ms after last keystroke before search | 300ms |
| **Clear button** | Show [×] when input has text | Fade in 100ms |
| **Keyboard nav** | Arrow keys to navigate results, Enter to select | Instant |
| **IME support** | Japanese input methods (Hiragana, Katakana) | Native OS |

### Placeholder Text Progression

```javascript
// Rotate through these on empty state
const placeholders = [
  "Search by Japanese, Romaji, English...",
  "Try: sensei, 先生, or teacher",
  "Look up pitch accents, grammar, vocabulary",
  "Ask anything about Japanese!"
];
// Rotate every 3 seconds (subtle animation)
```

---

## 4. SEARCH RESULTS LIST

### Result Card Design

**Standard Result Card (Default State):**

```
┌─────────────────────────────────────────────┐
│  先生                              [Mastered]│  ← Kanji (24px bold)
│  せんせい                           ⤴️ High   │  ← Reading + Pitch
│  Teacher, instructor                        │  ← Meaning (16px)
│  ─────────────────────────────────────────  │  ← Subtle divider
│  Example: 先生は優しいです                   │  ← Preview sentence
└─────────────────────────────────────────────┘
      ↑                                    ↑
   Tap to expand                      Status badge
```

**With Confusion Alert (Homonym Warning):**

```
┌─────────────────────────────────────────────┐
│  ⚠️ 橋 (hashi)                      [Learning]│
│  はし                               ⤵️ Low    │
│  Bridge                                     │
│  ───────────────────────────────────────── │
│  ⚠️ Sounds like 箸 (chopsticks) - Tap to    │  ← Alert banner
│     see difference                          │
└─────────────────────────────────────────────┘
   ↑
Orange/Vermilion gradient border
```

**With AI Features (Samurai Teaser):**

```
┌─────────────────────────────────────────────┐
│  学校                                  [New] │
│  がっこう                            ⤴️⤵️    │
│  School                                     │
│  ─────────────────────────────────────────  │
│  👑 Test Me • 🧠 See Related • 📖 Etymology │  ← AI actions
└─────────────────────────────────────────────┘
      ↑
  Shimmer gradient (if Ronin = locked preview)
```

### Card Specifications

```css
.result-card {
  /* Glass container */
  background: var(--search-bg-glass-strong);
  border: 1px solid var(--search-border);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 8px;
  
  /* Shadow */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  /* Interaction */
  cursor: pointer;
  transition: all 200ms ease;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: var(--search-accent);
}

.result-card:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

/* Status badge */
.status-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  
  /* Variants */
  &.mastered { 
    background: rgba(16, 185, 129, 0.1); 
    color: #059669; 
  }
  &.learning { 
    background: rgba(251, 146, 60, 0.1); 
    color: #EA580C; 
  }
  &.new { 
    background: rgba(79, 70, 229, 0.1); 
    color: #4F46E5; 
  }
}
```

### List Behaviors

**Loading State (Skeleton):**

```
┌─────────────────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓                                   │  ← Shimmer effect
│  ▓▓▓▓▓▓▓                                    │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                       │
└─────────────────────────────────────────────┘
```

**No Results State:**

```
┌─────────────────────────────────────────────┐
│               [🔍]                           │
│                                             │
│      Hmm, we don't have that yet.           │
│                                             │
│      [+ Suggest this word]                  │  ← CTA button
└─────────────────────────────────────────────┘
```

**Virtualization (Performance):**

- Use `react-window` if >20 results
- Render visible items + 5 buffer above/below
- Lazy load images/audio on scroll

---

## 5. WORD DETAIL VIEW

### Layout (Mobile Slide-In)

**Transition Animation:**

```
Results List                Detail View
┌─────────┐      →        ┌─────────┐
│ Result 1│ [Tap]         │ [←] 先生 │  ← Slide from right
│ Result 2│               │         │     (300ms ease-out-expo)
│ Result 3│               │ Content │
└─────────┘               └─────────┘
```

**Full Detail Layout:**

```
┌───────────────────────────────────────────────┐
│ [←]                                    [Share]│  ← Header (56px)
├───────────────────────────────────────────────┤
│                                               │
│              先生   🔊                        │  ← Kanji + Audio
│            せんせい                            │  ← Reading
│     ⤴️━━━━━━━━━━━━━━━━━━                    │  ← Pitch SVG
│                                               │
├───────────────────────────────────────────────┤
│  📖 Meanings                                  │  ← Section header
│  1. Teacher, instructor                       │
│  2. Master (martial arts)                     │
│  3. Doctor (medical professional)             │
│                                               │
├───────────────────────────────────────────────┤
│  💬 Examples                                  │
│  先生は優しいです。                            │
│  → The teacher is kind.                       │
│                                               │
│  先生、質問があります。                         │
│  → Teacher, I have a question.                │
│                                               │
├───────────────────────────────────────────────┤
│  🧬 Etymology (Hán Việt)                      │
│  ┌────────┬────────┐                         │
│  │  先     │  生    │                         │
│  │ Tiên    │ Sinh   │  ← Vietnamese roots    │
│  │ (First) │ (Born) │                         │
│  └────────┴────────┘                         │
│  = "First born" → Elder → Teacher            │
│                                               │
├───────────────────────────────────────────────┤
│  🔗 Related Words You Know                    │
│  • 学生 (student) - Shares 生                 │
│  • 先輩 (senior) - Shares 先                  │
│  [View Knowledge Graph →]                     │
│                                               │
├───────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐ │
│  │  [Add to Deck]                          │ │  ← Primary CTA
│  └─────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────┐ │
│  │  👑 Test Me with AI (Samurai)           │ │  ← Premium CTA
│  └─────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
    ↑
 Scrollable content (max-height: 80vh)
```

### Desktop Detail (Split Panel)

```
┌──────────────────┬────────────────────────────┐
│  Results         │  Detail View               │
│  (40% width)     │  (60% width)               │
│                  │                            │
│  • 先生           │    先生  🔊                │
│  • 先輩           │    せんせい                 │
│  • 学校           │    ⤴️━━━━━━━━━━            │
│                  │                            │
│                  │    📖 Meanings...          │
│                  │                            │
└──────────────────┴────────────────────────────┘
       ↑                        ↑
  Click result          Detail updates instantly
```

### Interactive Elements

**1. Audio Playback Button**

```
┌────────────┐
│ 先生  [▶️]  │  ← Default state (play icon)
└────────────┘

┌────────────┐
│ 先生  [⏸]  │  ← Playing state (pause icon + waveform animation)
└────────────┘
```

```css
.audio-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--search-accent);
  color: white;
  transition: all 200ms ease;
}

.audio-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px var(--search-accent-glow);
}

.audio-button:active {
  transform: scale(0.95);
}

/* Waveform animation */
.audio-waveform {
  display: flex;
  gap: 2px;
  align-items: center;
}

.audio-waveform span {
  width: 3px;
  height: 12px;
  background: var(--search-accent);
  border-radius: 2px;
  animation: wave 1s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { height: 8px; }
  50% { height: 16px; }
}
```

**2. Pitch Accent Visualizer (SVG)**

```svg
<svg viewBox="0 0 200 40" class="pitch-diagram">
  <!-- High pitch segment -->
  <line x1="0" y1="10" x2="80" y2="10" 
        stroke="#4F46E5" 
        stroke-width="3" 
        stroke-linecap="round" />
  
  <!-- Rise transition -->
  <line x1="80" y1="10" x2="100" y2="30" 
        stroke="#4F46E5" 
        stroke-width="3" 
        stroke-dasharray="2,2" />
  
  <!-- Low pitch segment -->
  <line x1="100" y1="30" x2="200" y2="30" 
        stroke="#8C8C8C" 
        stroke-width="3" 
        stroke-linecap="round" />
  
  <!-- Mora labels -->
  <text x="40" y="8" class="mora">せ</text>
  <text x="120" y="28" class="mora">ん</text>
  <text x="160" y="28" class="mora">せい</text>
</svg>
```

**3. Add to Deck Button (Primary CTA)**

```
Default State:
┌────────────────────────────────┐
│     [+] Add to Deck            │  ← Icon + Text
└────────────────────────────────┘

Loading State:
┌────────────────────────────────┐
│     [⟳] Adding...              │  ← Spinner
└────────────────────────────────┘

Success State (Toast):
┌────────────────────────────────┐
│  ✅ Added! Next review tomorrow │  ← Toast notification
└────────────────────────────────┘
   ↓ (Fades out after 3s)
```

```css
.cta-primary {
  width: 100%;
  height: 48px;
  background: var(--search-accent);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
}

.cta-primary:hover {
  background: #4338CA; /* Darker shade */
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--search-accent-glow);
}

.cta-primary:active {
  transform: translateY(0);
}

/* Already in deck state */
.cta-primary.in-deck {
  background: var(--search-success);
  pointer-events: none;
}
```

---

## 6. AI FEATURES UI (Samurai Tier)

### A. AI Quiz Panel

**Quiz Trigger (In Detail View):**

```
┌─────────────────────────────────────────────┐
│  👑 Test Me with AI (Samurai)               │  ← Premium CTA
│  Encode this word into memory instantly      │  ← Value prop
└─────────────────────────────────────────────┘
      ↓ (Tap/Click)
```

**Quiz Panel (Overlay/Modal):**

```
┌───────────────────────────────────────────────┐
│  [×]  AI Quiz: 先生                            │  ← Header
├───────────────────────────────────────────────┤
│                                               │
│  Question 1 of 3                              │  ← Progress
│  ⚫⚫⚪                                         │  ← Dots
│                                               │
│  Which sentence uses 先生 correctly?          │  ← Question
│                                               │
│  ┌───────────────────────────────────────┐   │
│  │ A) 先生は優しいです。                   │   │  ← Option A
│  └───────────────────────────────────────┘   │
│  ┌───────────────────────────────────────┐   │
│  │ B) 先生を食べました。                   │   │  ← Option B
│  └───────────────────────────────────────┘   │
│  ┌───────────────────────────────────────┐   │
│  │ C) 先生が走っています。                 │   │  ← Option C
│  └───────────────────────────────────────┘   │
│                                               │
│  [Skip Question →]                            │  ← Skip option
└───────────────────────────────────────────────┘
```

**Correct Answer Feedback:**

```
┌───────────────────────────────────────────────┐
│  🎉 Nailed it!                                 │  ← Success header
├───────────────────────────────────────────────┤
│                                               │
│  ✅ A) 先生は優しいです。                     │  ← Selected (green)
│                                               │
│  That's correct! "The teacher is kind" uses   │
│  先生 naturally as the subject.                │
│                                               │
│  ┌───────────────────────────────────────┐   │
│  │  [Continue to Question 2 →]           │   │  ← Next CTA
│  └───────────────────────────────────────┘   │
└───────────────────────────────────────────────┘
```

**Quiz Complete (Mnemonic Unlock):**

```
┌───────────────────────────────────────────────┐
│  🎯 Perfect Score: 3/3!                        │
├───────────────────────────────────────────────┤
│                                               │
│  🎁 Mnemonic Unlocked!                        │
│                                               │
│  ┌───────────────────────────────────────┐   │
│  │  👨‍🏫                                     │  ← Visual mnemonic
│  │  先 (Tiên - First) + 生 (Sinh - Born)  │
│  │  = "First born" → The one who teaches │
│  │    others (like an elder)             │
│  └───────────────────────────────────────┘   │
│                                               │
│  This mnemonic is saved to your deck!         │
│                                               │
│  [Done] [Share Mnemonic]                      │
└───────────────────────────────────────────────┘
```

### B. Confusion Alert (Homonym Comparison)

**Alert Banner (In Results):**

```
┌─────────────────────────────────────────────┐
│  ⚠️ Watch out! "hashi" sounds like 2 words  │  ← Orange banner
│     [Tap to see the difference →]           │
└─────────────────────────────────────────────┘
      ↓ (Tap)
```

**Comparison Panel (Side-by-Side):**

```
┌────────────────────────────────────────────────┐
│  [×]  Confusion Alert: hashi                   │
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────────┬──────────────────┐      │
│  │      箸           │       橋         │      │
│  │   Chopsticks     │     Bridge       │      │
│  │   ⤴️ High pitch   │   ⤵️ Low pitch   │      │
│  │                  │                  │      │
│  │   [▶️ Listen]     │   [▶️ Listen]     │      │
│  │                  │                  │      │
│  │   🥢             │   🌉             │      │
│  │   Rises like     │   Drops like     │      │
│  │   picking food   │   crossing down  │      │
│  └──────────────────┴──────────────────┘      │
│                                                │
│  👑 Want to master this?                       │
│  [Try Pitch Drill] (Samurai)                   │
└────────────────────────────────────────────────┘
```

### C. Story Generator

**Trigger (After 3 Searches):**

```
┌─────────────────────────────────────────────┐
│  📚 You searched: 猫, 車, 魚                  │
│                                             │
│  [✨ Create Story with These Words]         │  ← Animated sparkle
└─────────────────────────────────────────────┘
      ↓ (Tap)
```

**Story Generation (Loading):**

```
┌─────────────────────────────────────────────┐
│  🤖 AI is crafting your story...            │
│                                             │
│  [⚙️ Thinking... 2s]                        │  ← Progress
│                                             │
│  Using your words:                          │
│  • 猫 (cat)                                 │
│  • 車 (car)                                 │
│  • 魚 (fish)                                │
└─────────────────────────────────────────────┘
```

**Story Display:**

```
┌─────────────────────────────────────────────┐
│  [×]  Your Story                             │
├─────────────────────────────────────────────┤
│                                             │
│  Theme: Comedy Adventure 🎭                 │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  猫が車を運転して、魚を買いに行った。   │ │  ← Story text
│  │  (A cat drove a car to buy fish.)     │ │
│  │                                       │ │
│  │  Tap words to see definitions ↑      │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [💾 Save to My Stories]  [🔗 Share]        │
└─────────────────────────────────────────────┘
       ↑                           ↑
   Primary CTA              Social sharing
```

**Interactive Word Links:**

```
User taps "猫" in story
     ↓
┌──────────────┐
│ 猫 (neko)    │  ← Tooltip popup
│ Cat, feline  │
│ [Full Detail]│
└──────────────┘
```

---

## 7. RECENT SEARCHES TAB

### Tab Navigation

```
┌────────────────────────────────────┐
│ [Results] [Recent] [Suggested]     │  ← Tab bar (segmented control)
└────────────────────────────────────┘
         Active = Bold + Underline accent
```

### Recent Searches List

```
┌─────────────────────────────────────────────┐
│  Recent Searches                 [Clear All]│  ← Header
├─────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐ │
│  │ 先生               2h ago     [✓ Added]│ │  ← Entry 1
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │ 橋                 5h ago      [ + ]    │ │  ← Entry 2
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │ 学校               Yesterday   [✓]      │ │  ← Entry 3
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌────────────────────────────────────────┐ │
│  │  👑 Quiz All Recent (5 words)          │ │  ← Samurai feature
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Entry States

**Default:**

```css
.recent-entry {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--search-bg-glass);
  border-radius: 8px;
  margin-bottom: 4px;
}

.recent-entry:hover {
  background: rgba(79, 70, 229, 0.04);
  cursor: pointer;
}
```

**Swipe Actions (Mobile):**

```
Swipe Left →
┌────────────────────────────────────────────┐
│ 先生    2h ago    [Delete] [Add to Deck]   │  ← Action buttons reveal
└────────────────────────────────────────────┘
```

---

## 8. KNOWLEDGE GRAPH VISUALIZER

### Mobile View (Simplified List)

```
┌─────────────────────────────────────────────┐
│  🔗 Related Words You Know                   │
├─────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐ │
│  │ 学生 (gakusei)                          │ │
│  │ Student                                │ │
│  │ 🔗 Shares 学 radical                    │ │  ← Connection type
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │ 先輩 (senpai)                           │ │
│  │ Senior, upperclassman                  │ │
│  │ 🔗 Shares 先 radical                    │ │
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │ 中学校 (chuugakkou)                     │ │
│  │ Middle school                          │ │
│  │ 🔗 Often appears together              │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  [View Full Graph →] (Desktop)              │  ← Upsell desktop
└─────────────────────────────────────────────┘
```

### Desktop View (Interactive Graph)

```
┌─────────────────────────────────────────────────────┐
│ [×]  Knowledge Graph: 学校                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│              ┌────────┐                             │
│              │  学生   │  ← Node (you know)         │
│              └────┬───┘                             │
│                   │ Shares 学                       │
│              ┌────┴───┐                             │
│              │  学校   │  ← Center node (current)   │
│              └──┬───┬─┘                             │
│         Shares 校│   │ Often together              │
│          ┌──────┘   └──────┐                       │
│     ┌────┴───┐         ┌───┴────┐                  │
│     │ 高校   │         │中学校   │  ← Nodes (new)   │
│     └────────┘         └────────┘                  │
│                                                     │
│  [⚙️] Layout: Force • Tree • Radial                 │  ← Controls
│  [🔍] Zoom: - | Reset | +                          │
└─────────────────────────────────────────────────────┘
```

**Node Design:**

```css
.graph-node {
  /* Size based on mastery */
  width: 80px; /* Known words */
  width: 100px; /* Current word - larger */
  width: 60px; /* New suggestions - smaller */
  
  /* Colors */
  fill: var(--search-success); /* Mastered */
  fill: var(--search-accent); /* Current */
  fill: var(--search-text-secondary); /* New */
  
  /* Interaction */
  cursor: pointer;
  transition: all 200ms ease;
}

.graph-node:hover {
  transform: scale(1.2);
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

/* Edges (connections) */
.graph-edge {
  stroke: var(--search-border);
  stroke-width: 2px;
  stroke-dasharray: 4, 4; /* Dashed line */
}

.graph-edge.strong {
  stroke-width: 3px;
  stroke-dasharray: none; /* Solid for strong connections */
}
```

---

## 9. RESPONSIVE BREAKPOINTS

### Device-Specific Layouts

| Device | Width | Layout Strategy | Key Differences |
|--------|-------|-----------------|-----------------|
| **Mobile S** | 320-374px | Compact, single column | Smaller fonts, reduced padding |
| **Mobile M** | 375-424px | Standard mobile | Default mobile design |
| **Mobile L** | 425-767px | Spacious mobile | Larger tap targets |
| **Tablet** | 768-1023px | 2-column hybrid | Split detail view starts here |
| **Desktop S** | 1024-1439px | Modal (600px width) | Centered modal with backdrop |
| **Desktop L** | 1440px+ | Modal (720px width) | More whitespace, larger text |

### Layout Adjustments

**Mobile (< 768px):**

```css
.search-modal {
  /* Full screen */
  position: fixed;
  inset: 0;
  border-radius: 0;
}

.result-card {
  /* Larger tap targets */
  min-height: 72px;
  padding: 16px;
}

.detail-view {
  /* Slide-in animation */
  transform: translateX(100%);
  animation: slideIn 300ms forwards;
}
```

**Tablet (768-1023px):**

```css
.search-modal {
  /* Centered, rounded */
  width: 90%;
  max-width: 640px;
  margin: 5vh auto;
  border-radius: 16px;
}

.search-results {
  /* 2-column grid */
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
```

**Desktop (1024px+):**

```css
.search-modal {
  width: 600px; /* Fixed width */
  max-height: 80vh;
}

.search-layout {
  /* Split panel */
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 0;
}

.result-card {
  /* Hover effects enabled */
  &:hover {
    transform: translateY(-2px);
  }
}
```

---

## 🎬 USER FLOW ANIMATIONS

## Flow 1: First-Time Search (Mobile)

**Storyboard:**

```
Frame 1: Home Screen
┌────────────────────────────────────┐
│ [Logo] WATASHIWA      [🔍✨] [☰]  │  ← Glowing search icon
│                                    │
│  Your Study Stats...               │
└────────────────────────────────────┘

Frame 2: Tap Search (0ms)
┌────────────────────────────────────┐
│ [Logo] WATASHIWA      [🔍] [☰]    │
│                                    │  ← Screen dims
└────────────────────────────────────┘
       ↓ Haptic feedback (light)

Frame 3: Modal Slide Up (100ms)
┌────────────────────────────────────┐
│                                    │
│                                    │
│ ╔══════════════════════════════╗  │
│ ║ [←] Search      [Recent] [×] ║  │  ← Slides up from bottom
│ ║ ┌──────────────────────────┐ ║  │
│ ║ │ [🔍] Search anything...  │ ║  │
│ ║ └──────────────────────────┘ ║  │
│ ╚══════════════════════════════╝  │
└────────────────────────────────────┘

Frame 4: Keyboard Appears (200ms)
┌────────────────────────────────────┐
│ ┌──────────────────────────────┐   │
│ │ [🔍] |                       │   │  ← Cursor blinking
│ └──────────────────────────────┘   │
│                                    │
│ Recent Searches...                 │
│                                    │
├────────────────────────────────────┤
│ [ q w e r t y u i o p ]           │  ← iOS keyboard
│ [ a s d f g h j k l ]             │
└────────────────────────────────────┘

Frame 5: User Types "sen" (600ms)
┌────────────────────────────────────┐
│ [🔍] sen[×]                        │
│                                    │
│ [⚙️ Searching...]                  │  ← Debounce indicator
└────────────────────────────────────┘

Frame 6: Results Appear (900ms)
┌────────────────────────────────────┐
│ [🔍] sen[×]                        │
│ ───────────────────────────────── │
│ ┌────────────────────────────────┐│
│ │先生 せんせい          [Mastered]││  ← Fade in (stagger 50ms each)
│ │Teacher              ⤴️         ││
│ └────────────────────────────────┘│
│ ┌────────────────────────────────┐│
│ │先輩 せんぱい          [Learning]││
│ │Senior               ⤵️         ││
│ └────────────────────────────────┘│
└────────────────────────────────────┘

Frame 7: Tap Result (1200ms)
┌────────────────────────────────────┐
│ [←] 先生                    [Share]│  ← Detail slides in from right
│                                    │
│     先生  [▶️]                      │
│   せんせい                          │
│   ⤴️━━━━━━━━━━━━                  │
│                                    │
│ 📖 Meanings...                     │
└────────────────────────────────────┘
```

**Timeline:**

- 0ms: Tap search icon → Haptic feedback
- 100ms: Modal slide-up starts
- 300ms: Modal fully visible → Input auto-focus
- 400ms: iOS keyboard animation
- 600ms: User types "sen"
- 900ms: Results fade in (debounced 300ms)
- 1200ms: User taps result
- 1500ms: Detail view fully loaded

---

## Flow 2: AI Quiz Journey (Desktop)

```
Frame 1: Detail View
┌─────────────────────────────────────┐
│ 先生 🔊                              │
│ せんせい                             │
│ ⤴️━━━━━━━━━━━━━━                   │
│                                     │
│ 📖 Meanings: Teacher...             │
│ ┌─────────────────────────────────┐ │
│ │ [Add to Deck]                   │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 👑 Test Me with AI (Samurai)    │ │  ← Hover state
│ └─────────────────────────────────┘ │  (glow effect)
└─────────────────────────────────────┘
       ↓ Click

Frame 2: Quiz Panel Overlay (200ms)
┌─────────────────────────────────────┐
│ [×] AI Quiz: 先生               1/3 │
│ ⚫⚫⚪                               │
│                                     │
│ Which sentence uses 先生 correctly? │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ A) 先生は優しいです。            │ │  ← Options fade in
│ └─────────────────────────────────┘ │    (stagger 100ms)
│ ┌─────────────────────────────────┐ │
│ │ B) 先生を食べました。            │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ C) 先生が走っています。          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Frame 3: User Selects A (500ms)
┌─────────────────────────────────────┐
│ [×] AI Quiz: 先生               1/3 │
│ ⚫⚫⚪                               │
│                                     │
│ Which sentence uses 先生 correctly? │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ✓ A) 先生は優しいです。          │ │  ← Selected (blue border)
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ B) 先生を食べました。            │ │  ← Dimmed
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ C) 先生が走っています。          │ │  ← Dimmed
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
       ↓ AI validates (500ms)

Frame 4: Correct Feedback (1000ms)
┌─────────────────────────────────────┐
│ 🎉 Nailed it!                   1/3 │  ← Confetti animation
│ ⚫⚫⚪                               │
│                                     │
│ ✅ A) 先生は優しいです。             │  ← Green background
│                                     │
│ That's correct! "The teacher is     │
│ kind" uses 先生 naturally.           │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [Continue to Question 2 →]      │ │  ← Pulse animation
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Frame 5: Question 2 (1500ms)
[Same pattern repeats...]

Frame 6: Quiz Complete (5000ms)
┌─────────────────────────────────────┐
│ 🎯 Perfect Score: 3/3!              │
│ ⚫⚫⚫                               │
│                                     │
│ 🎁 Mnemonic Unlocked!               │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │    👨‍🏫                            │ │  ← Illustration fades in
│ │  先 (Tiên) + 生 (Sinh)           │ │
│ │  = "First born" → Teacher       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Saved to your deck! ✨              │
│                                     │
│ [Done] [Share Mnemonic]             │
└─────────────────────────────────────┘
```

---

## 🎨 VISUAL DESIGN MOCKUPS

## Mockup 1: Mobile Search - Light Mode

```
╔════════════════════════════════════╗
║                                    ║  Blurred background (home screen)
║  ┌──────────────────────────────┐ ║
║  │ Glass Modal (85% opacity)    │ ║
║  ├──────────────────────────────┤ ║
║  │ [←] Search    [Recent] [×]   │ ║  Header: 56px, border-bottom
║  ├──────────────────────────────┤ ║
║  │ [🔍] Type to search...       │ ║  Input: 48px, rounded
║  ├──────────────────────────────┤ ║
║  │                              │ ║
║  │ ┏━━━━━━━━━━━━━━━━━━━━━━━━┓ │ ║
║  │ ┃  先生  せんせい          ┃ │ ║  Result card
║  │ ┃  Teacher       ⤴️ High   ┃ │ ║  (white bg, shadow)
║  │ ┃  Example: 先生は優しい...  ┃ │ ║
║  │ ┗━━━━━━━━━━━━━━━━━━━━━━━━┛ │ ║
║  │                              │ ║
║  │ ┏━━━━━━━━━━━━━━━━━━━━━━━━┓ │ ║
║  │ ┃  先輩  せんぱい          ┃ │ ║
║  │ ┃  Senior        ⤵️ Low    ┃ │ ║
║  │ ┗━━━━━━━━━━━━━━━━━━━━━━━━┛ │ ║
║  │                              │ ║
║  └──────────────────────────────┘ ║
╚════════════════════════════════════╝
```

**Color Specifications:**

- Background blur: `backdrop-filter: blur(28px) saturate(180%)`
- Modal: `rgba(255, 255, 255, 0.85)` with inner glow
- Cards: `rgba(255, 255, 255, 0.92)` with shadow
- Accent: `#4F46E5` (Indigo)
- Text: `#2D2D2D` (Sumi ink)

---

## Mockup 2: Mobile Search - Dark Mode

```
╔════════════════════════════════════╗
║  █████████████████████████████████ ║  Dark background
║  ██                           ████ ║
║  ██ ┌──────────────────────┐  ████ ║
║  ██ │ Glass Modal (Deep    │  ████ ║
║  ██ │ Slate 85% opacity)   │  ████ ║
║  ██ ├──────────────────────┤  ████ ║
║  ██ │ [←] Search    [×]    │  ████ ║  Subtle white border
║  ██ ├──────────────────────┤  ████ ║
║  ██ │ [🔍] Search...       │  ████ ║  Dark input bg
║  ██ ├──────────────────────┤  ████ ║
║  ██ │                      │  ████ ║
║  ██ │ ┏━━━━━━━━━━━━━━━━┓ │  ████ ║
║  ██ │ ┃ 先生 せんせい     ┃ │  ████ ║  Slate card
║  ██ │ ┃ Teacher   ⤴️     ┃ │  ████ ║  (lighter than modal)
║  ██ │ ┗━━━━━━━━━━━━━━━━┛ │  ████ ║
║  ██ │                      │  ████ ║
║  ██ └──────────────────────┘  ████ ║
║  █████████████████████████████████ ║
╚════════════════════════════════════╝
```

**Color Specifications:**

- Background: `#0B1120` (Midnight)
- Modal: `rgba(21, 31, 50, 0.85)` (Deep Slate glass)
- Cards: `rgba(21, 31, 50, 0.92)` with stronger shadow
- Accent: `#63B3ED` (Clear Sky Blue)
- Text: `rgba(255, 255, 255, 0.92)`

---

## Mockup 3: Desktop Detail View (Split Panel)

```
┌───────────────────────────────────────────────────────────────────────┐
│ Screen Background (Dimmed, blur(4px))                                 │
│                                                                       │
│    ┌──────────────────────────────────────────────────────────────┐ │
│    │ [×] Search WatashiWa                                         │ │
│    ├───────────────┬──────────────────────────────────────────────┤ │
│    │ [🔍] sensei   │                                              │ │
│    ├───────────────┼──────────────────────────────────────────────┤ │
│    │ Results       │ Detail View                                  │ │
│    │               │                                              │ │
│    │ ┌───────────┐ │     先生  [▶️]                               │ │
│    │ │ 先生      │ │   せんせい                                    │ │
│    │ │ Teacher   │ │   ⤴️━━━━━━━━━━━━━━━                       │ │
│    │ └───────────┘ │                                              │ │
│    │               │ 📖 Meanings                                  │ │
│    │ ┌───────────┐ │ 1. Teacher, instructor                       │ │
│    │ │ 先輩      │ │ 2. Master (martial arts)                     │ │
│    │ │ Senior    │ │                                              │ │
│    │ └───────────┘ │ 💬 Examples                                  │ │
│    │               │ 先生は優しいです。                             │ │
│    │               │ → The teacher is kind.                       │ │
│    │               │                                              │ │
│    │               │ 🧬 Etymology (Hán Việt)                      │ │
│    │               │ 先 (Tiên - First) + 生 (Sinh - Born)         │ │
│    │               │                                              │ │
│    │               │ 🔗 Related Words You Know                    │ │
│    │               │ • 学生 • 先輩                                 │ │
│    │               │                                              │ │
│    │               │ [Add to Deck]                                │ │
│    │               │ [👑 Test Me with AI]                         │ │
│    └───────────────┴──────────────────────────────────────────────┘ │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

**Layout Specs:**

- Modal width: 900px (results: 340px, detail: 560px)
- Gap: 0 (seamless split)
- Max height: 80vh
- Both panels scroll independently

---

## Mockup 4: Confusion Alert (Mobile)

```
┌────────────────────────────────────┐
│ [←] Confusion Alert: hashi         │
├────────────────────────────────────┤
│                                    │
│  ┏━━━━━━━━━━━━┓ ┏━━━━━━━━━━━━┓   │
│  ┃    箸      ┃ ┃    橋      ┃   │
│  ┃ Chopsticks ┃ ┃  Bridge    ┃   │
│  ┃            ┃ ┃            ┃   │
│  ┃    🥢     ┃ ┃    🌉     ┃   │
│  ┃            ┃ ┃            ┃   │
│  ┃ ⤴️ HIGH    ┃ ┃  ⤵️ LOW    ┃   │
│  ┃ Rises like ┃ ┃ Drops like ┃   │
│  ┃ picking    ┃ ┃ crossing   ┃   │
│  ┃ food up    ┃ ┃ down       ┃   │
│  ┃            ┃ ┃            ┃   │
│  ┃ [▶️ Listen]┃ ┃ [▶️ Listen]┃   │
│  ┗━━━━━━━━━━━━┛ ┗━━━━━━━━━━━━┛   │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ 💡 Memory Trick              │ │
│  │ Chopsticks RISE ⤴️ to mouth  │ │
│  │ Bridge DROPS ⤵️ to cross     │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ 👑 Try Pitch Drill (Samurai) │ │
│  └──────────────────────────────┘ │
└────────────────────────────────────┘
```

**Visual Hierarchy:**

- Cards: Equal width, side-by-side
- Border: Orange gradient (`#EF4444` to `#F59E0B`)
- Icons: Large (48x48px) for emotional impact
- Memory trick: Light yellow background (`rgba(251, 191, 36, 0.1)`)

---

## 🎭 INTERACTION STATES

### Button States (Comprehensive)

**Primary CTA (Add to Deck):**

```css
/* Default */
.btn-primary {
  background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
}

/* Hover */
.btn-primary:hover {
  background: linear-gradient(135deg, #4338CA 0%, #3730A3 100%);
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3);
  transform: translateY(-2px);
}

/* Active/Pressed */
.btn-primary:active {
  background: #3730A3;
  box-shadow: 0 1px 4px rgba(79, 70, 229, 0.2);
  transform: translateY(0);
}

/* Loading */
.btn-primary.loading {
  pointer-events: none;
  opacity: 0.7;
}

.btn-primary.loading::before {
  content: '';
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 600ms linear infinite;
}

/* Success */
.btn-primary.success {
  background: var(--search-success);
  pointer-events: none;
}

.btn-primary.success::before {
  content: '✓ ';
  font-size: 18px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**Samurai CTA (Premium):**

```css
.btn-samurai {
  background: linear-gradient(135deg, 
    rgba(79, 70, 229, 0.1) 0%, 
    rgba(99, 102, 241, 0.15) 100%
  );
  border: 2px solid rgba(79, 70, 229, 0.3);
  color: var(--search-accent);
  position: relative;
  overflow: hidden;
}

/* Shimmer effect */
.btn-samurai::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.3) 50%, 
    transparent 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.btn-samurai:hover {
  background: linear-gradient(135deg, 
    rgba(79, 70, 229, 0.15) 0%, 
    rgba(99, 102, 241, 0.2) 100%
  );
  border-color: var(--search-accent);
}
```

---

## ♿ ACCESSIBILITY SPECIFICATIONS

### Keyboard Navigation

**Search Modal:**

```
Tab Order:
1. [×] Close button
2. [🔍] Search input (auto-focused on open)
3. [Clear] button (if text present)
4. Result card 1
5. Result card 2
6. Result card 3...
N. [See More] button

Keyboard Shortcuts:
- Escape: Close modal
- Enter: Select highlighted result
- Arrow Up/Down: Navigate results
- Cmd+K / Ctrl+K: Open search (global)
- /: Focus search input (global, like Slack)
```

**Detail View:**

```
Tab Order:
1. [←] Back button
2. [▶️] Audio button
3. [Add to Deck] button
4. [Test Me] button (if available)
5. Related word link 1
6. Related word link 2...
```

### Screen Reader Support

**ARIA Labels:**

```html
<!-- Search Icon -->
<button 
  aria-label="Open search to find Japanese words, grammar, and vocabulary"
  aria-haspopup="dialog"
  aria-expanded="false"
>
  <SearchIcon aria-hidden="true" />
</button>

<!-- Search Input -->
<input
  type="search"
  aria-label="Search by Japanese, Romaji, English, or Vietnamese"
  aria-autocomplete="list"
  aria-controls="search-results"
  role="combobox"
/>

<!-- Results List -->
<div 
  id="search-results"
  role="listbox"
  aria-label="Search results"
>
  <div role="option" aria-selected="false">
    <span aria-label="Kanji: Sensei">先生</span>
    <span aria-label="Reading: se-n-se-i">せんせい</span>
    <span aria-label="Meaning: Teacher, instructor">Teacher</span>
    <span aria-label="Pitch accent: High tone">⤴️ High</span>
    <span aria-label="Status: Mastered">Mastered</span>
  </div>
</div>

<!-- Audio Button -->
<button 
  aria-label="Play pronunciation of sensei"
  aria-pressed="false"
>
  <PlayIcon aria-hidden="true" />
</button>

<!-- Confusion Alert -->
<div 
  role="alert"
  aria-live="polite"
>
  ⚠️ Watch out! "hashi" sounds like 2 words. Tap to see the difference.
</div>
```

### Focus Indicators

```css
/* High-contrast focus ring (WCAG AAA) */
*:focus-visible {
  outline: 3px solid var(--search-accent);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Exception for input (has border already) */
input:focus-visible {
  outline: none;
  border-color: var(--search-accent);
  box-shadow: 0 0 0 3px var(--search-accent-glow);
}
```

### Color Contrast Ratios

| Element | Foreground | Background | Ratio | WCAG Level |
|---------|-----------|------------|-------|------------|
| **Body text** | `#2D2D2D` | `#FFFFFF` | 13.5:1 | AAA |
| **Secondary text** | `#8C8C8C` | `#FFFFFF` | 4.6:1 | AA+ |
| **Primary button** | `#FFFFFF` | `#4F46E5` | 8.2:1 | AAA |
| **Link text** | `#4F46E5` | `#FFFFFF` | 8.2:1 | AAA |
| **Dark mode text** | `rgba(255,255,255,0.92)` | `#151F32` | 12.1:1 | AAA |

**Tool:** Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 📐 COMPONENT LIBRARY (Design Tokens)

### Spacing Tokens

```css
:root {
  /* Base unit: 4px */
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

### Border Radius Tokens

```css
:root {
  --radius-sm: 6px;   /* Badges, tags */
  --radius-md: 8px;   /* Cards, inputs (compact) */
  --radius-lg: 12px;  /* Cards, inputs (standard) */
  --radius-xl: 16px;  /* Modals, panels */
  --radius-2xl: 20px; /* Large containers */
  --radius-full: 9999px; /* Pills, avatars */
}
```

### Shadow Tokens

```css
:root {
  /* Light mode */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 24px 64px rgba(0, 0, 0, 0.16);
  
  /* iOS 16 multi-layer */
  --shadow-glass: 
    0 0 0 1px rgba(255, 255, 255, 0.2) inset,
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 24px 64px rgba(0, 0, 0, 0.12);
    
  /* Dark mode (stronger) */
  --shadow-dark-md: 0 2px 8px rgba(0, 0, 0, 0.24);
  --shadow-dark-lg: 0 8px 32px rgba(0, 0, 0, 0.36);
  --shadow-dark-xl: 0 24px 64px rgba(0, 0, 0, 0.48);
}
```

### Transition Tokens

```css
:root {
  /* Durations */
  --duration-instant: 100ms;
  --duration-quick: 200ms;
  --duration-smooth: 300ms;
  --duration-graceful: 500ms;
  
  /* Easings */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 🎯 DESIGN HANDOFF CHECKLIST

### For Engineers

**Assets:**

- [ ] Figma/Sketch file exported (PDF + interactive prototype)
- [ ] All icons exported as SVG (24x24px, 48x48px)
- [ ] Illustrations exported (PNG 2x, 3x for Retina)
- [ ] Lottie animations for loading states (JSON files)
- [ ] Sound effects (optional): search_open.mp3, quiz_correct.mp3, etc.

**Specifications:**

- [ ] This UI/UX spec document (Markdown)
- [ ] Color tokens (CSS variables)
- [ ] Typography scale (rem-based)
- [ ] Spacing system (8pt grid)
- [ ] Component states documented (default, hover, active, disabled, loading, success, error)
- [ ] Animation timings and easings
- [ ] Breakpoint-specific layouts

**Accessibility:**

- [ ] ARIA labels for all interactive elements
- [ ] Keyboard navigation flow documented
- [ ] Screen reader test script
- [ ] Color contrast ratios verified (WCAG AA minimum)
- [ ] Focus indicators designed

**Testing:**

- [ ] User flow storyboards (for E2E tests)
- [ ] Edge cases documented (no results, slow network, API errors)
- [ ] Device matrix (iPhone SE, iPad Pro, MacBook, etc.)
- [ ] Browser matrix (Safari, Chrome, Firefox)

---

## 🚀 IMPLEMENTATION PHASES (Design POV)

### Phase 0: Foundation (Week 1-2)

**Design Deliverables:**

- [ ] Search icon (header, dock variants)
- [ ] Search modal (mobile full-screen, desktop centered)
- [ ] Search input (with clear button, loading state)
- [ ] Result card (3 states: default, hover, active)
- [ ] Word detail view (mobile slide-in, desktop panel)
- [ ] Empty states (no results, recent searches)
- [ ] Loading states (skeleton loaders)

**Visual QA:**

- Test on real devices (iPhone 14, iPad Air, MacBook Pro)
- Verify glass morphism renders correctly (Safari blur support)
- Check dark mode across all components

---

### Phase 1: AI Features (Week 3-4)

**Design Deliverables:**

- [ ] AI Quiz panel (3 question types)
- [ ] Quiz feedback screens (correct, incorrect, complete)
- [ ] Mnemonic unlock card (with illustration)
- [ ] Confusion Alert banner + comparison panel
- [ ] Samurai CTA button (with shimmer effect)
- [ ] Upgrade prompt modal (Ronin → Samurai)
- [ ] Crown badge icon (👑 indicator)

**Visual QA:**

- Test quiz flow with real GPT-4 responses
- Verify emoji and icon rendering across devices
- Check animation performance (60fps target)

---

### Phase 2: Knowledge Graph (Week 5-6)

**Design Deliverables:**

- [ ] Related words list (mobile)
- [ ] Interactive graph (desktop, D3.js)
- [ ] Graph node designs (3 sizes, 3 colors)
- [ ] Graph edge styles (solid, dashed)
- [ ] Zoom controls (-, reset, +)
- [ ] Graph layout presets (force, tree, radial)

**Visual QA:**

- Test graph with 5, 20, 50 nodes (performance)
- Verify graph readability on 13" laptop
- Check responsive scaling

---

### Phase 3: Story Engine (Week 7-8)

**Design Deliverables:**

- [ ] Story trigger button (sparkle animation)
- [ ] Story generation loading screen
- [ ] Story display card (with word links)
- [ ] Interactive word tooltip (tap to define)
- [ ] "My Stories" collection view
- [ ] Story sharing preview (social cards)

**Visual QA:**

- Test with long stories (500+ chars)
- Verify Japanese text wrapping
- Check social share previews (Twitter, Instagram)

---

## 📊 DESIGN METRICS TO TRACK

### Usability Metrics

| Metric | Tool | Target | Current |
|--------|------|--------|---------|
| **Time to First Search** | Mixpanel | <5 seconds | TBD |
| **Search Success Rate** | Analytics | >92% (user finds word) | TBD |
| **Modal Bounce Rate** | Heatmaps | <15% (user closes without action) | TBD |
| **AI Feature Discovery** | Analytics | >35% (see AI quiz) | TBD |
| **Detail View Engagement** | Session replay | >60% scroll depth | TBD |

### Design Quality Metrics

| Metric | Tool | Target | Current |
|--------|------|--------|---------|
| **Lighthouse Accessibility** | Lighthouse | 100/100 | TBD |
| **WCAG Compliance** | axe DevTools | 0 violations | TBD |
| **Keyboard Navigation** | Manual test | 100% functional | TBD |
| **Performance (LCP)** | Web Vitals | <2.5s | TBD |
| **Animation FPS** | Chrome DevTools | 60fps | TBD |

---

## 🎨 FUTURE DESIGN CONCEPTS (Phase 4+)

### Voice Search (Q2 2026)

**Concept:**

```
┌────────────────────────────────────┐
│ [×] Voice Search                   │
├────────────────────────────────────┤
│                                    │
│          [🎤]                      │  ← Pulse animation while listening
│                                    │
│     "Say a Japanese word..."       │
│                                    │
│  ╭───────────────────────────╮    │
│  │ ▁▂▃▅▇▅▃▂▁ Listening...   │    │  ← Waveform animation
│  ╰───────────────────────────╯    │
│                                    │
│  [Stop] [Cancel]                   │
└────────────────────────────────────┘

After speaking:
┌────────────────────────────────────┐
│ You said: "先生" (sensei)          │  ← Transcription
│ Confidence: 94%                    │
│                                    │
│ ⤴️━━━━━━━━━━━━ Your pitch         │  ← User's pitch
│ ⤴️━━━━━━━━━━━━ Native pitch       │  ← Comparison
│                                    │
│ 👍 Great! Your pitch is 94% accurate│
│                                    │
│ [Try Again] [See Word Details]    │
└────────────────────────────────────┘
```

---

### Semantic Search (Q3 2026)

**Concept:**

```
┌────────────────────────────────────┐
│ [🔍] That word about red sky...    │  ← Natural language
├────────────────────────────────────┤
│                                    │
│ 🤖 AI suggests:                    │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ 夕日 (yuuhi)                    │ │
│ │ Sunset, evening sun            │ │
│ │ 🎯 95% match                    │ │  ← Confidence score
│ │ "Red" + "sky" + "evening"      │ │
│ └────────────────────────────────┘ │
│                                    │
│ Other possibilities:               │
│ • 夕焼け (sunset glow) - 78%        │
│ • 赤い空 (red sky) - 65%            │
└────────────────────────────────────┘
```

---

### Browser Extension (Q4 2026)

**Concept:**

```
User right-clicks Japanese text on website
         ↓
┌─────────────────────┐
│ WatashiWa Quick Look│  ← Floating tooltip
├─────────────────────┤
│ 先生 (sensei)       │
│ Teacher ⤴️          │
│                     │
│ [Add to Deck]       │
│ [Full Search]       │
│ [Hear Audio]        │
└─────────────────────┘
```

---

## ✅ FINAL DESIGN CHECKLIST

### Before Handoff to Engineering

**Visual Design:**

- [ ] All screens designed in Figma/Sketch (50+ screens)
- [ ] Light mode + Dark mode variants
- [ ] Mobile, Tablet, Desktop breakpoints
- [ ] All interaction states (hover, active, focus, disabled, loading, success, error)
- [ ] Empty states + Error states
- [ ] Edge cases (long text, no results, slow network)

**Design System:**

- [ ] Color tokens documented (20+ colors)
- [ ] Typography scale (8 sizes)
- [ ] Spacing system (8pt grid, 10 tokens)
- [ ] Border radius tokens (6 variants)
- [ ] Shadow tokens (iOS 16 multi-layer)
- [ ] Animation tokens (durations + easings)

**Accessibility:**

- [ ] ARIA labels written for all interactive elements
- [ ] Keyboard navigation flow mapped
- [ ] Screen reader experience designed
- [ ] Color contrast ratios verified (WCAG AA minimum)
- [ ] Focus indicators designed (3px outline)
- [ ] Text resizing tested (up to 200%)

**Documentation:**

- [ ] This UI/UX spec document (60+ pages)
- [ ] User flow diagrams (5 key flows)
- [ ] Animation timelines (frame-by-frame)
- [ ] Component specifications (CSS-ready)
- [ ] Design tokens (CSS variables)
- [ ] Accessibility guidelines

**Assets:**

- [ ] Icons exported (SVG, 24x24px and 48x48px)
- [ ] Illustrations exported (PNG 2x, 3x)
- [ ] Lottie animations (loading, success, error)
- [ ] Sound effects (optional, MP3)
- [ ] Social share images (og:image, 1200x630px)

**QA:**

- [ ] Design review with stakeholders
- [ ] Usability test with 5 users (mobile + desktop)
- [ ] Accessibility audit (screen reader test)
- [ ] Cross-browser preview (Safari, Chrome, Firefox)
- [ ] Device testing (iPhone, iPad, Android, Mac, Windows)

---

## 📞 DESIGN SUPPORT

**Design Lead:** [Your Name]  
**Slack Channel:** #search-feature-design  
**Figma File:** [Link to Figma]  
**Zeplin/Inspect:** [Link to Zeplin]  

**Office Hours:**  

- Monday/Wednesday 2-4 PM: Design Q&A
- Thursday 10 AM: Weekly design sync

**Feedback Process:**

1. Engineers post screenshots in #search-feature-design
2. Designer reviews within 24h
3. Iterations tracked in Figma with version numbers

---

**Document Version:** 1.0  
**Last Updated:** January 13, 2026  
**Next Review:** After Phase 0 user testing  

---

*"Design is not just what it looks like and feels like. Design is how it works."* — Steve Jobs

Let's build a search experience that feels magical. ✨
