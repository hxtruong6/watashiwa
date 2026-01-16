# Product Requirements Document: Origami Knowledge Graph

**Feature Name:** Origami - Interactive Kanji-Word Knowledge Graph  
**Version:** 1.0  
**Last Updated:** 2026-01-16  
**Status:** Draft for Implementation  
**Owner:** Product Team  
**Stakeholders:** Engineering, UX Design, Content Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas & Stories](#4-user-personas--stories)
5. [Feature Specifications](#5-feature-specifications)
6. [User Experience Design](#6-user-experience-design)
7. [Technical Architecture](#7-technical-architecture)
8. [Data Model & Schema](#8-data-model--schema)
9. [Integration Requirements](#9-integration-requirements)
10. [Implementation Phases](#10-implementation-phases)
11. [Success Metrics & Analytics](#11-success-metrics--analytics)
12. [Risks & Mitigations](#12-risks--mitigations)
13. [Open Questions & Future Considerations](#13-open-questions--future-considerations)

---

## 1. Executive Summary

**Origami** is an interactive knowledge graph visualization feature that helps Japanese learners understand the relationships between words and their component kanji. Unlike traditional dictionary lookups that show isolated entries, Origami reveals the "constellation" of linguistic connections, making the structure of the Japanese language visible and explorable.

### Core Value Proposition

- **For Learners:** Transform abstract kanji relationships into visual, intuitive connections
- **For WatashiWa:** Differentiate from competitors with unique, engaging learning experience
- **For Retention:** Create "aha moments" that increase engagement and reduce churn

### Key Features (MVP)

1. **Dynamic Expansion Graph**: Just-in-time node expansion centered on user's current word
2. **Reading-Aware Edges**: Visual distinction between On'yomi/Kun'yomi connections
3. **JLPT-Filtered Exploration**: Context-aware vocabulary based on user's proficiency level
4. **Origami Fold Theme**: Culturally-resonant UI with paper-craft aesthetics
5. **Seamless Flashcard Integration**: One-click addition to existing SRS system

---

## 2. Problem Statement

### Current Pain Points

**Problem 1: Kanji Opacity**  
Users encounter the same kanji in different words but cannot understand why it sounds different (e.g., `生` as "SEI" in `先生` vs "IKI" in `生きる`). This creates confusion and slows vocabulary acquisition.

**Problem 2: Isolated Learning**  
Traditional flashcard systems teach words in isolation. Users miss the opportunity to learn related vocabulary clusters, leading to inefficient study patterns.

**Problem 3: Level-Inappropriate Discovery**  
When users explore kanji dictionaries, they encounter N1-level words while studying N5, creating cognitive overload and discouragement.

**Problem 4: Lack of Visual Context**  
The Japanese writing system is inherently visual, but current tools present it in text-heavy formats that don't leverage spatial memory and visual pattern recognition.

### Why Now?

- **Market Timing**: Graph-based learning interfaces are gaining traction (Obsidian, Roam Research)
- **Technical Feasibility**: Modern web technologies (React Flow, D3) make complex visualizations performant on mobile
- **User Demand**: Top feature request from beta testers: "Show me related words"
- **Competitive Differentiation**: No major Japanese learning app offers interactive knowledge graphs

---

## 3. Goals & Success Metrics

### Business Goals

| Goal                          | Target                   | Timeline             | Priority |
| ----------------------------- | ------------------------ | -------------------- | -------- |
| **Increase DAU Engagement**   | +25% time-in-app         | 3 months post-launch | P0       |
| **Reduce Week-2 Churn**       | -15% drop-off rate       | 2 months post-launch | P0       |
| **Drive Premium Conversions** | +10% free-to-paid        | 4 months post-launch | P1       |
| **Viral Growth**              | 5% share rate for graphs | 6 months post-launch | P2       |

### User Goals

1. **Understanding**: "I want to know why this kanji sounds different in different words"
2. **Discovery**: "I want to find related vocabulary to what I'm currently learning"
3. **Efficiency**: "I want to learn word families together instead of individually"
4. **Confidence**: "I want to see my progress as a growing network of knowledge"

### Success Metrics (AARRR Framework)

**Activation**

- 60% of new users interact with Origami within first session
- 40% expand at least 3 nodes in first interaction

**Engagement**

- Average 8 node expansions per study session
- 30% of flashcard additions come via Origami
- Average session duration increases by 3+ minutes

**Retention**

- 70% of users who use Origami return within 7 days
- 50% use Origami in 3+ study sessions per week

**Revenue** (Premium Feature Gating)

- 15% of free users encounter premium fold limits
- 20% conversion rate from paywall encounter to upgrade

**Referral**

- 3% of Origami interactions result in social share
- Shared graphs drive 5+ new signups per month

---

## 4. User Personas & Stories

### Primary Persona: **"Akira the Autodidact"**

**Demographics:**

- Age: 25-34
- Occupation: Software Engineer / Knowledge Worker
- Learning Level: N4-N3
- Study Time: 30-45 min/day
- Tech-Savvy: High

**Motivations:**

- Self-improvement enthusiast
- Loves visualizing systems and connections
- Prefers understanding "why" over rote memorization
- Enjoys gamification and progress tracking

**Pain Points:**

- Frustrated by kanji inconsistencies
- Gets bored with repetitive drills
- Wants to optimize learning efficiency

**User Stories:**

```
As Akira, I want to...
1. See which other words use the same kanji as my current flashcard
   So that I can learn related vocabulary in context

2. Understand why a kanji has different readings in different words
   So that I can predict readings for new words I encounter

3. Explore vocabulary at my current JLPT level
   So that I'm not overwhelmed by advanced words

4. Save interesting word clusters to my flashcard deck
   So that I can review them in my daily SRS sessions

5. Track which "kanji constellations" I've explored
   So that I can visualize my learning progress
```

### Secondary Persona: **"Yuki the Casual Learner"**

**Demographics:**

- Age: 18-24
- Occupation: Student / Creative Professional
- Learning Level: N5-N4
- Study Time: 10-20 min/day
- Tech-Savvy: Medium

**Motivations:**

- Learning for anime/manga/travel
- Prefers fun, visual learning experiences
- Short attention span, needs engaging UI
- Mobile-first user

**Pain Points:**

- Easily discouraged by complexity
- Struggles with abstract grammar explanations
- Needs frequent "wins" to stay motivated

**User Stories:**

```
As Yuki, I want to...
1. Play with a beautiful, tactile interface
   So that studying feels like a game, not work

2. See instant visual feedback when I explore
   So that I feel rewarded for curiosity

3. Earn badges for discovering new word connections
   So that I feel accomplished and want to continue

4. Share cool word graphs on social media
   So that I can show off my progress to friends
```

---

## 5. Feature Specifications

### 5.1 Core Features (MVP)

#### Feature A: Dynamic Constellation Graph

**Description:**  
A just-in-time, expandable graph where nodes represent words/kanji and edges represent compositional relationships.

**Requirements:**

**FR-A1: Initial Load State**

- **GIVEN** user navigates to Origami from a word (e.g., from flashcard review)
- **WHEN** the graph loads
- **THEN** display:
  - Center node: Source word (e.g., `先生`) - Large, primary color
  - Child nodes: Component kanji (e.g., `先`, `生`) - Medium, secondary color
  - Edges: Labeled with active reading (e.g., "SEI") - Color-coded by reading type
- **AND** center the graph viewport on the source word
- **AND** display subtle pulse animation on expandable nodes

**FR-A2: Node Expansion**

- **GIVEN** a kanji node with additional relationships
- **WHEN** user taps/clicks the node
- **THEN**:
  - Re-center graph on selected node (smooth transition)
  - Expand up to 6 related words containing that kanji
  - Animate new nodes appearing (fold animation)
  - Update edges with appropriate reading labels
  - Maintain context: Keep parent word visible but demoted visually
- **AND** if node has >6 related words, show "View More" indicator
- **CONSTRAINT**: Expansion limited to 3 levels deep to prevent performance issues

**FR-A3: Node Collapse**

- **GIVEN** an expanded node
- **WHEN** user double-taps/right-clicks and selects "Collapse"
- **THEN**:
  - Remove child branches with reverse fold animation
  - Re-center graph on previous context
  - Preserve user's exploration history (back button)

**FR-A4: Graph Navigation**

- **Support**:
  - Pan: Click-drag (desktop) / Touch-drag (mobile)
  - Zoom: Mouse wheel / Pinch gesture
  - Re-center: Double-click background / "Reset View" button
- **CONSTRAINT**: Clamp zoom between 0.5x and 2.0x
- **CONSTRAINT**: Limit graph canvas to viewport + 200px buffer for performance

**FR-A5: Performance Constraints**

- Maximum 50 nodes rendered simultaneously
- Lazy-load node details (fetch on expansion, not on initial load)
- Debounce expansion requests (500ms) to prevent rapid-fire API calls
- Use Web Workers for graph layout calculations

---

#### Feature B: Reading-Aware Edges

**Description:**  
Edges between kanji and words display the specific reading (On'yomi/Kun'yomi) used in that context, solving the "why does it sound different" problem.

**Requirements:**

**FR-B1: Edge Visual Encoding**

- **On'yomi Reading**:
  - Style: Solid line
  - Color: Blue (#1890FF - Ant Design primary blue)
  - Label: Uppercase romaji (e.g., "SEI")
- **Kun'yomi Reading**:
  - Style: Dashed line
  - Color: Pink (#EB2F96 - Ant Design magenta)
  - Label: Lowercase romaji (e.g., "iki")
- **Special/Irregular Reading**:
  - Style: Dotted line
  - Color: Orange (#FA8C16 - Ant Design orange)
  - Label: "Irregular"

**FR-B2: Edge Interaction**

- **GIVEN** user hovers over (desktop) or taps (mobile) an edge
- **THEN** display tooltip with:
  - Reading type label (e.g., "On'yomi (Chinese Reading)")
  - Romanized reading
  - Hiragana reading (e.g., せい)
  - Example sentence using this reading
- **AND** highlight the edge with glow effect
- **AND** optionally play pronunciation audio

**FR-B3: Reading Type Legend**

- Display persistent legend in corner of graph:
  - Visual key for On'yomi, Kun'yomi, Irregular
  - Toggleable via settings
  - Collapsible on mobile

---

#### Feature C: JLPT-Filtered Exploration

**Description:**  
The graph dynamically filters vocabulary based on user's proficiency level, preventing cognitive overload and ensuring relevance.

**Requirements:**

**FR-C1: Level Detection**

- **AUTO**: Infer from user's current flashcard deck settings
- **MANUAL**: Allow override via dropdown in graph header
- **DEFAULT**: If no level set, default to N5

**FR-C2: Node Filtering Logic**

- **GIVEN** user expands a kanji node
- **WHEN** fetching related words
- **THEN** query `WHERE word.jlpt_level >= user.current_level`
  - Example: N4 user sees N4 and N5 words, but NOT N3/N2/N1
- **AND** if no words match filter, display "No words at your level" message
- **AND** optionally show count of filtered words (e.g., "+12 advanced words hidden")

**FR-C3: Progressive Reveal (Premium Feature)**

- **FREE TIER**: Hard filter (advanced words completely hidden)
- **PREMIUM TIER**: Show shadowed nodes for advanced words with "Unlock Preview" label
- **INTERACTION**: Tapping shadowed node shows tooltip: "This is an N2 word. Keep learning to unlock!"
- **GAMIFICATION**: Track when user levels up and "unlocks" previously shadowed nodes

**FR-C4: Level Override**

- **GIVEN** premium user wants to explore advanced vocabulary
- **WHEN** user toggles "Show All Levels" switch in settings
- **THEN**:
  - Display all vocabulary regardless of level
  - Add level badges to nodes (e.g., "N2" tag)
  - Warn user: "You're exploring advanced content"

---

#### Feature D: Origami Fold Theme

**Description:**  
A culturally-resonant visual theme that transforms the graph into an interactive paper-folding experience.

**Requirements:**

**FR-D1: Visual Aesthetic**

- **Background**: Subtle washi paper texture overlay (opacity: 15%)
- **Color Palette**: Pastel gradients
  - Primary: Soft blue (#E6F7FF)
  - Secondary: Pale pink (#FFF0F6)
  - Accent: Light yellow (#FFFBE6)
- **Typography**: Use Noto Sans JP (already in WatashiWa)
- **Shadows**: Soft, layered shadows to simulate paper depth

**FR-D2: Node Shape Differentiation**

- **Word Nodes**:
  - Shape: Rounded rectangle (pill shape)
  - Size: 120px x 60px (desktop), 100px x 50px (mobile)
  - Icon: Origami crane silhouette (SVG)
  - Border: 2px solid with subtle gradient
- **Kanji Nodes**:
  - Shape: Square with slight rotation (3-5 degrees for dynamism)
  - Size: 80px x 80px (desktop), 60px x 60px (mobile)
  - Icon: Origami boat/frog silhouette
  - Border: 3px solid (more substantial than words)

**FR-D3: Fold Animations**

- **Expansion Animation** (500ms):
  - CSS transform: rotateY(0deg) → rotateY(90deg) → rotateY(0deg)
  - Easing: cubic-bezier(0.68, -0.55, 0.265, 1.55) (bounce effect)
  - Accompany with subtle scale up (0.8 → 1.0)
- **Collapse Animation** (400ms):
  - Reverse fold: rotateY(0deg) → rotateY(-90deg) → scale(0)
- **Hover Animation** (desktop):
  - Lift effect: translateY(-2px) + box-shadow increase
  - Slight tilt: rotate(2deg)

**FR-D4: Sound Design (Optional, Toggleable)**

- **Expand**: Soft crinkle sound (200ms, .mp3)
- **Collapse**: Gentle whoosh (150ms)
- **Hover**: Subtle paper rustle (100ms)
- **Settings**: Master toggle for all sounds
- **Constraint**: Preload audio files, max 50KB total

**FR-D5: Haptic Feedback (Mobile)**

- **Light impact**: On node tap
- **Medium impact**: On expansion
- **Selection feedback**: On "Add to Flashcards"
- **Constraint**: Use navigator.vibrate API with fallback

---

#### Feature E: Flashcard Integration

**Description:**  
Seamless one-click workflow to add discovered words to user's existing SRS flashcard system.

**Requirements:**

**FR-E1: Add to Deck Action**

- **GIVEN** user views any word node details
- **WHEN** user clicks "Add to Flashcards" button
- **THEN**:
  - Call existing `createFlashcard` server action
  - Pass word data (kanji, reading, meaning)
  - Show success animation (paper crane flying to deck icon)
  - Display toast notification: "Added to [Deck Name]"
  - Update button state: "Added ✓" (disabled)
- **AND** if word already exists in deck, show "Already in deck"

**FR-E2: Bulk Add**

- **GIVEN** user has expanded multiple branches
- **WHEN** user selects multiple nodes (checkbox mode) and clicks "Add All"
- **THEN**:
  - Batch create flashcards for selected words
  - Show progress indicator during creation
  - Display summary: "Added 5 words to Daily Review"
  - Animate selected nodes with confirmation effect

**FR-E3: Context Preservation**

- **REQUIREMENT**: When creating flashcard, include graph context in metadata
- **DATA**: Store `discovered_via: "origami_graph", source_word: "先生", kanji_context: "先"`
- **PURPOSE**: Future analytics on which discovery paths are most effective

**FR-E4: Deck Selection**

- **DEFAULT**: Add to user's active deck
- **OPTION**: Show deck picker modal for power users
- **CONSTRAINT**: Reuse existing `DeckSelector` component from flashcard module

---

### 5.2 Secondary Features (Post-MVP)

#### Feature F: Gamification Layer

**FR-F1: Badge System**

- **Badges**:
  - "Crane Crafter": Expand 10 nodes
  - "Origami Master": Expand 50 nodes
  - "Explorer": Discover 5 new kanji connections
  - "Completionist": Fill all branches of a kanji
- **Display**: Floating paper scroll widget (bottom-right)
- **Storage**: Persist in `user_achievements` table

**FR-F2: Progress Visualization**

- **Concept**: "Origami Gallery" showing user's explored graph over time
- **Visualization**: Heat map of kanji nodes (brighter = more explored)
- **Shareable**: Export as PNG for social media

#### Feature G: Advanced Exploration

**FR-G1: Search Integration**

- Add search bar to graph header
- Auto-suggest words as user types
- On selection, re-center graph and expand

**FR-G2: Path Finding**

- "Show me the connection between X and Y" feature
- Highlight path through graph with animation

**FR-G3: Custom Annotations**

- Allow users to add personal notes to nodes
- Sync with flashcard notes

---

## 6. User Experience Design

### 6.1 Mobile Experience (Primary Platform)

#### Layout: Portrait Mode

```
┌─────────────────────────────────────┐
│  ← Back    Origami    ⋮ Menu        │ ← Header (60px)
├─────────────────────────────────────┤
│                                     │
│       [Canvas - Full Viewport]      │
│                                     │
│          (先生)                     │
│         /      \                    │
│        /        \                   │
│      (先)       (生)                │
│                                     │
│   [Legend]  [Level: N4 ▼]          │ ← Floating Controls
│                                     │
├─────────────────────────────────────┤
│  [Bottom Sheet - Swipe Up]          │ ← Node Details (Hidden by default)
│  ┌───────────────────────────────┐ │
│  │ ⎯  Node: 先                   │ │
│  │ Meaning: Ahead, future         │ │
│  │ ⏵ Play Pronunciation           │ │
│  │ [Add to Flashcards] 🏮         │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Key Interactions:**

- **Tap Node**: Select + show bottom sheet (animated slide-up)
- **Double Tap Node**: Expand/collapse (with fold animation)
- **Pinch**: Zoom canvas
- **Drag**: Pan canvas
- **Swipe Down on Sheet**: Dismiss details
- **Long Press Node**: Quick-add to flashcards (skip details sheet)

#### Responsive Breakpoints

| Breakpoint | Width          | Layout Adjustments                  |
| ---------- | -------------- | ----------------------------------- |
| Mobile S   | 320px - 480px  | Single column, compact nodes (60px) |
| Mobile M   | 481px - 768px  | Standard mobile layout (80px nodes) |
| Tablet     | 769px - 1024px | Side-by-side sheet (40% width)      |
| Desktop    | 1025px+        | Split view (graph 70%, sidebar 30%) |

---

### 6.2 Desktop Experience

#### Layout: Widescreen

```
┌───────────────────────────────────────────────────────────────────┐
│  WatashiWa Logo    Origami     [Search Bar]      [User Menu]      │
├─────────────────────────────────┬─────────────────────────────────┤
│                                 │  Node Details                   │
│   [Graph Canvas 70%]            │  ─────────────                  │
│                                 │                                 │
│         (先生)                  │  先 (Kanji)                     │
│        /      \                 │  Meaning: Ahead, future         │
│       /        \                │                                 │
│     (先)       (生)             │  On'yomi: SEN                   │
│     / | \       / | \           │  Kun'yomi: saki                 │
│   (...branches...)              │                                 │
│                                 │  [Stroke Order Animation]       │
│  [Zoom: - +]  [Reset]  [Share] │                                 │
│  [Legend]  [Level Filter]       │  Related Words:                 │
│                                 │  • 先月 (Last month)            │
│                                 │  • 先輩 (Senior)                │
│                                 │  • 先週 (Last week)             │
│                                 │                                 │
│                                 │  [Add to Flashcards]            │
│                                 │  [Explore from this Kanji]      │
└─────────────────────────────────┴─────────────────────────────────┘
```

**Key Interactions:**

- **Click Node**: Select + update sidebar instantly
- **Double Click Node**: Expand/collapse
- **Hover Node**: Show quick preview tooltip
- **Right Click Node**: Context menu (Add to deck, Collapse, etc.)
- **Drag Node**: Reposition (optional: save custom layout)
- **Keyboard Shortcuts**:
  - `F`: Expand focused node
  - `C`: Collapse focused node
  - `A`: Add to flashcards
  - `Z`: Zoom to fit
  - `Esc`: Close details

---

### 6.3 Design System Integration

#### Component Mapping to Ant Design v6

| Origami Component          | Ant Design Component              | Customizations                |
| -------------------------- | --------------------------------- | ----------------------------- |
| Graph Canvas               | Custom (React Flow)               | Apply theme tokens            |
| Details Panel              | Drawer (mobile) / Sider (desktop) | Origami styling               |
| Node Card                  | Card                              | Custom border-radius, shadows |
| "Add to Flashcards" Button | Button (primary)                  | Custom crane icon             |
| Level Filter               | Select                            | Compact size                  |
| Legend                     | Collapse                          | Collapsible panel             |
| Toast Notifications        | Message                           | Themed colors                 |
| Loading State              | Skeleton                          | Custom paper texture          |

#### Theme Tokens (Extend Ant Design ConfigProvider)

```typescript
{
  token: {
    colorPrimary: '#1890FF', // Keep existing primary
    colorBgLayout: '#FAFAFA', // Light paper background
    borderRadius: 12, // Softer corners for origami feel
    fontFamily: 'Noto Sans JP, -apple-system, sans-serif',
  },
  components: {
    Card: {
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)', // Paper lift effect
      borderRadiusLG: 16,
    },
    Button: {
      primaryShadow: '0 4px 12px rgba(24,144,255,0.2)', // Origami button depth
    },
  },
}
```

---

### 6.4 Accessibility Requirements

**WCAG 2.1 Level AA Compliance**

**AC-1: Keyboard Navigation**

- All nodes focusable via Tab key
- Enter to expand, Escape to collapse
- Arrow keys to navigate between nodes
- Skip to main content link

**AC-2: Screen Reader Support**

- Semantic HTML: `<nav>`, `<main>`, `<article>` for regions
- ARIA labels for graph nodes: `aria-label="Word: sensei (teacher)"`
- Live regions for dynamic updates: `aria-live="polite"` on expansions
- Graph described as: `role="region"` with `aria-label="Word relationship graph"`

**AC-3: Visual Accessibility**

- Color contrast ratio ≥ 4.5:1 (text) and ≥ 3:1 (UI components)
- Do not rely solely on color: Use shapes + labels + line styles
- Support prefers-reduced-motion: Disable fold animations if set
- Focus indicators: 2px solid outline on focused nodes

**AC-4: Mobile Accessibility**

- Touch targets minimum 44x44px (nodes exceed this)
- Support voice control (iOS Voice Control / Android TalkBack)
- Haptic feedback as alternative to sound

**AC-5: Internationalization**

- Support en, vi, ja locales (existing WatashiWa languages)
- RTL support (future Arabic/Hebrew learners)
- Number formatting via i18n (JLPT levels)

---

## 7. Technical Architecture

### 7.1 Technology Stack Alignment

**Adherence to WatashiWa Standards:**

| Layer                | Technology                        | Rationale                                  |
| -------------------- | --------------------------------- | ------------------------------------------ |
| **Framework**        | Next.js 16+ App Router            | Server Components for initial data fetch   |
| **Architecture**     | Vertical Slice (modules/origami/) | Feature-first organization                 |
| **UI Library**       | Ant Design v6 + React Flow        | AntD for controls, React Flow for graph    |
| **State Management** | Zustand                           | Graph state (nodes, edges, viewport)       |
| **Styling**          | CSS Modules                       | Scoped styles for custom nodes/edges       |
| **Data Fetching**    | Server Actions                    | Actions for expand, search, etc.           |
| **Database**         | PostgreSQL + Prisma               | Leverage existing connection               |
| **Language**         | TypeScript 5.x (Strict)           | Full type safety for graph data structures |

---

### 7.2 Module Structure (Vertical Slice)

```
src/modules/origami/
├── components/
│   ├── OrigamiCanvas.tsx          # Main graph container (Client Component)
│   ├── nodes/
│   │   ├── WordNode.tsx           # Custom word node (crane shape)
│   │   ├── KanjiNode.tsx          # Custom kanji node (boat/frog shape)
│   │   └── NodeDetailsSheet.tsx   # Mobile bottom sheet / Desktop sidebar
│   ├── edges/
│   │   └── ReadingEdge.tsx        # Custom edge with reading label
│   ├── controls/
│   │   ├── LevelFilter.tsx        # JLPT level dropdown
│   │   ├── GraphLegend.tsx        # Reading type legend
│   │   └── GraphControls.tsx      # Zoom, reset, etc.
│   └── OrigamiLayout.tsx          # Page wrapper (Server Component)
│
├── hooks/
│   ├── useGraphState.ts           # Zustand store for graph data
│   ├── useNodeExpansion.ts        # Logic for expanding nodes
│   └── useGraphLayout.ts          # D3-force simulation logic
│
├── actions.ts                     # Server Actions (expand, search, addToFlashcard)
├── services.ts                    # Business logic (graph traversal, filtering)
├── data.ts                        # Prisma queries (fetch words, kanji, relationships)
├── types.ts                       # TypeScript types (GraphNode, GraphEdge, etc.)
├── utils.ts                       # Helper functions (layout calculations)
└── constants.ts                   # Config (MAX_NODES, COLORS, etc.)
```

**Anti-Monolith Compliance:**

- Page component (`app/origami/[word]/page.tsx`) fetches initial data only
- All graph logic in `useGraphState` hook (keep `OrigamiCanvas.tsx` under 200 lines)
- Server Actions orchestrate services + data layers
- No direct Prisma calls from components

---

### 7.3 Data Flow Architecture

**Server-Side Rendering (Initial Load):**

```
User Navigation → page.tsx (Server Component)
                      ↓
                  fetchInitialGraph(word)  [Server Action]
                      ↓
                  services.buildGraph()
                      ↓
                  data.getWordWithKanji()  [Prisma]
                      ↓
                  Return: { nodes, edges }
                      ↓
                  Pass to <OrigamiCanvas> (Client Component)
```

**Client-Side Expansion (User Interaction):**

```
User Taps Node → useNodeExpansion.expand(kanjiId)
                      ↓
                  actions.expandKanjiNode(kanjiId, userLevel)  [Server Action]
                      ↓
                  services.getRelatedWords(kanjiId, levelFilter)
                      ↓
                  data.queryWordsByKanji(kanjiId, level)  [Prisma]
                      ↓
                  Return: { newNodes, newEdges }
                      ↓
                  Update Zustand store → React Flow re-renders
```

**Caching Strategy:**

- Initial graph data: Server Component cache (60s stale-while-revalidate)
- Expanded nodes: Store in Zustand + localStorage (persist across sessions)
- Frequently accessed kanji: Cache in Redis (future optimization)

---

### 7.4 Performance Optimizations

**Client-Side:**

1. **React Flow Optimizations:**
   - Use `nodesDraggable={false}` on mobile (prevent accidental drags)
   - Implement `onNodesChange` with debouncing (100ms)
   - Use `React.memo()` for custom node components
   - Lazy-load node details (fetch on expand, not on load)

2. **Bundle Size:**
   - Code-split React Flow: `const ReactFlow = dynamic(() => import('reactflow'), { ssr: false })`
   - Tree-shake D3: Import only `d3-force`, not entire D3 library
   - Optimize SVG icons (inline critical, async load decorative)

3. **Animation Performance:**
   - Use CSS transforms (GPU-accelerated) over JS animations
   - Disable animations on low-end devices (check `navigator.hardwareConcurrency < 4`)
   - Cap simultaneous animations to 6 nodes max

4. **State Management:**
   - Use Zustand selectors to prevent unnecessary re-renders
   - Normalize graph data (nodes and edges as separate maps, not nested)

**Server-Side:**

1. **Database Query Optimization:**
   - Index `kanji_composition.kanji_id` and `words.jlpt_level`
   - Use `LIMIT 6` for branch queries (only fetch visible nodes)
   - Implement database-level filtering (not application-level)

2. **Response Size:**
   - Return only necessary fields (exclude large JSONB `meanings` unless requested)
   - Use Prisma `select` to limit fields
   - Compress JSON responses (already handled by Next.js)

3. **Concurrent Requests:**
   - Use `Promise.all()` to fetch kanji details and related words in parallel
   - Implement rate limiting (10 expansions per minute per user)

**Target Metrics:**

- Initial Load: <2s on 3G connection
- Node Expansion: <500ms response time
- Frame Rate: Maintain 60fps during animations
- Bundle Size: <200KB for Origami module (minified + gzipped)

---

## 8. Data Model & Schema

### 8.1 Required Tables

**Extend Existing Schema (Prisma):**

```prisma
// 1. NEW TABLE: Kanji Master Data
model Kanji {
  id            String   @id @default(cuid())
  character     String   @unique @db.Char(1) // e.g., '先'
  meaning       Json     // Array of English meanings
  onyomiReadings String[] // e.g., ["SEN"]
  kunyomiReadings String[] // e.g., ["saki", "ma-zu"]
  jlptLevel     Int?     // 5 to 1 (nullable for non-JLPT kanji)
  strokeCount   Int
  frequency     Int?     // Usage frequency ranking
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  compositions  KanjiComposition[]

  @@index([jlptLevel])
  @@index([frequency])
  @@map("kanji")
}

// 2. NEW TABLE: Kanji-Word Composition (The Graph Edges)
model KanjiComposition {
  id             String   @id @default(cuid())
  wordId         String   // FK to Vocabulary
  kanjiId        String   // FK to Kanji
  position       Int      // 1st, 2nd, 3rd character in word
  activeReading  String   // How this kanji is read in this word (e.g., "SEI")
  readingType    ReadingType // Enum: ONYOMI, KUNYOMI, IRREGULAR
  createdAt      DateTime @default(now())

  // Relations
  word           Vocabulary @relation(fields: [wordId], references: [id], onDelete: Cascade)
  kanji          Kanji      @relation(fields: [kanjiId], references: [id], onDelete: Cascade)

  @@unique([wordId, kanjiId, position])
  @@index([kanjiId, readingType])
  @@map("kanji_composition")
}

enum ReadingType {
  ONYOMI
  KUNYOMI
  IRREGULAR
}

// 3. EXTEND EXISTING: Vocabulary Model
model Vocabulary {
  // ... existing fields ...

  // NEW: Add kanji composition relation
  kanjiCompositions KanjiComposition[]
}

// 4. NEW TABLE: User Graph Exploration History (For Analytics)
model OrigamiExploration {
  id             String   @id @default(cuid())
  userId         String
  sourceWord     String   // Starting word
  expandedNodes  Json     // Array of expanded node IDs
  sessionDuration Int     // Seconds spent in session
  flashcardsAdded Int     // Count of cards added via Origami
  createdAt      DateTime @default(now())

  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@map("origami_explorations")
}

// 5. NEW TABLE: User Achievements (For Gamification)
model OrigamiAchievement {
  id          String   @id @default(cuid())
  userId      String
  badgeCode   String   // e.g., "CRANE_CRAFTER"
  earnedAt    DateTime @default(now())
  metadata    Json?    // Additional data (e.g., count when earned)

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeCode])
  @@map("origami_achievements")
}
```

---

### 8.2 Data Seeding Strategy

**Phase 1: Kanji Master Data (KANJIDIC2)**

```typescript
// scripts/seed-kanji.ts
import { parseKanjidic2 } from './parsers/kanjidic2-parser';

async function seedKanji() {
	const kanjiData = await parseKanjidic2('./data/kanjidic2.xml');

	// Filter: Only JLPT kanji for MVP
	const jlptKanji = kanjiData.filter((k) => k.jlptLevel !== null);

	// Batch insert (500 at a time for performance)
	for (let i = 0; i < jlptKanji.length; i += 500) {
		const batch = jlptKanji.slice(i, i + 500);
		await prisma.kanji.createMany({ data: batch });
	}
}
```

**Phase 2: Vocabulary Data (JMdict)**

```typescript
// scripts/seed-words.ts
import { parseJMdict } from './parsers/jmdict-parser';

async function seedWords() {
	const wordData = await parseJMdict('./data/JMdict_e.xml');

	// Filter: Common words + JLPT-tagged only
	const filteredWords = wordData.filter((w) => w.isCommon || w.jlptLevel !== null);

	// Insert into existing Vocabulary table
	for (const word of filteredWords) {
		await prisma.vocabulary.upsert({
			where: { expression: word.kanji },
			update: {
				/* update existing */
			},
			create: {
				/* create new */
			},
		});
	}
}
```

**Phase 3: Kanji-Word Composition (The Hard Part)**

```typescript
// scripts/seed-composition.ts
import { matchKanjiReadings } from './utils/reading-matcher';

async function seedComposition() {
	const words = await prisma.vocabulary.findMany({
		where: { expression: { not: null } }, // Has kanji
	});

	for (const word of words) {
		const kanji = extractKanji(word.expression); // e.g., '先生' → ['先', '生']

		for (let i = 0; i < kanji.length; i++) {
			const kanjiChar = kanji[i];
			const kanjiData = await prisma.kanji.findUnique({
				where: { character: kanjiChar },
			});

			// Use heuristic matcher
			const match = matchKanjiReadings(
				word.kana, // e.g., 'せんせい'
				kanjiData.onyomiReadings,
				kanjiData.kunyomiReadings,
				i, // position
			);

			if (match.success) {
				await prisma.kanjiComposition.create({
					data: {
						wordId: word.id,
						kanjiId: kanjiData.id,
						position: i + 1,
						activeReading: match.reading,
						readingType: match.type,
					},
				});
			} else {
				// Mark as irregular
				await prisma.kanjiComposition.create({
					data: {
						wordId: word.id,
						kanjiId: kanjiData.id,
						position: i + 1,
						activeReading: word.kana,
						readingType: 'IRREGULAR',
					},
				});
			}
		}
	}
}
```

**Reading Matcher Heuristic:**

```typescript
// scripts/utils/reading-matcher.ts
export function matchKanjiReadings(
	fullReading: string, // e.g., 'せんせい'
	onyomi: string[], // e.g., ['SEN']
	kunyomi: string[], // e.g., ['saki']
	position: number,
): { success: boolean; reading: string; type: ReadingType } {
	// Convert to hiragana for comparison
	const hiraganaOn = onyomi.map(toHiragana);
	const hiraganaKun = kunyomi;

	// Try On'yomi first (more common in compound words)
	for (const reading of hiraganaOn) {
		if (fullReading.startsWith(reading)) {
			return { success: true, reading: reading, type: 'ONYOMI' };
		}
	}

	// Try Kun'yomi
	for (const reading of hiraganaKun) {
		if (fullReading.startsWith(reading)) {
			return { success: true, reading: reading, type: 'KUNYOMI' };
		}
	}

	// No match found
	return { success: false, reading: '', type: 'IRREGULAR' };
}
```

**Data Sources:**

- KANJIDIC2: <http://www.edrdg.org/wiki/index.php/KANJIDIC_Project>
- JMdict: <http://www.edrdg.org/jmdict/j_jmdict.html>
- License: Creative Commons Attribution-ShareAlike 3.0

---

### 8.3 Query Patterns

**Q1: Fetch Initial Graph (Word → Kanji)**

```typescript
// modules/origami/data.ts
export async function getWordGraphData(word: string, userLevel: number) {
	const wordData = await prisma.vocabulary.findFirst({
		where: {
			expression: word,
			jlptLevel: { gte: userLevel }, // Only show if user level allows
		},
		include: {
			kanjiCompositions: {
				include: {
					kanji: true,
				},
				orderBy: { position: 'asc' },
			},
		},
	});

	if (!wordData) return null;

	// Transform to graph structure
	const nodes: GraphNode[] = [{ id: wordData.id, type: 'word', data: wordData }];

	const edges: GraphEdge[] = [];

	for (const comp of wordData.kanjiCompositions) {
		nodes.push({
			id: comp.kanji.id,
			type: 'kanji',
			data: comp.kanji,
		});

		edges.push({
			id: `${wordData.id}-${comp.kanji.id}`,
			source: wordData.id,
			target: comp.kanji.id,
			label: comp.activeReading,
			type: comp.readingType,
		});
	}

	return { nodes, edges };
}
```

**Q2: Expand Kanji Node (Kanji → Related Words)**

```typescript
export async function getRelatedWordsByKanji(
	kanjiId: string,
	userLevel: number,
	limit: number = 6,
) {
	const compositions = await prisma.kanjiComposition.findMany({
		where: {
			kanjiId: kanjiId,
			word: {
				jlptLevel: { gte: userLevel },
			},
		},
		include: {
			word: true,
		},
		orderBy: {
			word: { frequency: 'desc' }, // Most common words first
		},
		take: limit,
	});

	return compositions.map((comp) => ({
		node: {
			id: comp.word.id,
			type: 'word',
			data: comp.word,
		},
		edge: {
			id: `${kanjiId}-${comp.word.id}`,
			source: kanjiId,
			target: comp.word.id,
			label: comp.activeReading,
			type: comp.readingType,
		},
	}));
}
```

**Q3: Search Words for Graph Entry Point**

```typescript
export async function searchWordsForGraph(query: string, userLevel: number) {
	return await prisma.vocabulary.findMany({
		where: {
			OR: [
				{ expression: { contains: query } },
				{ kana: { contains: query } },
				{ meaning: { path: '$[*]', string_contains: query } },
			],
			jlptLevel: { gte: userLevel },
			kanjiCompositions: { some: {} }, // Must have kanji to graph
		},
		take: 10,
		orderBy: { frequency: 'desc' },
	});
}
```

---

## 9. Integration Requirements

### 9.1 Integration with Existing WatashiWa Modules

**INT-1: Flashcard Module**

**Touchpoints:**

- Origami → Flashcard: "Add to Flashcards" button
- Flashcard → Origami: "Explore in Origami" link on card detail view

**Implementation:**

```typescript
// modules/origami/actions.ts
import { createFlashcard } from '@/modules/flashcard/actions';

export async function addWordToFlashcardFromOrigami(
	wordId: string,
	context: { sourceWord: string; kanjiId: string },
) {
	return executeSafeAction(AddWordSchema, { wordId }, async (data, { userId }) => {
		// Reuse existing flashcard creation logic
		const result = await createFlashcard({
			vocabularyId: wordId,
			userId: userId,
			metadata: {
				discoveredVia: 'origami',
				context: context,
			},
		});

		// Track analytics
		await trackOrigamiEvent({
			userId,
			eventType: 'flashcard_added',
			metadata: context,
		});

		return result;
	});
}
```

**INT-2: User Profile & Settings**

**Touchpoints:**

- Read user's current JLPT level from profile
- Respect user's language preference (en/vi/ja)
- Sync graph exploration history to user stats

**Implementation:**

```typescript
// modules/origami/services.ts
export async function getUserGraphPreferences(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			currentJlptLevel: true,
			preferredLanguage: true,
			settings: true, // JSON field for graph preferences
		},
	});

	return {
		level: user.currentJlptLevel || 5, // Default N5
		locale: user.preferredLanguage,
		soundEnabled: user.settings?.origami?.soundEnabled ?? true,
		animationsEnabled: user.settings?.origami?.animations ?? true,
	};
}
```

**INT-3: Analytics Module**

**Touchpoints:**

- Track all Origami interactions (expansions, adds, session duration)
- Feed data into existing analytics dashboard
- A/B testing infrastructure

**Events to Track:**

```typescript
type OrigamiEvent =
	| { type: 'graph_loaded'; word: string }
	| { type: 'node_expanded'; nodeType: 'word' | 'kanji'; nodeId: string }
	| { type: 'flashcard_added_from_graph'; wordId: string; context: object }
	| { type: 'level_filter_changed'; from: number; to: number }
	| { type: 'session_ended'; duration: number; expansions: number }
	| { type: 'badge_earned'; badgeCode: string };
```

**INT-4: Audio Pronunciation Module**

**Touchpoints:**

- Reuse existing TTS or audio file system for word pronunciation
- Trigger pronunciation from node detail sheet

**Implementation:**

```typescript
// modules/origami/components/NodeDetailsSheet.tsx
import { playPronunciation } from '@/modules/audio/services'

function NodeDetailsSheet({ word }: Props) {
  const handlePlayAudio = async () => {
    await playPronunciation(word.kana, word.id)

    // Track event
    trackOrigamiEvent({
      type: 'pronunciation_played',
      wordId: word.id
    })
  }

  return (
    <Button onClick={handlePlayAudio} icon={<SoundOutlined />}>
      Play Pronunciation
    </Button>
  )
}
```

**INT-5: Navigation & Routing**

**URL Structure:**

```
/origami                          # Entry point (search/browse)
/origami/word/[slug]              # Graph centered on specific word
/origami/kanji/[character]        # Graph centered on kanji
/origami/gallery                  # User's exploration history (premium)
```

**Deep Linking:**

- Support direct links to graph views
- Preserve graph state in URL query params (e.g., `?expanded=先,生`)
- Share URLs: `watashiwa.app/origami/word/sensei?share=true` (generates OG image)

---

### 9.2 Authentication & Authorization

**AUTH-1: Route Protection**

- Origami available to all authenticated users
- Premium features (advanced filtering, gallery, etc.) require subscription check

**AUTH-2: Data Access Control**

- Users can only see their own exploration history
- Shared graphs are public (no auth required for read)

**Implementation:**

```typescript
// app/origami/word/[slug]/page.tsx (Server Component)
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function OrigamiWordPage({ params }) {
  const session = await auth()

  if (!session) {
    redirect('/login?returnTo=/origami/word/' + params.slug)
  }

  // Fetch graph data with user's level
  const graphData = await fetchInitialGraph(params.slug, session.user.level)

  return <OrigamiLayout initialData={graphData} />
}
```

---

## 10. Implementation Phases

### Phase 1: Foundation (Weeks 1-2) - MVP Core

**Goal:** Prove the concept with basic graph visualization

**Deliverables:**

- [ ] Database schema + migrations
- [ ] Data seeding pipeline (Kanji + Composition tables)
- [ ] Basic React Flow graph rendering (no custom styling yet)
- [ ] Server Action: `getInitialGraph(word)`
- [ ] Server Action: `expandKanjiNode(kanjiId)`
- [ ] Module structure setup (`modules/origami/`)

**Success Criteria:**

- Can load a word and see its kanji as nodes
- Can click a kanji and see 6 related words expand
- All data comes from database (no mocks)

**Team:**

- 1 Backend Engineer (schema, seeding, actions)
- 1 Frontend Engineer (React Flow integration)

---

### Phase 2: Visual Polish (Weeks 3-4) - Origami Theme

**Goal:** Apply the unique Origami aesthetic and make it delightful

**Deliverables:**

- [ ] Custom node components (WordNode, KanjiNode with shapes)
- [ ] Custom edge components (ReadingEdge with labels)
- [ ] Fold animations (CSS transforms)
- [ ] Washi paper texture background
- [ ] Color-coded edges (On'yomi/Kun'yomi)
- [ ] Mobile-responsive layout (portrait/landscape)
- [ ] Desktop split-view layout

**Success Criteria:**

- Graph looks distinct from generic React Flow examples
- Animations run at 60fps on iPhone 12+
- Design passes internal UX review

**Team:**

- 1 Frontend Engineer (components, animations)
- 1 UI/UX Designer (review + iterations)

---

### Phase 3: Core Features (Weeks 5-6) - User Flows

**Goal:** Complete the end-to-end user experience

**Deliverables:**

- [ ] JLPT level filtering logic
- [ ] Node detail sheet (mobile) / sidebar (desktop)
- [ ] "Add to Flashcards" integration
- [ ] Audio pronunciation playback
- [ ] Graph legend component
- [ ] Search bar for word entry
- [ ] Error states (no results, network errors)
- [ ] Loading states (skeletons)

**Success Criteria:**

- User can discover a word, explore its kanji, add to flashcards (E2E)
- Filtering correctly limits vocab to user's level
- No console errors in production build

**Team:**

- 2 Frontend Engineers (features, integration)
- 1 Backend Engineer (optimization, caching)

---

### Phase 4: Optimization & Polish (Weeks 7-8) - Production Ready

**Goal:** Performance, analytics, and edge cases

**Deliverables:**

- [ ] Performance optimizations (lazy loading, memoization)
- [ ] Analytics instrumentation (track all events)
- [ ] Error boundary implementation
- [ ] Accessibility audit + fixes (WCAG AA)
- [ ] Internationalization (en/vi/ja labels)
- [ ] E2E tests (Playwright)
- [ ] Unit tests for critical logic
- [ ] Documentation (README, API docs)

**Success Criteria:**

- Lighthouse score >90 (Performance, Accessibility)
- All P0 analytics events firing correctly
- Test coverage >80% for services layer
- No critical bugs in staging

**Team:**

- 1 Frontend Engineer (optimization, testing)
- 1 QA Engineer (test scenarios, bug bash)
- 1 DevOps (monitoring setup)

---

### Phase 5: Gamification & Premium (Weeks 9-10) - Post-MVP

**Goal:** Drive engagement and monetization

**Deliverables:**

- [ ] Badge system (Crane Crafter, Explorer, etc.)
- [ ] Origami Gallery (user's exploration history)
- [ ] Progress heat map visualization
- [ ] Social sharing (OG images for graphs)
- [ ] Premium paywall for advanced features
- [ ] Daily challenges ("Explore 5 N3 words today")
- [ ] Push notifications for milestones

**Success Criteria:**

- 20% of users earn at least one badge in first week
- 5% of users share a graph on social media
- 10% conversion rate from free to premium

**Team:**

- 1 Frontend Engineer (gamification UI)
- 1 Backend Engineer (achievement logic)
- 1 Product Manager (premium feature testing)

---

### Launch Plan (Week 11)

**Soft Launch:**

- Enable for 10% of users (A/B test)
- Monitor metrics for 1 week
- Collect qualitative feedback (in-app survey)

**Full Launch:**

- Gradual rollout: 25% → 50% → 100% over 3 days
- Marketing push (blog post, email campaign, social media)
- Monitor server load, error rates, user feedback

---

## 11. Success Metrics & Analytics

### 11.1 Key Performance Indicators (KPIs)

**Engagement Metrics:**

| Metric                             | Target                                    | Measurement Method                        |
| ---------------------------------- | ----------------------------------------- | ----------------------------------------- |
| **Adoption Rate**                  | 50% of DAU try Origami in first month     | Track unique users who visit `/origami/*` |
| **Average Expansions per Session** | 8+ nodes                                  | Count `node_expanded` events per session  |
| **Session Duration**               | +3 min vs non-Origami sessions            | Compare session lengths (analytics)       |
| **Flashcard Adds via Origami**     | 30% of all flashcard additions            | Track `flashcard_added_from_graph` events |
| **Return Rate**                    | 70% of Origami users return within 7 days | Cohort analysis (Day 1 → Day 7)           |

**Product Quality Metrics:**

| Metric                  | Target           | Measurement Method             |
| ----------------------- | ---------------- | ------------------------------ |
| **Load Time (P95)**     | <2s on 3G        | RUM (Real User Monitoring)     |
| **Error Rate**          | <1% of sessions  | Track JS errors + API failures |
| **Crash Rate**          | <0.1%            | Sentry error tracking          |
| **Accessibility Score** | 95+ (Lighthouse) | Automated CI testing           |

**Business Metrics:**

| Metric                      | Target                          | Measurement Method                     |
| --------------------------- | ------------------------------- | -------------------------------------- |
| **Premium Conversion**      | 10% of Origami users → premium  | Track paywall encounters → conversions |
| **User Retention (Week 2)** | -15% churn (vs baseline)        | Cohort survival analysis               |
| **NPS Impact**              | +5 points (post-Origami launch) | In-app NPS survey                      |

---

### 11.2 Analytics Events Schema

**Event: `origami_graph_loaded`**

```json
{
  "event": "origami_graph_loaded",
  "userId": "usr_123",
  "timestamp": "2026-01-16T10:30:00Z",
  "properties": {
    "sourceWord": "先生",
    "entryPoint": "flashcard_detail" | "search" | "direct_link",
    "userLevel": 4,
    "deviceType": "mobile" | "desktop",
    "initialNodeCount": 3
  }
}
```

**Event: `origami_node_expanded`**

```json
{
	"event": "origami_node_expanded",
	"userId": "usr_123",
	"sessionId": "ses_abc",
	"timestamp": "2026-01-16T10:31:15Z",
	"properties": {
		"nodeType": "kanji",
		"nodeId": "kanji_456",
		"character": "先",
		"expansionDepth": 1,
		"newNodesCount": 6,
		"durationSinceLoad": 75
	}
}
```

**Event: `origami_flashcard_added`**

```json
{
  "event": "origami_flashcard_added",
  "userId": "usr_123",
  "sessionId": "ses_abc",
  "timestamp": "2026-01-16T10:32:00Z",
  "properties": {
    "wordId": "vocab_789",
    "word": "先月",
    "sourceKanji": "先",
    "addMethod": "detail_sheet" | "long_press",
    "deckId": "deck_101",
    "sessionExpansions": 5
  }
}
```

**Funnel Analysis:**

```
Graph Load (100%)
  ↓
First Expansion (60%)
  ↓
3+ Expansions (40%)
  ↓
Flashcard Added (25%)
  ↓
Return within 7 Days (70%)
```

---

### 11.3 A/B Testing Strategy

**Test 1: Expansion Interaction Method**

- **Variant A (Control):** Tap to expand
- **Variant B:** Long-press to expand, tap for details
- **Hypothesis:** Long-press reduces accidental expansions, increases intentionality
- **Metric:** Average expansions per session (target: +15%)

**Test 2: Gamification Timing**

- **Variant A (Control):** Badge notification after 10 expansions
- **Variant B:** Badge notification after 5 expansions
- **Hypothesis:** Earlier rewards increase engagement
- **Metric:** Return rate within 7 days (target: +10%)

**Test 3: Premium Paywall Placement**

- **Variant A:** Hard limit at 20 expansions per day (free tier)
- **Variant B:** Soft limit with "Unlock unlimited" prompt at 15 expansions
- **Hypothesis:** Soft limits with context increase conversions
- **Metric:** Free-to-premium conversion rate (target: +5%)

---

## 12. Risks & Mitigations

### 12.1 Technical Risks

**RISK-1: Performance Degradation on Large Graphs**

**Impact:** High  
**Probability:** Medium  
**Description:** Users who expand deeply (50+ nodes) may experience lag, especially on low-end mobile devices.

**Mitigation:**

- Hard cap at 50 nodes (hide oldest branches)
- Implement virtualization (only render visible nodes)
- Add "Performance Mode" toggle (disables animations)
- Monitor FPS metrics; alert if <30fps on key devices

---

**RISK-2: Data Seeding Accuracy (Reading Matcher)**

**Impact:** High  
**Probability:** Medium  
**Description:** The heuristic for matching kanji readings may fail for irregular words, leading to incorrect edge labels.

**Mitigation:**

- Manual review of top 1000 most common words
- Crowdsource corrections (allow user reports)
- Mark uncertain matches as "IRREGULAR" explicitly
- Continuous improvement: retrain matcher with user feedback

---

**RISK-3: Database Query Performance at Scale**

**Impact:** Medium  
**Probability:** Low  
**Description:** Complex joins on `kanji_composition` table may slow down as data grows.

**Mitigation:**

- Add database indexes on critical columns (kanjiId, wordId, jlptLevel)
- Implement Redis caching for frequently accessed kanji (N5 kanji)
- Monitor query execution plans; optimize slow queries
- Consider materialized views for common queries

---

### 12.2 Product Risks

**RISK-4: Low User Adoption**

**Impact:** High  
**Probability:** Low  
**Description:** Users may not understand the value of the graph, or find it confusing.

**Mitigation:**

- Mandatory onboarding tutorial (interactive walkthrough)
- In-app tooltips on first use
- A/B test entry points (flashcard detail vs standalone page)
- Gather feedback via in-app surveys after 3 uses

---

**RISK-5: Overwhelming Complexity for Beginners**

**Impact:** Medium  
**Probability:** Medium  
**Description:** N5 learners may find graph visualization too abstract.

**Mitigation:**

- Default to simplified view for N5 users (larger nodes, fewer branches)
- Add "Guide Mode" with explanatory overlays
- Provide alternative "List View" for users who prefer linear UI
- Test with beginner cohort before full launch

---

**RISK-6: Cannibalization of Existing Features**

**Impact:** Low  
**Probability:** Low  
**Description:** Users may spend more time in Origami and less time reviewing flashcards (SRS).

**Mitigation:**

- Track flashcard review completion rates before/after Origami launch
- Position Origami as complementary (discovery), not replacement (review)
- Limit free tier usage (e.g., 20 expansions/day) to encourage return to SRS
- Integrate Origami into review flow (e.g., "Explore after completing 10 reviews")

---

### 12.3 Business Risks

**RISK-7: Increased Server Costs**

**Impact:** Medium  
**Probability:** Medium  
**Description:** Complex graph queries + high user engagement may increase database load significantly.

**Mitigation:**

- Implement aggressive caching (Redis for hot paths)
- Optimize queries (use EXPLAIN ANALYZE)
- Monitor cost/DAU metric; set alerts if >$0.10/user/month
- Consider rate limiting (10 expansions/min per user)

---

**RISK-8: Competitor Copying**

**Impact:** Low  
**Probability:** High  
**Description:** Once launched, competitors may replicate the feature.

**Mitigation:**

- Move fast: Iterate based on user feedback to stay ahead
- Focus on execution quality (delightful UX, not just concept)
- Build network effects (user-generated graph annotations, social sharing)
- Consider patent/IP protection for novel UI patterns (consult legal)

---

## 13. Open Questions & Future Considerations

### 13.1 Open Questions (Requires Decision)

**Q1: Should we support user-generated content (annotations)?**

- **Scenario:** Users can add personal notes/mnemonics to kanji nodes
- **Pros:** Increases engagement, personalization, creates lock-in
- **Cons:** Moderation burden, data storage costs
- **Decision:** Defer to Phase 6 (post-launch)

**Q2: How do we handle multi-character words (3+ kanji)?**

- **Scenario:** Word like `大学生` (college student) has 3 kanji
- **Current Plan:** Show all 3 as children of word node
- **Alternative:** Hierarchical grouping (compound word breakdown)
- **Decision:** Keep simple for MVP, revisit based on user feedback

**Q3: Should graphs be shareable/public?**

- **Scenario:** User generates graph URL, shares on Twitter
- **Privacy Concern:** May reveal user's learning level, study habits
- **Solution:** Add explicit "Share" action with privacy consent
- **Decision:** Include in Phase 5 (Gamification)

**Q4: What's the free vs premium feature split?**

- **Proposal:**
  - **Free:** 20 expansions/day, basic graph, N5-N4 kanji
  - **Premium:** Unlimited expansions, gallery, advanced filtering, all JLPT levels
- **Risk:** Too restrictive free tier may reduce adoption
- **Decision:** A/B test different limits (15 vs 25 vs unlimited)

---

### 13.2 Future Enhancements (Phase 6+)

**Enhancement 1: AI-Powered Recommendations**

- "Based on your graph exploration, we recommend studying these 5 words next"
- Use ML model trained on user exploration patterns

**Enhancement 2: Collaborative Graphs**

- Share graphs with study partners
- See what words your friend is exploring (opt-in)
- Leaderboard for most expansions this week

**Enhancement 3: Spaced Repetition Integration**

- Automatically schedule flashcards for explored words based on SRS algorithm
- Surface underexplored kanji in review sessions

**Enhancement 4: Grammar Node Layer**

- Add third layer: Grammar patterns using the word
- Example: `先生` → `先生は` (topic marker pattern)

**Enhancement 5: Native Mobile App**

- Rebuild Origami in React Native for better performance
- Leverage device capabilities (ARKit for 3D graph visualization)

**Enhancement 6: Voice Search**

- "Show me words with 先"
- Use Web Speech API for voice input

---

## 14. Appendix

### 14.1 Glossary

| Term                   | Definition                                                       |
| ---------------------- | ---------------------------------------------------------------- |
| **Node**               | A visual element in the graph representing a word or kanji       |
| **Edge**               | A connection line between two nodes, representing a relationship |
| **Expansion**          | User action to reveal related nodes connected to a selected node |
| **Constellation**      | The overall graph structure of interconnected words and kanji    |
| **On'yomi**            | Chinese-derived reading of a kanji character                     |
| **Kun'yomi**           | Native Japanese reading of a kanji character                     |
| **JLPT**               | Japanese Language Proficiency Test (levels N5-N1, N5 = beginner) |
| **SRS**                | Spaced Repetition System (flashcard review algorithm)            |
| **Origami**            | Project codename; also refers to Japanese paper-folding art      |
| **Just-in-Time Graph** | Graph nodes are loaded dynamically, not pre-rendered             |

---

### 14.2 References

**External Resources:**

- KANJIDIC2 Documentation: <http://www.edrdg.org/wiki/index.php/KANJIDIC_Project>
- JMdict Documentation: <http://www.edrdg.org/jmdict/j_jmdict.html>
- React Flow Docs: <https://reactflow.dev/>
- D3-Force Simulation: <https://d3js.org/d3-force>
- WCAG 2.1 Guidelines: <https://www.w3.org/WAI/WCAG21/quickref/>

**Internal Documentation:**

- WatashiWa Architecture Spec: `/docs/architecture.md`
- Flashcard Module API: `/docs/api/flashcard.md`
- Analytics Event Schema: `/docs/analytics.md`
- Design System: `/docs/design-system.md`

---

### 14.3 Change Log

| Version | Date       | Author       | Changes           |
| ------- | ---------- | ------------ | ----------------- |
| 1.0     | 2026-01-16 | Product Team | Initial PRD draft |

---

### 14.4 Approval & Sign-Off

**Product Owner:** **\*\***\_\_\_**\*\*** Date: \***\*\_\_\_\*\***  
**Engineering Lead:** **\*\***\_\_\_**\*\*** Date: \***\*\_\_\_\*\***  
**UX Lead:** **\*\***\_\_\_**\*\*** Date: \***\*\_\_\_\*\***  
**Stakeholder (CEO):** **\*\***\_\_\_**\*\*** Date: \***\*\_\_\_\*\***

---

## Summary & Next Steps

**This PRD is ready for:**

1. **Technical Feasibility Review** (Engineering team validates architecture)
2. **Design Prototype** (UX team creates high-fidelity mockups)
3. **Data Audit** (Verify KANJIDIC2/JMdict data availability)
4. **Sprint Planning** (Break down Phase 1 into 2-week sprint tasks)

**Critical Path:**

- Week 1: Finalize schema + start data seeding
- Week 2: Basic graph rendering (MVP proof-of-concept)
- Week 3-4: Origami theme implementation
- Week 5-6: Feature complete (flashcard integration, filtering)
- Week 7-8: Production polish (perf, tests, docs)
- Week 9-10: Gamification (post-MVP)
- Week 11: Launch 🚀

**Questions?** Contact: <product@watashiwa.app>

---

**End of PRD**
