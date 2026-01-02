# Memory Garden Actions

**Generated:** 2025-12-29
**Part of:** [API Contracts Documentation](./index.md)

---

**File:** `src/modules/dashboard/components/memory-garden/memory-garden.actions.ts`

### `getMemoryGardenData`

Get memory garden visualization data.

**Input:**

```typescript
{
  userId: string;
  limit?: number;
  filter?: GardenFilter;
}
```

**Returns:** `MemoryGardenData`

### `getMemoryGardenDataForDeck`

Get memory garden data for specific deck.

**Input:**

```typescript
deckId: string;
```

**Returns:** `MemoryGardenData`

---

---

## Related Documentation

- [API Contracts Index](./index.md) - All API documentation
- [Architecture](../architecture.md) - System architecture
- [Data Models](../models/index.md) - Database schema
