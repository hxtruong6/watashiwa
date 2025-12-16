# Technical Specification

> **Primary Reference**: See [AI Context](./ai_context.md) for tech stack overview.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                      Client (React)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Components  │  │   Hooks     │  │  State (Zustand)│  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ Server Actions / API Routes
┌────────────────────────▼────────────────────────────────┐
│                   Next.js Server                         │
│  ┌─────────────────┐  ┌─────────────────────────────┐   │
│  │ Server Actions  │  │ API Routes (streaming/AI)   │   │
│  │ src/services/   │  │ src/app/api/                │   │
│  └────────┬────────┘  └──────────────┬──────────────┘   │
└───────────┼──────────────────────────┼──────────────────┘
            │ Prisma                   │ OpenAI SDK
┌───────────▼──────────────────────────▼──────────────────┐
│           PostgreSQL          │       OpenAI API        │
└─────────────────────────────────────────────────────────┘
```

---

## Data Models

**Source of truth**: [`prisma/schema.prisma`](../prisma/schema.prisma)

### Key Models

| Model | Purpose |
|-------|---------|
| `Course` | Learning path container |
| `Deck` | Collection of vocab/kanji |
| `Vocab` | Vocabulary item with Hán Việt |
| `Kanji` | Individual kanji with readings |
| `StudyCard` | Per-user SRS progress (FSRS fields) |

### FSRS Fields (StudyCard)

```typescript
{
  state: 0 | 1 | 2 | 3,     // New, Learning, Review, Relearning
  due: DateTime,
  stability: Float,
  difficulty: Float,
  reps: Int,
  lapses: Int,
  lastReview: DateTime?
}
```

---

## API Patterns

### Server Actions (Preferred)

Located in `src/services/actions.ts`:

```typescript
'use server';

export async function submitReview(
  cardId: string,
  rating: 1 | 2 | 3 | 4
): Promise<{ success: boolean; error?: string; nextDue?: Date }> {
  try {
    // FSRS calculation + DB update
    return { success: true, nextDue };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### API Routes (Streaming/External)

For AI features requiring streaming responses:

```text
POST /api/chat/grammar-check  → Streaming response
POST /api/generate/sentence   → AI-generated content
```

---

## External Services

| Service | Purpose | SDK |
|---------|---------|-----|
| Gemini | Sentence generation, grammar check | `openai` |
| PostHog | Analytics | `posthog-js` |
| Sentry | Error tracking | `@sentry/nextjs` |

---

## Related Docs

- [SRS Architecture](./srs_architecture.md) — FSRS state machine
- [AI Integration](./ai_integration.md) — OpenAI prompts and usage
