# Feature: Matcha Wisdom Widget (Zen Mode)

> **Goal**: Provide a "Zen" moment in the dashboard by displaying ambient vocabulary from the user's learning queue, floating over a relaxing matcha tea animation.

---

## 1. Overview

The **Matcha Wisdom Widget** (technically `MatchaWisdomWidget.tsx`) is a dashboard component designed for **ambient learning**. Instead of active drilling, it presents vocabulary in a passive, aesthetically pleasing manner.

It solves the problem of "dashboard fatigue" by offering a visual break while still reinforcing content.

### Key Value Props

- **Visual Delight**: Uses a Lottie animation (Matcha Tea) and floating elements to create a calm atmosphere.
- **Ambient Review**: Exposure to "Leech" (difficult) items without the pressure of grading.
- **Discoverability**: Previews "New" items to prime the user's brain before they actually study them.

---

## 2. Technical Architecture

### Component Hierarchy

- **`MatchaWisdomWidget`** (Client Component)
  - Uses `framer-motion` for complex orchestration of floating "pills".
  - Uses `DotLottieReact` for the tea cup background.
  - Fetches data via Server Action on mount.

### Data Flow

1. **Mount**: Widget mounts and calls `getMatchaWisdomWords(limit: 5)` (Server Action).
2. **Fetch**: Server Action queries Postgres (Prisma) for:
   - **Leeches**: `relearning` state or high `lapse` count (Priority 1).
   - **Active Learning**: `learning` state (Priority 2).
   - **New**: `new` state (Priority 3).
3. **Display**: Data is returned as `WisdomWordData` and mapped to `AnimatedWordData` with randomized animation parameters (`duration`, `delay`, `y-offset`).

### File Locations

| Component         | Path                                                         |
| :---------------- | :----------------------------------------------------------- |
| **Widget**        | `src/components/dashboard/MatchaWisdomWidget.tsx`            |
| **Server Action** | `src/services/dashboard-actions.ts` (`getMatchaWisdomWords`) |
| **Animation**     | `public/assets/animations/MatchaTea.lottie`                  |
| **Translations**  | `messages/*.json` (Keys: `Dashboard.matchaWisdom`)           |

---

## 3. Data Strategy ("The Algorithm")

The widget doesn't just show random words. It attempts to show _relevant_ words using a waterfall strategy:

1. **Anti-Frustration (Leeches)**:
   - _Condition_: `state = 3` (Relearning) OR `lapses > 2`.
   - _Why_: Repeated exposure in a low-stress environment helps cement difficult items.
2. **Active Engagement (Learning)**:
   - _Condition_: `state = 1` (Learning).
   - _Why_: Keeps current study material fresh in mind.
3. **Priming (New)**:
   - _Condition_: `state = 0` (New).
   - _Why_: "Priming" effect—seeing a word before formally studying it increases retention during the first lesson.
4. **Fallback (Zen Defaults)**:
   - If no user data exists (new user), it falls back to a static list of beautiful Japanese words (e.g., _Komorebi_, _Tsundoku_) to maintain the aesthetic.

---

## 4. UI & Animation Details

### "Zen" Animation

- **Floating Effect**: Words move left-to-right (`translateX`) with a slow, bobbing Y-axis motion (`translateY`).
- **Layering (Z-Index)**:
  - `Lottie` (Cup): Bottom layer.
  - `Words`: Middle layer (visually appearing "above" the steam).
  - `Selected Word`: Top layer (z-index 20) + Backdrop Blur.
- **Performance**: Uses GPU-accelerated transforms (`x`, `y` instead of `left`, `top`) via `framer-motion` to ensure 60fps even on mobile.
- **Responsiveness**: constrained to the top 20-50% of the container to visually align with the "steam" area of the illustration.

### Interaction Design

- **Default State**: Shows **Kanji** (Large) + **Reading** (Small). Meaning is HIDDEN.
- **Click/Tap**:
  - Pauses the word.
  - Expands to reveal **Meaning** and **Han Viet**.
  - Plays audio (Web Speech API).
- **Accessibility**:
  - `aria-hidden` on decorative Lottie.
  - `role="button"` and `tabIndex` on words.
  - Keyboard support (`Enter` / `Space` to reveal).

---

## 5. Future Improvements

- [ ] **Real TTS**: Replace Web Speech API with Azure/Google Cloud TTS for higher quality audio.
- [ ] **Theme Variants**: Different Lottie animations for different times of day (e.g., Moon/Stars at night).
- [ ] **Direct Action**: "Add to Review Queue" button directly from the popup.
