### Mobile Version Wireframe (Origami Fold Theme)

As a senior product UX designer, I've expanded on the Origami Fold Theme to make it deeply immersive and fitting for your Japanese language learning app. This theme transforms the graph into a "Paper Crafting Studio," where users feel like they're folding their own origami masterpiece, symbolizing the intricate folding of kanji into words. Nodes begin as simple washi paper squares (textured backgrounds for authenticity), and interactions "fold" them into symbolic shapes: e.g., words become elegant cranes (representing flight of knowledge), kanji become sturdy boats or frogs (simpler folds for foundational elements), and branches chain like linked paper lanterns. The canvas has a subtle paper texture overlay with pastel gradients (soft blues, pinks, yellows) that shift lightly on interactions, evoking vibrant origami papers without visual overload.

Key innovations for enjoyment and ease of development:

- **Tactile Interactions**: Use CSS/GSAP for smooth fold animations (e.g., 3D transforms on tap) – reusable components in React for nodes. Add optional crinkle sounds via Web Audio API (short, non-intrusive clips).
- **Gamification Integration**: A "Fold Mastery" badge system: Users earn badges (e.g., "Crane Crafter") by completing folds (expansions); displayed in a floating paper scroll. Track via local state or simple Redux.
- **Progressive Revelation**: JLPT filtering "unlocks" folds at user level – lower levels show partial folds, teasing advanced ones with shadowy outlines.
- **Sensory Delight**: Haptic feedback on folds; subtle particle effects (paper scraps) on expansions for fun, but toggleable for performance.
- **Development Ease**: Leverage React Flow for graph structure; customize nodes with SVG paths for folds (pre-defined shapes like crane via libraries like Paper.js or pure CSS). Limit animations to keyframe-based for mobile optimization; cap branches at 6 with chained unfolding to prevent complexity.

#### User Behaviors and Implementation Criteria (Bullet Points)

- **On Load (Initial State)**: Component loads with flat square nodes for the hub word (e.g., "先生") and its kanji components ("先", "生"). User sees a subtle fold hint (edge crease pulsing). Behavior: Auto-apply JLPT filter via props; if idle 5s, play a gentle crinkle sound and animate a demo fold to guide.
- **Tap Node to Fold/Expand**: Tap folds the node from 2D square to 3D shape (e.g., kanji "先" folds into a boat); graph re-centers, unfolding up to 6 chained branches as connected paper strips. Behavior: Use React state for fold status; animate with 500ms transition; filter branches by user level, showing "Locked Fold" placeholders for advanced ones.
- **Tap Node for Details**: Opens bottom sheet as an unfolding paper fan (animated reveal). Behavior: Contents slide in with fold effect; auto-play audio pronunciation with a "whisper" sound; "Add to Flashcards" button triggers a paper crane flying animation for confirmation.
- **Long-Press Node**: Pops a context menu as folded paper options (e.g., "Refold" to collapse, "Badge Check"). Behavior: Haptic buzz; integrate with gamification – long-press on completed chains awards badges.
- **Pinch/Zoom/Pan Gesture**: Zoom reveals finer paper textures; pan shifts the "workbench" canvas. Behavior: Clamp interactions; double-tap re-centers with a snap-fold sound; ensure touch events don't conflict with folds.
- **Edge Tap/Hover**: Tap crease line shows popup label (e.g., "SEI - On'yomi") with color-coded glow (blue solid for On'yomi, pink dashed for Kun'yomi). Behavior: Add tactile feedback; edges unfold slightly on interaction for emphasis.
- **Gamification Interactions**: Floating paper scroll at bottom-right shows badges earned (e.g., icon unlocks after 5 folds). Behavior: Update via event listeners on expansions; persist badges session-wide; tap scroll to view full "Origami Gallery" modal with achievements.
- **Error/Empty States**: If no branches, show a "Blank Paper" with motivational text like "Fold your own path – search another word!" and a simple fold tutorial. Behavior: Fallback to list view with paper-styled cards.
- **Accessibility Criteria**: Screen reader describes fold states (e.g., "Unfolded Crane: 先生"); high-contrast mode swaps pastels for bolder colors; gesture alternatives via buttons.
- **Performance Criteria**: Use React.memo for nodes; lazy-load 3D shapes; throttle animations; test on iOS/Android for smooth 60fps folds.

Text-based Sketch (Portrait Mobile View - Initial State):

```
[Canvas - Full Screen, Paper Texture BG]
          (Flat Square - Pastel Blue)
            先生
           /     \
 (Crease Edge: Blue Solid "SEI")  (Crease Edge: Blue Solid "SEI")
         /         \
(Flat Square - Pastel Pink)     (Flat Square - Pastel Yellow)
   先               生
   (Pulse Crease Hint)

[Bottom Floating Elements]
(Fold Mastery Scroll: 0 Badges) | (Sound Toggle)

[Bottom Sheet - Hidden Until Tap]
```

Text-based Sketch (Expanded View - After Tapping "先"):

```
[Canvas]
                (Folded 3D Boat Shape - Re-centered)
                   先
                  / | \
(Crease Edges: Pink Dashed "SEN" w/ Unfold Anim)
                /   |   \
(Chained Strip - Crane) (Chained Strip - Crane) (Chained Strip - Crane)
 先月          先輩          行き先
   (Unfold Chain)   ... (up to 3 more)

[Bottom Sheet - Unfolding Fan on Tap]
-----------------------------
| X Close |
| Node: 先 (Kanji - Boat Fold) |
| Meaning: Ahead, future |
| On'yomi: SEN (▶️ w/ Crinkle) |
| Kun'yomi: SAKI |
| Stroke Order: [SVG Fold-Trace] |
| Add to Flashcards (Crane Fly Anim) |
-----------------------------
[Fold Mastery Scroll: Crane Crafter Badge Unlocked]
```

