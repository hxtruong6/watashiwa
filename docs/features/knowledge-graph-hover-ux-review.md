# Knowledge Graph Hover UX Review

## Senior UX Product Expert Analysis

**Date:** Current  
**Feature:** Hover interaction for shared kanji visualization  
**Reviewer:** Senior UX Product Expert

---

## Executive Summary

The current hover implementation provides **functional** kanji relationship discovery but lacks **discoverability**, **clarity**, and **user guidance**. Users may not immediately understand the color-coding system or realize that hovering reveals relationships. The interaction needs enhancement for better learnability and information hierarchy.

**Overall UX Score: 6.5/10**

---

## Current Implementation Analysis

### ✅ What Works Well

1. **Immediate Visual Feedback**: Related nodes highlight instantly on hover
2. **Color Differentiation**: Multiple colors help distinguish different kanji relationships
3. **Edge Label Visibility**: "Shares [kanji]" labels appear on hover/select
4. **Card Layout Detail**: Shared kanji shown at bottom of cards when highlighted
5. **Performance**: Smooth, responsive hover interactions

### ❌ Critical UX Issues

#### 1. **Discoverability Problem** (Severity: High)

**Issue:** Users don't know that hovering reveals kanji relationships.

**Evidence:**

- No visual affordance indicating hoverable nodes
- No onboarding or tooltip explaining the feature
- No legend explaining color coding

**Impact:** Users may never discover this feature organically.

**Recommendation:**

- Add subtle hover cursor change (pointer → "explore" cursor)
- Show brief tooltip on first visit: "Hover over words to see shared kanji"
- Add a small "?" icon with help text in the graph header

---

#### 2. **Color Mapping Clarity** (Severity: High)

**Issue:** Users can't tell which color corresponds to which kanji.

**Evidence:**

- No legend showing kanji → color mapping
- Multiple nodes can share the same kanji but users can't verify
- Color assignment is arbitrary (no semantic meaning)

**Impact:** Users can't verify which kanji is shared between nodes.

**Recommendation:**

- **Add a Kanji Legend Panel** (collapsible):

  ```
  Shared Kanji:
  🔵 学 (gaku) - 3 words
  🟢 校 (kou) - 2 words
  🟡 先 (sen) - 2 words
  ```

- Show kanji badges on hovered node with matching colors
- Add color-coded kanji indicators on edges

---

#### 3. **Hovered Node Information** (Severity: Medium)

**Issue:** The hovered node itself doesn't clearly show which kanji it contains that trigger the highlights.

**Evidence:**

- Hovered node shows all its kanji, but not which ones are "active" (shared with others)
- No visual distinction between "shared" and "unique" kanji in the hovered node

**Impact:** Users can't quickly identify which kanji are creating the relationships.

**Recommendation:**

- **Highlight active kanji** in the hovered node:
  - Show shared kanji with colored badges matching the highlight colors
  - Dim or gray out kanji that aren't shared with any visible nodes
  - Add subtle animation/pulse to active kanji badges

---

#### 4. **Information Hierarchy** (Severity: Medium)

**Issue:** Shared kanji at bottom of cards is too subtle and easy to miss.

**Evidence:**

- Small font size (10-11px)
- Positioned at very bottom edge
- No background or visual container
- Only visible when highlighted

**Impact:** Users may miss important relationship information.

**Recommendation:**

- **Enhance card kanji display:**
  - Add colored background pill/badge for shared kanji
  - Increase font size to 12-13px
  - Position above meaning text (better visual hierarchy)
  - Add icon: "🔗 Shares: 学 校"

---

#### 5. **Edge Label Visibility** (Severity: Medium)

**Issue:** Edge labels only appear on hover/select, making it hard to see all relationships at once.

**Evidence:**

- Labels hidden by default
- Only show when specific edge is hovered or node is selected
- Can't see full relationship network without multiple hovers

**Impact:** Users can't get a complete picture of relationships.

**Recommendation:**

- **Progressive disclosure:**
  - Show edge labels when ANY connected node is hovered (not just the edge)
  - Add toggle: "Show all connections" button
  - Use subtle opacity (0.6) for non-hovered edges, full opacity (1.0) for hovered

---

#### 6. **Hover State Persistence** (Severity: Low)

**Issue:** Highlight disappears immediately when mouse moves, making it hard to explore.

**Evidence:**

- No "sticky" hover mode
- Moving mouse to read highlighted nodes causes highlight to disappear
- No way to "lock" a hover state

**Impact:** Frustrating exploration experience.

**Recommendation:**

- **Add hover persistence:**
  - 200ms delay before clearing hover (prevents flicker)
  - Add "Lock highlight" button (pin icon) to freeze current hover state
  - Click to select maintains highlight (already works, but could be clearer)

---

#### 7. **Accessibility** (Severity: High)

**Issue:** No keyboard navigation or screen reader support for hover states.

**Evidence:**

- Hover is mouse-only
- No focus states for keyboard users
- No ARIA labels for relationships

**Impact:** Excludes keyboard and screen reader users.

**Recommendation:**

- **Keyboard support:**
  - Tab through nodes, Enter to "activate" (equivalent to hover)
  - Arrow keys to navigate between connected nodes
  - Space to toggle highlight lock
- **Screen reader:**
  - Add `aria-label`: "Word: 学生, shares kanji 学 with 3 other words"
  - Announce relationship changes on focus

---

## Recommended UX Enhancements

### Priority 1: Immediate (High Impact, Low Effort)

