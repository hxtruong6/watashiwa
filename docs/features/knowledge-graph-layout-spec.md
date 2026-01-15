# Knowledge Graph Layout Precompute Spec

## 1. Purpose

Provide a server-side layout pipeline that outputs stable, readable positions for
knowledge-graph nodes so the client can render a consistent graph without heavy force
simulation. The current UI uses client-side layout; this spec defines the future
server-side layout and cache behavior.

## 2. Scope

- Focus on vocabulary nodes.
- Relationship type: `SHARED_KANJI` (initial launch).
- Layouts supported: `radial`, `tree`, `cards` (rectangular nodes).
- User-specific weights drive node size and edge strength.
- Max graph size: 20 nodes by default, with `hasMore` support.

## 3. Data Inputs

### 3.1 Tables

- `knowledge_graph_nodes`
  - `id`
  - `vocabulary_id`
  - `kanji_chars` (text[])
  - `base_weight` (optional)
  - `layout` (jsonb, optional)

- `knowledge_graph_edges`
  - `id`
  - `source_node_id`
  - `target_node_id`
  - `edge_type` (`SHARED_KANJI`)
  - `metadata` (jsonb: `{ sharedKanji: ['学'] }`)

- `knowledge_graph_user_weights`
  - `user_id`
  - `node_id`
  - `weight`

- `knowledge_graph_edge_user_weights`
  - `user_id`
  - `edge_id`
  - `weight`

### 3.2 Request Inputs

- `centerVocabId` (string, required for layout)
- `edgeType` (default: `SHARED_KANJI`)
- `limit` (default: 20)
- `layout` (radial | tree | cards, default: radial)

## 4. Output Shape

### 4.1 Node Layout Payload

Persisted on `knowledge_graph_nodes.layout` and returned from API:

```json
{
  "x": 120.5,
  "y": -80.2,
  "radius": 12,
  "cluster": "学",
  "layout": "radial"
}
```

### 4.2 API Response (Future)

```json
{
  "centerNodeId": "uuid",
  "nodes": [
    { "id": "uuid", "x": 0, "y": 0, "radius": 12, "cluster": "学" }
  ],
  "edges": [
    { "sourceId": "uuid", "targetId": "uuid", "weight": 0.7 }
  ],
  "layout": "radial"
}
```

## 5. Layout Strategy

### 5.1 General Rules

- Center node is anchored at `(0, 0)` for all layouts.
- Weights affect visual scale:
  - `node.radius = 8 + weight * 10`
  - `edge.thickness = 1 + weight * 3`
- Cluster label is the strongest shared kanji between the center and the node.
- The layout must be stable (deterministic) for the same inputs.

### 5.2 Radial Layout

**Goal:** clarity of relationships around the center node.

Algorithm:

1. Identify center node by `centerVocabId`.
2. Order neighbors by edge weight descending.
3. Place neighbors on a circle:
   - `angle = 2π * index / N`
   - `radius = baseRadius - weight * 40`
4. If a node connects via multiple kanji, pick the strongest edge to determine cluster.

### 5.3 Tree Layout

**Goal:** simple left-to-right hierarchy for dense clusters.

Algorithm:

1. Center node at `(0, -60)`.
2. Group nodes by shared kanji cluster.
3. Place clusters by row, 3–4 per row:
   - `row = floor(i / perRow)`
   - `x = (col - (perRow - 1)/2) * spacingX`
   - `y = (row + 1) * spacingY`

### 5.4 Cards Layout (Rectangular Nodes)

**Goal:** show word + meaning in the node itself.

Algorithm:

1. Use tree-like grid with larger spacing:
   - `spacingX = 200`, `spacingY = 140`
2. Fixed card size:
   - `width = 140`, `height = 70`
3. Anchor center node at `(0, -60)`.

## 6. Overlap Prevention

- Use deterministic spacing and fixed positioning (radial or grid).
- If a cluster has > 20 nodes, cap to top 20 by weight.
- Optional micro-offset: stagger nodes by ±4px based on hash(nodeId).

