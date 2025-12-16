# Codebase Conventions

> **Primary Reference**: See [AI Context](./ai_context.md) for full tech stack and design system.

This document covers project-specific patterns not obvious from standard conventions.

---

## File Structure

| Type | Pattern | Example |
|------|---------|---------|
| Components | `src/components/[Feature]/` | `Dashboard/DeckList.tsx` |
| Pages | `src/app/[route]/page.tsx` | `study/page.tsx` |
| Server Actions | `src/services/actions.ts` | — |
| Hooks | `src/hooks/use[Name].ts` | `useStudySession.ts` |
| Utilities | `src/lib/[name].ts` | `srs-algorithm.ts` |
| Types | `src/types/` or co-located | — |

---

## Ant Design Integration

### Theme Configuration

All tokens defined in `src/lib/theme/themeConfig.ts`. Never use:

- Raw hex colors in components
- Tailwind classes
- Separate CSS/SCSS files

### Layout Components

```tsx
// Preferred
<Flex vertical gap="middle">
  <Typography.Title level={3}>{t('heading')}</Typography.Title>
</Flex>

// Avoid
<div style={{ display: 'flex', flexDirection: 'column' }}>
```

---

## Data Patterns

### Server Action Returns

```typescript
// Always return this shape
type ActionResult<T> = {
  success: boolean;
  error?: string;
  data?: T;
};
```

### Hán Việt Data

All Kanji-related data must include Sino-Vietnamese readings:

```typescript
{
  kanji: "学",
  han_viet: "HỌC",    // Required
  reading: "がく",
  meaning: "study"
}
```

---

## Translation (next-intl)

- All user-facing strings use `useTranslations()`
- Keys in `messages/en.json` and `messages/vi.json`
- Namespace per feature: `dashboard.title`, `study.complete`
