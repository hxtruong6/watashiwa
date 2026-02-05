# FEATURE: Hiragana & Katakana Reference Tables

**Product:** WatashiWa - Memory-First Japanese Learning App  
**Feature ID:** F-KANA-001  
**Status:** 📋 SPECIFICATION  
**Priority:** HIGH (Learning Foundation)  
**Module:** `src/modules/kana-reference/`  
**Last Updated:** 2026-02-06  
**Related Docs:** [Design System](../design_system.md) | [Implementation Plan](./kana-reference-tables-implementation-plan.md)

---

## 1. Executive Summary

### 1.1 Purpose

A **production-ready Kana Reference** provides two comprehensive tables (Hiragana and Katakana) so learners can quickly look up any character, hear pronunciation, copy to clipboard, and optionally see example words—all inside WatashiWa without leaving the app.

### 1.2 Goals

| Goal | Description |
|------|-------------|
| **Quick check** | User finds a kana character or its romaji in &lt; 10 seconds. |
| **Learning support** | User can hear pronunciation and see one example word per character. |
| **Consistency** | UI follows Zen Mastery design system; works in light/dark theme and on mobile/desktop. |
| **Accessibility** | Screen-reader friendly, keyboard navigable, WCAG AA contrast. |

### 1.3 Out of Scope

- SRS integration (e.g. “mark as learned”) is a future phase; not required for production v1.
- Stroke-order animation or handwriting practice.
- Quiz or self-test mode (may be added later).

---

## 2. Problem Statement & User Needs

### 2.1 Problem

- Learners often need to confirm “what is this character?” or “how do I read this?” during study or reading.
- Today they leave the app (e.g. Google, Jisho) or rely on memory, which breaks flow and slows learning.
- There is no in-app, always-available kana reference that is fast, clear, and consistent with WatashiWa.

### 2.2 User Needs

| Need | Rationale |
|------|------------|
| See all Hiragana and Katakana in standard order | Matches textbook/class order; easy to scan. |
| See romaji for every character | Essential for beginners and quick recall. |
| Switch between Hiragana and Katakana quickly | One tap; no page reload. |
| Include dakuten and handakuten | Complete reference (が〜ぽ, ガ〜ポ). |
| Search by character or romaji | Find “ka” or “か” without scanning the grid. |
| Copy character to clipboard | Paste into notes, messages, or other apps. |
| Hear pronunciation (TTS) | Reinforce sound–symbol link. |
| Optional example word per character | Context without clutter. |
| Use on phone and desktop | Same experience; responsive layout. |
| Works in dark mode | Respect system/theme preference. |

---

## 3. User Personas

### 3.1 Primary: Beginner (Aya)

- **Profile:** Just started Japanese; knows a few kana, often forgets.
- **Goal:** Quickly check “what is this?” and “how do I read it?” during lessons or when reading.
- **Behaviors:** Uses phone most; prefers large tap targets and clear romaji; may use audio to confirm pronunciation.

### 3.2 Secondary: Intermediate (Ken)

- **Profile:** Knows most kana; occasionally forgets dakuten or rare combinations.
- **Goal:** Quick confirmation without leaving the app; sometimes copies character for notes.
- **Behaviors:** Uses search or direct grid scan; may toggle to “dakuten” section only.

### 3.3 Tertiary: Reference User (Mai)

- **Profile:** Teacher or self-learner; uses app as a clean reference.
- **Goal:** Reliable, complete table for teaching or quick lookup; side-by-side Hiragana/Katakana helpful.
- **Behaviors:** Desktop and tablet; keyboard navigation and copy matter.

---

## 4. User Journey

### 4.1 Journey Map: Quick Lookup (Primary)

