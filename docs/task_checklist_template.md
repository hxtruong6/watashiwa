# Task Implementation Checklist

> **Purpose**: A reusable checklist for any feature implementation. Use this template to ensure quality, consistency, and completeness across Product Design, UX, Frontend, and Backend perspectives.

---

## 0. Pre-Flight: Requirement Clarity

Before writing a single line of code, ensure the "Why" and "What" are crystal clear.

- [ ] **Problem Statement**: What user pain/need does this solve? (1-2 sentences)
- [ ] **Success Metric**: How do we know this is working? (e.g., "X% increase", "Error rate < Y%")
- [ ] **User Story**: `As a [user type], I want to [action], so that [benefit].`
- [ ] **Scope Boundaries**: What is explicitly OUT of scope for V1?
- [ ] **Dependencies**: List any blockers (API, design assets, schema changes).

---

## 1. Product & UX Design

### A. Design Thinking: Make It Meaningful

> **Principle**: Don't just show data. Create an *experience* that helps users achieve something.

- [ ] **User Goal**: What is the user trying to *achieve*? (Not "view data", but "feel confident they're progressing")
- [ ] **Value Proposition**: Why would the user *care* about this feature?
- [ ] **"So What?" Test**: For every piece of data displayed, ask: *"So what? What does this help the user do?"*
  - [ ] If data doesn't lead to an action or insight → consider removing it.
- [ ] **Emotional Design**: What should the user *feel* when using this?
  - [ ] Empowered? Calm? Motivated? Accomplished?
- [ ] **Modern & Elegant**: Is this design...
  - [ ] Visually clean and minimal (not cluttered)?
  - [ ] Using purposeful animations (not static or boring)?
  - [ ] Aesthetically aligned with the "Zen Mastery" philosophy?

### B. User Flow Analysis

- [ ] **Entry Point(s)**: How does the user get here? (URL, button, etc.)
- [ ] **Happy Path**: Document the ideal user journey (Step 1 → Step N → Success State).
- [ ] **Edge Cases**: What happens if...?
  - [ ] User has no data / first-time user?
  - [ ] User has too much data (performance)?
  - [ ] User loses connection mid-action?
  - [ ] User is not authorized?
- [ ] **Exit Points**: Where can the user go from here? (Close, Navigate Away, Complete)

### C. Wireframe / Mockup Review

- [ ] **Desktop Layout**: Reviewed and approved.
- [ ] **Tablet Layout**: Responsiveness checked.
- [ ] **Mobile Layout (Primary)**: Touch targets > 44px? Thumb Zone respected?
- [ ] **States Covered**:
  - [ ] Empty State (No data)
  - [ ] Loading State (Skeleton / Spinner)
  - [ ] Error State (Toast / Inline error)
  - [ ] Success State (Celebration / Confirmation)
  - [ ] Disabled State (Inactive buttons)

### D. Micro-interactions & Feedback

- [ ] **Hover/Focus States**: Defined for interactive elements.
- [ ] **Transitions**: Smooth (>200ms, ease-out). No jarring cuts.
- [ ] **Haptics/Sound**: Applicable? (e.g., Rating feedback, completion ping)

---

## 2. UI Implementation (Frontend)

### A. Component Design

- [ ] **Component Breakdown**: List new components (`ComponentName.tsx`).
  - Format: `src/components/[Feature]/[ComponentName].tsx`
- [ ] **Props Interface**: All props have explicit TypeScript interfaces. No `any`.
- [ ] **Reusability**: Is this component reusable, or feature-specific? (Aim for reusable.)

### B. Styling & Theming

- [ ] **Ant Design First**: Uses AntD components (`Flex`, `Row`, `Col`, `Typography`, `Card`, etc.).
- [ ] **Theme Tokens**: No hardcoded colors. Uses `themeConfig.ts` tokens.
- [ ] **Dark Mode**: Component renders correctly in both Light and Dark themes.
- [ ] **No Custom CSS**: Avoids `.css`/`.scss` files. Uses inline `style={{}}` or `createStyles` if needed.

### C. Responsiveness & Accessibility

- [ ] **Mobile First**: CSS/Layout designed for mobile, then scaled up.
- [ ] **Breakpoint Testing**: Checked on iPhone SE (375px), iPhone 12 Pro (390px), iPad (768px), Desktop (1200px+).
- [ ] **A11y Basics**:
  - [ ] Semantic HTML (`<button>`, `<nav>`, etc.)
  - [ ] `aria-label` on icon-only buttons.
  - [ ] Keyboard navigation works (Tab, Enter, Space).
  - [ ] Focus indicator visible.
  - [ ] Color contrast > 4.5:1.

