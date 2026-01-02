# Flashcard Module Actions

**Generated:** 2025-12-29
**Part of:** [API Contracts Documentation](./index.md)

---

**File:** `src/modules/flashcard/flashcard.actions.ts`

### `fetchSessionAction`

Fetch session data with cards.

**Input:**

```typescript
{ deckId?: string; courseId?: string }
```

**Returns:** `Card[]`

**Behavior:**

- Fetches due reviews first
- Fills with new cards if needed
- Returns up to 10 cards

---

---

## Related Documentation

- [API Contracts Index](./index.md) - All API documentation
- [Architecture](../architecture.md) - System architecture
- [Data Models](../models/index.md) - Database schema
