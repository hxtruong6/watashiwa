# Vocabulary Module Actions

**Generated:** 2025-12-29
**Part of:** [API Contracts Documentation](./index.md)

---


**File:** `src/modules/vocabulary/vocabulary.actions.ts`

### `getPendingContent`

Get pending content for verification.

**Returns:** `Vocabulary[]`

### `approveContent`

Approve vocabulary content.

**Input:**

```typescript
{ vocabId: string }
```

**Returns:** `{ success: boolean, error?: string }`

### `verifyContent`

Verify vocabulary content (admin).

**Input:**

```typescript
{ vocabId: string }
```

**Returns:** `{ success: boolean, error?: string }`

### `rejectContent`

Reject vocabulary content.

**Input:**

```typescript
{ vocabId: string }
```

**Returns:** `{ success: boolean, error?: string }`

### `reportContent`

Report content issue.

**Input:**

```typescript
{ vocabId: string; reason?: string }
```

**Returns:** `{ success: boolean, error?: string }`

### `createVocabulary`

Create new vocabulary.

**Input:**

```typescript
{
  deckId: string;
  wordSurface: string;
  wordReading: string;
  meanings: Record<string, string[]>;
  // ... other fields
}
```

**Returns:** `{ success: boolean, data?: Vocabulary, error?: string }`

### `updateContent`

Update vocabulary content.

**Input:**

```typescript
{ id: string; data: Partial<Vocabulary> }
```

**Returns:** `{ success: boolean, data?: Vocabulary, error?: string }`

### `deleteVocabulary`

Delete vocabulary (soft delete).

**Input:**

```typescript
{ id: string }
```

**Returns:** `{ success: boolean, error?: string }`

### `getConfusionsForVocab`

Get confusion pairs for vocabulary.

**Input:**

```typescript
{ vocabId: string }
```

**Returns:** `ConfusionPair[]`

---


---

## Related Documentation

- [API Contracts Index](./index.md) - All API documentation
- [Architecture](../architecture.md) - System architecture
- [Data Models](../models/index.md) - Database schema
