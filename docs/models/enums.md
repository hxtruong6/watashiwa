# Enums

**Generated:** 2025-12-29
**Part of:** [Data Models Documentation](./index.md)
**Source:** `prisma/schema.prisma`

---

### UserRole

```typescript
USER | MODERATOR | ADMIN;
```

### ContentStatus

```typescript
DRAFT | AI_GENERATED | FLAGGED | VERIFIED | PUBLISHED;
```

### VariantType

```typescript
BASIC | CONTEXT_GAP_FILL | AUDIO_MATCH | INTERVENTION;
```

### ConfusionType

```typescript
HOMONYM | LOOKALIKE | SYNONYM | ANTONYM | GRAMMAR;
```

### SessionStatus

```typescript
ACTIVE | COMPLETED | ABANDONED;
```

### CommentType

```typescript
MNEMONIC | USAGE_TIP | CULTURAL_NOTE | EXAMPLE | GRAMMAR | GENERAL;
```

### ReportType

```typescript
INCORRECT_READING |
	INCORRECT_MEANING |
	INCORRECT_HAN_VIET |
	TYPO |
	MISSING_AUDIO |
	WRONG_EXAMPLE |
	DUPLICATE |
	OTHER;
```

### ReportStatus

```typescript
PENDING | ACCEPTED | REJECTED | DUPLICATE;
```

---

---

## Related Documentation

- [Data Models Index](./index.md) - All data models
- [Architecture](../architecture.md) - System architecture
- [API Contracts](../api/index.md) - Server actions
