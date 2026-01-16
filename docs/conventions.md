# Codebase Conventions

> **Primary Reference**: See [AI Context](./ai_context.md) for full tech stack and design system.

This document covers project-specific patterns not obvious from standard conventions.

---

## File Structure

| Type           | Pattern                     | Example                  |
| -------------- | --------------------------- | ------------------------ |
| Components     | `src/components/[Feature]/` | `Dashboard/DeckList.tsx` |
| Pages          | `src/app/[route]/page.tsx`  | `study/page.tsx`         |
| Server Actions | `src/services/actions.ts`   | —                        |
| Hooks          | `src/hooks/use[Name].ts`    | `useStudySession.ts`     |
| Utilities      | `src/lib/[name].ts`         | `srs-algorithm.ts`       |
| Types          | `src/types/` or co-located  | —                        |

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

**CRITICAL:** All user-facing text MUST be translated and support both English and Vietnamese.

### Translation Requirements

1. **All User-Facing Strings**: Every string visible to users must use `useTranslations()`
2. **Both Languages Required**: Keys MUST exist in both `messages/en.json` AND `messages/vi.json`
3. **Namespace Pattern**: Organize keys by feature: `dashboard.title`, `study.complete`, `profile.settings`
4. **No Hardcoded Strings**: Never use hardcoded English or Vietnamese text in components

### Translation Workflow

#### Step 1: Add Translation Keys

When adding new text, add keys to **BOTH** language files:

**File: `src/i18n/messages/en.json`**

```json
{
	"Dashboard": {
		"welcome": "Welcome back!",
		"studyToday": "Study today"
	}
}
```

**File: `src/i18n/messages/vi.json`**

```json
{
	"Dashboard": {
		"welcome": "Chào mừng trở lại!",
		"studyToday": "Học hôm nay"
	}
}
```

#### Step 2: Use Translation Hook

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function Dashboard() {
	const t = useTranslations('Dashboard');

	return (
		<div>
			<Typography.Title>{t('welcome')}</Typography.Title>
			<Typography.Text>{t('studyToday')}</Typography.Text>
		</div>
	);
}
```

#### Step 3: Server Component Translations

For Server Components, use `getTranslations`:

```tsx
import { getTranslations } from 'next-intl/server';

export default async function ServerPage() {
	const t = await getTranslations('Dashboard');

	return (
		<div>
			<h1>{t('welcome')}</h1>
		</div>
	);
}
```

### Translation Checklist

Before marking a component as complete, verify:

- [ ] **All Text Translated**: Every user-facing string uses `useTranslations()` or `getTranslations()`
- [ ] **Keys Added**: New translation keys added to **BOTH** `messages/en.json` AND `messages/vi.json`
- [ ] **No Hardcoded Strings**: No English or Vietnamese text hardcoded in components
- [ ] **Namespace Correct**: Keys organized by feature/component namespace
- [ ] **Language Switch Test**: Toggle language and verify all text updates correctly
- [ ] **Missing Key Check**: No console errors for missing translation keys
- [ ] **Placeholder Text**: Form placeholders, button labels, tooltips all translated
- [ ] **Error Messages**: Error messages and validation text translated
- [ ] **Dynamic Content**: If content comes from database, ensure it supports both languages

### Common Translation Patterns

#### Pattern 1: Simple Translation

```tsx
const t = useTranslations('Common');
<Button>{t('submit')}</Button>;
```

#### Pattern 2: Translation with Variables

```tsx
const t = useTranslations('Dashboard');
<Typography.Text>{t('cardCount', { count: cards.length })}</Typography.Text>;
```

**Translation files:**

```json
{
	"Dashboard": {
		"cardCount": "You have {count} cards"
	}
}
```

```json
{
	"Dashboard": {
		"cardCount": "Bạn có {count} thẻ"
	}
}
```

#### Pattern 3: Nested Keys

```tsx
const t = useTranslations('Profile');
<Typography.Text>{t('settings.displayName')}</Typography.Text>;
```

**Translation files:**

```json
{
	"Profile": {
		"settings": {
			"displayName": "Display Name"
		}
	}
}
```

#### Pattern 4: Pluralization

```tsx
const t = useTranslations('Study');
<Typography.Text>{t('cardsRemaining', { count: remaining })}</Typography.Text>;
```

**Translation files:**

```json
{
	"Study": {
		"cardsRemaining": "{count, plural, =0 {No cards remaining} one {# card remaining} other {# cards remaining}}"
	}
}
```

```json
{
	"Study": {
		"cardsRemaining": "{count, plural, =0 {Không còn thẻ nào} one {Còn # thẻ} other {Còn # thẻ}}"
	}
}
```

### Translation File Structure

Organize translations by feature/module:

```json
{
	"Common": {
		"submit": "Submit",
		"cancel": "Cancel",
		"save": "Save",
		"delete": "Delete"
	},
	"Dashboard": {
		"title": "Dashboard",
		"welcome": "Welcome back!"
	},
	"Study": {
		"title": "Study Session",
		"complete": "Session Complete"
	},
	"Profile": {
		"title": "Profile",
		"settings": {
			"displayName": "Display Name",
			"language": "Language"
		}
	}
}
```

### Language Detection & Switching

- **Default Language**: Vietnamese (`vi`)
- **Supported Languages**: English (`en`), Vietnamese (`vi`)
- **Language Storage**: Stored in `User.language` field and `NEXT_LOCALE` cookie
- **Language Switch**: Update both cookie and database, then reload page

**Language Switch Pattern:**

```tsx
const handleLanguageChange = async (locale: 'en' | 'vi') => {
	// Update cookie
	document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;

	// Update database
	await updateUserSettings({ language: locale });

	// Reload to apply changes
	window.location.reload();
};
```

### Translation Testing

1. **Manual Test**: Toggle language in UI and verify all text updates
2. **Console Check**: Ensure no missing key warnings in browser console
3. **Both Languages**: Verify UI looks correct in both English and Vietnamese
4. **Text Overflow**: Check that translated text doesn't break layouts (especially Vietnamese, which can be longer)
5. **RTL Support**: Currently not required, but be aware for future expansion
