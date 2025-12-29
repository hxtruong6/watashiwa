# User Module Actions

**Generated:** 2025-12-29
**Part of:** [API Contracts Documentation](./index.md)

---


**File:** `src/modules/user/user.actions.ts`

### `updateUserSettings`

Update user settings.

**Input:**

```typescript
UpdateUserSettingsInput {
  dailyGoal?: number;
  limitNewCards?: number;
  limitReviews?: number;
  autoPlayAudio?: boolean;
  showPitchAccent?: boolean;
  // ... other preferences
}
```

**Returns:** `{ success: boolean, data?: User, error?: string }`

### `updateUserAvatar`

Update user avatar.

**Input:**

```typescript
avatarUrl: string
```

**Returns:** `{ success: boolean, error?: string }`

### `completeTutorial`

Mark tutorial as completed.

**Input:**

```typescript
tutorialId: string
```

**Returns:** `{ success: boolean, error?: string }`

### `getCompletedTutorials`

Get completed tutorials.

**Returns:** `string[]`  // Tutorial IDs

### `recalculateUserStreak`

Recalculate user streak (admin).

**Input:**

```typescript
userId: string
```

**Returns:** `{ success: boolean, error?: string }`

---


---

## Related Documentation

- [API Contracts Index](./index.md) - All API documentation
- [Architecture](../architecture.md) - System architecture
- [Data Models](../models/index.md) - Database schema
