# API Routes

**Generated:** 2025-12-29
**Part of:** [API Contracts Documentation](./index.md)

---

### `/api/notifications/subscribe`

**Method:** `POST`

**Purpose:** Subscribe to push notifications

**Auth:** Required

**Request Body:**

```typescript
{
  subscription: PushSubscription;
  userAgent?: string;
}
```

**Response:**

```typescript
{
	success: boolean;
}
```

**Behavior:**

- Saves push subscription
- Sends welcome notification

### `/api/cron/reminders`

**Method:** `GET`

**Purpose:** Cron job for sending reminder notifications

**Auth:** CRON_SECRET header required

**Response:**

```typescript
{
	success: boolean;
	processed: number;
	sent: number;
}
```

**Note:** Currently commented out, ready for implementation

---

---

## Related Documentation

- [API Contracts Index](./index.md) - All API documentation
- [Architecture](../architecture.md) - System architecture
- [Data Models](../models/index.md) - Database schema
