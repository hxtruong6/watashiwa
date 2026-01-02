# Report Module Actions

**Generated:** 2025-12-29
**Part of:** [API Contracts Documentation](./index.md)

---

**File:** `src/modules/report/report.actions.ts`

### `submitReport`

Submit content report.

**Input:**

```typescript
ReportPayload {
  vocabId: string;
  type: ReportType;
  field?: string;
  currentValue?: string;
  suggestedValue?: string;
  notes?: string;
}
```

**Returns:** `{ success: boolean, data?: CardReport, error?: string }`

### `resolveReport`

Resolve report (admin).

**Input:**

```typescript
ResolveReportPayload {
  reportId: string;
  action: 'accept' | 'reject' | 'duplicate';
  resolutionStr?: string;
}
```

**Returns:** `{ success: boolean, error?: string }`

---

---

## Related Documentation

- [API Contracts Index](./index.md) - All API documentation
- [Architecture](../architecture.md) - System architecture
- [Data Models](../models/index.md) - Database schema