### D. Internationalization (i18n)

- [ ] **All User-Facing Text**: Uses `useTranslations` hook from `next-intl`.
- [ ] **Keys Added**: New keys added to `messages/en.json` AND `messages/vi.json`.
- [ ] **No Hardcoded Strings**: Double-checked for stray English text.

---

## 3. Data & State Management

### A. Client-Side State

- [ ] **Local State (`useState`)**: For component-scoped, ephemeral data.
- [ ] **Global State (`Zustand`)**: For cross-component, shared state.
- [ ] **Optimistic UI**: Immediate feedback before server confirmation (where applicable).

### B. Server-Side Data (Server Actions / API Routes)

- [ ] **Action Created**: New server action in `src/services/actions.ts` or relevant file.
- [ ] **Input Validation**: Zod schema defined and applied.
  - [ ] Schema Name: `[Name]Schema`
  - [ ] Schema File: `src/services/schemas.ts` (or co-located)
- [ ] **Error Handling**: All actions wrapped in `try/catch`. Returns `{ success, error?, data? }`.
- [ ] **Authorization Check**: Action verifies user session/role (e.g., `getServerAuthSession`).

### C. Database (Prisma)

- [ ] **Schema Change?** Is `prisma/schema.prisma` updated?
  - [ ] If yes: `pnpm prisma migrate dev --name [migration_name]` run.
  - [ ] If yes: `pnpm prisma generate` run.
- [ ] **Query Efficiency**: Uses `select` / `include` to fetch only needed fields.
- [ ] **Indexes**: Check if new queries need DB indexes for performance.

---

## 4. Logic & Integration

### A. Business Logic

- [ ] **Core Logic Location**: Complex logic extracted to `src/lib/[feature].ts` or a dedicated hook.
- [ ] **Domain-Specific Rules**: Feature-specific algorithms or validations are documented with JSDoc comments.

### B. API/External Services

- [ ] **API Keys**: Uses environment variables (`.env`). No exposed secrets.
- [ ] **Error Handling**: Graceful fallback for external service failure.

---

## 5. Testing & Verification

### A. Manual Testing (Minimum)

- [ ] **Happy Path**: Works as expected.
- [ ] **All States**: Empty, Loading, Error, Success states verified.
- [ ] **Responsiveness**: Tested on Mobile (Chrome DevTools / Real Device).
- [ ] **Cross-Browser**: Chrome, Safari (if applicable).

### B. Linting & Types

- [ ] **`pnpm lint`**: No errors.
- [ ] **`pnpm typecheck`**: No TypeScript errors.
- [ ] **`pnpm build`**: Build succeeds without warnings.

### C. Regression Check

- [ ] **Related Features**: Did this break anything nearby?
- [ ] **Existing E2E/Unit Tests**: Still passing?

---

## 6. Polish & Cleanup

- [ ] **Console Logs**: All `console.log` removed.
- [ ] **Dead Code**: No commented-out code blocks left.
- [ ] **TODOs Resolved**: No outstanding `// TODO` comments related to this task.
- [ ] **Documentation Updated**: If API/schema changed, update relevant docs in `docs/`.

---

## 7. Pre-Merge Checklist

- [ ] **Self Code Review**: I have reviewed my own diff for obvious errors.
- [ ] **Feature Flag (if applicable)**: Feature is behind a flag if it's experimental.
- [ ] **Final Build**: `pnpm build` passes on the final commit.
- [ ] **PR Description**: Clear problem statement, solution summary, and testing steps.

---

## Quick Reference: Common File Locations

| Item | Location |
| :--- | :--- |
| Components | `src/components/[Feature]/[Name].tsx` |
| Pages | `src/app/[route]/page.tsx` |
| Hooks | `src/hooks/use[Name].ts` |
| Server Actions | `src/services/actions.ts` or `src/services/[feature]-actions.ts` |
| Zod Schemas | `src/services/schemas.ts` (or co-located) |
| Theme Config | `src/lib/theme/themeConfig.ts` |
| Translations (EN) | `messages/en.json` |
| Translations (VI) | `messages/vi.json` |
| Prisma Schema | `prisma/schema.prisma` |
| Feature Docs | `docs/features/[feature_name].md` |

---

## Tips from the Trenches (15 Years Experience)

- **Product Design**: If the user can't understand the feature in 3 seconds, the design has failed. Simplify.
- **UX**: Always design for the error state first. A graceful error is remembered; a broken one is too.
- **Frontend**: The best code is code you don't write. Before creating a component, check if AntD already has one.
- **Backend**: Trust no input. Validate everything. The client is not your friend.
- **General**: Ship the smallest thing that works, then iterate. Perfection is the enemy of shipped.
