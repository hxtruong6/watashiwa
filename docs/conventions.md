# Codebase Conventions

## 1. File Structure

- **Components:** `src/components/[Feature]/[Name].tsx`
- **Pages:** `src/app/[route]/page.tsx`
- **Hooks:** `src/hooks/use[Name].ts`
- **Utilities:** `src/lib/[name].ts`

## 2. Naming

- **Files:** `kebab-case.ts` (e.g., `srs-algorithm.ts`)
- **Components:** `PascalCase.tsx` (e.g., `VocabCard.tsx`)
- **Functions/Vars:** `camelCase`

## 3. Tech Specifics

- **Ant Design:** Use standard Ant Design components. Customize via `ConfigProvider` in `theme/themeConfig.ts`.
- **Styling:** Avoid custom CSS files. Use Ant Design's token system or inline styles/`style` prop for one-offs if absolutely necessary, or `created-style` (css-in-js).
- **Types:** Explicit interfaces for all Props. `interface VocabCardProps { ... }`.
- **State:** Use `useState` for local, `Zustand` (if complex) or React Context for global.
- **Async:** Use `async/await`. Wrap DB calls in `try/catch`.

## 4. Documentation

- Add JSDoc comments to complex algorithms (like the SRS logic).
- Keep `spec` files updated if requirements change.
