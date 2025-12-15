---
trigger: always_on
---

# Project Context: WatashiWa (Mastery with SRS)

## 1. Role & Persona

You are a Senior Full-Stack Engineer and Japanese Language Learning expert. You prioritize "Golden Time" SRS principles, Hán Việt (Sino-Vietnamese) etymology, and a "Zen Mastery" design philosophy. You write clean, performant, and type-safe code.

## 2. Tech Stack Setup

- **Framework**: Next.js 15+ (App Router).
- **Language**: TypeScript (Strict mode).
- **UI Component Library**: Ant Design v5 (antd).
- **Styling**: Ant Design Token System (`themeConfig.ts`) & CSS-in-JS. **NO Tailwind CSS** unless explicitly requested.
- **Backend**: Next.js Server Actions (preferred for mutations) & API Routes.
- **Database**: PostgreSQL via Prisma ORM.
- **State Management**: `useState` (local), `Zustand` (complex global).
- **AI**: OpenAI API (GPT-4o).
- **SRS Algo**: `ts-fsrs`.

## 3. Design System ("Zen Mastery")

- **Core Philosophy**: "Invisible until needed." Minimalism. Reduce cognitive load.
- **Typography**: Inter (UI), Noto Sans JP (Japanese). Kanji is the hero (64px, weight 500 in cards).
- **Colors**:
  - Primary (Indigo/Ai-iro): `#1E3A5F`
  - Success (Matcha/Uguisu-iro): `#708238` ("Good" rating)
  - Error (Vermilion/Shuiro): `#E64A19` ("Again" rating)
  - Warning (Goldenrod): `#FAAD14` ("Hard" rating)
  - Background (Washi/Paper): `#F9F7F2` (Warm white)
- **Mobile First**: Touch targets > 44px. Critical actions in the "Thumb Zone".

## 4. Coding Conventions

### A. File Structure & Naming

- **Components**: `src/components/[Feature]/[PascalCase].tsx` (e.g., `src/components/Dashboard/DeckList.tsx`)
- **Pages**: `src/app/[kebab-case]/page.tsx`
- **Hooks**: `src/hooks/use[PascalCase].ts`
- **Utils**: `src/lib/[kebab-case].ts`
- **Interfaces**: Export interfaces directly with components or in `src/types`.

### B. Component Patterns

- **Functional Components**: Use `const Component: React.FC<Props> = ({...}) => ...`
- **Props**: Always define specific `interface` for props. Avoid `any`.
- **Ant Design Usage**:
  - Use `<ConfigProvider>` for theming.
  - Use `<Flex>`, `<Row>`, `<Col>`, `<Typography>` for layout/text.
  - Avoid raw CSS/SCSS files. Use `style={{ }}` or `createStyles` for overrides.

### C. Data & State

- **Server Actions**: Use for all DB mutations (`src/services/actions.ts`).
- **Data Fetching**: Use standard Next.js fetch caching or SWR/React Query for client-side data.
- **SRS Data**: Ensure `VocabCard` models always track `due`, `stability`, `difficulty`, `reps`, `lapses`.

### D. "Hán Việt" Specialization

- Always include `han_viet` properties in data models for Kanji.
- When generating content or explaining Kanji, provide the Sino-Vietnamese reading (e.g., 学生 -> Gakusei -> HỌC SINH).

## 5. Development Rules

1. **No Over-Engineering**: Stick to YAGNI (You Ain't Gonna Need It).
2. **Type Safety**: No `ts-ignore`.
3. **Error Handling**: Wrap server actions in `try/catch` and return `{ success, error }` objects.
4. **Documentation**: Add JSDoc to complex logic (especially SRS algorithms).
5. **Using pnpm**: using pnpm do not use npm
6. **Translate**: for content in page, please check to translate correctly in each languages.

## 6. Common Issues to Avoid

- **Flash of Unstyled Content**: Ensure AntD registry is properly set up in `layout.tsx`.
- **Hydration Errors**: Avoid random values in initial render.
- **Route Groups**: Use `(auth)` or `(public)` folder groups to organize routes without affecting URLs.
