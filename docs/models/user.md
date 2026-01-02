# User

**Generated:** 2025-12-29
**Part of:** [Data Models Documentation](./index.md)
**Source:** `prisma/schema.prisma`

---

**Purpose:** User accounts and preferences

**Key Fields:**

- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `name` (String, Optional)
- `role` (UserRole: USER | MODERATOR | ADMIN)
- `authProviders` (JSONB) - OAuth provider tracking
- `primaryAuthProvider` (String) - Primary auth method

**Study Preferences:**

- `limitNewCards` (Int, Default: 10)
- `limitReviews` (Int, Default: 50)
- `dailyGoal` (Int, Default: 20)
- `enableSmartPacing` (Boolean, Default: true)
- `autoPlayAudio` (Boolean, Default: true)
- `showPitchAccent` (Boolean, Default: true)
- `showEtymology` (Boolean, Default: true)
- `enablePriming` (Boolean, Default: true)

**Gamification:**

- `currentStreak` (Int, Default: 0)
- `longestStreak` (Int, Default: 0)
- `lastStudyDate` (Date) - For efficient streak calculation

**Localization:**

- `timezone` (String, Default: "UTC")
- `language` (String, Default: "en") - "en" | "vi" | "ja"

**Flexible Preferences:**

- `preferences` (JSONB) - Tutorials, haptic, fsrsParams, etc.

**Relations:**

- `userReviews` → UserReview[]
- `reviewLogs` → ReviewLog[]
- `decks` → Deck[]
- `pushSubscriptions` → PushSubscription[]
- `dailyStudyStats` → DailyStudyStat[]

---

---

## Related Documentation

- [Data Models Index](./index.md) - All data models
- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions
