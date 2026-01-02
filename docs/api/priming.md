# Priming Module Actions

**Generated:** 2025-12-29
**Part of:** [API Contracts Documentation](./index.md)

---

**File:** `src/modules/priming/actions.ts`

### `getStoryByUnit`

Get story for a unit (deck).

**Input:**

```typescript
{
	unitId: string;
}
```

**Returns:** `Story | null`

### `hasReadStory`

Check if user has read story.

**Input:**

```typescript
{
	unitId: string;
}
```

**Returns:** `boolean`

### `markStoryRead`

Mark story as read.

**Input:**

```typescript
{
	storyId: string;
}
```

**Returns:** `{ success: boolean, error?: string }`

### `getSessionDataWithPriming`

Get session data with priming story.

**Input:**

```typescript
{
	deckId: string;
}
```

**Returns:** `{ cards: Card[], story?: Story }`

---

---

## Related Documentation

- [API Contracts Index](./index.md) - All API documentation
- [Architecture](../architecture.md) - System architecture
- [Data Models](../models/index.md) - Database schema
