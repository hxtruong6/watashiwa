# Styles Architecture

This directory contains modular CSS partials that follow the ITCSS (Inverted Triangle CSS) methodology for scalable, maintainable styles.

## File Structure

The styles are organized into logical partials, each with a specific responsibility:

### `_variables.css`

**Design Tokens** - CSS Custom Properties (design system values)

- Color tokens (background, foreground, etc.)
- Spacing scale
- Breakpoints
- Transitions
- Z-index scale
- Synced with Ant Design tokens in `src/lib/theme/themeConfig.ts`

### `_reset.css`

**Reset & Base Styles** - Normalize/reset styles for consistent cross-browser rendering

- HTML/body reset
- Custom scrollbar styles
- Base body styles

### `_utilities.css`

**Global Utility Classes** - Only truly global utilities used across multiple components

- `.app-main` - Main app container
- `.hover-target` / `.hover-trigger` - Hover visibility utilities
- Navigation responsive utilities
- **Note:** Component-specific styles should use CSS Modules (`.module.css`)

### `_animations.css`

**Animation Keyframes** - Global animations used across the application

- `spin` - Spinner animation
- `fadeIn` - Fade in animation
- `slideUp` - Slide up animation
- `gentlePulse` - Gentle pulse effect
- `gradientDrift` - Gradient drift animation
- `breathingGlow` - Breathing glow effect
- **Note:** Component-specific animations should be in CSS Modules

### `_accessibility.css`

**Accessibility Rules** - Respects user preferences and ensures accessible interactions

- `prefers-reduced-motion` media query
- Ant Design popup exclusions (critical for dropdown functionality)
- Reference: <https://www.a11yproject.com/posts/understanding-vestibular-disorders/>

### `_third-party.css`

**Third-Party Overrides** - Isolated styles for third-party integrations

- Sentry feedback widget customization
- Keep separate to avoid conflicts with our design system

## Import Order

The partials are imported in `src/app/layout.tsx` in this specific order (ITCSS methodology):

1. `_variables.css` - Settings (design tokens)
2. `_reset.css` - Generic (reset/normalize)
3. `_utilities.css` - Objects (utility classes)
4. `_animations.css` - Components (animations)
5. `_accessibility.css` - Trumps (overrides)
6. `_third-party.css` - Third-party (external overrides)

**Important:** The import order matters for CSS cascade. Do not auto-sort these imports.

## ITCSS Best Practices

Based on [ITCSS methodology by Harry Roberts](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture), here are the key principles we follow:

### 1. Adjust ITCSS to Your Needs

ITCSS is flexible and doesn't require all layers to be present. Our current implementation focuses on:

- **Settings** (`_variables.css`) - Design tokens
- **Generic** (`_reset.css`) - Reset/normalize
- **Objects/Utilities** (`_utilities.css`) - Global utility classes
- **Components** - Handled via CSS Modules (not in global styles)
- **Trumps** (`_accessibility.css`, `_third-party.css`) - Overrides

We've omitted the **Tools** layer (mixins/functions) since we're using plain CSS, and **Elements** layer since Ant Design handles base element styling.

### 2. Use One File Per Component

Store each component's styles in its own CSS Module file. Do not mix styles from different components:

```css
/* ❌ Don't do this */
.gallery {}
.gallery__image {}
.title {}
```

```css
/* ✅ Do this - separate files */
/* NavBar.module.css */
.navContainer {}
.navItem {}

/* Title.module.css */
.title {}
```

### 3. Limit Nesting to 2 Levels

Avoid deep nesting. Flat structure with full selectors is often easier to scan and search:

```css
/* ✅ Good - flat structure */
.teaser {
  padding: 2em;
}

.teaser--small {
  padding: 1em;
}

.teaser__title {
  font-size: 2em;
}

/* ❌ Avoid - deep nesting */
.teaser {
  padding: 2em;
  
  &--small {
    padding: 1em;
    
    &__title {
      font-size: 2em;
    }
  }
}
```

### 4. Separate Spacing System from Components

Margin breaks component encapsulation. A well-built component should not affect anything outside itself.

