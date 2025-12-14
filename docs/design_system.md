# UI/UX Design System: "Zen Mastery"

## 1. Core Philosophy: Focus & Flow

The application is a tool for deep learning. The interface must be "invisible" until needed.

- **Principle 1: Cognitive Load Reduction.** Minimalism. No decorative noise. Be minimalistic, elegant, and creative.
- **Principle 2: Motivating Feedback.** Tangible progress (sounds, smooth fills).
- **Principle 3: Mobile First.** Design for the smallest screen first. Touch targets > 44px. Critical actions in "Thumb Zone".

## 2. Theme Configuration (Ant Design Tokens)

We use Ant Design v5's Token System. Configure these in `themeConfig.ts`.

### Brand Colors

| Token | Value | Name | Usage |
| :--- | :--- | :--- | :--- |
| `colorPrimary` | `#1E3A5F` | **Indigo (Ai-iro)** | Primary Actions, Active States, Headers. |
| `colorSuccess` | `#708238` | **Matcha (Uguisu-iro)** | Correct Answers, Progress Bars, "Good" rating. |
| `colorError` | `#E64A19` | **Vermilion (Shuiro)** | Wrong Answers, "Again" rating, Destructive actions. |
| `colorWarning` | `#FAAD14` | **Goldenrod** | "Hard" rating. |
| `colorInfo` | `#1E3A5F` | **Indigo** | Informational tags. |

- Add these variables to one place to easily change colors, configuration theme or dark mode.

### Backgrounds & Surfaces

| Token | Value | Name | Usage |
| :--- | :--- | :--- | :--- |
| `colorBgBase` | `#F9F7F2` | **Washi (Paper)** | Global background. Warmer and easier on eyes than `#FFFFFF`. |
| `colorBgContainer` | `#FFFFFF` | **White** | Cards and Modals. |
| `colorBgLayout` | `#F0F2F5` | **Mist** | Sidebar or secondary areas (if needed). |

### Typography

- **Font Family:** `'Inter', 'Noto Sans JP', sans-serif`.
- **Base Size:** `16px`.

**Hierarchy:**

- **Hero Kanji:** `64px` (Flashcard Center). Weight: `500`.
- **Page Title:** `24px` (Dashboard Headers). Weight: `600`.
- **Body:** `16px` (Standard text).
- **Meta/Sub:** `14px` (Secondary info). Color: `textSecondary`.

### Spacing & Shape

- **`borderRadius`**: `8px` (Modern, soft).
- **`paddingLG`**: `32px` (Generous breathing room for content).

## 3. Component Patterns

### The `VocabCard`

- **Container:** AntD `Card` with custom shadow: `box-shadow: 0 4px 12px rgba(0,0,0,0.08)`.
- **Layout:**
  - **Question Mode:** Centered Kanji.
  - **Answer Mode:** Split view. Top: Kanji. Bottom: Meta (Hán Việt, Kana, Sentence).
- **Animation:** Use `framer-motion` for flip or slide transitions.

### The `RatingBar`

- Located at the bottom of the active view.
- **Buttons:**
  - **Again (1):** Bordered Red.
  - **Hard (2):** Bordered Orange.
  - **Good (3):** Filled Green (Solid). **Dominant UI element.**
  - **Easy (4):** Bordered Blue/Indigo.
- **Mobile:** Sticky footer.
- **Desktop:** Floating action bar below the card.

## 4. Feedback & Micro-interactions

- **Hover:** Interactive elements scale `1.02` on hover.
- **Tap:** Active elements scale `0.98` on click.
- **Transitions:** All UI changes (showing answer, changing cards) should be > `200ms` and ease-out. No harsh cuts.