| Step | User action | System response | User feeling |
|------|-------------|-----------------|--------------|
| 1 | User is in app (dashboard, deck, or study). | — | Focused |
| 2 | User taps “Kana Reference” (nav, dashboard link, or footer). | Navigate to `/reference/kana` (or agreed route). | Oriented |
| 3 | Page loads; default view: Hiragana table (gojūon). | Table visible with headers (a,i,u,e,o) and rows; each cell shows kana + romaji. | Confident |
| 4 | User scans or uses search. | If search used: filter/highlight matching cells. | Efficient |
| 5 | User finds character (e.g. ね). | Cell clearly shows ね and “ne”. | Satisfied |
| 6 | (Optional) User taps cell. | Copy to clipboard + optional toast; optional audio plays; optional popover with example word. | Accomplished |
| 7 | User switches to Katakana tab. | Katakana table shown (same structure). | In control |
| 8 | User leaves (back or another nav). | No data loss; return later to same tab/section if we persist in URL. | No friction |

### 4.2 Journey Map: Search-Driven Lookup

| Step | User action | System response | User feeling |
|------|-------------|-----------------|--------------|
| 1 | User on Kana Reference page. | — | — |
| 2 | User types “ka” in search. | Grid filters or highlights: か, カ, が, ガ (and other “ka” matches). | Focused |
| 3 | User refines to “ga” or selects “dakuten” section. | Only が row or dakuten section visible/highlighted. | Precise |
| 4 | User taps が. | Copy + optional audio + optional example “がっこう”. | Satisfied |

### 4.3 Journey Map: Learning With Audio & Example

| Step | User action | System response | User feeling |
|------|-------------|-----------------|--------------|
| 1 | User on Kana Reference, Hiragana. | — | — |
| 2 | User taps き. | Audio plays “ki”; small popover shows example word (e.g. きく). | Reinforced |
| 3 | User taps “Play” again on same or another cell. | Audio plays (previous stops if needed). | In control |
| 4 | User toggles to “Show example words” off. | Popover no longer shown on tap; audio still works. | Preference respected |

### 4.4 Journey Map: Side-by-Side Comparison

| Step | User action | System response | User feeling |
|------|-------------|-----------------|--------------|
| 1 | User selects “Compare” or “Both” view. | Single grid: columns show Hiragana | Katakana | Romaji for same syllable. | Clear |
| 2 | User scrolls or searches. | Same filtering works; comparison stays aligned. | Efficient |

---

## 5. User Scenarios

### 5.1 Happy Path Scenarios

**S1 – First-time visit, Hiragana only**

- User opens Kana Reference from dashboard.
- Sees Hiragana gojūon table with clear headers and romaji.
- Scrolls to find む; taps cell; character is copied and toast “Copied む” appears.
- Success: quick check completed without leaving the app.

**S2 – Search by romaji**

- User types “shi” in search.
- All cells containing し, シ, じ, ジ are highlighted or listed.
- User taps じ; copies and optionally hears audio.
- Success: found character in &lt; 10 seconds.

**S3 – Search by character**

- User types “ね” (or pastes it).
- ね (Hiragana) and ネ (Katakana) are highlighted; romaji “ne” visible.
- Success: confirmed reading and counterpart.

**S4 – Dakuten / Handakuten**

- User opens “Dakuten & Handakuten” section (tab or toggle).
- Sees が〜ぽ (Hiragana) and ガ〜ポ (Katakana) in same grid structure.
- Finds ぷ; taps; copies and hears “pu”.
- Success: complete reference including modified kana.

**S5 – Audio playback**

- User taps あ.
- Audio plays “a” (TTS or pre-recorded).
- User taps い; previous stops, new plays.
- Success: clear pronunciation reinforcement.

**S6 – Example word (optional)**

- User has “Show example words” enabled; taps か.
- Small popover shows e.g. “かぞく (kazoku) – family”.
- User can close or tap to copy example.
- Success: context without clutter.

**S7 – Responsive / mobile**

- User on phone; opens Kana Reference.
- Table fits viewport (scroll or responsive grid); tap targets ≥ 44px.
- User switches Hiragana ↔ Katakana via tabs; uses search.
- Success: same functionality, no horizontal overflow hell.

**S8 – Dark mode**

- User has dark theme enabled.
- Kana Reference uses theme tokens; contrast and readability match design system.
- Success: comfortable in dark mode.

### 5.2 Alternative Paths

**A1 – User only wants Katakana**

- Lands on page; immediately taps “Katakana” tab.
- Only Katakana table is used; no need to see Hiragana.
- Success: minimal steps to goal.

