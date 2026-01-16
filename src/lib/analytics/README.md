# Analytics Events System

## Overview

This module provides a **centralized, type-safe analytics event system** for WatashiWa. It replaces ad-hoc string-based event names with a structured, maintainable architecture.

## Architecture

### File Structure

```
src/lib/analytics/
├── events.ts      # Event name constants (AnalyticsEvents)
├── types.ts       # TypeScript interfaces for event properties
├── index.ts       # Public API exports
└── README.md      # This file
```

### Key Components

1. **`AnalyticsEvents`** - Namespaced event name constants
2. **Type-safe properties** - Each event has a corresponding TypeScript interface
3. **Type-safe tracking functions** - Compile-time validation of event names and properties

## Usage

### Basic Usage

```typescript
import { AnalyticsEvents, trackEvent } from '@/lib/analytics';

// Type-safe event tracking
trackEvent(AnalyticsEvents.Study.SessionStarted, {
	entry_type: 'auto_start',
	queue_size: 10,
	due_count: 5,
	deck_id: null,
	course_id: null,
});
```

### Event Categories

Events are organized by domain:

- **`AnalyticsEvents.Auth`** - Authentication events
- **`AnalyticsEvents.Study`** - Study session events
- **`AnalyticsEvents.Priming`** - Priming/story events
- **`AnalyticsEvents.Deck`** - Deck management events
- **`AnalyticsEvents.Feature`** - Feature discovery events
- **`AnalyticsEvents.Algorithm`** - Algorithm-related events
- **`AnalyticsEvents.Error`** - Error tracking events

### Type Safety

The system provides full type safety:

```typescript
// ✅ Correct - TypeScript will autocomplete and validate
trackEvent(AnalyticsEvents.Study.SessionStarted, {
	entry_type: 'auto_start',
	queue_size: 10,
	due_count: 5,
});

// ❌ Error - Missing required property
trackEvent(AnalyticsEvents.Study.SessionStarted, {
	entry_type: 'auto_start',
	// Missing queue_size and due_count
});

// ❌ Error - Invalid property type
trackEvent(AnalyticsEvents.Study.SessionStarted, {
	entry_type: 'invalid_value', // Type error
	queue_size: 'ten', // Type error - should be number
});
```

### Server-Side Usage

```typescript
import { AnalyticsEvents, logAnalyticsEvent } from '@/modules/analytics/analytics.actions';

await logAnalyticsEvent(AnalyticsEvents.Auth.UserSignedUp, {
	distinct_id: userId,
	method: 'email',
	source: 'landing_page',
});
```

## Adding New Events

### Step 1: Define Property Interface

Add to `src/lib/analytics/types.ts`:

```typescript
export interface MyNewEventProperties {
	required_field: string;
	optional_field?: number;
}
```

### Step 2: Add Event Constant

Add to `src/lib/analytics/events.ts`:

```typescript
export const AnalyticsEvents = {
	// ... existing events
	MyDomain: {
		MyNewEvent: 'my_new_event',
	} as const,
} as const;
```

### Step 3: Add to Properties Map

Add to `AnalyticsEventPropertiesMap` in `events.ts`:

```typescript
export interface AnalyticsEventPropertiesMap {
	// ... existing mappings
	[AnalyticsEvents.MyDomain.MyNewEvent]: MyNewEventProperties;
}
```

### Step 4: Export Type (Optional)

Add to `src/lib/analytics/index.ts` if you want to export the property type:

```typescript
export type { MyNewEventProperties } from './types';
```

## Migration Guide

### From String-Based to Type-Safe

**Before:**

```typescript
trackEvent('study_session_started', {
	entry_type: 'auto_start',
	queue_size: 10,
});
```

**After:**

```typescript
import { AnalyticsEvents } from '@/lib/analytics';

trackEvent(AnalyticsEvents.Study.SessionStarted, {
	entry_type: 'auto_start',
	queue_size: 10,
	due_count: 0, // Now required by type
});
```

### Backward Compatibility

The system maintains backward compatibility - string-based event names still work, but they're marked as deprecated:

```typescript
// Still works, but shows deprecation warning
trackEvent('study_session_started', { ... });
```

## Best Practices

1. **Always use `AnalyticsEvents` constants** - Never use raw strings
2. **Follow naming conventions** - `[domain]_[object]_[action]` (e.g., `study_session_started`)
3. **Keep properties minimal** - Only include necessary data
4. **Use consistent property names** - Follow existing patterns (e.g., `deck_id`, not `deckId`)
5. **Document new events** - Add JSDoc comments when adding events
6. **Group related events** - Use the domain namespace structure

## Validation

### Runtime Validation

```typescript
import { isValidEventName } from '@/lib/analytics';

if (isValidEventName(someString)) {
	// TypeScript now knows someString is AnalyticsEventName
	trackEvent(someString, properties);
}
```

### List All Events

```typescript
import { getAllEventNames } from '@/lib/analytics';

const allEvents = getAllEventNames();
console.log('All tracked events:', allEvents);
```

## Event Naming Conventions

- **Format**: `[domain]_[object]_[action]`
- **Case**: `snake_case`
- **Examples**:
  - ✅ `study_session_started`
  - ✅ `user_signed_up`
  - ✅ `priming_skipped`
  - ❌ `studySessionStarted` (camelCase)
  - ❌ `StudySessionStarted` (PascalCase)
  - ❌ `study-session-started` (kebab-case)

## Property Naming Conventions

- **Format**: `snake_case`
- **IDs**: Use `_id` suffix (e.g., `deck_id`, `user_id`)
- **Booleans**: Use `is_` or `has_` prefix (e.g., `is_pwa`, `has_more_cards`)
- **Timestamps**: Use `_ms` or `_timestamp` suffix (e.g., `duration_ms`, `timestamp`)
- **Counts**: Use descriptive names (e.g., `queue_size`, `cards_reviewed`)

## Benefits

1. **Type Safety** - Catch errors at compile time
2. **Autocomplete** - IDE support for event names and properties
3. **Refactoring** - Easy to rename events across the codebase
4. **Documentation** - Self-documenting code structure
5. **Consistency** - Enforces naming conventions
6. **Discoverability** - Easy to find all events in one place
7. **Maintainability** - Centralized management as the app grows

## Future Enhancements

- [ ] Event validation schemas (Zod)
- [ ] Event deprecation system
- [ ] Analytics dashboard integration
- [ ] Event usage tracking
- [ ] Automated event documentation generation