For landscape, the bottom sheet becomes a side panel that "unfolds" horizontally, maximizing canvas space.

### Desktop Version Wireframe (Origami Fold Theme)

On desktop, the theme evolves into a "Master Origami Workshop" with a larger workbench canvas, allowing more intricate folds and chains. The split layout features the graph on left (with paper mat background) and sidebar as a pinned "Instruction Scroll" on right. Nodes can be dragged to "pin" folds in custom positions, enhancing creativity. Pastel colors remain, but with deeper shading for 3D depth (using CSS box-shadows or Three.js for advanced renders if budget allows). Animations are more elaborate: Full unfolding sequences with multi-step folds, and crinkle sounds on hover.

Key innovations:

- **Creative Freedom**: Users can "custom fold" by dragging nodes into new shapes, saving layouts as personal origami patterns.
- **Enhanced Gamification**: Sidebar includes a "Badge Cabinet" with 3D rotatable models; shareable via export (e.g., PNG of folded graph).
- **Immersive Details**: Sidebar unfolds like an accordion book, with interactive stroke order where users mouse-trace folds.
- **Development Ease**: React Flow handles dragging/folding; use Framer Motion for animations (easy keyframe setup); pre-load sound assets; ensure cross-browser compatibility with fallback 2D CSS for older systems.

#### User Behaviors and Implementation Criteria (Bullet Points)

- **On Load (Initial State)**: Loads flat squares; auto-layout chains. Behavior: Hover previews fold animation; JLPT filter grays out advanced creases.
- **Click Node to Fold/Expand**: Clicks initiates multi-step fold (e.g., square to intermediate to final crane); re-centers with chained branches unfolding sequentially. Behavior: 800ms animation chain; cap at 6 but allow deeper nesting via scroll-zoom.
- **Click Node for Details**: Instantly updates sidebar with unfolding sections. Behavior: Interactive elements like draggable stroke order; "Add to Flashcards" folds a virtual card into a deck icon.
- **Hover Node/Edge**: Node previews 3D rotation; edge shows detailed label tooltip with reading type. Behavior: Add subtle crinkle on hover; color-code creases persistently.
- **Drag Node**: Repositions with crease lines snapping to connections. Behavior: On drop, re-simulate layout; enable "Pin Mode" toggle to lock custom arrangements.
- **Right-Click Node**: Context menu as pop-up paper menu (e.g., "Refold All", "Award Badge"). Behavior: Integrate gamification – complete chains auto-award; export folded graph as image.
- **Keyboard Shortcuts**: F=Fold selected, B=Badge view, Z=Zoom. Behavior: On-screen hints on first load; accessible via ARIA.
- **Gamification Interactions**: Sidebar badge section updates live; click badges to view "Origami Story" (narrative of user's progress). Behavior: Tie to expansions; persistent via localStorage.
- **Error/Empty States**: "Torn Paper" visual with repair animation; suggest alternatives. Behavior: Fallback to accordion list of nodes.
- **Accessibility Criteria**: Keyboard-fold via Enter; describe animations in text (e.g., "Folding to Crane"); color-blind safe pastels.
- **Performance Criteria**: Optimize with Web Workers for complex folds; virtualize off-screen nodes; support high-res for large monitors.

Text-based Sketch (Desktop View - Initial State):

```
[Left: Canvas 70% Width - Washi Paper BG]   [Right: Sidebar 30% - Instruction Scroll]
          (Flat Square - Pastel Blue)       | Fold Instructions: Click to Begin |
            先生                           |                                   |
           /     \                         | Fold Mastery: 0 Badges            |
 (Crease Blue Solid "SEI") (Crease "SEI")  |                                   |
         /         \                       | (Badge Cabinet: Empty)            |
(Flat Square Pink) (Flat Square Yellow)    |                                   |
   先               生                    |                                   |
                                           | (Sound Toggle)                    |
[Bottom: Controls]                         |                                   |
Zoom +/- | Reset Folds | Export Pattern    |                                   |
```

Text-based Sketch (Expanded View):

```
[Left: Canvas]                              [Right: Sidebar - Unfolded Sections]
                (3D Boat Fold)              | Node: 先 (Kanji - Boat)           |
                   先                      | Meaning: Ahead, future            |
                  / | \                     | On'yomi: SEN (▶️ w/ Crinkle)      |
(Crease Pink Dashed "SEN" w/ Chain Unfold)  | Kun'yomi: SAKI                    |
                /   |   \                   | Stroke Order: [Mouse-Trace SVG]   |
(3D Crane Chain) (3D Crane) (3D Crane)      | Sample: 先に (Ahead)              |
 先月          先輩          行き先         | Add to Flashcards (Fold Anim)     |
   (Custom Drag Positions)                  | Fold Mastery: Crane Crafter       |
                                           | Badge Cabinet: [Rotatable Icons]  |
```

#### My Additional Improvements Based on Expertise

- **User Flow Optimization**: Start with a "Welcome Fold" tutorial modal on first use, guiding through a sample expansion to reduce learning curve.
- **Monetization/Retention**: Unlock premium paper patterns (e.g., patterned washi) for advanced users; integrate with app's progress tracking for "Daily Fold Challenges."
- **Testing Recommendations**: Prototype folds in Figma with interactions; user test for animation delight vs. distraction; measure engagement via fold completion rates.
- **Scalability**: Modular node components for easy theme swaps; add dark mode variant with metallic paper effects.
- **Cultural Sensitivity**: Ensure shapes respect origami traditions (e.g., avoid sacred symbols); consult Japanese users for authenticity.
- **Edge Cases**: Handle long words with wrapping in squares; multi-touch for simultaneous folds on tablets.
