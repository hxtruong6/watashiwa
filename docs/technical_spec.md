# Technical Specification

> **Primary Reference**: See [AI Context](./ai_context.md) for tech stack overview.

---

## Architecture: The 3-Tier "Smart CUBE"

```text
┌─────────────────────────────────────────────────────────┐
│              Presentation Layer (The Stage)             │
│  • Dumb Rendering (Components)                          │
│  • Zen UI (Animations, Pitch Visualizer, Haptics)       │
│  • Next.js App Router (Server Components + Client Isls) │
└────────────────────────┬────────────────────────────────┘
                         │ API / Server Actions
┌────────────────────────▼────────────────────────────────┐
│              Smart Layer (The Orchestrator)             │
│  • Decisions: What Variant? When to Intervene?          │
│  • Pacing: Throttles new cards based on retention.      │
│  • Services: `SessionService`, `InterventionService`    │
└───────────┬──────────────────────────┬──────────────────┘
            │ Prisma (Hybrid SQL)      │ Redis (Optional)
┌───────────▼──────────────────────────▼──────────────────┐
│             Persistence Layer (The Vault)               │
│  • Postgres: User Data, Vocab, Reviews                  │
│  • JSONB: Dynamic Content Payloads (Stories, Variants)  │
└─────────────────────────────────────────────────────────┘
```

---

## Data Models (Hybrid SQL)

**Source of truth**: [`prisma/schema.prisma`](../prisma/schema.prisma)

We use a **Hybrid SQL** approach: Relational for integrity, JSONB for content flexibility.

### Key Models

| Model           | Purpose                   | V2 Features                                  |
| --------------- | ------------------------- | -------------------------------------------- |
| `Vocabulary`    | The Anchor (Static Truth) | `tags`, `han_viet`, `homonym_group_id`       |
| `CardVariant`   | The Face (Dynamic View)   | `variantType`, `contentPayload` (JSON)       |
| `UserReview`    | The Memory (FSRS State)   | `srsStage`, `nextReviewAt`, `personalAnchor` |
| `StudySession`  | The Queue (Persistence)   | Resumable sessions, prevents skipping        |
| `ConfusionPair` | The Shield (Interference) | Links confusing pairs (Hashi vs Hashi)       |
| `Story`         | The Context (Priming)     | "Active Priming" mini-stories                |

### FSRS State (UserReview)

```typescript
{
  srsStage: 0 | 1 | 2 | 3, // New, Learning, Review, Relearning
  nextReviewAt: DateTime,
  stability: Float,    // Memory strength (days to forget)
  difficulty: Float,   // Intrinsic difficulty
  reps: Int,           // Total reviews
  lapses: Int,         // Times forgotten
  state: Int           // Internal FSRS state
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
	rating: 1 | 2 | 3 | 4,
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

| Service | Purpose                            | SDK              |
| ------- | ---------------------------------- | ---------------- |
| Gemini  | Sentence generation, grammar check | `openai`         |
| PostHog | Analytics                          | `posthog-js`     |
| Sentry  | Error tracking                     | `@sentry/nextjs` |

---

## Related Docs

- [SRS Architecture](./srs_architecture.md) — FSRS state machine
- [AI Integration](./ai_integration.md) — OpenAI prompts and usage
