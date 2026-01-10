# Evaluation: Study Session UX Redesign

**Date**: 2026-01-04
**Audience**: Product Owner / Engineering Lead
**Analyst**: Mary (Business Analyst Persona)

---

## 1. Executive Summary

The **Study Session UI/UX Redesign (v1.0)** is a **highly necessary and well-structured improvement** over the current implementation. It directly addresses the critical "layout breakage" issues caused by the *Related Words* feature and correctly identifies the "Responsive Gap" between mobile and desktop experiences.

The move to a **Progressive Disclosure** model aligns perfectly with the "Zen Mastery" philosophy of the WatashiWa project: *Focus on the card, reveal context on demand.*

**Verdict**: ✅ **APPROVED with Minor Refinements**

---

## 2. Gap Analysis: Plan vs. Current Implementation

I have reviewed the current codebase (`FlashCard.tsx`, `StandardFace.tsx`, `SessionController.tsx`) against the proposed plan.

| Feature | Current State (`src/...`) | Proposed Plan | Analyst Assessment |
| :--- | :--- | :--- | :--- |
| **Desktop Layout** | Single column, centered, max-width 600px. Unused screen real estate. | **2-Column Grid** (Card + Sidebar). Max-width 800px. | **New Requirement**. Critical for utilizing desktop space and preventing vertical scroll fatigue. |
| **Card Sizing** | Fixed `max-width: 600px`, `height: 65vh`. | **Responsive**: 800px (Desktop) / 600px (Mobile). `height: auto` on Desktop. | **Verification Needed**. `height: auto` on desktop needs a `max-height` (e.g., 80vh) to keep the "Happy Path" buttons above the fold. |
| **Related Words** | Appears below card (likely pushing content down). | **Sidebar (Desktop)** / **Bottom Sheet (Mobile)**. | **Excellent**. This is the correct pattern for auxiliary content. Solves the "Layout Shift" issue effectively. |
| **Example Section** | Always visible, "Speech Bubble" style. | **Collapsible**. Hidden by default on Mobile (configurable). | **High Value**. On mobile, the example often pushes the rating buttons off-screen. Collapsing is essential. |
| **Rating Buttons** | Basic shadow, flat colors. | **Polished**. Gradients, deeper shadows, better touch targets. | **UX Win**. Improves "Click Satisfaction" and reduces error rates on mobile. |

---

## 3. Risks & Considerations

### 3.1. Complexity of State Management

The plan introduces several new UI states:

- `isSidebarOpen` (Desktop)
- `isBottomSheetOpen` (Mobile)
- `isExampleCollapsed` (Persisted Preference)
- `isActionIconHovered`

**Risk**: Logic in `SessionController.tsx` is already complex (handling audio, timing, SRS, priming). Adding UI state directly there creates a "God Component".
**Mitigation**: The extraction of `StudySidebar.tsx` and `SubtleActionBar.tsx` is good, but ensuring the *state* is also cleanly managed (perhaps a `useStudyUI` hook) is crucial to keep `SessionController` readable.

### 3.2. The "Zen" Balance

The new "Subtle Action Bar" adds 5-6 icons (`Related`, `Confusions`, `Etymology`, `Examples`, `Comments`, `Report`).
**Risk**: Visual clutter. Even if "subtle", a row of 6 icons can look like a cockpit.
**Recommendation**: Group less frequent actions (Report, Etymology) into an overflow menu (`...`) or ensure they strictly *only* appear when data exists (as the plan suggests).

---

## 4. Recommendations & Refinements

### 4.1. "Related Words" Icon Choice

* **Current Plan**: `<LinkOutlined />`
- **Analyst Recommendation**: `<BranchesOutlined />` or `<NodeIndexOutlined />`.
- **Reasoning**: "Related Words" implies a semantic network or tree. A generic "Link" icon suggests an external URL. `BranchesOutlined` better conveys "Semantic Relationships".

### 4.2. Example Section Persistence

* **Question**: Should "Example expanded" be per-session or per-user?
- **Answer**: **Per-User (Persisted)**.
- **Reasoning**: Users typically have a preferred learning style. "Context-first" learners always want examples. "Recall-first" learners find them distracting. Forcing them to toggle every session (or every card) creates friction.

### 4.3. Sidebar Default Behavior

* **Question**: Auto-open sidebar on reveal?
- **Answer**: **Yes, but ONLY if there is content.**
- **Reasoning**: An empty sidebar opening is jarring. The logic should be: `if (showAnswer && (relatedWords.length > 0 || hasConfusions)) { setSidebar(true) }`.

### 4.4. Mobile Sheet Interaction

* **Tip**: Ensure the Bottom Sheet has a "snap point" at 50% height, but allows dragging to 90% for long lists of related words. Ant Design Mobile `Drawer` or specialized sheet libraries handle this better than a standard fixed-height drawer.

---

## 5. Implementation Strategy (The "Vertical Slice")

I recommend tackling this in **two distinct PRs** to avoid regression:

1. **Phase 1: Component Refactor & Polish**
    - Update `FlashCard` sizing logic.
    - Implement `CollapsibleSection` in `StandardFace`.
    - Polish `RatingBar` styling.
    - *Result*: Better UI, no layout structure change yet.

2. **Phase 2: Layout Restructuring**
    - Implement `StudySidebar` (Desktop) and `RelatedWordsSheet` (Mobile).
    - Refactor `SessionController` to use CSS Grid.
    - Move `RelatedWords` logic into the new containers.
    - *Result*: Full responsive layout.

---

## 6. Conclusion

The plan is mathematically sound and user-centric. Proceed with **Phase 1** immediately.
