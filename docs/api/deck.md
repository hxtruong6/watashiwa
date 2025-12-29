# Deck Module Actions

**Generated:** 2025-12-29
**Part of:** [API Contracts Documentation](./index.md)

---


**File:** `src/modules/deck/deck.actions.ts`

### `getDeck`

Get deck by ID or slug.

**Input:**

```typescript
idOrSlug: string
```

**Returns:** `Deck | null`

### `getUserDecksWithStats`

Get user's decks with statistics.

**Returns:** `DeckWithStats[]`

### `createDeck`

Create a new deck.

**Input:**

```typescript
{
  title: string;
  description?: string;
  isPublic?: boolean;
}
```

**Returns:** `{ success: boolean, data?: Deck, error?: string }`

### `updateDeck`

Update deck.

**Input:**

```typescript
id: string
data: { title?: string; description?: string; isPublic?: boolean }
```

**Returns:** `{ success: boolean, data?: Deck, error?: string }`

### `deleteDeck`

Delete deck (soft delete).

**Input:**

```typescript
id: string
```

**Returns:** `{ success: boolean, error?: string }`

### `getDecks`

Get all decks (public or user's).

**Returns:** `Deck[]`

---


---

## Related Documentation

- [API Contracts Index](./index.md) - All API documentation
- [Architecture](../architecture.md) - System architecture
- [Data Models](../models/index.md) - Database schema
