# Community Module Actions

**Generated:** 2025-12-29
**Part of:** [API Contracts Documentation](./index.md)

---

**File:** `src/modules/community/community.actions.ts`

### `getComments`

Get comments for entity.

**Input:**

```typescript
entityId: string;
type: 'vocab' | 'kanji';
```

**Returns:** `Comment[]`

### `createComment`

Create a comment.

**Input:**

```typescript
{
	entityId: string;
	type: 'vocab' | 'kanji';
	content: string;
	commentType: CommentType;
}
```

**Returns:** `{ success: boolean, data?: Comment, error?: string }`

### `voteComment`

Vote on comment.

**Input:**

```typescript
commentId: string;
value: number; // 1 (upvote) or -1 (downvote)
```

**Returns:** `{ success: boolean, error?: string }`

### `deleteComment`

Delete comment.

**Input:**

```typescript
commentId: string;
```

**Returns:** `{ success: boolean, error?: string }`

### `updateComment`

Update comment.

**Input:**

```typescript
commentId: string;
content: string;
type: CommentType;
```

**Returns:** `{ success: boolean, data?: Comment, error?: string }`

### `getTrendingComments`

Get trending comments.

**Input:**

```typescript
limit?: number  // Default: 5
```

**Returns:** `Comment[]`

### `getUserContributions`

Get user's contributions.

**Returns:** `Contribution[]`

### `getCommunityFeed`

Get community feed.

**Input:**

```typescript
{
  limit?: number;
  offset?: number;
}
```

**Returns:** `FeedItem[]`

---

---

## Related Documentation

- [API Contracts Index](./index.md) - All API documentation
- [Architecture](../architecture.md) - System architecture
- [Data Models](../models/index.md) - Database schema