**A2 – User wants both at once**

- User selects “Compare” / “Both” view.
- Single grid shows Hiragana | Katakana | Romaji per syllable.
- Success: comparison without switching tabs.

**A3 – User turns off audio**

- In settings or on-page toggle, user disables “Play audio on tap”.
- Tapping cell only copies (and optional example); no sound.
- Success: preference respected (e.g. quiet environment).

### 5.3 Edge & Error Scenarios

**E1 – Search has no match**

- User types “xyz”.
- Message: “No kana matching ‘xyz’. Try a character (e.g. あ) or romaji (e.g. a).”
- Grid remains visible; user can clear search and try again.

**E2 – Audio fails (TTS error or network)**

- User taps cell; audio requested but fails.
- Toast: “Couldn’t play audio. Try again.” No crash; copy still works.

**E3 – Clipboard unavailable (e.g. some browsers)**

- Copy fails (e.g. clipboard API denied).
- Toast: “Copy not supported in this context.” Character still visible; user can manually select.

**E4 – First load (slow network)**

- Table shows skeleton or loading state.
- When data is ready (static data), table renders; no infinite loading.

**E5 – Empty or invalid URL state**

- If we use `?table=katakana&section=dakuten` and value is invalid, fallback to default (e.g. Hiragana, gojūon).
- No blank or broken view.

### 5.4 Accessibility Scenarios

**Acc1 – Screen reader**

- User navigates table with screen reader.
- Each cell is announced (e.g. “Hiragana か, romaji ka”).
- Headers (row/column) are associated so table structure is clear.

**Acc2 – Keyboard only**

- User tabs to table; arrow keys move between cells.
- Enter copies and/or triggers audio; Escape closes popover.
- Focus visible; no trap.

**Acc3 – Reduced motion**

- If user prefers reduced motion, avoid unnecessary animations; transitions minimal or none.

---

## 6. Functional Requirements (Production)

### 6.1 Content & Data

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Display **Hiragana gojūon** (あ〜ん) in standard grid: rows by consonant, columns a/i/u/e/o. | P0 |
| FR-2 | Display **Katakana gojūon** (ア〜ン) in same structure. | P0 |
| FR-3 | Display **Hiragana dakuten & handakuten** (が〜ぽ). | P0 |
| FR-4 | Display **Katakana dakuten & handakuten** (ガ〜ポ). | P0 |
| FR-5 | Every cell shows **character** (large) and **romaji** (small, secondary). | P0 |
| FR-6 | Empty cells for standard gaps (e.g. yi, ye, wi, we, wu) or clearly marked “—”. | P1 |
| FR-7 | Row headers: consonant group (e.g. —, K, S, T, N, H, M, Y, R, W). Column headers: a, i, u, e, o. | P0 |

### 6.2 Navigation & View

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-8 | **Tab or segmented control:** “Hiragana” | “Katakana” to switch table. | P0 |
| FR-9 | **Section selector:** “Basic (Gojūon)” | “Dakuten & Handakuten” (per table or global). | P0 |
| FR-10 | **View mode (optional):** “Hiragana only” | “Katakana only” | “Compare (both)”. | P1 |
| FR-11 | URL reflects state (e.g. `?table=katakana&section=dakuten`) for share/bookmark. | P1 |
| FR-12 | Sticky or fixed row/column headers on scroll (optional, for large viewport). | P2 |

### 6.3 Search & Filter

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-13 | **Search input:** user can type romaji (e.g. “ka”) or character (e.g. “か”). | P0 |
| FR-14 | Matching cells are **highlighted**; non-matching dimmed or hidden (configurable). | P0 |
| FR-15 | Search is **instant** (client-side); no server round-trip. | P0 |
| FR-16 | Clear search button; clearing restores full grid. | P1 |
| FR-17 | Search works in both Hiragana and Katakana (and Compare view if present). | P0 |

