# Study Experience: UX & Marketing Optimization

> **Status**: Living Document
> **Target Audience**: Product Design, Marketing, Engineering
> **Core Philosophy**: "Zen Mastery" — Invisible Interface, Maximum Focus.

---

## 1. Core Value Proposition (The "Why")

Why should a user choose WatashiWa over Anki or Quizlet?

### A. The "Zen Flow" State

Most flashcard apps are cluttered. We provide a **distraction-free sanctuary** for learning.

- **Immersive Mode**: UI chrome (headers/menus) auto-hides when focusing.
- **Bottom-Heavy Design**: All critical interactions happen in the "Thumb Zone" (bottom 30% of screen), preventing hand fatigue on mobile.
- **Optimistic Latency**: Interacting with a card feels _instant_. We load the next card immediately while syncing data in the background.

### B. Hán Việt Specialization (The "Secret Weapon")

For Vietnamese learners, Kanji is not just a symbol — it's a bridge to their native language.

- **Hán Việt First**: We prioritize Sino-Vietnamese readings (e.g., 学生 -> HỌC SINH) which creates instant semantic connection.
- **Kanji Breakdown**: We don't just show the character; we deconstruct it into radicals and components, explaining the "logic" behind the strokes.

### C. Scientific Efficiency (FSRS-5)

We don't just use "SRS"; we use the **Free Spaced Repetition Scheduler (FSRS) v5**, the gold standard in memory science.

- **Smart Queue**: The app knows exactly _when_ you're about to forget.
- **Burden Management**: We cap daily reviews to prevent burnout/overwhelm.

---

## 2. User Experience Deconstruction

### The "Golden Path" (Happy Path)

1. **Entry**: One tap from Dashboard -> "Study Now".
2. **Engagement**:
   - Card appears. Audio auto-plays (configurable).
   - **Thumb Zone Action**: Large, premium "Show Answer" button at the bottom.
   - **Micro-interaction**: Button has a soft colored shadow and lift effect.
3. **Reveal**:
   - Card smoothly expands/reveals answer.
   - Hán Việt badge is prominent.
4. **Rating**:
   - **Color Coded**: Ratings are visually distinct but harmonious.
   - **Visual Hierarchy**: The "Good" (3) button is solid/filled, guiding users to the ideal behavior.
5. **Completion**:
   - **Confetti**: Visual reward for finishing a session.
   - **Stats**: Immediate breakdown of "Reviews" vs "New Words".

### Key UX Decisions

| Feature                  | Implementation Details                            | User Benefit                                                 |
| :----------------------- | :------------------------------------------------ | :----------------------------------------------------------- |
| **Thumb Zone Controls**  | Fixed bottom container with gradient fade-out.    | **Ergonomics**: No reaching for top corners on large phones. |
| **Immersive Header**     | Hides on scroll down; shows on scroll up.         | **Focus**: Maximizes screen real estate for content.         |
| **Keyboard Shortcuts**   | `Space` (Show/Good), `1-4` (Rate), `R/E` (Audio). | **Speed**: Desktop power users can blitz through reviews.    |
| **Flashcard Typography** | Google Fonts Noto Sans JP (64px+).                | **Legibility**: Kanji is complex; we make it huge and clear. |

---

## 3. Marketing Angles & Copywriting

Use these hooks in landing pages, social media, and app store descriptions.

### Angle A: "The Anti-Burnout App"

_Headline_: **Master Japanese without the headache.**
_Sub_: "Stop fighting clunky apps. WatashiWa's Zen Mode gets out of your way so you can just learn."

### Angle B: "Unlock Your Native Advantage"

_Headline_: **Don't learn Kanji like a Westerner.**
_Sub_: "You already know 70% of Japanese vocabulary. Use our Hán Việt engine to unlock the rest instantly."

### Angle C: "Science, not Magic"

_Headline_: **Memory Engineering, Built-in.**
_Sub_: "Powered by the FSRS-5 algorithm. We predict the exact moment you'll forget, so you study less and remember more."

---

## 4. Future Optimization Opportunities

### Engagement (Gamification)

- [ ] **Streak Flame**: Animate the flame icon in the header when a review extends the streak.
- [ ] **Combo Counter**: Show a subtle "x10 Good!" popup if user hits "Good" repeatedly.

### Social

- [ ] **Shareable Card**: "I just learned '猫' (Neko)!" button on the card back to generate a stylish image for Instagram Stories.

### Polish

- [ ] **3D Flip**: Currently a reveal; could implement a true 3D flip animation for more tactile feel (like the Landing Page hero).
- [ ] **Haptics**: Add subtle vibration on rating buttons (e.g., Heavy click for "Hard", Light click for "Easy").

---

## 5. Technical Context for Marketers

- **Render Strategy**: Client-Side optimized (Interactive parts) with Server-Side fallback.
- **Performance**: Pre-fetching next 3 cards ensures zero loading headers between reviews.
- **Offline Capable**: (Planned) PWA caching allows studying in the subway.
