# Kana Reference Tables – Implementation Plan

**Feature:** F-KANA-001  
**Doc:** [Feature spec](./kana-reference-tables.md)  
**Last Updated:** 2026-02-06

This document breaks implementation into **stages** with concrete **tasks** and **todo** checklists. Work in order; later stages depend on earlier ones.

---

## Module & File Structure (Target)

```
src/modules/kana-reference/
├── components/
│   ├── KanaReferencePage.tsx      # Client page wrapper (tabs, section, search)
│   ├── KanaTable.tsx               # Single table (grid) for one script + section
│   ├── KanaCell.tsx                # One cell: character, romaji, tap handlers
│   ├── KanaSearch.tsx              # Search input + clear
│   ├── ExampleWordPopover.tsx      # Popover with example word (Stage 4)
│   └── index.ts
├── data/
│   └── kanaData.ts                 # Gojūon + dakuten arrays (single source of truth)
├── hooks/
│   ├── useKanaSearch.ts            # Filter cells by query (Stage 3)
│   ├── useKanaAudio.ts             # Play TTS/audio for character (Stage 4)
│   └── useKanaPreferences.ts       # Persist audio/example prefs (Stage 4)
├── types.ts
├── constants.ts                    # Row/column labels, view modes
└── index.ts

src/app/reference/kana/
└── page.tsx                        # Thin server page → KanaReferencePage
```

---

## Stage 1: Foundation (Route, Data, Tables, Tabs)

**Goal:** User can open the page, see Hiragana and Katakana gojūon tables, and switch between them. No search, no dakuten yet.

### 1.1 Data & Types

- [x] **Task 1.1.1** – Create `src/modules/kana-reference/types.ts`
  - Define `KanaCell` (character, romaji, script: 'hiragana'|'katakana', section: 'basic'|'dakuten').
  - Define `KanaGrid` as 2D array or row-based structure for one script + section.
  - Export types used by data and components.

- [x] **Task 1.1.2** – Create `src/modules/kana-reference/data/kanaData.ts`
  - Implement **gojūon** for Hiragana (あ〜ん) and Katakana (ア〜ン) as single source of truth.
  - Use standard order: rows (—, K, S, T, N, H, M, Y, R, W), columns (a, i, u, e, o); empty slots for missing combinations (yi, ye, wi, we, wu).
  - Export `getHiraganaBasic()`, `getKatakanaBasic()` returning grid/cell arrays.
  - No API or DB; static data only.

- [x] **Task 1.1.3** – Create `src/modules/kana-reference/constants.ts`
  - Row headers (consonant labels), column headers (a,i,u,e,o).
  - Optional: view mode enum, section ids.

### 1.2 Route & Page

- [x] **Task 1.2.1** – Add route `src/app/reference/kana/page.tsx`
  - Thin server page: optional metadata (title, description); render client component.
  - Import and render `KanaReferencePage` from module.

- [x] **Task 1.2.2** – Add i18n keys for the page (en, vi)
  - Keys: page title, “Hiragana”, “Katakana”, “Kana Reference”, nav label if needed.
  - Use in page and layout as needed.

### 1.3 Components (Tables Only)

- [x] **Task 1.3.1** – Create `KanaCell.tsx`
  - Props: character, romaji, optional onClick, aria-label.
  - Render character (large), romaji (small, secondary).
  - Use theme tokens for text/background; hover/focus styles.
  - Semantic: button or div with role and keyboard handler if interactive.

- [x] **Task 1.3.2** – Create `KanaTable.tsx`
  - Props: cells/grid data, row headers, column headers, optional `highlightSet` (set of cell ids for later search).
  - Render `<table>` with `<th>` for headers, `<td>` with `KanaCell` per cell.
  - Use Ant Design `Table` or plain table with Ant Design Typography/Space; token-based styling.
  - Accessible: scope on th, id/headers if needed.

- [x] **Task 1.3.3** – Create `KanaReferencePage.tsx` (client)
  - State: activeTab = 'hiragana' | 'katakana'.
  - Use Ant Design `Tabs` or `Segmented` to switch between Hiragana and Katakana.
  - For each tab, render one `KanaTable` with gojūon data from `kanaData.ts`.
  - Layout: Flex/Grid; responsive (stack on small screens if needed).
  - `'use client'` at top.

- [x] **Task 1.3.4** – Barrel exports in `src/modules/kana-reference/components/index.ts` and `src/modules/kana-reference/index.ts`.

### 1.4 Design System & Responsiveness

- [x] **Task 1.4.1** – Ensure no hardcoded colors; use `theme.useToken()` or design tokens everywhere in KanaCell and KanaTable.
- [x] **Task 1.4.2** – Verify layout on narrow viewport (e.g. 375px): table readable, no horizontal overflow (scroll or responsive grid if needed).
- [x] **Task 1.4.3** – Verify dark theme: run app in dark mode; contrast and readability.