1. **Add Kanji Legend Panel**

   ```tsx
   <Card title="Shared Kanji" size="small" collapsible>
     {kanjiColors.entries().map(([kanji, color]) => (
       <Flex align="center" gap="small">
         <div style={{ width: 16, height: 16, background: color, borderRadius: 4 }} />
         <Text>{kanji}</Text>
         <Text type="secondary">({nodeCount} words)</Text>
       </Flex>
     ))}
   </Card>
   ```

2. **Enhance Hovered Node Display**
   - Show active kanji badges with matching colors
   - Add "Shares X kanji with Y words" text

3. **Improve Card Kanji Display**
   - Larger, colored badges
   - Better positioning (above meaning)

### Priority 2: Short-term (High Impact, Medium Effort)

1. **Progressive Edge Label Display**
   - Show all edge labels when node is hovered
   - Fade non-active edges

2. **Hover Persistence**
   - 200ms delay before clearing
   - "Lock" button for exploration

3. **Onboarding Tooltip**
   - First-time user guidance
   - Contextual help icon

### Priority 3: Long-term (Medium Impact, High Effort)

1. **Keyboard Navigation**
   - Full keyboard support
   - Focus management

2. **Advanced Filtering**
   - Filter by kanji
   - Highlight specific kanji relationships

---

## Visual Design Recommendations

### Color System Enhancement

**Current:** Arbitrary color assignment  
**Recommended:** Semantic color mapping

- Use color intensity to show relationship strength
- Group related kanji with similar hues
- Ensure WCAG AA contrast (4.5:1) for all text

### Typography Hierarchy

**Card Layout:**

```
[Word] (16px, bold, primary color if highlighted)
[Reading] (11px, secondary)
[Meaning] (12px, secondary)
[🔗 Shares: 学 校] (12px, colored badges)
```

### Animation & Transitions

- **Hover highlight:** 150ms ease-out fade-in
- **Color change:** 200ms smooth transition
- **Edge label reveal:** 100ms slide-up
- **Avoid:** Jarring instant changes

---

## User Testing Recommendations

### Test Scenarios

1. **Discovery Test:**
   - Can users find the hover feature without guidance?
   - Time to first discovery

2. **Understanding Test:**
   - Can users explain what the colors mean?
   - Can users identify which kanji is shared?

3. **Efficiency Test:**
   - Can users quickly find all words sharing a specific kanji?
   - Compare with/without legend

4. **Accessibility Test:**
   - Keyboard-only navigation
   - Screen reader experience

---

## Success Metrics

### Quantitative

- **Feature Discovery Rate:** % of users who hover within first session
- **Engagement:** Average hovers per session
- **Task Completion:** % who can identify shared kanji correctly

### Qualitative

- User satisfaction with hover interaction
- Clarity of color coding system
- Ease of relationship discovery

---

## Implementation Priority Matrix

| Enhancement | Impact | Effort | Priority |
|------------|--------|--------|----------|
| Kanji Legend | High | Low | P1 |
| Hovered Node Active Kanji | High | Low | P1 |
| Card Kanji Display | Medium | Low | P1 |
| Edge Label Progressive | High | Medium | P2 |
| Hover Persistence | Medium | Low | P2 |
| Onboarding | Medium | Medium | P2 |
| Keyboard Nav | High | High | P3 |
| Advanced Filtering | Medium | High | P3 |

---

## Conclusion

The hover interaction is **functionally sound** but needs **UX polish** for discoverability and clarity. The highest-impact improvements are:

1. **Kanji Legend** - Makes color coding understandable
2. **Active Kanji Highlighting** - Shows what's being shared
3. **Enhanced Card Display** - Better information hierarchy

These changes will transform the feature from "works but unclear" to "intuitive and discoverable."

**Recommended Next Steps:**

1. Implement Priority 1 enhancements (1-2 days)
2. User test with 5-8 users
3. Iterate based on feedback
4. Roll out Priority 2 features

---

## Appendix: Code Examples

### Kanji Legend Component (Recommended)

```tsx
function KanjiLegend({ 
  kanjiColors, 
  kanjiHighlightMap, 
  nodes 
}: {
  kanjiColors: Map<string, string>;
  kanjiHighlightMap: Map<string, Set<string>>;
  nodes: KnowledgeGraphNode[];
}) {
  if (kanjiColors.size === 0) return null;
  
  return (
    <Card 
      title="Shared Kanji" 
      size="small" 
      style={{ marginTop: 16 }}
      extra={<Button type="text" icon={<QuestionCircleOutlined />} />}
    >
      <Flex vertical gap="small">
        {Array.from(kanjiColors.entries()).map(([kanji, color]) => {
          const nodeCount = kanjiHighlightMap.get(kanji)?.size ?? 0;
          return (
            <Flex key={kanji} align="center" gap="small">
              <div 
                style={{ 
                  width: 16, 
                  height: 16, 
                  background: color, 
                  borderRadius: 4,
                  border: `1px solid ${color}80`
                }} 
              />
              <Text strong style={{ fontSize: 16 }}>{kanji}</Text>
              <Text type="secondary">
                {nodeCount} {nodeCount === 1 ? 'word' : 'words'}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Card>
  );
}
```

### Enhanced Hovered Node Display

```tsx
// In nodeCanvasObject for cards layout
if (isHovered && activeNode) {
  // Show active kanji badges
  const activeKanji = activeNode.sharedKanji.filter(k => 
    kanjiHighlightMap.has(k)
  );
  
  activeKanji.forEach((kanji, index) => {
    const color = kanjiColors.get(kanji);
    // Draw colored badge above card
    // ... badge rendering code
  });
}
```
