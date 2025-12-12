# Wishlist (Card Bookmarks)

## Overview

Allow users to bookmark vocabulary or kanji cards for quick access and focused review.

## Use Cases

1. **"Learn Later"**: User encounters an interesting word but isn't ready to study it.
2. **Focused Review**: User wants to create a personal subset of difficult cards.
3. **Exam Prep**: User collects cards for a specific test.

## Core Features

### 1. Add to Wishlist

- One-click bookmark from any card view
- Toggle button (Add/Remove)

### 2. Wishlist Page `/wishlist`

- View all bookmarked cards
- Filter by: Vocab, Kanji, All
- Sort by: Date Added, Alphabetical, Due Date
- Bulk actions: Remove, Start Review

### 3. Quick Study Mode

- "Study Wishlist" button starts a review session with only wishlisted cards

## Database Schema

```prisma
model Wishlist {
  id        String   @id @default(uuid())
  
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Polymorphic: either vocab or kanji
  vocabId   String?  @map("vocab_id")
  vocab     Vocab?   @relation(fields: [vocabId], references: [id], onDelete: Cascade)
  
  kanjiId   String?  @map("kanji_id")
  kanji     Kanji?   @relation(fields: [kanjiId], references: [id], onDelete: Cascade)
  
  note      String?  // Optional user note
  
  createdAt DateTime @default(now()) @map("created_at")
  
  @@unique([userId, vocabId])
  @@unique([userId, kanjiId])
  @@index([userId])
}
```

## User Interface

### Bookmark Button (on Card)

```
┌─────────────────────────────────┐
│  学生                            │
│  ...                            │
│              [🔖 Save] [▶ Study]│
└─────────────────────────────────┘
```

- Empty bookmark icon = Not saved
- Filled bookmark icon = Saved

### Wishlist Page

```
┌─────────────────────────────────────────┐
│  📚 My Wishlist (47 items)              │
│  [Filter: All ▼] [Sort: Newest ▼]       │
│  [▶ Study All]                          │
├─────────────────────────────────────────┤
│  ☑ 学生 (がくせい) - Student    [🗑]     │
│  ☑ 先生 (せんせい) - Teacher    [🗑]     │
│  ☑ 日 (Kanji) - Day/Sun         [🗑]     │
│  ...                                    │
├─────────────────────────────────────────┤
│  [Remove Selected]                      │
└─────────────────────────────────────────┘
```

## API Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/api/wishlist` | Get user's wishlist |
| POST | `/api/wishlist` | Add item to wishlist |
| DELETE | `/api/wishlist/:id` | Remove item |
| POST | `/api/wishlist/study` | Start study session for wishlist |

## Integration Points

- **VocabCard Component**: Add bookmark toggle
- **Dashboard**: Show "Wishlist" count in sidebar
- **Study Mode**: Support "source=wishlist" parameter