### Stage 1 Done When

- User can open `/reference/kana`, see Hiragana table by default, switch to Katakana tab, and see correct gojūon with romaji. No search, no dakuten, no copy/audio yet.

---

## Stage 2: Dakuten, URL State, Copy-to-Clipboard

**Goal:** Dakuten/handakuten tables, URL reflects tab/section, tap cell copies character and shows toast.

### 2.1 Data

- [ ] **Task 2.1.1** – Extend `kanaData.ts` with dakuten & handakuten
  - Hiragana: が〜ぽ (and ぱ-row).
  - Katakana: ガ〜ポ (and パ-row).
  - Export `getHiraganaDakuten()`, `getKatakanaDakuten()` (or single getter with section param).

### 2.2 Section Selector & URL

- [ ] **Task 2.2.1** – Add section state: `section = 'basic' | 'dakuten'`.
  - UI: Tabs or Segmented “Basic (Gojūon)” | “Dakuten & Handakuten” (per table or global).
  - When section is dakuten, render dakuten grid for current script (Hiragana or Katakana).

- [ ] **Task 2.2.2** – Sync state to URL (e.g. `nuqs` or router)
  - Query params: `table=hiragana|katakana`, `section=basic|dakuten`.
  - On load: read URL and set initial tab + section; on change update URL.
  - Invalid values fallback to default (e.g. hiragana, basic).

### 2.3 Copy & Toast

- [ ] **Task 2.3.1** – In `KanaCell` (or parent), on tap/click: copy character to clipboard via `navigator.clipboard.writeText(character)`.
  - On success: show Ant Design `message.success` or toast “Copied か” (use i18n).
  - On failure (e.g. permission): show “Copy not supported” or “Could not copy” (i18n).

- [ ] **Task 2.3.2** – Add i18n keys: “Copied {char}”, “Copy not supported”.

### Stage 2 Done When

- User can switch to Dakuten section and see が〜ぽ / ガ〜ポ. URL updates with tab and section. Tapping a cell copies the character and shows a toast.

---

## Stage 3: Search

**Goal:** Search input; typing filters/highlights cells by romaji or character; clear button restores full view.

### 3.1 Search Logic

- [ ] **Task 3.1.1** – Create `useKanaSearch.ts`
  - Input: query string, full cell list (or grid) for current view.
  - Output: set of cell identifiers (or filtered list) that match query.
  - Match rules: romaji (normalized, e.g. “ka” matches “ka”, “ga” if we include dakuten in search), and direct character match (e.g. “か”).
  - Normalize romaji (lowercase, strip spaces); handle partial match (e.g. “k” highlights all k-row).

- [ ] **Task 3.1.2** – Unit tests for `useKanaSearch` (or search function): “ka”, “か”, “shi”, “ji”, “”, no match.

### 3.2 UI

- [ ] **Task 3.2.1** – Create `KanaSearch.tsx`
  - Controlled input (value + onChange); placeholder from i18n (“Search by character or romaji…”).
  - Clear button (X) when query non-empty.
  - Accessible: label, aria-describedby if needed.

- [ ] **Task 3.2.2** – Integrate into `KanaReferencePage`
  - State: `searchQuery`; pass to `useKanaSearch`; get `highlightSet` (or filtered list).
  - Pass `highlightSet` to `KanaTable`; in `KanaTable`/`KanaCell`, apply highlight style (e.g. background token) for matching cells, dim or hide non-matching (configurable: prefer highlight-only for accessibility).
  - When no match: show inline message “No kana matching ‘xyz’. Try character or romaji.” (i18n).

- [ ] **Task 3.2.3** – i18n: search placeholder, “No kana matching …”, clear button tooltip.

### Stage 3 Done When

- User can type in search; matching cells highlight (or non-matching dim); clear restores full grid. No audio or example words yet.

---

## Stage 4: Audio & Example Words

**Goal:** Tap plays pronunciation; optional popover with one example word per character; user preferences (audio on/off, show examples on/off) persisted.

### 4.1 Audio

- [ ] **Task 4.1.1** – Create `useKanaAudio.ts`
  - Given a character (and optionally romaji), trigger TTS or play pre-recorded file.
  - Reuse app audio stack if one exists (e.g. `useAudioPlayer`, voice utils); otherwise use Web Speech API or agreed API.
  - Contract: `play(character: string, romaji?: string)`; return cleanup (e.g. abort if new play requested).
  - Only one playback at a time: new play stops previous.

- [ ] **Task 4.1.2** – Wire `KanaCell` (or table) so that on tap: copy (existing) + optional play. If play fails, show toast “Couldn’t play audio. Try again.” (i18n).

### 4.2 Example Words

- [ ] **Task 4.2.1** – Add example word data
  - In `kanaData.ts` or separate `exampleWords.ts`: map each kana (or key like “ka”) to one example word (e.g. { kana: “かぞく”, romaji: “kazoku”, meaning: “family” }).
  - Cover at least basic gojūon; dakuten optional for v1.

