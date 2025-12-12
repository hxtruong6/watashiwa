# User Ranking & Leaderboards

## Overview

Competitive leaderboards to motivate users through friendly competition. Rankings are **fair** by grouping users into specific deck collections (e.g., N5, N4) and time periods.

## Design Principles

1. **Fairness**: Users only compete within the same deck collection
2. **Accessibility**: New users can compete immediately in their level
3. **Time-bound**: Rankings reset periodically to give everyone a chance
4. **Multiple Dimensions**: Study performance + Community contribution

---

## Ranking Types

### 1. Study Rankings (By Deck Collection)

Users are ranked by **cards learned** within a specific deck collection.

| Ranking Name | Decks Included | Description |
|:-------------|:---------------|:------------|
| **N5 Leaderboard** | Units 1-25 | Beginner level vocabulary |
| **N4 Leaderboard** | Units 26-50 | Elementary level vocabulary |
| **N3 Leaderboard** | Units 51-75 | Intermediate level |
| **N2 Leaderboard** | Units 76-100 | Upper intermediate |
| **N1 Leaderboard** | Units 101+ | Advanced level |

**Scoring Method:**

- +1 point per card reviewed
- +3 points for new card learned (first time Good/Easy)
- +5 points for card reaching "Mastered" status (stability > 30 days)

### 2. Contribution Rankings

Users ranked by their contributions to the community.

| Metric | Points |
|:-------|:-------|
| Comment posted | +1 |
| Comment upvoted | +2 per upvote |
| Comment pinned by moderator | +10 |
| Card correction accepted | +5 |
| Card report verified | +2 |

### 3. Time Periods

| Period | Reset | Purpose |
|:-------|:------|:--------|
| **Daily** | Every midnight (user timezone) | Quick wins, daily motivation |
| **Weekly** | Every Monday | Short-term goals |
| **Monthly** | 1st of each month | Medium-term achievement |
| **All-Time** | Never | Hall of fame |

---

## Database Schema

```prisma
// Deck Collection for fair ranking grouping
model DeckCollection {
  id          String @id @default(uuid())
  name        String // "N5", "N4", etc.
  description String?
  decks       Deck[]
  rankings    LeaderboardEntry[]
  
  createdAt   DateTime @default(now()) @map("created_at")
}

// Leaderboard Entry
model LeaderboardEntry {
  id              String   @id @default(uuid())
  
  userId          String   @map("user_id")
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  collectionId    String   @map("collection_id")
  collection      DeckCollection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  
  period          LeaderboardPeriod
  periodStart     DateTime @map("period_start") // Start of the ranking period
  
  // Scores
  studyPoints     Int      @default(0) @map("study_points")
  contributionPoints Int   @default(0) @map("contribution_points")
  totalPoints     Int      @default(0) @map("total_points")
  
  // Stats for display
  cardsReviewed   Int      @default(0) @map("cards_reviewed")
  cardsLearned    Int      @default(0) @map("cards_learned")
  cardsMastered   Int      @default(0) @map("cards_mastered")
  
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  @@unique([userId, collectionId, period, periodStart])
  @@index([collectionId, period, periodStart, totalPoints])
}

enum LeaderboardPeriod {
  DAILY
  WEEKLY
  MONTHLY
  ALL_TIME
}
```

---

## User Interface

### Leaderboard Page `/leaderboard`

```text
┌─────────────────────────────────────────────────────────────┐
│  🏆 Leaderboards                                            │
├─────────────────────────────────────────────────────────────┤
│  Collection: [N5 ▼]    Period: [Weekly ▼]    Type: [Study ▼]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🥇 1. @tanaka_san        1,250 pts   (324 cards)          │
│  🥈 2. @sakura_jp         1,180 pts   (298 cards)          │
│  🥉 3. @learning_ninja      945 pts   (256 cards)          │
│     4. @vocab_master        892 pts   (234 cards)          │
│     5. @nihongo_lover       756 pts   (198 cards)          │
│     ...                                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│  📍 Your Rank: #12        456 pts   (120 cards)            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard Widget

```text
┌─────────────────────────────┐
│  🏆 Your Rankings           │
│                             │
│  N5 Weekly: #12 (↑3)        │
│  N5 Monthly: #45            │
│  Contribution: #8 (↑2)      │
│                             │
│  [View All Rankings →]      │
└─────────────────────────────┘
```

---

## API Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/api/leaderboard` | Get rankings with filters |
| GET | `/api/leaderboard/me` | Get current user's rankings |

**Query Parameters:**

- `collection`: Collection ID (required)
- `period`: `daily`, `weekly`, `monthly`, `all_time`
- `type`: `study`, `contribution`, `total`
- `limit`: Number of entries (default 50)

---

## Point Calculation Logic

### On Review Submit

```typescript
// Pseudo-code
async function onReviewSubmit(userId, cardId, rating, newState) {
  const deck = await getDeckForCard(cardId);
  const collection = await getCollectionForDeck(deck.id);
  
  let points = 1; // Base review point
  
  if (newState === 'Learning' && previousState === 'New') {
    points += 3; // New card learned
  }
  
  if (stability > 30 && previousStability <= 30) {
    points += 5; // Card mastered
  }
  
  await updateLeaderboard(userId, collection.id, points);
}
```

### Cron Job for Period Reset

- Daily: Run at 00:00 UTC, create new period entries
- Weekly: Run Monday 00:00 UTC
- Monthly: Run 1st of month 00:00 UTC

---

## Gamification Badges

| Badge | Criteria |
|:------|:---------|
| 🥇 **Gold Champion** | #1 in any leaderboard for a week |
| 🥈 **Silver Star** | Top 3 in any leaderboard |
| 🥉 **Bronze Climber** | Top 10 in any leaderboard |
| 🔥 **Hot Streak** | Top 10 for 3 consecutive weeks |
| 🌟 **Top Contributor** | #1 in Contribution leaderboard |

---

## Privacy Considerations

- Users can opt-out of public leaderboards
- Display name can be different from email
- Option to show as "Anonymous User"
