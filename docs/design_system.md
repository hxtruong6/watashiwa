# Design System: "Zen Mastery"

> **Primary Reference**: See [AI Context](./ai_context.md) for philosophy and coding patterns.

---

## Color Tokens

Configure in `src/lib/theme/themeConfig.ts`:

| Token              | Light     | Dark      | Usage                       |
| ------------------ | --------- | --------- | --------------------------- |
| `colorPrimary`     | `#1E3A5F` | `#4A90D9` | Primary actions, headers    |
| `colorSuccess`     | `#708238` | `#8BC34A` | "Good" rating, progress     |
| `colorError`       | `#E64A19` | `#FF5722` | "Again" rating, destructive |
| `colorWarning`     | `#FAAD14` | `#FFB300` | "Hard" rating               |
| `colorBgBase`      | `#F9F7F2` | `#1A1A1A` | Global background           |
| `colorBgContainer` | `#FFFFFF` | `#262626` | Cards, modals               |

---

## Typography

| Element      | Size   | Weight | Token                              |
| ------------ | ------ | ------ | ---------------------------------- |
| Hero Kanji   | `64px` | `500`  | Custom                             |
| Page Title   | `24px` | `600`  | `Typography.Title level={2}`       |
| Body         | `16px` | `400`  | `Typography.Text`                  |
| Meta/Caption | `14px` | `400`  | `Typography.Text type="secondary"` |

**Fonts**: `'Inter', 'Noto Sans JP', sans-serif`

---

## Spacing & Shape

| Token          | Value  |
| -------------- | ------ |
| `borderRadius` | `8px`  |
| `paddingLG`    | `32px` |
| `paddingMD`    | `24px` |
| `paddingSM`    | `16px` |

---

## Component Patterns

### VocabCard

```tsx
<Card
	style={{
		boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
		borderRadius: token.borderRadius,
	}}
>
	{/* Question: Centered 64px Kanji */}
	{/* Answer: Kanji + Hán Việt + Kana + Sentence */}
</Card>
```

### RatingBar (Sticky Footer)

| Rating    | Style      | Token          |
| --------- | ---------- | -------------- |
| Again (1) | Bordered   | `colorError`   |
| Hard (2)  | Bordered   | `colorWarning` |
| Good (3)  | **Filled** | `colorSuccess` |
| Easy (4)  | Bordered   | `colorPrimary` |

---

## Micro-interactions

| Trigger     | Effect             |
| ----------- | ------------------ |
| Hover       | `scale(1.02)`      |
| Active/Tap  | `scale(0.98)`      |
| Transitions | `≥ 200ms ease-out` |

Use `framer-motion` for card flip/slide animations.

---

## Mobile First Checklist

- [ ] Touch targets ≥ `44px`
- [ ] Critical actions in thumb zone
- [ ] Test on iPhone SE (375px) first
- [ ] No horizontal scroll on any viewport
