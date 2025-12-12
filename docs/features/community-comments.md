# Community Comments & Contributions

## Overview

Allow users to contribute knowledge, tips, and mnemonics to vocabulary/kanji cards. Other users can vote on the quality of contributions.

## Core Features

### 1. Card Comments

Users can add comments to any Vocab or Kanji card.

**Comment Types:**

- **Mnemonic**: Memory trick to remember the word
- **Usage Tip**: Grammar or context advice
- **Cultural Note**: Cultural background information
- **General**: Default category

### 2. Voting System

- **Upvote** (+1): Comment is helpful
- **Downvote** (-1): Comment is not helpful or incorrect
- **Score**: `upvotes - downvotes`
- Comments sorted by score (highest first)

### 3. Moderation

Moderators/Admins can:

- **Hide**: Comment becomes invisible to users (soft delete)
- **Delete**: Permanently remove comment
- **Pin**: Highlight an exceptional comment at the top

## Database Schema

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
  
  isPinned  Boolean  @default(false) @map("is_pinned")
  isHidden  Boolean  @default(false) @map("is_hidden")
  
  votes     CommentVote[]
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@index([vocabId])
  @@index([kanjiId])
  @@index([authorId])
}

enum CommentType {
  MNEMONIC
  USAGE_TIP
  CULTURAL_NOTE
  GENERAL
}

model CommentVote {
  id        String  @id @default(uuid())
  
  commentId String  @map("comment_id")
  comment   CardComment @relation(fields: [commentId], references: [id], onDelete: Cascade)
  
  userId    String  @map("user_id")
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  value     Int     // +1 or -1
  
  @@unique([commentId, userId]) // One vote per user per comment
  @@index([commentId])
}
```

## User Interface

### Card Detail View

```
┌─────────────────────────────────────┐
│  学生 (がくせい) - Student           │
│  ...card content...                 │
├─────────────────────────────────────┤
│  💡 Community Tips (12)             │
│  ┌───────────────────────────────┐  │
│  │ 🧠 Mnemonic by @user123       │  │
│  │ "学 (study) + 生 (life) =     │  │
│  │  someone living to study!"    │  │
│  │ ▲ 24  ▼ 2   💬 Reply          │  │
│  └───────────────────────────────┘  │
│  [+ Add Comment]                    │
└─────────────────────────────────────┘
```

### Comment Submission Modal

- **Type Selector**: Dropdown (Mnemonic, Usage Tip, etc.)
- **Content**: Textarea with character limit (500)
- **Preview**: Live markdown preview
- **Submit**: Disabled until valid

## API Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/api/vocab/:id/comments` | Get comments for a vocab |
| POST | `/api/vocab/:id/comments` | Create new comment |
| PATCH | `/api/comments/:id` | Edit own comment |
| DELETE | `/api/comments/:id` | Delete comment (own or mod) |
| POST | `/api/comments/:id/vote` | Vote on comment |
| PATCH | `/api/comments/:id/hide` | Moderator: hide comment |
| PATCH | `/api/comments/:id/pin` | Moderator: pin comment |

## Gamification (Future)

- **Contributor Badge**: Users with 10+ upvoted comments
- **Top Contributor**: Leaderboard for most helpful users
