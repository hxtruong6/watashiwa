# Push Notification Scenarios

> **Purpose**: Define the trigger logic, content strategy, and technical requirements for each push notification type to ensure high engagement without spamming users.

---

## 1. Streak Rescue 🚑 (High Priority)

**Goal**: Prevent users from losing their hard-earned progress.

- **Trigger**:
  - **Schedule**: Daily at **20:00 (8 PM)** user's local time.
  - **Condition**: User has `streak > 0` AND `today_reviews == 0` AND `today_new_cards == 0`.
- **Content**:
  - **Title**: "⚠️ Streak Danger!"
  - **Body**: "You're about to lose your {N}-day streak. Do 1 review to save it!"
  - **Icon**: `alarm.png` (or dynamic fire icon)
  - **Action**: Opens `/study`
- **Technical Note**:
  - Needs `timezone` stored in User settings (default to UTC if missing, or use browser estimate).
  - Idempotency: Ensure sent only once per day.

---

## 2. Review Load Alert 📚 (Medium Priority)

**Goal**: Nudge users when reviews pile up, preventing "Review Hell".

- **Trigger**:
  - **Schedule**: Daily at **Morning (e.g., 09:00)** or Periodic Check.
  - **Condition**: `due_cards > 20` (Configurable threshold).
- **Content**:
  - **Title**: "{N} cards are waiting..."
  - **Body**: "Clear your review queue now to keep your memory sharp."
  - **Icon**: `books.png`
- **Cool Down**: Max 1 per 3 days to avoid nagging.

---

## 3. Community Engagement 💬 (Real-time)

**Goal**: Foster community interaction and returning users.

- **Trigger**:
  - **Event**: Another user replies to the current user's comment or card note.
- **Content**:
  - **Title**: "New Reply"
  - **Body**: "{User} replied to your note on {Kanji/Word}."
  - **Action**: Opens `/decks/{id}?comment={id}`
- **Grouping**: Collapse multiple replies into "5 new replies".

---

## 4. "We Miss You" / Retention 👋 (Low Priority)

**Goal**: Re-engage dormant users.

- **Trigger**:
  - **Schedule**: Weekly Cron.
  - **Condition**: Last activity > 3 days ago & < 7 days ago.
- **Content**:
  - **Title**: "Where have you been?"
  - **Body**: "Your deck misses you. Come back and learn 5 new words today."
  - **Icon**: `waving_hand.png`
- **Cool Down**: Once per inactivity period (don't spam weekly).

---

## 5. System / Feature Announcements 🚀

**Goal**: Inform users of major updates (e.g., "New Minna no Nihongo Course").

- **Trigger**:
  - **Manual**: Admin triggers via dashboard.
- **Content**:
  - **Title**: "New Course Added!"
  - **Body**: "Minna no Nihongo II is now available. Check it out."
  - **Action**: Opens `/dashboard/courses`

---

## Technical Implementation Plan

### Cron Architecture (Vercel Cron)

1. **Route**: `/api/cron/process-notifications` (Secured by `CRON_SECRET`).
2. **Logic**:
   - Fetch active `PushSubscriptions`.
   - Join with `User` data (timezone, stats).
   - Evaluate conditions for each scenario.
   - Send in batches.
   - Log results.

### User Preferences

Users should be able to toggle categories in Settings:

- [x] Streak Reminders
- [x] Review Alerts
- [x] Community Updates
