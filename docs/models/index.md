# Data Models Documentation

**Generated:** 2025-12-29  
**Source of Truth:** `prisma/schema.prisma`  
**Database:** PostgreSQL with JSONB support

---

## Overview

WatashiWa uses a **Hybrid SQL Architecture** combining relational tables for integrity with JSONB fields for flexible content storage. The schema supports the "Smart CUBE" method with dynamic card variants, interference shielding, and active priming.

See [Overview](./overview.md) for detailed architecture explanation.

---

## Core Models

- **[User](./user.md)** - User accounts and preferences
- **[Vocabulary](./vocabulary.md)** - Core vocabulary content (The Anchor)
- **[CardVariant](./cardvariant.md)** - Dynamic card views (The Face)
- **[UserReview](./userreview.md)** - SRS algorithm state (The Memory)
- **[ReviewLog](./reviewlog.md)** - Review history and analytics
- **[ConfusionPair](./confusionpair.md)** - Interference shield (The Block)
- **[Story](./story.md)** - Active priming (The Context)
- **[StoryLog](./storylog.md)** - Story reading progress
- **[Deck](./deck.md)** - Content organization
- **[Course](./course.md)** - Learning paths
- **[CourseDeck](./coursedeck.md)** - Course-Deck junction table
- **[DailyStudyStat](./dailystudystat.md)** - Daily aggregation
- **[StudySession](./studysession.md)** - Session persistence
- **[CardComment](./cardcomment.md)** - Community comments
- **[CommentVote](./commentvote.md)** - Comment voting
- **[CardReport](./cardreport.md)** - Content reporting
- **[PushSubscription](./pushsubscription.md)** - Push notification subscriptions

---

## Reference

- **[Enums](./enums.md)** - All enum types
- **[JSONB Schema Contracts](./jsonb-schemas.md)** - Zod schemas for JSONB fields
- **[Database Design Decisions](./design-decisions.md)** - Design patterns and strategies

---

## Related Documentation

- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions using these models
- [Development Guide](../development-guide.md) - Database setup