### 6.4 Actions on Cell

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-18 | **Tap/click cell:** copy character to clipboard. | P0 |
| FR-19 | **Toast feedback:** “Copied か” (or localized). | P0 |
| FR-20 | **Optional audio:** tap plays pronunciation (TTS or pre-recorded). | P0 |
| FR-21 | Only one audio plays at a time; new tap stops previous. | P1 |
| FR-22 | **Optional example word:** popover with one word using that kana (e.g. か → かぞく). | P1 |
| FR-23 | User preference (or page toggle): “Play audio on tap” and “Show example words” persist (e.g. localStorage or user settings). | P1 |

### 6.5 Visual & Theming

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-24 | Use **Ant Design** components and **theme tokens** only (no hardcoded colors). | P0 |
| FR-25 | **Light and dark theme** supported; contrast and readability meet design system. | P0 |
| FR-26 | Kana typography: large, readable font; romaji smaller, secondary (e.g. italic, tertiary color). | P0 |
| FR-27 | Grid has clear borders or spacing; cells have hover/focus state. | P0 |

### 6.6 Responsiveness & A11y

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-28 | **Responsive:** usable on mobile (e.g. 320px), tablet, desktop; no horizontal overflow. | P0 |
| FR-29 | Touch targets ≥ 44px on touch devices. | P0 |
| FR-30 | **Semantic table:** `<table>` with `<th>` or `role="grid"` with proper labels. | P0 |
| FR-31 | **Keyboard:** Tab into table; arrow keys move focus; Enter copies/plays. | P0 |
| FR-32 | **Screen reader:** each cell has accessible name (e.g. “Hiragana か, romaji ka”). | P0 |
| FR-33 | Focus indicator visible; no focus trap. | P0 |
| FR-34 | Color contrast ≥ WCAG AA. | P0 |

### 6.7 Internationalization & Entry

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-35 | All UI strings via **next-intl** (en, vi, ja). | P0 |
| FR-36 | **Entry point:** route `/reference/kana` (or product-agreed path). | P0 |
| FR-37 | Link from dashboard, main nav, or footer (per product decision). | P1 |

---

## 7. Non-Functional Requirements

| ID | NFR | Target |
|----|-----|--------|
| NFR-1 | **Performance** | Table and search respond in &lt; 100ms (client-side data). |
| NFR-2 | **Availability** | No server dependency for table content; works offline if app supports it. |
| NFR-3 | **Maintainability** | Kana data in one source of truth (e.g. JSON or constant); easy to fix typos. |
| NFR-4 | **Testability** | Grid and search logic unit-testable; key flows covered by E2E. |

---

## 8. Acceptance Criteria (Summary)

- [ ] User can open Kana Reference from the app and see Hiragana gojūon by default.
- [ ] User can switch to Katakana and to Dakuten/Handakuten sections.
- [ ] User can search by romaji or character and see matching cells highlighted.
- [ ] User can tap a cell to copy character and see toast; optional audio and example word work.
- [ ] Layout is responsive; touch targets ≥ 44px; works in light and dark theme.
- [ ] Table is keyboard navigable and screen-reader friendly.
- [ ] All copy and UI strings are localized (en, vi, ja).
- [ ] Edge cases (no search match, audio failure, copy failure) show clear feedback without crash.

---

## 9. Implementation Approach

Implementation is split into **stages** to allow incremental delivery and testing. Each stage is specified in the [Implementation Plan](./kana-reference-tables-implementation-plan.md) with tasks, file locations, and dependencies.

| Stage | Focus | Outcome |
|-------|--------|---------|
| **Stage 1** | Foundation | Route, module shell, static data, two tables (Hiragana + Katakana gojūon), tabs, theme. |
| **Stage 2** | Dakuten, URL, copy | Dakuten/handakuten grids, URL state, copy-to-clipboard + toast. |
| **Stage 3** | Search | Search input, client-side filter/highlight, clear. |
| **Stage 4** | Audio & examples | TTS (or audio) on tap, example words, preferences. |
| **Stage 5** | Compare view & polish | Side-by-side view, sticky headers (optional), A11y and i18n audit. |

---

## 10. References

- [Design System](../design_system.md) – Tokens, components, dark mode.
- [Task Checklist](../task_checklist_template.md) – Quality checklist per task.
- [Kana Reference Implementation Plan](./kana-reference-tables-implementation-plan.md) – Stages and task list.