- [ ] **Task 4.2.2** – Create `ExampleWordPopover.tsx`
  - Props: visible, target (cell ref or position), character, example (word, romaji, meaning).
  - Use Ant Design `Popover`; on close, callback to parent.
  - i18n for “Example” or direct display of word + meaning.

- [ ] **Task 4.2.3** – In `KanaReferencePage` / `KanaCell`: when “Show example words” is on and user taps cell, after copy (and optional audio) show popover with example for that character.

### 4.3 Preferences

- [ ] **Task 4.3.1** – Create `useKanaPreferences.ts`
  - Read/write: “Play audio on tap” (boolean), “Show example words” (boolean).
  - Persist in localStorage (or user settings API if available); key e.g. `watashi-kana-prefs`.
  - Default: audio on, examples on (or per product decision).

- [ ] **Task 4.3.2** – Add toggles on page (or in a small settings dropdown): “Play audio on tap”, “Show example words”. Persist via `useKanaPreferences`.

### Stage 4 Done When

- Tapping a cell copies, optionally plays audio, and optionally shows one example word. User can turn audio and examples off; choice is persisted.

---

## Stage 5: Compare View, Polish, A11y & i18n Audit

**Goal:** Optional “Compare” view (Hiragana | Katakana | Romaji side-by-side); sticky headers if desired; full a11y and i18n pass.

### 5.1 Compare View

- [ ] **Task 5.1.1** – Add view mode: “Hiragana” | “Katakana” | “Compare”.
  - In Compare mode: one grid with columns per vowel; each cell shows Hiragana | Katakana | Romaji (or three columns per syllable).
  - Reuse same data and `KanaTable` with a variant prop, or new `KanaCompareTable.tsx` that consumes both scripts.

- [ ] **Task 5.1.2** – Search and URL work in Compare view (highlight both scripts; URL e.g. `view=compare`).

### 5.2 Sticky Headers (Optional)

- [ ] **Task 5.2.1** – If product wants sticky row/column headers on scroll, implement via CSS `position: sticky` on `<th>` and a scroll container, without breaking layout or a11y.

### 5.3 Accessibility Audit

- [ ] **Task 5.3.1** – Keyboard: Tab to search, then into table; arrow keys move between cells; Enter copies/plays; Escape closes popover. Document in feature doc if not already.
- [ ] **Task 5.3.2** – Screen reader: every cell has accessible name (“Hiragana か, romaji ka”); table has caption or aria-label.
- [ ] **Task 5.3.3** – Focus visible; no trap; reduced-motion respected (minimal or no animation if preferred).

### 5.4 i18n & Entry Point

- [ ] **Task 5.4.1** – Audit all user-facing strings: page title, tabs, section labels, search placeholder, toasts, popover, settings toggles. Ensure keys in en, vi, ja.
- [ ] **Task 5.4.2** – Add entry point: link from dashboard or main nav or footer to `/reference/kana` (per product decision). Use i18n for link text.

### 5.5 Tests & Docs

- [ ] **Task 5.5.1** – Unit tests: `kanaData` structure, search logic, preference read/write.
- [ ] **Task 5.5.2** – E2E (Playwright): open page, switch tab, search “ka”, tap cell and assert copy toast (and optional audio/popover if feasible).
- [ ] **Task 5.5.3** – Update [Feature spec](./kana-reference-tables.md) if any acceptance criteria changed; mark implementation plan stages done.

### Stage 5 Done When

- Compare view works; a11y and i18n are complete; entry link is in place; tests and docs are updated.

---

## Task Summary (Checklist)

| Stage | Tasks | Depends On |
|-------|--------|------------|
| **1** | 1.1.1–1.1.3, 1.2.1–1.2.2, 1.3.1–1.3.4, 1.4.1–1.4.3 | — |
| **2** | 2.1.1, 2.2.1–2.2.2, 2.3.1–2.3.2 | Stage 1 |
| **3** | 3.1.1–3.1.2, 3.2.1–3.2.3 | Stage 1 |
| **4** | 4.1.1–4.1.2, 4.2.1–4.2.3, 4.3.1–4.3.2 | Stage 1, 2 |
| **5** | 5.1.1–5.1.2, 5.2.1, 5.3.1–5.3.3, 5.4.1–5.4.2, 5.5.1–5.5.3 | Stages 1–4 |

---

## Quick Reference: Conventions

- **Components:** `src/modules/kana-reference/components/`.
- **Data:** Static in `kana-reference/data/kanaData.ts`; no Prisma.
- **Styling:** Ant Design + theme tokens only; no Tailwind.
- **i18n:** `useTranslations`; keys in `messages/{en,vi,ja}.json`.
- **State:** URL with `nuqs` (or Next.js router); preferences in `useKanaPreferences` (localStorage or user API).
