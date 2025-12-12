# Feature Specification

## 1. Golden Time SRS Logic (FSRS v4+)

We use **FSRS (Free Spaced Repetition Scheduler)** via the `ts-fsrs` library. FSRS is a modern algorithm that adapts better to individual memory patterns than traditional SM-2.

### Library: `ts-fsrs`

- **Repo:** [https://github.com/open-spaced-repetition/ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)
- **Goal:** Minimize review load while maintaining high retention (target 90%).

### Usage Logic

```typescript
import { fsrs, generatorParameters, Rating } from 'ts-fsrs';

// Initialize Scheduler (Singleton)
const params = generatorParameters({ enable_fuzz: true });
const f = fsrs(params);

// 1. Calculate Next Review (on User Action)
// Input: Current Card, Rating (Again/Hard/Good/Easy)
const schedulingCards = f.repeat(card, new Date());

// Output: schedulingCards[Rating.Good].card -> New Card State
// Save updated 'card' to Database
```

### Rating Scale

- **1 (Again):** Forgot completely. Resets stability.
- **2 (Hard):** Correct but hesitated.
- **3 (Good):** Correct with little effort.
- **4 (Easy):** Perfect instant recall.

### Logic Test Data (Golden Data)

Use these scenarios to verify the scheduler is working correctly (approximate values as fuzzing adds randomness).

| Scenario     | Input (State)           | Rating      | Expected Outcome                                      |
| :----------- | :---------------------- | :---------- | :---------------------------------------------------- |
| **New Card** | New (State: 0)          | `Good` (3)  | Status: Learning, Due: ~10min/1day (depends on steps) |
| **Learning** | Learning (State: 1)     | `Good` (3)  | Status: Review, interval increases                    |
| **Review**   | Review, Stability: 5.0  | `Good` (3)  | Stability Increases (~7-10), Due: +Days               |
| **Lapse**    | Review, Stability: 20.0 | `Again` (1) | Stability Decreases sharply, Due: <1 day (Relearning) |

## 2. Exercise Modes

Interactions must be active.

### Type A: Listen & Write

- **Stimulus:** Audio auto-play.
- **Hidden:** All text fields.
- **Action:** User types reading (Kana) or uses Speech-to-Text.
- **Validation:** Exact match on `reading_kana`.

### Type B: Meaning Recall (Hán Việt Focus)

- **Stimulus:** Word Surface (Kanji) + Hán Việt.
- **Hidden:** Meaning, Reading by default.
- **Action:** Multiple Choice (1 Correct, 3 Distractors from similar SRS stage cards) OR Self-Grade (User reveals answer and selects "I knew it" or "I didn't").
- **Constraint:** For MVP, Self-Grade is safer and easier to implement than generating high-quality distractors.

### Type C: Cloze / Context

- **Stimulus:** `example_sentence` with target word masked (e.g. `_____`).
- **Hint:** Meaning of the sentence.
- **Action:** Type the conjugated form of the word.
- **Validation:** String match or simple AI check if rigorous.

## 3. Public Landing Page & i18n

### Landing Page

- **Route:** `/` (Root).
- **Protection:** Public access. Authenticated users redirected to `/dashboard`.
- **Key Elements:**
  - Hero Section: "Master Japanese with Golden Time SRS".
  - Features: FSRS explanation, Exercise types.
  - Footer: Links.

### i18n (Internationalization)

- **Strategy:** Cookie-based detection (No URL prefixes like `/en/...` or `/vi/...`).
- **Default:** English (`en`).
- **Supported:** English, Vietnamese (`vi`).
- **Switcher:** Dropdown in Navbar/Footer.

## 4. CSV Content Import

### Data Architecture

We do **not** need a separate "Import Table" in the database.

- **Process:** Client-Side Parse -> Validation -> Batch Insert to `Vocab` table.
- **Relations:**
  - `Vocab` belongs to a `Deck`.
  - `Vocab` has no study data initially.
  - `StudyCard` is created *lazily* or *on-demand* when a user first studies the deck.

### CSV Template Format

The system expects a header row. Columns:

| Column Name | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `term` | **Yes** | The word or expression | `学生` |
| `reading` | **Yes** | Kana reading | `がくせい` |
| `meaning` | **Yes** | Definition | `Student` |
| `example_sentence` | No | Full sentence context | `私は学生です。` |
| `example_translation` | No | Translation of sentence | `I am a student.` |
| `han_viet` | No | Sino-Vietnamese (for VN users) | `HỌC SINH` |

### Validation Rules

1. **Required Fields:** `term`, `reading`, `meaning` must not be empty.
2. **Duplication:** Warn if `term` already exists in the selected Deck.
3. **Format:** Warn if `reading` contains Kanji (should be Kana only for typical cards).

### UI Workflow

1. **Select/Drop File:** Support `.csv`.
2. **Parse & Preview:** specialized Data Grid component.
    - Show valid rows in normal text.
    - **Highlight errors** in Red.
    - Allow user to **edit cell data** directly in the grid to fix errors before importing.
    - "Ignore" checkbox for each row.
3. **Import:** Progress bar as items are sent to API.

## 5. Additional Features

Detailed specifications for the following features are in separate documents:

| Feature | Description | Spec |
|:--------|:------------|:-----|
| User Roles | Admin, Moderator, User permissions | [user-roles.md](features/user-roles.md) |
| Community Comments | Card comments, voting, moderation | [community-comments.md](features/community-comments.md) |
| Wishlist | Bookmark cards for later | [wishlist.md](features/wishlist.md) |
| Vocab Browser | Filter/sort by memorization status | [vocab-browser.md](features/vocab-browser.md) |
| Enhanced Dashboard | Gamification, streaks, UX | [enhanced-dashboard.md](features/enhanced-dashboard.md) |
| User Ranking | Leaderboards by deck collection & time | [user-ranking.md](features/user-ranking.md) |
| Card Reporting | Report incorrect content, corrections | [card-reporting.md](features/card-reporting.md) |
