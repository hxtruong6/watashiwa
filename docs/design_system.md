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

### Light Theme Tokens

| Token                | Value     | Usage                       |
| -------------------- | --------- | --------------------------- |
| `colorPrimary`       | `#1E3A5F` | Primary actions, headers    |
| `colorSuccess`       | `#708238` | "Good" rating, progress     |
| `colorError`         | `#E64A19` | "Again" rating, destructive |
| `colorWarning`       | `#FAAD14` | "Hard" rating               |
| `colorBgBase`        | `#FFFFFF` | Component background        |
| `colorBgLayout`      | `#F9F7F2` | App background (Washi)      |
| `colorBgContainer`   | `#FFFFFF` | Cards, modals               |
| `colorText`          | `#2D2D2D` | Primary text (Sumi)         |
| `colorTextSecondary` | `#8C8C8C` | Secondary text (Stone)      |

### Dark Theme Tokens

| Token                  | Value                       | Usage                            |
| ---------------------- | --------------------------- | -------------------------------- |
| `colorPrimary`         | `#63B3ED`                   | Primary actions (Clear Sky Blue) |
| `colorSuccess`         | `#68D391`                   | "Good" rating (Emerald 300)      |
| `colorError`           | `#FC8181`                   | "Again" rating (Red 300)         |
| `colorWarning`         | `#F6E05E`                   | "Hard" rating (Yellow 300)       |
| `colorBgBase`          | `#151F32`                   | Surface (Card/Nav) - Deep Slate  |
| `colorBgLayout`        | `#0B1120`                   | Main Background - Midnight       |
| `colorBgContainer`     | `#151F32`                   | Cards, modals                    |
| `colorText`            | `rgba(255, 255, 255, 0.92)` | Primary text (Almost white)      |
| `colorTextSecondary`   | `rgba(255, 255, 255, 0.65)` | Secondary text (Readable grey)   |
| `colorTextTertiary`    | `rgba(255, 255, 255, 0.45)` | Tertiary text                    |
| `colorBorder`          | `#2D3748`                   | Borders (Slate 700)              |
| `colorBorderSecondary` | `#1A202C`                   | Secondary borders (Slate 900)    |

### Component-Specific Dark Theme Tokens

| Component  | Token              | Dark Value                    | Usage                   |
| ---------- | ------------------ | ----------------------------- | ----------------------- |
| Layout     | `bodyBg`           | `#0B1120`                     | Main app background     |
| Layout     | `headerBg`         | `#151F32`                     | Header background       |
| Layout     | `siderBg`          | `#151F32`                     | Sidebar background      |
| Card       | `colorBgContainer` | `#151F32`                     | Card background         |
| Card       | `actionsBg`        | `#111927`                     | Card actions background |
| Card       | `headerBg`         | `#151F32`                     | Card header background  |
| Typography | `colorTextHeading` | `#FFFFFF`                     | Pure white headings     |
| Button     | `primaryShadow`    | `0 2px 0 rgba(0, 0, 0, 0.45)` | Primary button shadow   |

---

## Dark Theme Compatibility Requirements

**CRITICAL:** All components MUST be tested and compatible with both light and dark themes.

### 1. Background Color Compatibility

- ✅ **Use Ant Design tokens**: Always use `token.colorBgBase`, `token.colorBgContainer`, `token.colorBgLayout` instead of hardcoded colors
- ✅ **CSS Variables**: Use `--color-background` and `--color-foreground` from `src/styles/_variables.css` for custom CSS
- ❌ **Never hardcode**: Do not use `#FFFFFF`, `#000000`, or any fixed color values in components

**Example:**

```tsx
// ✅ CORRECT: Uses theme token
<Card style={{ backgroundColor: token.colorBgContainer }}>
  <Typography.Text style={{ color: token.colorText }}>Content</Typography.Text>
</Card>

// ❌ WRONG: Hardcoded color
<Card style={{ backgroundColor: '#FFFFFF' }}>
  <Typography.Text style={{ color: '#000000' }}>Content</Typography.Text>
</Card>
```

