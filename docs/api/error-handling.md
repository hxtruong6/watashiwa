# Error Handling

**Generated:** 2025-12-29
**Part of:** [API Contracts Documentation](./index.md)

---


### Server Actions

Errors are caught by `executeSafeAction` and returned as:

```typescript
{
  success: false;
  error: string;  // User-friendly message
}
```

### API Routes

API routes return HTTP status codes:

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `500` - Internal Server Error

---


---

## Related Documentation

- [API Contracts Index](./index.md) - All API documentation
- [Architecture](../architecture.md) - System architecture
- [Data Models](../models/index.md) - Database schema
