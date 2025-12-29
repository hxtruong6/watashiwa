# Course Module Actions

**Generated:** 2025-12-29
**Part of:** [API Contracts Documentation](./index.md)

---


**File:** `src/modules/course/course.actions.ts`

### `getCourseById`

Get course by ID.

**Input:**

```typescript
id: string
```

**Returns:** `Course | null`

### `getCourseWithUserProgress`

Get course with user progress.

**Input:**

```typescript
courseIdOrSlug: string
```

**Returns:** `CourseWithProgress | null`

### `getCourses`

Get courses (optionally filtered by public status).

**Input:**

```typescript
options?: { isPublic?: boolean }
```

**Returns:** `Course[]`

### `createCourse`

Create a new course.

**Input:**

```typescript
CreateCourseInput {
  title: string;
  description?: string;
  isPublic?: boolean;
  deckIds?: string[];
}
```

**Returns:** `{ success: boolean, data?: Course, error?: string }`

### `updateCourse`

Update course.

**Input:**

```typescript
id: string
data: UpdateCourseInput
```

**Returns:** `{ success: boolean, data?: Course, error?: string }`

### `deleteCourse`

Delete course.

**Input:**

```typescript
id: string
```

**Returns:** `{ success: boolean, error?: string }`

### `addDeckToCourse`

Add deck to course.

**Input:**

```typescript
courseId: string
deckId: string
```

**Returns:** `{ success: boolean, error?: string }`

### `removeDeckFromCourse`

Remove deck from course.

**Input:**

```typescript
courseId: string
deckId: string
```

**Returns:** `{ success: boolean, error?: string }`

### `reorderDecks`

Reorder decks in course.

**Input:**

```typescript
courseId: string
deckIds: string[]  // Ordered list
```

**Returns:** `{ success: boolean, error?: string }`

### `searchDecks`

Search decks by query.

**Input:**

```typescript
query: string
```

**Returns:** `Deck[]`

---


---

## Related Documentation

- [API Contracts Index](./index.md) - All API documentation
- [Architecture](../architecture.md) - System architecture
- [Data Models](../models/index.md) - Database schema
