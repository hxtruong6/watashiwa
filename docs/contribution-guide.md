# Contribution Guide

**Generated:** 2025-12-29T19:51:25Z

## Project Conventions

- Follow the Vertical Slice module organization under `src/modules/` (feature-first).
- Keep Next.js route files (`src/app/**/page.tsx`) thin; push logic into modules.
- Prefer Ant Design components and theme tokens; avoid Tailwind.

## Local Commands

- **Dev:** `pnpm dev`
- **Lint:** `pnpm lint`
- **Typecheck:** `pnpm type-check`
- **Unit tests:** `pnpm test`
- **E2E:** `pnpm e2e`

## Formatting

- **Format:** `pnpm format`
- **Check format:** `pnpm check-format`