## 7. Caching Strategy

- Cache key: `knowledge_graph_layout:{userId}:{centerVocabId}:{layout}:{limit}`
- TTL: 1 hour
- Recompute on:
  - user learning update
  - new vocabulary added
  - daily batch refresh

## 8. Background Job (Hourly)

1. Fetch top N nodes for each user (based on learning weight).
2. Build edges (`SHARED_KANJI`).
3. Compute layout positions per `layout` type.
4. Store layout in `knowledge_graph_nodes.layout`.
5. Update cache.

## 9. Client Expectations

- Client must not run heavy force simulation.
- Client may run lightweight relax for overlap only if needed.
- Graph is readable without motion by default.
- Edge labels should show “Shares {kanji}”.

## 10. Quality Targets

- < 200ms layout compute per user for 20 nodes.
- < 1s render in browser.
- Stable layout for identical inputs.

## 11. Future Extensions

- Add `semantic` and `co_occurrence` edge types.
- Weighted clustering by user proficiency.
- Layout presets per user preference.

## 12. Requirements

### 12.1 Functional Requirements

- Must support `radial`, `tree`, and `cards` layouts.
- Must anchor the center node at `(0, 0)` for all layouts.
- Must return consistent positions for identical inputs.
- Must cap results to 20 nodes (default) and surface `hasMore`.
- Must show shared kanji label per edge (`Shares {kanji}`).
- Must honor user-specific weights for node and edge scaling.

### 12.2 Non-Functional Requirements

- Layout compute time < 200ms for 20 nodes.
- Rendering time < 1s on mid-tier devices.
- Cache TTL 1 hour with background refresh.
- Safe fallback when layout cache is missing.
- Deterministic output for the same inputs.

## 13. Acceptance Criteria

- Given a `centerVocabId`, the center node is fixed at `(0, 0)`.
- Given a set of nodes and edges, the layout is stable across refreshes.
- Given `cards` layout, all nodes render as rectangles without overlap.
- Given `radial` layout, nodes are evenly distributed in a ring.
- Given `tree` layout, nodes align in rows with consistent spacing.
- Given `hasMore`, the UI shows a “view more” affordance.

## 14. Implementation Checklist

### 14.1 Data & Schema

- [ ] Add `layout` JSONB column to `knowledge_graph_nodes`.
- [ ] Add `knowledge_graph_edge_user_weights` table.
- [ ] Index `knowledge_graph_nodes (vocabulary_id)` and `knowledge_graph_edges (source_node_id, target_node_id)`.

### 14.2 Layout Service

- [ ] Implement `computeRadialLayout(nodes, edges, centerNodeId)`.
- [ ] Implement `computeTreeLayout(nodes, edges, centerNodeId)`.
- [ ] Implement `computeCardsLayout(nodes, edges, centerNodeId)`.
- [ ] Normalize weights to 0..1 before layout.
- [ ] Persist layout to `knowledge_graph_nodes.layout`.

### 14.3 Caching

- [ ] Cache key: `knowledge_graph_layout:{userId}:{centerVocabId}:{layout}:{limit}`.
- [ ] TTL = 1 hour.
- [ ] Invalidate cache on user progress updates.

### 14.4 API

- [ ] Create `GET /api/knowledge-graph/layout`.
- [ ] Validate inputs (centerVocabId, layout, limit).
- [ ] Return nodes with `x,y,radius,cluster` and edges with `weight`.

### 14.5 UI Integration

- [ ] Default layout = `radial`.
- [ ] Layout switcher: `Force | Tree | Radial | Cards`.
- [ ] Auto-reset view when switching layouts.
- [ ] Highlight shared kanji in edge labels.
- [ ] Node details in sidebar (desktop) and bottom sheet (mobile).

### 14.6 QA Scenarios

- [ ] Graph renders with 1 node (no edges).
- [ ] Graph renders with 20 nodes (no overlaps).
- [ ] Switching layouts resets camera to center.
- [ ] Hovering node shows all connected edge labels.
- [ ] Cache miss falls back to client layout safely.