### 2. Text Color Compatibility

- ✅ **Primary Text**: Use `token.colorText` for main content
- ✅ **Secondary Text**: Use `token.colorTextSecondary` for less important content
- ✅ **Tertiary Text**: Use `token.colorTextTertiary` for hints/placeholders
- ✅ **Headings**: Use `Typography.Title` or `Typography.Heading` components (automatically themed)
- ❌ **Never hardcode**: Do not use fixed text colors like `#000000` or `#FFFFFF`

**Contrast Requirements:**

- Primary text on background: **Minimum 4.5:1 contrast ratio** (WCAG AA)
- Secondary text: **Minimum 3:1 contrast ratio**
- All text must be readable in both themes

### 3. Border Color Compatibility

- ✅ **Use tokens**: `token.colorBorder` for primary borders
- ✅ **Secondary borders**: `token.colorBorderSecondary` for subtle separators
- ❌ **Never hardcode**: Do not use fixed border colors

### 4. Component Testing Checklist

Before marking a component as complete, verify:

- [ ] **Background**: Component background uses theme tokens (not hardcoded)
- [ ] **Text**: All text uses theme tokens (readable in both themes)
- [ ] **Borders**: Borders use theme tokens (visible in both themes)
- [ ] **Shadows**: Shadows are appropriate for both themes (darker in dark mode)
- [ ] **Icons**: Icons have appropriate contrast in both themes
- [ ] **Hover states**: Hover effects work in both themes
- [ ] **Focus states**: Focus indicators are visible in both themes
- [ ] **Visual test**: Manually toggle theme and verify all elements are visible and readable

### 5. Theme Token Access Pattern

```tsx
'use client';

import { theme } from 'antd';
import { useToken } from 'antd';

export default function MyComponent() {
	const { token } = useToken();

	return (
		<div
			style={{
				backgroundColor: token.colorBgContainer,
				color: token.colorText,
				border: `1px solid ${token.colorBorder}`,
			}}
		>
			Content
		</div>
	);
}
```

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

## Responsive Design: Mobile-First Strategy

**CRITICAL:** All components MUST be designed mobile-first, then enhanced for desktop.

### Breakpoint Strategy

Breakpoints are defined in `src/styles/_variables.css`:

| Breakpoint | Value    | Usage                    |
| ---------- | -------- | ------------------------ |
| Mobile     | `600px`  | Default (mobile-first)   |
| Tablet     | `1000px` | Tablet and small desktop |
| Desktop    | `1200px` | Large desktop and above  |

**CSS Variable Reference:**

```css
--breakpoint-mobile: 600px;
--breakpoint-tablet: 1000px;
--breakpoint-desktop: 1200px;
```

### Mobile-First Approach

1. **Design for Mobile First**: Start with the smallest viewport (320px - 600px)
2. **Progressive Enhancement**: Add desktop features using `min-width` media queries
3. **Never Desktop-First**: Do not design for desktop and then shrink down

**Media Query Pattern:**

```css
/* ✅ CORRECT: Mobile-first */
.component {
	padding: 16px; /* Mobile default */
}

@media (min-width: 600px) {
	.component {
		padding: 24px; /* Tablet enhancement */
	}
}

@media (min-width: 1200px) {
	.component {
		padding: 32px; /* Desktop enhancement */
	}
}

/* ❌ WRONG: Desktop-first */
.component {
	padding: 32px; /* Desktop default */
}

@media (max-width: 600px) {
	.component {
		padding: 16px; /* Mobile override */
	}
}
```

### Responsive Layout Patterns

#### 1. Mobile Strategy (320px - 767px)

- **Navigation**: Bottom tab navigation (thumb-friendly)
- **Content**: Single column, vertical scrolling
- **Touch Targets**: Minimum 44px × 44px
- **Spacing**: Reduced padding (16px default)
- **Typography**: Base font size 16px (no zoom needed)
- **Actions**: Critical actions in "thumb zone" (bottom 1/3 of screen)

