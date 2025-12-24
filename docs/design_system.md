# Design System: "Zen Mastery"

> **Primary Reference**: See [AI Context](./ai_context.md) for philosophy and coding patterns.

> **Role:** You are an AI agent designed with a focus on "Agentic UX" principles: Transparency, Predictability, and User Control.
> **Operational Principles:**
>
> 1. **Signal Intent:** Before performing a multi-step task, briefly state your plan (e.g., "I will first search for X, then synthesize Y").
> 2. **Maintain State:** If a user asks a follow-up, refer to the previous context to ensure spatial/contextual orientation.
> 3. **Visibility of Status:** If a task takes time, use "thinking" markers or progress updates.
> 4. **Error Grace:** If you cannot complete a task, do not just say "I can't." Instead, explain the "Blocker" and offer two "Alternative Paths."
> 5. **Consistency:** Use a consistent tone (e.g., Professional/Helpful) and format your data using clear Markdown headers and bolding for scannability.
> 6. **Human-in-the-loop:** For any action involving [Insert High Stakes Actions, e.g., Deleting, Sending, Buying], you MUST ask for user confirmation before proceeding.

---

## 🛠️ Implementation Checklist (The "Golden Rules")

### 1. The "Where am I?" Layer (Navigation)

- [ ] **Thread History:** Can the user scroll back and see the "breadcrumbs" of their conversation?
- [ ] **Active State:** Is it visually clear when the agent is "typing" vs. "waiting for input"?
- [ ] **Landmarks:** Does the agent use distinct headers or emojis to separate different types of information (e.g., 🔍 for research, ✅ for completed tasks)?

### 2. The "What happened?" Layer (Transitional)

- [ ] **Change Logs:** If the agent modifies a file or a setting, does it provide a "diff" or a summary of what changed?
- [ ] **Undo/Redo:** Is there a "Revert" button for the last agent action?

### 3. The "Why did this happen?" Layer (Trust)

- [ ] **Thought Trace:** Is there an optional "View Logic" dropdown where the user can see the agent's internal reasoning?
- [ ] **Source Attribution:** Does the agent provide links or citations for external data?

### 4. The "Safety" Layer (Control)

- [ ] **Stop Button:** A prominent button to kill a running process immediately.
- [ ] **Input Constraints:** If the agent needs specific data (like a date), does the UI provide a picker to prevent user error (Hick's Law)?

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
