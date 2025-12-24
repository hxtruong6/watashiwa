# V1 EXECUTION PLAN: The "Trojan Horse" Sprint (MASTER DOC)

> **Status:** COMPLETED (Sprint 1 Architecture)
> **Replaces:** `phase1_revised_sprint1.md`, `phase1_execution_plan.md`
> **Strategy:** "Sprint 1 UI" on top of "Product V2 Schema"
> **Objective:** Build the *permanent* frontend architecture and data structures now, but feed them with *static/simple* seed data for this milestone.

---

## 1. THE CORE CONTRADICTION & RESOLUTION

* **The Conflict:** Sprint 1 wants simple "flashcard" UI. Product V2 wants complex "Intervention" logic.
* **The Resolution:** We build the **Complex Types** (Schema) now, but only implement the **Simple Renderers** (UI) for the "Standard" variant.
* **The Rule:** NO "Mock" types. The TypeScript interfaces must match the final Postgres JSONB structure perfectly.

---

## 2. TECHNICAL SPECIFICATIONS (The "Holy Schema")

These types MUST align with `prisma/schema.prisma`.

### 2.1 The Vocabulary Anchor (Permanent)

Matches `model Vocabulary` in Prisma.

```typescript
export interface Vocabulary {
  id: string;
  term: string;           // Maps to `wordSurface`
  reading: string;        // Maps to `wordReading`
  meaning: string;        // Extracted from `meanings` JSON for display
  
  // V2 SMART LAYER FIELDS (Confirmed in Prisma)
  pitch_pattern: number;  // @map("pitch_pattern")
  pitch_svg: string;      // @map("pitch_svg_path")
  homonym_group_id?: string;
  
  // JSONB Rich Data (Validated by Zod at runtime)
  han_viet: {             // Maps to `hanViet` string or parsed if needed
    chars: string;        
    breakdown: string[];  
  };
  
  // FIXED: Matches Prisma `mnemonic` (Singular)
  mnemonic: {             
    en: string;           
    vi: string;
    image_url?: string;
  };
}
```

### 2.2 The Card Variant (The "Chameleon")

**Concept:** This is a *Hybrid Type*. It combines:

1. `Vocabulary` data (Content)
2. `CardVariant` data (Specific Face instructions)
3. `UserReview` data (SRS State)

The Frontend receives this hydrated object, not raw DB rows.

```typescript
// The Discriminated Union
export type SmartCard = 
  | StandardCard 
  | GapFillCard     // (Future V2, but defined now)
  | InterventionCard; // (Future V2, but defined now)

export interface CardBase {
  id: string;             // Session Item ID
  vocab_id: string;
  next_review: Date;
  srs_stage: number;      // 0-3
}

export interface StandardCard extends CardBase {
  type: 'STANDARD';       // Maps to Prisma VariantType.BASIC
  front: {
    term: string;
    audio: string;
  };
  back: {
    meaning: string;
    han_viet: string;
    usage_example: string;
  };
}

// DEFINED BUT UNUSED IN SPRINT 1
export interface GapFillCard extends CardBase {
  type: 'GAP_FILL';       // Maps to Prisma VariantType.CONTEXT_GAP_FILL
  content: {
    sentence_cloze: string; // "Tôi là [___]"
    options: string[];
  };
}
```

---

## 3. FILE STRUCTURE & ARCHITECTURE

We will set up the permanent folder structure immediately.

```text
src/modules/flashcard/
├── components/
│   ├── CardShell/
│   │   ├── index.tsx          # The "Switcher" (Renders StandardFace for now)
│   │   ├── StandardFace.tsx   # The Sprint 1 UI
│   │   └── CardGestures.tsx   # Framer Motion Logic (Swipe)
│   ├── Session/
│   │   ├── SessionContainer.tsx # The "Zen" Layout
│   │   └── SessionSummary.tsx
├── store/
│   └── useSessionStore.ts     # Zustand (Queue Management)
├── services/
│   └── stub-srs.ts            # The "Dummy Brain" (Linear Queue for now)
└── types.ts                   # The "Holy Schema"
```

---

## 4. IMPLEMENTATION CHECKLIST

### Phase 4.1: The Foundation (Types & Data)

1. [x] **Create `types.ts`**: Define the strict `Vocabulary` and `SmartCard` union types.
    * *Constraint:* Ensure `mnemonic` matches Prisma.
2. [x] **Create Seed Data**: strictly typed `data/seed/unit1_v2.json` (using `docs/data_sample.json`).
3. [x] **Mock Service**: `fetchSession()` server action that reads the JSON and returns `SmartCard[]`.

### Phase 4.2: The "Zen" UI (The Card)

1. [x] **CardShell**: Implement the 3D flip container with `framer-motion`.
2. [x] **Faces**: Build `StandardFace` (Front/Back) using the Design System tokens (Typography, Colors).
3. [x] **Swipe Logic**: Implement the threshold checks (Right=Green, Left=Indigo).

### Phase 4.3: The State Loop

1. [x] **Store**: Setup Zustand to hold the array of `SmartCard`.
2. [x] **Transition**: Handle the "Next Card" animation (Exit/Enter).
3. [x] **Refinement**: Tune the timing variables (0.4s flip, spring stiffness).

---

## 5. WHY THIS MODIFICATION?

* **Strategist:** We get the "Zen" feel immediately to test retention.
* **Engineer:** We don't write throwaway code because the interfaces (`SmartCard`) are V2-ready. When V2 comes, we just add `GapFillFace.tsx` and the rest of the app already supports it.
* **UX Researcher:** We get real interactions, not a database view.