#### 2. Tablet Strategy (768px - 1023px)

- **Navigation**: Side navigation or top navigation
- **Content**: 2-column layouts where appropriate
- **Touch Targets**: Maintain 44px minimum
- **Spacing**: Medium padding (24px default)
- **Typography**: Slightly larger headings

#### 3. Desktop Strategy (1024px+)

- **Navigation**: Full side navigation with labels
- **Content**: Multi-column layouts, sidebars
- **Hover States**: Enhanced hover effects
- **Spacing**: Generous padding (32px default)
- **Typography**: Full typographic scale

### Ant Design Responsive Components

Use Ant Design's built-in responsive components:

```tsx
import { Grid, Flex } from 'antd';

// ✅ CORRECT: Use Ant Design Grid
<Grid.Row gutter={[16, 16]}>
  <Grid.Col xs={24} sm={12} md={8} lg={6}>
    <Card>Content</Card>
  </Grid.Col>
</Grid.Row>

// ✅ CORRECT: Use Flex with responsive props
<Flex
  vertical
  gap="middle"
  style={{
    padding: '16px',
  }}
  className="responsive-padding" // Use CSS for responsive padding
>
  <Card>Content</Card>
</Flex>
```

### Responsive Testing Checklist

Before marking a component as complete, verify:

- [ ] **Mobile (375px)**: iPhone SE / iPhone 12 Pro - All content visible, no horizontal scroll
- [ ] **Mobile (390px)**: iPhone 12/13/14 - Layout works correctly
- [ ] **Tablet (768px)**: iPad - Layout adapts appropriately
- [ ] **Tablet (1024px)**: iPad Pro - Enhanced layout visible
- [ ] **Desktop (1200px+)**: Full desktop experience
- [ ] **Touch Targets**: All interactive elements ≥ 44px × 44px
- [ ] **Text Readability**: No text smaller than 14px (16px preferred)
- [ ] **No Horizontal Scroll**: Content never overflows viewport width
- [ ] **Thumb Zone**: Critical actions accessible with thumb on mobile
- [ ] **Orientation**: Test both portrait and landscape (where applicable)

### Responsive Utilities

Use CSS custom properties for consistent spacing:

```css
/* From src/styles/_variables.css */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
```

**Example:**

```tsx
<div style={{ padding: 'var(--spacing-md)' }}>
	{' '}
	{/* 16px on mobile */}
	<div style={{ padding: 'var(--spacing-lg)' }}>
		{' '}
		{/* 24px on tablet+ */}
		Content
	</div>
</div>
```

### Common Responsive Patterns

#### Pattern 1: Responsive Padding

```tsx
<div
	style={{
		padding: '16px', // Mobile
	}}
	className="responsive-padding" // CSS handles larger screens
>
	Content
</div>
```

```css
.responsive-padding {
	padding: 16px;
}

@media (min-width: 600px) {
	.responsive-padding {
		padding: 24px;
	}
}

@media (min-width: 1200px) {
	.responsive-padding {
		padding: 32px;
	}
}
```

#### Pattern 2: Responsive Grid

```tsx
<Grid.Row gutter={[16, 16]}>
	<Grid.Col xs={24} sm={12} md={8} lg={6}>
		{/* Full width on mobile, half on tablet, 1/3 on desktop, 1/4 on large desktop */}
	</Grid.Col>
</Grid.Row>
```

#### Pattern 3: Responsive Typography

```tsx
<Typography.Title
	level={2}
	style={{
		fontSize: '24px', // Mobile
	}}
	className="responsive-title"
>
	Title
</Typography.Title>
```

```css
.responsive-title {
	font-size: 24px;
}

@media (min-width: 600px) {
	.responsive-title {
		font-size: 28px;
	}
}

@media (min-width: 1200px) {
	.responsive-title {
		font-size: 32px;
	}
}
```