**Solution:** Use utility classes for spacing or wrapper components:

```css
/* ✅ Good - spacing utilities */
.spacing-sm { margin: var(--spacing-sm); }
.spacing-md { margin: var(--spacing-md); }
.spacing-lg { margin: var(--spacing-lg); }
```

```tsx
/* ✅ Good - wrapper component */
<Space size="large">
  <MyComponent />
</Space>
```

### 5. Don't Worry About Style Repetition

Don't abstract too many styles into shared objects. It's easier to update a style repeated in a few independent components than to track down a chain of abstracted styles.

**Rule of thumb:** Only abstract when a pattern is used in 5+ components.

### 6. Avoid Overusing Objects

Objects (the `.o-` prefix in BEMIT) can be confusing. In our architecture:

- We use **utilities** for truly global, reusable patterns
- We use **CSS Modules** for component-specific styles
- We avoid the "Objects" layer to prevent style conflicts

If you need reusable patterns, prefer:

1. CSS Modules with composition
2. Utility classes (like spacing utilities)
3. Ant Design components

### 7. Maintain Healthy Specificity Graph

ITCSS helps avoid "Specificity Wars" by organizing styles from low-specificity to high-specificity:

1. **Settings** - No CSS output
2. **Generic** - Low specificity (element selectors)
3. **Objects/Utilities** - Medium specificity (class selectors)
4. **Components** - Higher specificity (CSS Modules)
5. **Trumps** - Highest specificity (overrides with `!important`)

## Best Practices

### When to Use Global Styles vs CSS Modules

**Use Global Styles (this directory):**

- Design tokens (variables)
- Reset/normalize styles
- Truly global utilities (used in 3+ components)
- Global animations
- Accessibility rules
- Third-party overrides

**Use CSS Modules (`.module.css`):**

- Component-specific styles
- Feature-specific utilities
- Component-specific animations
- Styles that should be scoped to a single component

### Example: CSS Module Usage

```typescript
// src/modules/ui/components/NavBar.tsx
import styles from './NavBar.module.css';

<div className={styles.navContainer}>...</div>
```

```css
/* src/modules/ui/components/NavBar.module.css */
.navContainer {
 background: var(--color-background);
}
```

## Design Tokens

CSS Custom Properties are defined in `_variables.css` and should be used instead of hard-coded values:

```css
/* ✅ Good */
.component {
 color: var(--color-foreground);
 padding: var(--spacing-md);
 transition: var(--transition-base);
}

/* ❌ Bad */
.component {
 color: #2d2d2d;
 padding: 16px;
 transition: 0.3s ease;
}
```

## Syncing with Ant Design

Design tokens should be synced with Ant Design theme configuration in `src/lib/theme/themeConfig.ts`. When updating colors or spacing, update both files to maintain consistency.

## Naming Conventions

While we use CSS Modules for component scoping, if you need to add global utility classes, consider using BEMIT naming conventions:

- `.c-*` - Components (though we prefer CSS Modules)
- `.o-*` - Objects (reusable patterns - use sparingly)
- `.u-*` - Utilities (helper classes)
- `.js-*` - JavaScript hooks (no styling)
- `.is-*` / `.has-*` - State classes

**Example:**

```css
/* Global utility class */
.u-text-center {
  text-align: center;
}

.u-margin-top-lg {
  margin-top: var(--spacing-lg);
}
```

## Migration Notes

- Legacy variable names (`--background`, `--foreground`) are maintained for backward compatibility
- All styles from `src/app/globals.css` have been migrated to these partials
- The old `globals.css` file is now empty with a reference comment

## Resources

- [ITCSS: Scalable and Maintainable CSS Architecture](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture) - Comprehensive guide by Xfive
- [CSS Wizardry by Harry Roberts](https://csswizardry.com/) - Creator of ITCSS
- [BEMIT: Taking the BEM Naming Convention a Step Further](https://csswizardry.com/2015/08/bemit-taking-the-bem-naming-convention-a-step-further/) - Naming conventions
- [Understanding ITCSS](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture) - Real-world implementation examples
