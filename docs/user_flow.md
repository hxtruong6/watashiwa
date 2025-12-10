# User Flow & Behaviors

## 1. Site Architecture (Sitemap)

The application architecture is designed for "Cognitive Load Reduction".

### A. Dashboard (Home) `/`

* **Goal:** Instant status check ("Do I have reviews?") & immediate entry to study.
* **Primary Action:** "Start Review Session" (Primary Button).
  * *Condition:* `Due Cards > 0`.
  * *Label:* "Start Review ([Count])".
* **Secondary Info:**
  * Quick Stats (Streak, Total Reviewed today).
  * Next Golden Time (if 0 reviews due).

### B. Study Mode (The Dojo) `/study`

* **Goal:** Distraction-free deep work.
* **Behavior:**
  * **Immersive:** Hides global navigation and sidebar.
  * **Focus:** Center screen attention.
  * **Exit:** "Exit Session" button (returns to Dashboard).

### C. Deck / Library `/decks`

* **Goal:** Content management & Discovery.
* **Features:**
  * Search (Kanji/Kana/Meaning).
  * Toggle Activation (Freeze/Unfreeze cards).
  * Detail View (See full metadata: Etymology, Examples, Stats).

---

## 2. The "Golden Time" SRS Loop

This is the critical path where 90% of user time is spent.

### Step 1: The Trigger

* **Context:** User is on Dashboard.
* **Action:** Click **"Start Review"**.
* **Transition:** Smooth fade out of Dashboard -> Fade in of Study Interface.

### Step 2: The Challenge (Front of Card)

* **State:** Question.
* **Visuals:**
  * **Hero:** Target Kanji displayed centrally (Size: `64px+`).
  * **Audio:** Autoplay (optional config).
  * **Hidden:** Meaning, Readings, Hán Việt.
* **Input:**
  * **Recall Cards:** User thinks of meaning, presses `SPACE` or clicks "Show Answer".
  * **Input Cards:** User types reading/meaning -> Presses `ENTER`.

### Step 3: The Revelation (Back of Card)

* **State:** Answer.
* **Visuals:**
  * Reveal **Reading (Kana)** and **Meaning**.
  * Reveal **Hán Việt** (Etymology bridge).
  * Reveal **Example Sentence**.
* **Feedback (Input Cards):**
  * **Correct:** Pulse Green (`#708238`).
  * **Incorrect:** Shake/Border Red (`#E64A19`). Provide comparison diff.

### Step 4: The Rating (FSRS Feedback)

* **Context:** User self-grades their recall quality.
* **Controls:** 4 Buttons (mapped to keyboard shortcuts).
    1. **Again (1):** Failed. Setup for immediate re-learning (< 5 min).
    2. **Hard (2):** Correct but hesitated.
    3. **Good (3):** Correct with acceptable effort. (Default).
    4. **Easy (4):** Instant, trivial recall.
* **Action:**
  * User selects rating.
  * **Animation:** Card slides away (e.g., to the left). New card slides in.
  * **System:** Updates DB via `ts-fsrs`.

### Step 5: Session Complete

* **Condition:** Review Queue == 0.
* **UI:** "Session Complete" summary screen.
* **Stats:** "14 Cards Reviewed. F1 Score: 92%."
* **CTA:** "Return to Dashboard".

---

## 3. Interaction Details

### Keyboard Shortcuts

Power users rely on muscle memory.

* `SPACE`: Show Answer.
* `1`, `2`, `3`, `4`: Rating (Again, Hard, Good, Easy).
* `Ctrl + Z`: Undo last review (safety net).
* `R`: Replay Audio.

### Error Prevention

* **WanaKana Auto-convert:** If a user types "gakusei" on a Kana field, auto-convert to "がくせい" to prevent false negatives due to IME issues.
