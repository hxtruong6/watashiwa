# Vocabulary & Kanji Browser

## Overview

A powerful interface to explore, filter, and sort all vocabulary and kanji in the user's study collection. Enables quick reference and progress tracking.

## Core Features

### 1. View Modes

- **Grid View**: Card thumbnails (good for visual scanning)
- **List View**: Detailed rows (good for reading)
- **Table View**: Spreadsheet-like (good for bulk review)

### 2. Filter by Memorization Status

Based on FSRS `state` field:

| Status         | FSRS State | Description           | Color  |
| :------------- | :--------- | :-------------------- | :----- |
| **New**        | 0          | Never studied         | Gray   |
| **Learning**   | 1          | Currently learning    | Blue   |
| **Reviewing**  | 2          | In long-term review   | Green  |
| **Relearning** | 3          | Forgotten, relearning | Orange |

**Additional Filters:**

- **Mastered**: Stability > 30 days (custom threshold)
- **Struggling**: Lapses > 3
- **Due Today**: `due <= now()`

### 3. Sorting Options

| Option             | Description                           |
| :----------------- | :------------------------------------ |
| Alphabetical (A-Z) | By `wordSurface`                      |
| Alphabetical (Z-A) | Reverse                               |
| Due Date (Soonest) | Cards due soon first                  |
| Due Date (Latest)  | Cards due later first                 |
| Difficulty         | By `difficulty` field (hardest first) |
| Last Reviewed      | Most recently reviewed first          |
| Lapses             | Most forgotten cards first            |

### 4. Search

- Search by: Kanji, Kana, Meaning, Hán Việt
- Fuzzy match support

## Page Route

`/browse` or `/library`

## User Interface

### Desktop Layout

```
┌───────────────────────────────────────────────────────────────┐
│  📖 My Library                               [🔍 Search...]   │
├───────────────────────────────────────────────────────────────┤
│  Filters:                                                     │
│  [Status: All ▼] [Type: Vocab ▼] [Deck: All ▼]               │
│  [Due: Any ▼]                                                 │
│                                                               │
│  Sort: [Due Date ▼]  View: [≡ List] [▦ Grid] [▤ Table]       │
├───────────────────────────────────────────────────────────────┤
│  Showing 234 of 1,250 items                                   │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 🟢 学生 | がくせい | Student | Due: Today     [→ View] │  │
│  │ 🟢 先生 | せんせい | Teacher | Due: Tomorrow  [→ View] │  │
│  │ 🔵 新しい | あたらしい | New | Due: --        [→ View] │  │
│  │ 🟠 難しい | むずかしい | Difficult | Lapse: 4 [→ View] │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  [← Prev] Page 1 of 25 [Next →]                               │
└───────────────────────────────────────────────────────────────┘
```

### Mobile Layout

- Filters collapse into a bottom sheet
- Single column list
- Swipe actions: Bookmark, Study Now

## Status Color Legend

| Color     | Meaning                        |
| :-------- | :----------------------------- |
| 🔘 Gray   | New (never studied)            |
| 🔵 Blue   | Learning                       |
| 🟢 Green  | Reviewing (stable)             |
| 🟠 Orange | Relearning (lapsed)            |
| ⭐ Gold   | Mastered (stability > 30 days) |

## API Endpoints

| Method | Endpoint      | Description                 |
| :----- | :------------ | :-------------------------- |
| GET    | `/api/browse` | Paginated list with filters |

**Query Parameters:**

- `type`: `vocab`, `kanji`, or `all`
- `status`: `new`, `learning`, `reviewing`, `relearning`, `mastered`
- `deck`: Deck ID
- `search`: Search query
- `sort`: `alpha`, `due`, `difficulty`, `lapses`
- `order`: `asc`, `desc`
- `page`, `limit`: Pagination

## Technical Considerations

- Server-side pagination (limit 50 per page)
- Debounced search (300ms)
- URL state sync (shareable filter URLs)
