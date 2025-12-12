# Community Comments & Contributions

## Overview

Allow users to contribute knowledge, tips, and mnemonics to vocabulary/kanji cards. Other users can vote on the quality of contributions.

## Scenarios & User Flows

### 1. Distraction-Free Study Help

**Scenario**: A user is studying and keeps forgetting a specific word. They want a quick mnemonic without leaving the study flow.
**Flow**:

1. User encounters a difficult card in Study Mode.
2. User taps the **Community Icon** (located below the Close/Exit button on the right).
3. A **Drawer** slides up from the bottom (mobile) or side (desktop) containing top-voted mnemonics and tips.
4. User reads a helpful mnemonic ("Ah, that makes sense!").
5. User upvotes the tip.
6. User closes the drawer and continues studying immediately.

### 2. Deck Exploration & Contribution

**Scenario**: A user is browsing a deck to preview words. They know a great trick for one of them.
**Flow**:

1. User is on the Deck Detail page (Grid View).
2. User hovers over a card (Desktop) or sees an icon (Mobile).
3. User clicks the **Comment Icon**.
4. The Comment Drawer opens.
5. User clicks "Add Comment".
6. User selects type "Mnemonic", types the trick, and submits.
7. The comment is immediately visible.

### 3. Dashboard Discovery

**Scenario**: User wants to learn something new or see what's active in the community.
**Flow**:

1. User visits the Dashboard.
2. User sees a **"Trending Tips"** section showing card with highly upvoted recent comments.
3. User clicks a tip to see the full word context (opens a modal or navigates to deck).

### 4. Reviewing Impact

**Scenario**: User wants to see if their contributions are helping others.
**Flow**:

1. User visits Dashboard.
2. User sees **"My Contributions"** or **"Community Stats"** (e.g., "Your tips helped 50 people today").

## Core Features

(Same as before: Card Comments, Voting, Moderation, Comment Types)

## Database Schema (Prisma)

```prisma
model CardComment {
  id        String   @id @default(uuid())
  
  // Polymorphic: attach to Vocab OR Kanji
  vocabId   String?  @map("vocab_id")
  vocab     Vocab?   @relation(fields: [vocabId], references: [id], onDelete: Cascade)
  kanjiId   String?  @map("kanji_id")
  kanji     Kanji?   @relation(fields: [kanjiId], references: [id], onDelete: Cascade)
  
  authorId  String   @map("author_id")
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  content   String
  type      CommentType @default(GENERAL)
  
  // Votes cache (optional, but good for sorting)
  upvotes   Int      @default(0)
  downvotes Int      @default(0)
  score     Int      @default(0)
  
  isPinned  Boolean  @default(false) @map("is_pinned")
  isHidden  Boolean  @default(false) @map("is_hidden")
  
  votes     CommentVote[]
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@index([vocabId])
  @@index([kanjiId])
  @@index([authorId])
  @@index([score]) // For trending queries
}

enum CommentType {
  MNEMONIC
  USAGE_TIP
  CULTURAL_NOTE
  EXAMPLE
  GRAMMAR
  GENERAL
}

model CommentVote {
  id        String  @id @default(uuid())
  
  commentId String  @map("comment_id")
  comment   CardComment @relation(fields: [commentId], references: [id], onDelete: Cascade)
  
  userId    String  @map("user_id")
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  value     Int     // +1 or -1
  
  @@unique([commentId, userId])
  @@index([commentId])
}
```

## UI Implementation Details

### Study Page

- **Location**: `src/components/StudyContent.tsx`
- **Trigger**: New Button with `TeamOutlined` or `CommentOutlined` icon. Positioned `top: 70px, right: 16px` (below Close button).
- **Component**: Reusable `CommentDrawer`.

### Deck Page

- **Location**: `src/app/decks/[id]/DeckView.tsx`
- **Trigger**:
  - **Grid View**: Add overlay icon on `Card` hover.
  - **List View**: Add "Comments" column or action button.

### Dashboard

- **Location**: `src/components/DashboardContent.tsx`
- **New Section**: `TrendingTips` component.
