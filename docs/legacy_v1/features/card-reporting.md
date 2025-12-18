# Card Reporting & Corrections

## Overview

Allow users to report incorrect or problematic card content. Moderators review reports and apply corrections. Contributors who submit valid corrections earn points.

## Report Types

| Type                   | Description                  | Example                   |
| :--------------------- | :--------------------------- | :------------------------ |
| **Incorrect Reading**  | Wrong kana reading           | 学生: ごくせい → がくせい |
| **Incorrect Meaning**  | Wrong translation/definition | 先生: Doctor → Teacher    |
| **Incorrect Hán Việt** | Wrong Sino-Vietnamese        | 学生: HỌC SINH → correct  |
| **Typo**               | Spelling/formatting error    | Sudent → Student          |
| **Missing Audio**      | Audio file not working       | -                         |
| **Wrong Example**      | Example sentence is wrong    | -                         |
| **Duplicate**          | Card exists elsewhere        | -                         |
| **Other**              | Any other issue              | -                         |

---

## User Flow

### 1. Report Submission

```text
User viewing card → Clicks "🚩 Report" → Modal opens

┌─────────────────────────────────────────┐
│  🚩 Report Issue with "学生"            │
├─────────────────────────────────────────┤
│  Issue Type: [Incorrect Reading ▼]      │
│                                         │
│  Current Value:                         │
│  ┌───────────────────────────────────┐  │
│  │ ごくせい                          │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Suggested Correction:                  │
│  ┌───────────────────────────────────┐  │
│  │ がくせい                          │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Additional Notes (optional):           │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│        [Cancel]  [Submit Report]        │
└─────────────────────────────────────────┘
```

### 2. Moderator Review

```text
Admin Panel → Reports Queue

┌─────────────────────────────────────────────────────────────┐
│  📋 Pending Reports (12)                     [Filter ▼]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🚩 Incorrect Reading                    2 hours ago │   │
│  │ Card: 学生 (Unit 15)                                │   │
│  │ Reporter: @tanaka_san                               │   │
│  │                                                     │   │
│  │ Current: ごくせい                                   │   │
│  │ Suggested: がくせい                                 │   │
│  │                                                     │   │
│  │ [✓ Accept & Fix]  [✗ Reject]  [💬 Reply]           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Resolution

- **Accept**: Card is updated, reporter earns points
- **Reject**: Report is closed with reason
- **Duplicate**: Linked to existing report

---

## Database Schema

```prisma
model CardReport {
  id          String   @id @default(uuid())

  // What is being reported
  vocabId     String?  @map("vocab_id")
  vocab       Vocab?   @relation(fields: [vocabId], references: [id], onDelete: Cascade)

  kanjiId     String?  @map("kanji_id")
  kanji       Kanji?   @relation(fields: [kanjiId], references: [id], onDelete: Cascade)

  // Who reported
  reporterId  String   @map("reporter_id")
  reporter    User     @relation("ReportedBy", fields: [reporterId], references: [id], onDelete: Cascade)

  // Report details
  type        ReportType
  field       String?  // Which field is incorrect (e.g., "readingKana", "meaning")
  currentValue String? @map("current_value")
  suggestedValue String? @map("suggested_value")
  notes       String?

  // Resolution
  status      ReportStatus @default(PENDING)
  resolvedById String?  @map("resolved_by_id")
  resolvedBy  User?    @relation("ResolvedBy", fields: [resolvedById], references: [id])
  resolution  String?  // Reason for reject, or confirmation message
  resolvedAt  DateTime? @map("resolved_at")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([status])
  @@index([vocabId])
  @@index([kanjiId])
  @@index([reporterId])
}

enum ReportType {
  INCORRECT_READING
  INCORRECT_MEANING
  INCORRECT_HAN_VIET
  TYPO
  MISSING_AUDIO
  WRONG_EXAMPLE
  DUPLICATE
  OTHER
}

enum ReportStatus {
  PENDING
  ACCEPTED
  REJECTED
  DUPLICATE
}
```

---

## API Endpoints

| Method | Endpoint                   | Description                     |
| :----- | :------------------------- | :------------------------------ |
| POST   | `/api/reports`             | Submit a new report             |
| GET    | `/api/reports`             | Get reports (mod only)          |
| GET    | `/api/reports/my`          | Get user's own reports          |
| PATCH  | `/api/reports/:id/resolve` | Accept/Reject report (mod only) |

### Submit Report Request

```json
{
	"vocabId": "uuid-here",
	"type": "INCORRECT_READING",
	"field": "readingKana",
	"currentValue": "ごくせい",
	"suggestedValue": "がくせい",
	"notes": "Common mistake, verified with dictionary"
}
```

---

## Integration with Ranking

When a report is **accepted**:

1. Card is updated with correction
2. Reporter earns **+5 contribution points**
3. Reporter earns **"Helpful Contributor"** badge (after 5 accepted reports)

---

## Report Button Placement

### On VocabCard (Answer State)

```text
┌─────────────────────────────────────────┐
│  学生                                   │
│  がくせい                               │
│  Student                                │
│  ...                                    │
├─────────────────────────────────────────┤
│  [Again] [Hard] [Good] [Easy]           │
│                                         │
│  [🔖 Save] [💬 Comment] [🚩 Report]      │
└─────────────────────────────────────────┘
```

### On Deck Detail Page (Card List)

```text
┌────────────────────────────────────────────────┐
│  学生 | がくせい | Student       [...] [🚩]    │
│  先生 | せんせい | Teacher       [...] [🚩]    │
└────────────────────────────────────────────────┘
```

---

## Notifications

| Event            | Notify                      |
| :--------------- | :-------------------------- |
| Report submitted | Moderators (in admin panel) |
| Report accepted  | Reporter (email optional)   |
| Report rejected  | Reporter with reason        |

---

## Anti-Abuse Measures

1. **Rate Limit**: Max 10 reports per user per day
2. **Reputation**: Users with many rejected reports get flagged
3. **Duplicate Detection**: Warn if similar report exists
4. **Auto-Close**: Reports older than 30 days auto-close
